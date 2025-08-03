import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ResourcesController } from './infrastructure/controllers/resources.controller';
import { ResourcesService } from './application/services/resources.service';

@Module({
  imports: [CqrsModule],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
