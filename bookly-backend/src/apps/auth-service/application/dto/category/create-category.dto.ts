import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Operativo'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Category code (will be auto-generated if not provided)',
    example: 'OPERATIONAL',
    required: false
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Roles operativos del sistema',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Category metadata',
    example: { color: '#8B5CF6', isDefault: false },
    required: false
  })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiProperty({
    description: 'Sort order',
    example: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({
    description: 'Whether category is active',
    example: true,
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
