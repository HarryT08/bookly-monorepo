import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IEvent } from '../interfaces/event.interface';

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(
    @Optional() @Inject('EVENT_BUS_SERVICE') private readonly client?: ClientProxy
  ) {}

  async publish<T extends IEvent>(event: T): Promise<void> {
    this.logger.debug(`Publishing event ${event.eventName}`);

    // Si no hay cliente RabbitMQ (modo desarrollo), simplemente registramos el evento
    if (!this.client) {
      this.logger.debug(`Event Bus disabled or in dev mode - logging event: ${JSON.stringify(event)}`);
      return;
    }

    await firstValueFrom(this.client.emit(event.eventName, event));
  }

  async publishWithExchange<T extends IEvent>(event: T, exchange: string): Promise<void> {
    this.logger.debug(`Publishing event ${event.eventName} to exchange ${exchange}`);

    // Si no hay cliente RabbitMQ (modo desarrollo), simplemente registramos el evento
    if (!this.client) {
      this.logger.debug(`Event Bus disabled or in dev mode - logging event to exchange ${exchange}: ${JSON.stringify(event)}`);
      return;
    }

    await firstValueFrom(this.client.emit(`${exchange}.${event.eventName}`, event));
  }

  async onModuleInit() {
    // Solo intentamos conectar si el cliente existe
    if (this.client) {
      try {
        await this.client.connect();
        this.logger.log('Successfully connected to message broker');
      } catch (error: any) {
        this.logger.warn(`Failed to connect to message broker: ${error?.message ?? 'Unknown error'}`);
      }
    } else {
      this.logger.log('Event Bus running in development mode (no message broker)');
    }
  }
}
