import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { JobOffersService } from '../job-offers/job-offers.service';
import { TransformerService, ProviderType } from '../transformers/transformer.service';
import { HttpRetryService } from '../utils/http-retry.service';
import { LoggerService } from '../utils/logger.service';

@Injectable()
export class JobSyncService implements OnModuleInit {
  private readonly providers: Map<ProviderType, string>;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly jobOffersService: JobOffersService,
    private readonly transformerService: TransformerService,
    private readonly httpRetryService: HttpRetryService,
    private readonly logger: LoggerService,
  ) {
    this.providers = new Map([
      [ProviderType.PROVIDER1, this.configService.get('api.provider1.url')],
      [ProviderType.PROVIDER2, this.configService.get('api.provider2.url')],
    ]);
  }

  async onModuleInit() {
    if (this.configService.get('scheduler.enabled')) {
      this.logger.log('Running initial job sync on startup');
      await this.syncAllProviders();
    }
  }

  @Cron(process.env.SYNC_SCHEDULE_CRON || '0 */6 * * *')
  async handleCron() {
    this.logger.log('Starting scheduled job sync');
    await this.syncAllProviders();
  }

  async syncAllProviders(): Promise<void> {
    const results = await Promise.allSettled(
      Array.from(this.providers.entries()).map(([provider, url]) =>
        this.syncProvider(provider, url),
      ),
    );

    results.forEach((result, index) => {
      const provider = Array.from(this.providers.keys())[index];
      if (result.status === 'rejected') {
        this.logger.error(`Failed to sync ${provider}:`, result.reason);
      }
    });
  }

  private async syncProvider(provider: ProviderType, url: string): Promise<void> {
    try {
      this.logger.log(`Starting sync for ${provider}`);

      // Fetch data with retry
      const response = await this.httpRetryService.requestWithRetry(
        () => this.httpService.get(url).toPromise(),
        3,
        1000,
      );

      if (!response?.data) {
        throw new Error(`No data received from ${provider}`);
      }

      // Transform data - now using ProviderType
      const transformedJobs = await this.transformerService.transform(provider, response.data);

      // Save to database using the correct method
      const result = await this.jobOffersService.saveJobs(transformedJobs);

      this.logger.log(
        `Sync completed for ${provider}: ${result.saved} new, ${result.updated} updated, ${result.errors} errors`,
      );
    } catch (error) {
      this.logger.error(`Error syncing ${provider}:`, error);
      throw error;
    }
  }
}
