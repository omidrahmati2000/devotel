import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private context: string = 'Application';

  log(message: any, context?: string) {
    console.log(`[${context || this.context}] ${message}`);
  }

  error(message: any, trace?: string, context?: string) {
    console.error(`[${context || this.context}] ${message}`, trace);
  }

  warn(message: any, context?: string) {
    console.warn(`[${context || this.context}] ${message}`);
  }

  debug(message: any, context?: string) {
    console.debug(`[${context || this.context}] ${message}`);
  }

  verbose(message: any, context?: string) {
    console.log(`[VERBOSE] [${context || this.context}] ${message}`);
  }

  setContext(context: string) {
    this.context = context;
  }
}
