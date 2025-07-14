import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { JobOffersService } from '../job-offers.service';
import { JobOfferRepository } from '../repositories/job-offer.repository';
import { LoggerService } from '../../utils/logger.service';
import { createMockRepository } from '../../test/mocks/repository.mock';
import { UnifiedJob } from '../interfaces/unified-job.interface';

describe('JobOffersService', () => {
  let service: JobOffersService;
  let jobOfferRepository: ReturnType<typeof createMockRepository>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    jobOfferRepository = createMockRepository();

    loggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      setContext: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobOffersService,
        {
          provide: JobOfferRepository,
          useValue: jobOfferRepository,
        },
        {
          provide: LoggerService,
          useValue: loggerService,
        },
      ],
    }).compile();

    service = module.get<JobOffersService>(JobOffersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated job offers', async () => {
      const mockJobs = [
        {
          id: '1',
          title: 'Developer',
          company: 'Company A',
          location: 'Remote',
          description: 'Great job',
          createdAt: new Date(),
        },
        {
          id: '2',
          title: 'Designer',
          company: 'Company B',
          location: 'NYC',
          description: 'Creative role',
          createdAt: new Date(),
        },
      ];

      jobOfferRepository.findWithFilters.mockResolvedValue([mockJobs, 2]);

      const [result, total] = await service.findAll({ page: 1, pageSize: 10 });

      expect(result).toHaveLength(2);
      expect(total).toBe(2);
      expect(jobOfferRepository.findWithFilters).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
    });

    it('should handle empty results', async () => {
      jobOfferRepository.findWithFilters.mockResolvedValue([[], 0]);

      const [result, total] = await service.findAll({ page: 1, pageSize: 10 });

      expect(result).toHaveLength(0);
      expect(total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a job offer by id', async () => {
      const mockJob = {
        id: '1',
        title: 'Developer',
        company: 'Company A',
        location: 'Remote',
        description: 'Great job',
        createdAt: new Date(),
      };

      jobOfferRepository.findOne.mockResolvedValue(mockJob);

      const result = await service.findOne('1');

      expect(result).toBeDefined();
      expect(jobOfferRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when job not found', async () => {
      jobOfferRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999')).rejects.toThrow('Job offer with ID 999 not found');
    });
  });

  describe('saveJobs', () => {
    it('should save new jobs', async () => {
      const mockUnifiedJobs: UnifiedJob[] = [
        {
          externalId: '123',
          provider: 'provider1',
          title: 'Developer',
          company: 'Company A',
          location: 'Remote',
          description: 'Job description',
          employmentType: 'Full Time',
          experienceLevel: 'Mid Level',
          minSalary: 50000,
          maxSalary: 80000,
          currency: 'USD',
          skills: ['JavaScript', 'TypeScript'],
          postedDate: new Date(),
          applicationDeadline: null,
          applicationUrl: 'https://example.com',
          benefits: [],
          active: true,
        },
      ];

      jobOfferRepository.bulkUpsert.mockResolvedValue({ saved: 1, updated: 0 });

      const result = await service.saveJobs(mockUnifiedJobs);

      expect(result).toEqual({ saved: 1, updated: 0, errors: 0 });
      expect(jobOfferRepository.bulkUpsert).toHaveBeenCalledWith([
        {
          ...mockUnifiedJobs[0],
          lastSyncedAt: expect.any(Date),
        },
      ]);
    });

    it('should handle errors during save', async () => {
      const mockJob: UnifiedJob = {
        externalId: '123',
        provider: 'provider1',
        title: 'Developer',
        company: 'Company',
        description: 'Description',
        location: 'Location',
        employmentType: 'Full Time',
        experienceLevel: 'Mid Level',
        minSalary: null,
        maxSalary: null,
        currency: null,
        postedDate: null,
        applicationDeadline: null,
        applicationUrl: '',
        skills: [],
        benefits: [],
        active: true,
      };

      jobOfferRepository.bulkUpsert.mockRejectedValue(new Error('Database error'));

      const result = await service.saveJobs([mockJob]);

      expect(result).toEqual({ saved: 0, updated: 0, errors: 1 });
      expect(loggerService.error).toHaveBeenCalled();
    });
  });

  describe('getLastSyncInfo', () => {
    it('should return last sync information', async () => {
      const mockDate = new Date('2024-01-01');
      const syncInfo = {
        lastSync: mockDate,
        totalJobs: 100,
        activeJobs: 80,
      };
      const providerStats = [
        { provider: 'provider1', count: 50, lastSync: mockDate },
        { provider: 'provider2', count: 50, lastSync: mockDate },
      ];

      jobOfferRepository.getLastSyncInfo.mockResolvedValue(syncInfo);
      jobOfferRepository.getProviderStats.mockResolvedValue(providerStats);

      const result = await service.getLastSyncInfo();

      expect(result).toEqual({
        ...syncInfo,
        providers: providerStats,
      });
    });
  });

  describe('deactivateStaleJobs', () => {
    it('should deactivate stale jobs', async () => {
      const provider = 'provider1';
      const syncDate = new Date();

      jobOfferRepository.deactivateStaleJobs.mockResolvedValue(5);

      const result = await service.deactivateStaleJobs(provider, syncDate);

      expect(result).toBe(5);
      expect(jobOfferRepository.deactivateStaleJobs).toHaveBeenCalledWith(provider, syncDate);
    });
  });
});
