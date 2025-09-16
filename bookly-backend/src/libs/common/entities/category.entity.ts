/**
 * Unified Category Entity
 * Used across all microservices for classifications, types, and taxonomies
 */

import { DomainEvent } from '@libs/event-bus/services/event-bus.service';

export interface CategoryCreatedEvent extends DomainEvent {
  eventType: 'CategoryCreated';
  aggregateType: 'Category';
  payload: {
    categoryId: string;
    type: string;
    subtype: string;
    name: string;
    description?: string;
    service: string;
  };
}

export interface CategoryUpdatedEvent extends DomainEvent {
  eventType: 'CategoryUpdated';
  aggregateType: 'Category';
  payload: {
    categoryId: string;
    type: string;
    subtype: string;
    changes: Partial<CategoryProps>;
    service: string;
  };
}

export interface CategoryDeletedEvent extends DomainEvent {
  eventType: 'CategoryDeleted';
  aggregateType: 'Category';
  payload: {
    categoryId: string;
    type: string;
    subtype: string;
    service: string;
  };
}

export interface CategoryProps {
  id?: string;
  type: string; // e.g., 'RESOURCE', 'USER', 'RESERVATION', 'APPROVAL', 'REPORT'
  subtype: string; // e.g., 'VALID_TYPE', 'ROLE', 'STATUS', 'WORKFLOW_TYPE'
  name: string;
  code: string; // Unique code within type-subtype combination
  description?: string;
  metadata?: Record<string, any>; // Flexible metadata for service-specific data
  isActive: boolean;
  sortOrder: number;
  parentId?: string; // For hierarchical categories
  service: string; // Which microservice owns this category
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export class CategoryEntity {
  private _id: string;
  private _type: string;
  private _subtype: string;
  private _name: string;
  private _code: string;
  private _description?: string;
  private _metadata: Record<string, any>;
  private _isActive: boolean;
  private _sortOrder: number;
  private _parentId?: string;
  private _service: string;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _createdBy?: string;
  private _updatedBy?: string;
  private _domainEvents: DomainEvent[] = [];

  constructor(props: CategoryProps) {
    this._id = props.id || this.generateId();
    this._type = props.type.toUpperCase();
    this._subtype = props.subtype.toUpperCase();
    this._name = props.name;
    this._code = props.code.toUpperCase();
    this._description = props.description;
    this._metadata = props.metadata || {};
    this._isActive = props.isActive;
    this._sortOrder = props.sortOrder;
    this._parentId = props.parentId;
    this._service = props.service.toLowerCase();
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this._createdBy = props.createdBy;
    this._updatedBy = props.updatedBy;

    // Validate the category
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`Invalid category: ${validation.errors.join(', ')}`);
    }
  }

  // Getters
  get id(): string { return this._id; }
  get type(): string { return this._type; }
  get subtype(): string { return this._subtype; }
  get name(): string { return this._name; }
  get code(): string { return this._code; }
  get description(): string | undefined { return this._description; }
  get metadata(): Record<string, any> { return { ...this._metadata }; }
  get isActive(): boolean { return this._isActive; }
  get sortOrder(): number { return this._sortOrder; }
  get parentId(): string | undefined { return this._parentId; }
  get service(): string { return this._service; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get createdBy(): string | undefined { return this._createdBy; }
  get updatedBy(): string | undefined { return this._updatedBy; }
  get domainEvents(): DomainEvent[] { return [...this._domainEvents]; }

  /**
   * Create a new category
   */
  static create(props: Omit<CategoryProps, 'id' | 'createdAt' | 'updatedAt'>): CategoryEntity {
    const category = new CategoryEntity({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    category.addDomainEvent({
      eventId: category.generateEventId(),
      eventType: 'CategoryCreated',
      aggregateType: 'Category',
      aggregateId: category.id,
      timestamp: new Date(),
      version: 1,
      payload: {
        categoryId: category.id,
        type: category.type,
        subtype: category.subtype,
        name: category.name,
        description: category.description,
        service: category.service,
      },
    } as CategoryCreatedEvent);

    return category;
  }

  /**
   * Update category properties
   */
  update(updates: Partial<Pick<CategoryProps, 'name' | 'description' | 'metadata' | 'isActive' | 'sortOrder'>>, updatedBy?: string): CategoryEntity {
    const changes: Partial<CategoryProps> = {};

    if (updates.name !== undefined && updates.name !== this._name) {
      changes.name = this._name;
      this._name = updates.name;
    }

    if (updates.description !== undefined && updates.description !== this._description) {
      changes.description = this._description;
      this._description = updates.description;
    }

    if (updates.metadata !== undefined) {
      changes.metadata = { ...this._metadata };
      this._metadata = { ...this._metadata, ...updates.metadata };
    }

    if (updates.isActive !== undefined && updates.isActive !== this._isActive) {
      changes.isActive = this._isActive;
      this._isActive = updates.isActive;
    }

    if (updates.sortOrder !== undefined && updates.sortOrder !== this._sortOrder) {
      changes.sortOrder = this._sortOrder;
      this._sortOrder = updates.sortOrder;
    }

    if (Object.keys(changes).length > 0) {
      this._updatedAt = new Date();
      this._updatedBy = updatedBy;

      this.addDomainEvent({
        eventId: this.generateEventId(),
        eventType: 'CategoryUpdated',
        aggregateType: 'Category',
        aggregateId: this.id,
        timestamp: new Date(),
        version: 1,
        payload: {
          categoryId: this.id,
          type: this.type,
          subtype: this.subtype,
          changes,
          service: this.service,
        },
      } as CategoryUpdatedEvent);
    }
    return this;
  }

  /**
   * Deactivate category (soft delete)
   */
  deactivate(deactivatedBy?: string): CategoryEntity {
    if (this._isActive) {
      this._isActive = false;
      this._updatedAt = new Date();
      this._updatedBy = deactivatedBy;

      this.addDomainEvent({
        eventId: this.generateEventId(),
        eventType: 'CategoryUpdated',
        aggregateType: 'Category',
        aggregateId: this.id,
        timestamp: new Date(),
        version: 1,
        payload: {
          categoryId: this.id,
          type: this.type,
          subtype: this.subtype,
          changes: { isActive: true },
          service: this.service,
        },
      } as CategoryUpdatedEvent);
    }
    return this;
  }


  /**
   * Reactivates the category
   */
  reactivate(): CategoryEntity {
    return new CategoryEntity({...this.toProps(), isActive: true});
  }

  /**
   * Mark category for deletion
   */
  markForDeletion(deletedBy?: string): CategoryEntity {
    this._updatedAt = new Date();
    this._updatedBy = deletedBy;

    this.addDomainEvent({
      eventId: this.generateEventId(),
      eventType: 'CategoryDeleted',
      aggregateType: 'Category',
      aggregateId: this.id,
      timestamp: new Date(),
      version: 1,
      payload: {
        categoryId: this.id,
        type: this.type,
        subtype: this.subtype,
        service: this.service,
      },
    } as CategoryDeletedEvent);
    return this;
  }

  /**
   * Get full category path (for hierarchical categories)
   */
  getFullPath(categories: CategoryEntity[]): string {
    if (!this._parentId) {
      return this._name;
    }

    const parent = categories.find(c => c.id === this._parentId);
    if (!parent) {
      return this._name;
    }

    return `${parent.getFullPath(categories)} > ${this._name}`;
  }

  /**
   * Check if category matches type and subtype
   */
  matches(type: string, subtype?: string): boolean {
    const typeMatch = this._type === type.toUpperCase();
    if (!subtype) {
      return typeMatch;
    }
    return typeMatch && this._subtype === subtype.toUpperCase();
  }

  /**
   * Get category for display
   */
  toDisplay(): { id: string; name: string; code: string; description?: string; metadata: Record<string, any> } {
    return {
      id: this._id,
      name: this._name,
      code: this._code,
      description: this._description,
      metadata: this._metadata,
    };
  }

  /**
   * Convert to plain object
   */
  toProps(): CategoryProps {
    return {
      id: this._id,
      type: this._type,
      subtype: this._subtype,
      name: this._name,
      code: this._code,
      description: this._description,
      metadata: this._metadata,
      isActive: this._isActive,
      sortOrder: this._sortOrder,
      parentId: this._parentId,
      service: this._service,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      createdBy: this._createdBy,
      updatedBy: this._updatedBy,
    };
  }

  /**
   * Validate category data
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this._type || this._type.trim().length === 0) {
      errors.push('Type is required');
    }

    if (!this._subtype || this._subtype.trim().length === 0) {
      errors.push('Subtype is required');
    }

    if (!this._name || this._name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!this._code || this._code.trim().length === 0) {
      errors.push('Code is required');
    }

    if (!this._service || this._service.trim().length === 0) {
      errors.push('Service is required');
    }

    if (this._sortOrder < 0) {
      errors.push('Sort order cannot be negative');
    }

    // Validate service names
    const validServices = ['auth-service', 'resources-service', 'availability-service', 'stockpile-service', 'reports-service'];
    if (this._service && !validServices.includes(this._service)) {
      errors.push(`Invalid service. Valid services are: ${validServices.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clear domain events
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * Add domain event
   */
  private addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Category factory for common category types
 */
export class CategoryFactory {
  /**
   * Create resource type categories
   */
  static createResourceTypes(): CategoryEntity[] {
    const resourceTypes = [
      { code: 'ROOM', name: 'Room', description: 'Meeting rooms and offices', sortOrder: 1 },
      { code: 'EQUIPMENT', name: 'Equipment', description: 'Movable equipment and devices', sortOrder: 2 },
      { code: 'AUDITORIUM', name: 'Auditorium', description: 'Large presentation spaces', sortOrder: 3 },
      { code: 'LABORATORY', name: 'Laboratory', description: 'Scientific and research labs', sortOrder: 4 },
      { code: 'COMPUTER', name: 'Computer Lab', description: 'Computer and technology labs', sortOrder: 5 },
    ];

    return resourceTypes.map(type => 
      CategoryEntity.create({
        type: 'RESOURCE',
        subtype: 'VALID_TYPE',
        name: type.name,
        code: type.code,
        description: type.description,
        isActive: true,
        sortOrder: type.sortOrder,
        service: 'resources-service',
      })
    );
  }

  /**
   * Create user role categories
   */
  static createUserRoles(): CategoryEntity[] {
    const roles = [
      { code: 'ADMIN', name: 'Administrator', description: 'System administrator', sortOrder: 1 },
      { code: 'STAFF', name: 'Staff', description: 'University staff member', sortOrder: 2 },
      { code: 'TEACHER', name: 'Teacher', description: 'Faculty member', sortOrder: 3 },
      { code: 'STUDENT', name: 'Student', description: 'University student', sortOrder: 4 },
      { code: 'GUEST', name: 'Guest', description: 'External user', sortOrder: 5 },
    ];

    return roles.map(role => 
      CategoryEntity.create({
        type: 'USER',
        subtype: 'ROLE',
        name: role.name,
        code: role.code,
        description: role.description,
        isActive: true,
        sortOrder: role.sortOrder,
        service: 'auth-service',
      })
    );
  }

  /**
   * Create reservation status categories
   */
  static createReservationStatuses(): CategoryEntity[] {
    const statuses = [
      { code: 'PENDING', name: 'Pending', description: 'Awaiting approval', sortOrder: 1 },
      { code: 'APPROVED', name: 'Approved', description: 'Approved and confirmed', sortOrder: 2 },
      { code: 'REJECTED', name: 'Rejected', description: 'Request rejected', sortOrder: 3 },
      { code: 'CANCELLED', name: 'Cancelled', description: 'Cancelled by user', sortOrder: 4 },
      { code: 'COMPLETED', name: 'Completed', description: 'Successfully completed', sortOrder: 5 },
    ];

    return statuses.map(status => 
      CategoryEntity.create({
        type: 'RESERVATION',
        subtype: 'STATUS',
        name: status.name,
        code: status.code,
        description: status.description,
        isActive: true,
        sortOrder: status.sortOrder,
        service: 'availability-service',
      })
    );
  }
}
