import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ReportsController } from './infrastructure/controllers/reports.controller';
import { ReportsService } from './application/services/reports.service';

@Module({
  imports: [CqrsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
