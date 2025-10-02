/**
 * Create Penalty Event DTO
 * Data Transfer Object for creating penalty events
 */

import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PenaltyEventType {
  NO_SHOW = 'NO_SHOW',
  LATE_CANCELLATION = 'LATE_CANCELLATION',
  RESOURCE_MISUSE = 'RESOURCE_MISUSE',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  REPEATED_VIOLATIONS = 'REPEATED_VIOLATIONS',
  CUSTOM_EVENT = 'CUSTOM_EVENT'
}

export enum PenaltySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export class CreatePenaltyEventDto {
  @ApiProperty({
    description: 'Name of the penalty event',
    example: 'No Show - Aula Magna'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the penalty event',
    example: 'User failed to show up for reserved Aula Magna without prior cancellation'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Type of penalty event',
    enum: PenaltyEventType,
    example: PenaltyEventType.NO_SHOW
  })
  @IsEnum(PenaltyEventType)
  eventType: PenaltyEventType;

  @ApiProperty({
    description: 'Severity level of the event',
    enum: PenaltySeverity,
    example: PenaltySeverity.MEDIUM
  })
  @IsEnum(PenaltySeverity)
  severity: PenaltySeverity;

  @ApiProperty({
    description: 'Program ID this event applies to',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  @IsNotEmpty()
  programId: string;

  @ApiProperty({
    description: 'Points assigned for this event',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  points: number;

  @ApiPropertyOptional({
    description: 'Whether this event is currently active',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'Whether this event can be appealed',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isAppealable?: boolean = true;

  @ApiPropertyOptional({
    description: 'Automatic detection rules for this event',
    example: {
      noShowTimeThreshold: 15,
      cancellationTimeThreshold: 24,
      resourceTypes: ['AUDITORIUM', 'LABORATORY']
    }
  })
  @IsOptional()
  autoDetectionRules?: {
    noShowTimeThreshold?: number;
    cancellationTimeThreshold?: number;
    resourceTypes?: string[];
    conditions?: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: 'Custom metadata for the event',
    example: {
      category: 'attendance',
      department: 'engineering'
    }
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
