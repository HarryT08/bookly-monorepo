import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Controllers
import { AvailabilityController } from './infrastructure/controllers/availability.controller';

// Services
import { AvailabilityService } from './application/services/availability.service';
import { CalendarIntegrationService } from './application/services/calendar-integration.service';

// Command Handlers
import { CreateCalendarIntegrationHandler } from './application/commands/create-calendar-integration.handler';
import { SyncCalendarHandler } from './application/commands/sync-calendar.handler';

// Query Handlers
import { GetCalendarIntegrationsHandler } from './application/queries/get-calendar-integrations.handler';
import { GetAvailabilityWithConflictsHandler } from './application/queries/get-availability-with-conflicts.handler';
import { GetCalendarViewHandler } from './application/queries/get-calendar-view.handler';
import { GetReservationHistoryHandler } from './application/handlers/get-reservation-history.handler';

// Repository Implementations
import { PrismaScheduleRepository } from './infrastructure/repositories/prisma-schedule.repository';
import { PrismaReservationRepository } from './infrastructure/repositories/prisma-reservation.repository';
import { PrismaReservationHistoryRepository } from './infrastructure/repositories/prisma-reservation-history.repository';
import { PrismaCalendarIntegrationRepository } from './infrastructure/repositories/prisma-calendar-integration.repository';
import { PrismaCalendarEventRepository } from './infrastructure/repositories/prisma-calendar-event.repository';

// Infrastructure Services
import { GoogleCalendarService } from './infrastructure/services/google-calendar.service';
import { OutlookCalendarService } from './infrastructure/services/outlook-calendar.service';
import { ICalService } from './infrastructure/services/ical.service';
import { InternalCalendarService } from './infrastructure/services/internal-calendar.service';

// Advanced booking modules
import { NotificationModule } from './infrastructure/modules/notification.module';
import { AuditModule } from './infrastructure/modules/audit.module';

// Shared modules
import { CommonModule } from '../../libs/common/common.module';
import { EventBusModule } from '../../libs/event-bus/event-bus.module';
import { LoggingModule } from '../../libs/logging/logging.module';

const commandHandlers = [
  CreateCalendarIntegrationHandler,
  SyncCalendarHandler,
];

const queryHandlers = [
  GetCalendarIntegrationsHandler,
  GetAvailabilityWithConflictsHandler,
  GetCalendarViewHandler,
  GetReservationHistoryHandler,
];

const repositories = [
  {
    provide: 'ScheduleRepository',
    useClass: PrismaScheduleRepository,
  },
  {
    provide: 'ReservationRepository',
    useClass: PrismaReservationRepository,
  },
  {
    provide: 'ReservationHistoryRepository',
    useClass: PrismaReservationHistoryRepository,
  },
  {
    provide: 'CalendarIntegrationRepository',
    useClass: PrismaCalendarIntegrationRepository,
  },
  {
    provide: 'CalendarEventRepository',
    useClass: PrismaCalendarEventRepository,
  },
];

const infrastructureServices = [
  GoogleCalendarService,
  OutlookCalendarService,
  ICalService,
  InternalCalendarService,
];

@Module({
  imports: [
    CqrsModule,
    CommonModule,
    EventBusModule,
    LoggingModule,
    NotificationModule,
    AuditModule,
  ],
  controllers: [AvailabilityController],
  providers: [
    AvailabilityService,
    CalendarIntegrationService,
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
    ...infrastructureServices,
  ],
  exports: [
    AvailabilityService,
    CalendarIntegrationService,
    NotificationModule,
    AuditModule,
  ],
})
export class AvailabilityModule {}
