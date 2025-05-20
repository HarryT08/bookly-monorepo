import { SetMetadata } from '@nestjs/common';

/**
 * Clave para el metadata que indica los roles requeridos para una ruta
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar los roles requeridos para acceder a una ruta
 * @param roles Roles permitidos
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
