import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? this.toDomain(user) : null;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    return user ? this.toDomain(user) : null;
  }

  async findAll(page = 1, limit = 10, search?: string): Promise<{
    users: UserEntity[];
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { username: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map(user => this.toDomain(user)),
      total,
    };
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const created = await this.prisma.user.create({
      data: {
        email: user.email,
        username: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      },
    });
    return this.toDomain(created);
  }

  async update(id: string, user: Partial<UserEntity>): Promise<UserEntity> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(user.email && { email: user.email }),
        ...(user.username && { username: user.username }),
        ...(user.password && { password: user.password }),
        ...(user.firstName && { firstName: user.firstName }),
        ...(user.lastName && { lastName: user.lastName }),
        ...(user.isActive !== undefined && { isActive: user.isActive }),
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });
  }

  async findByIdWithRoles(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return user ? this.toDomainWithRoles(user) : null;
  }

  async findByEmailWithRoles(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return user ? this.toDomainWithRoles(user) : null;
  }

  private toDomain(user: any): UserEntity {
    return new UserEntity(
      user.id,
      user.email,
      user.username,
      user.password,
      user.firstName,
      user.lastName,
      user.isActive,
      user.createdAt,
      user.updatedAt,
    );
  }

  private toDomainWithRoles(user: any): UserEntity {
    const userEntity = new UserEntity(
      user.id,
      user.email,
      user.username,
      user.password,
      user.firstName,
      user.lastName,
      user.isActive,
      user.createdAt,
      user.updatedAt,
    );
    
    // Set additional fields from schema
    userEntity.isEmailVerified = user.isEmailVerified || false;
    userEntity.emailVerificationToken = user.emailVerificationToken;
    userEntity.passwordResetToken = user.passwordResetToken;
    userEntity.passwordResetExpires = user.passwordResetExpires;
    userEntity.loginAttempts = user.loginAttempts || 0;
    userEntity.lockedUntil = user.lockedUntil;
    userEntity.lastLoginAt = user.lastLoginAt;
    userEntity.ssoProvider = user.ssoProvider;
    userEntity.ssoId = user.ssoId;
    userEntity.userRoles = user.userRoles;
    
    return userEntity;
  }

  async findUserRoles(userId: string): Promise<Array<{ role: { name: string } }>> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    return userRoles;
  }

  async updateSSOInfo(userId: string, ssoProvider: string, ssoId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ssoProvider,
        ssoId,
        updatedAt: new Date(),
      },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findByPasswordResetToken(token: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { 
        passwordResetToken: token,
        passwordResetExpires: {
          gte: new Date(), // Token not expired
        },
      },
    });
    return user ? this.toDomain(user) : null;
  }
}
