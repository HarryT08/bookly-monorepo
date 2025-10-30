/**
 * Role Utilities for Bookly System
 * 
 * Provides utility functions for role management, permission checking,
 * and access control throughout the Bookly application.
 * 
 * @author Bookly Development Team
 * @version 1.0.0
 */

import { 
  UserRole, 
  RoleCategory, 
  PermissionScope, 
  SystemResource, 
  SystemAction,
  ROLE_HIERARCHY,
  ROLE_CATEGORY_MAP,
  DEFAULT_ROLE_PERMISSIONS
} from '../enums/user-role.enum';

/**
 * Role utility class with static methods for role management
 */
export class RoleUtils {
  
  /**
   * Get all available user roles
   */
  static getAllRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  /**
   * Get role display name (Spanish name for UI)
   */
  static getRoleDisplayName(role: UserRole): string {
    return role; // The enum value is already the Spanish display name
  }

  /**
   * Get role category
   */
  static getRoleCategory(role: UserRole): RoleCategory {
    return ROLE_CATEGORY_MAP[role];
  }

  /**
   * Get role hierarchy level
   */
  static getRoleLevel(role: UserRole): number {
    return ROLE_HIERARCHY[role];
  }

  /**
   * Check if a role has higher or equal hierarchy than another
   */
  static hasHigherOrEqualLevel(userRole: UserRole, requiredRole: UserRole): boolean {
    return this.getRoleLevel(userRole) >= this.getRoleLevel(requiredRole);
  }

  /**
   * Check if user roles include any of the required roles
   */
  static hasAnyRole(userRoles: string[], requiredRoles: UserRole[]): boolean {
    const requiredRoleNames = requiredRoles.map(role => role.toString());
    return userRoles.some(role => requiredRoleNames.includes(role));
  }

  /**
   * Check if user has specific role
   */
  static hasRole(userRoles: string[], targetRole: UserRole): boolean {
    return userRoles.includes(targetRole.toString());
  }

  /**
   * Get default permissions for a role
   */
  static getDefaultPermissions(role: UserRole): string[] {
    return DEFAULT_ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if a role has a specific permission
   */
  static hasPermission(
    role: UserRole, 
    resource: SystemResource | string, 
    action: SystemAction | string, 
    scope: PermissionScope | string = PermissionScope.GLOBAL
  ): boolean {
    const permissionString = `${resource}:${action}:${scope}`;
    const rolePermissions = this.getDefaultPermissions(role);
    return rolePermissions.includes(permissionString);
  }

  /**
   * Get roles by category
   */
  static getRolesByCategory(category: RoleCategory): UserRole[] {
    return Object.entries(ROLE_CATEGORY_MAP)
      .filter(([_, roleCategory]) => roleCategory === category)
      .map(([role, _]) => role as UserRole);
  }

  /**
   * Get administrative roles (can manage resources)
   */
  static getAdministrativeRoles(): UserRole[] {
    return [UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN];
  }

  /**
   * Get academic roles (students and teachers)
   */
  static getAcademicRoles(): UserRole[] {
    return [UserRole.STUDENT, UserRole.TEACHER];
  }

  /**
   * Check if role is administrative
   */
  static isAdministrative(role: UserRole): boolean {
    return this.getAdministrativeRoles().includes(role);
  }

  /**
   * Check if role is academic
   */
  static isAcademic(role: UserRole): boolean {
    return this.getAcademicRoles().includes(role);
  }

  /**
   * Check if role can modify resources
   */
  static canModifyResources(role: UserRole): boolean {
    return this.hasPermission(role, SystemResource.RESOURCES, SystemAction.UPDATE) ||
           this.hasPermission(role, SystemResource.RESOURCES, SystemAction.CREATE) ||
           this.hasPermission(role, SystemResource.RESOURCES, SystemAction.DELETE);
  }

  /**
   * Check if role can approve reservations
   */
  static canApproveReservations(role: UserRole): boolean {
    return this.hasPermission(role, SystemResource.RESERVATIONS, SystemAction.APPROVE);
  }

  /**
   * Get roles that can access a specific resource with action
   */
  static getRolesWithAccess(
    resource: SystemResource | string, 
    action: SystemAction | string, 
    scope: PermissionScope | string = PermissionScope.GLOBAL
  ): UserRole[] {
    return this.getAllRoles().filter(role => 
      this.hasPermission(role, resource, action, scope)
    );
  }

  /**
   * Filter user data based on role permissions
   */
  static filterUserQuery(userRole: UserRole, userId: string, query: any): any {
    // Students and teachers can only see their own data
    if (userRole === UserRole.STUDENT || userRole === UserRole.TEACHER) {
      return { ...query, userId };
    }
    
    // Administrators can see all data
    return query;
  }

  /**
   * Get role-based route mapping for API documentation
   */
  static getRoleRouteMap(): Record<UserRole, string[]> {
    return {
      [UserRole.STUDENT]: [
        'GET /reservations/my',
        'POST /reservations',
        'PUT /reservations/:id',
        'DELETE /reservations/:id',
        'GET /resources',
        'GET /reports/my'
      ],
      [UserRole.TEACHER]: [
        'GET /reservations/my',
        'POST /reservations',
        'PUT /reservations/:id',
        'DELETE /reservations/:id',
        'POST /reservations/:id/approve',
        'GET /resources',
        'GET /reports/program',
        'GET /users/program'
      ],
      [UserRole.GENERAL_ADMIN]: [
        'GET /users',
        'POST /users',
        'PUT /users/:id',
        'DELETE /users/:id',
        'GET /roles',
        'POST /roles',
        'PUT /roles/:id',
        'DELETE /roles/:id',
        'GET /resources',
        'POST /resources',
        'PUT /resources/:id',
        'DELETE /resources/:id',
        'GET /reservations',
        'POST /reservations',
        'PUT /reservations/:id',
        'DELETE /reservations/:id',
        'POST /reservations/:id/approve',
        'POST /reservations/:id/reject',
        'GET /reports',
        'POST /reports',
        'GET /audit'
      ],
      [UserRole.PROGRAM_ADMIN]: [
        'GET /users/program',
        'PUT /users/:id',
        'GET /resources/program',
        'POST /resources',
        'PUT /resources/:id',
        'GET /reservations/program',
        'PUT /reservations/:id',
        'POST /reservations/:id/approve',
        'POST /reservations/:id/reject',
        'GET /reports/program',
        'POST /reports'
      ],
      [UserRole.SECURITY]: [
        'GET /reservations',
        'GET /users',
        'GET /resources',
        'GET /audit'
      ],
      [UserRole.GENERAL_STAFF]: [
        'GET /reservations',
        'PUT /reservations/:id',
        'GET /resources',
        'PUT /resources/:id',
        'GET /reports',
        'POST /reports'
      ]
    };
  }

  /**
   * Validate role assignment based on user context
   */
  static validateRoleAssignment(
    assignerRole: UserRole,
    targetRole: UserRole,
    programContext?: string
  ): boolean {
    // General admins can assign any role
    if (assignerRole === UserRole.GENERAL_ADMIN) {
      return true;
    }

    // Program admins can only assign roles within their program and lower hierarchy
    if (assignerRole === UserRole.PROGRAM_ADMIN) {
      const assignerLevel = this.getRoleLevel(assignerRole);
      const targetLevel = this.getRoleLevel(targetRole);
      
      // Can only assign roles with lower hierarchy
      return targetLevel < assignerLevel && programContext !== undefined;
    }

    // Other roles cannot assign roles
    return false;
  }

  /**
   * Get role description for documentation
   */
  static getRoleDescription(role: UserRole): string {
    const descriptions: Record<UserRole, string> = {
      [UserRole.STUDENT]: 'Estudiante universitario con permisos básicos para crear y gestionar sus propias reservas',
      [UserRole.TEACHER]: 'Docente universitario con permisos para aprobar reservas y acceder a datos del programa',
      [UserRole.GENERAL_ADMIN]: 'Administrador general con acceso completo al sistema',
      [UserRole.PROGRAM_ADMIN]: 'Administrador de programa académico con permisos específicos para su programa',
      [UserRole.SECURITY]: 'Personal de vigilancia con permisos de monitoreo y control de acceso',
      [UserRole.GENERAL_STAFF]: 'Personal administrativo general con permisos operativos'
    };

    return descriptions[role];
  }
}

/**
 * Permission builder utility for creating permission strings
 */
export class PermissionBuilder {
  
  /**
   * Build permission string
   */
  static build(
    resource: SystemResource | string,
    action: SystemAction | string,
    scope: PermissionScope | string = PermissionScope.GLOBAL
  ): string {
    return `${resource}:${action}:${scope}`;
  }

  /**
   * Parse permission string
   */
  static parse(permission: string): {
    resource: string;
    action: string;
    scope: string;
  } {
    const [resource, action, scope] = permission.split(':');
    return { resource, action, scope };
  }

  /**
   * Validate permission format
   */
  static isValid(permission: string): boolean {
    const parts = permission.split(':');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }
}
