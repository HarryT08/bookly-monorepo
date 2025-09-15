import { Permission } from '@apps/auth-service/domain/entities/user.entity';

export class PermissionEntity implements Permission {
  constructor(
    public id: string,
    public name: string,
    public resource: string,
    public action: string,
    public scope: string = 'global',
    public conditions: any = null,
    public description: string | undefined = undefined,
    public isActive: boolean = true,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public createdBy?: string,
  ) {}

  static create(
    name: string,
    resource: string,
    action: string,
    scope: string = 'global',
    description?: string,
    conditions?: any,
    createdBy?: string,
  ): PermissionEntity {
    return new PermissionEntity(
      '', // ID will be set by database
      name,
      resource,
      action,
      scope,
      conditions,
      description,
      true,
      new Date(),
      new Date(),
      createdBy,
    );
  }

  /**
   * Generate permission name from resource, action and scope
   * e.g., "resources:create:global", "users:update:own"
   */
  static generateName(resource: string, action: string, scope: string = 'global'): string {
    return `${resource}:${action}:${scope}`;
  }

  /**
   * Check if this permission matches the given criteria
   */
  matches(resource: string, action: string, scope: string = 'global'): boolean {
    return (
      this.resource === resource &&
      this.action === action &&
      this.scope === scope &&
      this.isActive
    );
  }

  /**
   * Check if this permission is more restrictive than another
   */
  isMoreRestrictiveThan(other: Permission): boolean {
    if (this.resource !== other.resource || this.action !== other.action) {
      return false;
    }

    const scopeHierarchy = ['own', 'program', 'global'];
    const thisIndex = scopeHierarchy.indexOf(this.scope);
    const otherIndex = scopeHierarchy.indexOf(other.scope);

    return thisIndex < otherIndex;
  }

  /**
   * Validate permission structure
   */
  isValid(): boolean {
    const validActions = ['create', 'read', 'update', 'delete', 'approve', 'reject'];
    const validScopes = ['own', 'program', 'global'];
    const validResources = ['users', 'roles', 'permissions', 'resources', 'reservations', 'reports'];

    return (
      this.name.length > 0 &&
      validResources.includes(this.resource) &&
      validActions.includes(this.action) &&
      validScopes.includes(this.scope)
    );
  }

  /**
   * Get permission display name for UI
   */
  getDisplayName(): string {
    const actionMap: Record<string, string> = {
      create: 'Crear',
      read: 'Ver',
      update: 'Editar',
      delete: 'Eliminar',
      approve: 'Aprobar',
      reject: 'Rechazar',
    };

    const resourceMap: Record<string, string> = {
      users: 'Usuarios',
      roles: 'Roles',
      permissions: 'Permisos',
      resources: 'Recursos',
      reservations: 'Reservas',
      reports: 'Reportes',
    };

    const scopeMap: Record<string, string> = {
      own: 'Propios',
      program: 'Del Programa',
      global: 'Globales',
    };

    return `${actionMap[this.action] || this.action} ${resourceMap[this.resource] || this.resource} ${scopeMap[this.scope] || this.scope}`;
  }
}
