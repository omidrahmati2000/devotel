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
    company: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    location: string;

    @ApiProperty()
    employmentType: string;

    @ApiProperty()
    experienceLevel: string;

    @ApiProperty({ nullable: true })
    minSalary: number | null;

    @ApiProperty({ nullable: true })
    maxSalary: number | null;

    @ApiProperty({ nullable: true })
    currency: string | null;

    @ApiProperty({ nullable: true })
    postedDate: Date | null;

    @ApiProperty({ nullable: true })
    applicationDeadline: Date | null;

    @ApiProperty()
    applicationUrl: string;

    @ApiProperty({ type: [String] })
    skills: string[];

    @ApiProperty({ type: [String] })
    benefits: string[];

    @ApiProperty()
    active: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class PaginatedJobOffersDto {
    @ApiProperty({ type: [JobOfferResponseDto] })
    data: JobOfferResponseDto[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    totalPages: number;
}
