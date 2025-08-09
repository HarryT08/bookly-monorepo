/**
 * Penalty Query DTO
 * Data Transfer Object for penalty query parameters
 */

import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber, IsArray, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PenaltyType, PenaltyScope } from './create-penalty.dto';

export class PenaltyQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by program ID',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  @IsOptional()
  programId?: string;

  @ApiPropertyOptional({
    description: 'Filter by penalty type',
    enum: PenaltyType,
    example: PenaltyType.WARNING
  })
  @IsEnum(PenaltyType)
  @IsOptional()
  penaltyType?: PenaltyType;

  @ApiPropertyOptional({
    description: 'Filter by penalty scope',
    enum: PenaltyScope,
    example: PenaltyScope.ALL_RESOURCES
  })
  @IsEnum(PenaltyScope)
  @IsOptional()
  scope?: PenaltyScope;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by appealable status',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isAppealable?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by minimum duration in days',
    example: 1,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minDurationDays?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum duration in days',
    example: 30,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxDurationDays?: number;

  @ApiPropertyOptional({
    description: 'Filter by minimum points threshold',
    example: 10,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  minPointsThreshold?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum points threshold',
    example: 50,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  maxPointsThreshold?: number;

  @ApiPropertyOptional({
    description: 'Search in penalty names and descriptions',
    example: 'no show'
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by creator user ID',
    example: '507f1f77bcf86cd799439012'
  })
  @IsString()
  @IsOptional()
  createdBy?: string;

  @ApiPropertyOptional({
    description: 'Filter by creation date from (ISO string)',
    example: '2024-01-01T00:00:00Z'
  })
  @IsString()
  @IsOptional()
  createdFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by creation date to (ISO string)',
    example: '2024-12-31T23:59:59Z'
  })
  @IsString()
  @IsOptional()
  createdTo?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    enum: ['name', 'penaltyType', 'durationDays', 'pointsThreshold', 'createdAt', 'updatedAt']
  })
  @IsString()
  @IsOptional()
  sortBy?: 'name' | 'penaltyType' | 'durationDays' | 'pointsThreshold' | 'createdAt' | 'updatedAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Include usage statistics',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  includeStatistics?: boolean = false;

  @ApiPropertyOptional({
    description: 'Include escalation rules',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  includeEscalationRules?: boolean = false;

  @ApiPropertyOptional({
    description: 'Include restrictions details',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  includeRestrictions?: boolean = false;
}
