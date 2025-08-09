import { Module, Global } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { ValidationPipe } from './pipes/validation.pipe';
import { ExceptionsFilter } from './filters/exception.filter';

@Global()
@Module({
  providers: [
    PrismaService,
    ResponseInterceptor,
    ValidationPipe,
    ExceptionsFilter,
  ],
  exports: [
    PrismaService,
    ResponseInterceptor,
    ValidationPipe,
    ExceptionsFilter,
  ],
})
export class CommonModule {}
