import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { JobOffersController } from '../job-offers.controller';
import { JobOffersService } from '../job-offers.service';

describe('JobOffersController', () => {
  let controller: JobOffersController;
  let service: JobOffersService;

  const mockJobOffersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getLastSyncInfo: jest.fn(),
  };

  const mockRequest = {
    query: {},
    params: {},
    body: {},
  } as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOffersController],
      providers: [
        {
          provide: JobOffersService,
          useValue: mockJobOffersService,
        },
      ],
    }).compile();

    controller = module.get<JobOffersController>(JobOffersController);
    service = module.get<JobOffersService>(JobOffersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated job offers', async () => {
      const mockData = [{ id: '1', title: 'Developer' }];
      const mockTotal = 1;

      mockJobOffersService.findAll.mockResolvedValue([mockData, mockTotal]);

      const mockRequest = {
        url: '/job-offers?page=1&pageSize=20',
      } as any;

      const result = await controller.findAll({ page: 1, pageSize: 20 }, mockRequest);

      expect(result).toEqual({
        statusCode: 'success',
        data: mockData,
        count: mockTotal,
        currentPage: '/job-offers?page=1&pageSize=20',
        nextPage: null,
        prevPage: null,
        lastPage: '/job-offers?page=1',
      });

      expect(mockJobOffersService.findAll).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
    });

    it('should handle empty results', async () => {
      mockJobOffersService.findAll.mockResolvedValue([[], 0]);

      const mockRequest = {
        url: '/job-offers?page=1&pageSize=10',
      } as any;

      const result = await controller.findAll({ page: 1, pageSize: 10 }, mockRequest);

      expect(result).toEqual({
        statusCode: 'success',
        data: [],
        count: 0,
        currentPage: '/job-offers?page=1&pageSize=10',
        nextPage: null,
        prevPage: null,
        lastPage: '/job-offers?page=0',
      });
    });

    it('should handle pagination with multiple pages', async () => {
      const mockData = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: String(i + 1),
          title: `Job ${i + 1}`,
        }));

      mockJobOffersService.findAll.mockResolvedValue([mockData.slice(0, 5), 10]);

      const mockRequest = {
        url: '/job-offers?page=1&pageSize=5',
      } as any;

      const result = await controller.findAll({ page: 1, pageSize: 5 }, mockRequest);

      expect(result).toEqual({
        statusCode: 'success',
        data: mockData.slice(0, 5),
        count: 10,
        currentPage: '/job-offers?page=1&pageSize=5',
        nextPage: '/job-offers?page=2',
        prevPage: null,
        lastPage: '/job-offers?page=2',
      });
    });
  });

  describe('findOne', () => {
    it('should return a single job offer', async () => {
      const mockJob = { id: '1', title: 'Developer' };
      mockJobOffersService.findOne.mockResolvedValue(mockJob);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockJob);
      expect(mockJobOffersService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('getSyncStatus', () => {
    it('should return sync status', async () => {
      const mockStatus = {
        lastSync: new Date(),
        totalJobs: 100,
      };

      mockJobOffersService.getLastSyncInfo.mockResolvedValue(mockStatus);

      const result = await controller.getSyncStatus();

      expect(result).toEqual(mockStatus);
    });
  });
});
