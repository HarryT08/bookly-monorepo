/**
 * DTO for reassignment request responses (RF-15)
 */

import { ApiProperty } from '@nestjs/swagger';
import { ReassignmentReason } from '../../utils/reassignment-reason.enum';
import { ReassignmentPriority } from '../../utils/reassignment-priority.enum';

export class EquivalentResourceDto {
  @ApiProperty({
    description: 'Resource ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Resource name',
    example: 'Conference Room B'
  })
  name: string;

  @ApiProperty({
    description: 'Resource type',
    example: 'CONFERENCE_ROOM'
  })
  type: string;

  @ApiProperty({
    description: 'Resource capacity',
    example: 25
  })
  capacity: number;

  @ApiProperty({
    description: 'Resource location',
    example: 'Building A, Floor 3'
  })
  location: string;

  @ApiProperty({
    description: 'Distance from original resource in meters',
    example: 50
  })
  distanceFromOriginal: number;

  @ApiProperty({
    description: 'Equivalence score (0-100)',
    example: 85
  })
  equivalenceScore: number;

  @ApiProperty({
    description: 'Available features',
    type: [String],
    example: ['PROJECTOR', 'WHITEBOARD', 'AIR_CONDITIONING']
  })
  features: string[];

  @ApiProperty({
    description: 'Missing features compared to original',
    type: [String],
    example: ['SOUND_SYSTEM']
  })
  missingFeatures: string[];

  @ApiProperty({
    description: 'Additional features not in original',
    type: [String],
    example: ['SMART_BOARD']
  })
  additionalFeatures: string[];

  @ApiProperty({
    description: 'Whether this resource is currently available',
    example: true
  })
  isAvailable: boolean;

  @ApiProperty({
    description: 'Next available time slot if not currently available',
    example: '2024-01-15T14:00:00.000Z',
    required: false
  })
  nextAvailableTime?: string;
}

export class ReassignmentRequestResponseDto {
  @ApiProperty({
    description: 'Reassignment request ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Original reservation ID',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  originalReservationId: string;

  @ApiProperty({
    description: 'Original reservation details',
    type: Object
  })
  originalReservation: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    resourceId: string;
    resourceName: string;
    userId: string;
    userFullName: string;
  };

  @ApiProperty({
    description: 'User who requested the reassignment',
    example: '550e8400-e29b-41d4-a716-446655440002'
  })
  requestedBy: string;

  @ApiProperty({
    description: 'Requester information',
    type: Object
  })
  requester: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };

  @ApiProperty({
    description: 'Reason for reassignment',
    enum: ReassignmentReason,
    example: ReassignmentReason.RESOURCE_UNAVAILABLE
  })
  reason: ReassignmentReason;

  @ApiProperty({
    description: 'Detailed reason description',
    example: 'Original room is under maintenance due to HVAC system repair'
  })
  reasonDescription: string;

  @ApiProperty({
    description: 'Suggested resource ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
    required: false
  })
  suggestedResourceId?: string;

  @ApiProperty({
    description: 'Suggested resource details',
    type: EquivalentResourceDto,
    required: false
  })
  suggestedResource?: EquivalentResourceDto;

  @ApiProperty({
    description: 'Current status of the request',
    enum: ['PENDING', 'PROCESSING', 'USER_NOTIFIED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'EXPIRED'],
    example: 'PENDING'
  })
  status: string;

  @ApiProperty({
    description: 'User response to the request',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    example: 'PENDING'
  })
  userResponse: string;

  @ApiProperty({
    description: 'Number of times user has rejected suggestions',
    example: 0
  })
  rejectionCount: number;

  @ApiProperty({
    description: 'Priority level',
    enum: ReassignmentPriority,
    example: ReassignmentPriority.MEDIUM
  })
  priority: ReassignmentPriority;

  @ApiProperty({
    description: 'Response deadline',
    example: '2024-01-15T18:00:00.000Z',
    required: false
  })
  responseDeadline?: string;

  @ApiProperty({
    description: 'When user responded',
    example: '2024-01-15T16:30:00.000Z',
    required: false
  })
  respondedAt?: string;

  @ApiProperty({
    description: 'Equivalent resources found',
    type: [EquivalentResourceDto]
  })
  equivalentResources: EquivalentResourceDto[];

  @ApiProperty({
    description: 'Alternative time slots if requested',
    type: [Object],
    required: false
  })
  alternativeTimeSlots?: Array<{
    startTime: string;
    endTime: string;
    resourceId: string;
    resourceName: string;
    score: number;
  }>;

  @ApiProperty({
    description: 'Compensation or benefits information',
    required: false
  })
  compensationInfo?: string;

  @ApiProperty({
    description: 'Internal notes',
    required: false
  })
  internalNotes?: string;

  @ApiProperty({
    description: 'Tags',
    type: [String],
    required: false
  })
  tags?: string[];

  @ApiProperty({
    description: 'Impact level (1-5)',
    example: 2,
    required: false
  })
  impactLevel?: number;

  @ApiProperty({
    description: 'Estimated resolution time in hours',
    example: 24,
    required: false
  })
  estimatedResolutionHours?: number;

  @ApiProperty({
    description: 'Related ticket ID',
    required: false
  })
  relatedTicketId?: string;

  @ApiProperty({
    description: 'Affected program ID',
    required: false
  })
  affectedProgramId?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-10T10:00:00.000Z'
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-10T15:30:00.000Z'
  })
  updatedAt: string;

  @ApiProperty({
    description: 'Whether the current user can respond to this request',
    example: true
  })
  canRespond: boolean;

  @ApiProperty({
    description: 'Whether the current user can cancel this request',
    example: true
  })
  canCancel: boolean;

  @ApiProperty({
    description: 'Time remaining for response in minutes',
    example: 120,
    required: false
  })
  timeRemainingMinutes?: number;

  @ApiProperty({
    description: 'Processing history',
    type: [Object]
  })
  processingHistory: Array<{
    action: string;
    timestamp: string;
    performedBy: string;
    details?: string;
  }>;

  @ApiProperty({
    description: 'Notification history',
    type: [Object]
  })
  notificationHistory: Array<{
    type: string;
    method: string;
    timestamp: string;
    status: 'SENT' | 'FAILED' | 'PENDING';
  }>;

  @ApiProperty({
    description: 'Success prediction score (0-100)',
    example: 75,
    required: false
  })
  successPredictionScore?: number;

  @ApiProperty({
    description: 'Recommended action for user',
    example: 'ACCEPT_SUGGESTION',
    enum: ['ACCEPT_SUGGESTION', 'REQUEST_ALTERNATIVES', 'CANCEL_REQUEST', 'WAIT_FOR_BETTER_OPTION'],
    required: false
  })
  recommendedAction?: string;
}

export class ReassignmentStatsDto {
  @ApiProperty({
    description: 'Total reassignment requests',
    example: 150
  })
  totalRequests: number;

  @ApiProperty({
    description: 'Pending requests',
    example: 25
  })
  pendingRequests: number;

  @ApiProperty({
    description: 'Accepted requests',
    example: 100
  })
  acceptedRequests: number;

  @ApiProperty({
    description: 'Rejected requests',
    example: 20
  })
  rejectedRequests: number;

  @ApiProperty({
    description: 'Cancelled requests',
    example: 5
  })
  cancelledRequests: number;

  @ApiProperty({
    description: 'Average response time in hours',
    example: 4.5
  })
  averageResponseTime: number;

  @ApiProperty({
    description: 'Success rate percentage',
    example: 80.0
  })
  successRate: number;

  @ApiProperty({
    description: 'Average equivalence score of accepted suggestions',
    example: 85.5
  })
  averageEquivalenceScore: number;

  @ApiProperty({
    description: 'Most common reasons',
    type: [Object]
  })
  mostCommonReasons: Array<{
    reason: ReassignmentReason;
    count: number;
    percentage: number;
  }>;

  @ApiProperty({
    description: 'Peak request times',
    type: [Object]
  })
  peakRequestTimes: Array<{
    hour: number;
    averageRequests: number;
  }>;

  @ApiProperty({
    description: 'User satisfaction scores',
    type: Object
  })
  userSatisfaction: {
    average: number;
    distribution: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
    };
  };

  @ApiProperty({
    description: 'Resource utilization impact',
    type: Object
  })
  resourceUtilizationImpact: {
    improvementPercentage: number;
    conflictsReduced: number;
    utilizationIncrease: number;
  };
}

export class ReassignmentAnalyticsDto {
  @ApiProperty({
    description: 'Time period for analytics',
    type: Object
  })
  period: {
    startDate: string;
    endDate: string;
    groupBy: 'day' | 'week' | 'month';
  };

  @ApiProperty({
    description: 'Request trends over time',
    type: [Object]
  })
  requestTrends: Array<{
    date: string;
    totalRequests: number;
    acceptedRequests: number;
    rejectedRequests: number;
    averageResponseTime: number;
  }>;

  @ApiProperty({
    description: 'Reason distribution',
    type: [Object]
  })
  reasonDistribution: Array<{
    reason: ReassignmentReason;
    count: number;
    percentage: number;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  }>;

  @ApiProperty({
    description: 'Resource performance',
    type: [Object]
  })
  resourcePerformance: Array<{
    resourceId: string;
    resourceName: string;
    reassignmentRequests: number;
    successfulReassignments: number;
    averageEquivalenceScore: number;
    userSatisfaction: number;
  }>;

  @ApiProperty({
    description: 'User behavior patterns',
    type: [Object]
  })
  userBehaviorPatterns: Array<{
    userId: string;
    userRole: string;
    totalRequests: number;
    acceptanceRate: number;
    averageResponseTime: number;
    preferredAlternatives: string[];
  }>;

  @ApiProperty({
    description: 'Predictions and recommendations',
    type: Object
  })
  predictions: {
    expectedRequestsNextPeriod: number;
    recommendedActions: string[];
    resourceOptimizationSuggestions: Array<{
      resourceId: string;
      suggestion: string;
      expectedImpact: string;
    }>;
  };
}
