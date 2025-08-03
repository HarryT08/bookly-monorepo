import { Module, Global } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { ValidationPipe } from './pipes/validation.pipe';
import { AllExceptionsFilter } from './filters/exception.filter';

@Global()
@Module({
  providers: [
    PrismaService,
    ResponseInterceptor,
    ValidationPipe,
    AllExceptionsFilter,
  ],
  exports: [
    PrismaService,
    ResponseInterceptor,
    ValidationPipe,
    AllExceptionsFilter,
  ],
})
export class CommonModule {}
