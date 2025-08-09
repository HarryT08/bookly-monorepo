import { Role, Permission, RolePermission } from '@prisma/client';
import { PermissionEntity } from './permission.entity';
import { 
  UserRole, 
  RoleCategory, 
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_CATEGORY_MAP 
} from '@libs/common';

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
   * Create predefined roles for the system using standardized role definitions
   */
  static createPredefinedRoles(): RoleEntity[] {
    return [
      new RoleEntity('', UserRole.STUDENT, 'Estudiante universitario', true, true, ROLE_CATEGORY_MAP[UserRole.STUDENT]),
      new RoleEntity('', UserRole.TEACHER, 'Docente universitario', true, true, ROLE_CATEGORY_MAP[UserRole.TEACHER]),
      new RoleEntity('', UserRole.GENERAL_ADMIN, 'Administrador con acceso completo', true, true, ROLE_CATEGORY_MAP[UserRole.GENERAL_ADMIN]),
      new RoleEntity('', UserRole.PROGRAM_ADMIN, 'Administrador de programa académico', true, true, ROLE_CATEGORY_MAP[UserRole.PROGRAM_ADMIN]),
      new RoleEntity('', UserRole.SECURITY, 'Personal de vigilancia', true, true, ROLE_CATEGORY_MAP[UserRole.SECURITY]),
      new RoleEntity('', UserRole.GENERAL_STAFF, 'Personal administrativo general', true, true, ROLE_CATEGORY_MAP[UserRole.GENERAL_STAFF]),
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
   * Get default predefined roles for the system using standardized definitions
   */
  static getDefaultRoles(): Array<{
    name: string;
    description: string;
    category: string;
  }> {
    return [
      {
        name: UserRole.STUDENT,
        description: 'Estudiante universitario con permisos básicos',
        category: ROLE_CATEGORY_MAP[UserRole.STUDENT],
      },
      {
        name: UserRole.TEACHER,
        description: 'Docente universitario con permisos académicos',
        category: ROLE_CATEGORY_MAP[UserRole.TEACHER],
      },
      {
        name: UserRole.GENERAL_ADMIN,
        description: 'Administrador con acceso completo al sistema',
        category: ROLE_CATEGORY_MAP[UserRole.GENERAL_ADMIN],
      },
      {
        name: UserRole.PROGRAM_ADMIN,
        description: 'Administrador con permisos específicos para su programa académico',
        category: ROLE_CATEGORY_MAP[UserRole.PROGRAM_ADMIN],
      },
      {
        name: UserRole.SECURITY,
        description: 'Personal de vigilancia con permisos de control de acceso',
        category: ROLE_CATEGORY_MAP[UserRole.SECURITY],
      },
      {
        name: UserRole.GENERAL_STAFF,
        description: 'Personal administrativo con permisos operativos',
        category: ROLE_CATEGORY_MAP[UserRole.GENERAL_STAFF],
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
   * Get default permissions for predefined roles using standardized system
   */
  static getDefaultPermissionsForRole(roleName: string): string[] {
    // Use the standardized permission system
    const roleKey = Object.values(UserRole).find(role => role === roleName) as UserRole;
    return roleKey ? DEFAULT_ROLE_PERMISSIONS[roleKey] || [] : [];
  }
}
