import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Channel, ChannelModel } from 'amqplib';
import { LoggingService } from '@logging/logging.service';
import { DomainEvent } from './event-bus.service';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel;
  private channel: Channel;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService?: LoggingService,
  ) {}

  async onModuleInit() {
    try {
      this.connection = await connect(this.configService.get('RABBITMQ_URL'));
      this.channel = await this.connection.createChannel();

      // Declare exchanges for different event types
      await this.channel.assertExchange('bookly.events', 'topic', { durable: true });
      await this.channel.assertExchange('bookly.commands', 'direct', { durable: true });

      this.loggingService?.log('✅ RabbitMQ connected successfully', 'RabbitMQService');
    } catch (error) {
      this.loggingService?.error('❌ Failed to connect to RabbitMQ', error, 'RabbitMQService');
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.loggingService?.log('📴 RabbitMQ disconnected', 'RabbitMQService');
    } catch (error) {
      this.loggingService?.error('Error closing RabbitMQ connection', error, 'RabbitMQService');
    }
  }

  async publish(eventType: string, event: DomainEvent): Promise<void> {
    try {
      const routingKey = `${event.aggregateType}.${eventType}`;
      const message = Buffer.from(JSON.stringify(event));

      await this.channel.publish('bookly.events', routingKey, message, {
        persistent: true,
        timestamp: Date.now(),
        messageId: event.eventId,
      });

      this.loggingService?.log(
        `Event published to RabbitMQ: ${eventType}`,
        { routingKey, eventId: event.eventId },
        'RabbitMQService',
      );
    } catch (error) {
      this.loggingService?.error(
        `Failed to publish event to RabbitMQ: ${eventType}`,
        error,
        'RabbitMQService',
      );
      throw error;
    }
  }

  async subscribe(queueName: string, handler: (event: DomainEvent) => Promise<void>): Promise<void> {
    try {
      await this.channel.assertQueue(queueName, { durable: true });
      await this.channel.bindQueue(queueName, 'bookly.events', '#');

      await this.channel.consume(queueName, async (msg) => {
        if (msg) {
          try {
            const event: DomainEvent = JSON.parse(msg.content.toString());
            await handler(event);
            this.channel.ack(msg);
          } catch (error) {
            this.loggingService?.error(
              `Error processing message from queue: ${queueName}`,
              error,
              'RabbitMQService',
            );
            this.channel.nack(msg, false, false); // Dead letter the message
          }
        }
      });

      this.loggingService?.log(
        `Subscribed to queue: ${queueName}`,
        {},
        'RabbitMQService',
      );
    } catch (error) {
      this.loggingService?.error(
        `Failed to subscribe to queue: ${queueName}`,
        error,
        'RabbitMQService',
      );
      throw error;
    }
  }
}
