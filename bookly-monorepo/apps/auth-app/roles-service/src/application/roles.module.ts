import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventBusModule } from '@bookly-monorepo/event-bus';

// Import controllers, services, and schemas
import { RolesController } from '../infrastructure/controllers/roles.controller';
import { RolesService } from '../infrastructure/services/roles.service';
import { Role, RoleSchema } from '../domain/entities/role.entity';
import { MongooseRoleRepository } from '../infrastructure/repositories/mongoose-role.repository';

// Import event publishers and listeners
import { RoleEventsPublisher } from '../infrastructure/event-publishers/role-events.publisher';
import { AuthEventsListener } from '../infrastructure/event-listeners/auth-events.listener';

// Import commands and queries handlers
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';

// Import the command bus
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule,
    EventBusModule,
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [RolesController],
  providers: [
    RolesService,
    RoleEventsPublisher,
    AuthEventsListener,
    {
      provide: 'RoleRepository',
      useClass: MongooseRoleRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [RolesService],
})
export class RolesModule {}
