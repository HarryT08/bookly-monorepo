import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RabbitMQService } from './rabbitmq.service';
import { RedisService } from './redis.service';
import { LoggingService } from '@logging/logging.service';
import { getCorrelationContext, getTracingHeaders } from '@libs/common/middleware/correlation-id.middleware';
import { StandardizedDomainEvent } from '../interfaces/standardized-domain-event.interface';

export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  eventData: any;
  timestamp: Date;
  version: number;
  userId?: string;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
}

// Union type for backward compatibility during migration
export type EventPayload = DomainEvent | StandardizedDomainEvent;

@Injectable()
export class EventBusService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly rabbitMQService: RabbitMQService,
    private readonly redisService: RedisService,
    private readonly loggingService: LoggingService,
  ) {}

  async publishEvent(event: EventPayload): Promise<void> {
    try {
      // Enrich event with correlation context
      const context = getCorrelationContext();
      const enrichedEvent = {
        ...event,
        correlationId: context?.correlationId,
        traceId: context?.traceId,
        spanId: context?.spanId,
        parentSpanId: context?.parentSpanId,
      };

      // Convert StandardizedDomainEvent to DomainEvent for backward compatibility
      const eventForProcessing = this.normalizeEvent(enrichedEvent);

      // Emit locally for immediate handlers
      this.eventEmitter.emit(eventForProcessing.eventType, eventForProcessing);

      // Publish to RabbitMQ for distributed processing
      await this.rabbitMQService.publish(eventForProcessing.eventType, eventForProcessing);

      // Cache event in Redis for replay capabilities
      await this.redisService.cacheEvent(eventForProcessing);

      this.loggingService.log(
        `Event published: ${enrichedEvent.eventType}`,
        { 
          eventId: enrichedEvent.eventId, 
          aggregateId: enrichedEvent.aggregateId,
          correlationId: enrichedEvent.correlationId,
          traceId: enrichedEvent.traceId,
          spanId: enrichedEvent.spanId
        },
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

  /**
   * Get event history for an aggregate
   */
  async getEventHistory(aggregateId: string): Promise<DomainEvent[]> {
    try {
      return await this.redisService.getEventHistory(aggregateId);
    } catch (error) {
      this.loggingService.error(
        `Failed to get event history for aggregate: ${aggregateId}`,
        error,
        'EventBusService',
      );
      return [];
    }
  }

  /**
   * Replay events for an aggregate
   */
  async replayEvents(aggregateId: string, fromVersion?: number): Promise<void> {
    try {
      const events = await this.getEventHistory(aggregateId);
      const filteredEvents = fromVersion 
        ? events.filter(event => event.version >= fromVersion)
        : events;

      for (const event of filteredEvents) {
        await this.publishEvent(event);
      }

      this.loggingService.log(
        `Replayed ${filteredEvents.length} events for aggregate: ${aggregateId}`,
        { aggregateId, fromVersion, totalEvents: filteredEvents.length },
        'EventBusService',
      );
    } catch (error) {
      this.loggingService.error(
        `Failed to replay events for aggregate: ${aggregateId}`,
        error,
        'EventBusService',
      );
      throw error;
    }
  }

  /**
   * Normalize events for backward compatibility
   * Converts StandardizedDomainEvent to DomainEvent format
   */
  private normalizeEvent(event: any): DomainEvent {
    // If it's already a DomainEvent, return as is
    if ('version' in event && typeof event.version === 'number') {
      return event as DomainEvent;
    }

    // Convert StandardizedDomainEvent to DomainEvent
    return {
      eventId: event.eventId,
      eventType: event.eventType,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      eventData: event.eventData,
      timestamp: event.timestamp,
      version: event.aggregateVersion || 1,
      userId: event.userId,
      correlationId: event.correlationId,
      traceId: event.traceId,
      spanId: event.spanId,
      parentSpanId: event.parentSpanId
    };
  }
}
