import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingService } from './logging.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
