import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventBusModule } from '@bookly-monorepo/event-bus';

// Import controllers, services and schemas
import { UsersController } from '../infrastructure/controllers/users.controller';
import { UserService } from '../infrastructure/services/user.service';
import { User, UserSchema } from '../domain/entities/user.entity';
import { MongooseUserRepository } from '../infrastructure/repositories/mongoose-user.repository';

// Import event-related classes
import { UserEventsPublisher } from '../infrastructure/event-publishers/user-events.publisher';
import { AuthEventsListener } from '../infrastructure/event-listeners/auth-events.listener';

// Import commands and queries handlers
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';

// Import the command bus
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule,
    EventBusModule.register({
      serviceName: 'users-service',
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: { expiresIn: configService.get<string>('jwt.accessExpiration') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [
    UserService,
    UserEventsPublisher,
    AuthEventsListener,
    {
      provide: 'UserRepository',
      useClass: MongooseUserRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [UserService],
})
export class UsersModule {}
