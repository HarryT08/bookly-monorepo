import { SetMetadata } from '@nestjs/common';

/**
 * Clave para el metadata que indica si una ruta es pública
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar rutas como públicas (sin autenticación)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
