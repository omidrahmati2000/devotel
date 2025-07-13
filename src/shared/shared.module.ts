import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LoggerService } from '../utils/logger.service';
import { HttpRetryService } from '../utils/http-retry.service';

@Global()
@Module({
    imports: [
        HttpModule.register({
            timeout: 30000,
            maxRedirects: 5,
        }),
    ],
    providers: [LoggerService, HttpRetryService],
    exports: [HttpModule, LoggerService, HttpRetryService],
})
export class SharedModule {}