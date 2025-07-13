import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { JobOffer } from '../database/entities/job-offer.entity';
import { JobOfferQueryDto } from './dto/job-offer-query.dto';
import { UnifiedJob } from './interfaces/unified-job.interface';
import { LoggerService } from '../utils/logger.service';

@Injectable()
export class JobOffersService {
    constructor(
        @InjectRepository(JobOffer)
        private readonly jobOfferRepository: Repository<JobOffer>,
        private readonly logger: LoggerService,
    ) {}

    async findAll(query: JobOfferQueryDto): Promise<{
        data: JobOffer[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }> {
        const { page = 1, pageSize = 20, title, location, minSalary, maxSalary, company, skills } = query;

        const queryBuilder = this.createQueryBuilder();
        this.applyFilters(queryBuilder, { title, location, minSalary, maxSalary, company, skills });

        const [data, total] = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy('job_offer.createdAt', 'DESC')
            .getManyAndCount();

        const totalPages = Math.ceil(total / pageSize);

        return {
            data,
            total,
            page,
            pageSize,
            totalPages,
        };
    }

    async findOne(id: string): Promise<JobOffer> {
        const jobOffer = await this.jobOfferRepository.findOne({ where: { id } });

        if (!jobOffer) {
            throw new NotFoundException(`Job offer with ID ${id} not found`);
        }

        return jobOffer;
    }

    async saveJobs(jobs: UnifiedJob[]): Promise<{ saved: number; updated: number; errors: number }> {
        let saved = 0;
        let updated = 0;
        let errors = 0;

        for (const job of jobs) {
            try {
                const existingJob = await this.jobOfferRepository.findOne({
                    where: {
                        externalId: job.externalId,
                        provider: job.provider,
                    },
                });

                if (existingJob) {
                    // Update existing job
                    await this.jobOfferRepository.update(existingJob.id, {
                        ...job,
                        lastSyncedAt: new Date(),
                    });
                    updated++;
                } else {
                    // Create new job
                    const newJob = this.jobOfferRepository.create({
                        ...job,
                        lastSyncedAt: new Date(),
                    });
                    await this.jobOfferRepository.save(newJob);
                    saved++;
                }
            } catch (error) {
                this.logger.error(`Error saving job ${job.externalId} from ${job.provider}:`, error);
                errors++;
            }
        }

        this.logger.log(`Job sync completed: ${saved} saved, ${updated} updated, ${errors} errors`);
        return { saved, updated, errors };
    }

    async getLastSyncInfo(): Promise<{ lastSync: Date | null; totalJobs: number }> {
        const result = await this.jobOfferRepository
            .createQueryBuilder('job_offer')
            .select('MAX(job_offer.lastSyncedAt)', 'lastSync')
            .addSelect('COUNT(*)', 'totalJobs')
            .getRawOne();

        return {
            lastSync: result.lastSync,
            totalJobs: parseInt(result.totalJobs, 10),
        };
    }

    private createQueryBuilder(): SelectQueryBuilder<JobOffer> {
        return this.jobOfferRepository.createQueryBuilder('job_offer');
    }

    private applyFilters(
        queryBuilder: SelectQueryBuilder<JobOffer>,
        filters: {
            title?: string;
            location?: string;
            minSalary?: number;
            maxSalary?: number;
            company?: string;
            skills?: string[];
        },
    ): void {
        if (filters.title) {
            queryBuilder.andWhere('LOWER(job_offer.title) LIKE LOWER(:title)', {
                title: `%${filters.title}%`,
            });
        }

        if (filters.location) {
            queryBuilder.andWhere('LOWER(job_offer.location) LIKE LOWER(:location)', {
                location: `%${filters.location}%`,
            });
        }

        if (filters.company) {
            queryBuilder.andWhere('LOWER(job_offer.company) LIKE LOWER(:company)', {
                company: `%${filters.company}%`,
            });
        }

        if (filters.minSalary !== undefined) {
            queryBuilder.andWhere('job_offer.maxSalary >= :minSalary', {
                minSalary: filters.minSalary,
            });
        }

        if (filters.maxSalary !== undefined) {
            queryBuilder.andWhere('job_offer.minSalary <= :maxSalary', {
                maxSalary: filters.maxSalary,
            });
        }

        if (filters.skills && filters.skills.length > 0) {
            queryBuilder.andWhere('job_offer.skills && :skills', {
                skills: filters.skills,
            });
        }

        // Only show active jobs by default
        queryBuilder.andWhere('job_offer.active = :active', { active: true });
    }
}
