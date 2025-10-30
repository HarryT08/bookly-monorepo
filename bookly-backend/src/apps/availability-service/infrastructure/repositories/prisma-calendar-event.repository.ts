import { Injectable, Logger } from '@nestjs/common';
import { CalendarEventRepository } from '../../domain/repositories/calendar-event.repository';
import { CalendarEventEntity, CalendarEventStatus } from '../../domain/entities/calendar-event.entity';
import { PrismaService } from '../../../../libs/common/services/prisma.service';

/**
 * Prisma implementation of CalendarEventRepository (RF-08)
 * Handles CRUD operations for calendar events from external integrations
 * Uses correct Prisma schema fields: externalId, startDate, endDate, lastSync
 */
@Injectable()
export class PrismaCalendarEventRepository implements CalendarEventRepository {
  private readonly logger = new Logger(PrismaCalendarEventRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(eventData: {
    externalEventId: string;
    integrationId: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    isAllDay: boolean;
    status: string;
    attendees?: string[];
    metadata?: any;
  }): Promise<CalendarEventEntity> {
    this.logger.log('Creating calendar event', { 
      integrationId: eventData.integrationId, 
      externalEventId: eventData.externalEventId 
    });

    const event = await this.prisma.calendarEvent.create({
      data: {
        externalId: eventData.externalEventId,
        integrationId: eventData.integrationId,
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        isAllDay: eventData.isAllDay,
        status: eventData.status,
        lastSync: new Date()
      }
    });

    return this.mapToEntity(event);
  }

  async findById(id: string): Promise<CalendarEventEntity | null> {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id }
    });

    return event ? this.mapToEntity(event) : null;
  }

  async findByExternalId(integrationId: string, externalId: string): Promise<CalendarEventEntity | null> {
    const event = await this.prisma.calendarEvent.findFirst({
      where: {
        integrationId,
        externalId
      }
    });

    return event ? this.mapToEntity(event) : null;
  }

  async findByIntegration(integrationId: string): Promise<CalendarEventEntity[]> {
    const events = await this.prisma.calendarEvent.findMany({
      where: { integrationId },
      orderBy: { startDate: 'asc' }
    });

    return events.map(event => this.mapToEntity(event));
  }

  async findByIntegrationId(integrationId: string): Promise<CalendarEventEntity[]> {
    return this.findByIntegration(integrationId);
  }

  async findByIntegrationAndDateRange(
    integrationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEventEntity[]> {
    const events = await this.prisma.calendarEvent.findMany({
      where: {
        integrationId,
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            startDate: { lte: startDate },
            endDate: { gte: endDate }
          }
        ]
      },
      orderBy: { startDate: 'asc' }
    });

    return events.map(event => this.mapToEntity(event));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<CalendarEventEntity[]> {
    const events = await this.prisma.calendarEvent.findMany({
      where: {
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            startDate: { lte: startDate },
            endDate: { gte: endDate }
          }
        ]
      },
      orderBy: { startDate: 'asc' }
    });

    return events.map(event => this.mapToEntity(event));
  }

  async findConflicting(
    integrationId: string,
    startDate: Date,
    endDate: Date,
    excludeEventId?: string
  ): Promise<CalendarEventEntity[]> {
    const events = await this.prisma.calendarEvent.findMany({
      where: {
        integrationId,
        id: excludeEventId ? { not: excludeEventId } : undefined,
        OR: [
          {
            startDate: {
              gte: startDate,
              lt: endDate
            }
          },
          {
            endDate: {
              gt: startDate,
              lte: endDate
            }
          },
          {
            startDate: { lte: startDate },
            endDate: { gte: endDate }
          }
        ]
      },
      orderBy: { startDate: 'asc' }
    });

    return events.map(event => this.mapToEntity(event));
  }

  async findByStatus(integrationId: string, status: CalendarEventStatus): Promise<CalendarEventEntity[]> {
    const events = await this.prisma.calendarEvent.findMany({
      where: {
        integrationId,
        status: status.toString()
      },
      orderBy: { startDate: 'asc' }
    });

    return events.map(event => this.mapToEntity(event));
  }

  async findPendingSync(integrationId: string, lastSyncBefore: Date): Promise<CalendarEventEntity[]> {
    const events = await this.prisma.calendarEvent.findMany({
      where: {
        integrationId,
        lastSync: { lt: lastSyncBefore }
      },
      orderBy: { lastSync: 'asc' }
    });

    return events.map(event => this.mapToEntity(event));
  }

  async update(id: string, updateData: Partial<{
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    isAllDay: boolean;
    status: string;
  }>): Promise<CalendarEventEntity> {
    const event = await this.prisma.calendarEvent.update({
      where: { id },
      data: {
        ...updateData,
        lastSync: new Date(),
        updatedAt: new Date()
      }
    });

    return this.mapToEntity(event);
  }

  async updateSyncStatus(id: string, lastSync: Date): Promise<void> {
    await this.prisma.calendarEvent.update({
      where: { id },
      data: {
        lastSync,
        updatedAt: new Date()
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.calendarEvent.delete({
      where: { id }
    });
  }

  async deleteByExternalId(externalEventId: string, integrationId: string): Promise<void> {
    await this.prisma.calendarEvent.deleteMany({
      where: {
        externalId: externalEventId,
        integrationId
      }
    });
  }

  async findConflictingEvents(
    startDate: Date,
    endDate: Date,
    excludeEventId?: string
  ): Promise<CalendarEventEntity[]> {
    const events = await this.prisma.calendarEvent.findMany({
      where: {
        id: excludeEventId ? { not: excludeEventId } : undefined,
        OR: [
          {
            startDate: {
              gte: startDate,
              lt: endDate
            }
          },
          {
            endDate: {
              gt: startDate,
              lte: endDate
            }
          },
          {
            startDate: { lte: startDate },
            endDate: { gte: endDate }
          }
        ]
      },
      orderBy: { startDate: 'asc' }
    });

    return events.map(event => this.mapToEntity(event));
  }

  async deleteByIntegration(integrationId: string): Promise<void> {
    await this.prisma.calendarEvent.deleteMany({
      where: { integrationId }
    });
  }

  async bulkUpsert(events: Partial<CalendarEventEntity>[]): Promise<CalendarEventEntity[]> {
    const results: CalendarEventEntity[] = [];

    for (const eventData of events) {
      if (!eventData.externalEventId || !eventData.integrationId) {
        throw new Error('externalEventId and integrationId are required for bulk upsert');
      }

      const existing = await this.findByExternalId(eventData.integrationId, eventData.externalEventId);
      
      if (existing) {
        const updated = await this.update(existing.id, {
          title: eventData.title,
          description: eventData.description,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          isAllDay: eventData.isAllDay,
          status: eventData.status?.toString()
        });
        results.push(updated);
      } else {
        const created = await this.create({
          externalEventId: eventData.externalEventId,
          integrationId: eventData.integrationId,
          title: eventData.title || 'Untitled Event',
          description: eventData.description,
          startDate: eventData.startDate || new Date(),
          endDate: eventData.endDate || new Date(),
          isAllDay: eventData.isAllDay || false,
          status: eventData.status?.toString() || CalendarEventStatus.CONFIRMED.toString(),
          attendees: eventData.attendees || [],
          metadata: eventData.metadata || {}
        });
        results.push(created);
      }
    }

    return results;
  }

  async countByIntegration(integrationId: string): Promise<number> {
    return this.prisma.calendarEvent.count({
      where: { integrationId }
    });
  }

  /**
   * Maps Prisma data to CalendarEventEntity
   */
  private mapToEntity(data: any): CalendarEventEntity {
    return new CalendarEventEntity(
      data.id,
      data.externalId, // externalEventId
      data.integrationId,
      data.title,
      data.description,
      data.startDate,
      data.endDate,
      data.isAllDay,
      data.status as CalendarEventStatus,
      [], // attendees - not in Prisma schema
      {}, // metadata - not in Prisma schema
      data.createdAt,
      data.updatedAt,
      data.lastSync
    );
  }
}
