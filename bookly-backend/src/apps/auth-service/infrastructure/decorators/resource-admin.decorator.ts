import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para RF-42: Marcar endpoints que requieren permisos de administrador
 * para modificar recursos (salas, equipos, etc.)
 */
export const RESOURCE_ADMIN_KEY = 'resourceAdmin';

/**
 * Decorator que marca un endpoint como requiriendo permisos de administrador
 * para modificar recursos del sistema
 * 
 * @param resourceType - Tipo de recurso que se está modificando (opcional)
 * @returns Decorator metadata
 */
export const RequireResourceAdmin = (resourceType?: string) => 
  SetMetadata(RESOURCE_ADMIN_KEY, { required: true, resourceType });

/**
 * Decorator específico para operaciones de eliminación que requieren
 * doble confirmación según RF-42
 * 
 * @param resourceType - Tipo de recurso que se está eliminando
 * @returns Decorator metadata
 */
export const RequireDoubleConfirmation = (resourceType: string) =>
  SetMetadata(RESOURCE_ADMIN_KEY, { 
    required: true, 
    resourceType, 
    requiresDoubleConfirmation: true 
  });
