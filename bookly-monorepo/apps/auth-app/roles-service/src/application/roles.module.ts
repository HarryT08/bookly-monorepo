import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventBusModule } from '@bookly-monorepo/event-bus';

// Import controllers, services, and schemas
import { RolesController } from '../infrastructure/controllers/roles.controller';
import { RolesService } from '../infrastructure/services/roles.service';
import { Role, RoleSchema } from '../domain/entities/role.entity';
import { MongooseRoleRepository } from '../infrastructure/repositories/mongoose-role.repository';

// Import event publishers
import { RoleEventsPublisher } from '../infrastructure/event-publishers/role-events.publisher';

// Import commands and queries handlers
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';

// Import the command bus and query bus
import { CqrsModule, CommandBus, QueryBus } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule,
    // Registrar EventBusModule con la configuraciu00f3n adecuada siguiendo el patrón del servicio de usuarios
    EventBusModule.register({
      serviceName: 'roles-service',
    }),
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [RolesController],
  providers: [
    RolesService,
    RoleEventsPublisher,
    {
      provide: 'RoleRepository',
      useClass: MongooseRoleRepository,
    },
    // Proporcionar los buses con los tokens nombrados que espera el controlador
    {
      provide: 'CommandBus',
      useExisting: CommandBus
    },
    {
      provide: 'QueryBus',
      useExisting: QueryBus
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [RolesService],
})
export class RolesModule {}
