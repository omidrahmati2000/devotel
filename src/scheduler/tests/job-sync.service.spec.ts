import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { JobSyncService } from '../job-sync.service';
import { JobOffersService } from '../../job-offers/job-offers.service';
import { TransformerService } from '../../transformers/transformer.service';
import { HttpRetryService } from '../../utils/http-retry.service';
import { LoggerService } from '../../utils/logger.service';
import { UnifiedJob } from '../../job-offers/interfaces/unified-job.interface';

describe('JobSyncService', () => {
  let service: JobSyncService;
  let configService: jest.Mocked<ConfigService>;
  let httpService: jest.Mocked<HttpService>;
  let jobOffersService: jest.Mocked<JobOffersService>;
  let transformerService: jest.Mocked<TransformerService>;
  let httpRetryService: jest.Mocked<HttpRetryService>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobSyncService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: JobOffersService,
          useValue: {
            saveJobs: jest.fn(),
          },
        },
        {
          provide: TransformerService,
          useValue: {
            transform: jest.fn(),
          },
        },
        {
          provide: HttpRetryService,
          useValue: {
            requestWithRetry: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobSyncService>(JobSyncService);
    configService = module.get(ConfigService);
    httpService = module.get(HttpService);
    jobOffersService = module.get(JobOffersService);
    transformerService = module.get(TransformerService);
    httpRetryService = module.get(HttpRetryService);
    loggerService = module.get(LoggerService);

    // Setup default config values
    configService.get.mockImplementation((key: string) => {
      const configs: Record<string, any> = {
        'api.provider1Url': 'https://provider1.com/api',
        'api.provider2Url': 'https://provider2.com/api',
        'scheduler.syncOnStartup': false,
        'api.timeout': 30000,
        'api.maxRetries': 3,
      };
      return configs[key];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncAllProviders', () => {
    it('should sync all providers successfully', async () => {
      const mockJobsProvider1 = [{ jobId: '1', title: 'Job 1' }];
      const mockJobsProvider2 = [{ jobId: 2, position: 'Job 2' }];

      // Complete UnifiedJob mock data
      const mockTransformedJobs: UnifiedJob[] = [
        {
          externalId: '1',
          provider: 'provider1',
          title: 'Transformed Job',
          company: 'Test Company',
          description: 'Test description',
          location: 'Test Location',
          employmentType: 'Full Time',
          experienceLevel: 'Mid Level',
          minSalary: 50000,
          maxSalary: 80000,
          currency: 'USD',
          postedDate: new Date(),
          applicationDeadline: null,
          applicationUrl: 'https://example.com',
          skills: ['JavaScript'],
          benefits: [],
          active: true,
        },
      ];

      // Mock HTTP calls to return axios responses
      httpService.get.mockImplementation((url: string) => {
        if (url.includes('provider1')) {
          return of({
            data: mockJobsProvider1,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {},
          } as any);
        } else {
          return of({
            data: mockJobsProvider2,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {},
          } as any);
        }
      });

      httpRetryService.requestWithRetry
        .mockResolvedValueOnce({ data: mockJobsProvider1 })
        .mockResolvedValueOnce({ data: mockJobsProvider2 });

      transformerService.transform.mockReturnValue(mockTransformedJobs);

      jobOffersService.saveJobs.mockResolvedValue({
        saved: 1,
        updated: 0,
        errors: 0,
      });

      await service.syncAllProviders();

      expect(httpRetryService.requestWithRetry).toHaveBeenCalledTimes(2);
      expect(transformerService.transform).toHaveBeenCalledTimes(2);
      expect(transformerService.transform).toHaveBeenCalledWith('provider1', mockJobsProvider1);
      expect(transformerService.transform).toHaveBeenCalledWith('provider2', mockJobsProvider2);
      expect(jobOffersService.saveJobs).toHaveBeenCalledTimes(2);
    });

    it('should handle provider sync failures gracefully', async () => {
      httpRetryService.requestWithRetry
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: [] });

      transformerService.transform.mockReturnValue([]);
      jobOffersService.saveJobs.mockResolvedValue({
        saved: 0,
        updated: 0,
        errors: 0,
      });

      await service.syncAllProviders();

      expect(loggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to sync provider1:'),
        expect.any(Error),
      );
      expect(httpRetryService.requestWithRetry).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleCron', () => {
    it('should trigger sync on cron', async () => {
      const syncAllProvidersSpy = jest
        .spyOn(service, 'syncAllProviders')
        .mockResolvedValue(undefined);

      await service.handleCron();

      expect(loggerService.log).toHaveBeenCalledWith('Starting scheduled job sync');
      expect(syncAllProvidersSpy).toHaveBeenCalled();
    });
  });
});
