import { Role, Permission, RolePermission } from '@prisma/client';
import { PermissionEntity } from './permission.entity';

// Extended type for RolePermission with nested permission
type RolePermissionWithPermission = RolePermission & {
  permission?: Permission;
};

export class RoleEntity implements Role {
  constructor(
    public id: string,
    public name: string,
    public description: string | undefined = undefined,
    public isActive: boolean = true,
    public isPredefined: boolean = false,
    public category: string | undefined = undefined,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public createdBy: string | undefined = undefined,
    public rolePermissions?: RolePermissionWithPermission[],
  ) {}

  static create(
    name: string,
    description?: string,
    category?: string,
    createdBy?: string,
    isPredefined: boolean = false,
  ): RoleEntity {
    return new RoleEntity(
      '', // ID will be set by database
      name,
      description,
      true,
      isPredefined,
      category,
      new Date(),
      new Date(),
      createdBy,
      [],
    );
  }

  /**
   * Create predefined roles for the system
   */
  static createPredefinedRoles(): RoleEntity[] {
    return [
      new RoleEntity('', 'Estudiante', 'Estudiante universitario', true, true, 'STUDENT'),
      new RoleEntity('', 'Docente', 'Docente universitario', true, true, 'TEACHER'),
      new RoleEntity('', 'Administrador General', 'Administrador con acceso completo', true, true, 'ADMIN'),
      new RoleEntity('', 'Administrador de Programa', 'Administrador de programa académico', true, true, 'ADMIN'),
      new RoleEntity('', 'Vigilante', 'Personal de vigilancia', true, true, 'GUARD'),
      new RoleEntity('', 'Administrativo General', 'Personal administrativo general', true, true, 'ADMINISTRATIVE'),
    ];
  }

  /**
   * Check if role can be edited or deleted
   */
  canBeModified(): boolean {
    return !this.isPredefined;
  }

  /**
   * Get all permissions for this role
   */
  getPermissions(): PermissionEntity[] {
    if (!this.rolePermissions) return [];
    
    return this.rolePermissions
      .filter(rp => rp.permission && rp.permission.isActive)
      .map(rp => new PermissionEntity(
        rp.permission!.id,
        rp.permission!.name,
        rp.permission!.resource,
        rp.permission!.action,
        rp.permission!.scope,
        rp.permission!.conditions,
        rp.permission!.description,
        rp.permission!.isActive,
        rp.permission!.createdAt,
        rp.permission!.updatedAt,
      ));
  }

  /**
   * Check if role has a specific permission
   */
  hasPermission(resource: string, action: string, scope: string = 'global'): boolean {
    return this.rolePermissions?.some(rp => 
      rp.permission?.resource === resource &&
      rp.permission?.action === action &&
      rp.permission?.scope === scope &&
      rp.permission?.isActive
    ) || false;
  }

  /**
   * Add permission to role
   */
  addPermission(permission: Permission, grantedBy?: string): void {
    if (!this.rolePermissions) {
      this.rolePermissions = [];
    }

    // Check if permission already exists
    const exists = this.rolePermissions.some(rp => rp.permissionId === permission.id);
    if (!exists) {
      const rolePermission: RolePermissionWithPermission = {
        id: '', // Will be set by database
        roleId: this.id,
        permissionId: permission.id,
        grantedAt: new Date(),
        grantedBy: grantedBy || '',
        permission,
      };
      this.rolePermissions.push(rolePermission);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove permission from role
   */
  removePermission(permissionId: string): void {
    if (this.rolePermissions) {
      this.rolePermissions = this.rolePermissions.filter(rp => rp.permissionId !== permissionId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Get default predefined roles for the system
   */
  static getDefaultRoles(): Array<{
    name: string;
    description: string;
    category: string;
  }> {
    return [
      {
        name: 'Estudiante',
        description: 'Estudiante con permisos básicos para reservar recursos',
        category: 'academic',
      },
      {
        name: 'Docente',
        description: 'Docente con permisos para reservar y gestionar recursos académicos',
        category: 'academic',
      },
      {
        name: 'Administrador General',
        description: 'Administrador con acceso completo al sistema',
        category: 'administrative',
      },
      {
        name: 'Administrador de Programa',
        description: 'Administrador con permisos específicos para su programa académico',
        category: 'administrative',
      },
      {
        name: 'Vigilante',
        description: 'Personal de vigilancia con permisos de control de acceso',
        category: 'security',
      },
      {
        name: 'Administrativo General',
        description: 'Personal administrativo con permisos operativos',
        category: 'administrative',
      },
    ];
  }

  /**
   * Get role display name for UI
   */
  getDisplayName(): string {
    return this.name;
  }

  /**
   * Get role category display name
   */
  getCategoryDisplayName(): string {
    const categoryMap: Record<string, string> = {
      STUDENT: 'Estudiante',
      TEACHER: 'Docente',
      ADMIN: 'Administrador',
      GUARD: 'Vigilante',
      ADMINISTRATIVE: 'Administrativo',
    };

    return categoryMap[this.category || ''] || this.category || 'Sin categoría';
  }

  /**
   * Validate role data
   */
  isValid(): boolean {
    const validCategories = ['STUDENT', 'TEACHER', 'ADMIN', 'GUARD', 'ADMINISTRATIVE'];
    
    return (
      this.name.length > 0 &&
      this.name.length <= 100 &&
      (!this.category || validCategories.includes(this.category)) &&
      (!this.description || this.description.length <= 500)
    );
  }

  /**
   * Get default permissions for predefined roles
   */
  static getDefaultPermissionsForRole(roleName: string): string[] {
    const defaultPermissions: Record<string, string[]> = {
      'Estudiante': [
        'reservations:create:own',
        'reservations:read:own',
        'reservations:update:own',
        'reservations:delete:own',
        'resources:read:global',
        'reports:read:own',
      ],
      'Docente': [
        'reservations:create:own',
        'reservations:read:own',
        'reservations:update:own',
        'reservations:delete:own',
        'reservations:approve:program',
        'resources:read:global',
        'reports:read:program',
        'users:read:program',
      ],
      'Administrador General': [
        'users:create:global',
        'users:read:global',
        'users:update:global',
        'users:delete:global',
        'roles:create:global',
        'roles:read:global',
        'roles:update:global',
        'roles:delete:global',
        'permissions:create:global',
        'permissions:read:global',
        'permissions:update:global',
        'permissions:delete:global',
        'resources:create:global',
        'resources:read:global',
        'resources:update:global',
        'resources:delete:global',
        'reservations:create:global',
        'reservations:read:global',
        'reservations:update:global',
        'reservations:delete:global',
        'reservations:approve:global',
        'reservations:reject:global',
        'reports:read:global',
        'reports:create:global',
      ],
      'Administrador de Programa': [
        'users:read:program',
        'users:update:program',
        'roles:read:program',
        'resources:read:program',
        'resources:update:program',
        'reservations:read:program',
        'reservations:update:program',
        'reservations:approve:program',
        'reservations:reject:program',
        'reports:read:program',
        'reports:create:program',
      ],
      'Vigilante': [
        'reservations:read:global',
        'users:read:global',
        'resources:read:global',
      ],
      'Administrativo General': [
        'reservations:read:global',
        'reservations:update:global',
        'resources:read:global',
        'resources:update:global',
        'reports:read:global',
        'reports:create:global',
      ],
    };

    return defaultPermissions[roleName] || [];
  }
}
