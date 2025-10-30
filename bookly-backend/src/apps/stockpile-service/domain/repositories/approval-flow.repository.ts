import { ApprovalFlowEntity, ApprovalLevelEntity, ApprovalRequestEntity, ApprovalActionEntity } from '../entities/approval-flow.entity';

export interface ApprovalFlowRepository {
  // Approval Flow operations
  createApprovalFlow(flow: ApprovalFlowEntity): Promise<ApprovalFlowEntity>;
  updateApprovalFlow(id: string, flow: Partial<ApprovalFlowEntity>): Promise<ApprovalFlowEntity>;
  findApprovalFlowById(id: string): Promise<ApprovalFlowEntity | null>;
  findApprovalFlowsByScope(programId?: string, resourceType?: string, categoryId?: string): Promise<ApprovalFlowEntity[]>;
  findDefaultApprovalFlow(programId?: string, resourceType?: string, categoryId?: string): Promise<ApprovalFlowEntity | null>;
  deleteApprovalFlow(id: string): Promise<void>;
  
  // Approval Level operations
  createApprovalLevel(level: ApprovalLevelEntity): Promise<ApprovalLevelEntity>;
  updateApprovalLevel(id: string, level: Partial<ApprovalLevelEntity>): Promise<ApprovalLevelEntity>;
  findApprovalLevelById(id: string): Promise<ApprovalLevelEntity | null>;
  findApprovalLevelsByFlowId(flowId: string): Promise<ApprovalLevelEntity[]>;
  deleteApprovalLevel(id: string): Promise<void>;
  
  // Approval Request operations
  createApprovalRequest(request: ApprovalRequestEntity): Promise<ApprovalRequestEntity>;
  updateApprovalRequest(id: string, request: Partial<ApprovalRequestEntity>): Promise<ApprovalRequestEntity>;
  findApprovalRequestById(id: string): Promise<ApprovalRequestEntity | null>;
  findApprovalRequestsByReservationId(reservationId: string): Promise<ApprovalRequestEntity[]>;
  findPendingApprovalRequestsByApprover(approverId: string): Promise<ApprovalRequestEntity[]>;
  findExpiredApprovalRequests(): Promise<ApprovalRequestEntity[]>;
  
  // Approval Action operations
  createApprovalAction(action: ApprovalActionEntity): Promise<ApprovalActionEntity>;
  findApprovalActionsByRequestId(requestId: string): Promise<ApprovalActionEntity[]>;
}
