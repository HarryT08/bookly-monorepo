/**
 * Audit Repository Implementation
 * Handles persistence and retrieval of audit entries
 * Provides comprehensive audit trail storage and querying capabilities
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { LoggingService } from '@logging/logging.service';
import { AuditEntry } from '../services/audit.service';
import { AuditEventType, AuditCategory } from '../../utils';
import { LoggingHelper } from '@logging/logging.helper';

export interface AuditQueryFilters {
  eventType?: AuditEventType | AuditEventType[];
  category?: AuditCategory | AuditCategory[];
  resource?: string | string[];
  resourceId?: string | string[];
  userId?: string | string[];
  userRole?: string | string[];
  status?: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'CANCELLED';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dateFrom?: Date;
  dateTo?: Date;
  ipAddress?: string;
  correlationId?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'severity' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditStatistics {
  totalEntries: number;
  entriesByCategory: Record<string, number>;
  entriesByEventType: Record<string, number>;
  entriesByStatus: Record<string, number>;
  entriesBySeverity: Record<string, number>;
  averageDuration: number;
  failureRate: number;
  topUsers: Array<{ userId: string; count: number }>;
  topResources: Array<{ resource: string; count: number }>;
  timeRange: {
    earliest: Date;
    latest: Date;
  };
}

@Injectable()
export class AuditRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggingService
  ) {}

  /**
   * Save audit entry to database
   */
  async save(auditEntry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditEntry.create({
        data: {
          id: auditEntry.id,
          eventType: auditEntry.eventType,
          category: auditEntry.category,
          action: auditEntry.action,
          resource: auditEntry.resource,
          resourceId: auditEntry.resourceId,
          status: auditEntry.status,
          severity: auditEntry.severity,
          
          // Context
          userId: auditEntry.context.userId,
          userRole: auditEntry.context.userRole,
          userProgram: auditEntry.context.userProgram,
          sessionId: auditEntry.context.sessionId,
          ipAddress: auditEntry.context.ipAddress,
          userAgent: auditEntry.context.userAgent,
          correlationId: auditEntry.context.correlationId,
          requestId: auditEntry.context.requestId,
          
          // Metadata
          timestamp: auditEntry.metadata.timestamp,
          service: auditEntry.metadata.service,
          version: auditEntry.metadata.version,
          environment: auditEntry.metadata.environment,
          traceId: auditEntry.metadata.traceId,
          spanId: auditEntry.metadata.spanId,
          
          // Additional data
          payload: auditEntry.payload ? JSON.stringify(auditEntry.payload) : null,
          result: auditEntry.result ? JSON.stringify(auditEntry.result) : null,
          error: auditEntry.error ? JSON.stringify(auditEntry.error) : null,
          duration: auditEntry.duration,
          tags: auditEntry.tags || [],
        }
      });

      this.logger.log('Audit entry saved successfully', {
        auditId: auditEntry.id,
        eventType: auditEntry.eventType,
        category: auditEntry.category
      });

    } catch (error) {
      this.logger.error('Failed to save audit entry', error, LoggingHelper.logParams({
        auditId: auditEntry.id,
        eventType: auditEntry.eventType
      }));
      throw error;
    }
  }

  /**
   * Save multiple audit entries in batch
   */
  async saveBatch(auditEntries: AuditEntry[]): Promise<void> {
    try {
      const data = auditEntries.map(entry => ({
        id: entry.id,
        eventType: entry.eventType,
        category: entry.category,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        status: entry.status,
        severity: entry.severity,
        
        // Context
        userId: entry.context.userId,
        userRole: entry.context.userRole,
        userProgram: entry.context.userProgram,
        sessionId: entry.context.sessionId,
        ipAddress: entry.context.ipAddress,
        userAgent: entry.context.userAgent,
        correlationId: entry.context.correlationId,
        requestId: entry.context.requestId,
        
        // Metadata
        timestamp: entry.metadata.timestamp,
        service: entry.metadata.service,
        version: entry.metadata.version,
        environment: entry.metadata.environment,
        traceId: entry.metadata.traceId,
        spanId: entry.metadata.spanId,
        
        // Additional data
        payload: entry.payload ? JSON.stringify(entry.payload) : null,
        result: entry.result ? JSON.stringify(entry.result) : null,
        error: entry.error ? JSON.stringify(entry.error) : null,
        duration: entry.duration,
        tags: entry.tags || [],
      }));

      await this.prisma.auditEntry.createMany({
        data
      });

      this.logger.log('Audit entries batch saved successfully', LoggingHelper.logParams({
        count: auditEntries.length
      }));

    } catch (error) {
      this.logger.error('Failed to save audit entries batch', error, LoggingHelper.logParams({
        count: auditEntries.length
      }));
      throw error;
    }
  }

  /**
   * Find audit entries with filters
   */
  async find(filters: AuditQueryFilters = {}): Promise<AuditEntry[]> {
    try {
      const where: any = {};

      // Apply filters
      if (filters.eventType) {
        where.eventType = Array.isArray(filters.eventType) 
          ? { in: filters.eventType }
          : filters.eventType;
      }

      if (filters.category) {
        where.category = Array.isArray(filters.category)
          ? { in: filters.category }
          : filters.category;
      }

      if (filters.resource) {
        where.resource = Array.isArray(filters.resource)
          ? { in: filters.resource }
          : filters.resource;
      }

      if (filters.resourceId) {
        where.resourceId = Array.isArray(filters.resourceId)
          ? { in: filters.resourceId }
          : filters.resourceId;
      }

      if (filters.userId) {
        where.userId = Array.isArray(filters.userId)
          ? { in: filters.userId }
          : filters.userId;
      }

      if (filters.userRole) {
        where.userRole = Array.isArray(filters.userRole)
          ? { in: filters.userRole }
          : filters.userRole;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.severity) {
        where.severity = filters.severity;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.timestamp = {};
        if (filters.dateFrom) {
          where.timestamp.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.timestamp.lte = filters.dateTo;
        }
      }

      if (filters.ipAddress) {
        where.ipAddress = filters.ipAddress;
      }

      if (filters.correlationId) {
        where.correlationId = filters.correlationId;
      }

      if (filters.tags && filters.tags.length > 0) {
        where.tags = {
          hasEvery: filters.tags
        };
      }

      // Sorting
      const orderBy: any = {};
      if (filters.sortBy) {
        orderBy[filters.sortBy] = filters.sortOrder || 'desc';
      } else {
        orderBy.timestamp = 'desc';
      }

      const auditRecords = await this.prisma.auditEntry.findMany({
        where,
        orderBy,
        take: filters.limit || 100,
        skip: filters.offset || 0
      });

      // Transform to AuditEntry objects
      const auditEntries: AuditEntry[] = auditRecords.map(record => ({
        id: record.id,
        eventType: record.eventType as AuditEventType,
        category: record.category as AuditCategory,
        action: record.action,
        resource: record.resource,
        resourceId: record.resourceId || undefined,
        status: record.status as 'SUCCESS' | 'FAILURE' | 'PENDING' | 'CANCELLED',
        severity: record.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        context: {
          userId: record.userId || undefined,
          userRole: record.userRole || undefined,
          userProgram: record.userProgram || undefined,
          sessionId: record.sessionId || undefined,
          ipAddress: record.ipAddress || undefined,
          userAgent: record.userAgent || undefined,
          correlationId: record.correlationId || undefined,
          requestId: record.requestId || undefined,
        },
        metadata: {
          timestamp: record.timestamp,
          service: record.service,
          version: record.version,
          environment: record.environment,
          traceId: record.traceId || undefined,
          spanId: record.spanId || undefined,
        },
        payload: record.payload ? JSON.parse(record.payload) : undefined,
        result: record.result ? JSON.parse(record.result) : undefined,
        error: record.error ? JSON.parse(record.error) : undefined,
        duration: record.duration || undefined,
        tags: record.tags || undefined,
      }));

      this.logger.log('Audit entries retrieved successfully', {
        count: auditEntries.length,
        filters
      });

      return auditEntries;

    } catch (error) {
      this.logger.error('Failed to find audit entries', error, LoggingHelper.logParams({ filters }));
      throw error;
    }
  }

  /**
   * Find audit entry by ID
   */
  async findById(id: string): Promise<AuditEntry | null> {
    try {
      const record = await this.prisma.auditEntry.findUnique({
        where: { id }
      });

      if (!record) {
        return null;
      }

      const auditEntry: AuditEntry = {
        id: record.id,
        eventType: record.eventType as AuditEventType,
        category: record.category as AuditCategory,
        action: record.action,
        resource: record.resource,
        resourceId: record.resourceId || undefined,
        status: record.status as 'SUCCESS' | 'FAILURE' | 'PENDING' | 'CANCELLED',
        severity: record.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        context: {
          userId: record.userId || undefined,
          userRole: record.userRole || undefined,
          userProgram: record.userProgram || undefined,
          sessionId: record.sessionId || undefined,
          ipAddress: record.ipAddress || undefined,
          userAgent: record.userAgent || undefined,
          correlationId: record.correlationId || undefined,
          requestId: record.requestId || undefined,
        },
        metadata: {
          timestamp: record.timestamp,
          service: record.service,
          version: record.version,
          environment: record.environment,
          traceId: record.traceId || undefined,
          spanId: record.spanId || undefined,
        },
        payload: record.payload ? JSON.parse(record.payload) : undefined,
        result: record.result ? JSON.parse(record.result) : undefined,
        error: record.error ? JSON.parse(record.error) : undefined,
        duration: record.duration || undefined,
        tags: record.tags || undefined,
      };

      return auditEntry;

    } catch (error) {
      this.logger.error('Failed to find audit entry by ID', error, LoggingHelper.logParams({ id }));
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  async getStatistics(filters: AuditQueryFilters = {}): Promise<AuditStatistics> {
    try {
      const where: any = {};

      // Apply date filters
      if (filters.dateFrom || filters.dateTo) {
        where.timestamp = {};
        if (filters.dateFrom) {
          where.timestamp.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.timestamp.lte = filters.dateTo;
        }
      }

      // Get total count
      const totalEntries = await this.prisma.auditEntry.count({ where });

      // Get aggregations
      const [
        categoryStats,
        eventTypeStats,
        statusStats,
        severityStats,
        durationStats,
        topUsers,
        topResources,
        timeRange
      ] = await Promise.all([
        this.prisma.auditEntry.groupBy({
          by: ['category'],
          where,
          _count: { category: true }
        }),
        this.prisma.auditEntry.groupBy({
          by: ['eventType'],
          where,
          _count: { eventType: true }
        }),
        this.prisma.auditEntry.groupBy({
          by: ['status'],
          where,
          _count: { status: true }
        }),
        this.prisma.auditEntry.groupBy({
          by: ['severity'],
          where,
          _count: { severity: true }
        }),
        this.prisma.auditEntry.aggregate({
          where: { ...where, duration: { not: null } },
          _avg: { duration: true }
        }),
        this.prisma.auditEntry.groupBy({
          by: ['userId'],
          where: { ...where, userId: { not: null } },
          _count: { userId: true },
          orderBy: { _count: { userId: 'desc' } },
          take: 10
        }),
        this.prisma.auditEntry.groupBy({
          by: ['resource'],
          where,
          _count: { resource: true },
          orderBy: { _count: { resource: 'desc' } },
          take: 10
        }),
        this.prisma.auditEntry.aggregate({
          where,
          _min: { timestamp: true },
          _max: { timestamp: true }
        })
      ]);

      // Calculate failure rate
      const failureCount = statusStats.find(s => s.status === 'FAILURE')?._count.status || 0;
      const failureRate = totalEntries > 0 ? (failureCount / totalEntries) * 100 : 0;

      const statistics: AuditStatistics = {
        totalEntries,
        entriesByCategory: categoryStats.reduce((acc, stat) => {
          acc[stat.category] = stat._count.category;
          return acc;
        }, {} as Record<string, number>),
        entriesByEventType: eventTypeStats.reduce((acc, stat) => {
          acc[stat.eventType] = stat._count.eventType;
          return acc;
        }, {} as Record<string, number>),
        entriesByStatus: statusStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        }, {} as Record<string, number>),
        entriesBySeverity: severityStats.reduce((acc, stat) => {
          acc[stat.severity] = stat._count.severity;
          return acc;
        }, {} as Record<string, number>),
        averageDuration: durationStats._avg.duration || 0,
        failureRate,
        topUsers: topUsers.map(user => ({
          userId: user.userId || 'unknown',
          count: user._count.userId
        })),
        topResources: topResources.map(resource => ({
          resource: resource.resource,
          count: resource._count.resource
        })),
        timeRange: {
          earliest: timeRange._min.timestamp || new Date(),
          latest: timeRange._max.timestamp || new Date()
        }
      };

      this.logger.log('Audit statistics generated successfully', {
        totalEntries: statistics.totalEntries,
        failureRate: statistics.failureRate,
        averageDuration: statistics.averageDuration
      });

      return statistics;

    } catch (error) {
      this.logger.error('Failed to generate audit statistics', error, LoggingHelper.logParams({ filters }));
      throw error;
    }
  }

  /**
   * Delete old audit entries based on retention policy
   */
  async deleteOldEntries(retentionDays: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.prisma.auditEntry.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate
          }
        }
      });

      this.logger.log('Old audit entries deleted successfully', {
        deletedCount: result.count,
        retentionDays,
        cutoffDate
      });

      return result.count;

    } catch (error) {
      this.logger.error('Failed to delete old audit entries', error, LoggingHelper.logParams({
        retentionDays
      }));
      throw error;
    }
  }

  /**
   * Export audit entries to JSON
   */
  async exportToJson(filters: AuditQueryFilters = {}): Promise<string> {
    try {
      const auditEntries = await this.find({
        ...filters,
        limit: filters.limit || 10000 // Default export limit
      });

      const exportData = {
        exportedAt: new Date().toISOString(),
        filters,
        count: auditEntries.length,
        entries: auditEntries
      };

      const jsonData = JSON.stringify(exportData, null, 2);

      this.logger.log('Audit entries exported to JSON successfully', {
        count: auditEntries.length,
        filters
      });

      return jsonData;

    } catch (error) {
      this.logger.error('Failed to export audit entries to JSON', error, LoggingHelper.logParams({ filters }));
      throw error;
    }
  }
}
