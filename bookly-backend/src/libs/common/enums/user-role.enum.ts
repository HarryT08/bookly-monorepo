/**
 * Standardized User Roles for Bookly System
 * 
 * This enum provides English constants that map to Spanish role names in the database.
 * It ensures consistent role usage across all services and endpoints.
 * 
 * @author Bookly Development Team
 * @version 1.0.0
 */

/**
 * User Role Enum - Maps English constants to Spanish database names
 * 
 * These roles control access to resources, endpoints, and functions throughout Bookly.
 * Each role has specific permissions defined in the permission system.
 */
export enum UserRole {
  /** Student - Basic user with limited permissions for own reservations */
  STUDENT = 'Estudiante',
  
  /** Teacher - Academic staff with program-level permissions */
  TEACHER = 'Docente',
  
  /** General Administrator - Full system access and control */
  GENERAL_ADMIN = 'Administrador General',
  
  /** Program Administrator - Administrative control over specific academic programs */
  PROGRAM_ADMIN = 'Administrador de Programa',
  
  /** Security/Guard - Access control and monitoring permissions */
  SECURITY = 'Vigilante',
  
  /** General Staff - Administrative staff with operational permissions */
  GENERAL_STAFF = 'Administrativo General'
}

/**
 * Role Categories for grouping and UI display
 */
export enum RoleCategory {
  ACADEMIC = 'academic',
  ADMINISTRATIVE = 'administrative', 
  SECURITY = 'security'
}

/**
 * Permission Scopes for granular access control
 */
export enum PermissionScope {
  /** Global access across all resources and programs */
  GLOBAL = 'global',
  
  /** Access limited to specific academic program */
  PROGRAM = 'program',
  
  /** Access limited to user's own resources/data */
  OWN = 'own'
}

/**
 * Standard Resources in the Bookly system
 */
export enum SystemResource {
  USERS = 'users',
  ROLES = 'roles', 
  PERMISSIONS = 'permissions',
  RESOURCES = 'resources',
  RESERVATIONS = 'reservations',
  REPORTS = 'reports',
  APPROVAL_FLOWS = 'approval-flows',
  NOTIFICATIONS = 'notifications',
  CALENDAR = 'calendar',
  AUDIT = 'audit'
}

/**
 * Standard Actions for permission system
 */
export enum SystemAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update', 
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  IMPORT = 'import'
}

/**
 * Role hierarchy levels for access control logic
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.STUDENT]: 1,
  [UserRole.TEACHER]: 2,
  [UserRole.GENERAL_STAFF]: 3,
  [UserRole.SECURITY]: 3,
  [UserRole.PROGRAM_ADMIN]: 4,
  [UserRole.GENERAL_ADMIN]: 5
};

/**
 * Role to Category mapping
 */
export const ROLE_CATEGORY_MAP: Record<UserRole, RoleCategory> = {
  [UserRole.STUDENT]: RoleCategory.ACADEMIC,
  [UserRole.TEACHER]: RoleCategory.ACADEMIC,
  [UserRole.GENERAL_ADMIN]: RoleCategory.ADMINISTRATIVE,
  [UserRole.PROGRAM_ADMIN]: RoleCategory.ADMINISTRATIVE,
  [UserRole.SECURITY]: RoleCategory.SECURITY,
  [UserRole.GENERAL_STAFF]: RoleCategory.ADMINISTRATIVE
};

/**
 * Default permissions for each role
 * Format: resource:action:scope
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.STUDENT]: [
    'reservations:create:own',
    'reservations:read:own',
    'reservations:update:own',
    'reservations:delete:own',
    'resources:read:global',
    'reports:read:own',
    'calendar:read:global'
  ],
  
  [UserRole.TEACHER]: [
    'reservations:create:own',
    'reservations:read:own',
    'reservations:update:own', 
    'reservations:delete:own',
    'reservations:approve:program',
    'resources:read:global',
    'reports:read:program',
    'users:read:program',
    'calendar:read:global',
    'calendar:update:program'
  ],
  
  [UserRole.GENERAL_ADMIN]: [
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
    'reports:export:global',
    'approval-flows:create:global',
    'approval-flows:read:global',
    'approval-flows:update:global',
    'approval-flows:delete:global',
    'notifications:create:global',
    'notifications:read:global',
    'notifications:update:global',
    'notifications:delete:global',
    'calendar:create:global',
    'calendar:read:global',
    'calendar:update:global',
    'calendar:delete:global',
    'audit:read:global'
  ],
  
  [UserRole.PROGRAM_ADMIN]: [
    'users:read:program',
    'users:update:program',
    'roles:read:program',
    'resources:read:program',
    'resources:update:program',
    'resources:create:program',
    'reservations:read:program',
    'reservations:update:program',
    'reservations:approve:program',
    'reservations:reject:program',
    'reports:read:program',
    'reports:create:program',
    'reports:export:program',
    'approval-flows:read:program',
    'approval-flows:update:program',
    'notifications:read:program',
    'notifications:create:program',
    'calendar:read:program',
    'calendar:update:program',
    'audit:read:program'
  ],
  
  [UserRole.SECURITY]: [
    'reservations:read:global',
    'users:read:global',
    'resources:read:global',
    'calendar:read:global',
    'audit:read:global'
  ],
  
  [UserRole.GENERAL_STAFF]: [
    'reservations:read:global',
    'reservations:update:global',
    'resources:read:global',
    'resources:update:global',
    'reports:read:global',
    'reports:create:global',
    'calendar:read:global',
    'calendar:update:global',
    'notifications:read:global',
    'notifications:create:global'
  ]
};
