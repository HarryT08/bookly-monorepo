import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventBusService } from './services/event-bus.service';
import { EventPublisher } from './services/event-publisher.service';
import { EventSubscriber } from './services/event-subscriber.service';

@Module({})
export class EventBusModule {
  static register(options: {
    serviceName: string;
    rabbitmqUrl?: string;
  }): DynamicModule {
    const rabbitmqUrl = options.rabbitmqUrl ?? process.env['RABBITMQ_URL'] ?? 'amqp://localhost:5672';

    return {
      module: EventBusModule,
      imports: [
        ClientsModule.register([
          {
            name: 'EVENT_BUS_SERVICE',
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl],
              queue: `${options.serviceName}_queue`,
              queueOptions: {
                durable: true,
              },
            },
          },
        ]),
      ],
      providers: [EventBusService, EventPublisher, EventSubscriber],
      exports: [EventBusService, EventPublisher, EventSubscriber],
    };
  }
}
