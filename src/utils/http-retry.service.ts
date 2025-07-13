import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Injectable()
export class HttpRetryService {
  constructor(private readonly logger: LoggerService) {}

  async requestWithRetry<T>(
    request: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await request();
      } catch (error) {
        lastError = error;
        this.logger.warn(`Request failed (attempt ${attempt}/${maxRetries}): ${error.message}`);

        if (attempt < maxRetries) {
          await this.sleep(delay * attempt);
        }
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
