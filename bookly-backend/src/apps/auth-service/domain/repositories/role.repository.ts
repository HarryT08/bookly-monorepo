import { Role } from '../entities/user.entity';

export abstract class RoleRepository {
  abstract findById(id: string): Promise<Role | null>;
  abstract findByName(name: string): Promise<Role | null>;
  abstract findAll(page?: number, limit?: number, search?: string): Promise<{
    roles: Role[];
    total: number;
  }>;
  abstract create(role: Role): Promise<Role>;
  abstract update(id: string, role: Partial<Role>): Promise<Role>;
  abstract delete(id: string): Promise<void>;
  abstract findActiveRoles(): Promise<Role[]>;
}
