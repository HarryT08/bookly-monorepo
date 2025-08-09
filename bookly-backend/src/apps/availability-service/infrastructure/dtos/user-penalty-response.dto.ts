/**
 * User Penalty Response DTO
 * Data Transfer Object for user penalty responses
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PenaltyType, PenaltyScope } from './create-penalty.dto';

export enum UserPenaltyStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  APPEALED = 'APPEALED',
  REVOKED = 'REVOKED',
  SUSPENDED = 'SUSPENDED'
}

export class UserPenaltyResponseDto {
  @ApiProperty({
    description: 'User penalty ID',
    example: '507f1f77bcf86cd799439011'
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439012'
  })
  userId: string;

  @ApiPropertyOptional({
    description: 'User name',
    example: 'María García'
  })
  userName?: string;

  @ApiPropertyOptional({
    description: 'User email',
    example: 'maria.garcia@ufps.edu.co'
  })
  userEmail?: string;

  @ApiProperty({
    description: 'Penalty ID',
    example: '507f1f77bcf86cd799439013'
  })
  penaltyId: string;

  @ApiProperty({
    description: 'Penalty name',
    example: 'No Show Warning - First Offense'
  })
  penaltyName: string;

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
    description: 'Reason for applying the penalty',
    example: 'User failed to show up for reserved Aula Magna on 2024-01-15'
  })
  reason: string;

  @ApiProperty({
    description: 'Status of the user penalty',
    enum: UserPenaltyStatus,
    example: UserPenaltyStatus.ACTIVE
  })
  status: UserPenaltyStatus;

  @ApiPropertyOptional({
    description: 'Penalty event ID that triggered this penalty',
    example: '507f1f77bcf86cd799439014'
  })
  penaltyEventId?: string;

  @ApiPropertyOptional({
    description: 'Related reservation ID',
    example: '507f1f77bcf86cd799439015'
  })
  reservationId?: string;

  @ApiPropertyOptional({
    description: 'Related resource ID',
    example: '507f1f77bcf86cd799439016'
  })
  resourceId?: string;

  @ApiPropertyOptional({
    description: 'Resource name',
    example: 'Aula Magna'
  })
  resourceName?: string;

  @ApiProperty({
    description: 'Applied timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  appliedAt: Date;

  @ApiPropertyOptional({
    description: 'Expiration timestamp',
    example: '2024-01-22T10:30:00Z'
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Duration in days',
    example: 7
  })
  durationDays: number;

  @ApiPropertyOptional({
    description: 'Additional evidence or context'
  })
  evidence?: string[];

  @ApiPropertyOptional({
    description: 'Additional notes for the penalty application',
    example: 'User was contacted but did not respond'
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Current restrictions for this user'
  })
  currentRestrictions?: {
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

  @ApiProperty({
    description: 'Whether this penalty can be appealed',
    example: true
  })
  isAppealable: boolean;

  @ApiPropertyOptional({
    description: 'Appeal information if exists'
  })
  appealInfo?: {
    appealId: string;
    appealedAt: Date;
    appealReason: string;
    appealStatus: 'PENDING' | 'APPROVED' | 'DENIED';
    reviewedAt?: Date;
    reviewNotes?: string;
  };

  @ApiProperty({
    description: 'User who applied this penalty',
    example: '507f1f77bcf86cd799439017'
  })
  appliedBy: string;

  @ApiPropertyOptional({
    description: 'Name of user who applied penalty',
    example: 'Admin Usuario'
  })
  appliedByName?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for this penalty application'
  })
  metadata?: Record<string, any>;

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
}
