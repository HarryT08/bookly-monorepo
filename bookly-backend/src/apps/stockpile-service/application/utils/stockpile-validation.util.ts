import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApprovalRequestEntity } from '../../domain/entities/approval-flow.entity';
import { ApprovalRequestStatus } from '@apps/stockpile-service/utils/approval-request-status.enum';

/**
 * Stockpile Validation Utility
 * Centralizes common validation logic to eliminate code duplication
 * Provides consistent error handling and business rule validation
 */
export class StockpileValidationUtil {
  
  /**
   * Validates that approval requests exist for a reservation
   * @param approvalRequests Array of approval requests
   * @param reservationId Reservation ID for error messaging
   * @throws NotFoundException if no approval requests found
   */
  static validateApprovalRequestsExist(
    approvalRequests: ApprovalRequestEntity[] | null | undefined,
    reservationId: string
  ): ApprovalRequestEntity[] {
    if (!approvalRequests || approvalRequests.length === 0) {
      throw new NotFoundException(`No approval requests found for reservation ${reservationId}`);
    }
    return approvalRequests;
  }

  /**
   * Validates that an approval request exists
   * @param approvalRequest The approval request entity
   * @param approvalId Approval ID for error messaging
   * @throws NotFoundException if approval request not found
   */
  static validateApprovalRequestExists(
    approvalRequest: ApprovalRequestEntity | null | undefined,
    approvalId: string
  ): ApprovalRequestEntity {
    if (!approvalRequest) {
      throw new NotFoundException(`Approval request ${approvalId} not found`);
    }
    return approvalRequest;
  }

  /**
   * Validates that a reservation is not already approved
   * @param existingRequests Array of existing approval requests
   * @throws BadRequestException if reservation already approved or rejected
   */
  static validateReservationNotProcessed(existingRequests: ApprovalRequestEntity[]): void {
    if (existingRequests.length > 0) {
      const latestRequest = existingRequests[0];
      if (latestRequest.status === ApprovalRequestStatus.APPROVED) {
        throw new BadRequestException('Reservation already approved');
      }
      if (latestRequest.status === ApprovalRequestStatus.REJECTED) {
        throw new BadRequestException('Cannot process rejected reservation');
      }
    }
  }

  /**
   * Validates that an approval request is processed (approved/rejected)
   * @param approvalRequest The approval request to validate
   * @throws BadRequestException if approval is still pending
   */
  static validateApprovalRequestProcessed(approvalRequest: ApprovalRequestEntity): void {
    if (approvalRequest.status === ApprovalRequestStatus.PENDING) {
      throw new BadRequestException('Cannot generate document for pending approval');
    }
  }

  /**
   * Validates that a reservation is approved for check-in
   * @param approvalRequests Array of approval requests
   * @throws ForbiddenException if reservation is not approved
   */
  static validateReservationApproved(approvalRequests: ApprovalRequestEntity[]): void {
    const latestRequest = approvalRequests[0];
    if (latestRequest.status !== ApprovalRequestStatus.APPROVED) {
      throw new ForbiddenException('Cannot check-in to non-approved reservation');
    }
  }

  /**
   * Validates notification type matches approval status
   * @param currentStatus Current approval request status
   * @param notificationType Notification type being sent
   * @throws BadRequestException if notification type doesn't match status
   */
  static validateNotificationTypeMatchesStatus(
    currentStatus: ApprovalRequestStatus,
    notificationType: string
  ): void {
    const statusMapping: Record<string, ApprovalRequestStatus> = {
      'APPROVAL': ApprovalRequestStatus.APPROVED,
      'REJECTION': ApprovalRequestStatus.REJECTED,
      'PENDING': ApprovalRequestStatus.PENDING
    };

    if (currentStatus !== statusMapping[notificationType]) {
      throw new BadRequestException(
        `Invalid notification type ${notificationType} for current status ${currentStatus}`
      );
    }
  }

  /**
   * Validates that a template exists
   * @param template The template entity
   * @param templateType Type of template for error messaging
   * @throws NotFoundException if template not found
   */
  static validateTemplateExists<T>(template: T | null | undefined, templateType: string): T {
    if (!template) {
      throw new NotFoundException(`${templateType} template not found`);
    }
    return template;
  }

  /**
   * Validates that an approval flow is configured
   * @param approvalFlow The approval flow entity
   * @param resourceType Resource type for error messaging
   * @throws BadRequestException if no approval flow configured
   */
  static validateApprovalFlowConfigured<T>(
    approvalFlow: T | null | undefined,
    resourceType: string
  ): T {
    if (!approvalFlow) {
      throw new BadRequestException(`No approval flow configured for resource type: ${resourceType}`);
    }
    return approvalFlow;
  }

  /**
   * Gets the latest approval request from a list
   * @param approvalRequests Array of approval requests
   * @returns The most recent approval request
   */
  static getLatestApprovalRequest(approvalRequests: ApprovalRequestEntity[]): ApprovalRequestEntity {
    return approvalRequests[0]; // Assuming requests are ordered by date desc
  }

  /**
   * Filters approval requests by status
   * @param approvalRequests Array of approval requests
   * @param status Status to filter by
   * @returns Filtered array of approval requests
   */
  static filterApprovalRequestsByStatus(
    approvalRequests: ApprovalRequestEntity[],
    status: ApprovalRequestStatus
  ): ApprovalRequestEntity[] {
    return approvalRequests.filter(req => req.status === status);
  }

  /**
   * Creates consistent error context for logging
   * @param operation Operation being performed
   * @param entityId Entity ID involved
   * @param additionalContext Additional context data
   * @returns Structured error context object
   */
  static createErrorContext(
    operation: string,
    entityId: string,
    additionalContext: Record<string, any> = {}
  ): Record<string, any> {
    return {
      operation,
      entityId,
      timestamp: new Date().toISOString(),
      ...additionalContext
    };
  }
}
