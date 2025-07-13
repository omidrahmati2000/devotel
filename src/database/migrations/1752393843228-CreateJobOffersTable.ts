import {MigrationInterface, QueryRunner, Table, TableIndex} from 'typeorm';

export class CreateJobOffersTable1752393843228 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'job_offers',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'external_id',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'provider',
                        type: 'varchar',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                    },
                    {
                        name: 'company',
                        type: 'varchar',
                    },
                    {
                        name: 'location',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'min_salary',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'max_salary',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'job_offers',
            new TableIndex({
                name: 'IDX_job_offers_title',
                columnNames: ['title'],
            }),
        );

        await queryRunner.createIndex(
            'job_offers',
            new TableIndex({
                name: 'IDX_job_offers_location',
                columnNames: ['location'],
            }),
        );

        await queryRunner.createIndex(
            'job_offers',
            new TableIndex({
                name: 'IDX_job_offers_salary',
                columnNames: ['min_salary', 'max_salary'],
            }),
        );

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('job_offers', 'IDX_job_offers_title');
        await queryRunner.dropIndex('job_offers', 'IDX_job_offers_location');
        await queryRunner.dropIndex('job_offers', 'IDX_job_offers_salary');

        await queryRunner.dropTable('job_offers');
    }
}
