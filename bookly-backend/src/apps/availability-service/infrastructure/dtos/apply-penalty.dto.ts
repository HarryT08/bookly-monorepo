/**
 * Apply Penalty DTO
 * Data Transfer Object for applying penalties to users
 */

import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyPenaltyDto {
  @ApiProperty({
    description: 'User ID to apply penalty to',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Penalty ID to apply',
    example: '507f1f77bcf86cd799439012'
  })
  @IsString()
  @IsNotEmpty()
  penaltyId: string;

  @ApiProperty({
    description: 'Reason for applying the penalty',
    example: 'User failed to show up for reserved Aula Magna on 2024-01-15'
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Penalty event ID that triggered this penalty',
    example: '507f1f77bcf86cd799439013'
  })
  @IsString()
  @IsOptional()
  penaltyEventId?: string;

  @ApiPropertyOptional({
    description: 'Related reservation ID',
    example: '507f1f77bcf86cd799439014'
  })
  @IsString()
  @IsOptional()
  reservationId?: string;

  @ApiPropertyOptional({
    description: 'Related resource ID',
    example: '507f1f77bcf86cd799439015'
  })
  @IsString()
  @IsOptional()
  resourceId?: string;

  @ApiPropertyOptional({
    description: 'Custom duration in days (overrides penalty default)',
    example: 14,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  customDurationDays?: number;

  @ApiPropertyOptional({
    description: 'Additional evidence or context',
    example: ['Photo of unused resource', 'Email confirmation of no-show']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  evidence?: string[];

  @ApiPropertyOptional({
    description: 'Additional notes for the penalty application',
    example: 'User was contacted but did not respond'
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether to send notification to user',
    example: true,
    default: true
  })
  @IsOptional()
  sendNotification?: boolean = true;

  @ApiPropertyOptional({
    description: 'Custom restrictions for this specific application',
    example: {
      maxReservationsPerDay: 1,
      restrictedResourceTypes: ['AUDITORIUM']
    }
  })
  @IsOptional()
  customRestrictions?: {
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
    description: 'Additional metadata for this penalty application',
    example: {
      severity: 'moderate',
      category: 'attendance'
    }
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
