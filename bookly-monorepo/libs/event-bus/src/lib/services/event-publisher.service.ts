import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { EventBusService } from './event-bus.service';
import { IEvent } from '../interfaces/event.interface';

@Injectable()
export class EventPublisher {
  private readonly logger = new Logger(EventPublisher.name);

  constructor(private readonly eventBusService: EventBusService) {}

  /**
   * Publica un evento en el bus de eventos
   * @param eventName Nombre del evento
   * @param payload Datos del evento
   * @param correlationId ID de correlación (opcional)
   */
  async publish<T>(eventName: string, payload: T, correlationId?: string): Promise<void> {
    const event: IEvent = {
      eventName,
      version: '1.0',
      timestamp: new Date(),
      correlationId: correlationId ?? uuidv4(),
      payload,
    };

    this.logger.debug(`Publishing event: ${eventName}`);
    await this.eventBusService.publish(event);
  }

  /**
   * Publica un evento en un exchange específico
   * @param eventName Nombre del evento
   * @param payload Datos del evento
   * @param exchange Nombre del exchange
   * @param correlationId ID de correlación (opcional)
   */
  async publishToExchange<T>(
    eventName: string,
    payload: T,
    exchange: string,
    correlationId?: string,
  ): Promise<void> {
    const event: IEvent = {
      eventName,
      version: '1.0',
      timestamp: new Date(),
      correlationId: correlationId ?? uuidv4(),
      payload,
    };

    this.logger.debug(`Publishing event: ${eventName} to exchange: ${exchange}`);
    await this.eventBusService.publishWithExchange(event, exchange);
  }
}
