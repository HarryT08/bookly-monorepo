/**
 * Penalty Analytics DTO
 * Data Transfer Object for penalty analytics and statistics
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PenaltyEventType, PenaltySeverity } from './create-penalty-event.dto';
import { PenaltyType } from './create-penalty.dto';

export class PenaltyAnalyticsDto {
  @ApiProperty({
    description: 'Time range for analytics',
    example: '30d'
  })
  timeRange: string;

  @ApiPropertyOptional({
    description: 'Program ID for filtered analytics',
    example: '507f1f77bcf86cd799439011'
  })
  programId?: string;

  @ApiPropertyOptional({
    description: 'Program name',
    example: 'Ingeniería de Sistemas'
  })
  programName?: string;

  @ApiProperty({
    description: 'Overall penalty statistics'
  })
  overallStats: {
    totalPenalties: number;
    totalUsers: number;
    totalPenaltyEvents: number;
    averagePenaltiesPerUser: number;
    totalPointsAssigned: number;
    averagePointsPerPenalty: number;
  };

  @ApiProperty({
    description: 'Penalty distribution by type'
  })
  penaltyTypeDistribution: Array<{
    penaltyType: PenaltyType;
    count: number;
    percentage: number;
    averageDuration: number;
  }>;

  @ApiProperty({
    description: 'Penalty event distribution'
  })
  penaltyEventDistribution: Array<{
    eventType: PenaltyEventType;
    severity: PenaltySeverity;
    count: number;
    percentage: number;
    averagePoints: number;
  }>;

  @ApiProperty({
    description: 'Trend analysis over time'
  })
  trends: {
    penaltiesOverTime: Array<{
      date: string;
      count: number;
      points: number;
    }>;
    topEventTypes: Array<{
      eventType: PenaltyEventType;
      count: number;
      trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    }>;
  };

  @ApiProperty({
    description: 'User behavior insights'
  })
  userInsights: {
    repeatOffenders: Array<{
      userId: string;
      userName: string;
      penaltyCount: number;
      totalPoints: number;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }>;
    usersByRiskLevel: {
      LOW: number;
      MEDIUM: number;
      HIGH: number;
      CRITICAL: number;
    };
    averageTimeToFirstPenalty: number; // days
    averageTimeBetweenPenalties: number; // days
  };

  @ApiProperty({
    description: 'Resource-related penalty insights'
  })
  resourceInsights: {
    mostProblematicResources: Array<{
      resourceId: string;
      resourceName: string;
      resourceType: string;
      penaltyCount: number;
      mainIssues: PenaltyEventType[];
    }>;
    penaltiesByResourceType: Array<{
      resourceType: string;
      count: number;
      percentage: number;
    }>;
  };

  @ApiProperty({
    description: 'Effectiveness metrics'
  })
  effectiveness: {
    recurrenceRate: number; // percentage of users with multiple penalties
    averageTimeBetweenViolations: number; // days
    penaltyResolutionRate: number; // percentage resolved vs active
    appealSuccessRate: number; // percentage of appeals approved
    behaviorImprovementRate: number; // percentage showing improvement
  };

  @ApiProperty({
    description: 'Recommendations based on analytics'
  })
  recommendations: Array<{
    type: 'POLICY_CHANGE' | 'PENALTY_ADJUSTMENT' | 'RESOURCE_FOCUS' | 'USER_EDUCATION';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    expectedImpact: string;
    implementationEffort: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;

  @ApiPropertyOptional({
    description: 'Comparative analysis with previous period'
  })
  comparison?: {
    previousPeriod: string;
    penaltyChange: {
      absolute: number;
      percentage: number;
      trend: 'IMPROVING' | 'WORSENING' | 'STABLE';
    };
    userBehaviorChange: {
      newOffenders: number;
      improvedUsers: number;
      chronicOffenders: number;
    };
  };

  @ApiProperty({
    description: 'Generated timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  generatedAt: Date;

  @ApiProperty({
    description: 'Next recommended analysis date',
    example: '2024-02-15T10:30:00Z'
  })
  nextAnalysisRecommended: Date;
}
