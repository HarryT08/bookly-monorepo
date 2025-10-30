/**
 * RF-14: Escalate Priority DTO
 * Request structure for escalating waiting list entry priority
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, Length, IsUUID } from 'class-validator';
import { WaitingListPriority } from '../../utils';

export enum EscalationReason {
  URGENT_ACADEMIC_NEED = 'URGENT_ACADEMIC_NEED',
  ADMINISTRATIVE_PRIORITY = 'ADMINISTRATIVE_PRIORITY',
  SPECIAL_CIRCUMSTANCES = 'SPECIAL_CIRCUMSTANCES',
  INSTITUTIONAL_EVENT = 'INSTITUTIONAL_EVENT',
  EMERGENCY_SITUATION = 'EMERGENCY_SITUATION',
  VIP_REQUEST = 'VIP_REQUEST',
  COMPENSATION = 'COMPENSATION'
}

export class EscalatePriorityDto {
  @ApiProperty({
    description: 'New priority level to escalate to',
    enum: WaitingListPriority,
    example: WaitingListPriority.LOW
  })
  @IsEnum(WaitingListPriority)
  newPriority: WaitingListPriority;

  @ApiProperty({
    description: 'Reason for priority escalation',
    enum: EscalationReason,
    example: EscalationReason.URGENT_ACADEMIC_NEED
  })
  @IsEnum(EscalationReason)
  escalationReason: EscalationReason;

  @ApiProperty({
    description: 'Detailed justification for the escalation',
    example: 'Student needs room urgently for thesis defense preparation',
    minLength: 10,
    maxLength: 500
  })
  @IsString()
  @Length(10, 500)
  justification: string;

  @ApiProperty({
    description: 'ID of the administrator authorizing the escalation',
    example: 'admin123-456-789',
    required: false
  })
  @IsOptional()
  @IsUUID()
  authorizedBy?: string;

  @ApiProperty({
    description: 'Additional notes from the administrator',
    example: 'Approved due to exceptional circumstances',
    required: false,
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(0, 300)
  adminNotes?: string;

  @ApiProperty({
    description: 'Reference number or ticket ID for tracking',
    example: 'ESC-2024-001',
    required: false
  })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiProperty({
    description: 'Expiration date for the escalated priority',
    example: '2024-03-20T23:59:59Z',
    required: false
  })
  @IsOptional()
  @IsString()
  priorityExpiresAt?: string;
}
