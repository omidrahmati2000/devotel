import {DataSource, Repository, SelectQueryBuilder} from 'typeorm';
import { JobOffer } from '../../database/entities/job-offer.entity';
import { JobOfferQueryDto } from '../dto/job-offer-query.dto';
import {Injectable} from "@nestjs/common";

@Injectable()
export class JobOfferRepository extends Repository<JobOffer> {

    constructor(private dataSource: DataSource) {
        super(JobOffer, dataSource.createEntityManager());
    }

    async findWithFilters(filters: JobOfferQueryDto): Promise<[JobOffer[], number]> {
        const { page = 1, pageSize = 20, ...filterParams } = filters;

        const queryBuilder = this.createQueryBuilder('job_offer');
        this.applyFilters(queryBuilder, filterParams);

        const [data, total] = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy('job_offer.created_at', 'DESC')
            .getManyAndCount();

        return [data, total];
    }

    async bulkUpsert(jobs: Partial<JobOffer>[]): Promise<{ saved: number; updated: number }> {
        if (jobs.length === 0) return { saved: 0, updated: 0 };

        // Process in batches to avoid query size limits
        const batchSize = 100;
        let totalSaved = 0;
        let totalUpdated = 0;

        for (let i = 0; i < jobs.length; i += batchSize) {
            const batch = jobs.slice(i, i + batchSize);

            try {
                const result = await this.createQueryBuilder()
                    .insert()
                    .into(JobOffer)
                    .values(batch)
                    .orUpdate(
                        [
                            'title',
                            'description',
                            'company',
                            'location',
                            'skills',
                            'experience_level',
                            'employment_type',
                            'min_salary',
                            'max_salary',
                            'currency',
                            'benefits',
                            'application_url',
                            'active',
                            'last_synced_at'
                        ],
                        ['external_id', 'provider']
                    )
                    .execute();

                const affected = result.raw?.length || result.identifiers?.length || 0;
                totalSaved += affected;
            } catch (error) {
                console.error('Error in bulk upsert batch:', error);
                throw error;
            }
        }

        return { saved: totalSaved, updated: totalUpdated };
    }

    async getLastSyncInfo(): Promise<{ lastSync: Date | null; totalJobs: number; activeJobs: number }> {
        const result = await this.createQueryBuilder('job_offer')
            .select('MAX(job_offer.last_synced_at)', 'lastSync')
            .addSelect('COUNT(*)', 'totalJobs')
            .addSelect('SUM(CASE WHEN job_offer.active = true THEN 1 ELSE 0 END)', 'activeJobs')
            .getRawOne();

        return {
            lastSync: result.lastSync,
            totalJobs: parseInt(result.totalJobs, 10) || 0,
            activeJobs: parseInt(result.activeJobs, 10) || 0,
        };
    }

    async getProviderStats(): Promise<Array<{ provider: string; count: number; lastSync: Date }>> {
        const results = await this.createQueryBuilder('job_offer')
            .select('job_offer.provider', 'provider')
            .addSelect('COUNT(*)', 'count')
            .addSelect('MAX(job_offer.last_synced_at)', 'lastSync')
            .groupBy('job_offer.provider')
            .getRawMany();

        return results.map(r => ({
            provider: r.provider,
            count: parseInt(r.count, 10),
            lastSync: r.lastSync,
        }));
    }

    async deactivateStaleJobs(provider: string, syncDate: Date): Promise<number> {
        const result = await this.createQueryBuilder()
            .update(JobOffer)
            .set({ active: false })
            .where('provider = :provider', { provider })
            .andWhere('last_synced_at < :syncDate', { syncDate })
            .andWhere('active = true')
            .execute();

        return result.affected || 0;
    }

    private applyFilters(queryBuilder: SelectQueryBuilder<JobOffer>, filters: any): void {
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
            queryBuilder.andWhere('job_offer.max_salary >= :min_salary', {
                minSalary: filters.minSalary,
            });
        }

        if (filters.maxSalary !== undefined) {
            queryBuilder.andWhere('job_offer.min_salary <= :max_salary', {
                maxSalary: filters.maxSalary,
            });
        }

        if (filters.skills && filters.skills.length > 0) {
            queryBuilder.andWhere('job_offer.skills && ARRAY[:...skills]', {
                skills: filters.skills,
            });
        }

        queryBuilder.andWhere('job_offer.active = :active', { active: true });
    }
}