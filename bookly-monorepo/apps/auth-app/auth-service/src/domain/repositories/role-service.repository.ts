import { IRole } from '../interfaces/role.interface';

/**
 * Interface for the RoleService repository
 * This defines how auth-service will interact with roles-service
 */
export interface RoleServiceRepository {
  findById(id: string): Promise<IRole | null>;
  findByName(name: string): Promise<IRole | null>;
  findAll(): Promise<IRole[]>;
  create(role: Omit<IRole, 'id'>): Promise<IRole>;
  update(id: string, role: Partial<IRole>): Promise<IRole | null>;
  delete(id: string): Promise<boolean>;
  addPermission(roleId: string, permission: string): Promise<IRole | null>;
  removePermission(roleId: string, permission: string): Promise<IRole | null>;
}
