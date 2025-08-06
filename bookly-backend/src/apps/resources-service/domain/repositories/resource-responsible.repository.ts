import { ResourceResponsibleEntity } from '../entities/resource-responsible.entity';

/**
 * HITO 6 - RF-02: ResourceResponsible Repository Interface
 */
export interface ResourceResponsibleRepository {
  /**
   * Creates a new resource responsibility assignment
   */
  create(resourceResponsible: ResourceResponsibleEntity): Promise<ResourceResponsibleEntity>;

  /**
   * Finds assignments by resource ID
   */
  findByResourceId(resourceId: string): Promise<ResourceResponsibleEntity[]>;

  /**
   * Finds active assignments by resource ID
   */
  findActiveByResourceId(resourceId: string): Promise<ResourceResponsibleEntity[]>;

  /**
   * Finds assignments by user ID
   */
  findByUserId(userId: string): Promise<ResourceResponsibleEntity[]>;

  /**
   * Finds active assignments by user ID
   */
  findActiveByUserId(userId: string): Promise<ResourceResponsibleEntity[]>;

  /**
   * Finds a specific assignment
   */
  findByResourceAndUser(resourceId: string, userId: string): Promise<ResourceResponsibleEntity | null>;

  /**
   * Checks if user is responsible for resource
   */
  isUserResponsible(resourceId: string, userId: string): Promise<boolean>;

  /**
   * Reactivates a specific assignment
   */
  reactivate(id: string): Promise<void>;

  /**
   * Deactivates a specific assignment
   */
  deactivate(id: string): Promise<void>;

  /**
   * Deactivates all assignments for a resource
   */
  deactivateAllByResource(resourceId: string): Promise<void>;

  /**
   * Deactivates all assignments for a user
   */
  deactivateAllByUser(userId: string): Promise<void>;

  /**
   * Assigns multiple users as responsibles for a resource
   */
  assignResponsibleToResource(
    resourceId: string,
    userIds: string[],
    assignedBy: string,
  ): Promise<ResourceResponsibleEntity[]>;

  /**
   * Replaces all responsibles for a resource
   */
  replaceResourceResponsibles(
    resourceId: string,
    userIds: string[],
    assignedBy: string,
  ): Promise<ResourceResponsibleEntity[]>;

  /**
   * Gets resources managed by a user with pagination
   */
  findResourcesByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    assignments: ResourceResponsibleEntity[];
    total: number;
  }>;

  /**
   * Gets responsibility assignments with pagination and filters
   */
  findWithPagination(
    page: number,
    limit: number,
    filters?: {
      resourceId?: string;
      userId?: string;
      isActive?: boolean;
    },
  ): Promise<{
    responsibles: ResourceResponsibleEntity[];
    total: number;
  }>;
}
