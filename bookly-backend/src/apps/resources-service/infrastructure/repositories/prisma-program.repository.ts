import { Injectable } from '@nestjs/common';
import { ProgramEntity } from '@apps/resources-service/domain/entities/program.entity';
import { ProgramRepository } from '@apps/resources-service/domain/repositories/program.repository';
import { PrismaService } from '@libs/common/services/prisma.service';

/**
 * HITO 6 - RF-02: Prisma Program Repository Implementation
 */
@Injectable()
export class PrismaProgramRepository implements ProgramRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(program: ProgramEntity): Promise<ProgramEntity> {
    const created = await this.prisma.program.create({
      data: {
        name: program.name,
        code: program.code,
        description: program.description,
        facultyName: program.facultyName,
        isActive: program.isActive,
      },
    });

    return this.toDomainEntity(created);
  }

  async update(id: string, program: ProgramEntity): Promise<ProgramEntity> {
    const updated = await this.prisma.program.update({
      where: { id },
      data: {
        name: program.name,
        description: program.description,
        facultyName: program.facultyName,
        isActive: program.isActive,
        updatedAt: new Date(),
      },
    });

    return this.toDomainEntity(updated);
  }

  async findById(id: string): Promise<ProgramEntity | null> {
    const program = await this.prisma.program.findUnique({
      where: { id },
    });

    return program ? this.toDomainEntity(program) : null;
  }

  async findByName(name: string): Promise<ProgramEntity | null> {
    const program = await this.prisma.program.findUnique({
      where: { name },
    });

    return program ? this.toDomainEntity(program) : null;
  }

  async findByCode(code: string): Promise<ProgramEntity | null> {
    const program = await this.prisma.program.findUnique({
      where: { code },
    });

    return program ? this.toDomainEntity(program) : null;
  }

  async findByFaculty(facultyName: string): Promise<ProgramEntity[]> {
    const programs = await this.prisma.program.findMany({
      where: {
        facultyName,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    return programs.map(this.toDomainEntity);
  }

  async findAllActive(): Promise<ProgramEntity[]> {
    const programs = await this.prisma.program.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return programs.map(this.toDomainEntity);
  }

  async findWithPagination(
    page: number,
    limit: number,
    filters?: {
      facultyName?: string;
      isActive?: boolean;
      search?: string;
    },
  ): Promise<{ programs: ProgramEntity[]; total: number }> {
    const where: any = {};

    if (filters?.facultyName) {
      where.facultyName = filters.facultyName;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [programs, total] = await Promise.all([
      this.prisma.program.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.program.count({ where }),
    ]);

    return {
      programs: programs.map(this.toDomainEntity),
      total,
    };
  }

  async existsByCode(code: string, excludeId?: string): Promise<boolean> {
    const where: any = { code };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.program.count({ where });
    return count > 0;
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const where: any = { name };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.program.count({ where });
    return count > 0;
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.program.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  async findWithResources(): Promise<ProgramEntity[]> {
    const programs = await this.prisma.program.findMany({
      where: {
        isActive: true,
        resources: {
          some: {
            isActive: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return programs.map(this.toDomainEntity);
  }

  private toDomainEntity(prismaProgram: any): ProgramEntity {
    return new ProgramEntity(
      prismaProgram.id,
      prismaProgram.name,
      prismaProgram.code,
      prismaProgram.description,
      prismaProgram.facultyName,
      prismaProgram.isActive,
      prismaProgram.createdAt,
      prismaProgram.updatedAt,
    );
  }
}
