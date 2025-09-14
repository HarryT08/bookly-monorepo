import { Injectable } from '@nestjs/common';
import { ResourceEntity } from '@apps/resources-service/domain/entities/resource.entity';
import { ResourceRepository } from '@apps/resources-service/domain/repositories/resource.repository';
// Note: CreateResourceDto needs to be defined - using ResourceEntity for now
import { PrismaService } from '@libs/common/services/prisma.service';

/**
 * Prisma Resource Repository Implementation
 * Implements the ResourceRepository interface using Prisma ORM
 */
@Injectable()
export class PrismaResourceRepository implements ResourceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(resource: ResourceEntity): Promise<ResourceEntity> {
    const data = await this.prisma.resource.create({
      data: {
        name: resource.name,
        code: resource.code,
        description: resource.description,
        type: resource.type,
        capacity: resource.capacity,
        location: resource.location,
        status: resource.status,
        attributes: resource.attributes as any,
        availableSchedules: resource.availableSchedules as any,
        categoryId: resource.categoryId,
        isActive: resource.isActive,
      },
    });

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<ResourceEntity | null> {
    const data = await this.prisma.resource.findUnique({
      where: { id },
    });

    return data ? this.mapToEntity(data) : null;
  }

  async findByCode(code: string): Promise<ResourceEntity | null> {
    const data = await this.prisma.resource.findUnique({
      where: { code },
    });

    return data ? this.mapToEntity(data) : null;
  }

  async findAll(filters?: {
    type?: string;
    status?: string;
    categoryId?: string;
    isActive?: boolean;
    location?: string;
  }): Promise<ResourceEntity[]> {
    const where: any = {};

    if (filters) {
      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.categoryId) where.categoryId = filters.categoryId;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;
      if (filters.location) {
        where.location = {
          contains: filters.location,
          mode: 'insensitive',
        };
      }
    }

    const data = await this.prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return data.map(item => this.mapToEntity(item));
  }

  async update(id: string, resource: ResourceEntity): Promise<ResourceEntity> {
    const data = await this.prisma.resource.update({
      where: { id },
      data: {
        name: resource.name,
        description: resource.description,
        type: resource.type,
        capacity: resource.capacity,
        location: resource.location,
        status: resource.status,
        attributes: resource.attributes as any,
        availableSchedules: resource.availableSchedules as any,
        categoryId: resource.categoryId,
        isActive: resource.isActive,
        updatedAt: new Date(),
      },
    });

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.resource.delete({
      where: { id },
    });
  }

  async hasActiveRelations(id: string): Promise<boolean> {
    // Check for active reservations
    const activeReservations = await this.prisma.reservation.count({
      where: {
        resourceId: id,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
      },
    });

    // Check for active maintenance
    const activeMaintenance = await this.prisma.maintenance.count({
      where: {
        resourceId: id,
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS'],
        },
      },
    });

    return activeReservations > 0 || activeMaintenance > 0;
  }

  async isCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    const where: any = { code };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.resource.count({ where });
    return count === 0;
  }

  async findByType(type: string): Promise<ResourceEntity[]> {
    const data = await this.prisma.resource.findMany({
      where: { type },
      orderBy: { name: 'asc' },
    });

    return data.map(item => this.mapToEntity(item));
  }

  async findByStatus(status: string): Promise<ResourceEntity[]> {
    const data = await this.prisma.resource.findMany({
      where: { status },
      orderBy: { name: 'asc' },
    });

    return data.map(item => this.mapToEntity(item));
  }

  async findByCategory(categoryId: string): Promise<ResourceEntity[]> {
    const data = await this.prisma.resource.findMany({
      where: { categoryId },
      orderBy: { name: 'asc' },
    });

    return data.map(item => this.mapToEntity(item));
  }

  async search(query: string): Promise<ResourceEntity[]> {
    const data = await this.prisma.resource.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            code: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: { name: 'asc' },
    });

    return data.map(item => this.mapToEntity(item));
  }

  async count(filters?: {
    type?: string;
    status?: string;
    categoryId?: string;
    isActive?: boolean;
  }): Promise<number> {
    const where: any = {};

    if (filters) {
      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.categoryId) where.categoryId = filters.categoryId;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;
    }

    return await this.prisma.resource.count({ where });
  }

  async findWithPagination(
    page: number,
    limit: number,
    filters?: {
      type?: string;
      status?: string;
      categoryId?: string;
      isActive?: boolean;
    }
  ): Promise<{
    resources: ResourceEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where: any = {};

    if (filters) {
      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.categoryId) where.categoryId = filters.categoryId;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.resource.count({ where }),
    ]);

    const resources = data.map(item => this.mapToEntity(item));
    const totalPages = Math.ceil(total / limit);

    return {
      resources,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Maps Prisma data to ResourceEntity
   */
  private mapToEntity(data: any): ResourceEntity {
    return new ResourceEntity(
      data.id,
      data.name,
      data.code,
      data.type,
      data.capacity,
      data.location,
      data.status,
      data.programId,
      data.description,
      data.attributes ,
      data.availableSchedules,
      data.categoryId,
      data.isActive,
      data.createdAt,
      data.updatedAt,
    );
  }
}
