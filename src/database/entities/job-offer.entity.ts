import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    Unique,
} from 'typeorm';

@Entity('job_offers')
@Unique(['externalId', 'provider'])
@Index(['title'])
@Index(['location'])
@Index(['minSalary', 'maxSalary'])
export class JobOffer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'external_id' })
    externalId: string;

    @Column()
    provider: string;

    @Column()
    title: string;

    @Column()
    company: string;

    @Column({ type: 'text' })
    description: string;

    @Column()
    location: string;

    @Column({ name: 'employment_type', nullable: true })
    employmentType: string;

    @Column({ name: 'experience_level', nullable: true })
    experienceLevel: string;

    @Column({ name: 'min_salary', type: 'decimal', precision: 10, scale: 2, nullable: true })
    minSalary: number;

    @Column({ name: 'max_salary', type: 'decimal', precision: 10, scale: 2, nullable: true })
    maxSalary: number;

    @Column({ nullable: true })
    currency: string;

    @Column({ name: 'posted_date', type: 'timestamp', nullable: true })
    postedDate: Date;

    @Column({ name: 'application_deadline', type: 'timestamp', nullable: true })
    applicationDeadline: Date;

    @Column({ name: 'application_url', nullable: true })
    applicationUrl: string;

    @Column('text', { array: true, default: [] })
    skills: string[];

    @Column('text', { array: true, default: [] })
    benefits: string[];

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'last_synced_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastSyncedAt: Date;
}
