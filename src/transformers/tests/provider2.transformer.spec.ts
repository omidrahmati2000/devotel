import { Provider2Transformer } from '../provider2.transformer';
import { Provider2Response } from '../../job-offers/interfaces/provider2.interface';

describe('Provider2Transformer', () => {
  let transformer: Provider2Transformer;

  beforeEach(() => {
    transformer = new Provider2Transformer();
  });

  describe('transform', () => {
    it('should transform valid job data', () => {
      const mockResponse: Provider2Response = {
        status: 'success',
        data: {
          jobsList: {
            'job-001': {
              position: 'Backend Engineer',
              location: {
                city: 'San Francisco',
                state: 'CA',
                remote: false,
              },
              compensation: {
                min: 120000,
                max: 180000,
                currency: 'USD',
              },
              employer: {
                companyName: 'Tech Corp',
                website: 'https://techcorp.com',
              },
              requirements: {
                experience: 5,
                technologies: ['Java', 'Spring Boot', 'Kubernetes'],
              },
              datePosted: '2025-07-10',
            },
          },
        },
      };

      const result = transformer.transform(mockResponse);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        externalId: 'job-001',
        provider: 'provider2',
        title: 'Backend Engineer',
        company: 'Tech Corp',
        description: 'Backend Engineer at Tech Corp, requiring 5 years of experience.',
        location: 'San Francisco, CA',
        employmentType: 'On-site',
        experienceLevel: 'Senior',
        minSalary: 120000,
        maxSalary: 180000,
        currency: 'USD',
        postedDate: new Date('2025-07-10'),
        applicationDeadline: null,
        applicationUrl: 'https://techcorp.com',
        skills: ['Java', 'Spring Boot', 'Kubernetes'],
        benefits: [],
        active: true,
        rawData: {
          position: 'Backend Engineer',
          location: {
            city: 'San Francisco',
            state: 'CA',
            remote: false,
          },
          compensation: {
            min: 120000,
            max: 180000,
            currency: 'USD',
          },
          employer: {
            companyName: 'Tech Corp',
            website: 'https://techcorp.com',
          },
          requirements: {
            experience: 5,
            technologies: ['Java', 'Spring Boot', 'Kubernetes'],
          },
          datePosted: '2025-07-10',
        },
      });
    });

    it('should handle remote positions', () => {
      const mockResponse: Provider2Response = {
        status: 'success',
        data: {
          jobsList: {
            'job-remote': {
              position: 'Remote Developer',
              location: {
                city: 'San Francisco',
                state: 'WA',
                remote: true,
              },
              compensation: {
                min: 80000,
                max: 120000,
                currency: 'USD',
              },
              employer: {
                companyName: 'Remote Corp',
                website: '',
              },
              requirements: {
                experience: 3,
                technologies: [],
              },
              datePosted: '2025-07-14',
            },
          },
        },
      };

      const result = transformer.transform(mockResponse);

      expect(result[0].location).toBe('San Francisco, WA (Remote)');
      expect(result[0].employmentType).toBe('Remote');
    });

    it('should map experience levels correctly', () => {
      const experienceMappings = [
        { years: 1, expected: 'Entry Level' },
        { years: 2, expected: 'Junior' },
        { years: 3, expected: 'Mid Level' },
        { years: 4, expected: 'Mid Level' },
        { years: 5, expected: 'Senior' },
      ];

      experienceMappings.forEach(({ years, expected }) => {
        const mockResponse: Provider2Response = {
          status: 'success',
          data: {
            jobsList: {
              [`job-${years}`]: {
                position: 'Test Position',
                location: { city: 'Test', state: 'TS', remote: false },
                compensation: { min: 50000, max: 60000, currency: 'USD' },
                employer: { companyName: 'Test', website: '' },
                requirements: { experience: years, technologies: [] },
                datePosted: '2025-07-14',
              },
            },
          },
        };

        const result = transformer.transform(mockResponse);
        expect(result[0].experienceLevel).toBe(expected);
      });
    });

    it('should handle empty jobsList', () => {
      const mockResponse: Provider2Response = {
        status: 'success',
        data: {
          jobsList: {},
        },
      };

      const result = transformer.transform(mockResponse);
      expect(result).toEqual([]);
    });
  });
});
