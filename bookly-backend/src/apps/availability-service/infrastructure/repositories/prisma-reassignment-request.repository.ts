import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../libs/common/services/prisma.service';
import { ReassignmentRequestRepository } from '../../domain/repositories/reassignment-request.repository';
import { ReassignmentRequestEntity } from '../../domain/entities/reassignment-request.entity';

@Injectable()
export class PrismaReassignmentRequestRepository implements ReassignmentRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ReassignmentRequestEntity | null> {
    const request = await this.prisma.reassignmentRequest.findUnique({
      where: { id },
      include: {
        originalReservation: true,
        requestedByUser: true
      }
    });

    if (!request) return null;

    return this.toDomainEntity(request);
  }

  async findAll(filters?: any): Promise<ReassignmentRequestEntity[]> {
    const requests = await this.prisma.reassignmentRequest.findMany({
      where: filters,
      include: {
        originalReservation: true,
        requestedByUser: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return requests.map(request => this.toDomainEntity(request));
  }

  async save(entity: ReassignmentRequestEntity): Promise<ReassignmentRequestEntity> {
    const data = {
      originalReservationId: entity.originalReservationId,
      suggestedResourceId: entity.suggestedResourceId,
      requestedBy: entity.requestedBy,
      reason: entity.reason,
      suggestedStartTime: '', // Not available in entity
      suggestedEndTime: '', // Not available in entity
      status: entity.status,
      priority: entity.priority,
      userResponse: entity.userResponse,
      rejectionCount: entity.rejectionCount,
      responseDeadline: entity.responseDeadline,
      respondedAt: entity.respondedAt
    };

    if (entity.id) {
      const updated = await this.prisma.reassignmentRequest.update({
        where: { id: entity.id },
        data,
        include: {
          originalReservation: true,
            requestedByUser: true
        }
      });
      return entity;
    } else {
      const created = await this.prisma.reassignmentRequest.create({
        data,
        include: {
          originalReservation: true,
            requestedByUser: true
        }
      });
      return this.toDomainEntity(created);
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reassignmentRequest.delete({
      where: { id }
    });
  }

  async findByUserId(userId: string): Promise<ReassignmentRequestEntity[]> {
    return this.findAll({ requestedBy: userId });
  }

  async findByStatus(status: string): Promise<ReassignmentRequestEntity[]> {
    return this.findAll({ status });
  }

  async findByResourceId(resourceId: string): Promise<ReassignmentRequestEntity[]> {
    return this.findAll({ suggestedResourceId: resourceId });
  }

  async findPending(filters: Partial<any> = {}, page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: string): Promise<{ items: ReassignmentRequestEntity[]; total: number }> {
    const where = {
      status: 'PENDING',
      ...filters
    };

    const [requests, total] = await Promise.all([
      this.prisma.reassignmentRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          originalReservation: true,
          suggestedResource: true,
          requestedByUser: true
        },
        orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' }
      }),
      this.prisma.reassignmentRequest.count({ where })
    ]);

    return {
      items: requests.map(request => this.toDomainEntity(request)),
      total
    };
  }

  private toDomainEntity(request: any): ReassignmentRequestEntity {
    return ReassignmentRequestEntity.fromPersistence({
      id: request.id,
      originalReservationId: request.originalReservationId,
      requestedBy: request.requestedBy,
      reason: request.reason as any,
      customReason: '',
      suggestedResourceId: request.suggestedResourceId,
      status: request.status as any,
      userResponse: request.userResponse as any,
      rejectionCount: request.rejectionCount || 0,
      priority: request.priority as any,
      responseDeadline: request.responseDeadline,
      respondedAt: request.respondedAt,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      acceptEquivalentResources: false,
      acceptAlternativeTimeSlots: false,
      capacityTolerancePercent: 0,
      requiredFeatures: [],
      preferredFeatures: [],
      maxDistanceMeters: 0,
      compensationInfo: '',
      internalNotes: '',
      tags: [],
      impactLevel: 0,
      estimatedResolutionHours: 0,
      relatedTicketId: '',
      affectedProgramId: '',
      minAdvanceNoticeHours: 0,
      allowPartialReassignment: false,
      requireUserConfirmation: false
    });
  }

  // Required repository interface methods
  async findMany(
    filters: any,
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: string
  ): Promise<{ items: ReassignmentRequestEntity[]; total: number }> {
    const where = this.buildWhereClause(filters);
    const [requests, total] = await Promise.all([
      this.prisma.reassignmentRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          originalReservation: true,
          suggestedResource: true,
          requestedByUser: true
        },
        orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' }
      }),
      this.prisma.reassignmentRequest.count({ where })
    ]);

    return {
      items: requests.map(request => this.toDomainEntity(request)),
      total
    };
  }

  async findByUser(
    filters: any,
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: string
  ): Promise<{ items: ReassignmentRequestEntity[]; total: number }> {
    const where = {
      requestedBy: filters.userId,
      ...this.buildWhereClause(filters)
    };
    
    const [requests, total] = await Promise.all([
      this.prisma.reassignmentRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          originalReservation: true,
          suggestedResource: true,
          requestedByUser: true
        },
        orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' }
      }),
      this.prisma.reassignmentRequest.count({ where })
    ]);

    return {
      items: requests.map(request => this.toDomainEntity(request)),
      total
    };
  }

  async search(
    searchTerm: string,
    filters: any,
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: string
  ): Promise<{ items: ReassignmentRequestEntity[]; total: number }> {
    const where = {
      AND: [
        this.buildWhereClause(filters),
        {
          OR: [
            { reason: { contains: searchTerm, mode: 'insensitive' } },
            { customReason: { contains: searchTerm, mode: 'insensitive' } },
            { internalNotes: { contains: searchTerm, mode: 'insensitive' } }
          ]
        }
      ]
    };

    const [requests, total] = await Promise.all([
      this.prisma.reassignmentRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          originalReservation: true,
          suggestedResource: true,
          requestedByUser: true
        },
        orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' }
      }),
      this.prisma.reassignmentRequest.count({ where })
    ]);

    return {
      items: requests.map(request => this.toDomainEntity(request)),
      total
    };
  }

  async create(data: any): Promise<ReassignmentRequestEntity> {
    const created = await this.prisma.reassignmentRequest.create({
      data: {
        originalReservationId: data.originalReservationId,
        requestedBy: data.requestedBy,
        reason: data.reason,
        // customReason field not in schema, skip it
        suggestedResourceId: data.suggestedResourceId,
        status: data.status,
        userResponse: data.userResponse,
        priority: data.priority,
        responseDeadline: data.responseDeadline
      },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });

    return this.toDomainEntity(created);
  }

  async findByReservationId(reservationId: string): Promise<ReassignmentRequestEntity[]> {
    const requests = await this.prisma.reassignmentRequest.findMany({
      where: { originalReservationId: reservationId },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async findByRequestedBy(userId: string): Promise<ReassignmentRequestEntity[]> {
    const requests = await this.prisma.reassignmentRequest.findMany({
      where: { requestedBy: userId },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async findByUserResponse(userResponse: any): Promise<ReassignmentRequestEntity[]> {
    const requests = await this.prisma.reassignmentRequest.findMany({
      where: { userResponse },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async findByReason(reason: any): Promise<ReassignmentRequestEntity[]> {
    const requests = await this.prisma.reassignmentRequest.findMany({
      where: { reason },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async findByPriority(priority: any): Promise<ReassignmentRequestEntity[]> {
    const requests = await this.prisma.reassignmentRequest.findMany({
      where: { priority },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async findPendingRequests(): Promise<ReassignmentRequestEntity[]> {
    const requests = await this.prisma.reassignmentRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async findPendingByReservationOwner(userId: string): Promise<ReassignmentRequestEntity[]> {
    const requests = await this.prisma.reassignmentRequest.findMany({
      where: {
        status: 'PENDING',
        originalReservation: {
          userId: userId
        }
      },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async findExpiringRequests(hoursBeforeExpiry: number): Promise<ReassignmentRequestEntity[]> {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + hoursBeforeExpiry);

    const requests = await this.prisma.reassignmentRequest.findMany({
      where: {
        responseDeadline: {
          lte: expiryDate
        },
        status: 'PENDING'
      },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async findExpiredRequests(): Promise<ReassignmentRequestEntity[]> {
    const now = new Date();
    const requests = await this.prisma.reassignmentRequest.findMany({
      where: {
        responseDeadline: {
          lt: now
        },
        status: 'PENDING'
      },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async findHighPriorityRequests(): Promise<ReassignmentRequestEntity[]> {
    const requests = await this.prisma.reassignmentRequest.findMany({
      where: { priority: 'HIGH' },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async findNeedingReminders(reminderIntervalHours: number): Promise<ReassignmentRequestEntity[]> {
    const reminderDate = new Date();
    reminderDate.setHours(reminderDate.getHours() - reminderIntervalHours);

    const requests = await this.prisma.reassignmentRequest.findMany({
      where: {
        createdAt: {
          lte: reminderDate
        },
        status: 'PENDING'
      },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ReassignmentRequestEntity[]> {
    const requests = await this.prisma.reassignmentRequest.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async findWithSuggestedResource(resourceId: string): Promise<ReassignmentRequestEntity[]> {
    const requests = await this.prisma.reassignmentRequest.findMany({
      where: { suggestedResourceId: resourceId },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async findWithoutSuggestedResource(): Promise<ReassignmentRequestEntity[]> {
    const requests = await this.prisma.reassignmentRequest.findMany({
      where: { suggestedResourceId: null },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async findByRejectionCount(minRejections: number): Promise<ReassignmentRequestEntity[]> {
    const requests = await this.prisma.reassignmentRequest.findMany({
      where: {
        rejectionCount: {
          gte: minRejections
        }
      },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async update(id: string, updates: Partial<ReassignmentRequestEntity>): Promise<ReassignmentRequestEntity> {
    const updated = await this.prisma.reassignmentRequest.update({
      where: { id },
      data: this.entityToUpdateData(updates),
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return this.toDomainEntity(updated);
  }

  async updateMany(requestIds: string[], updates: Partial<ReassignmentRequestEntity>): Promise<ReassignmentRequestEntity[]> {
    await this.prisma.reassignmentRequest.updateMany({
      where: {
        id: {
          in: requestIds
        }
      },
      data: this.entityToUpdateData(updates)
    });

    const updatedRequests = await this.prisma.reassignmentRequest.findMany({
      where: {
        id: {
          in: requestIds
        }
      },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });

    return updatedRequests.map(request => this.toDomainEntity(request));
  }

  async deleteByReservationId(reservationId: string): Promise<void> {
    await this.prisma.reassignmentRequest.deleteMany({
      where: { originalReservationId: reservationId }
    });
  }

  async countByStatus(status: any): Promise<number> {
    return this.prisma.reassignmentRequest.count({
      where: { status }
    });
  }

  async countPendingByUser(userId: string): Promise<number> {
    return this.prisma.reassignmentRequest.count({
      where: {
        requestedBy: userId,
        status: 'PENDING'
      }
    });
  }

  async countByReason(reason: any): Promise<number> {
    return this.prisma.reassignmentRequest.count({
      where: { reason }
    });
  }

  async acceptRequest(id: string): Promise<ReassignmentRequestEntity> {
    return this.update(id, {
      status: 'ACCEPTED' as any,
      userResponse: 'ACCEPTED' as any,
      respondedAt: new Date()
    });
  }

  async rejectRequest(id: string): Promise<ReassignmentRequestEntity> {
    const current = await this.findById(id);
    return this.update(id, {
      status: 'REJECTED' as any,
      userResponse: 'REJECTED' as any,
      respondedAt: new Date(),
      rejectionCount: (current?.rejectionCount || 0) + 1
    });
  }

  async cancelRequest(id: string): Promise<ReassignmentRequestEntity> {
    return this.update(id, {
      status: 'CANCELLED' as any,
      respondedAt: new Date()
    });
  }

  async expireRequest(id: string): Promise<ReassignmentRequestEntity> {
    return this.update(id, {
      status: 'EXPIRED' as any,
      respondedAt: new Date()
    });
  }

  async setSuggestedResource(id: string, resourceId: string): Promise<ReassignmentRequestEntity> {
    return this.update(id, {
      suggestedResourceId: resourceId
    });
  }

  async setResponseDeadline(id: string, deadline: Date): Promise<ReassignmentRequestEntity> {
    return this.update(id, {
      responseDeadline: deadline
    });
  }

  async bulkExpireTimedOutRequests(): Promise<ReassignmentRequestEntity[]> {
    const expiredRequests = await this.findExpiredRequests();
    const requestIds = expiredRequests.map(req => req.id!);
    
    if (requestIds.length === 0) return [];
    
    return this.updateMany(requestIds, {
      status: 'EXPIRED' as any,
      respondedAt: new Date()
    });
  }

  async findNeedingAutoProcessing(hoursBeforeEvent: number): Promise<ReassignmentRequestEntity[]> {
    const processDate = new Date();
    processDate.setHours(processDate.getHours() + hoursBeforeEvent);

    const requests = await this.prisma.reassignmentRequest.findMany({
      where: {
        status: 'PENDING',
        originalReservation: {
          startDate: {
            lte: processDate
          }
        }
      },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  async getReassignmentStats(): Promise<any> {
    const [total, pending, accepted, rejected, cancelled, expired] = await Promise.all([
      this.prisma.reassignmentRequest.count(),
      this.prisma.reassignmentRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.reassignmentRequest.count({ where: { status: 'ACCEPTED' } }),
      this.prisma.reassignmentRequest.count({ where: { status: 'REJECTED' } }),
      this.prisma.reassignmentRequest.count({ where: { status: 'CANCELLED' } }),
      this.prisma.reassignmentRequest.count({ where: { status: 'EXPIRED' } })
    ]);

    return {
      totalRequests: total,
      pendingRequests: pending,
      acceptedRequests: accepted,
      rejectedRequests: rejected,
      cancelledRequests: cancelled,
      expiredRequests: expired,
      averageResponseTime: 0, // TODO: Calculate based on createdAt vs respondedAt
      acceptanceRate: total > 0 ? (accepted / total) * 100 : 0,
      rejectionRate: total > 0 ? (rejected / total) * 100 : 0,
      requestsByReason: {},
      requestsByPriority: {}
    };
  }

  async getUserReassignmentHistory(userId: string): Promise<any> {
    const requests = await this.findByRequestedBy(userId);
    const accepted = requests.filter(r => r.status === 'ACCEPTED').length;
    const rejected = requests.filter(r => r.status === 'REJECTED').length;

    return {
      totalRequests: requests.length,
      acceptedRequests: accepted,
      rejectedRequests: rejected,
      averageResponseTime: 0, // TODO: Calculate
      recentRequests: requests.slice(0, 10)
    };
  }

  async findSimilarRequests(resourceId: string, reason: any, timeWindow: number): Promise<ReassignmentRequestEntity[]> {
    const timeWindowDate = new Date();
    timeWindowDate.setHours(timeWindowDate.getHours() - timeWindow);

    const requests = await this.prisma.reassignmentRequest.findMany({
      where: {
        OR: [
          { suggestedResourceId: resourceId },
          {
            originalReservation: {
              resourceId: resourceId
            }
          }
        ],
        reason: reason,
        createdAt: {
          gte: timeWindowDate
        }
      },
      include: {
        originalReservation: true,
        suggestedResource: true,
        requestedByUser: true
      }
    });
    return requests.map(request => this.toDomainEntity(request));
  }

  private buildWhereClause(filters: any): any {
    const where: any = {};
    
    if (filters.status) where.status = filters.status;
    if (filters.userResponse) where.userResponse = filters.userResponse;
    if (filters.reason) where.reason = filters.reason;
    if (filters.priority) where.priority = filters.priority;
    if (filters.resourceId) {
      where.OR = [
        { suggestedResourceId: filters.resourceId },
        { originalReservation: { resourceId: filters.resourceId } }
      ];
    }
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: filters.startDate,
        lte: filters.endDate
      };
    }
    
    return where;
  }

  private entityToUpdateData(updates: Partial<ReassignmentRequestEntity>): any {
    const data: any = {};
    
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.userResponse !== undefined) data.userResponse = updates.userResponse;
    if (updates.priority !== undefined) data.priority = updates.priority;
    if (updates.reason !== undefined) data.reason = updates.reason;
    if (updates.suggestedResourceId !== undefined) data.suggestedResourceId = updates.suggestedResourceId;
    if (updates.responseDeadline !== undefined) data.responseDeadline = updates.responseDeadline;
    if (updates.respondedAt !== undefined) data.respondedAt = updates.respondedAt;
    if (updates.rejectionCount !== undefined) data.rejectionCount = updates.rejectionCount;
    
    return data;
  }
}
