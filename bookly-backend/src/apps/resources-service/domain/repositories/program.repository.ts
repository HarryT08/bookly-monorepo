import { ProgramEntity } from '../entities/program.entity';

/**
 * HITO 6 - RF-02: Program Repository Interface
 */
export interface ProgramRepository {
  findByName(name: string): Promise<ProgramEntity | null>;
  /**
   * Creates a new program
   */
  create(program: ProgramEntity): Promise<ProgramEntity>;

  /**
   * Updates an existing program
   */
  update(id: string, program: ProgramEntity): Promise<ProgramEntity>;

  /**
   * Finds a program by ID
   */
  findById(id: string): Promise<ProgramEntity | null>;

  /**
   * Finds a program by code
   */
  findByCode(code: string): Promise<ProgramEntity | null>;

  /**
   * Finds programs by faculty name
   */
  findByFaculty(facultyName: string): Promise<ProgramEntity[]>;

  /**
   * Gets all active programs
   */
  findAllActive(): Promise<ProgramEntity[]>;

  /**
   * Gets programs with pagination
   */
  findWithPagination(
    page: number,
    limit: number,
    filters?: {
      facultyName?: string;
      isActive?: boolean;
      search?: string;
    },
  ): Promise<{
    programs: ProgramEntity[];
    total: number;
  }>;

  /**
   * Checks if a program code already exists
   */
  existsByCode(code: string, excludeId?: string): Promise<boolean>;

  /**
   * Checks if a program name already exists
   */
  existsByName(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Deactivates a program
   */
  deactivate(id: string): Promise<void>;

  /**
   * Gets programs that have resources assigned
   */
  findWithResources(): Promise<ProgramEntity[]>;
}
