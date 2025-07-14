// tests/job-offers.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobOffer } from '../src/database/entities/job-offer.entity';
import { Repository } from 'typeorm';

describe('JobOffersController (e2e)', () => {
  let app: INestApplication;
  let jobOfferRepository: Repository<JobOffer>;

  const mockJobOffers: Partial<JobOffer>[] = [
    {
      id: '961aff10-6619-42ab-8bf1-4ea4ccb28c57',
      externalId: 'ext-1',
      provider: 'provider1',
      title: 'Senior Developer',
      company: 'Tech Corp',
      description: 'Great opportunity',
      location: 'San Francisco, CA',
      employmentType: 'Full Time',
      experienceLevel: 'Senior',
      minSalary: 120000,
      maxSalary: 180000,
      currency: 'USD',
      applicationUrl: 'https://example.com/job/1',
      skills: ['JavaScript', 'React', 'Node.js'],
      active: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 'ad9523d4-2215-48c6-9ea9-cf2be3a669b0',
      externalId: 'ext-2',
      provider: 'provider2',
      title: 'Backend Engineer',
      company: 'Startup XYZ',
      description: 'Join our team',
      location: 'New York, NY',
      employmentType: 'Full Time',
      experienceLevel: 'Mid',
      minSalary: 90000,
      maxSalary: 130000,
      currency: 'USD',
      applicationUrl: 'https://example.com/job/2',
      skills: ['Python', 'Django', 'PostgreSQL'],
      active: true,
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(JobOffer))
      .useValue({
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([mockJobOffers, 2]),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({
            lastSync: new Date('2024-01-15'),
            totalJobs: '2',
          }),
        })),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    jobOfferRepository = moduleFixture.get(getRepositoryToken(JobOffer));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /job-offers', () => {
    it('should return paginated job offers', () => {
      return request(app.getHttpServer())
        .get('/job-offers?pageSize=2')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode');
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('count');
          expect(res.body).toHaveProperty('currentPage');
          expect(res.body).toHaveProperty('nextPage');
          expect(res.body).toHaveProperty('prevPage');
          expect(res.body.data).toHaveLength(2);
        });
    });

    it('should accept query parameters', () => {
      return request(app.getHttpServer())
        .get('/job-offers')
        .query({
          page: 2,
          pageSize: 10,
          title: 'Developer',
          location: 'San Francisco',
          minSalary: 100000,
        })
        .expect(200);
    });

    it('should validate pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/job-offers')
        .query({
          page: 0, // Invalid - should be >= 1
          pageSize: 150, // Invalid - should be <= 100
        })
        .expect(400);
    });

    it('should filter by skills array', () => {
      return request(app.getHttpServer())
        .get('/job-offers')
        .query({
          skills: ['JavaScript', 'React'],
        })
        .expect(200);
    });
  });

  describe('GET /job-offers/:id', () => {
    it('should return 404 for non-existent job', async () => {
      jobOfferRepository.findOne = jest.fn().mockResolvedValue(null);

      return request(app.getHttpServer())
        .get('/job-offers/e1afaf04-bbb3-464f-80a2-a115e3122271')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('not found');
        });
    });
  });

  describe('GET /job-offers/sync/status', () => {
    it('should return sync status', () => {
      return request(app.getHttpServer())
        .get('/job-offers/sync/status')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('lastSync');
          expect(res.body).toHaveProperty('totalJobs');
        });
    });
  });
});
