import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { MaintenanceTypeRepository } from '@apps/resources-service/domain/repositories/maintenance-type.repository';
import { MaintenanceTypeEntity } from '@apps/resources-service/domain/entities/maintenance-type.entity';
import { 
  CreateMaintenanceTypeDto, 
  UpdateMaintenanceTypeDto, 
  MaintenanceTypeResponseDto 
} from '../dtos/maintenance-type.dto';
import { LoggingService } from '@libs/logging/logging.service';

/**
 * HITO 6 - RF-06: MaintenanceType Application Service
 * Handles business logic for maintenance types
 */
@Injectable()
export class MaintenanceTypeService {
  constructor(
    @Inject('MaintenanceTypeRepository')
    private readonly maintenanceTypeRepository: MaintenanceTypeRepository,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Initializes default maintenance types on service startup
   */
  async onModuleInit(): Promise<void> {
    this.loggingService.log('Initializing default maintenance types');
    await this.maintenanceTypeRepository.initializeDefaults();
    this.loggingService.log('Default maintenance types initialized');
  }

  /**
   * Creates a new maintenance type
   */
  async createMaintenanceType(createDto: CreateMaintenanceTypeDto, createdBy?: string): Promise<MaintenanceTypeResponseDto> {
    this.loggingService.log('Creating new maintenance type', { 
      name: createDto.name,
      priority: createDto.priority,
      createdBy 
    });

    // Check if maintenance type with same name already exists
    const existingByName = await this.maintenanceTypeRepository.findByName(createDto.name);
    if (existingByName) {
      throw new ConflictException(`Maintenance type with name '${createDto.name}' already exists`);
    }

    const maintenanceTypeEntity = MaintenanceTypeEntity.create(
      createDto.name,
      createDto.description,
      createDto.color,
      createDto.priority,
      false, // Custom types are not default
    );

    const createdType = await this.maintenanceTypeRepository.create(maintenanceTypeEntity);

    this.loggingService.log('Maintenance type created successfully', { 
      typeId: createdType.id,
      name: createdType.name 
    });

    return this.toResponseDto(createdType);
  }

  /**
   * Updates an existing maintenance type
   */
  async updateMaintenanceType(
    id: string, 
    updateDto: UpdateMaintenanceTypeDto,
    updatedBy?: string
  ): Promise<MaintenanceTypeResponseDto> {
    this.loggingService.log('Updating maintenance type', { typeId: id, updatedBy });

    const existingType = await this.maintenanceTypeRepository.findById(id);
    if (!existingType) {
      throw new NotFoundException(`Maintenance type with ID '${id}' not found`);
    }

    // Cannot modify default types
    if (existingType.isDefault) {
      throw new BadRequestException('Cannot modify default maintenance types');
    }

    // Check for name conflicts if name is being updated
    if (updateDto.name && updateDto.name !== existingType.name) {
      const existingByName = await this.maintenanceTypeRepository.findByName(updateDto.name);
      if (existingByName && existingByName.id !== id) {
        throw new ConflictException(`Maintenance type with name '${updateDto.name}' already exists`);
      }
    }

    const updatedEntity = existingType.update(
      updateDto.name,
      updateDto.description,
      updateDto.color,
      updateDto.priority,
    );

    const updatedType = await this.maintenanceTypeRepository.update(id, updatedEntity);

    this.loggingService.log('Maintenance type updated successfully', { 
      typeId: id,
      changes: updateDto 
    });

    return this.toResponseDto(updatedType);
  }

  /**
   * Gets a maintenance type by ID
   */
  async getMaintenanceTypeById(id: string): Promise<MaintenanceTypeResponseDto> {
    const maintenanceType = await this.maintenanceTypeRepository.findById(id);
    if (!maintenanceType) {
      throw new NotFoundException(`Maintenance type with ID '${id}' not found`);
    }

    return this.toResponseDto(maintenanceType);
  }

  /**
   * Gets a maintenance type by name
   */
  async getMaintenanceTypeByName(name: string): Promise<MaintenanceTypeResponseDto> {
    const maintenanceType = await this.maintenanceTypeRepository.findByName(name);
    if (!maintenanceType) {
      throw new NotFoundException(`Maintenance type with name '${name}' not found`);
    }

    return this.toResponseDto(maintenanceType);
  }

  /**
   * Gets all active maintenance types ordered by priority
   */
  async getActiveMaintenanceTypes(): Promise<MaintenanceTypeResponseDto[]> {
    const types = await this.maintenanceTypeRepository.findOrderedByPriority();
    return types.map(this.toResponseDto);
  }

  /**
   * Gets all maintenance types (active and inactive)
   */
  async getAllMaintenanceTypes(): Promise<MaintenanceTypeResponseDto[]> {
    const types = await this.maintenanceTypeRepository.findAll();
    return types.map(this.toResponseDto);
  }

  /**
   * Gets default maintenance types
   */
  async getDefaultMaintenanceTypes(): Promise<MaintenanceTypeResponseDto[]> {
    const types = await this.maintenanceTypeRepository.findDefaults();
    return types.map(this.toResponseDto);
  }

  /**
   * Gets custom maintenance types
   */
  async getCustomMaintenanceTypes(): Promise<MaintenanceTypeResponseDto[]> {
    const types = await this.maintenanceTypeRepository.findCustom();
    return types.map(this.toResponseDto);
  }

  /**
   * Deactivates a maintenance type
   */
  async deactivateMaintenanceType(id: string): Promise<MaintenanceTypeResponseDto> {
    this.loggingService.log('Deactivating maintenance type', { typeId: id });

    const existingType = await this.maintenanceTypeRepository.findById(id);
    if (!existingType) {
      throw new NotFoundException(`Maintenance type with ID '${id}' not found`);
    }

    // Cannot deactivate default types
    if (existingType.isDefault) {
      throw new BadRequestException('Cannot deactivate default maintenance types');
    }

    if (!existingType.isActive) {
      throw new ConflictException(`Maintenance type with ID '${id}' is already inactive`);
    }

    const deactivatedType = await this.maintenanceTypeRepository.deactivate(id);

    this.loggingService.log('Maintenance type deactivated successfully', { typeId: id });
    return this.toResponseDto(deactivatedType);
  }

  /**
   * Reactivates a maintenance type
   */
  async reactivateMaintenanceType(id: string): Promise<MaintenanceTypeResponseDto> {
    this.loggingService.log('Reactivating maintenance type', { typeId: id });

    const existingType = await this.maintenanceTypeRepository.findById(id);
    if (!existingType) {
      throw new NotFoundException(`Maintenance type with ID '${id}' not found`);
    }

    if (existingType.isActive) {
      throw new ConflictException(`Maintenance type with ID '${id}' is already active`);
    }

    const updatedEntity = existingType.update(
      existingType.name,
      existingType.description,
      existingType.color,
      existingType.priority,
    );

    const updatedType = await this.maintenanceTypeRepository.update(id, updatedEntity);

    this.loggingService.log('Maintenance type reactivated successfully', { typeId: id });

    return this.toResponseDto(updatedType);
  }

  /**
   * Validates if a maintenance type can be used
   */
  async validateMaintenanceType(id: string): Promise<boolean> {
    const maintenanceType = await this.maintenanceTypeRepository.findById(id);
    return maintenanceType !== null && maintenanceType.isActive;
  }

  /**
   * Converts domain entity to response DTO
   */
  private toResponseDto(maintenanceType: MaintenanceTypeEntity): MaintenanceTypeResponseDto {
    return {
      id: maintenanceType.id!,
      name: maintenanceType.name!,
      description: maintenanceType.description,
      color: maintenanceType.color!,
      priority: maintenanceType.priority!,
      isDefault: maintenanceType.isDefault!,
      isActive: maintenanceType.isActive!,
      createdAt: maintenanceType.createdAt!,
      updatedAt: maintenanceType.updatedAt,
    };
  }
}
