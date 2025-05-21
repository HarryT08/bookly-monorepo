import { Module } from '@nestjs/common';
import { EventBusModule } from '@bookly-monorepo/event-bus';

// Importar los event handlers
import {
  RoleCreatedHandler,
  RoleUpdatedHandler,
  RoleDeletedHandler,
  PermissionAddedHandler,
  PermissionRemovedHandler
} from './role-events.handler';

import {
  UserCreatedHandler,
  UserUpdatedHandler,
  UserDeletedHandler
} from './user-events.handler';

import {
  UserCommandResponseHandler,
  RoleCommandResponseHandler
} from './command-responses.handler';

// Array de todos los event handlers para facilitar el registro
const eventHandlers = [
  // Role event handlers
  RoleCreatedHandler,
  RoleUpdatedHandler,
  RoleDeletedHandler,
  PermissionAddedHandler,
  PermissionRemovedHandler,
  
  // User event handlers
  UserCreatedHandler,
  UserUpdatedHandler,
  UserDeletedHandler,
  
  // Command response handlers
  UserCommandResponseHandler,
  RoleCommandResponseHandler
];

/**
 * Mu00f3dulo que registra todos los manejadores de eventos
 * para el servicio de autenticaciu00f3n
 */
@Module({
  imports: [
    EventBusModule,
  ],
  providers: [
    ...eventHandlers
  ],
  exports: [
    ...eventHandlers
  ]
})
export class EventHandlersModule {}
