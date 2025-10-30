import { IsString, IsEmail, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating user information
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User first name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'User last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'User email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Username' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'User active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Email verified status' })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ description: 'User profile data' })
  @IsOptional()
  profileData?: Record<string, any>;
}

/**
 * DTO for creating roles
 */
export class CreateRoleDto {
  @ApiProperty({ description: 'Role name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Role code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Role description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Category code for the role' })
  @IsString()
  categoryCode: string;

  @ApiPropertyOptional({ description: 'Role active status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Permission IDs to assign to role' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[];
}

/**
 * DTO for updating roles
 */
export class UpdateRoleDto {
  @ApiPropertyOptional({ description: 'Role name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Role description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Role active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Permission IDs to assign to role' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[];
}

/**
 * DTO for role assignment operations
 */
export class AssignRoleDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Role ID' })
  @IsString()
  roleId: string;
}

/**
 * DTO for role removal operations
 */
export class RemoveRoleDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Role ID' })
  @IsString()
  roleId: string;
}
