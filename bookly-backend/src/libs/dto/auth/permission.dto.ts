import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsIn, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Unique name for the permission',
    example: 'resources:create:global',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Resource that the permission applies to',
    example: 'resources',
    enum: ['users', 'roles', 'permissions', 'resources', 'reservations', 'reports'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['users', 'roles', 'permissions', 'resources', 'reservations', 'reports'])
  resource: string;

  @ApiProperty({
    description: 'Action that can be performed',
    example: 'create',
    enum: ['create', 'read', 'update', 'delete', 'approve', 'reject'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['create', 'read', 'update', 'delete', 'approve', 'reject'])
  action: string;

  @ApiPropertyOptional({
    description: 'Scope of the permission',
    example: 'global',
    enum: ['own', 'program', 'global'],
    default: 'global',
  })
  @IsString()
  @IsOptional()
  @IsIn(['own', 'program', 'global'])
  scope?: string;

  @ApiPropertyOptional({
    description: 'Description of the permission',
    example: 'Allows creating resources globally',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional conditions for the permission',
    example: { timeRestriction: '08:00-18:00' },
  })
  @IsOptional()
  conditions?: any;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    description: 'Unique name for the permission',
    example: 'resources:create:global',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Resource that the permission applies to',
    example: 'resources',
    enum: ['users', 'roles', 'permissions', 'resources', 'reservations', 'reports'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['users', 'roles', 'permissions', 'resources', 'reservations', 'reports'])
  resource?: string;

  @ApiPropertyOptional({
    description: 'Action that can be performed',
    example: 'create',
    enum: ['create', 'read', 'update', 'delete', 'approve', 'reject'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['create', 'read', 'update', 'delete', 'approve', 'reject'])
  action?: string;

  @ApiPropertyOptional({
    description: 'Scope of the permission',
    example: 'global',
    enum: ['own', 'program', 'global'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['own', 'program', 'global'])
  scope?: string;

  @ApiPropertyOptional({
    description: 'Description of the permission',
    example: 'Allows creating resources globally',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional conditions for the permission',
    example: { timeRestriction: '08:00-18:00' },
  })
  @IsOptional()
  conditions?: any;

  @ApiPropertyOptional({
    description: 'Whether the permission is active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class PermissionResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the permission',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Unique name for the permission',
    example: 'resources:create:global',
  })
  name: string;

  @ApiProperty({
    description: 'Resource that the permission applies to',
    example: 'resources',
  })
  resource: string;

  @ApiProperty({
    description: 'Action that can be performed',
    example: 'create',
  })
  action: string;

  @ApiProperty({
    description: 'Scope of the permission',
    example: 'global',
  })
  scope: string;

  @ApiPropertyOptional({
    description: 'Additional conditions for the permission',
    example: { timeRestriction: '08:00-18:00' },
  })
  conditions?: any;

  @ApiPropertyOptional({
    description: 'Description of the permission',
    example: 'Allows creating resources globally',
  })
  description?: string;

  @ApiProperty({
    description: 'Whether the permission is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}

export class AssignPermissionToRoleDto {
  @ApiProperty({
    description: 'Permission ID to assign',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  permissionId: string;

  @ApiPropertyOptional({
    description: 'ID of the user granting the permission',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  @IsOptional()
  grantedBy?: string;
}

export class RolePermissionResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the role-permission assignment',
    example: '507f1f77bcf86cd799439013',
  })
  id: string;

  @ApiProperty({
    description: 'Role ID',
    example: '507f1f77bcf86cd799439014',
  })
  roleId: string;

  @ApiProperty({
    description: 'Permission ID',
    example: '507f1f77bcf86cd799439011',
  })
  permissionId: string;

  @ApiProperty({
    description: 'When the permission was granted',
    example: '2024-01-15T10:30:00Z',
  })
  grantedAt: Date;

  @ApiPropertyOptional({
    description: 'ID of the user who granted the permission',
    example: '507f1f77bcf86cd799439012',
  })
  grantedBy?: string;

  @ApiPropertyOptional({
    description: 'Permission details',
    type: PermissionResponseDto,
  })
  permission?: PermissionResponseDto;
}
