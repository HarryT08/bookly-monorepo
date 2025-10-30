import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Length, IsInt, Min, Max, IsHexColor } from 'class-validator';

/**
 * HITO 6 - RF-06: MaintenanceType DTOs
 */

export class CreateMaintenanceTypeDto {
  @ApiProperty({
    description: 'Maintenance type name',
    example: 'LIMPIEZA_PROFUNDA',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  name: string;

  @ApiPropertyOptional({
    description: 'Maintenance type description',
    example: 'Limpieza profunda programada mensualmente',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Color for UI display (hex format)',
    example: '#2196F3',
  })
  @IsString()
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({
    description: 'Priority level (0-10)',
    example: 5,
    minimum: 0,
    maximum: 10,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(10)
  priority?: number;
}

export class UpdateMaintenanceTypeDto {
  @ApiPropertyOptional({
    description: 'Maintenance type name (cannot update default types)',
    example: 'LIMPIEZA_PROFUNDA',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @Length(3, 50)
  name?: string;

  @ApiPropertyOptional({
    description: 'Maintenance type description',
    example: 'Limpieza profunda programada mensualmente',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Color for UI display (hex format)',
    example: '#2196F3',
  })
  @IsString()
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({
    description: 'Priority level (0-10)',
    example: 5,
    minimum: 0,
    maximum: 10,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(10)
  priority?: number;
}

export class MaintenanceTypeResponseDto {
  @ApiProperty({ description: 'Maintenance type ID' })
  id: string;

  @ApiProperty({ description: 'Maintenance type name' })
  name: string;

  @ApiPropertyOptional({ description: 'Maintenance type description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Color for UI display' })
  color?: string;

  @ApiProperty({ description: 'Priority level' })
  priority: number;

  @ApiProperty({ description: 'Whether this is a default system type' })
  isDefault: boolean;

  @ApiProperty({ description: 'Whether the type is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class MaintenanceTypeListResponseDto {
  @ApiProperty({ type: [MaintenanceTypeResponseDto] })
  maintenanceTypes: MaintenanceTypeResponseDto[];

  @ApiProperty({ description: 'Total number of maintenance types' })
  total: number;
}
