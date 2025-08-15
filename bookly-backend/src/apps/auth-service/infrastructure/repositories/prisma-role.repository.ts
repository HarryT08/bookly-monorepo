import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { Role, RolePermission } from '../../domain/entities/user.entity';
import { RoleEntity } from '../../domain/entities/role.entity';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<RoleEntity | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    return role ? this.toDomain(role) : null;
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const role = await this.prisma.role.findUnique({
      where: { name },
    });
    return role ? this.toDomain(role) : null;
  }

  async findAll(page = 1, limit = 10, search?: string): Promise<{
    roles: RoleEntity[];
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

  async create(role: RoleEntity): Promise<RoleEntity> {
    const created = await this.prisma.role.create({
      data: {
        name: role.name,
        description: role.description,
        isActive: role.isActive,
        isPredefined: role.isPredefined,
        category: role.category,
        createdBy: role.createdBy,
      },
    });
    return this.toDomain(created);
  }

  async update(id: string, role: Partial<RoleEntity>): Promise<RoleEntity> {
    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        ...(role.name && { name: role.name }),
        ...(role.description !== undefined && { description: role.description }),
        ...(role.isActive !== undefined && { isActive: role.isActive }),
        ...(role.category !== undefined && { category: role.category }),
        updatedAt: new Date(),
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({
      where: { id },
    });
  }

  async findActiveRoles(): Promise<RoleEntity[]> {
    const roles = await this.prisma.role.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return roles.map(role => this.toDomain(role));
  }

  async findByIdWithPermissions(id: string): Promise<RoleEntity | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    return role ? this.toDomainWithPermissions(role) : null;
  }

  async findByNameWithPermissions(name: string): Promise<RoleEntity | null> {
    const role = await this.prisma.role.findUnique({
      where: { name },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    return role ? this.toDomainWithPermissions(role) : null;
  }

  async findAllWithPermissions(page?: number, limit?: number, search?: string, category?: string): Promise<{
    roles: RoleEntity[];
    total: number;
  }> {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: limit,
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      roles: roles.map(role => this.toDomainWithPermissions(role)),
      total,
    };
  }

  async findPredefinedRoles(): Promise<RoleEntity[]> {
    const roles = await this.prisma.role.findMany({
      where: { isPredefined: true, isActive: true },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return roles.map(role => this.toDomainWithPermissions(role));
  }

  async findCustomRoles(): Promise<RoleEntity[]> {
    const roles = await this.prisma.role.findMany({
      where: { isPredefined: false, isActive: true },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return roles.map(role => this.toDomainWithPermissions(role));
  }

  async addPermissionToRole(roleId: string, permissionId: string, grantedBy?: string): Promise<RolePermission> {
    const rolePermission = await this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
        grantedBy,
      },
      include: {
        permission: true,
      },
    });

    return {
      id: rolePermission.id,
      roleId: rolePermission.roleId,
      permissionId: rolePermission.permissionId,
      grantedAt: rolePermission.grantedAt,
      grantedBy: rolePermission.grantedBy,
      permission: rolePermission.permission ? {
        id: rolePermission.permission.id,
        name: rolePermission.permission.name,
        resource: rolePermission.permission.resource,
        action: rolePermission.permission.action,
        scope: rolePermission.permission.scope,
        conditions: rolePermission.permission.conditions,
        description: rolePermission.permission.description,
        isActive: rolePermission.permission.isActive,
        createdAt: rolePermission.permission.createdAt,
        updatedAt: rolePermission.permission.updatedAt,
      } : undefined,
    };
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId,
      },
    });
  }

  async findRolePermissions(roleId: string): Promise<RolePermission[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });

    return rolePermissions.map(rp => ({
      id: rp.id,
      roleId: rp.roleId,
      permissionId: rp.permissionId,
      grantedAt: rp.grantedAt,
      grantedBy: rp.grantedBy,
      permission: rp.permission ? {
        id: rp.permission.id,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
        scope: rp.permission.scope,
        conditions: rp.permission.conditions,
        description: rp.permission.description,
        isActive: rp.permission.isActive,
        createdAt: rp.permission.createdAt,
        updatedAt: rp.permission.updatedAt,
      } : undefined,
    }));
  }

  async findByCategory(category: string): Promise<RoleEntity[]> {
    const roles = await this.prisma.role.findMany({
      where: { category, isActive: true },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return roles.map(role => this.toDomainWithPermissions(role));
  }

  async bulkCreate(roles: RoleEntity[]): Promise<RoleEntity[]> {
    const data = roles.map(role => ({
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      isPredefined: role.isPredefined,
      category: role.category,
      createdBy: role.createdBy,
    }));

    await this.prisma.role.createMany({
      data,
    });

    // Return the created roles
    const names = roles.map(r => r.name);
    const created = await this.prisma.role.findMany({
      where: {
        name: { in: names },
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return created.map(role => this.toDomainWithPermissions(role));
  }

  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
        grantedAt: new Date(),
      },
    });
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId,
      },
    });
  }

  async findUsersWithRole(roleId: string): Promise<UserEntity[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { roleId },
      include: {
        user: true,
      },
    });

    return userRoles.map(ur => {
      const userEntity = new UserEntity(
        ur.user.id,
        ur.user.email,
        ur.user.username,
        ur.user.password,
        ur.user.firstName,
        ur.user.lastName,
        ur.user.isActive,
        ur.user.isEmailVerified,
        ur.user.emailVerificationToken,
        ur.user.passwordResetToken,
        ur.user.passwordResetExpires,
        ur.user.lastLoginAt,
        ur.user.loginAttempts,
        ur.user.lockedUntil,
        ur.user.ssoProvider,
        ur.user.ssoId,
        ur.user.createdAt,
        ur.user.updatedAt,
      );
      return userEntity;
    });
  }

  private toDomain(role: any): RoleEntity {
    return new RoleEntity(
      role.id,
      role.name,
      role.code || role.name.toUpperCase().replace(/\s+/g, '_'),
      role.description,
      role.category,
      role.isActive,
      role.isPredefined,
      role.createdAt,
      role.updatedAt,
      role.createdBy,
      [], // permissions array - will be populated separately if needed
      role.programId,
      role.metadata,
    );
  }

  private toDomainWithPermissions(role: any): RoleEntity {
    const roleEntity = new RoleEntity(
      role.id,
      role.name,
      role.code || role.name.toUpperCase().replace(/\s+/g, '_'),
      role.description,
      role.category,
      role.isActive,
      role.isPredefined,
      role.createdAt,
      role.updatedAt,
      role.createdBy,
      [], // permissions array - will be set below
      role.programId,
      role.metadata,
    );
    
    // Set role permissions
    roleEntity.rolePermissions = role.rolePermissions?.map((rp: any) => ({
      id: rp.id,
      roleId: rp.roleId,
      permissionId: rp.permissionId,
      grantedAt: rp.grantedAt,
      grantedBy: rp.grantedBy,
      permission: rp.permission ? {
        id: rp.permission.id,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
        scope: rp.permission.scope,
        conditions: rp.permission.conditions,
        description: rp.permission.description,
        isActive: rp.permission.isActive,
        createdAt: rp.permission.createdAt,
        updatedAt: rp.permission.updatedAt,
      } : undefined,
    })) || [];
    
    return roleEntity;
  }
}
