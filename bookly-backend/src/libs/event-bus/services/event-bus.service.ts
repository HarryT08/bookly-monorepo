import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RabbitMQService } from './rabbitmq.service';
import { RedisService } from './redis.service';
import { LoggingService } from '@logging/logging.service';

export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  eventData: any;
  timestamp: Date;
  version: number;
}

@Injectable()
export class EventBusService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly rabbitMQService: RabbitMQService,
    private readonly redisService: RedisService,
    private readonly loggingService: LoggingService,
  ) {}

  async publishEvent(event: DomainEvent): Promise<void> {
    try {
      // Emit locally for immediate handlers
      this.eventEmitter.emit(event.eventType, event);

      // Publish to RabbitMQ for distributed processing
      await this.rabbitMQService.publish(event.eventType, event);

      // Cache event in Redis for replay capabilities
      await this.redisService.cacheEvent(event);

      this.loggingService.log(
        `Event published: ${event.eventType}`,
        { eventId: event.eventId, aggregateId: event.aggregateId },
        'EventBusService',
      );
    } catch (error) {
      this.loggingService.error(
        `Failed to publish event: ${event.eventType}`,
        error,
        'EventBusService',
      );
      throw error;
    }
  }

  registerHandler(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    this.eventEmitter.on(eventType, handler);
    this.loggingService.log(
      `Event handler registered for: ${eventType}`,
      {},
      'EventBusService',
    );
  }

  async subscribeToQueue(queueName: string, handler: (event: DomainEvent) => Promise<void>): Promise<void> {
    await this.rabbitMQService.subscribe(queueName, handler);
  }
}
