/**
 * Prisma Category Repository Implementation
 * Implements the CategoryRepository interface using Prisma ORM
 */

import { CategoryEntity } from "@libs/common/entities/category.entity";
import {
  BaseCategoryRepository,
  CategoryFilter,
} from "@libs/common/repositories/category.repository";
import { PrismaService } from "@libs/common/services/prisma.service";
import { EventBusService } from "@libs/event-bus/services/event-bus.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaCategoryRepository extends BaseCategoryRepository {
  createDefaultCategories(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly eventBus: EventBusService,
    protected readonly serviceName: string
  ) {
    super(serviceName);
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        service: this.serviceName,
      },
    });

    return category ? this.toDomain(category) : null;
  }

  async findByCode(
    type: string,
    subtype: string,
    code: string
  ): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findFirst({
      where: {
        type: type.toUpperCase(),
        subtype: subtype.toUpperCase(),
        code: code.toUpperCase(),
        service: this.serviceName,
      },
    });

    return category ? this.toDomain(category) : null;
  }

  async findAll(filter?: CategoryFilter): Promise<CategoryEntity[]> {
    const where: any = {
      service: this.serviceName,
      ...(filter?.type && { type: filter.type.toUpperCase() }),
      ...(filter?.subtype && { subtype: filter.subtype.toUpperCase() }),
      ...(filter?.isActive !== undefined && { isActive: filter.isActive }),
      ...(filter?.parentId && { parentId: filter.parentId }),
    };

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: "insensitive" } },
        { code: { contains: filter.search, mode: "insensitive" } },
        { description: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return categories.map((category) => this.toDomain(category));
  }

  async findByTypeAndSubtypeActive(
    type: string,
    subtype: string
  ): Promise<CategoryEntity[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        type: type.toUpperCase(),
        subtype: subtype.toUpperCase(),
        isActive: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return categories.map((category) => this.toDomain(category));
  }

  async save(category: CategoryEntity): Promise<CategoryEntity> {
    const props = category.toProps();

    const result = await this.prisma.category.create({
      data: {
        id: props.id!,
        type: props.type,
        subtype: props.subtype,
        name: props.name,
        code: props.code,
        description: props.description,
        metadata: props.metadata,
        isActive: props.isActive,
        sortOrder: props.sortOrder,
        parentId: props.parentId,
        service: props.service,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        createdBy: props.createdBy,
        updatedBy: props.updatedBy,
      },
    });

    // Publish domain events
    const events = category.domainEvents;
    for (const event of events) {
      await this.eventBus.publishEvent(event);
    }
    category.clearDomainEvents();

    return this.toDomain(result);
  }

  async update(category: CategoryEntity): Promise<CategoryEntity> {
    const props = category.toProps();

    const result = await this.prisma.category.update({
      where: { id: props.id! },
      data: {
        name: props.name,
        description: props.description,
        metadata: props.metadata,
        isActive: props.isActive,
        sortOrder: props.sortOrder,
        parentId: props.parentId,
        updatedAt: props.updatedAt,
        updatedBy: props.updatedBy,
      },
    });

    // Publish domain events
    const events = category.domainEvents;
    for (const event of events) {
      await this.eventBus.publishEvent(event);
    }
    category.clearDomainEvents();

    return this.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async exists(type: string, subtype: string, code: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: {
        type: type.toUpperCase(),
        subtype: subtype.toUpperCase(),
        code: code.toUpperCase(),
        service: this.serviceName,
      },
    });

    return count > 0;
  }

  /**
   * Convert database record to domain entity
   */
  private toDomain(data: any): CategoryEntity {
    return new CategoryEntity({
      id: data.id,
      type: data.type,
      subtype: data.subtype,
      name: data.name,
      code: data.code,
      description: data.description,
      metadata: data.metadata || {},
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      parentId: data.parentId,
      service: data.service,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    });
  }
}
