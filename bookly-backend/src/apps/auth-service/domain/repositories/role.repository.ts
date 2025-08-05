import { RolePermission } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity';
import { UserEntity } from '../entities/user.entity';

export abstract class RoleRepository {
  abstract findById(id: string): Promise<RoleEntity | null>;
  abstract findByIdWithPermissions(id: string): Promise<RoleEntity | null>;
  abstract findByName(name: string): Promise<RoleEntity | null>;
  abstract findByNameWithPermissions(name: string): Promise<RoleEntity | null>;
  abstract findAll(page?: number, limit?: number, search?: string): Promise<{
    roles: RoleEntity[];
    total: number;
  }>;
  abstract findAllWithPermissions(page?: number, limit?: number, search?: string, category?: string): Promise<{
    roles: RoleEntity[];
    total: number;
  }>;
  abstract create(role: RoleEntity): Promise<RoleEntity>;
  abstract update(id: string, role: Partial<RoleEntity>): Promise<RoleEntity>;
  abstract delete(id: string): Promise<void>;
  abstract findActiveRoles(): Promise<RoleEntity[]>;
  abstract findPredefinedRoles(): Promise<RoleEntity[]>;
  abstract findCustomRoles(): Promise<RoleEntity[]>;
  abstract addPermissionToRole(roleId: string, permissionId: string, grantedBy?: string): Promise<RolePermission>;
  abstract removePermissionFromRole(roleId: string, permissionId: string): Promise<void>;
  abstract findRolePermissions(roleId: string): Promise<RolePermission[]>;
  abstract findByCategory(category: string): Promise<RoleEntity[]>;
  abstract bulkCreate(roles: RoleEntity[]): Promise<RoleEntity[]>;
  abstract assignPermission(roleId: string, permissionId: string): Promise<void>;
  abstract removePermission(roleId: string, permissionId: string): Promise<void>;
  abstract findUsersWithRole(roleId: string): Promise<UserEntity[]>;
}
