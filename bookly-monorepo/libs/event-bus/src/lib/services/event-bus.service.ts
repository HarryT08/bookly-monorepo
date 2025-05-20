import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IEvent } from '../interfaces/event.interface';

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(
    @Inject('EVENT_BUS_SERVICE') private readonly client: ClientProxy
  ) {}

  async publish<T extends IEvent>(event: T): Promise<void> {
    this.logger.debug(`Publishing event ${event.eventName}`);
    await firstValueFrom(this.client.emit(event.eventName, event));
  }

  async publishWithExchange<T extends IEvent>(event: T, exchange: string): Promise<void> {
    this.logger.debug(`Publishing event ${event.eventName} to exchange ${exchange}`);
    await firstValueFrom(this.client.emit(`${exchange}.${event.eventName}`, event));
  }

  async onModuleInit() {
    await this.client.connect();
  }
}
