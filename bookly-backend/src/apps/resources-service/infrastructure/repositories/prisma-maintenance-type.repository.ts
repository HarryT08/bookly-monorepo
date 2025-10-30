import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { MaintenanceTypeEntity } from '@apps/resources-service/domain/entities/maintenance-type.entity';
import { MaintenanceTypeRepository } from '@apps/resources-service/domain/repositories/maintenance-type.repository';

/**
 * HITO 6 - RF-06: Prisma MaintenanceType Repository Implementation
 */
@Injectable()
export class PrismaMaintenanceTypeRepository implements MaintenanceTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(maintenanceType: MaintenanceTypeEntity): Promise<MaintenanceTypeEntity> {
    const created = await this.prisma.maintenanceType.create({
      data: {
        name: maintenanceType.name,
        description: maintenanceType.description,
        color: maintenanceType.color,
        priority: maintenanceType.priority,
        isDefault: maintenanceType.isDefault,
        isActive: maintenanceType.isActive,
      },
    });

    return this.toDomainEntity(created);
  }

  async update(id: string, maintenanceType: MaintenanceTypeEntity): Promise<MaintenanceTypeEntity> {
    const updated = await this.prisma.maintenanceType.update({
      where: { id },
      data: {
        name: maintenanceType.name,
        description: maintenanceType.description,
        color: maintenanceType.color,
        priority: maintenanceType.priority,
        isActive: maintenanceType.isActive,
        updatedAt: new Date(),
      },
    });

    return this.toDomainEntity(updated);
  }

  async findById(id: string): Promise<MaintenanceTypeEntity | null> {
    const maintenanceType = await this.prisma.maintenanceType.findUnique({
      where: { id },
    });

    return maintenanceType ? this.toDomainEntity(maintenanceType) : null;
  }

  async findByName(name: string): Promise<MaintenanceTypeEntity | null> {
    const maintenanceType = await this.prisma.maintenanceType.findUnique({
      where: { name },
    });

    return maintenanceType ? this.toDomainEntity(maintenanceType) : null;
  }

  async findAllActive(): Promise<MaintenanceTypeEntity[]> {
    const maintenanceTypes = await this.prisma.maintenanceType.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' },
    });

    return maintenanceTypes.map(this.toDomainEntity);
  }

  async findAll(): Promise<MaintenanceTypeEntity[]> {
    const maintenanceTypes = await this.prisma.maintenanceType.findMany({
      orderBy: { priority: 'asc' },
    });

    return maintenanceTypes.map(this.toDomainEntity);
  }

  async findDefaults(): Promise<MaintenanceTypeEntity[]> {
    const maintenanceTypes = await this.prisma.maintenanceType.findMany({
      where: { isDefault: true },
      orderBy: { priority: 'asc' },
    });

    return maintenanceTypes.map(this.toDomainEntity);
  }

  async findCustom(): Promise<MaintenanceTypeEntity[]> {
    const maintenanceTypes = await this.prisma.maintenanceType.findMany({
      where: { isDefault: false },
      orderBy: { priority: 'asc' },
    });

    return maintenanceTypes.map(this.toDomainEntity);
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const where: any = { name };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.maintenanceType.count({ where });
    return count > 0;
  }

  async deactivate(id: string): Promise<MaintenanceTypeEntity> {
    // Check if it's a default type first
    const maintenanceType = await this.prisma.maintenanceType.findUnique({
      where: { id },
      select: { isDefault: true },
    });

    if (maintenanceType?.isDefault) {
      throw new Error('Cannot deactivate default maintenance types');
    }

    const deactivated = await this.prisma.maintenanceType.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return this.toDomainEntity(deactivated);
  }

  async initializeDefaults(): Promise<void> {
    const defaultTypes = MaintenanceTypeEntity.getDefaultTypes();

    for (const defaultType of defaultTypes) {
      const existing = await this.findByName(defaultType.name!);
      
      if (!existing) {
        const entity = MaintenanceTypeEntity.create(
          defaultType.name!,
          defaultType.description,
          defaultType.color,
          defaultType.priority,
          defaultType.isDefault,
        );
        
        await this.create(entity);
      }
    }
  }

  async findOrderedByPriority(): Promise<MaintenanceTypeEntity[]> {
    const maintenanceTypes = await this.prisma.maintenanceType.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' },
      ],
    });

    return maintenanceTypes.map(this.toDomainEntity);
  }

  private toDomainEntity(prismaMaintenanceType: any): MaintenanceTypeEntity {
    return new MaintenanceTypeEntity(
      prismaMaintenanceType.id,
      prismaMaintenanceType.name,
      prismaMaintenanceType.description,
      prismaMaintenanceType.color,
      prismaMaintenanceType.priority,
      prismaMaintenanceType.isDefault,
      prismaMaintenanceType.isActive,
      prismaMaintenanceType.createdAt,
      prismaMaintenanceType.updatedAt,
    );
  }
}
