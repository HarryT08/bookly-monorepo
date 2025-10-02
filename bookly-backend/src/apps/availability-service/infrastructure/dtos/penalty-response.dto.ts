/**
 * Penalty Response DTO
 * Data Transfer Object for penalty responses
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PenaltyType, PenaltyScope } from './create-penalty.dto';

export class PenaltyResponseDto {
  @ApiProperty({
    description: 'Penalty ID',
    example: '507f1f77bcf86cd799439011'
  })
  id: string;

  @ApiProperty({
    description: 'Name of the penalty',
    example: 'No Show Warning - First Offense'
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the penalty',
    example: 'Warning issued for first no-show incident'
  })
  description?: string;

  @ApiProperty({
    description: 'Type of penalty',
    enum: PenaltyType,
    example: PenaltyType.WARNING
  })
  penaltyType: PenaltyType;

  @ApiProperty({
    description: 'Scope of the penalty application',
    enum: PenaltyScope,
    example: PenaltyScope.ALL_RESOURCES
  })
  scope: PenaltyScope;

  @ApiProperty({
    description: 'Program ID this penalty applies to',
    example: '507f1f77bcf86cd799439011'
  })
  programId: string;

  @ApiPropertyOptional({
    description: 'Program name',
    example: 'Ingeniería de Sistemas'
  })
  programName?: string;

  @ApiProperty({
    description: 'Duration in days (0 for permanent)',
    example: 7
  })
  durationDays: number;

  @ApiPropertyOptional({
    description: 'Points threshold to trigger this penalty',
    example: 20
  })
  pointsThreshold?: number;

  @ApiProperty({
    description: 'Whether this penalty is currently active',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether this penalty can be appealed',
    example: true
  })
  isAppealable: boolean;

  @ApiPropertyOptional({
    description: 'Automatic escalation rules'
  })
  escalationRules?: {
    escalateAfterDays?: number;
    escalationPenaltyId?: string;
    conditions?: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: 'Restrictions imposed by this penalty'
  })
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
    description: 'Custom metadata for the penalty'
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'User who created this penalty',
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
    description: 'Usage statistics for this penalty'
  })
  statistics?: {
    totalApplications: number;
    totalUsers: number;
    averageApplicationDuration: number;
    lastUsed?: Date;
    effectivenessScore?: number;
  };
}
