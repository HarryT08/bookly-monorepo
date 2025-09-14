import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for deleting a resource
 * Implements RF-01 (delete resource) - Clean Architecture patterns
 */
export class DeleteResourceDto {
  @ApiProperty({ description: 'Resource ID to delete' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'User ID who is deleting the resource' })
  @IsString()
  deletedBy: string;

  @ApiPropertyOptional({ 
    description: 'Force deletion (hard delete), otherwise performs soft delete', 
    default: false 
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
