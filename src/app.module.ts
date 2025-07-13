import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ScheduleModule} from '@nestjs/schedule';
import {HttpModule} from '@nestjs/axios';
import configuration from './config/configuration';
import {getDatabaseConfig} from './config/database.config';
import {SchedulerModule} from './scheduler/scheduler.module';
import {TransformersModule} from './transformers/transformers.module';
import {LoggerService} from './utils/logger.service';
import {HttpRetryService} from './utils/http-retry.service';
import {SharedModule} from "./shared/shared.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getDatabaseConfig,
        }),
        ScheduleModule.forRoot(),
        HttpModule.register({
            timeout: 30000,
            maxRedirects: 5,
        }),
        SchedulerModule,
        SharedModule,
        TransformersModule,
    ],
    providers: [LoggerService, HttpRetryService],
    exports: [LoggerService, HttpRetryService],
})
export class AppModule {
}
