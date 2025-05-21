import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventBusService } from './services/event-bus.service';
import { EventPublisher } from './services/event-publisher.service';
import { EventSubscriber } from './services/event-subscriber.service';
import {
  DEFAULT_EXCHANGE_TYPE,
  DEFAULT_MAX_CONNECTION_ATTEMPTS,
  DEFAULT_QUEUE_OPTIONS,
  DEFAULT_RABBITMQ_URL,
  ExchangeType,
} from './constants/event-bus.constants';

/**
 * Opciones para la configuración del EventBusModule
 */
export interface EventBusModuleOptions {
  serviceName: string;
  rabbitmqUrl?: string;
  queue?: string;
  exchange?: string;
  exchangeType?: ExchangeType | string;
  routingKey?: string;
  connectionAttempts?: number;
  connectionTimeout?: number;
}

@Module({})
export class EventBusModule {
  /**
   * Registra el EventBusModule con las opciones proporcionadas
   * @param options Opciones de configuración para el módulo
   * @returns DynamicModule configurado para EventBus
   */
  static register(options: EventBusModuleOptions): DynamicModule {
    // Si no se proporciona URL de RabbitMQ (null), asumimos modo desarrollo sin RabbitMQ
    const isRmqDisabled = options.rabbitmqUrl === null;
    // Aseguramos que siempre tengamos un string como URL para RabbitMQ
    const rabbitmqUrl = isRmqDisabled ? '' : (options.rabbitmqUrl ?? process.env['RABBITMQ_URL'] ?? DEFAULT_RABBITMQ_URL);
    
    // En modo desarrollo (URL = null), no registramos el ClientsModule para RabbitMQ
    const imports = isRmqDisabled
      ? []
      : [
          ClientsModule.register([
            {
              name: 'EVENT_BUS_SERVICE',
              transport: Transport.RMQ,
              options: {
                urls: [rabbitmqUrl],
                queue: `${options.serviceName}_queue`,
                queueOptions: DEFAULT_QUEUE_OPTIONS,
                exchange: options.exchange,
                exchangeType: options.exchangeType ?? DEFAULT_EXCHANGE_TYPE,
                routingKey: options.routingKey ?? `${options.serviceName}.*`,
                maxConnectionAttempts: options.connectionAttempts ?? DEFAULT_MAX_CONNECTION_ATTEMPTS,
              },
            },
          ]),
        ];

    return {
      module: EventBusModule,
      imports,
      providers: [EventBusService, EventPublisher, EventSubscriber],
      exports: [EventBusService, EventPublisher, EventSubscriber],
    };
  }
}
