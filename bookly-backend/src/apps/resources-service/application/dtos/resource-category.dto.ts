import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty } from 'class-validator';

/**
 * HITO 6 - RF-02: Resource Category Association DTOs
 */

export class AssignResourceCategoriesDto {
  @ApiProperty({
    description: 'Array of category IDs to assign to the resource',
    example: ['category1', 'category2'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  categoryIds: string[];
}

export class ResourceCategoryResponseDto {
  @ApiProperty({ description: 'Association ID' })
  id: string;

  @ApiProperty({ description: 'Resource ID' })
  resourceId: string;

  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Category name' })
  categoryName: string;

  @ApiProperty({ description: 'Category description' })
  categoryDescription?: string;

  @ApiProperty({ description: 'Category color' })
  categoryColor?: string;

  @ApiProperty({ description: 'User who assigned the category' })
  assignedBy: string;

  @ApiProperty({ description: 'Assignment timestamp' })
  assignedAt: Date;
}

export class ResourceCategoriesListResponseDto {
  @ApiProperty({ type: [ResourceCategoryResponseDto] })
  categories: ResourceCategoryResponseDto[];

  @ApiProperty({ description: 'Total number of categories assigned' })
  total: number;
}
