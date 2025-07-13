import { Controller, Get, Param, Query, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { JobOffersService } from './job-offers.service';
import { JobOfferQueryDto } from './dto/job-offer-query.dto';
import { JobOfferResponseDto, PaginatedJobOffersDto } from './dto/job-offer-response.dto';
import { paginateResource } from '../utils/pagination.utils';

@ApiTags('job-offers')
@Controller('job-offers')
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all job offers with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated job offers',
    type: PaginatedJobOffersDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'title', required: false, type: String, description: 'Filter by job title' })
  @ApiQuery({ name: 'location', required: false, type: String, description: 'Filter by location' })
  @ApiQuery({ name: 'company', required: false, type: String, description: 'Filter by company' })
  @ApiQuery({ name: 'minSalary', required: false, type: Number, description: 'Minimum salary' })
  @ApiQuery({ name: 'maxSalary', required: false, type: Number, description: 'Maximum salary' })
  @ApiQuery({ name: 'skills', required: false, type: [String], description: 'Filter by skills' })
  async findAll(
    @Query() query: JobOfferQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedJobOffersDto> {
    const data = await this.jobOffersService.findAll(query);
    return paginateResource(data, query, req);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a job offer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the job offer',
    type: JobOfferResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Job offer not found',
  })
  async findOne(@Param('id') id: string): Promise<JobOfferResponseDto> {
    return this.jobOffersService.findOne(id);
  }

  @Get('sync/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get last sync information' })
  @ApiResponse({
    status: 200,
    description: 'Returns sync status information',
  })
  async getSyncStatus() {
    return this.jobOffersService.getLastSyncInfo();
  }
}
