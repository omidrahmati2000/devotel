import { ApiProperty } from '@nestjs/swagger';

export class JobOfferResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    externalId: string;

    @ApiProperty()
    provider: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    company: string;

    @ApiProperty()
    location: string;

    @ApiProperty({ type: [String] })
    skills: string[];

    @ApiProperty()
    experienceLevel: string;

    @ApiProperty()
    employmentType: string;

    @ApiProperty({ nullable: true })
    minSalary?: number;

    @ApiProperty({ nullable: true })
    maxSalary?: number;

    @ApiProperty({ nullable: true })
    currency?: string;

    @ApiProperty({ type: [String] })
    benefits: string[];

    @ApiProperty()
    applicationUrl: string;

    @ApiProperty()
    active: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty({ nullable: true })
    lastSyncedAt?: Date;
}

export class PaginatedJobOffersDto {
    @ApiProperty()
    statusCode: string;

    @ApiProperty({ type: [JobOfferResponseDto] })
    data: JobOfferResponseDto[];

    @ApiProperty()
    count: number;

    @ApiProperty()
    currentPage: string;

    @ApiProperty({ nullable: true })
    nextPage: string | null;

    @ApiProperty({ nullable: true })
    prevPage: string | null;

    @ApiProperty()
    lastPage: string;
}