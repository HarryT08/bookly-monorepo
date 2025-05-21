import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventBusModule } from '@bookly-monorepo/event-bus';
import { AuthController } from '../infrastructure/controllers/auth.controller';
import { AuthServiceImpl } from '../infrastructure/services/auth.service.impl';
import { CommandBus } from './buses/cqrs-bus';
import { CustomLoggingModule } from '../infrastructure/logging/custom-logging.module';
import { UserServiceProxy } from '../infrastructure/proxies/user-service.proxy';
import { RoleServiceProxy } from '../infrastructure/proxies/role-service.proxy';
import { UserEventsListener } from '../infrastructure/event-listeners/user-events.listener';
import { RoleEventsListener } from '../infrastructure/event-listeners/role-events.listener';
import { CommandResponsesListener } from '../infrastructure/event-listeners/command-responses.listener';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: { expiresIn: configService.get<string>('jwt.accessExpiration') },
      }),
      inject: [ConfigService],
    }),
    EventBusModule.register({
      serviceName: 'auth-service',
    }),
    CustomLoggingModule,
  ],
  controllers: [AuthController],
  providers: [
    { provide: 'AuthService', useClass: AuthServiceImpl },
    UserServiceProxy,
    RoleServiceProxy,
    UserEventsListener,
    RoleEventsListener,
    CommandResponsesListener,
    { provide: 'CommandBus', useClass: CommandBus },
    ...CommandHandlers,
    ...QueryHandlers
  ],
  exports: [
    JwtModule,
    { provide: 'AuthService', useClass: AuthServiceImpl },
    UserServiceProxy,
    RoleServiceProxy,
    { provide: 'CommandBus', useClass: CommandBus }
  ],
})
export class AuthModule {}
