import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { EventBusService, DomainEvent } from '@libs/event-bus/services/event-bus.service';

class TestEventDto {
  eventType: string;
  aggregateId: string;
  userId?: string;
  resourceId?: string;
  data: any;
}

@ApiTags('WebSocket Testing')
@Controller('websocket-test')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WebSocketTestController {
  private readonly logger = new Logger(WebSocketTestController.name);

  constructor(private readonly eventBusService: EventBusService) {}

  @Post('emit-reservation-event')
  @ApiOperation({ 
    summary: 'Test reservation event emission',
    description: 'Emits a test reservation event to test WebSocket broadcasting'
  })
  @ApiResponse({ status: 201, description: 'Event emitted successfully' })
  async emitReservationEvent(@Body() testEvent: TestEventDto) {
    const domainEvent: DomainEvent = {
      eventId: `test-${Date.now()}`,
      aggregateId: testEvent.aggregateId,
      aggregateType: 'reservation',
      eventType: testEvent.eventType,
      eventData: testEvent.data,
      timestamp: new Date(),
      version: 1,
      userId: testEvent.userId,
    };

    this.logger.log(`Emitting test reservation event: ${testEvent.eventType}`);
    await this.eventBusService.publishEvent(domainEvent);

    return {
      success: true,
      message: 'Test reservation event emitted',
      eventId: domainEvent.eventId,
      eventType: testEvent.eventType,
    };
  }

  @Post('emit-resource-event')
  @ApiOperation({ 
    summary: 'Test resource event emission',
    description: 'Emits a test resource event to test WebSocket broadcasting'
  })
  @ApiResponse({ status: 201, description: 'Event emitted successfully' })
  async emitResourceEvent(@Body() testEvent: TestEventDto) {
    const domainEvent: DomainEvent = {
      eventId: `test-${Date.now()}`,
      aggregateId: testEvent.aggregateId,
      aggregateType: 'resource',
      eventType: testEvent.eventType,
      eventData: testEvent.data,
      timestamp: new Date(),
      version: 1,
      userId: testEvent.userId,
    };

    this.logger.log(`Emitting test resource event: ${testEvent.eventType}`);
    await this.eventBusService.publishEvent(domainEvent);

    return {
      success: true,
      message: 'Test resource event emitted',
      eventId: domainEvent.eventId,
      eventType: testEvent.eventType,
    };
  }

  @Post('emit-notification-event')
  @ApiOperation({ 
    summary: 'Test notification event emission',
    description: 'Emits a test notification event to test WebSocket broadcasting'
  })
  @ApiResponse({ status: 201, description: 'Event emitted successfully' })
  async emitNotificationEvent(@Body() testEvent: TestEventDto) {
    const domainEvent: DomainEvent = {
      eventId: `test-${Date.now()}`,
      aggregateId: testEvent.aggregateId,
      aggregateType: 'notification',
      eventType: testEvent.eventType,
      eventData: testEvent.data,
      timestamp: new Date(),
      version: 1,
      userId: testEvent.userId,
    };

    this.logger.log(`Emitting test notification event: ${testEvent.eventType}`);
    await this.eventBusService.publishEvent(domainEvent);

    return {
      success: true,
      message: 'Test notification event emitted',
      eventId: domainEvent.eventId,
      eventType: testEvent.eventType,
    };
  }

  @Post('emit-system-event')
  @ApiOperation({ 
    summary: 'Test system event emission',
    description: 'Emits a test system event to test WebSocket broadcasting'
  })
  @ApiResponse({ status: 201, description: 'Event emitted successfully' })
  async emitSystemEvent(@Body() testEvent: TestEventDto) {
    const domainEvent: DomainEvent = {
      eventId: `test-${Date.now()}`,
      aggregateId: testEvent.aggregateId,
      aggregateType: 'system',
      eventType: testEvent.eventType,
      eventData: testEvent.data,
      timestamp: new Date(),
      version: 1,
    };

    this.logger.log(`Emitting test system event: ${testEvent.eventType}`);
    await this.eventBusService.publishEvent(domainEvent);

    return {
      success: true,
      message: 'Test system event emitted',
      eventId: domainEvent.eventId,
      eventType: testEvent.eventType,
    };
  }

  @Post('emit-custom-event')
  @ApiOperation({ 
    summary: 'Test custom event emission',
    description: 'Emits a custom test event to test WebSocket broadcasting with any event type'
  })
  @ApiResponse({ status: 201, description: 'Event emitted successfully' })
  async emitCustomEvent(@Body() testEvent: TestEventDto) {
    const domainEvent: DomainEvent = {
      eventId: `test-${Date.now()}`,
      aggregateId: testEvent.aggregateId,
      aggregateType: 'custom',
      eventType: testEvent.eventType,
      eventData: testEvent.data,
      timestamp: new Date(),
      version: 1,
      userId: testEvent.userId,
    };

    this.logger.log(`Emitting custom test event: ${testEvent.eventType}`);
    await this.eventBusService.publishEvent(domainEvent);

    return {
      success: true,
      message: 'Custom test event emitted',
      eventId: domainEvent.eventId,
      eventType: testEvent.eventType,
    };
  }
}
