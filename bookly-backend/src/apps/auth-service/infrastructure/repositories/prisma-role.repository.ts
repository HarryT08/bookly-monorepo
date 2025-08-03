import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { Role } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    return role ? this.toDomain(role) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { name },
    });
    return role ? this.toDomain(role) : null;
  }

  async findAll(page = 1, limit = 10, search?: string): Promise<{
    roles: Role[];
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      roles: roles.map(role => this.toDomain(role)),
      total,
    };
  }

  async create(role: Role): Promise<Role> {
    const created = await this.prisma.role.create({
      data: {
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isActive: role.isActive,
      },
    });
    return this.toDomain(created);
  }

  async update(id: string, role: Partial<Role>): Promise<Role> {
    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        ...(role.name && { name: role.name }),
        ...(role.description !== undefined && { description: role.description }),
        ...(role.permissions && { permissions: role.permissions }),
        ...(role.isActive !== undefined && { isActive: role.isActive }),
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({
      where: { id },
    });
  }

  async findActiveRoles(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return roles.map(role => this.toDomain(role));
  }

  private toDomain(role: any): Role {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
