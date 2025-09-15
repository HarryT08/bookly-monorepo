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
    public code: string,
    public description: string,
    public category: string, // Keep as category for Prisma compatibility
    public isActive: boolean = true,
    public isPredefined: boolean = false,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public createdBy: string,
    public permissions: string[] = [],
    public programId: string | undefined = undefined,
    public metadata: Record<string, any> | undefined = undefined,
    public rolePermissions?: RolePermissionWithPermission[],
  ) {}

  // Getter for categoryCode to maintain backward compatibility
  get categoryCode(): string {
    return this.category;
  }

  // Setter for categoryCode to maintain backward compatibility
  set categoryCode(value: string) {
    this.category = value;
  }

  // Getter for isDefault to maintain backward compatibility
  get isDefault(): boolean {
    return this.isPredefined;
  }

  // Setter for isDefault to maintain backward compatibility
  set isDefault(value: boolean) {
    this.isPredefined = value;
  }

  // Predefined roles using category codes from unified Category model
  static readonly ADMIN_GENERAL = new RoleEntity('1', 'Administrador General', 'ADMIN_GENERAL', 'Administrador con acceso completo al sistema', 'ADMINISTRATIVO', true, true, new Date(), new Date(), 'system');
  static readonly ADMIN_PROGRAMA = new RoleEntity('2', 'Administrador de Programa', 'ADMIN_PROGRAMA', 'Administrador de programa académico específico', 'ADMINISTRATIVO', true, true, new Date(), new Date(), 'system');
  static readonly DOCENTE = new RoleEntity('3', 'Docente', 'DOCENTE', 'Profesor con permisos de reserva y consulta', 'ACADEMICO', true, true, new Date(), new Date(), 'system');
  static readonly ESTUDIANTE = new RoleEntity('4', 'Estudiante', 'ESTUDIANTE', 'Estudiante con permisos básicos de consulta', 'ACADEMICO', true, true, new Date(), new Date(), 'system');
  static readonly VIGILANTE = new RoleEntity('5', 'Vigilante', 'VIGILANTE', 'Personal de seguridad con acceso a control de reservas', 'SEGURIDAD', true, true, new Date(), new Date(), 'system');
  static readonly INVITADO = new RoleEntity('6', 'Invitado', 'INVITADO', 'Usuario externo con permisos limitados', 'ACADEMICO', true, true, new Date(), new Date(), 'system');

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
      name.toUpperCase().replace(/\s+/g, '_'), // Generate code from name
      description || '',
      category || 'ACADEMICO', // Use category code instead of enum
      true, // isActive
      isPredefined,
      new Date(),
      new Date(),
      createdBy || 'system',
    );
  }

  /**
   * Create predefined roles for the system using standardized role definitions
   */
  static createPredefinedRoles(): RoleEntity[] {
    return [
      RoleEntity.ADMIN_GENERAL,
      RoleEntity.ADMIN_PROGRAMA,
      RoleEntity.DOCENTE,
      RoleEntity.ESTUDIANTE,
      RoleEntity.VIGILANTE,
      RoleEntity.INVITADO,
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
        rp.permission!.updatedAt
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
