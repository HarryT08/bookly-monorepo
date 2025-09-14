import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from '../common/base-entity.dto';

/**
 * Reassignment Request DTO
 * Used for reassignment request operations in availability-service
 */
export class ReassignmentRequestDto extends BaseEntityDto {
  @ApiProperty({ description: 'Original reservation ID' })
  originalReservationId: string;

  @ApiProperty({ description: 'Reason for reassignment' })
  reason: string;

  @ApiProperty({ description: 'Detailed reason description', required: false })
  reasonDescription?: string;

  @ApiProperty({ description: 'Suggested resource ID', required: false })
  suggestedResourceId?: string;

  @ApiProperty({ description: 'User priority level' })
  priority: string;

  @ApiProperty({ description: 'Response deadline', required: false })
  responseDeadline?: string;

  @ApiProperty({ description: 'Accept equivalent resources', default: true })
  acceptEquivalentResources: boolean;

  @ApiProperty({ description: 'Accept alternative time slots', default: false })
  acceptAlternativeTimeSlots: boolean;

  @ApiProperty({ description: 'Capacity tolerance percentage', required: false })
  capacityTolerancePercent?: number;

  @ApiProperty({ description: 'Required features', type: [String], required: false })
  requiredFeatures?: string[];

  @ApiProperty({ description: 'Preferred features', type: [String], required: false })
  preferredFeatures?: string[];

  @ApiProperty({ description: 'Maximum distance in meters', required: false })
  maxDistanceMeters?: number;

  @ApiProperty({ description: 'Notify user', default: true })
  notifyUser: boolean;

  @ApiProperty({ description: 'Notification methods', type: [String], required: false })
  notificationMethods?: string[];

  @ApiProperty({ description: 'Auto process single option', default: false })
  autoProcessSingleOption: boolean;

  @ApiProperty({ description: 'Compensation information', required: false })
  compensationInfo?: string;

  @ApiProperty({ description: 'Internal notes', required: false })
  internalNotes?: string;

  @ApiProperty({ description: 'Tags', type: [String], required: false })
  tags?: string[];

  @ApiProperty({ description: 'Impact level' })
  impactLevel: string;

  @ApiProperty({ description: 'Estimated resolution hours', required: false })
  estimatedResolutionHours?: number;

  @ApiProperty({ description: 'Related ticket ID', required: false })
  relatedTicketId?: string;

  @ApiProperty({ description: 'Affected program ID', required: false })
  affectedProgramId?: string;

  @ApiProperty({ description: 'Minimum advance notice hours', required: false })
  minAdvanceNoticeHours?: number;

  @ApiProperty({ description: 'Allow partial reassignment', default: false })
  allowPartialReassignment: boolean;

  @ApiProperty({ description: 'Require user confirmation', default: true })
  requireUserConfirmation: boolean;

  @ApiProperty({ description: 'Reassignment status' })
  status: string;

  @ApiProperty({ description: 'User who requested' })
  requestedBy: string;

  @ApiProperty({ description: 'User who processed', required: false })
  processedBy?: string;

  @ApiProperty({ description: 'Processing notes', required: false })
  processingNotes?: string;

  @ApiProperty({ description: 'Selected resource ID', required: false })
  selectedResourceId?: string;
}

/**
 * Find Equivalent Resources Response DTO
 */
export class EquivalentResourcesDto {
  @ApiProperty({ description: 'Exact matches', type: [Object] })
  exactMatches: any[];

  @ApiProperty({ description: 'Good matches', type: [Object] })
  goodMatches: any[];

  @ApiProperty({ description: 'Acceptable matches', type: [Object] })
  acceptableMatches: any[];

  @ApiProperty({ description: 'Recommendations', type: [Object] })
  recommendations: any[];
}

/**
 * Auto Process Reassignment Requests Response DTO
 */
export class AutoProcessReassignmentResultDto {
  @ApiProperty({ description: 'Number of processed requests' })
  processed: number;
}

/**
 * Optimize Reassignment Queue Response DTO
 */
export class OptimizeReassignmentQueueResultDto {
  @ApiProperty({ description: 'Number of optimized reassignments' })
  optimized: number;

  @ApiProperty({ description: 'Optimization suggestions', type: [Object] })
  suggestions: any[];
}
