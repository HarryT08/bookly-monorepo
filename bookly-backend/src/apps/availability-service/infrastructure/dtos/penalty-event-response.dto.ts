/**
 * Penalty Event Response DTO
 * Data Transfer Object for penalty event responses
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PenaltyEventType, PenaltySeverity } from './create-penalty-event.dto';

export class PenaltyEventResponseDto {
  @ApiProperty({
    description: 'Penalty event ID',
    example: '507f1f77bcf86cd799439011'
  })
  id: string;

  @ApiProperty({
    description: 'Name of the penalty event',
    example: 'No Show - Aula Magna'
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the penalty event',
    example: 'User failed to show up for reserved Aula Magna without prior cancellation'
  })
  description?: string;

  @ApiProperty({
    description: 'Type of penalty event',
    enum: PenaltyEventType,
    example: PenaltyEventType.NO_SHOW
  })
  eventType: PenaltyEventType;

  @ApiProperty({
    description: 'Severity level of the event',
    enum: PenaltySeverity,
    example: PenaltySeverity.MEDIUM
  })
  severity: PenaltySeverity;

  @ApiProperty({
    description: 'Program ID this event applies to',
    example: '507f1f77bcf86cd799439011'
  })
  programId: string;

  @ApiPropertyOptional({
    description: 'Program name',
    example: 'Ingeniería de Sistemas'
  })
  programName?: string;

  @ApiProperty({
    description: 'Points assigned for this event',
    example: 10
  })
  points: number;

  @ApiProperty({
    description: 'Whether this event is currently active',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether this event can be appealed',
    example: true
  })
  isAppealable: boolean;

  @ApiPropertyOptional({
    description: 'Automatic detection rules for this event'
  })
  autoDetectionRules?: {
    noShowTimeThreshold?: number;
    cancellationTimeThreshold?: number;
    resourceTypes?: string[];
    conditions?: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: 'Custom metadata for the event'
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'User who created this event',
    example: '507f1f77bcf86cd799439012'
  })
  createdBy: string;

  @ApiPropertyOptional({
    description: 'Creator name',
    example: 'Juan Pérez'
  })
  createdByName?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Usage statistics for this event'
  })
  statistics?: {
    totalApplications: number;
    totalUsers: number;
    averagePointsApplied: number;
    lastUsed?: Date;
  };
}
