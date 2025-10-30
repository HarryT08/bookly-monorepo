import { Permission } from '../entities/user.entity';

export abstract class PermissionRepository {
  abstract create(permission: Permission): Promise<Permission>;
  abstract findById(id: string): Promise<Permission | null>;
  abstract findByName(name: string): Promise<Permission | null>;
  abstract findByResourceAndAction(resource: string, action: string, scope?: string): Promise<Permission[]>;
  abstract findAll(filters?: {
    resource?: string;
    action?: string;
    scope?: string;
    isActive?: boolean;
  }): Promise<Permission[]>;
  abstract update(id: string, data: Partial<Permission>): Promise<Permission>;
  abstract delete(id: string): Promise<void>;
  abstract findByIds(ids: string[]): Promise<Permission[]>;
  abstract createMany(permissions: Permission[]): Promise<Permission[]>;
  abstract findActivePermissions(): Promise<Permission[]>;
}
