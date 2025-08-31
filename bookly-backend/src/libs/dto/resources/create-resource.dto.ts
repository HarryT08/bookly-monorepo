import { IsString, IsOptional, IsInt, IsObject, IsArray, ValidateNested, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for available schedule configuration
 * Implements RF-05 (configuration of availability rules)
 */
export class OperatingHourDto {
  @ApiProperty({ description: 'Day of week (0-6, Sunday to Saturday)', minimum: 0, maximum: 6 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ description: 'Start time in HH:mm format', example: '08:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time in HH:mm format', example: '18:00' })
  @IsString()
  endTime: string;
}

export class RestrictionDto {
  @ApiPropertyOptional({ description: 'User types allowed to reserve', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userTypes?: string[];

  @ApiPropertyOptional({ description: 'Maximum reservation duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxReservationDuration?: number;

  @ApiPropertyOptional({ description: 'Minimum reservation duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  minReservationDuration?: number;

  @ApiPropertyOptional({ description: 'Maximum days in advance to reserve' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxAdvanceReservation?: number;

  @ApiPropertyOptional({ description: 'Minimum hours in advance to reserve' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minAdvanceReservation?: number;
}

export class PriorityDto {
  @ApiProperty({ description: 'User type' })
  @IsString()
  userType: string;

  @ApiProperty({ description: 'Priority level (higher number = higher priority)' })
  @IsInt()
  @Min(0)
  priority: number;
}

export class AvailableScheduleDto {
  @ApiProperty({ description: 'Operating hours for each day', type: [OperatingHourDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatingHourDto)
  operatingHours: OperatingHourDto[];

  @ApiProperty({ description: 'Reservation restrictions', type: RestrictionDto })
  @IsObject()
  @ValidateNested()
  @Type(() => RestrictionDto)
  restrictions: RestrictionDto;

  @ApiProperty({ description: 'User type priorities', type: [PriorityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriorityDto)
  priorities: PriorityDto[];
}

/**
 * DTO for creating a new resource
 * Implements RF-01 (create resource) and RF-03 (define key attributes)
 */
export class CreateResourceDto {
  @ApiProperty({ description: 'Resource name', example: 'Sala de Conferencias A1' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Resource description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Resource type', 
    enum: ['ROOM', 'EQUIPMENT', 'AUDITORIUM', 'LABORATORY', 'COMPUTER'],
    example: 'ROOM'
  })
  @IsString()
  @IsIn(['ROOM', 'EQUIPMENT', 'AUDITORIUM', 'LABORATORY', 'COMPUTER'])
  type: string;

  @ApiPropertyOptional({ description: 'Resource capacity (number of people)', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ description: 'Resource location', example: 'Edificio A, Piso 2, Sala 201' })
  @IsOptional()
  @IsString()
  location?: string;

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

  @ApiProperty({ description: 'Academic Program ID - Required for resource classification' })
  @IsString()
  programId: string;
}
