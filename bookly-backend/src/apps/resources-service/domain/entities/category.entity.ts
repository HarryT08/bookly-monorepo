/**
 * Category Entity - Domain Model
 * Represents a resource category in the system
 */
export class CategoryEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly color: string | null,
    public readonly isActive: boolean,
    public readonly isDefault: boolean,
    public readonly priority: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Updates category information
   * Default categories cannot change their name
   */
  update(
    name?: string,
    description?: string,
    color?: string,
    priority?: number,
  ): CategoryEntity {
    // Default categories cannot change their name
    const updatedName = this.isDefault ? this.name : (name || this.name);
    
    return new CategoryEntity(
      this.id,
      updatedName,
      description !== undefined ? description : this.description,
      color !== undefined ? color : this.color,
      this.isActive,
      this.isDefault,
      priority !== undefined ? priority : this.priority,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Deactivates the category
   * Default categories cannot be deactivated
   */
  deactivate(): CategoryEntity {
    if (this.isDefault) {
      throw new Error('Default categories cannot be deactivated');
    }

    return new CategoryEntity(
      this.id,
      this.name,
      this.description,
      this.color,
      false,
      this.isDefault,
      this.priority,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Reactivates the category
   */
  reactivate(): CategoryEntity {
    return new CategoryEntity(
      this.id,
      this.name,
      this.description,
      this.color,
      true,
      this.isDefault,
      this.priority,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Checks if this is a default category
   */
  isDefaultCategory(): boolean {
    return this.isDefault;
  }

  /**
   * Checks if the category is active
   */
  isActiveCategory(): boolean {
    return this.isActive;
  }
}
