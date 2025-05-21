import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthRoleRequiredHandler } from './auth-role-required.handler';
import { RoleCommandHandler } from './role-command.handler';
import { RolesModule } from '../../application/roles.module';
import { EventBusModule, DEFAULT_RABBITMQ_URL, EventExchange, ServiceName } from '@bookly-monorepo/event-bus';
import { EnvVariable, Environment } from '@bookly-monorepo/common';
import { AuthEventsListener } from '../event-listeners/auth-events.listener';

@Module({
  imports: [
    // Importar RolesModule para obtener acceso a RolesService
    RolesModule,
    // Importar ConfigModule para acceder a las variables de entorno
    ConfigModule,
    // Registrar el EventBusModule con la misma configuración que en AppModule
    EventBusModule.register({
      serviceName: ServiceName.ROLES,
      rabbitmqUrl: process.env[EnvVariable.NODE_ENV] === Environment.PRODUCTION 
        ? (process.env[EnvVariable.RABBITMQ_URI] ?? DEFAULT_RABBITMQ_URL)
        : null,
      exchange: process.env[EnvVariable.RABBITMQ_ROLES_EXCHANGE] ?? EventExchange.ROLES,
    }),
  ],
  providers: [
    AuthRoleRequiredHandler,
    RoleCommandHandler,
    AuthEventsListener // Añadir AuthEventsListener a los proveedores
  ],
  exports: [
    AuthRoleRequiredHandler,
    RoleCommandHandler,
    AuthEventsListener // Exportar AuthEventsListener para que sea visible en AppModule
  ]
})
export class EventHandlersModule {}
