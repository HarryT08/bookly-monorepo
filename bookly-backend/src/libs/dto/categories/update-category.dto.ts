import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Operativo Actualizado',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Roles operativos del sistema actualizados',
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
    example: 15,
    required: false
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({
    description: 'Whether category is active',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
