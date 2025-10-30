import { IQuery } from '@nestjs/cqrs';

// Get Approval Flows Query
export class GetApprovalFlowsQuery implements IQuery {
  constructor(
    public readonly programId?: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly isActive?: boolean
  ) {}
}

// Get Approval Flow by ID Query
export class GetApprovalFlowByIdQuery implements IQuery {
  constructor(
    public readonly id: string
  ) {}
}

// Get Default Approval Flow Query
export class GetDefaultApprovalFlowQuery implements IQuery {
  constructor(
    public readonly programId?: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string
  ) {}
}

// Get Approval Levels by Flow ID Query
export class GetApprovalLevelsByFlowIdQuery implements IQuery {
  constructor(
    public readonly flowId: string
  ) {}
}

// Get Pending Approval Requests Query
export class GetPendingApprovalRequestsQuery implements IQuery {
  constructor(
    public readonly approverId?: string,
    public readonly programId?: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}

// Get Approval Requests by Reservation Query
export class GetApprovalRequestsByReservationQuery implements IQuery {
  constructor(
    public readonly reservationId: string
  ) {}
}

// Get Reservation Status Query
export class GetReservationStatusQuery implements IQuery {
  constructor(
    public readonly reservationId: string
  ) {}
}

// Get Expired Approval Requests Query
export class GetExpiredApprovalRequestsQuery implements IQuery {
  constructor() {}
}

// Get Approval History Query
export class GetApprovalHistoryQuery implements IQuery {
  constructor(
    public readonly reservationId?: string,
    public readonly approverId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}

// Get User Approval Statistics Query
export class GetUserApprovalStatisticsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}
