import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { JobOffersService } from './job-offers.service';
import { JobOffersController } from './job-offers.controller';
import { TransformersModule } from '../transformers/transformers.module';
import {JobOffer} from "../database/entities/job-offer.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([JobOffer]),
        HttpModule,
        ConfigModule,
        TransformersModule,
    ],
    controllers: [JobOffersController],
    providers: [JobOffersService, JobOffersService],
    exports: [JobOffersService, JobOffersService],
})
export class JobOffersModule {}