import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../libs/common/services/prisma.service';
import { PenaltyEventRepository } from '../../domain/repositories/penalty-event.repository';
import { PenaltyEventEntity, PenaltyEventType } from '../../domain/entities/penalty-event.entity';
import { SeverityLevel } from '../../utils/severity-level.enum';

@Injectable()
export class PrismaPenaltyEventRepository implements PenaltyEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomainEntity(event: any): PenaltyEventEntity {
    return PenaltyEventEntity.fromPersistence({
      id: event.id,
      programId: event.programId,
      eventType: this.mapStringToEventType(event.eventType),
      name: event.name,
      description: event.description || '',
      severityLevel: SeverityLevel.MEDIUM, // Default severity
      penaltyPoints: this.extractPenaltyPointsFromConfig(event.configuration),
      isActive: event.isActive,
      isCustom: event.canBeCustomized,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    });
  }

  private mapStringToEventType(eventTypeString: string): PenaltyEventType {
    switch (eventTypeString) {
      case 'NO_SHOW':
        return PenaltyEventType.NO_SHOW;
      case 'LATE_CANCELLATION':
        return PenaltyEventType.LATE_CANCELLATION;
      case 'REPEATED_CANCELLATION':
        return PenaltyEventType.REPEATED_CANCELLATION;
      case 'RESOURCE_MISUSE':
        return PenaltyEventType.RESOURCE_MISUSE;
      case 'UNAUTHORIZED_ACCESS':
        return PenaltyEventType.UNAUTHORIZED_ACCESS;
      case 'WAITING_LIST_NO_RESPONSE':
        return PenaltyEventType.WAITING_LIST_NO_RESPONSE;
      case 'WAITING_LIST_REJECTION_ABUSE':
        return PenaltyEventType.WAITING_LIST_REJECTION_ABUSE;
      case 'REASSIGNMENT_REJECTION_ABUSE':
        return PenaltyEventType.REASSIGNMENT_REJECTION_ABUSE;
      case 'POLICY_VIOLATION':
        return PenaltyEventType.POLICY_VIOLATION;
      case 'FALSE_INFORMATION':
        return PenaltyEventType.FALSE_INFORMATION;
      case 'CUSTOM':
        return PenaltyEventType.CUSTOM;
      case 'REPEATED_VIOLATIONS':
        return PenaltyEventType.REPEATED_VIOLATIONS;
      case 'CUSTOM_EVENT':
        return PenaltyEventType.CUSTOM_EVENT;
      default:
        return PenaltyEventType.CUSTOM;
    }
  }

  private mapEventTypeToString(eventType: PenaltyEventType): string {
    return eventType.toString();
  }

  private extractPenaltyPointsFromConfig(configuration: any): number {
    if (typeof configuration === 'object' && configuration?.penaltyPoints) {
      return configuration.penaltyPoints;
    }
    return 10; // Default penalty points
  }

  async findByUserAndTimeRange(userId: string, startDate: Date, endDate: Date): Promise<PenaltyEventEntity[]> {
    // Note: This method assumes userId filtering which doesn't match current Prisma schema
    // For now, filter by date range as a compromise
    const events = await this.prisma.penaltyEvent.findMany({
      where: {
        activationDate: {
          gte: startDate,
          lte: endDate
        },
        isActive: true
      }
    });

    return events.map(event => this.toDomainEntity(event));
  }

  async create(data: {
    programId: string;
    eventType: PenaltyEventType;
    name: string;
    description: string;
    penaltyPoints: number;
    isActive: boolean;
    isCustom: boolean;
  }): Promise<PenaltyEventEntity> {
    const created = await this.prisma.penaltyEvent.create({
      data: {
        programId: data.programId,
        name: data.name,
        description: data.description,
        eventType: this.mapEventTypeToString(data.eventType),
        isActive: data.isActive,
        canBeCustomized: data.isCustom,
        configuration: { penaltyPoints: data.penaltyPoints },
        activationDate: new Date()
      }
    });

    return this.toDomainEntity(created);
  }

  async findById(id: string): Promise<PenaltyEventEntity | null> {
    const event = await this.prisma.penaltyEvent.findUnique({
      where: { id }
    });

    return event ? this.toDomainEntity(event) : null;
  }

  async findByProgramId(programId: string): Promise<PenaltyEventEntity[]> {
    const events = await this.prisma.penaltyEvent.findMany({
      where: { programId }
    });

    return events.map(event => this.toDomainEntity(event));
  }

  async findByEventType(eventType: PenaltyEventType): Promise<PenaltyEventEntity[]> {
    const events = await this.prisma.penaltyEvent.findMany({
      where: { eventType: this.mapEventTypeToString(eventType) }
    });

    return events.map(event => this.toDomainEntity(event));
  }

  async findByProgramAndEventType(programId: string, eventType: PenaltyEventType): Promise<PenaltyEventEntity[]> {
    const events = await this.prisma.penaltyEvent.findMany({
      where: {
        programId,
        eventType: this.mapEventTypeToString(eventType)
      }
    });

    return events.map(event => this.toDomainEntity(event));
  }

  async findActiveEvents(): Promise<PenaltyEventEntity[]> {
    const events = await this.prisma.penaltyEvent.findMany({
      where: { isActive: true }
    });

    return events.map(event => this.toDomainEntity(event));
  }

  async findActiveByProgramId(programId: string): Promise<PenaltyEventEntity[]> {
    const events = await this.prisma.penaltyEvent.findMany({
      where: { programId, isActive: true }
    });

    return events.map(event => this.toDomainEntity(event));
  }

  async findInactiveEvents(): Promise<PenaltyEventEntity[]> {
    const events = await this.prisma.penaltyEvent.findMany({
      where: { isActive: false }
    });

    return events.map(event => this.toDomainEntity(event));
  }

  async findSystemDefaultEvents(): Promise<PenaltyEventEntity[]> {
    const events = await this.prisma.penaltyEvent.findMany({
      where: { canBeCustomized: false }
    });

    return events.map(event => this.toDomainEntity(event));
  }

  async findCustomEvents(): Promise<PenaltyEventEntity[]> {
    const events = await this.prisma.penaltyEvent.findMany({
      where: { canBeCustomized: true }
    });

    return events.map(event => this.toDomainEntity(event));
  }

  async findCustomByProgramId(programId: string): Promise<PenaltyEventEntity[]> {
    const events = await this.prisma.penaltyEvent.findMany({
      where: { programId, canBeCustomized: true }
    });

    return events.map(event => this.toDomainEntity(event));
  }

  async findByPenaltyPointsRange(minPoints: number, maxPoints: number): Promise<PenaltyEventEntity[]> {
    // Since penalty points are stored in configuration JSON, we need to filter in memory
    const events = await this.prisma.penaltyEvent.findMany();

    return events
      .map(event => this.toDomainEntity(event))
      .filter(entity => {
        const points = entity.penaltyPoints;
        return points >= minPoints && points <= maxPoints;
      });
  }

  async findHighPenaltyEvents(threshold: number): Promise<PenaltyEventEntity[]> {
    const events = await this.prisma.penaltyEvent.findMany();

    return events
      .map(event => this.toDomainEntity(event))
      .filter(entity => entity.penaltyPoints >= threshold);
  }

  async findByNameContaining(searchTerm: string): Promise<PenaltyEventEntity[]> {
    const events = await this.prisma.penaltyEvent.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }
    });

    return events.map(event => this.toDomainEntity(event));
  }

  async update(id: string, updates: Partial<PenaltyEventEntity>): Promise<PenaltyEventEntity> {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.eventType !== undefined) updateData.eventType = this.mapEventTypeToString(updates.eventType);
    
    // Handle penalty points update in configuration
    if (updates.penaltyPoints !== undefined) {
      const currentEvent = await this.prisma.penaltyEvent.findUnique({
        where: { id }
      });
      
      if (currentEvent) {
        const currentConfig = (currentEvent.configuration as Record<string, any>) || {};
        updateData.configuration = {
          ...currentConfig,
          penaltyPoints: updates.penaltyPoints
        };
      }
    }

    const updated = await this.prisma.penaltyEvent.update({
      where: { id },
      data: updateData
    });

    return this.toDomainEntity(updated);
  }

  async updateMany(eventIds: string[], updates: Partial<PenaltyEventEntity>): Promise<PenaltyEventEntity[]> {
    const results: PenaltyEventEntity[] = [];
    
    for (const id of eventIds) {
      const updated = await this.update(id, updates);
      results.push(updated);
    }
    
    return results;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.penaltyEvent.delete({
      where: { id }
    });
  }

  async deleteCustomByProgramId(programId: string): Promise<void> {
    await this.prisma.penaltyEvent.deleteMany({
      where: {
        programId,
        canBeCustomized: true
      }
    });
  }

  async countByProgramId(programId: string): Promise<number> {
    return await this.prisma.penaltyEvent.count({
      where: { programId }
    });
  }

  async countActiveByProgramId(programId: string): Promise<number> {
    return await this.prisma.penaltyEvent.count({
      where: { programId, isActive: true }
    });
  }

  async countCustomByProgramId(programId: string): Promise<number> {
    return await this.prisma.penaltyEvent.count({
      where: { programId, canBeCustomized: true }
    });
  }

  async activateEvent(id: string): Promise<PenaltyEventEntity> {
    const updated = await this.prisma.penaltyEvent.update({
      where: { id },
      data: { isActive: true, activationDate: new Date() }
    });

    return this.toDomainEntity(updated);
  }

  async deactivateEvent(id: string): Promise<PenaltyEventEntity> {
    const updated = await this.prisma.penaltyEvent.update({
      where: { id },
      data: { isActive: false, deactivationDate: new Date() }
    });

    return this.toDomainEntity(updated);
  }

  async bulkActivateEvents(eventIds: string[]): Promise<PenaltyEventEntity[]> {
    const results: PenaltyEventEntity[] = [];
    
    for (const id of eventIds) {
      const activated = await this.activateEvent(id);
      results.push(activated);
    }
    
    return results;
  }

  async bulkDeactivateEvents(eventIds: string[]): Promise<PenaltyEventEntity[]> {
    const results: PenaltyEventEntity[] = [];
    
    for (const id of eventIds) {
      const deactivated = await this.deactivateEvent(id);
      results.push(deactivated);
    }
    
    return results;
  }

  async findDeletableEvents(): Promise<PenaltyEventEntity[]> {
    const events = await this.prisma.penaltyEvent.findMany({
      where: { canBeCustomized: true }
    });

    return events.map(event => this.toDomainEntity(event));
  }

  async cloneSystemDefaultsForProgram(programId: string): Promise<PenaltyEventEntity[]> {
    const systemDefaults = await this.prisma.penaltyEvent.findMany({
      where: { canBeCustomized: false }
    });

    const cloned: PenaltyEventEntity[] = [];

    for (const defaultEvent of systemDefaults) {
      const clonedEvent = await this.prisma.penaltyEvent.create({
        data: {
          programId,
          name: defaultEvent.name,
          description: defaultEvent.description,
          eventType: defaultEvent.eventType,
          isActive: defaultEvent.isActive,
          canBeCustomized: true, // Cloned events can be customized
          configuration: defaultEvent.configuration,
          activationDate: new Date()
        }
      });

      cloned.push(this.toDomainEntity(clonedEvent));
    }

    return cloned;
  }

  async getPenaltyEventStats(programId?: string): Promise<{
    totalEvents: number;
    activeEvents: number;
    inactiveEvents: number;
    systemDefaultEvents: number;
    customEvents: number;
    averagePenaltyPoints: number;
    eventsByType: Record<PenaltyEventType, number>;
    eventsByPenaltyRange: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  }> {
    const whereClause = programId ? { programId } : {};
    
    const [
      totalEvents,
      activeEvents,
      inactiveEvents,
      systemDefaultEvents,
      customEvents,
      allEvents
    ] = await Promise.all([
      this.prisma.penaltyEvent.count({ where: whereClause }),
      this.prisma.penaltyEvent.count({ where: { ...whereClause, isActive: true } }),
      this.prisma.penaltyEvent.count({ where: { ...whereClause, isActive: false } }),
      this.prisma.penaltyEvent.count({ where: { ...whereClause, canBeCustomized: false } }),
      this.prisma.penaltyEvent.count({ where: { ...whereClause, canBeCustomized: true } }),
      this.prisma.penaltyEvent.findMany({ where: whereClause })
    ]);

    // Calculate average penalty points
    const penaltyPoints = allEvents.map(event => this.extractPenaltyPointsFromConfig(event.configuration));
    const averagePenaltyPoints = penaltyPoints.length > 0 
      ? penaltyPoints.reduce((sum, points) => sum + points, 0) / penaltyPoints.length 
      : 0;

    // Count events by type
    const eventsByType: Record<string, number> = {};
    Object.values(PenaltyEventType).forEach(type => {
      eventsByType[type] = 0;
    });

    allEvents.forEach(event => {
      const eventType = this.mapStringToEventType(event.eventType);
      eventsByType[eventType] = (eventsByType[eventType] || 0) + 1;
    });

    // Count events by penalty range
    const eventsByPenaltyRange = {
      low: 0,      // 0-10 points
      medium: 0,   // 11-25 points
      high: 0,     // 26-50 points
      critical: 0  // 51+ points
    };

    penaltyPoints.forEach(points => {
      if (points <= 10) {
        eventsByPenaltyRange.low++;
      } else if (points <= 25) {
        eventsByPenaltyRange.medium++;
      } else if (points <= 50) {
        eventsByPenaltyRange.high++;
      } else {
        eventsByPenaltyRange.critical++;
      }
    });

    return {
      totalEvents,
      activeEvents,
      inactiveEvents,
      systemDefaultEvents,
      customEvents,
      averagePenaltyPoints,
      eventsByType: eventsByType as Record<PenaltyEventType, number>,
      eventsByPenaltyRange
    };
  }

  async findMostUsedEvents(limit = 10): Promise<Array<{
    event: PenaltyEventEntity;
    usageCount: number;
  }>> {
    // Note: This would require tracking penalty applications in another table
    // For now, return all events with a placeholder usage count
    const events = await this.prisma.penaltyEvent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    return events.map(event => ({
      event: this.toDomainEntity(event),
      usageCount: 0 // Placeholder - would need penalty application tracking
    }));
  }

  async findUnusedEvents(): Promise<PenaltyEventEntity[]> {
    // Note: This would require tracking penalty applications in another table
    // For now, return all events as potentially unused
    const events = await this.prisma.penaltyEvent.findMany();
    return events.map(event => this.toDomainEntity(event));
  }

  async validateEventConfiguration(eventData: {
    programId: string;
    eventType: PenaltyEventType;
    name: string;
    penaltyPoints: number;
  }): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate program exists
    const programExists = await this.prisma.program.findUnique({
      where: { id: eventData.programId }
    });

    if (!programExists) {
      errors.push('Program ID does not exist');
    }

    // Validate penalty points range
    if (eventData.penaltyPoints < 0) {
      errors.push('Penalty points cannot be negative');
    }

    if (eventData.penaltyPoints > 100) {
      warnings.push('Penalty points are very high (>100)');
    }

    // Validate name uniqueness for the program
    const existingEvent = await this.prisma.penaltyEvent.findFirst({
      where: {
        programId: eventData.programId,
        name: eventData.name,
        eventType: this.mapEventTypeToString(eventData.eventType)
      }
    });

    if (existingEvent) {
      errors.push('An event with this name and type already exists for this program');
    }

    // Validate name length
    if (eventData.name.length < 3) {
      errors.push('Event name must be at least 3 characters long');
    }

    if (eventData.name.length > 100) {
      errors.push('Event name cannot exceed 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
