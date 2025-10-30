import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { PermissionRepository } from '../../domain/repositories/permission.repository';
import { Permission } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaPermissionRepository extends PermissionRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async create(permission: Permission): Promise<Permission> {
    const created = await this.prisma.permission.create({
      data: {
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        scope: permission.scope,
        conditions: permission.conditions,
        description: permission.description,
        isActive: permission.isActive,
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    return permission ? this.mapToEntity(permission) : null;
  }

  async findByName(name: string): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({
      where: { name },
    });

    return permission ? this.mapToEntity(permission) : null;
  }

  async findByResourceAndAction(
    resource: string,
    action: string,
    scope?: string,
  ): Promise<Permission[]> {
    const where: any = {
      resource,
      action,
      isActive: true,
    };

    if (scope) {
      where.scope = scope;
    }

    const permissions = await this.prisma.permission.findMany({
      where,
      orderBy: { scope: 'asc' },
    });

    return permissions.map(this.mapToEntity);
  }

  async findAll(filters?: {
    resource?: string;
    action?: string;
    scope?: string;
    isActive?: boolean;
  }): Promise<Permission[]> {
    const where: any = {};

    if (filters) {
      if (filters.resource) where.resource = filters.resource;
      if (filters.action) where.action = filters.action;
      if (filters.scope) where.scope = filters.scope;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;
    }

    const permissions = await this.prisma.permission.findMany({
      where,
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' },
        { scope: 'asc' },
      ],
    });

    return permissions.map(this.mapToEntity);
  }

  async update(id: string, data: Partial<Permission>): Promise<Permission> {
    const updated = await this.prisma.permission.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.resource && { resource: data.resource }),
        ...(data.action && { action: data.action }),
        ...(data.scope && { scope: data.scope }),
        ...(data.conditions !== undefined && { conditions: data.conditions }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date(),
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.permission.delete({
      where: { id },
    });
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      where: {
        id: { in: ids },
        isActive: true,
      },
    });

    return permissions.map(this.mapToEntity);
  }

  async createMany(permissions: Permission[]): Promise<Permission[]> {
    const data = permissions.map(p => ({
      name: p.name,
      resource: p.resource,
      action: p.action,
      scope: p.scope,
      conditions: p.conditions,
      description: p.description,
      isActive: p.isActive,
    }));

    await this.prisma.permission.createMany({
      data,
    });

    // Return the created permissions
    const names = permissions.map(p => p.name);
    const created = await this.prisma.permission.findMany({
      where: {
        name: { in: names },
      },
    });

    return created.map(this.mapToEntity);
  }

  async findActivePermissions(): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      where: { isActive: true },
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' },
        { scope: 'asc' },
      ],
    });

    return permissions.map(this.mapToEntity);
  }

  private mapToEntity(permission: any): Permission {
    return {
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      scope: permission.scope,
      conditions: permission.conditions,
      description: permission.description,
      isActive: permission.isActive,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }
}
