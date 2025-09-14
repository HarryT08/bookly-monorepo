import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for assigning a user as responsible for a resource
 * Implements RF-06 (resource responsibility assignments)
 */
export class AssignResponsibleDto {
  @ApiProperty({ description: 'Resource ID' })
  @IsString()
  resourceId: string;

  @ApiProperty({ description: 'User ID to assign as responsible' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'User ID who is making the assignment' })
  @IsString()
  assignedBy: string;
}

/**
 * DTO for assigning multiple users as responsible for a resource
 */
export class AssignMultipleResponsiblesDto {
  @ApiProperty({ description: 'Resource ID' })
  @IsString()
  resourceId: string;

  @ApiProperty({ description: 'Array of user IDs to assign as responsible', type: [String] })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty({ description: 'User ID who is making the assignment' })
  @IsString()
  assignedBy: string;
}

/**
 * DTO for replacing all responsible users for a resource
 */
export class ReplaceResourceResponsiblesDto {
  @ApiProperty({ description: 'Resource ID' })
  @IsString()
  resourceId: string;

  @ApiProperty({ description: 'Array of new user IDs to be responsible', type: [String] })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty({ description: 'User ID who is making the replacement' })
  @IsString()
  assignedBy: string;
}

/**
 * DTO for deactivating a user's responsibility
 */
export class DeactivateResponsibleDto {
  @ApiProperty({ description: 'Resource ID' })
  @IsString()
  resourceId: string;

  @ApiProperty({ description: 'User ID to deactivate' })
  @IsString()
  userId: string;
}

/**
 * DTO for getting resource responsibles
 */
export class GetResourceResponsiblesDto {
  @ApiProperty({ description: 'Resource ID' })
  @IsString()
  resourceId: string;

  @ApiPropertyOptional({ description: 'Only get active assignments', default: true })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;
}

/**
 * DTO for getting user responsibilities
 */
export class GetUserResponsibilitiesDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Only get active assignments', default: true })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;
}

/**
 * DTO for getting resources by user with pagination
 */
export class GetResourcesByUserDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}

/**
 * DTO for checking if user is responsible for resource
 */
export class IsUserResponsibleDto {
  @ApiProperty({ description: 'Resource ID' })
  @IsString()
  resourceId: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;
}

/**
 * DTO for getting responsibilities with pagination and filters
 */
export class GetResponsibilitiesDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by resource ID' })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO for bulk assign responsible to resources
 */
export class BulkAssignResponsibleDto {
  @ApiProperty({ description: 'Array of resource IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  resourceIds: string[];

  @ApiProperty({ description: 'User ID to assign as responsible' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'User ID who is making the assignment' })
  @IsString()
  assignedBy: string;
}

/**
 * DTO for transferring responsibilities
 */
export class TransferResponsibilitiesDto {
  @ApiProperty({ description: 'User ID to transfer from' })
  @IsString()
  fromUserId: string;

  @ApiProperty({ description: 'User ID to transfer to' })
  @IsString()
  toUserId: string;

  @ApiProperty({ description: 'User ID who is making the transfer' })
  @IsString()
  assignedBy: string;

  @ApiPropertyOptional({ description: 'Specific resource IDs to transfer (optional)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourceIds?: string[];
}

/**
 * Response DTO for resource responsible assignments
 */
export class ResourceResponsibleResponseDto {
  @ApiProperty({ description: 'Assignment ID' })
  id: string;

  @ApiProperty({ description: 'Resource ID' })
  resourceId: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User who made the assignment' })
  assignedBy: string;

  @ApiProperty({ description: 'Assignment date' })
  assignedAt: Date;

  @ApiProperty({ description: 'Whether the assignment is active' })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Full name of the responsible user' })
  userFullName?: string;

  @ApiPropertyOptional({ description: 'Email of the responsible user' })
  userEmail?: string;

  @ApiPropertyOptional({ description: 'Full name of who assigned the responsibility' })
  assignedByFullName?: string;
}
