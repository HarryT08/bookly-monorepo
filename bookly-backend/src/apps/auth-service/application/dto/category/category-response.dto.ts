import { ApiProperty } from '@nestjs/swagger';
import { CategoryEntity } from '@libs/common/entities/category.entity';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: '507f1f77bcf86cd799439011'
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Académico'
  })
  name: string;

  @ApiProperty({
    description: 'Category code',
    example: 'ACADEMIC'
  })
  code: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Roles académicos (estudiantes, docentes)',
    required: false
  })
  description?: string;

  @ApiProperty({
    description: 'Category type',
    example: 'AUTH'
  })
  type: string;

  @ApiProperty({
    description: 'Category subtype',
    example: 'ROLE'
  })
  subtype: string;

  @ApiProperty({
    description: 'Service name',
    example: 'auth-service'
  })
  service: string;

  @ApiProperty({
    description: 'Whether category is active',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Category metadata',
    example: { color: '#3B82F6', isDefault: true },
    required: false
  })
  metadata?: any;

  @ApiProperty({
    description: 'Sort order',
    example: 1
  })
  sortOrder: number;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-01-15T10:30:00Z'
  })
  updatedAt: Date;

  static fromEntity(entity: CategoryEntity): CategoryResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      code: entity.code,
      description: entity.description,
      type: entity.type,
      subtype: entity.subtype,
      service: entity.service,
      isActive: entity.isActive,
      metadata: entity.metadata,
      sortOrder: entity.sortOrder,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static fromEntities(entities: CategoryEntity[]): CategoryResponseDto[] {
    return entities.map(entity => CategoryResponseDto.fromEntity(entity));
  }
}
