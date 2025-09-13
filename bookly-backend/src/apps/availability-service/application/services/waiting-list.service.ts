/**
 * RF-14: Waiting List Service
 * Application service for waiting list management with full business logic
 */

import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { WaitingListEntryRepository } from '../../domain/repositories/waiting-list-entry.repository';
import { WaitingListDomainService } from '../../domain/services/waiting-list-domain.service';
import { ReservationLimitsDomainService } from '../../domain/services/reservation-limits-domain.service';
import { WaitingListEntryEntity } from '../../domain/entities/waiting-list-entry.entity';
import { WaitingListEntryResponseDto } from '../../infrastructure/dtos/waiting-list-entry-response.dto';
import { WaitingListStatsDto } from '../../infrastructure/dtos/waiting-list-stats.dto';
import { EscalationReason } from '../../infrastructure/dtos/escalate-priority.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WaitingListService {
  constructor(
    @Inject('WaitingListEntryRepository')
    private readonly waitingListEntryRepository: WaitingListEntryRepository,
    @Inject('WaitingListDomainService')
    private readonly waitingListDomainService: WaitingListDomainService,
    @Inject('ReservationLimitsDomainService')
    private readonly reservationLimitsDomainService: ReservationLimitsDomainService,
    private readonly loggingService: LoggingService,
    private readonly eventBusService: EventBusService,
  ) {}

  /**
   * Join waiting list with full business logic validation (RF-14)
   */
  async joinWaitingList(data: {
    userId: string;
    resourceId: string;
    programId?: string;
    desiredStartTime: Date;
    desiredEndTime: Date;
    priority: string;
    confirmationTimeLimit?: number;
    requestedBy: string;
  }): Promise<{
    entry: WaitingListEntryEntity;
    position: number;
    estimatedWaitTime: number | null;
    warnings: string[];
  }> {
    this.loggingService.log('User joining waiting list', {
      userId: data.userId,
      resourceId: data.resourceId,
      desiredStartTime: data.desiredStartTime,
      priority: data.priority,
    }, 'WaitingListService');

    try {
      // Business Logic 1: Check reservation limits
      const canJoin = await this.reservationLimitsDomainService.validateReservationLimits({
        userId: data.userId,
        resourceId: data.resourceId,
        programId: data.programId,
        startDate: data.desiredStartTime,
        endDate: data.desiredEndTime,
        isRecurring: false,
        recurringInstanceCount: 1,
      });

      if (!canJoin.allowed) {
        throw new BadRequestException(
          `Cannot join waiting list: ${canJoin.violations[0].description}`
        );
      }

      // Business Logic 2: Find or create waiting list
      let waitingList = await this.waitingListEntryRepository.findByResourceAndTime(
        data.resourceId,
        data.desiredStartTime,
        data.desiredEndTime
      );

      if (!waitingList) {
        waitingList = [
          await this.waitingListDomainService.createWaitingList(
            data.resourceId,
            data.desiredStartTime,
            data.desiredEndTime,
            10, // default max entries
            data.requestedBy
          ),
        ];
      }

      // Business Logic 3: Add user to waiting list
      const entry = await this.waitingListDomainService.addToWaitingList({
        waitingListId: waitingList[0].id,
        userId: data.userId,
        resourceId: data.resourceId,
        userPriority: data.priority as any,
        confirmationTimeLimit: data.confirmationTimeLimit,
      });

      // Business Logic 4: Publish domain event
      const eventPayload = {
        eventType: 'waiting-list.user-joined',
        eventId: `waiting-list-user-joined-${Date.now()}`,
        aggregateId: waitingList[0].id,
        aggregateType: 'WaitingList',
        eventData: {
          entryId: entry.entry.id,
          userId: data.userId,
          resourceId: data.resourceId,
          position: entry.position,
          priority: data.priority,
          desiredStartTime: data.desiredStartTime,
          desiredEndTime: data.desiredEndTime,
          requestedBy: data.requestedBy,
          timestamp: new Date(),
        },
        version: 1,
        timestamp: new Date(),
      };

      await this.eventBusService.publishEvent(eventPayload as any);

      this.loggingService.log('User successfully joined waiting list', {
        entryId: entry.entry.id,
        waitingListId: waitingList[0].id,
        position: entry.position,
      }, 'WaitingListService');

      return entry;

    } catch (error) {
      this.loggingService.error(
        'Failed to join waiting list',
        error,
        'WaitingListService'
      );
      throw error;
    }
  }

  /**
   * Leave waiting list with validation (RF-14)
   */
  async leaveWaitingList(entryId: string, userId: string, reason?: string): Promise<void> {
    this.loggingService.log('User leaving waiting list', {
      entryId,
      userId,
      reason
    }, 'WaitingListService');

    try {
      const entry = await this.waitingListEntryRepository.findById(entryId);
      if (!entry) {
        throw new NotFoundException(`Waiting list entry ${entryId} not found`);
      }

      if (entry.userId !== userId) {
        throw new ForbiddenException('Cannot leave another user\'s waiting list entry');
      }

      await this.waitingListDomainService.removeFromWaitingList(entry.waitingListId, entryId, reason || 'User left waiting list');

      // Publish domain event
      const eventPayload = {
        eventType: 'waiting-list.user-left',
        eventId: `waiting-list-user-left-${Date.now()}`,
        aggregateId: entry.waitingListId,
        aggregateType: 'WaitingList',
        eventData: {
          entryId,
          userId,
          reason,
          timestamp: new Date(),
        },
        version: 1,
        timestamp: new Date(),
      };

      await this.eventBusService.publishEvent(eventPayload as any);

      this.loggingService.log('User successfully left waiting list', {
        entryId,
        userId
      }, 'WaitingListService');

    } catch (error) {
      this.loggingService.error(
        'Failed to leave waiting list',
        error,
        'WaitingListService'
      );
      throw error;
    }
  }

  /**
   * Confirm waiting list slot (RF-14)
   */
  async confirmSlot(entryId: string, userId: string, confirmed: boolean): Promise<void> {
    this.loggingService.log('Confirming waiting list slot', {
      entryId,
      userId,
      confirmed
    }, 'WaitingListService');

    try {
      const entry = await this.waitingListEntryRepository.findById(entryId);
      if (!entry) {
        throw new NotFoundException(`Waiting list entry ${entryId} not found`);
      }

      if (entry.userId !== userId) {
        throw new ForbiddenException('Cannot confirm another user\'s waiting list entry');
      }

      await this.waitingListDomainService.confirmSlot(entry.waitingListId, entryId, confirmed ? 'Slot confirmed' : 'Slot rejected');

      // Publish domain event
      const eventPayload = {
        eventType: confirmed ? 'waiting-list.slot-confirmed' : 'waiting-list.slot-rejected',
        eventId: `waiting-list-slot-${confirmed ? 'confirmed' : 'rejected'}-${Date.now()}`,
        aggregateId: entry.waitingListId,
        aggregateType: 'WaitingList',
        eventData: {
          entryId,
          userId,
          confirmed,
          timestamp: new Date(),
        },
        version: 1,
        timestamp: new Date(),
      };

      await this.eventBusService.publishEvent(eventPayload as any);

      this.loggingService.log(`Waiting list slot ${confirmed ? 'confirmed' : 'rejected'}`, {
        entryId,
        userId
      }, 'WaitingListService');

    } catch (error) {
      this.loggingService.error(
        'Failed to confirm waiting list slot',
        error,
        'WaitingListService'
      );
      throw error;
    }
  }

  /**
   * Get user waiting list entries (RF-14)
   */
  async getUserEntries(userId: string, status?: string): Promise<WaitingListEntryEntity[]> {
    this.loggingService.log('Getting waiting list entries for user', {
      userId,
      status
    }, 'WaitingListService');

    try {
      const entries = await this.waitingListEntryRepository.findByUserId(userId);

      this.loggingService.log(`Found ${entries.length} waiting list entries for user`, {
        userId,
        count: entries.length
      }, 'WaitingListService');

      return entries;

    } catch (error) {
      this.loggingService.error(
        'Failed to get user waiting list entries',
        error,
        'WaitingListService'
      );
      throw error;
    }
  }

  /**
   * Get specific waiting list entry (RF-14)
   */
  async getEntry(id: string, userId: string): Promise<WaitingListEntryEntity> {
    this.loggingService.log('Getting waiting list entry', {
      id,
      userId
    }, 'WaitingListService');

    try {
      const entry = await this.waitingListEntryRepository.findById(id);
      if (!entry) {
        throw new NotFoundException(`Waiting list entry ${id} not found`);
      }

      if (entry.userId !== userId) {
        throw new ForbiddenException('Cannot access another user\'s waiting list entry');
      }

      return entry;

    } catch (error) {
      this.loggingService.error(
        'Failed to get waiting list entry',
        error,
        'WaitingListService'
      );
      throw error;
    }
  }

  /**
   * Process expired entries (RF-14)
   */
  async processExpiredEntries(): Promise<{ processedCount: number; notifiedCount: number }> {
    this.loggingService.log('Processing expired waiting list entries', {}, 'WaitingListService');

    try {
      // Get all waiting lists and process expired entries
      const allEntries = await this.waitingListEntryRepository.findAll();
      const expiredEntries = allEntries.filter(entry => 
        entry.expiredAt && entry.expiredAt < new Date()
      );
      
      let processedCount = 0;
      let notifiedCount = 0;

      for (const entry of expiredEntries) {
        // Process through domain service
        await this.waitingListDomainService.processExpiredEntries(entry.waitingListId, false, true);
        processedCount++;

        // Publish notification event
        const eventPayload = {
          eventType: 'waiting-list.entry-expired',
          eventId: `waiting-list-entry-expired-${Date.now()}`,
          aggregateId: entry.waitingListId,
          aggregateType: 'WaitingList',
          eventData: {
            entryId: entry.id,
            userId: entry.userId,
            timestamp: new Date(),
          },
          version: 1,
          timestamp: new Date(),
        };

        await this.eventBusService.publishEvent(eventPayload as any);
        notifiedCount++;
      }

      this.loggingService.log(`Processed ${processedCount} expired entries, notified ${notifiedCount} users`, {
        processedCount,
        notifiedCount
      }, 'WaitingListService');

      return { processedCount, notifiedCount };

    } catch (error) {
      this.loggingService.error(
        'Failed to process expired waiting list entries',
        error,
        'WaitingListService'
      );
      throw error;
    }
  }

  /**
   * Escalate priority (RF-14)
   */
  async escalatePriority(waitingListId: string, entryId: string, newPriority: any): Promise<void> {
    const entry = await this.waitingListEntryRepository.findById(entryId);
    if (!entry) {
      throw new NotFoundException(`Waiting list entry ${entryId} not found`);
    }
    
    await this.waitingListDomainService.escalatePriority(
      waitingListId, 
      entryId, 
      newPriority, 
      'ADMIN_REQUEST'
    );
  }

  /**
   * Bulk notify waiting list users (RF-14)
   */
  async bulkNotify(entryIds: string[], message?: string): Promise<{ notifiedCount: number; successful: string[]; failed: Array<{ id: string; error: string }>; totalProcessed: number }> {
    this.loggingService.log('Bulk notifying waiting list entries', { entryCount: entryIds.length, message }, 'WaitingListService');

    try {
      const successful: string[] = [];
      const failed: Array<{ id: string; error: string }> = [];
      
      for (const entryId of entryIds) {
        try {
          const entry = await this.waitingListEntryRepository.findById(entryId);
          if (entry) {
            const result = await this.waitingListDomainService.bulkNotifyEntries(
              entry.waitingListId,
              [entryId],
              message || 'Notification from admin',
              'GENERAL',
              true
            );
            
            if (result.notifiedEntries.length > 0) {
              successful.push(entryId);
            } else {
              failed.push({ id: entryId, error: 'Notification failed' });
            }
          } else {
            failed.push({ id: entryId, error: 'Entry not found' });
          }
        } catch (error) {
          failed.push({ id: entryId, error: error.message || 'Unknown error' });
        }
      }
      
      return { 
        notifiedCount: successful.length,
        successful,
        failed,
        totalProcessed: successful.length + failed.length
      };
    } catch (error) {
      this.loggingService.error('Failed to bulk notify waiting list entries', error);
      throw error;
    }
  }

  /**
   * Optimize queue (RF-14)
   */
  async optimizeQueue(resourceId?: string): Promise<{ optimizedCount: number; recommendations: string[] }> {
    if (!resourceId) {
      return { optimizedCount: 0, recommendations: [] };
    }
    
    // Find entries for the resource
    const entries = await this.waitingListEntryRepository.findByResourceId(resourceId);
    if (entries.length === 0) {
      return { optimizedCount: 0, recommendations: [] };
    }
    
    const waitingListId = entries[0].waitingListId;
    const result = await this.waitingListDomainService.optimizeWaitingList(
      waitingListId,
      'PRIORITY_AND_TIME',
      false
    );
    
    return { 
      optimizedCount: result.reordered, 
      recommendations: result.suggestions.map(s => s.toString()) 
    };
  }

  /**
   * Process available slots (RF-14)
   */
  async processAvailableSlots(
    waitingListId: string, 
    availableSlots: Array<{ startTime: Date; endTime: Date; resourceId: string }> | number, 
    notifyUsers?: boolean, 
    autoConfirmIfSingleUser?: boolean
  ): Promise<{ remaining: number; skipped: number; notified: number; notifiedUsers: string[]; remainingInQueue: number; skippedUsers: Array<{ userId: string; reason: string }> }> {
    const slotsCount = typeof availableSlots === 'number' ? availableSlots : availableSlots.length;
    this.loggingService.log('Processing available slots for waiting list', {
      waitingListId,
      slotsCount,
      notifyUsers,
      autoConfirmIfSingleUser
    });

    try {
      // Handle both array and number inputs for availableSlots
      let slotsArray: Array<{ startTime: Date; endTime: Date; resourceId: string }>;
      
      if (typeof availableSlots === 'number') {
        // Create default slots if number is provided
        slotsArray = [];
        for (let i = 0; i < availableSlots; i++) {
          const startTime = new Date();
          startTime.setHours(9 + i, 0, 0, 0);
          const endTime = new Date(startTime);
          endTime.setHours(startTime.getHours() + 1);
          
          slotsArray.push({
            startTime,
            endTime,
            resourceId: 'default-resource'
          });
        }
      } else {
        slotsArray = availableSlots;
      }
      
      // Delegate to domain service
      const result = await this.waitingListDomainService.processAvailableSlots(
        waitingListId,
        slotsArray,
        notifyUsers || true,
        autoConfirmIfSingleUser || false
      );

      // Publish event
      await this.eventBusService.publishEvent({
        eventType: 'waiting-list.slots-processed',
        eventId: `waiting-list-slots-processed-${Date.now()}`,
        aggregateId: waitingListId,
        aggregateType: 'WaitingList',
        eventData: {
          availableSlots,
          remaining: result.remainingEntries.length,
          skipped: result.skippedEntries.length,
          notified: result.notifiedEntries.length,
          notifyUsers,
          autoConfirmIfSingleUser,
          timestamp: new Date(),
        },
        version: 1,
        timestamp: new Date(),
      });

      return {
        remaining: result.remainingEntries.length,
        skipped: result.skippedEntries.length,
        notified: result.notifiedEntries.length,
        notifiedUsers: result.notifiedEntries.map(e => e.userId || 'unknown'),
        remainingInQueue: result.remainingEntries.length,
        skippedUsers: result.skippedEntries.map(e => ({ userId: e.entry?.userId || 'unknown', reason: e.reason || 'Not available' }))
      };
    } catch (error) {
      this.loggingService.error('Failed to process available slots', error);
      throw error;
    }
  }

  /**
   * Get statistics (RF-14)
   */
  async getStatistics(resourceId?: string, startDate?: string, endDate?: string): Promise<WaitingListStatsDto> {
    const entries = resourceId 
      ? await this.waitingListEntryRepository.findByResourceId(resourceId)
      : await this.waitingListEntryRepository.findAll();
      
    if (entries.length === 0) {
      return {
        resourceId: resourceId || 'all',
        resourceName: 'All Resources',
        periodStart: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: endDate || new Date().toISOString(),
        metrics: {
          totalEntries: 0,
          currentlyWaiting: 0,
          notifiedEntries: 0,
          confirmedEntries: 0,
          expiredEntries: 0,
          cancelledEntries: 0
        },
        timing: {
          averageWaitTime: 0,
          medianWaitTime: 0,
          maxWaitTime: 0,
          minWaitTime: 0,
          averageResponseTime: 0
        },
        priorityStats: [],
        hourlyStats: [],
        currentQueueDepth: 0,
        peakQueueDepth: 0,
        overallSuccessRate: 0,
        abandonmentRate: 0,
        mostActiveDayOfWeek: 'Monday',
        mostActiveHour: 9,
        lastUpdated: new Date().toISOString()
      };
    }
    
    const waitingListId = entries[0].waitingListId;
    
    return await this.waitingListDomainService.getStats({
      waitingListId,
      resourceId: resourceId || '',
      programId: '',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
      groupBy: 'day',
      includeProjections: false
    });
  }

  /**
   * Get waiting list with optional enhancements (Query Handler Support)
   */
  async getWaitingList(params: {
    waitingListId: string;
    userId: string;
    includeEntries?: boolean;
    includeStats?: boolean;
    includeAlternatives?: boolean;
  }): Promise<any> {
    this.loggingService.log('Getting waiting list', params, 'WaitingListService');

    try {
      const entries = await this.waitingListEntryRepository.findByWaitingListId(params.waitingListId);
      if (!entries || entries.length === 0) {
        throw new NotFoundException(`Waiting list with ID ${params.waitingListId} not found`);
      }

      const result: any = { id: params.waitingListId, entries: entries };

      if (params.includeStats) {
        result.stats = await this.waitingListEntryRepository.getWaitingListStats(params.waitingListId);
      }

      return result;
    } catch (error) {
      this.loggingService.error('Failed to get waiting list', error);
      throw error;
    }
  }

  /**
   * Get multiple waiting lists with pagination (Query Handler Support)
   */
  async getWaitingLists(params: {
    resourceId?: string;
    date?: Date;
    status?: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: string;
    includeEntries?: boolean;
    includeStats?: boolean;
  }): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    this.loggingService.log('Getting waiting lists', params, 'WaitingListService');

    try {
      const filters = {
        resourceId: params.resourceId || '',
        date: params.date || new Date(),
        status: params.status || ''
      };

      const result = await this.waitingListEntryRepository.findMany(
        filters,
        params.page,
        params.limit,
        params.sortBy,
        params.sortOrder
      );

      return {
        items: result.items,
        total: result.total,
        page: params.page,
        limit: params.limit
      };
    } catch (error) {
      this.loggingService.error('Failed to get waiting lists', error);
      throw error;
    }
  }

  /**
   * Get waiting list entry with optional enhancements (Query Handler Support)
   */
  async getWaitingListEntry(params: {
    waitingListId: string;
    entryId: string;
    userId: string;
    includePosition?: boolean;
    includeEstimatedWait?: boolean;
    includeAlternatives?: boolean;
  }): Promise<any> {
    this.loggingService.log('Getting waiting list entry', params, 'WaitingListService');

    try {
      const entry = await this.waitingListEntryRepository.findById(params.entryId);
      if (!entry) {
        throw new NotFoundException(`Waiting list entry with ID ${params.entryId} not found`);
      }

      // Check permissions (users can only see their own entries unless admin)
      if (entry.userId !== params.userId) {
        throw new ForbiddenException('You can only view your own waiting list entries');
      }

      const result: any = { ...entry };

      if (params.includePosition) {
        result.position = await this.waitingListEntryRepository.getUserPosition(params.waitingListId, params.userId);
      }

      if (params.includeEstimatedWait) {
        result.estimatedWait = await this.waitingListEntryRepository.getEstimatedWaitTime(params.waitingListId, params.userId);
      }

      return result;
    } catch (error) {
      this.loggingService.error('Failed to get waiting list entry', error);
      throw error;
    }
  }

  /**
   * Get user waiting list entries with pagination (Query Handler Support)
   */
  async getUserWaitingListEntries(params: {
    userId: string;
    requestingUserId: string;
    status?: string;
    resourceId?: string;
    programId?: string;
    includeExpired?: boolean;
    includeEstimatedWait?: boolean;
    page: number;
    limit: number;
  }): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    this.loggingService.log('Getting user waiting list entries', params, 'WaitingListService');

    try {
      // Check permissions (users can only see their own entries unless admin)
      if (params.userId !== params.requestingUserId) {
        throw new ForbiddenException('You can only view your own waiting list entries');
      }

      const filters = {
        userId: params.userId,
        status: params.status || '',
        resourceId: params.resourceId || '',
        programId: params.programId || '',
        includeExpired: params.includeExpired || false
      };

      const result = await this.waitingListEntryRepository.findByUser(
        filters,
        params.page,
        params.limit
      );

      return {
        items: result.items,
        total: result.total,
        page: params.page,
        limit: params.limit
      };
    } catch (error) {
      this.loggingService.error('Failed to get user waiting list entries', error);
      throw error;
    }
  }

  /**
   * Get waiting list stats with optional filters (Query Handler Support)
   */
  async getWaitingListStats(params: {
    waitingListId?: string;
    resourceId?: string;
    programId?: string;
    startDate?: Date;
    endDate?: Date;
    groupBy?: string;
    includeProjections?: boolean;
  }): Promise<any> {
    this.loggingService.log('Getting waiting list stats', params, 'WaitingListService');

    try {
      if (params.waitingListId) {
        return await this.waitingListEntryRepository.getWaitingListStats(params.waitingListId);
      }

      // Return stats from domain service for complex queries
      return await this.waitingListDomainService.getStats({
        waitingListId: params.waitingListId || '',
        resourceId: params.resourceId || '',
        programId: params.programId || '',
        startDate: params.startDate || new Date(),
        endDate: params.endDate || new Date(),
        groupBy: (params.groupBy as 'day' | 'week' | 'month') || 'day',
        includeProjections: params.includeProjections || false
      });
    } catch (error) {
      this.loggingService.error('Failed to get waiting list stats', error);
      throw error;
    }
  }

  /**
   * Get waiting list analytics (Query Handler Support)
   */
  async getWaitingListAnalytics(params: {
    resourceId?: string;
    programId?: string;
    startDate?: Date;
    endDate?: Date;
    metrics?: string[];
    groupBy?: string;
  }): Promise<any> {
    this.loggingService.log('Getting waiting list analytics', params, 'WaitingListService');

    try {
      return await this.waitingListDomainService.getAnalytics({
        resourceId: params.resourceId || '',
        programId: params.programId || '',
        startDate: params.startDate || new Date(),
        endDate: params.endDate || new Date(),
        metrics: params.metrics || [],
        groupBy: (params.groupBy as 'day' | 'week' | 'month' | 'hour') || 'day'
      });
    } catch (error) {
      this.loggingService.error('Failed to get waiting list analytics', error);
      throw error;
    }
  }

  /**
   * Validate waiting list entry (Query Handler Support)
   */
  async validateEntry(params: {
    resourceId: string;
    userId: string;
    desiredStartTime: Date;
    desiredEndTime: Date;
    priority: any;
    programId?: string;
    expectedAttendees?: number;
    excludeEntryId?: string;
  }): Promise<{ isValid: boolean; violations: string[]; warnings: string[] }> {
    this.loggingService.log('Validating waiting list entry', params, 'WaitingListService');

    try {
      return await this.waitingListDomainService.validateEntry({
        resourceId: params.resourceId,
        userId: params.userId,
        desiredStartTime: params.desiredStartTime,
        desiredEndTime: params.desiredEndTime,
        priority: params.priority,
        programId: params.programId || '',
        expectedAttendees: params.expectedAttendees || 1,
        excludeEntryId: params.excludeEntryId || ''
      });
    } catch (error) {
      this.loggingService.error('Failed to validate waiting list entry', error);
      throw error;
    }
  }

  /**
   * Get waiting list alternatives (Query Handler Support)
   */
  async getAlternatives(params: {
    resourceId: string;
    desiredStartTime: Date;
    desiredEndTime: Date;
    userId: string;
    acceptAlternativeResources?: boolean;
    maxDurationDifference?: number;
    flexibleTimeRange?: number;
    limit?: number;
  }): Promise<{ alternatives: any[] }> {
    this.loggingService.log('Getting waiting list alternatives', params, 'WaitingListService');

    try {
      return await this.waitingListDomainService.getAlternatives({
        resourceId: params.resourceId,
        desiredStartTime: params.desiredStartTime,
        desiredEndTime: params.desiredEndTime,
        userId: params.userId,
        acceptAlternativeResources: params.acceptAlternativeResources || false,
        maxDurationDifference: params.maxDurationDifference || 30,
        flexibleTimeRange: params.flexibleTimeRange || 60,
        limit: params.limit || 10
      });
    } catch (error) {
      this.loggingService.error('Failed to get waiting list alternatives', error);
      throw error;
    }
  }

  /**
   * Get expired waiting list entries (Query Handler Support)
   */
  async getExpiredWaitingListEntries(params: {
    waitingListId?: string;
    resourceId?: string;
    expiredBefore?: Date;
    includeProcessed?: boolean;
    page: number;
    limit: number;
  }): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    this.loggingService.log('Getting expired waiting list entries', params, 'WaitingListService');

    try {
      const filters = {
        waitingListId: params.waitingListId || '',
        resourceId: params.resourceId || '',
        expiredBefore: params.expiredBefore || new Date(),
        includeProcessed: params.includeProcessed || false
      };

      const result = await this.waitingListEntryRepository.findExpired(
        filters,
        params.page,
        params.limit
      );

      return {
        items: result.items,
        total: result.total,
        page: params.page,
        limit: params.limit
      };
    } catch (error) {
      this.loggingService.error('Failed to get expired waiting list entries', error);
      throw error;
    }
  }

  /**
   * Search waiting lists (Query Handler Support)
   */
  async searchWaitingLists(params: {
    searchTerm: string;
    filters: any;
    page: number;
    limit: number;
    includeEntries?: boolean;
    includeStats?: boolean;
  }): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    this.loggingService.log('Searching waiting lists', params, 'WaitingListService');

    try {
      const result = await this.waitingListEntryRepository.search(
        params.searchTerm,
        params.filters,
        params.page,
        params.limit
      );

      return {
        items: result.items,
        total: result.total,
        page: params.page,
        limit: params.limit
      };
    } catch (error) {
      this.loggingService.error('Failed to search waiting lists', error);
      throw error;
    }
  }

  // Additional methods required by controllers

  async confirmEntry(entryId: string, userId: string): Promise<WaitingListEntryResponseDto> {
    this.loggingService.log('Confirming waiting list entry', { entryId, userId });
    
    await this.confirmSlot(entryId, userId, true);
    
    const entry = await this.waitingListEntryRepository.findById(entryId);
    if (!entry) {
      throw new NotFoundException(`Waiting list entry ${entryId} not found`);
    }
    
    return this.mapToResponseDto(entry);
  }

  async getResourceWaitingList(resourceId: string, queryDto: any): Promise<any> {
    this.loggingService.log('Getting resource waiting list', { resourceId, queryDto });
    
    const entries = await this.waitingListEntryRepository.findByResourceId(resourceId);
    
    return {
      resourceId,
      entries: entries.map(entry => this.mapToResponseDto(entry)),
      total: entries.length,
      page: queryDto.page || 1,
      limit: queryDto.limit || 10
    };
  }

  async validateJoin(params: {
    resourceId: string;
    userId: string;
    desiredStartTime: Date;
    desiredEndTime: Date;
    priority: any;
  }): Promise<{ canJoin: boolean; violations: string[]; warnings: string[]; estimatedPosition: number; estimatedWaitTime: number }> {
    this.loggingService.log('Validating waiting list join', params);
    
    const validation = await this.validateEntry({
      resourceId: params.resourceId,
      userId: params.userId,
      desiredStartTime: params.desiredStartTime,
      desiredEndTime: params.desiredEndTime,
      priority: params.priority
    });
    
    // Get estimated position and wait time
    const entries = await this.waitingListEntryRepository.findByResourceId(params.resourceId);
    const estimatedPosition = entries.length + 1;
    const estimatedWaitTime = estimatedPosition * 30; // Estimate 30 minutes per position
    
    return {
      canJoin: validation.isValid,
      violations: validation.violations,
      warnings: validation.warnings,
      estimatedPosition,
      estimatedWaitTime
    };
  }

  async getPosition(entryId: string, userId: string): Promise<{ currentPosition: number; totalInQueue: number; estimatedWaitTime: number; lastUpdated: Date }> {
    this.loggingService.log('Getting waiting list position', { entryId, userId });
    
    const entry = await this.waitingListEntryRepository.findById(entryId);
    if (!entry) {
      throw new NotFoundException(`Waiting list entry ${entryId} not found`);
    }
    
    if (entry.userId !== userId) {
      throw new ForbiddenException('Cannot view another user\'s position');
    }
    
    const position = await this.waitingListEntryRepository.getUserPosition(entry.waitingListId, userId);
    const estimatedWait = await this.waitingListEntryRepository.getEstimatedWaitTime(entry.waitingListId, userId);
    const allEntries = await this.waitingListEntryRepository.findByWaitingListId(entry.waitingListId);
    
    return { 
      currentPosition: position,
      totalInQueue: allEntries.length,
      estimatedWaitTime: estimatedWait,
      lastUpdated: new Date()
    };
  }

  async processExpiredNotifications(): Promise<{ expiredCount: number; newlyNotified: number; totalProcessed: number }> {
    this.loggingService.log('Processing expired notifications');
    
    const result = await this.processExpiredEntries();
    return {
      expiredCount: result.processedCount,
      newlyNotified: result.notifiedCount,
      totalProcessed: result.processedCount + result.notifiedCount
    };
  }

  async getPerformanceAnalytics(programId?: string, timeRange?: string): Promise<any> {
    this.loggingService.log('Getting performance analytics', { programId, timeRange });
    
    const startDate = new Date();
    const endDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }
    
    return await this.getWaitingListAnalytics({
      programId,
      startDate,
      endDate,
      metrics: ['total_entries', 'success_rate', 'average_wait_time'],
      groupBy: 'day'
    });
  }

  private mapToResponseDto(entry: WaitingListEntryEntity): WaitingListEntryResponseDto {
    return {
      id: entry.id,
      userId: entry.userId,
      resourceId: entry.resourceId,
      requestedStartTime: entry.requestedAt.toISOString(),
      requestedEndTime: entry.requestedAt.toISOString(), // Use requestedAt as fallback
      priority: entry.priority as any, // Type conversion
      status: entry.status as any, // Type conversion
      position: entry.position || 0,
      estimatedWaitTime: 0, // Default value since not available in entity
      createdAt: entry.requestedAt.toISOString(),
      updatedAt: entry.requestedAt.toISOString() // Use requestedAt as fallback
    };
  }
}
