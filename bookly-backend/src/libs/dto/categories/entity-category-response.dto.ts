import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from './category-response.dto';

export class EntityCategoryResponseDto {
  @ApiProperty({
    description: 'Entity ID',
    example: '507f1f77bcf86cd799439011'
  })
  entityId: string;

  @ApiProperty({
    description: 'Entity type (role, user, resource, program, incident_report, report)',
    example: 'role'
  })
  entityType: string;

  @ApiProperty({
    description: 'Associated categories',
    type: [CategoryResponseDto]
  })
  categories: CategoryResponseDto[];

  @ApiProperty({
    description: 'Assignment date',
    example: '2025-01-15T10:30:00Z'
  })
  assignedAt: Date;

  @ApiProperty({
    description: 'User who assigned the categories',
    example: '507f1f77bcf86cd799439013',
    required: false
  })
  assignedBy?: string;
}
