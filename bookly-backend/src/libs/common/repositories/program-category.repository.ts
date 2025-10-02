import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { LoggingService } from '@libs/logging/logging.service';
import { AssignCategoriesDto, RemoveCategoriesDto } from '@libs/dto/categories';

@Injectable()
export class ProgramCategoryRepository {
  private readonly logger = new Logger(ProgramCategoryRepository.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Assign multiple categories to a program
   */
  async assignCategoriesToProgram(
    programId: string,
    dto: AssignCategoriesDto,
    assignedBy: string,
  ): Promise<any[]> {
    this.logger.log(`Assigning ${dto.categoryIds.length} categories to program ${programId}`);

    this.loggingService.log(
      'Starting categories assignment to program',
      ProgramCategoryRepository.name
    );

    try {
      // Verify program exists
      const program = await this.prisma.program.findUnique({
        where: { id: programId }
      });

      if (!program) {
        throw new NotFoundException(`Program with ID ${programId} not found`);
      }

      // Verify categories exist
      const categories = await this.prisma.category.findMany({
        where: { id: { in: dto.categoryIds } }
      });

      if (categories.length !== dto.categoryIds.length) {
        const foundIds = categories.map(c => c.id);
        const missing = dto.categoryIds.filter(id => !foundIds.includes(id));
        throw new NotFoundException(`Categories not found: ${missing.join(', ')}`);
      }

      // Check for existing associations to avoid duplicates
      const existingAssociations = await this.prisma.programCategory.findMany({
        where: {
          programId,
          categoryId: { in: dto.categoryIds }
        }
      });

      const existingCategoryIds = existingAssociations.map(pc => pc.categoryId);
      const newCategoryIds = dto.categoryIds.filter(id => !existingCategoryIds.includes(id));

      if (newCategoryIds.length === 0) {
        throw new ConflictException('All categories are already assigned to this program');
      }

      // Create new associations
      const programCategoriesData = newCategoryIds.map(categoryId => ({
        programId,
        categoryId,
        assignedBy,
        assignedAt: new Date(),
      }));

      await this.prisma.programCategory.createMany({
        data: programCategoriesData
      });

      // Fetch created associations with relations
      const programCategories = await this.prisma.programCategory.findMany({
        where: {
          programId,
          categoryId: { in: newCategoryIds }
        },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      this.loggingService.log(
        'Categories assigned to program successfully',
        ProgramCategoryRepository.name
      );

      // Publish domain event
      await this.eventBus.publishEvent({
        eventId: `program-categories-assigned-${programId}-${Date.now()}`,
        eventType: 'program.categories.assigned',
        aggregateId: programId,
        aggregateType: 'Program',
        eventData: {
          programId,
          categoryIds: newCategoryIds,
          assignedBy,
          count: programCategories.length,
        },
        timestamp: new Date(),
        version: 1,
      });

      return programCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to program',
        error,
        ProgramCategoryRepository.name
      );
      throw error;
    }
  }

  /**
   * Remove multiple categories from a program
   */
  async removeCategoriesFromProgram(
    programId: string,
    dto: RemoveCategoriesDto,
    removedBy: string,
  ): Promise<void> {
    this.logger.log(`Removing ${dto.categoryIds.length} categories from program ${programId}`);

    this.loggingService.log(
      'Starting categories removal from program',
      ProgramCategoryRepository.name
    );

    try {
      // Verify associations exist
      const existingAssociations = await this.prisma.programCategory.findMany({
        where: {
          programId,
          categoryId: { in: dto.categoryIds }
        }
      });

      if (existingAssociations.length === 0) {
        throw new NotFoundException('No matching program-category associations found');
      }

      const existingCategoryIds = existingAssociations.map(pc => pc.categoryId);
      const notFoundIds = dto.categoryIds.filter(id => !existingCategoryIds.includes(id));

      if (notFoundIds.length > 0) {
        this.logger.warn(`Categories not assigned to program: ${notFoundIds.join(', ')}`);
      }

      // Remove associations
      await this.prisma.programCategory.deleteMany({
        where: {
          programId,
          categoryId: { in: existingCategoryIds }
        }
      });

      this.loggingService.log(
        'Categories removed from program successfully',
        ProgramCategoryRepository.name
      );

      // Publish domain event
      await this.eventBus.publishEvent({
        eventId: `program-categories-removed-${programId}-${Date.now()}`,
        eventType: 'program.categories.removed',
        aggregateId: programId,
        aggregateType: 'Program',
        eventData: {
          programId,
          categoryIds: existingCategoryIds,
          removedBy,
          count: existingCategoryIds.length,
        },
        timestamp: new Date(),
        version: 1,
      });
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from program',
        error,
        ProgramCategoryRepository.name
      );
      throw error;
    }
  }

  /**
   * Get all categories assigned to a program
   */
  async getProgramCategories(programId: string): Promise<any[]> {
    this.logger.log(`Getting categories for program ${programId}`);

    try {
      const programCategories = await this.prisma.programCategory.findMany({
        where: { programId },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: [
          { category: { sortOrder: 'asc' } },
          { assignedAt: 'desc' }
        ]
      });

      this.loggingService.log(
        'Program categories retrieved successfully',
        ProgramCategoryRepository.name
      );

      return programCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to get program categories',
        error,
        ProgramCategoryRepository.name
      );
      throw error;
    }
  }

  /**
   * Get all programs that have a specific category
   */
  async getProgramsByCategory(categoryId: string): Promise<any[]> {
    this.logger.log(`Getting programs with category ${categoryId}`);

    try {
      const programCategories = await this.prisma.programCategory.findMany({
        where: { categoryId },
        include: {
          program: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: { assignedAt: 'desc' }
      });

      this.loggingService.log(
        'Programs by category retrieved successfully',
        ProgramCategoryRepository.name
      );

      return programCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to get programs by category',
        error,
        ProgramCategoryRepository.name
      );
      throw error;
    }
  }

  /**
   * Check if a program has specific categories
   */
  async programHasCategories(programId: string, categoryIds: string[]): Promise<boolean> {
    this.logger.log(`Checking if program ${programId} has categories`);

    try {
      const count = await this.prisma.programCategory.count({
        where: {
          programId,
          categoryId: { in: categoryIds }
        }
      });

      return count === categoryIds.length;
    } catch (error) {
      this.loggingService.error(
        'Failed to check program categories',
        error,
        ProgramCategoryRepository.name
      );
      throw error;
    }
  }

  /**
   * Replace all categories for a program
   */
  async replaceProgramCategories(
    programId: string,
    categoryIds: string[],
    updatedBy: string,
  ): Promise<any[]> {
    this.logger.log(`Replacing all categories for program ${programId}`);

    this.loggingService.log(
      'Starting program categories replacement',
      ProgramCategoryRepository.name
    );

    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Remove all existing associations
        await prisma.programCategory.deleteMany({
          where: { programId }
        });

        // Verify new categories exist
        const categories = await prisma.category.findMany({
          where: { id: { in: categoryIds } }
        });

        if (categories.length !== categoryIds.length) {
          const foundIds = categories.map(c => c.id);
          const missing = categoryIds.filter(id => !foundIds.includes(id));
          throw new NotFoundException(`Categories not found: ${missing.join(', ')}`);
        }

        // Create new associations
        const programCategoriesData = categoryIds.map(categoryId => ({
          programId,
          categoryId,
          assignedBy: updatedBy,
          assignedAt: new Date(),
        }));

        await prisma.programCategory.createMany({
          data: programCategoriesData
        });

        // Fetch created associations with relations
        const programCategories = await prisma.programCategory.findMany({
          where: { programId },
          include: {
            category: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        });

        this.loggingService.log(
          'Program categories replaced successfully',
          ProgramCategoryRepository.name
        );

        // Publish domain event
        await this.eventBus.publishEvent({
          eventId: `program-categories-replaced-${programId}-${Date.now()}`,
          eventType: 'program.categories.replaced',
          aggregateId: programId,
          aggregateType: 'Program',
          eventData: {
            programId,
            categoryIds,
            updatedBy,
            count: programCategories.length,
          },
          timestamp: new Date(),
          version: 1,
        });

        return programCategories;
      });
    } catch (error) {
      this.loggingService.error(
        'Failed to replace program categories',
        error,
        ProgramCategoryRepository.name
      );
      throw error;
    }
  }
}
