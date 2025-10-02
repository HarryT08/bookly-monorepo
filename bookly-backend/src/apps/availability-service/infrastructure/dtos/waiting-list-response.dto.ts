/**
 * DTO for waiting list responses (RF-14)
 */

import { ApiProperty } from '@nestjs/swagger';
import { WaitingListPriority } from '../../utils/waiting-list-priority.enum';

export class WaitingListEntryResponseDto {
  @ApiProperty({
    description: 'Waiting list entry ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Waiting list ID',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  waitingListId: string;

  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440002'
  })
  userId: string;

  @ApiProperty({
    description: 'User information',
    type: Object
  })
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };

  @ApiProperty({
    description: 'Position in the waiting list',
    example: 3
  })
  position: number;

  @ApiProperty({
    description: 'Priority level',
    enum: WaitingListPriority,
    example: WaitingListPriority.MEDIUM
  })
  priority: WaitingListPriority;

  @ApiProperty({
    description: 'Confirmation time limit in minutes',
    example: 10
  })
  confirmationTimeLimit: number;

  @ApiProperty({
    description: 'Current status',
    enum: ['WAITING', 'NOTIFIED', 'CONFIRMED', 'EXPIRED', 'CANCELLED'],
    example: 'WAITING'
  })
  status: string;

  @ApiProperty({
    description: 'Desired start time',
    example: '2024-01-15T08:00:00.000Z'
  })
  desiredStartTime: string;

  @ApiProperty({
    description: 'Desired end time',
    example: '2024-01-15T10:00:00.000Z'
  })
  desiredEndTime: string;

  @ApiProperty({
    description: 'Reason for joining',
    required: false
  })
  reason?: string;

  @ApiProperty({
    description: 'Program ID',
    required: false
  })
  programId?: string;

  @ApiProperty({
    description: 'Accept alternatives',
    example: true
  })
  acceptAlternatives: boolean;

  @ApiProperty({
    description: 'Accept alternative resources',
    example: false
  })
  acceptAlternativeResources: boolean;

  @ApiProperty({
    description: 'Enable notifications',
    example: true
  })
  enableNotifications: boolean;

  @ApiProperty({
    description: 'Notification methods',
    type: [String],
    example: ['EMAIL', 'SMS']
  })
  notificationMethods: string[];

  @ApiProperty({
    description: 'Additional notes',
    required: false
  })
  notes?: string;

  @ApiProperty({
    description: 'Tags',
    type: [String],
    required: false
  })
  tags?: string[];

  @ApiProperty({
    description: 'Expected attendees',
    required: false
  })
  expectedAttendees?: number;

  @ApiProperty({
    description: 'Auto-accept enabled',
    example: false
  })
  autoAccept: boolean;

  @ApiProperty({
    description: 'Maximum wait time in hours',
    required: false
  })
  maxWaitTime?: number;

  @ApiProperty({
    description: 'When the entry was requested',
    example: '2024-01-10T10:00:00.000Z'
  })
  requestedAt: string;

  @ApiProperty({
    description: 'When the user was notified',
    example: '2024-01-10T14:30:00.000Z',
    required: false
  })
  notifiedAt?: string;

  @ApiProperty({
    description: 'When the user confirmed',
    example: '2024-01-10T14:35:00.000Z',
    required: false
  })
  confirmedAt?: string;

  @ApiProperty({
    description: 'When the entry expired',
    example: '2024-01-10T14:40:00.000Z',
    required: false
  })
  expiredAt?: string;

  @ApiProperty({
    description: 'Estimated wait time in minutes',
    example: 120,
    required: false
  })
  estimatedWaitTime?: number;

  @ApiProperty({
    description: 'Whether this entry can be escalated',
    example: true
  })
  canEscalate: boolean;

  @ApiProperty({
    description: 'Whether this entry can be cancelled',
    example: true
  })
  canCancel: boolean;

  @ApiProperty({
    description: 'Alternative suggestions',
    type: [Object],
    required: false
  })
  alternatives?: Array<{
    resourceId: string;
    resourceName: string;
    startTime: string;
    endTime: string;
    score: number;
  }>;
}

export class WaitingListResponseDto {
  @ApiProperty({
    description: 'Waiting list ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Resource ID',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  resourceId: string;

  @ApiProperty({
    description: 'Resource information',
    type: Object
  })
  resource: {
    id: string;
    name: string;
    type: string;
    capacity: number;
    location: string;
  };

  @ApiProperty({
    description: 'Date for this waiting list',
    example: '2024-01-15T00:00:00.000Z'
  })
  date: string;

  @ApiProperty({
    description: 'Time slot start',
    example: '08:00'
  })
  startTime: string;

  @ApiProperty({
    description: 'Time slot end',
    example: '10:00'
  })
  endTime: string;

  @ApiProperty({
    description: 'Current status',
    enum: ['ACTIVE', 'PROCESSING', 'CLOSED'],
    example: 'ACTIVE'
  })
  status: string;

  @ApiProperty({
    description: 'Maximum entries allowed',
    example: 10
  })
  maxEntries: number;

  @ApiProperty({
    description: 'Current number of entries',
    example: 5
  })
  currentEntries: number;

  @ApiProperty({
    description: 'Entries in the waiting list',
    type: [WaitingListEntryResponseDto]
  })
  entries: WaitingListEntryResponseDto[];

  @ApiProperty({
    description: 'Statistics for this waiting list',
    type: Object
  })
  stats: {
    totalEntries: number;
    confirmedEntries: number;
    expiredEntries: number;
    cancelledEntries: number;
    averageWaitTime: number;
    confirmationRate: number;
  };

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
    description: 'Whether new entries are being accepted',
    example: true
  })
  acceptingEntries: boolean;

  @ApiProperty({
    description: 'Estimated processing time in minutes',
    example: 30,
    required: false
  })
  estimatedProcessingTime?: number;

  @ApiProperty({
    description: 'Next processing scheduled time',
    example: '2024-01-10T16:00:00.000Z',
    required: false
  })
  nextProcessingTime?: string;
}

export class WaitingListStatsDto {
  @ApiProperty({
    description: 'Total waiting lists',
    example: 25
  })
  totalWaitingLists: number;

  @ApiProperty({
    description: 'Active waiting lists',
    example: 15
  })
  activeWaitingLists: number;

  @ApiProperty({
    description: 'Total entries across all lists',
    example: 150
  })
  totalEntries: number;

  @ApiProperty({
    description: 'Confirmed entries',
    example: 120
  })
  confirmedEntries: number;

  @ApiProperty({
    description: 'Expired entries',
    example: 20
  })
  expiredEntries: number;

  @ApiProperty({
    description: 'Cancelled entries',
    example: 10
  })
  cancelledEntries: number;

  @ApiProperty({
    description: 'Average wait time in minutes',
    example: 45.5
  })
  averageWaitTime: number;

  @ApiProperty({
    description: 'Confirmation rate percentage',
    example: 80.0
  })
  confirmationRate: number;

  @ApiProperty({
    description: 'Most requested resources',
    type: [Object]
  })
  mostRequestedResources: Array<{
    resourceId: string;
    resourceName: string;
    requestCount: number;
  }>;

  @ApiProperty({
    description: 'Peak waiting times',
    type: [Object]
  })
  peakWaitingTimes: Array<{
    hour: number;
    averageEntries: number;
  }>;

  @ApiProperty({
    description: 'Success rate by priority',
    type: Object
  })
  successRateByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
}
