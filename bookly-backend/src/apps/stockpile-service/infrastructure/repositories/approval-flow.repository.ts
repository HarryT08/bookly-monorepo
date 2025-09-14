import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { LoggingService } from '@libs/logging/logging.service';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { ApprovalFlowRepository } from '../../domain/repositories/approval-flow.repository';
import {
  ApprovalFlowEntity,
  ApprovalLevelEntity,
  ApprovalRequestEntity,
  ApprovalActionEntity
} from '../../domain/entities/approval-flow.entity';
import { ApprovalFlow, ApprovalLevel, ApprovalRequest, ApprovalAction } from '@prisma/client';

@Injectable()
export class PrismaApprovalFlowRepository implements ApprovalFlowRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService
  ) {}

  async createApprovalFlow(flow: ApprovalFlowEntity): Promise<ApprovalFlowEntity> {
    this.loggingService.log('Creating approval flow in database', 'PrismaApprovalFlowRepository', LoggingHelper.logId(flow.id));

    const created = await this.prisma.approvalFlow.create({
      data: {
        id: flow.id,
        name: flow.name,
        description: flow.description,
        programId: flow.programId,
        resourceType: flow.resourceType,
        categoryId: flow.categoryId,
        isDefault: flow.isDefault,
        isActive: flow.isActive,
        requiresAllApprovals: flow.requiresAllApprovals,
        autoApprovalEnabled: flow.autoApprovalEnabled,
        reviewTimeHours: flow.reviewTimeHours,
        reminderHours: flow.reminderHours,
        createdBy: flow.createdBy,
        createdAt: flow.createdAt,
        updatedAt: flow.updatedAt
      },
      include: {
        levels: {
          orderBy: { level: 'asc' }
        }
      }
    });

    return this.mapToApprovalFlowEntity(created);
  }

  async updateApprovalFlow(id: string, flow: Partial<ApprovalFlowEntity>): Promise<ApprovalFlowEntity> {
    this.loggingService.log('Updating approval flow in database', 'PrismaApprovalFlowRepository', LoggingHelper.logId(id));

    const updated = await this.prisma.approvalFlow.update({
      where: { id },
      data: {
        ...(flow.name && { name: flow.name }),
        ...(flow.description && { description: flow.description }),
        ...(flow.isDefault !== undefined && { isDefault: flow.isDefault }),
        ...(flow.isActive !== undefined && { isActive: flow.isActive }),
        ...(flow.requiresAllApprovals !== undefined && { requiresAllApprovals: flow.requiresAllApprovals }),
        ...(flow.autoApprovalEnabled !== undefined && { autoApprovalEnabled: flow.autoApprovalEnabled }),
        ...(flow.reviewTimeHours !== undefined && { reviewTimeHours: flow.reviewTimeHours }),
        ...(flow.reminderHours && { reminderHours: flow.reminderHours }),
        updatedAt: new Date()
      },
      include: {
        levels: {
          orderBy: { level: 'asc' }
        }
      }
    });

    return this.mapToApprovalFlowEntity(updated);
  }

  async findApprovalFlowById(id: string): Promise<ApprovalFlowEntity | null> {
    this.loggingService.log('Finding approval flow by ID', 'PrismaApprovalFlowRepository', LoggingHelper.logId(id));

    const flow = await this.prisma.approvalFlow.findUnique({
      where: { id },
      include: {
        levels: {
          orderBy: { level: 'asc' }
        }
      }
    });

    return flow ? this.mapToApprovalFlowEntity(flow) : null;
  }

  async findApprovalFlows(filters: {
    programId?: string;
    resourceType?: string;
    categoryId?: string;
    isActive?: boolean;
  }): Promise<ApprovalFlowEntity[]> {
    this.loggingService.log('Finding approval flows with filters', 'PrismaApprovalFlowRepository', LoggingHelper.logFilters(filters));

    const flows = await this.prisma.approvalFlow.findMany({
      where: {
        programId: filters.programId,
        resourceType: filters.resourceType,
        categoryId: filters.categoryId,
        isActive: filters.isActive
      },
      include: {
        levels: {
          orderBy: { level: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return flows.map(flow => this.mapToApprovalFlowEntity(flow));
  }

  async findDefaultApprovalFlow(programId?: string, resourceType?: string, categoryId?: string): Promise<ApprovalFlowEntity | null> {
    this.loggingService.log('Finding default approval flow', 'PrismaApprovalFlowRepository', LoggingHelper.logFilters({ programId, resourceType, categoryId }));

    const flow = await this.prisma.approvalFlow.findFirst({
      where: {
        programId,
        resourceType,
        categoryId,
        isDefault: true,
        isActive: true
      },
      include: {
        levels: {
          orderBy: { level: 'asc' }
        }
      }
    });

    return flow ? this.mapToApprovalFlowEntity(flow) : null;
  }

  async createApprovalLevel(level: ApprovalLevelEntity): Promise<ApprovalLevelEntity> {
    this.loggingService.log('Creating approval level in database', 'PrismaApprovalFlowRepository', LoggingHelper.logId(level.id));

    const created = await this.prisma.approvalLevel.create({
      data: {
        id: level.id,
        flowId: level.flowId,
        level: level.level,
        name: level.name,
        description: level.description || '',
        approverRoles: level.approverRoles,
        approverUsers: level.approverUsers,
        requiresAll: level.requiresAll,
        timeoutHours: level.timeoutHours,
        isActive: level.isActive,
        createdAt: level.createdAt,
        updatedAt: level.updatedAt
      }
    });

    return this.mapToApprovalLevelEntity(created);
  }

  async findApprovalLevelsByFlowId(flowId: string): Promise<ApprovalLevelEntity[]> {
    this.loggingService.log('Finding approval levels by flow ID', 'PrismaApprovalFlowRepository', LoggingHelper.logId(flowId));

    const levels = await this.prisma.approvalLevel.findMany({
      where: { flowId, isActive: true },
      orderBy: { level: 'asc' }
    });

    return levels.map(level => this.mapToApprovalLevelEntity(level));
  }

  async createApprovalRequest(request: ApprovalRequestEntity): Promise<ApprovalRequestEntity> {
    this.loggingService.log('Creating approval request in database', 'PrismaApprovalFlowRepository', LoggingHelper.logId(request.id));

    const created = await this.prisma.approvalRequest.create({
      data: {
        id: request.id,
        reservationId: request.reservationId,
        levelId: request.levelId,
        status: request.status,
        approverId: request.approverId || null,
        comments: request.comments || null,
        requestedAt: request.requestedAt,
        respondedAt: request.respondedAt || null,
        timeoutAt: request.timeoutAt || null,
        notificationsSent: request.notificationsSent || null,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      }
    });

    return this.mapToApprovalRequestEntity(created);
  }

  async updateApprovalRequest(id: string, request: Partial<ApprovalRequestEntity>): Promise<ApprovalRequestEntity> {
    this.loggingService.log('Updating approval request in database', 'PrismaApprovalFlowRepository', LoggingHelper.logId(id));

    const updated = await this.prisma.approvalRequest.update({
      where: { id },
      data: {
        ...(request.status && { status: request.status }),
        ...(request.approverId && { approverId: request.approverId }),
        ...(request.comments && { comments: request.comments }),
        ...(request.respondedAt && { respondedAt: request.respondedAt }),
        ...(request.timeoutAt && { timeoutAt: request.timeoutAt }),
        ...(request.notificationsSent && { notificationsSent: request.notificationsSent }),
        updatedAt: new Date()
      }
    });

    return this.mapToApprovalRequestEntity(updated);
  }

  async findApprovalRequestById(id: string): Promise<ApprovalRequestEntity | null> {
    this.loggingService.log('Finding approval request by ID', 'PrismaApprovalFlowRepository', LoggingHelper.logId(id));

    const request = await this.prisma.approvalRequest.findUnique({
      where: { id }
    });

    return request ? this.mapToApprovalRequestEntity(request) : null;
  }

  async findApprovalRequestsByReservation(reservationId: string): Promise<ApprovalRequestEntity[]> {
    this.loggingService.log('Finding approval requests by reservation', 'PrismaApprovalFlowRepository', LoggingHelper.logReservationId(reservationId));

    const requests = await this.prisma.approvalRequest.findMany({
      where: { reservationId },
      include: {
        reservation: true,
        level: true,
        actions: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return requests.map(request => this.mapToApprovalRequestEntity(request));
  }

  async findPendingApprovalRequests(filters: {
    approverId?: string;
    programId?: string;
    resourceType?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ requests: ApprovalRequestEntity[]; total: number }> {
    this.loggingService.log('Finding pending approval requests', 'PrismaApprovalFlowRepository', LoggingHelper.logFilters(filters));

    const where = {
      status: 'PENDING',
      approverId: filters.approverId,
      flow: {
        programId: filters.programId,
        resourceType: filters.resourceType,
        categoryId: filters.categoryId
      }
    };

    const [requests, total] = await Promise.all([
      this.prisma.approvalRequest.findMany({
        where,
        include: {
          reservation: true,
          level: true,
          actions: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { requestedAt: 'asc' },
        skip: filters.page && filters.limit ? (filters.page - 1) * filters.limit : undefined,
        take: filters.limit
      }),
      this.prisma.approvalRequest.count({ where })
    ]);

    return {
      requests: requests.map(request => this.mapToApprovalRequestEntity(request)),
      total
    };
  }

  async findExpiredApprovalRequests(): Promise<ApprovalRequestEntity[]> {
    this.loggingService.log('Finding expired approval requests', 'PrismaApprovalFlowRepository');

    const requests = await this.prisma.approvalRequest.findMany({
      where: {
        status: 'PENDING',
        timeoutAt: {
          lt: new Date()
        }
      }
    });

    return requests.map(request => this.mapToApprovalRequestEntity(request));
  }

  async createApprovalAction(action: ApprovalActionEntity): Promise<ApprovalActionEntity> {
    this.loggingService.log('Creating approval action in database', 'PrismaApprovalFlowRepository', LoggingHelper.logId(action.id));

    const created = await this.prisma.approvalAction.create({
      data: {
        id: action.id,
        requestId: action.requestId,
        userId: action.userId,
        action: action.action,
        comments: action.comments || null,
        ipAddress: action.ipAddress || null,
        userAgent: action.userAgent || null,
        createdAt: action.createdAt
      }
    });

    return this.mapToApprovalActionEntity(created);
  }

  async findApprovalActionsByRequest(requestId: string): Promise<ApprovalActionEntity[]> {
    this.loggingService.log('Finding approval actions by request', 'PrismaApprovalFlowRepository', LoggingHelper.logId(requestId));

    const actions = await this.prisma.approvalAction.findMany({
      where: { requestId },
      orderBy: { createdAt: 'desc' }
    });

    return actions.map(action => this.mapToApprovalActionEntity(action));
  }

  private mapToApprovalFlowEntity(data: any): ApprovalFlowEntity {
    return new ApprovalFlowEntity(
      data.id,
      data.name,
      data.description,
      data.programId,
      data.resourceType,
      data.categoryId,
      data.isDefault,
      data.requiresAllApprovals || false,
      data.autoApprovalEnabled || false,
      data.timeoutHours || 24,
      data.reminderHours || 2,
      data.createdBy,
      data.isActive,
      data.createdAt,
      data.updatedAt,
      data.levels?.map((level: any) => this.mapToApprovalLevelEntity(level)) || []
    );
  }

  private mapToApprovalLevelEntity(data: any): ApprovalLevelEntity {
    return new ApprovalLevelEntity(
      data.id,
      data.flowId,
      data.level,
      data.name,
      data.description,
      data.approverRoles || [],
      data.approverUsers || [],
      data.requiresAll || false,
      data.timeoutHours || 24,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }

  private mapToApprovalRequestEntity(data: any): ApprovalRequestEntity {
    return new ApprovalRequestEntity(
      data.id,
      data.reservationId,
      data.levelId,
      data.status,
      data.approverId || null,
      data.comments || null,
      data.requestedAt,
      data.respondedAt || null,
      data.timeoutAt || null,
      data.notificationsSent || null,
      data.createdAt,
      data.updatedAt
    );
  }

  private mapToApprovalActionEntity(data: any): ApprovalActionEntity {
    return new ApprovalActionEntity(
      data.id,
      data.requestId,
      data.userId,
      data.action,
      data.comments || null,
      data.ipAddress || null,
      data.userAgent || null,
      data.createdAt
    );
  }

  // Missing methods to complete ApprovalFlowRepository interface
  async findApprovalFlowsByScope(programId?: string, resourceType?: string, categoryId?: string): Promise<ApprovalFlowEntity[]> {
    this.loggingService.log('Finding approval flows by scope', 'PrismaApprovalFlowRepository', LoggingHelper.logFilters({ programId, resourceType, categoryId }));

    const where: any = { isActive: true };
    if (programId) where.programId = programId;
    if (resourceType) where.resourceType = resourceType;
    if (categoryId) where.categoryId = categoryId;

    const flows = await this.prisma.approvalFlow.findMany({
      where,
      include: {
        levels: {
          orderBy: { level: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return flows.map(flow => this.mapToApprovalFlowEntity(flow));
  }

  async deleteApprovalFlow(id: string): Promise<void> {
    this.loggingService.log('Deleting approval flow', 'PrismaApprovalFlowRepository', LoggingHelper.logId(id));

    await this.prisma.approvalFlow.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() }
    });
  }

  async updateApprovalLevel(id: string, level: Partial<ApprovalLevelEntity>): Promise<ApprovalLevelEntity> {
    this.loggingService.log('Updating approval level', 'PrismaApprovalFlowRepository', LoggingHelper.logId(id));

    const updated = await this.prisma.approvalLevel.update({
      where: { id },
      data: {
        ...(level.name && { name: level.name }),
        ...(level.description && { description: level.description }),
        ...(level.approverRoles && { approverRoles: level.approverRoles }),
        ...(level.approverUsers && { approverUsers: level.approverUsers }),
        ...(level.requiresAll !== undefined && { requiresAll: level.requiresAll }),
        ...(level.timeoutHours && { timeoutHours: level.timeoutHours }),
        ...(level.isActive !== undefined && { isActive: level.isActive }),
        updatedAt: new Date()
      }
    });

    return this.mapToApprovalLevelEntity(updated);
  }

  async findApprovalLevelById(id: string): Promise<ApprovalLevelEntity | null> {
    this.loggingService.log('Finding approval level by ID', 'PrismaApprovalFlowRepository', LoggingHelper.logId(id));

    const level = await this.prisma.approvalLevel.findUnique({
      where: { id }
    });

    return level ? this.mapToApprovalLevelEntity(level) : null;
  }

  async deleteApprovalLevel(id: string): Promise<void> {
    this.loggingService.log('Deleting approval level', 'PrismaApprovalFlowRepository', LoggingHelper.logId(id));

    await this.prisma.approvalLevel.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() }
    });
  }

  async findApprovalRequestsByReservationId(reservationId: string): Promise<ApprovalRequestEntity[]> {
    this.loggingService.log('Finding approval requests by reservation ID', 'PrismaApprovalFlowRepository', LoggingHelper.logReservationId(reservationId));

    const requests = await this.prisma.approvalRequest.findMany({
      where: { reservationId },
      orderBy: { createdAt: 'desc' }
    });

    return requests.map(request => this.mapToApprovalRequestEntity(request));
  }

  async findPendingApprovalRequestsByApprover(approverId: string): Promise<ApprovalRequestEntity[]> {
    this.loggingService.log('Finding pending approval requests by approver', 'PrismaApprovalFlowRepository', LoggingHelper.logId(approverId));

    const requests = await this.prisma.approvalRequest.findMany({
      where: {
        status: 'PENDING',
        approverId: approverId
      },
      orderBy: { requestedAt: 'asc' }
    });

    return requests.map(request => this.mapToApprovalRequestEntity(request));
  }

  async findApprovalActionsByRequestId(requestId: string): Promise<ApprovalActionEntity[]> {
    return this.findApprovalActionsByRequest(requestId);
  }
}
