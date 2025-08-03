import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { StockpileController } from './infrastructure/controllers/stockpile.controller';
import { StockpileService } from './application/services/stockpile.service';

@Module({
  imports: [CqrsModule],
  controllers: [StockpileController],
  providers: [StockpileService],
  exports: [StockpileService],
})
export class StockpileModule {}
