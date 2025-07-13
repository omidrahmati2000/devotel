import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JobOffersModule } from '../job-offers/job-offers.module';
import { TransformersModule } from '../transformers/transformers.module';
import { JobSyncService } from './job-sync.service';
import { HttpRetryService } from '../utils/http-retry.service';
import { LoggerService } from '../utils/logger.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ConfigModule,
        HttpModule,
        JobOffersModule,
        TransformersModule,
    ],
    providers: [
        JobSyncService,
        HttpRetryService,
        LoggerService,
    ],
    exports: [JobSyncService],
})
export class SchedulerModule {}