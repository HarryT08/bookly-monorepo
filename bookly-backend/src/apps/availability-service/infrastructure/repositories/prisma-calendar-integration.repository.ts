import { Injectable, Logger } from '@nestjs/common';
import { CalendarIntegrationRepository } from '../../domain/repositories/calendar-integration.repository';
import { CalendarIntegrationEntity } from '../../domain/entities/calendar-integration.entity';
import { PrismaService } from '../../../../libs/common/services/prisma.service';
import { CalendarProvider } from '../../../../libs/dto/availability/calendar-integration.dto';

/**
 * Prisma implementation of CalendarIntegrationRepository (RF-08)
 * Handles persistence of calendar integrations using Prisma ORM
 */
@Injectable()
export class PrismaCalendarIntegrationRepository implements CalendarIntegrationRepository {
  private readonly logger = new Logger(PrismaCalendarIntegrationRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(integrationData: {
    name: string;
    provider: string;
    resourceId: string;
    credentials: any;
    settings: any;
    isActive: boolean;
  }): Promise<CalendarIntegrationEntity> {
    this.logger.log('Creating calendar integration', { resourceId: integrationData.resourceId, provider: integrationData.provider });

    const integration = await this.prisma.calendarIntegration.create({
      data: {
        resourceId: integrationData.resourceId,
        provider: integrationData.provider,
        name: integrationData.name,
        credentials: integrationData.credentials,
        calendarId: null,
        syncInterval: 30,
        lastSync: null,
        isActive: integrationData.isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return this.mapToEntity(integration);
  }

  async findById(id: string): Promise<CalendarIntegrationEntity | null> {
    const integration = await this.prisma.calendarIntegration.findUnique({
      where: { id }
    });

    return integration ? this.mapToEntity(integration) : null;
  }

  async findByResourceId(resourceId: string): Promise<CalendarIntegrationEntity[]> {
    const integrations = await this.prisma.calendarIntegration.findMany({
      where: { 
        resourceId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return integrations.map(integration => this.mapToEntity(integration));
  }

  async findByProvider(provider: CalendarProvider): Promise<CalendarIntegrationEntity[]> {
    const integrations = await this.prisma.calendarIntegration.findMany({
      where: { provider: provider.toString() }
    });

    return integrations.map(integration => this.mapToEntity(integration));
  }

  async findByResourceAndProvider(resourceId: string, provider: string): Promise<CalendarIntegrationEntity | null> {
    const integration = await this.prisma.calendarIntegration.findFirst({
      where: {
        resourceId,
        provider
      }
    });

    return integration ? this.mapToEntity(integration) : null;
  }

  async findActive(): Promise<CalendarIntegrationEntity[]> {
    const integrations = await this.prisma.calendarIntegration.findMany({
      where: { isActive: true }
    });

    return integrations.map(integration => this.mapToEntity(integration));
  }

  async findActiveIntegrations(): Promise<CalendarIntegrationEntity[]> {
    const integrations = await this.prisma.calendarIntegration.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return integrations.map(integration => this.mapToEntity(integration));
  }

  async update(id: string, data: Partial<CalendarIntegrationEntity>): Promise<CalendarIntegrationEntity> {
    this.logger.log('Updating calendar integration', { id });

    const integration = await this.prisma.calendarIntegration.update({
      where: { id },
      data: {
        name: data.name,
        calendarId: data.calendarId,
        credentials: data.credentials,
        isActive: data.isActive,
        syncInterval: (data as any).syncInterval,
        lastSync: (data as any).lastSync,
        updatedAt: new Date()
      }
    });

    return this.mapToEntity(integration);
  }

  async delete(id: string): Promise<void> {
    this.logger.log('Deleting calendar integration', { id });

    await this.prisma.calendarIntegration.delete({
      where: { id }
    });
  }

  async deactivate(id: string): Promise<CalendarIntegrationEntity> {
    this.logger.log('Deactivating calendar integration', { id });

    const integration = await this.prisma.calendarIntegration.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return this.mapToEntity(integration);
  }

  async updateLastSync(id: string, lastSync: Date): Promise<void> {
    this.logger.log('Updating last sync for calendar integration', { id, lastSync });

    await this.prisma.calendarIntegration.update({
      where: { id },
      data: {
        lastSync,
        updatedAt: new Date()
      }
    });
  }

  async findPendingSync(maxAge: number): Promise<CalendarIntegrationEntity[]> {
    const cutoffTime = new Date(Date.now() - maxAge * 60 * 1000); // maxAge in minutes
    
    const integrations = await this.prisma.calendarIntegration.findMany({
      where: {
        isActive: true,
        OR: [
          { lastSync: null },
          { lastSync: { lt: cutoffTime } }
        ]
      },
      orderBy: { lastSync: 'asc' }
    });

    return integrations.map(integration => this.mapToEntity(integration));
  }

  private mapToEntity(data: any): CalendarIntegrationEntity {
    return new CalendarIntegrationEntity(
      data.id,
      data.resourceId,
      data.provider as CalendarProvider,
      data.name,
      data.credentials,
      data.calendarId,
      data.syncInterval,
      data.lastSync,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }
}
