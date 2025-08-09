import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventBusService } from './services/event-bus.service';
import { RedisService } from './services/redis.service';
import { RabbitMQService } from './services/rabbitmq.service';

@Global()
@Module({
  imports: [ConfigModule, EventEmitterModule.forRoot()],
  providers: [
    EventBusService,
    RedisService,
    {
      provide: RabbitMQService,
      useFactory: (configService: ConfigService) => {
        return new RabbitMQService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [EventBusService, RedisService, RabbitMQService],
})
export class EventBusModule {}
