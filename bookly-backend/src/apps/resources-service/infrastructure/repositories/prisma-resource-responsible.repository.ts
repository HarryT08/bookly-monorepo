import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { ResourceResponsibleEntity } from '@apps/resources-service/domain/entities/resource-responsible.entity';
import { ResourceResponsibleRepository } from '@apps/resources-service/domain/repositories/resource-responsible.repository';

/**
 * HITO 6 - RF-06: Prisma ResourceResponsible Repository Implementation
 */
@Injectable()
export class PrismaResourceResponsibleRepository implements ResourceResponsibleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(resourceResponsible: ResourceResponsibleEntity): Promise<ResourceResponsibleEntity> {
    const created = await this.prisma.resourceResponsible.create({
      data: {
        resourceId: resourceResponsible.resourceId,
        userId: resourceResponsible.userId,
        assignedBy: resourceResponsible.assignedBy,
        assignedAt: resourceResponsible.assignedAt,
        isActive: resourceResponsible.isActive,
      },
    });

    return this.toDomainEntity(created);
  }

  async update(id: string, resourceResponsible: ResourceResponsibleEntity): Promise<ResourceResponsibleEntity> {
    const updated = await this.prisma.resourceResponsible.update({
      where: { id },
      data: {
        isActive: resourceResponsible.isActive,
      },
    });

    return this.toDomainEntity(updated);
  }

  async findById(id: string): Promise<ResourceResponsibleEntity | null> {
    const responsible = await this.prisma.resourceResponsible.findUnique({
      where: { id },
    });

    return responsible ? this.toDomainEntity(responsible) : null;
  }

  async findByResourceId(resourceId: string): Promise<ResourceResponsibleEntity[]> {
    const responsibles = await this.prisma.resourceResponsible.findMany({
      where: { resourceId },
      orderBy: { assignedAt: 'desc' },
    });

    return responsibles.map(this.toDomainEntity);
  }

  async findActiveByResourceId(resourceId: string): Promise<ResourceResponsibleEntity[]> {
    const responsibles = await this.prisma.resourceResponsible.findMany({
      where: {
        resourceId,
        isActive: true,
      },
      orderBy: { assignedAt: 'desc' },
    });

    return responsibles.map(this.toDomainEntity);
  }

  async findByUserId(userId: string): Promise<ResourceResponsibleEntity[]> {
    const responsibles = await this.prisma.resourceResponsible.findMany({
      where: { userId },
      orderBy: { assignedAt: 'desc' },
    });

    return responsibles.map(this.toDomainEntity);
  }

  async findActiveByUserId(userId: string): Promise<ResourceResponsibleEntity[]> {
    const responsibles = await this.prisma.resourceResponsible.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: { assignedAt: 'desc' },
    });

    return responsibles.map(this.toDomainEntity);
  }

  async findByResourceAndUser(resourceId: string, userId: string): Promise<ResourceResponsibleEntity | null> {
    const responsible = await this.prisma.resourceResponsible.findFirst({
      where: {
        resourceId,
        userId,
      },
      orderBy: { assignedAt: 'desc' },
    });

    return responsible ? this.toDomainEntity(responsible) : null;
  }

  async isUserResponsibleForResource(resourceId: string, userId: string): Promise<boolean> {
    const count = await this.prisma.resourceResponsible.count({
      where: {
        resourceId,
        userId,
        isActive: true,
      },
    });

    return count > 0;
  }

  async isUserResponsible(resourceId: string, userId: string): Promise<boolean> {
    return this.isUserResponsibleForResource(resourceId, userId);
  }

  async reactivate(id: string): Promise<void> {
    await this.prisma.resourceResponsible.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.resourceResponsible.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async deactivateByResourceAndUser(resourceId: string, userId: string): Promise<void> {
    await this.prisma.resourceResponsible.updateMany({
      where: {
        resourceId,
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
  }

  async deactivateAllByResource(resourceId: string): Promise<void> {
    await this.prisma.resourceResponsible.updateMany({
      where: {
        resourceId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
  }

  async deactivateAllByUser(userId: string): Promise<void> {
    await this.prisma.resourceResponsible.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
  }

  async assignResponsibleToResource(
    resourceId: string,
    userIds: string[],
    assignedBy: string,
  ): Promise<ResourceResponsibleEntity[]> {
    const assignments: ResourceResponsibleEntity[] = [];

    for (const userId of userIds) {
      // Check if assignment already exists and is active
      const existing = await this.findByResourceAndUser(resourceId, userId);
      
      if (!existing || !existing.isActive) {
        // Deactivate any existing assignments for this resource-user combination
        await this.deactivateByResourceAndUser(resourceId, userId);
        
        // Create new active assignment
        const entity = ResourceResponsibleEntity.create(resourceId, userId, assignedBy);
        const created = await this.create(entity);
        assignments.push(created);
      } else {
        assignments.push(existing);
      }
    }

    return assignments;
  }

  async replaceResourceResponsibles(
    resourceId: string,
    userIds: string[],
    assignedBy: string,
  ): Promise<ResourceResponsibleEntity[]> {
    // Use transaction to ensure atomicity
    return await this.prisma.$transaction(async (tx) => {
      // Deactivate all existing assignments for this resource
      await tx.resourceResponsible.updateMany({
        where: {
          resourceId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Create new assignments
      const assignments: ResourceResponsibleEntity[] = [];
      
      for (const userId of userIds) {
        const created = await tx.resourceResponsible.create({
          data: {
            resourceId,
            userId,
            assignedBy,
            assignedAt: new Date(),
            isActive: true,
          },
        });
        
        assignments.push(this.toDomainEntity(created));
      }

      return assignments;
    });
  }

  async findResourcesByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ assignments: ResourceResponsibleEntity[]; total: number }> {
    const where = {
      userId,
      isActive: true,
    };

    const [assignments, total] = await Promise.all([
      this.prisma.resourceResponsible.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { assignedAt: 'desc' },
      }),
      this.prisma.resourceResponsible.count({ where }),
    ]);

    return {
      assignments: assignments.map(this.toDomainEntity),
      total,
    };
  }

  async findWithPagination(
    page: number,
    limit: number,
    filters?: {
      resourceId?: string;
      userId?: string;
      isActive?: boolean;
    },
  ): Promise<{ responsibles: ResourceResponsibleEntity[]; total: number }> {
    const where: any = {};

    if (filters?.resourceId) {
      where.resourceId = filters.resourceId;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [responsibles, total] = await Promise.all([
      this.prisma.resourceResponsible.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { assignedAt: 'desc' },
      }),
      this.prisma.resourceResponsible.count({ where }),
    ]);

    return {
      responsibles: responsibles.map(this.toDomainEntity),
      total,
    };
  }

  async assignResponsible(
    resourceId: string,
    userId: string,
    assignedBy: string,
  ): Promise<ResourceResponsibleEntity> {
    // Deactivate any existing active assignments for this resource-user combination
    await this.deactivateByResourceAndUser(resourceId, userId);

    // Create new active assignment
    const entity = ResourceResponsibleEntity.create(resourceId, userId, assignedBy);
    return await this.create(entity);
  }

  private toDomainEntity(prismaResponsible: any): ResourceResponsibleEntity {
    return new ResourceResponsibleEntity(
      prismaResponsible.id,
      prismaResponsible.resourceId,
      prismaResponsible.userId,
      prismaResponsible.assignedBy,
      prismaResponsible.assignedAt,
      prismaResponsible.isActive,
    );
  }
}
