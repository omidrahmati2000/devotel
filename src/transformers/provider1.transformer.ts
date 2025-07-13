import { Injectable } from '@nestjs/common';
import { Provider1Response, Provider1Job } from '../job-offers/interfaces/provider1.interface';
import { UnifiedJob } from '../job-offers/interfaces/unified-job.interface';
import { BaseJobTransformer } from './base-job.transformer';
import { ITransformer } from './interfaces/transformer.interface';

@Injectable()
export class Provider1Transformer
  extends BaseJobTransformer
  implements ITransformer<Provider1Response, UnifiedJob>
{
  transform(response: Provider1Response): UnifiedJob[] {
    // Handle the actual API structure
    if (!response?.jobs || !Array.isArray(response.jobs)) {
      return [];
    }

    return response.jobs.map((job: Provider1Job) => this.transformJob(job));
  }

  private transformJob(job: Provider1Job): UnifiedJob {
    const salaryInfo = this.parseSalaryRange(job.details?.salaryRange || '');

    return {
      externalId: job.jobId,
      provider: 'provider1',
      title: job.title,
      company: job.company?.name || 'Unknown Company',
      description: this.generateDescription(job),
      location: job.details?.location || 'Unknown Location',
      employmentType: this.normalizeEmploymentType(job.details?.type || ''),
      experienceLevel: this.inferExperienceFromTitle(job.title),
      minSalary: salaryInfo.min,
      maxSalary: salaryInfo.max,
      currency: salaryInfo.currency,
      postedDate: this.parseDate(job.postedDate),
      applicationDeadline: null,
      applicationUrl: '',
      skills: job.skills || [],
      benefits: [],
      active: true,
      rawData: job,
    };
  }

  private generateDescription(job: Provider1Job): string {
    const parts = [
      `${job.title} position at ${job.company?.name}`,
      job.company?.industry && `in the ${job.company.industry} industry`,
      job.details?.location && `located in ${job.details.location}`,
      job.details?.type && `(${job.details.type})`,
    ].filter(Boolean);

    return `${parts.join(' ')}.`;
  }
}
