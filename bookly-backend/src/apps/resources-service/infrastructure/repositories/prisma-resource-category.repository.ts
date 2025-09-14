import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { ResourceCategoryEntity } from '@apps/resources-service/domain/entities/resource-category.entity';
import { ResourceCategoryRepository } from '@apps/resources-service/domain/repositories/resource-category.repository';

/**
 * HITO 6 - RF-02: Prisma ResourceCategory Repository Implementation
 */
@Injectable()
export class PrismaResourceCategoryRepository implements ResourceCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findWithPagination(page: number, limit: number, filters?: { resourceId?: string; categoryId?: string; search?: string; }): Promise<{ associations: ResourceCategoryEntity[]; total: number; }> {
    const [associations, total] = await Promise.all([
      this.prisma.resourceCategory.findMany({
        where: {
          resourceId: filters?.resourceId,
          categoryId: filters?.categoryId,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { assignedAt: 'desc' },
      }),
      this.prisma.resourceCategory.count({
        where: {
          resourceId: filters?.resourceId,
          categoryId: filters?.categoryId,
        },
      }),
    ]);

    return {
      associations: associations.map(this.toDomainEntity),
      total,
    };
  }

  async create(resourceCategory: ResourceCategoryEntity): Promise<ResourceCategoryEntity> {
    const created = await this.prisma.resourceCategory.create({
      data: {
        resourceId: resourceCategory.resourceId,
        categoryId: resourceCategory.categoryId,
        assignedAt: resourceCategory.assignedAt,
        assignedBy: resourceCategory.assignedBy,
      },
    });

    return this.toDomainEntity(created);
  }

  async findByResourceId(resourceId: string): Promise<ResourceCategoryEntity[]> {
    const associations = await this.prisma.resourceCategory.findMany({
      where: { resourceId },
      orderBy: { assignedAt: 'desc' },
    });

    return associations.map(this.toDomainEntity);
  }

  async findByCategoryId(categoryId: string): Promise<ResourceCategoryEntity[]> {
    const associations = await this.prisma.resourceCategory.findMany({
      where: { categoryId },
      orderBy: { assignedAt: 'desc' },
    });

    return associations.map(this.toDomainEntity);
  }

  async findByResourceAndCategory(resourceId: string, categoryId: string): Promise<ResourceCategoryEntity | null> {
    const association = await this.prisma.resourceCategory.findUnique({
      where: {
        resourceId_categoryId: {
          resourceId,
          categoryId,
        },
      },
    });

    return association ? this.toDomainEntity(association) : null;
  }

  async exists(resourceId: string, categoryId: string): Promise<boolean> {
    const count = await this.prisma.resourceCategory.count({
      where: {
        resourceId,
        categoryId,
      },
    });

    return count > 0;
  }

  async remove(resourceId: string, categoryId: string): Promise<void> {
    await this.prisma.resourceCategory.delete({
      where: {
        resourceId_categoryId: {
          resourceId,
          categoryId,
        },
      },
    });
  }

  async removeAllByResource(resourceId: string): Promise<void> {
    await this.prisma.resourceCategory.deleteMany({
      where: { resourceId },
    });
  }

  async removeAllByCategory(categoryId: string): Promise<void> {
    await this.prisma.resourceCategory.deleteMany({
      where: { categoryId },
    });
  }

  async assignCategoriesToResource(
    resourceId: string,
    categoryIds: string[],
    assignedBy: string,
  ): Promise<ResourceCategoryEntity[]> {
    const associations: ResourceCategoryEntity[] = [];

    for (const categoryId of categoryIds) {
      // Check if association already exists
      const exists = await this.exists(resourceId, categoryId);
      
      if (!exists) {
        const entity = ResourceCategoryEntity.create(resourceId, categoryId, assignedBy);
        const created = await this.create(entity);
        associations.push(created);
      }
    }

    return associations;
  }

  async replaceResourceCategories(
    resourceId: string,
    categoryIds: string[],
    assignedBy: string,
  ): Promise<ResourceCategoryEntity[]> {
    // Use transaction to ensure atomicity
    return await this.prisma.$transaction(async (tx) => {
      // Remove all existing associations
      await tx.resourceCategory.deleteMany({
        where: { resourceId },
      });

      // Create new associations
      const associations: ResourceCategoryEntity[] = [];
      
      for (const categoryId of categoryIds) {
        const created = await tx.resourceCategory.create({
          data: {
            resourceId,
            categoryId,
            assignedBy,
            assignedAt: new Date(),
          },
        });
        
        associations.push(this.toDomainEntity(created));
      }

      return associations;
    });
  }

  async findResourcesByCategory(
    categoryId: string,
    page: number,
    limit: number,
  ): Promise<{ associations: ResourceCategoryEntity[]; total: number }> {
    const [associations, total] = await Promise.all([
      this.prisma.resourceCategory.findMany({
        where: { categoryId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { assignedAt: 'desc' },
      }),
      this.prisma.resourceCategory.count({
        where: { categoryId },
      }),
    ]);

    return {
      associations: associations.map(this.toDomainEntity),
      total,
    };
  }

  private toDomainEntity(prismaAssociation: any): ResourceCategoryEntity {
    return new ResourceCategoryEntity(
      prismaAssociation.id,
      prismaAssociation.resourceId,
      prismaAssociation.categoryId,
      prismaAssociation.assignedAt,
      prismaAssociation.assignedBy,
    );
  }
}
