/**
 * Create Penalty DTO
 * Data Transfer Object for creating penalties
 */

import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PenaltyType {
  WARNING = 'WARNING',
  TEMPORARY_RESTRICTION = 'TEMPORARY_RESTRICTION',
  PERMANENT_RESTRICTION = 'PERMANENT_RESTRICTION',
  SUSPENSION = 'SUSPENSION',
  POINTS_DEDUCTION = 'POINTS_DEDUCTION',
  CUSTOM = 'CUSTOM'
}

export enum PenaltyScope {
  SPECIFIC_RESOURCE = 'SPECIFIC_RESOURCE',
  RESOURCE_TYPE = 'RESOURCE_TYPE',
  ALL_RESOURCES = 'ALL_RESOURCES',
  PROGRAM_WIDE = 'PROGRAM_WIDE',
  SYSTEM_WIDE = 'SYSTEM_WIDE'
}

export class CreatePenaltyDto {
  @ApiProperty({
    description: 'Name of the penalty',
    example: 'No Show Warning - First Offense'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the penalty',
    example: 'Warning issued for first no-show incident'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Type of penalty',
    enum: PenaltyType,
    example: PenaltyType.WARNING
  })
  @IsEnum(PenaltyType)
  penaltyType: PenaltyType;

  @ApiProperty({
    description: 'Scope of the penalty application',
    enum: PenaltyScope,
    example: PenaltyScope.ALL_RESOURCES
  })
  @IsEnum(PenaltyScope)
  scope: PenaltyScope;

  @ApiProperty({
    description: 'Program ID this penalty applies to',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  @IsNotEmpty()
  programId: string;

  @ApiProperty({
    description: 'Duration in days (0 for permanent)',
    example: 7,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  durationDays: number;

  @ApiPropertyOptional({
    description: 'Points threshold to trigger this penalty',
    example: 20,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  pointsThreshold?: number;

  @ApiPropertyOptional({
    description: 'Whether this penalty is currently active',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'Whether this penalty can be appealed',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isAppealable?: boolean = true;

  @ApiPropertyOptional({
    description: 'Automatic escalation rules',
    example: {
      escalateAfterDays: 30,
      escalationPenaltyId: '507f1f77bcf86cd799439012'
    }
  })
  @IsOptional()
  escalationRules?: {
    escalateAfterDays?: number;
    escalationPenaltyId?: string;
    conditions?: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: 'Restrictions imposed by this penalty',
    example: {
      maxReservationsPerDay: 1,
      maxReservationDuration: 120,
      restrictedResourceTypes: ['AUDITORIUM'],
      requiresApproval: true
    }
  })
  @IsOptional()
  restrictions?: {
    maxReservationsPerDay?: number;
    maxReservationDuration?: number;
    restrictedResourceTypes?: string[];
    restrictedResources?: string[];
    requiresApproval?: boolean;
    blackoutPeriods?: Array<{
      startTime: string;
      endTime: string;
      days: number[];
    }>;
  };

  @ApiPropertyOptional({
    description: 'Custom metadata for the penalty',
    example: {
      category: 'behavioral',
      severity: 'moderate'
    }
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
