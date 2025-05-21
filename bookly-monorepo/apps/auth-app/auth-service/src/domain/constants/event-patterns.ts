/**
 * Constantes para patrones de eventos utilizados en la aplicación
 * Centralizar estas constantes ayuda a mantener la consistencia y evitar errores tipográficos
 */

// Patrones de eventos relacionados con usuarios
export const USER_CREATED_EVENT = 'user.created';
export const USER_UPDATED_EVENT = 'user.updated';
export const USER_DELETED_EVENT = 'user.deleted';

// Patrones de eventos relacionados con roles
export const ROLE_CREATED_EVENT = 'role.created';
export const ROLE_UPDATED_EVENT = 'role.updated';
export const ROLE_DELETED_EVENT = 'role.deleted';
export const PERMISSION_ADDED_EVENT = 'role.permission.added';
export const PERMISSION_REMOVED_EVENT = 'role.permission.removed';

// Patrones de respuestas de comandos
export const USER_COMMAND_RESPONSE_PATTERN = 'users.*.response.*';
export const ROLE_COMMAND_RESPONSE_PATTERN = 'roles.*.response.*';

// Constantes para la invalidación de sesiones
export const SESSION_INVALIDATE_EVENT = 'auth.session.invalidate';
