import { Provider1Transformer } from '../provider1.transformer';
import { Provider1Response } from '../../job-offers/interfaces/provider1.interface';

describe('Provider1Transformer', () => {
  let transformer: Provider1Transformer;

  beforeEach(() => {
    transformer = new Provider1Transformer();
  });

  describe('transform', () => {
    it('should transform valid job data', () => {
      const mockResponse: Provider1Response = {
        metadata: {
          requestId: 'req-123',
          timestamp: '2025-07-14T07:12:06.375Z',
        },
        jobs: [
          {
            jobId: 'P1-001',
            title: 'Senior Frontend Developer',
            details: {
              location: 'Boston, MA',
              type: 'Full-Time',
              salaryRange: '$90k - $130k',
            },
            company: {
              name: 'Awesome Tech',
              industry: 'Technology',
            },
            skills: ['React', 'TypeScript', 'Node.js'],
            postedDate: '2025-07-10T10:00:00.000Z',
          },
        ],
      };

      const result = transformer.transform(mockResponse);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        externalId: 'P1-001',
        provider: 'provider1',
        title: 'Senior Frontend Developer',
        company: 'Awesome Tech',
        description:
          'Senior Frontend Developer position at Awesome Tech in the Technology industry located in Boston, MA (Full-Time).',
        location: 'Boston, MA',
        employmentType: 'Full Time',
        experienceLevel: 'Senior',
        minSalary: 90000,
        maxSalary: 130000,
        currency: 'USD',
        postedDate: new Date('2025-07-10T10:00:00.000Z'),
        applicationDeadline: null,
        applicationUrl: '',
        skills: ['React', 'TypeScript', 'Node.js'],
        benefits: [],
        active: true,
        rawData: {
          jobId: 'P1-001',
          title: 'Senior Frontend Developer',
          details: {
            location: 'Boston, MA',
            type: 'Full-Time',
            salaryRange: '$90k - $130k',
          },
          company: {
            name: 'Awesome Tech',
            industry: 'Technology',
          },
          skills: ['React', 'TypeScript', 'Node.js'],
          postedDate: '2025-07-10T10:00:00.000Z',
        },
      });
    });

    it('should handle missing salary range', () => {
      const mockResponse: Provider1Response = {
        metadata: {
          requestId: 'req-123',
          timestamp: '2025-07-14T07:12:06.375Z',
        },
        jobs: [
          {
            jobId: 'P1-002',
            title: 'Developer',
            details: {
              location: 'Remote',
              type: 'Contract',
              salaryRange: '',
            },
            company: {
              name: 'Company',
              industry: 'Tech',
            },
            skills: [],
            postedDate: '2025-07-14',
          },
        ],
      };

      const result = transformer.transform(mockResponse);

      expect(result[0].minSalary).toBeNull();
      expect(result[0].maxSalary).toBeNull();
      expect(result[0].currency).toBeNull();
    });

    it('should extract experience level from title', () => {
      const titles = [
        { title: 'Senior Developer', expected: 'Senior' },
        { title: 'Junior Engineer', expected: 'Junior' },
        { title: 'Lead Architect', expected: 'Lead' },
        { title: 'Software Developer', expected: 'Mid Level' },
        { title: 'Intern Developer', expected: 'Intern' },
      ];

      titles.forEach(({ title, expected }) => {
        const mockResponse: Provider1Response = {
          metadata: {
            requestId: 'req-123',
            timestamp: '2025-07-14T07:12:06.375Z',
          },
          jobs: [
            {
              jobId: 'test',
              title,
              details: {
                location: 'Test',
                type: 'Full-Time',
                salaryRange: '$50k - $60k',
              },
              company: {
                name: 'Test',
                industry: 'Test',
              },
              skills: [],
              postedDate: '2025-07-14',
            },
          ],
        };

        const result = transformer.transform(mockResponse);
        expect(result[0].experienceLevel).toBe(expected);
      });
    });
  });
});
