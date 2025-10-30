import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for resource response
 * Used in API responses for resource operations
 */
export class ResourceResponseDto {
  @ApiProperty({ description: 'Resource ID' })
  id: string;

  @ApiProperty({ description: 'Resource name' })
  name: string;

  @ApiProperty({ description: 'Unique resource code' })
  code: string;

  @ApiPropertyOptional({ description: 'Resource description' })
  description?: string;

  @ApiProperty({ description: 'Resource type' })
  type: string;

  @ApiPropertyOptional({ description: 'Resource capacity' })
  capacity?: number;

  @ApiPropertyOptional({ description: 'Resource location' })
  location?: string;

  @ApiProperty({ description: 'Resource status' })
  status: string;

  @ApiPropertyOptional({ description: 'Resource attributes' })
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Available schedules and rules' })
  availableSchedules?: any;

  @ApiPropertyOptional({ description: 'Category ID' })
  categoryId?: string;

  @ApiProperty({ description: 'Academic Program ID' })
  programId: string;

  @ApiProperty({ description: 'Is resource active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

/**
 * DTO for paginated resource response
 */
export class PaginatedResourceResponseDto {
  @ApiProperty({ description: 'List of resources', type: [ResourceResponseDto] })
  resources: ResourceResponseDto[];

  @ApiProperty({ description: 'Total number of resources' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}

/**
 * DTO for resource availability check response
 */
export class ResourceAvailabilityResponseDto {
  @ApiProperty({ description: 'Whether the resource is available' })
  available: boolean;

  @ApiPropertyOptional({ description: 'Reason if not available' })
  reason?: string;

  @ApiPropertyOptional({ description: 'User priority for this resource' })
  priority?: number;
}
