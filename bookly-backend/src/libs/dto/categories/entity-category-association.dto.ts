import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from './category-response.dto';

export class EntityCategoryAssociationDto {
  @ApiProperty({
    description: 'Association ID',
    example: '507f1f77bcf86cd799439011'
  })
  id: string;

  @ApiProperty({
    description: 'Entity ID',
    example: '507f1f77bcf86cd799439012'
  })
  entityId: string;

  @ApiProperty({
    description: 'Entity type (role, user, resource, program, incident_report, report)',
    example: 'role'
  })
  entityType: string;

  @ApiProperty({
    description: 'Category ID',
    example: '507f1f77bcf86cd799439013'
  })
  categoryId: string;

  @ApiProperty({
    description: 'Category details',
    type: CategoryResponseDto
  })
  category: CategoryResponseDto;

  @ApiProperty({
    description: 'User who assigned the category',
    example: '507f1f77bcf86cd799439014',
    required: false
  })
  assignedBy?: string;

  @ApiProperty({
    description: 'User details who assigned the category',
    required: false
  })
  assignedByUser?: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty({
    description: 'Assignment date',
    example: '2025-01-15T10:30:00Z'
  })
  assignedAt: Date;
}
