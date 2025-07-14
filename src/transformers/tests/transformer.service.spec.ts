import { Test, TestingModule } from '@nestjs/testing';
import { ProviderType, TransformerService } from '../transformer.service';
import { Provider1Transformer } from '../provider1.transformer';
import { Provider2Transformer } from '../provider2.transformer';
import { Provider1Response } from '../../job-offers/interfaces/provider1.interface';
import { Provider2Response } from '../../job-offers/interfaces/provider2.interface';

describe('TransformerService', () => {
  let service: TransformerService;
  let provider1Transformer: Provider1Transformer;
  let provider2Transformer: Provider2Transformer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformerService, Provider1Transformer, Provider2Transformer],
    }).compile();

    service = module.get<TransformerService>(TransformerService);
    provider1Transformer = module.get<Provider1Transformer>(Provider1Transformer);
    provider2Transformer = module.get<Provider2Transformer>(Provider2Transformer);
  });

  describe('transform', () => {
    it('should transform provider1 data correctly', () => {
      const mockProvider1Response: Provider1Response = {
        metadata: {
          requestId: 'req-123',
          timestamp: '2025-07-14T07:12:06.375Z',
        },
        jobs: [
          {
            jobId: 'P1-420',
            title: 'Frontend Developer',
            details: {
              location: 'San Francisco, CA',
              type: 'Part Time',
              salaryRange: '$63k - $143k',
            },
            company: {
              name: 'DataWorks',
              industry: 'Design',
            },
            skills: ['JavaScript', 'Node.js', 'React'],
            postedDate: '2025-07-13T23:14:38.509Z',
          },
        ],
      };

      const result = service.transform(ProviderType.PROVIDER1, mockProvider1Response);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        externalId: 'P1-420',
        provider: ProviderType.PROVIDER1,
        title: 'Frontend Developer',
        company: 'DataWorks',
        location: 'San Francisco, CA',
        employmentType: 'Part Time',
        minSalary: 63000,
        maxSalary: 143000,
        currency: 'USD',
        skills: ['JavaScript', 'Node.js', 'React'],
      });
    });

    it('should transform provider2 data correctly', () => {
      const mockProvider2Response: Provider2Response = {
        status: 'success',
        data: {
          jobsList: {
            'job-77': {
              position: 'Data Scientist',
              location: {
                city: 'New York',
                state: 'NY',
                remote: false,
              },
              compensation: {
                min: 64000,
                max: 109000,
                currency: 'USD',
              },
              employer: {
                companyName: 'DataWorks',
                website: 'https://backendsolutions.com',
              },
              requirements: {
                experience: 2,
                technologies: ['Java', 'Spring Boot', 'AWS'],
              },
              datePosted: '2025-07-08',
            },
          },
        },
      };

      const result = service.transform(ProviderType.PROVIDER2, mockProvider2Response);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        externalId: 'job-77',
        provider: ProviderType.PROVIDER2,
        title: 'Data Scientist',
        company: 'DataWorks',
        location: 'New York, NY',
        employmentType: 'On-site',
        minSalary: 64000,
        maxSalary: 109000,
        currency: 'USD',
        skills: ['Java', 'Spring Boot', 'AWS'],
      });
    });

    it('should throw error for unknown provider', () => {
      expect(() => service.transform('unknown' as ProviderType, {})).toThrow(
        'No transformer found for provider: unknown',
      );
    });
  });
});
