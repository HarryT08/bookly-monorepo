import { CategoryEntity } from "@libs/common/entities/category.entity";
import { CategoryFilter } from "@libs/common/repositories/category.repository";
import { CategoryResponseDto } from "@libs/dto/categories";
import { LoggingService } from "@libs/logging/logging.service";
import { Inject, Injectable } from "@nestjs/common";
import { CategoryUserGroupRepository } from "../../infrastructure/repositories/prisma-category-user-group.repository";

@Injectable()
export class CategoryUserGroupService {
  private readonly type: string;
  private readonly subtype: string;
  private readonly serviceName: string;

  constructor(
    @Inject("CategoryUserGroupRepository")
    private readonly categoryUserGroupRepository: CategoryUserGroupRepository,
    private readonly loggingService: LoggingService
  ) {
    this.type = categoryUserGroupRepository.getType;
    this.subtype = categoryUserGroupRepository.getSubtype;
    this.serviceName = categoryUserGroupRepository.getServiceName;
  }

  async findById(id: string): Promise<CategoryResponseDto | null> {
    return this.categoryUserGroupRepository.findById(id);
  }

  async findByCode(code: string): Promise<CategoryEntity | null> {
    return this.categoryUserGroupRepository.findByCode(
      this.type,
      this.subtype,
      code
    );
  }

  async findByActive(): Promise<CategoryEntity[]> {
    return this.categoryUserGroupRepository.findByTypeAndSubtypeActive(
      this.type,
      this.subtype
    );
  }

  async findAll(filter?: CategoryFilter): Promise<CategoryEntity[]> {
    filter.type = this.type;

    return this.categoryUserGroupRepository.findAll(filter);
  }

  async create(category: CategoryEntity): Promise<CategoryEntity> {
    let categoryProps = category.toProps();
    categoryProps.type = this.type;
    categoryProps.subtype = this.subtype;
    categoryProps.service = this.serviceName;
    return this.categoryUserGroupRepository.save(
      new CategoryEntity(categoryProps)
    );
  }

  async update(
    id: string,
    user: Partial<CategoryEntity>,
    updatedBy?: string
  ): Promise<CategoryEntity> {
    // Add updatedBy field to the user data if provided
    const categoryProps = user.toProps();
    categoryProps.updatedBy = updatedBy;
    return this.categoryUserGroupRepository.update(
      new CategoryEntity(categoryProps)
    );
  }

  async delete(id: string, deletedBy?: string): Promise<void> {
    // Log deletion action with deletedBy information
    if (deletedBy) {
      this.loggingService.log(
        `Category ${id} deleted by ${deletedBy}`,
        "CategoryUserGroupService"
      );
    }
    return this.categoryUserGroupRepository.delete(id);
  }
}
