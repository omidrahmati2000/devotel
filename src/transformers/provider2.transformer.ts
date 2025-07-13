import { Injectable } from '@nestjs/common';
import { Provider2Response, Provider2Job } from '../job-offers/interfaces/provider2.interface';
import { UnifiedJob } from '../job-offers/interfaces/unified-job.interface';
import { BaseJobTransformer } from './base-job.transformer';
import { ITransformer } from './interfaces/transformer.interface';

@Injectable()
export class Provider2Transformer
  extends BaseJobTransformer
  implements ITransformer<Provider2Response, UnifiedJob>
{
  transform(response: Provider2Response): UnifiedJob[] {
    // Handle the actual API structure with nested data
    if (response?.status !== 'success' || !response?.data?.jobsList) {
      return [];
    }

    const jobs: UnifiedJob[] = [];

    // Transform object entries to array
    for (const [jobId, job] of Object.entries(response.data.jobsList)) {
      jobs.push(this.transformJob(jobId, job));
    }

    return jobs;
  }

  private transformJob(jobId: string, job: Provider2Job): UnifiedJob {
    return {
      externalId: jobId,
      provider: 'provider2',
      title: job.position,
      company: job.employer?.companyName || 'Unknown Company',
      description: this.generateDescription(job),
      location: this.formatLocation(job.location),
      employmentType: this.determineEmploymentType(job.location),
      experienceLevel: this.normalizeExperienceLevel(job.requirements?.experience || 0),
      minSalary: job.compensation?.min || null,
      maxSalary: job.compensation?.max || null,
      currency: job.compensation?.currency || 'USD',
      postedDate: this.parseDate(job.datePosted),
      applicationDeadline: null,
      applicationUrl: job.employer?.website || '',
      skills: job.requirements?.technologies || [],
      benefits: [],
      active: true,
      rawData: job,
    };
  }

  private formatLocation(location: any): string {
    if (!location) return 'Unknown Location';

    const parts = [location.city, location.state].filter(Boolean);

    const locationStr = parts.join(', ');
    return location.remote ? `${locationStr} (Remote)` : locationStr;
  }

  private determineEmploymentType(location: any): string {
    if (location?.remote) return 'Remote';
    return 'On-site';
  }

  private generateDescription(job: Provider2Job): string {
    const parts = [
      `${job.position} at ${job.employer?.companyName}`,
      job.requirements?.experience &&
        `requiring ${job.requirements.experience} years of experience`,
    ].filter(Boolean);

    return `${parts.join(', ')}.`;
  }
}
