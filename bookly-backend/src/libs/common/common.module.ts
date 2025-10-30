import { Module, Global } from '@nestjs/common';
import { I18nConfigModule } from '@i18n/i18n.module';
import { PrismaService } from './services/prisma.service';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { ValidationPipe } from './pipes/validation.pipe';
import { ExceptionsFilter } from './filters/exception.filter';

@Global()
@Module({
  imports: [I18nConfigModule],
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
