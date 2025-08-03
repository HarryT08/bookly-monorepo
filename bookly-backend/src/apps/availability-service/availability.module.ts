import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AvailabilityController } from './infrastructure/controllers/availability.controller';
import { AvailabilityService } from './application/services/availability.service';

@Module({
  imports: [CqrsModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
