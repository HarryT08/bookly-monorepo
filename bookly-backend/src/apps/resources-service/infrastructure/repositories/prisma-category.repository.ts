import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryEntity } from '../../domain/entities/category.entity';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(category: CategoryEntity): Promise<CategoryEntity> {
    const created = await this.prisma.category.create({
      data: {
        name: category.name,
        description: category.description,
        color: category.color,
        isActive: category.isActive,
        isDefault: category.isDefault,
        priority: category.priority,
      },
    });

    return new CategoryEntity(
      created.id,
      created.name,
      created.description,
      created.color,
      created.isActive,
      created.isDefault,
      created.priority,
      created.createdAt,
      created.updatedAt,
    );
  }

  async update(category: CategoryEntity): Promise<CategoryEntity> {
    const updated = await this.prisma.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        description: category.description,
        color: category.color,
        isActive: category.isActive,
        priority: category.priority,
        updatedAt: new Date(),
      },
    });

    return new CategoryEntity(
      updated.id,
      updated.name,
      updated.description,
      updated.color,
      updated.isActive,
      updated.isDefault,
      updated.priority,
      updated.createdAt,
      updated.updatedAt,
    );
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) return null;

    return new CategoryEntity(
      category.id,
      category.name,
      category.description,
      category.color,
      category.isActive,
      category.isDefault,
      category.priority,
      category.createdAt,
      category.updatedAt,
    );
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findUnique({
      where: { name },
    });

    if (!category) return null;

    return new CategoryEntity(
      category.id,
      category.name,
      category.description,
      category.color,
      category.isActive,
      category.isDefault,
      category.priority,
      category.createdAt,
      category.updatedAt,
    );
  }

  async findAll(): Promise<CategoryEntity[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' },
      ],
    });

    return categories.map(category => new CategoryEntity(
      category.id,
      category.name,
      category.description,
      category.color,
      category.isActive,
      category.isDefault,
      category.priority,
      category.createdAt,
      category.updatedAt,
    ));
  }

  async findActive(): Promise<CategoryEntity[]> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' },
      ],
    });

    return categories.map(category => new CategoryEntity(
      category.id,
      category.name,
      category.description,
      category.color,
      category.isActive,
      category.isDefault,
      category.priority,
      category.createdAt,
      category.updatedAt,
    ));
  }

  async findDefaults(): Promise<CategoryEntity[]> {
    const categories = await this.prisma.category.findMany({
      where: { isDefault: true },
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' },
      ],
    });

    return categories.map(category => new CategoryEntity(
      category.id,
      category.name,
      category.description,
      category.color,
      category.isActive,
      category.isDefault,
      category.priority,
      category.createdAt,
      category.updatedAt,
    ));
  }

  async findCustom(): Promise<CategoryEntity[]> {
    const categories = await this.prisma.category.findMany({
      where: { isDefault: false },
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' },
      ],
    });

    return categories.map(category => new CategoryEntity(
      category.id,
      category.name,
      category.description,
      category.color,
      category.isActive,
      category.isDefault,
      category.priority,
      category.createdAt,
      category.updatedAt,
    ));
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.category.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  async reactivate(id: string): Promise<void> {
    await this.prisma.category.update({
      where: { id },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: { name },
    });
    return count > 0;
  }

  async findWithPagination(
    page: number,
    limit: number,
    filters?: {
      isActive?: boolean;
      isDefault?: boolean;
      search?: string;
    }
  ): Promise<{
    categories: CategoryEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.isDefault !== undefined) {
      where.isDefault = filters.isDefault;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { priority: 'asc' },
          { name: 'asc' },
        ],
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      categories: categories.map(category => new CategoryEntity(
        category.id,
        category.name,
        category.description,
        category.color,
        category.isActive,
        category.isDefault,
        category.priority,
        category.createdAt,
        category.updatedAt,
      )),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
