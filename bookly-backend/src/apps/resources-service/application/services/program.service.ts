import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ProgramRepository } from '@apps/resources-service/domain/repositories/program.repository';
import { ProgramEntity } from '@apps/resources-service/domain/entities/program.entity';
import { CreateProgramDto, UpdateProgramDto, ProgramResponseDto } from '../dtos/program.dto';
import { LoggingService } from '@libs/logging/logging.service';

/**
 * HITO 6 - RF-02: Program Application Service
 * Handles business logic for academic programs
 */
@Injectable()
export class ProgramService {
  constructor(
    @Inject('ProgramRepository')
    private readonly programRepository: ProgramRepository,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Creates a new academic program
   */
  async createProgram(createDto: CreateProgramDto, createdBy: string): Promise<ProgramResponseDto> {
    this.loggingService.log('Creating new program', { 
      name: createDto.name, 
      code: createDto.code,
      createdBy 
    });

    // Check if program with same code already exists
    if (createDto.code) {
      const existingByCode = await this.programRepository.findByCode(createDto.code);
      if (existingByCode) {
        throw new ConflictException(`Program with code '${createDto.code}' already exists`);
      }
    }

    // Check if program with same name already exists
    const existingByName = await this.programRepository.findByName(createDto.name);
    if (existingByName) {
      throw new ConflictException(`Program with name '${createDto.name}' already exists`);
    }

    const programEntity = ProgramEntity.create(
      createDto.name,
      createDto.description,
      createDto.code,
      createdBy,
    );

    const createdProgram = await this.programRepository.create(programEntity);

    this.loggingService.log('Program created successfully', { 
      programId: createdProgram.id,
      name: createdProgram.name 
    });

    return this.toResponseDto(createdProgram);
  }

  /**
   * Updates an existing program
   */
  async updateProgram(
    id: string, 
    updateDto: UpdateProgramDto, 
    updatedBy: string
  ): Promise<ProgramResponseDto> {
    this.loggingService.log('Updating program', { programId: id, updatedBy });

    const existingProgram = await this.programRepository.findById(id);
    if (!existingProgram) {
      throw new NotFoundException(`Program with ID '${id}' not found`);
    }

    // Check for conflicts if code is being updated
    if (updateDto.code && updateDto.code !== existingProgram.code) {
      const existingByCode = await this.programRepository.findByCode(updateDto.code);
      if (existingByCode && existingByCode.id !== id) {
        throw new ConflictException(`Program with code '${updateDto.code}' already exists`);
      }
    }

    // Check for conflicts if name is being updated
    if (updateDto.name && updateDto.name !== existingProgram.name) {
      const existingByName = await this.programRepository.findByName(updateDto.name);
      if (existingByName && existingByName.id !== id) {
        throw new ConflictException(`Program with name '${updateDto.name}' already exists`);
      }
    }

    const updatedEntity = existingProgram.update(
      updateDto.name,
      updateDto.description,
      undefined, // facultyName - not being updated in this version
    );

    const updatedProgram = await this.programRepository.update(id, updatedEntity);

    this.loggingService.log('Program updated successfully', { 
      programId: id,
      changes: updateDto 
    });

    return this.toResponseDto(updatedProgram);
  }

  /**
   * Gets a program by ID
   */
  async getProgramById(id: string): Promise<ProgramResponseDto> {
    const program = await this.programRepository.findById(id);
    if (!program) {
      throw new NotFoundException(`Program with ID '${id}' not found`);
    }

    return this.toResponseDto(program);
  }

  /**
   * Gets a program by code
   */
  async getProgramByCode(code: string): Promise<ProgramResponseDto> {
    const program = await this.programRepository.findByCode(code);
    if (!program) {
      throw new NotFoundException(`Program with code '${code}' not found`);
    }

    return this.toResponseDto(program);
  }

  /**
   * Gets all active programs
   */
  async getActivePrograms(): Promise<ProgramResponseDto[]> {
    const programs = await this.programRepository.findAllActive();
    return programs.map(this.toResponseDto);
  }

  /**
   * Gets all programs with pagination
   */
  async getPrograms(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean
  ): Promise<{ programs: ProgramResponseDto[]; total: number; page: number; limit: number }> {
    const { programs, total } = await this.programRepository.findWithPagination(
      page,
      limit,
      {
        search,
        isActive,
      },
    );

    return {
      programs: programs.map(this.toResponseDto),
      total,
      page,
      limit,
    };
  }

  /**
   * Deactivates a program
   */
  async deactivateProgram(id: string, deactivatedBy: string): Promise<ProgramResponseDto> {
    this.loggingService.log('Deactivating program', { programId: id, deactivatedBy });

    const existingProgram = await this.programRepository.findById(id);
    if (!existingProgram) {
      throw new NotFoundException(`Program with ID '${id}' not found`);
    }

    if (!existingProgram.isActive) {
      throw new ConflictException(`Program with ID '${id}' is already inactive`);
    }

    await this.programRepository.deactivate(id);

    this.loggingService.log('Program deactivated successfully', { programId: id });

    return this.toResponseDto(existingProgram);
  }

  /**
   * Reactivates a program
   */
  async reactivateProgram(id: string, reactivatedBy: string): Promise<ProgramResponseDto> {
    this.loggingService.log('Reactivating program', { programId: id, reactivatedBy });

    const existingProgram = await this.programRepository.findById(id);
    if (!existingProgram) {
      throw new NotFoundException(`Program with ID '${id}' not found`);
    }

    if (existingProgram.isActive) {
      throw new ConflictException(`Program with ID '${id}' is already active`);
    }

    const updatedEntity = existingProgram.update(
      existingProgram.name,
      existingProgram.description,
      existingProgram.facultyName,
    );

    const updatedProgram = await this.programRepository.update(id, updatedEntity);

    this.loggingService.log('Program reactivated successfully', { programId: id });

    return this.toResponseDto(updatedProgram);
  }

  /**
   * Converts domain entity to response DTO
   */
  private toResponseDto(program: ProgramEntity): ProgramResponseDto {
    return {
      id: program.id!,
      name: program.name!,
      description: program.description,
      code: program.code!,
      facultyName: program.facultyName || '',
      isActive: program.isActive!,
      createdAt: program.createdAt!,
      updatedAt: program.updatedAt,
    };
  }
}
