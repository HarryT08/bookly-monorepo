import { Injectable, Logger } from '@nestjs/common';
import { ProgramCategoryRepository } from '@libs/common/repositories/program-category.repository';
import { AssignCategoriesDto, RemoveCategoriesDto, EntityCategoryAssociationDto } from '@libs/dto/categories';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
export class ResourcesProgramCategoryService {
  private readonly logger = new Logger(ResourcesProgramCategoryService.name);

  constructor(
    private readonly programCategoryRepository: ProgramCategoryRepository,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Assign multiple categories to a program
   */
  async assignCategoriesToProgram(
    programId: string,
    dto: AssignCategoriesDto,
    assignedBy: string,
  ): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Assigning categories to program ${programId}`);

    this.loggingService.log(
      'Assigning categories to program',
      ResourcesProgramCategoryService.name
    );

    try {
      const programCategories = await this.programCategoryRepository.assignCategoriesToProgram(
        programId,
        dto,
        assignedBy,
      );

      // Transform to response DTOs
      const response = programCategories.map(pc => ({
        id: pc.id,
        entityId: pc.programId,
        entityType: 'program' as const,
        categoryId: pc.categoryId,
        category: {
          id: pc.category.id,
          type: pc.category.type,
          subtype: pc.category.subtype,
          name: pc.category.name,
          code: pc.category.code,
          description: pc.category.description,
          color: pc.category.color,
          isActive: pc.category.isActive,
          isDefault: pc.category.isDefault,
          sortOrder: pc.category.sortOrder,
          service: pc.category.service,
          createdAt: pc.category.createdAt,
          updatedAt: pc.category.updatedAt,
        },
        assignedBy: pc.assignedBy,
        assignedByUser: pc.user ? {
          id: pc.user.id,
          name: `${pc.user.firstName} ${pc.user.lastName}`,
          email: pc.user.email,
        } : null,
        assignedAt: pc.assignedAt,
      }));

      this.loggingService.log(
        'Categories assigned to program successfully',
        ResourcesProgramCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to program',
        error,
        ResourcesProgramCategoryService.name
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
    this.logger.log(`Removing categories from program ${programId}`);

    this.loggingService.log(
      'Removing categories from program',
      ResourcesProgramCategoryService.name
    );

    try {
      await this.programCategoryRepository.removeCategoriesFromProgram(
        programId,
        dto,
        removedBy,
      );

      this.loggingService.log(
        'Categories removed from program successfully',
        ResourcesProgramCategoryService.name
      );
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from program',
        error,
        ResourcesProgramCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Get all categories assigned to a program
   */
  async getProgramCategories(programId: string): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Getting categories for program ${programId}`);

    this.loggingService.log(
      'Getting categories for program',
      ResourcesProgramCategoryService.name
    );

    try {
      const programCategories = await this.programCategoryRepository.getProgramCategories(programId);

      // Transform to response DTOs
      const response = programCategories.map(pc => ({
        id: pc.id,
        entityId: pc.programId,
        entityType: 'program' as const,
        categoryId: pc.categoryId,
        category: {
          id: pc.category.id,
          type: pc.category.type,
          subtype: pc.category.subtype,
          name: pc.category.name,
          code: pc.category.code,
          description: pc.category.description,
          color: pc.category.color,
          isActive: pc.category.isActive,
          isDefault: pc.category.isDefault,
          sortOrder: pc.category.sortOrder,
          service: pc.category.service,
          createdAt: pc.category.createdAt,
          updatedAt: pc.category.updatedAt,
        },
        assignedBy: pc.assignedBy,
        assignedByUser: pc.user ? {
          id: pc.user.id,
          name: `${pc.user.firstName} ${pc.user.lastName}`,
          email: pc.user.email,
        } : null,
        assignedAt: pc.assignedAt,
      }));

      this.loggingService.log(
        'Program categories retrieved successfully',
        ResourcesProgramCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to get program categories',
        error,
        ResourcesProgramCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Get all programs that have a specific category
   */
  async getProgramsByCategory(categoryId: string): Promise<any[]> {
    this.logger.log(`Getting programs with category ${categoryId}`);

    this.loggingService.log(
      'Getting programs by category',
      ResourcesProgramCategoryService.name
    );

    try {
      const result = await this.programCategoryRepository.getProgramsByCategory(categoryId);

      this.loggingService.log(
        'Programs by category retrieved successfully',
        ResourcesProgramCategoryService.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to get programs by category',
        error,
        ResourcesProgramCategoryService.name
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
      const result = await this.programCategoryRepository.programHasCategories(programId, categoryIds);

      this.loggingService.log(
        'Program categories check completed',
        ResourcesProgramCategoryService.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to check program categories',
        error,
        ResourcesProgramCategoryService.name
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
  ): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Replacing all categories for program ${programId}`);

    this.loggingService.log(
      'Replacing program categories',
      ResourcesProgramCategoryService.name
    );

    try {
      const programCategories = await this.programCategoryRepository.replaceProgramCategories(
        programId,
        categoryIds,
        updatedBy,
      );

      // Transform to response DTOs
      const response = programCategories.map(pc => ({
        id: pc.id,
        entityId: pc.programId,
        entityType: 'program' as const,
        categoryId: pc.categoryId,
        category: {
          id: pc.category.id,
          type: pc.category.type,
          subtype: pc.category.subtype,
          name: pc.category.name,
          code: pc.category.code,
          description: pc.category.description,
          color: pc.category.color,
          isActive: pc.category.isActive,
          isDefault: pc.category.isDefault,
          sortOrder: pc.category.sortOrder,
          service: pc.category.service,
          createdAt: pc.category.createdAt,
          updatedAt: pc.category.updatedAt,
        },
        assignedBy: pc.assignedBy,
        assignedByUser: pc.user ? {
          id: pc.user.id,
          name: `${pc.user.firstName} ${pc.user.lastName}`,
          email: pc.user.email,
        } : null,
        assignedAt: pc.assignedAt,
      }));

      this.loggingService.log(
        'Program categories replaced successfully',
        ResourcesProgramCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to replace program categories',
        error,
        ResourcesProgramCategoryService.name
      );
      throw error;
    }
  }
}
