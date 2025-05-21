/**
 * Constantes para la configuraciu00f3n del EventBusModule
 * Siguiendo principios de Clean Code, estas constantes evitan valores hardcodeados
 * dispersos por el cu00f3digo y centralizan la configuraciu00f3n.
 */

// Valores por defecto para la conexiu00f3n con RabbitMQ
export const DEFAULT_RABBITMQ_URL = 'amqp://user:pass@localhost:5672';

// Tipos de intercambio disponibles en RabbitMQ
export enum ExchangeType {
  TOPIC = 'topic',
  DIRECT = 'direct',
  FANOUT = 'fanout',
  HEADERS = 'headers'
}

// Configuraciones por defecto para el intercambio
export const DEFAULT_EXCHANGE_TYPE = ExchangeType.TOPIC;

// Patru00f3n para la routing key por defecto
export const DEFAULT_ROUTING_KEY_PATTERN = '*'; // Cualquier mensaje

// Patru00f3n para la cola
export const DEFAULT_QUEUE_PATTERN = '{serviceName}_queue';

// Configuraciu00f3n de conexiu00f3n
export const DEFAULT_MAX_CONNECTION_ATTEMPTS = 3;
export const DEFAULT_CONNECTION_TIMEOUT = 5000; // ms

// Opciones de la cola
export const DEFAULT_QUEUE_OPTIONS = {
  durable: true,
};

// Eventos del sistema (categoru00edas)
export enum EventCategory {
  AUTH = 'auth',
  USERS = 'users',
  ROLES = 'roles',
}

// Nombres de eventos especu00edficos
export enum EventName {
  // Eventos de autenticaciu00f3n
  USER_REGISTERED = 'auth.user.registered',
  USER_AUTHENTICATED = 'auth.user.authenticated',
  USER_LOGGED_OUT = 'auth.user.logged_out',
  
  // Eventos de usuarios
  USER_CREATED = 'users.user.created',
  USER_UPDATED = 'users.user.updated',
  USER_DELETED = 'users.user.deleted',
  
  // Eventos de roles
  ROLE_CREATED = 'roles.role.created',
  ROLE_UPDATED = 'roles.role.updated',
  ROLE_DELETED = 'roles.role.deleted',
  ROLE_ASSIGNED = 'roles.role.assigned',
  ROLE_UNASSIGNED = 'roles.role.unassigned',
}

// Nombres de intercambios para cada servicio
export enum EventExchange {
  AUTH = 'auth_events',
  USERS = 'users_events',
  ROLES = 'roles_events',
}

// Nombres de servicios
export enum ServiceName {
  AUTH = 'auth-service',
  USERS = 'users-service',
  ROLES = 'roles-service',
}
