import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { Role } from '../../domain/entities/user.entity';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async findById(id: string): Promise<Role | null> {
    return this.roleRepository.findById(id);
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findByName(name);
  }

  async findAll(page = 1, limit = 10, search?: string): Promise<{
    roles: Role[];
    total: number;
  }> {
    return this.roleRepository.findAll(page, limit, search);
  }

  async create(role: Role): Promise<Role> {
    return this.roleRepository.create(role);
  }

  async update(id: string, role: Partial<Role>): Promise<Role> {
    return this.roleRepository.update(id, role);
  }

  async delete(id: string): Promise<void> {
    return this.roleRepository.delete(id);
  }

  async findActiveRoles(): Promise<Role[]> {
    return this.roleRepository.findActiveRoles();
  }
}
