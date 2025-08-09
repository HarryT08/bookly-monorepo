import { ReassignmentReason, ReassignmentPriority, ReassignmentStatus, UserResponse, UserPriority } from "../../utils";
import { ReassignmentRequestEntity } from "../entities/reassignment-request.entity";


export interface ReassignmentRequestFilters {
  userId?: string;
  requestedBy?: string;
  originalReservationId?: string;
  status?: string;
  userResponse?: string;
  reason?: ReassignmentReason;
  priority?: ReassignmentPriority;
  startDate?: Date;
  endDate?: Date;
  resourceId?: string;
  programId?: string;
  includeExpired?: boolean;
  expiringSoon?: boolean;
  hoursUntilExpiry?: number;
}

/**
 * Reassignment Request Repository Interface - Domain Layer
 * Defines the contract for reassignment request data access
 */
export interface ReassignmentRequestRepository {
  findMany(
    filters: ReassignmentRequestFilters,
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: string
  ): { items: any; total: any } | PromiseLike<{ items: any; total: any }>;
  findByUser(
    filters: Partial<Pick<ReassignmentRequestFilters, 'userId' | 'status' | 'userResponse' | 'includeExpired'>>,
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: string
  ): { items: any; total: any } | PromiseLike<{ items: any; total: any }>;
  findPending(
    filters: Partial<Pick<ReassignmentRequestFilters, 'userId' | 'status' | 'priority' | 'reason' | 'expiringSoon' | 'hoursUntilExpiry'>>,
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: string
  ): { items: any; total: any } | PromiseLike<{ items: any; total: any }>;
  search(
    searchTerm: string,
    filters: Partial<Pick<ReassignmentRequestFilters, 'status' | 'reason' | 'priority' | 'userId' | 'resourceId' | 'programId' | 'startDate' | 'endDate'>>,
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: string
  ): { items: any; total: any } | PromiseLike<{ items: any; total: any }>;
  /**
   * Create a new reassignment request
   */
  create(data: {
    originalReservationId: string;
    requestedBy: string;
    reason: ReassignmentReason;
    customReason?: string;
    suggestedResourceId?: string;
    status: ReassignmentStatus;
    userResponse: UserResponse;
    priority: UserPriority;
    responseDeadline?: Date;
  }): Promise<ReassignmentRequestEntity>;

  /**
   * Find request by ID
   */
  findById(id: string): Promise<ReassignmentRequestEntity | null>;

  /**
   * Find all requests for a reservation
   */
  findByReservationId(
    reservationId: string
  ): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find all requests created by a user
   */
  findByRequestedBy(userId: string): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find requests by status
   */
  findByStatus(
    status: ReassignmentStatus
  ): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find requests by user response
   */
  findByUserResponse(
    userResponse: UserResponse
  ): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find requests by reason
   */
  findByReason(
    reason: ReassignmentReason
  ): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find requests by priority
   */
  findByPriority(priority: UserPriority): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find pending requests
   */
  findPendingRequests(): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find pending requests for a specific user (reservation owner)
   */
  findPendingByReservationOwner(
    userId: string
  ): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find requests that are about to expire
   */
  findExpiringRequests(
    hoursBeforeExpiry: number
  ): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find expired requests that need to be marked as expired
   */
  findExpiredRequests(): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find high priority requests
   */
  findHighPriorityRequests(): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find requests that need reminders
   */
  findNeedingReminders(
    reminderIntervalHours: number
  ): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find requests by date range
   */
  findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find requests for a specific resource (original or suggested)
   */
  findByResourceId(resourceId: string): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find requests with suggested resource
   */
  findWithSuggestedResource(
    resourceId: string
  ): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find requests without suggested resource
   */
  findWithoutSuggestedResource(): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find requests by rejection count
   */
  findByRejectionCount(
    minRejections: number
  ): Promise<ReassignmentRequestEntity[]>;

  /**
   * Update request
   */
  update(
    id: string,
    updates: Partial<ReassignmentRequestEntity>
  ): Promise<ReassignmentRequestEntity>;

  /**
   * Update multiple requests
   */
  updateMany(
    requestIds: string[],
    updates: Partial<ReassignmentRequestEntity>
  ): Promise<ReassignmentRequestEntity[]>;

  /**
   * Delete request
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all requests for a reservation
   */
  deleteByReservationId(reservationId: string): Promise<void>;

  /**
   * Count requests by status
   */
  countByStatus(status: ReassignmentStatus): Promise<number>;

  /**
   * Count pending requests for a user
   */
  countPendingByUser(userId: string): Promise<number>;

  /**
   * Count requests by reason
   */
  countByReason(reason: ReassignmentReason): Promise<number>;

  /**
   * Accept a reassignment request
   */
  acceptRequest(id: string): Promise<ReassignmentRequestEntity>;

  /**
   * Reject a reassignment request
   */
  rejectRequest(id: string): Promise<ReassignmentRequestEntity>;

  /**
   * Cancel a reassignment request
   */
  cancelRequest(id: string): Promise<ReassignmentRequestEntity>;

  /**
   * Expire a reassignment request
   */
  expireRequest(id: string): Promise<ReassignmentRequestEntity>;

  /**
   * Set suggested resource for a request
   */
  setSuggestedResource(
    id: string,
    resourceId: string
  ): Promise<ReassignmentRequestEntity>;

  /**
   * Set response deadline for a request
   */
  setResponseDeadline(
    id: string,
    deadline: Date
  ): Promise<ReassignmentRequestEntity>;

  /**
   * Bulk expire requests that have timed out
   */
  bulkExpireTimedOutRequests(): Promise<ReassignmentRequestEntity[]>;

  /**
   * Find requests that need automatic processing
   */
  findNeedingAutoProcessing(
    hoursBeforeEvent: number
  ): Promise<ReassignmentRequestEntity[]>;

  /**
   * Get reassignment statistics
   */
  getReassignmentStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    acceptedRequests: number;
    rejectedRequests: number;
    cancelledRequests: number;
    expiredRequests: number;
    averageResponseTime: number;
    acceptanceRate: number;
    rejectionRate: number;
    requestsByReason: Record<ReassignmentReason, number>;
    requestsByPriority: Record<UserPriority, number>;
  }>;

  /**
   * Get user reassignment history
   */
  getUserReassignmentHistory(userId: string): Promise<{
    totalRequests: number;
    acceptedRequests: number;
    rejectedRequests: number;
    averageResponseTime: number;
    recentRequests: ReassignmentRequestEntity[];
  }>;

  /**
   * Find similar requests (same resource, similar time, similar reason)
   */
  findSimilarRequests(
    resourceId: string,
    reason: ReassignmentReason,
    timeWindow: number
  ): Promise<ReassignmentRequestEntity[]>;
}
