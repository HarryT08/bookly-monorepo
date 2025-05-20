import { DynamicModule, Module } from '@nestjs/common';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationPipe } from './pipes/validation.pipe';

@Module({})
export class CommonModule {
  static register(options: { enableGlobalInterceptors?: boolean } = {}): DynamicModule {
    const providers = [LoggingInterceptor, HttpExceptionFilter, ValidationPipe];
    
    return {
      module: CommonModule,
      providers,
      exports: providers,
      global: true,
    };
  }
}
