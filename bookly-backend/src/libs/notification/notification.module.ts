import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventBusModule } from '../event-bus/event-bus.module';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [
    EventBusModule,
    LoggingModule,
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
