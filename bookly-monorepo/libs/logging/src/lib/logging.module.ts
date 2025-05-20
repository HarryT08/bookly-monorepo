import { Module } from '@nestjs/common';
import { Logger } from './services/logger.service';

@Module({
  controllers: [],
  providers: [Logger],
  exports: [Logger],
})
export class LoggingModule {}
