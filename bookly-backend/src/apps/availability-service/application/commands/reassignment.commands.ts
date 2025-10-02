/**
 * Commands for reassignment request management (RF-15)
 * CQRS Command Pattern Implementation
 */

import { ICommand } from "@nestjs/cqrs";
import { ReassignmentPriority, ReassignmentReason, UserPriority } from "../../utils";

export class CreateReassignmentRequestCommand implements ICommand {
  constructor(
    public readonly originalReservationId: string,
    public readonly requestedBy: string,
    public readonly reason: ReassignmentReason,
    public readonly reasonDescription: string,
    public readonly suggestedResourceId?: string,
    public readonly priority: ReassignmentPriority = ReassignmentPriority.MEDIUM,
    public readonly responseDeadline?: Date,
    public readonly acceptEquivalentResources: boolean = true,
    public readonly acceptAlternativeTimeSlots: boolean = false,
    public readonly capacityTolerancePercent?: number,
    public readonly requiredFeatures?: string[],
    public readonly preferredFeatures?: string[],
    public readonly maxDistanceMeters?: number,
    public readonly notifyUser: boolean = true,
    public readonly notificationMethods?: string[],
    public readonly autoProcessSingleOption: boolean = false,
    public readonly compensationInfo?: string,
    public readonly internalNotes?: string,
    public readonly tags?: string[],
    public readonly impactLevel?: number,
    public readonly estimatedResolutionHours?: number,
    public readonly relatedTicketId?: string,
    public readonly affectedProgramId?: string,
    public readonly minAdvanceNoticeHours?: number,
    public readonly allowPartialReassignment: boolean = false,
    public readonly requireUserConfirmation: boolean = true
  ) {}

  get userPriority(): UserPriority {
    switch (this.priority) {
      case ReassignmentPriority.URGENT:
        return UserPriority.ADMIN_GENERAL;
      case ReassignmentPriority.HIGH:
        return UserPriority.PROGRAM_DIRECTOR;
      case ReassignmentPriority.MEDIUM:
        return UserPriority.TEACHER;
      case ReassignmentPriority.LOW:
        return UserPriority.STUDENT;
      default:
        return UserPriority.EXTERNAL;
    }
  }
}

export class RespondToReassignmentRequestCommand implements ICommand {
  constructor(
    public readonly reassignmentRequestId: string,
    public readonly userId: string,
    public readonly response: "ACCEPTED" | "REJECTED",
    public readonly selectedResourceId?: string,
    public readonly responseNotes?: string,
    public readonly requestAlternatives: boolean = false,
    public readonly alternativePreferences?: {
      preferredTimes?: Array<{
        startTime: string;
        endTime: string;
      }>;
      preferredFeatures?: string[];
      maxDistanceMeters?: number;
      capacityRequirement?: number;
    },
    public readonly respondedBy?: string
  ) {}
}

export class FindEquivalentResourcesCommand implements ICommand {
  constructor(
    public readonly originalResourceId: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly capacityTolerancePercent: number = 5,
    public readonly requiredFeatures?: string[],
    public readonly preferredFeatures?: string[],
    public readonly maxDistanceMeters?: number,
    public readonly excludeResourceIds?: string[],
    public readonly limit: number = 10,
    public readonly requestedBy?: string
  ) {}
}

export class ProcessReassignmentRequestCommand implements ICommand {
  constructor(
    public readonly reassignmentRequestId: string,
    public readonly processedBy: string,
    public readonly autoSelectBestOption: boolean = false,
    public readonly notifyUser: boolean = true,
    public readonly processingNotes?: string
  ) {}
}

export class CancelReassignmentRequestCommand implements ICommand {
  constructor(
    public readonly reassignmentRequestId: string,
    public readonly userId: string,
    public readonly reason: string,
    public readonly cancelledBy?: string,
    public readonly notifyStakeholders: boolean = true
  ) {}
}

export class EscalateReassignmentRequestCommand implements ICommand {
  constructor(
    public readonly reassignmentRequestId: string,
    public readonly newPriority: ReassignmentPriority,
    public readonly escalationReason: string,
    public readonly escalatedBy: string,
    public readonly notifyUser: boolean = true,
    public readonly notifyAdmins: boolean = true
  ) {}
}

export class UpdateReassignmentRequestCommand implements ICommand {
  constructor(
    public readonly reassignmentRequestId: string,
    public readonly userId: string,
    public readonly updateData: {
      reasonDescription?: string;
      suggestedResourceId?: string;
      priority?: ReassignmentPriority;
      responseDeadline?: Date;
      acceptEquivalentResources?: boolean;
      acceptAlternativeTimeSlots?: boolean;
      capacityTolerancePercent?: number;
      requiredFeatures?: string[];
      preferredFeatures?: string[];
      maxDistanceMeters?: number;
      compensationInfo?: string;
      internalNotes?: string;
      tags?: string[];
      impactLevel?: number;
      estimatedResolutionHours?: number;
      relatedTicketId?: string;
      minAdvanceNoticeHours?: number;
      allowPartialReassignment?: boolean;
      requireUserConfirmation?: boolean;
    },
    public readonly updateReason?: string,
    public readonly updatedBy?: string,
    public readonly notifyUser: boolean = true
  ) {}
}

export class AutoProcessReassignmentRequestsCommand implements ICommand {
  constructor(
    public readonly criteria: {
      priority?: ReassignmentPriority;
      reason?: ReassignmentReason;
      maxAge?: number; // hours
      minEquivalenceScore?: number;
      autoProcessEnabled?: boolean;
    },
    public readonly processedBy: string,
    public readonly dryRun: boolean = false,
    public readonly maxRequests: number = 50
  ) {}
}

export class BulkProcessReassignmentRequestsCommand implements ICommand {
  constructor(
    public readonly reassignmentRequestIds: string[],
    public readonly action:
      | "PROCESS"
      | "CANCEL"
      | "ESCALATE"
      | "UPDATE_PRIORITY",
    public readonly parameters: any,
    public readonly processedBy: string,
    public readonly notifyUsers: boolean = true
  ) {}
}

export class ValidateReassignmentRequestCommand implements ICommand {
  constructor(
    public readonly originalReservationId: string,
    public readonly reason: ReassignmentReason,
    public readonly suggestedResourceId?: string,
    public readonly acceptEquivalentResources: boolean = true,
    public readonly capacityTolerancePercent?: number,
    public readonly requiredFeatures?: string[],
    public readonly requestedBy?: string
  ) {}
}

export class GenerateReassignmentSuggestionsCommand implements ICommand {
  constructor(
    public readonly originalReservationId: string,
    public readonly criteria: {
      capacityTolerancePercent?: number;
      requiredFeatures?: string[];
      preferredFeatures?: string[];
      maxDistanceMeters?: number;
      acceptAlternativeTimeSlots?: boolean;
      timeFlexibilityMinutes?: number;
    },
    public readonly limit: number = 5,
    public readonly requestedBy: string
  ) {}
}

export class ApplyReassignmentCommand implements ICommand {
  constructor(
    public readonly reassignmentRequestId: string,
    public readonly selectedResourceId: string,
    public readonly newStartTime?: Date,
    public readonly newEndTime?: Date,
    public readonly appliedBy?: string,
    public readonly notifyUser: boolean = true,
    public readonly compensationApplied?: string,
    public readonly applicationNotes?: string
  ) {}
}

export class RejectReassignmentSuggestionCommand implements ICommand {
  constructor(
    public readonly reassignmentRequestId: string,
    public readonly rejectedResourceId: string,
    public readonly userId: string,
    public readonly rejectionReason: string,
    public readonly requestAlternatives: boolean = true,
    public readonly rejectedBy: string
  ) {}
}

export class SetReassignmentPreferencesCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly preferences: {
      autoAcceptHighEquivalence?: boolean;
      minEquivalenceScoreForAutoAccept?: number;
      preferredNotificationMethods?: string[];
      maxResponseTimeHours?: number;
      acceptUpgrades?: boolean;
      acceptDowngrades?: boolean;
      maxCapacityReduction?: number;
      requiredFeatures?: string[];
      blacklistedResources?: string[];
      preferredResources?: string[];
      flexibleTimeSlots?: boolean;
      maxTimeShiftMinutes?: number;
    },
    public readonly updatedBy: string
  ) {}
}

export class CalculateReassignmentImpactCommand implements ICommand {
  constructor(
    public readonly reassignmentRequestId: string,
    public readonly proposedResourceId: string,
    public readonly proposedStartTime?: Date,
    public readonly proposedEndTime?: Date,
    public readonly calculatedBy?: string,
    public readonly includeUserSatisfactionPrediction: boolean = true,
    public readonly includeResourceUtilizationImpact: boolean = true
  ) {}
}

export class OptimizeReassignmentQueueCommand implements ICommand {
  constructor(
    public readonly criteria:
      | "PRIORITY"
      | "RESPONSE_TIME"
      | "USER_SATISFACTION"
      | "RESOURCE_UTILIZATION",
    public readonly optimizedBy: string,
    public readonly dryRun: boolean = false,
    public readonly maxReassignments: number = 100,
    public readonly notifyAffectedUsers: boolean = true
  ) {}
}

export class CreateBulkReassignmentRequestCommand implements ICommand {
  constructor(
    public readonly originalReservationIds: string[],
    public readonly reason: ReassignmentReason,
    public readonly reasonDescription: string,
    public readonly requestedBy: string,
    public readonly commonCriteria: {
      priority?: ReassignmentPriority;
      acceptEquivalentResources?: boolean;
      capacityTolerancePercent?: number;
      requiredFeatures?: string[];
      maxDistanceMeters?: number;
      responseDeadline?: Date;
    },
    public readonly notifyUsers: boolean = true,
    public readonly autoProcessWhenPossible: boolean = false
  ) {}
}
