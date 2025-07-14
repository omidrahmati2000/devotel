import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobOfferRepository } from './repositories/job-offer.repository';
import { JobOffer } from '../database/entities/job-offer.entity';
import { UnifiedJob } from './interfaces/unified-job.interface';
import { LoggerService } from '../utils/logger.service';
import { JobOfferQueryDto } from './dto/job-offer-query.dto';
import { JobOfferResponseDto } from './dto/job-offer-response.dto';

@Injectable()
export class JobOffersService {
  constructor(
    @InjectRepository(JobOfferRepository)
    private readonly jobOfferRepository: JobOfferRepository,
    private readonly logger: LoggerService,
  ) {}

  async findAll(filters: JobOfferQueryDto): Promise<[JobOfferResponseDto[], number]> {
    const [entities, total] = await this.jobOfferRepository.findWithFilters(filters);
    const dtos = entities.map((entity) => this.toResponseDto(entity));
    return [dtos, total];
  }

  async findOne(id: string): Promise<JobOfferResponseDto> {
    const jobOffer = await this.jobOfferRepository.findOne({ where: { id } });

    if (!jobOffer) {
      throw new NotFoundException(`Job offer with ID ${id} not found`);
    }

    return this.toResponseDto(jobOffer);
  }

  private toResponseDto(jobOffer: JobOffer): JobOfferResponseDto {
    return {
      id: jobOffer.id,
      externalId: jobOffer.externalId,
      provider: jobOffer.provider,
      title: jobOffer.title,
      description: jobOffer.description,
      company: jobOffer.company,
      location: jobOffer.location,
      skills: jobOffer.skills || [],
      experienceLevel: jobOffer.experienceLevel,
      employmentType: jobOffer.employmentType,
      minSalary: jobOffer.minSalary,
      maxSalary: jobOffer.maxSalary,
      currency: jobOffer.currency,
      benefits: jobOffer.benefits || [],
      applicationUrl: jobOffer.applicationUrl,
      active: jobOffer.active,
      createdAt: jobOffer.createdAt,
      updatedAt: jobOffer.updatedAt,
      lastSyncedAt: jobOffer.lastSyncedAt,
    };
  }

  async saveJobs(jobs: UnifiedJob[]): Promise<{
    saved: number;
    updated: number;
    errors: number;
  }> {
    const validJobs: Array<Partial<JobOffer>> = [];
    let errors = 0;

    for (const job of jobs) {
      try {
        validJobs.push({
          ...job,
          lastSyncedAt: new Date(),
        });
      } catch (error) {
        this.logger.error(`Error preparing job ${job.externalId} from ${job.provider}:`, error);
        errors++;
      }
    }

    try {
      const result = await this.jobOfferRepository.bulkUpsert(validJobs);

      this.logger.log(
        `Job sync completed: ${result.saved} saved, ${result.updated} updated, ${errors} errors`,
      );

      return {
        saved: result.saved,
        updated: result.updated,
        errors,
      };
    } catch (error) {
      this.logger.error('Error during bulk upsert:', error);
      return {
        saved: 0,
        updated: 0,
        errors: jobs.length,
      };
    }
  }

  async getLastSyncInfo(): Promise<{
    lastSync: Date | null;
    totalJobs: number;
    activeJobs: number;
    providers: Array<{
      provider: string;
      count: number;
      lastSync: Date;
    }>;
  }> {
    const [syncInfo, providerStats] = await Promise.all([
      this.jobOfferRepository.getLastSyncInfo(),
      this.jobOfferRepository.getProviderStats(),
    ]);

    return {
      ...syncInfo,
      providers: providerStats,
    };
  }

  async deactivateStaleJobs(provider: string, syncDate: Date): Promise<number> {
    return this.jobOfferRepository.deactivateStaleJobs(provider, syncDate);
  }
}
