import { IsString, IsOptional, IsBoolean, IsArray, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum RoleCategory {
  ACADEMIC = 'academic',
  ADMINISTRATIVE = 'administrative',
  SECURITY = 'security',
  CUSTOM = 'custom',
}

export class CreateRoleDto {
  @ApiProperty({
    description: 'Name of the role',
    example: 'Custom Manager',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the role',
    example: 'Custom role for managing specific resources',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: 'Category of the role',
    enum: RoleCategory,
    example: RoleCategory.CUSTOM,
  })
  @IsOptional()
  @IsEnum(RoleCategory)
  category?: RoleCategory;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({
    description: 'Name of the role',
    example: 'Updated Manager',
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the role',
    example: 'Updated description for the role',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the role is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssignPermissionDto {
  @ApiProperty({
    description: 'ID of the permission to assign',
    example: '60f1b2b3c4d5e6f7a8b9c0d1',
  })
  @IsString()
  permissionId: string;
}

export class RoleResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the role',
    example: '60f1b2b3c4d5e6f7a8b9c0d1',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the role',
    example: 'Administrador General',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the role',
    example: 'Administrator with full system access',
  })
  description: string;

  @ApiProperty({
    description: 'Category of the role',
    enum: RoleCategory,
    example: RoleCategory.ADMINISTRATIVE,
  })
  category: RoleCategory;

  @ApiProperty({
    description: 'Whether the role is predefined',
    example: true,
  })
  isPredefined: boolean;

  @ApiProperty({
    description: 'Whether the role is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Permissions assigned to this role',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        resource: { type: 'string' },
        action: { type: 'string' },
        scope: { type: 'string' },
      },
    },
  })
  @IsOptional()
  @IsArray()
  permissions?: any[];

  constructor(partial: Partial<RoleResponseDto>) {
    Object.assign(this, partial);
  }
}

export class RoleListResponseDto {
  @ApiProperty({
    description: 'List of roles',
    type: [RoleResponseDto],
  })
  roles: RoleResponseDto[];

  @ApiProperty({
    description: 'Total number of roles',
    example: 10,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  constructor(partial: Partial<RoleListResponseDto>) {
    Object.assign(this, partial);
  }
}

export class AssignRoleToUserDto {
  @ApiProperty({
    description: 'ID of the user to assign the role to',
    example: '60f1b2b3c4d5e6f7a8b9c0d1',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'ID of the role to assign',
    example: '60f1b2b3c4d5e6f7a8b9c0d1',
  })
  @IsString()
  roleId: string;
}
