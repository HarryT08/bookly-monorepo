import { IsString, IsOptional, IsInt, IsObject, IsIn, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AvailableScheduleDto } from './create-resource.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

/**
 * DTO for updating an existing resource
 * Implements RF-01 (edit resource) and RF-03 (define key attributes)
 */
export class UpdateResourceDto {
  @ApiPropertyOptional({ description: 'Resource name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Resource description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Resource type', 
    enum: ['ROOM', 'EQUIPMENT', 'AUDITORIUM', 'LABORATORY', 'COMPUTER']
  })
  @IsOptional()
  @IsString()
  @IsIn(['ROOM', 'EQUIPMENT', 'AUDITORIUM', 'LABORATORY', 'COMPUTER'])
  type?: string;

  @ApiPropertyOptional({ description: 'Resource capacity (number of people)', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ description: 'Resource location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ 
    description: 'Resource status', 
    enum: ['AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RESERVED']
  })
  @IsOptional()
  @IsString()
  @IsIn(['AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RESERVED'])
  status?: string;

  @ApiPropertyOptional({ description: 'Flexible attributes for different resource types' })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Available schedules and rules', type: AvailableScheduleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AvailableScheduleDto)
  availableSchedules?: AvailableScheduleDto;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Resource active status' })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'User ID who is updating the resource' })
  @IsString()
  updatedBy: string;
}
