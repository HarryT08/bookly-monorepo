import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Controllers
import { AvailabilityController } from './infrastructure/controllers/availability.controller';
import { AdvancedSearchController } from './infrastructure/controllers/advanced-search.controller';

// Services
import { AvailabilityService } from './application/services/availability.service';
import { CalendarIntegrationService } from './application/services/calendar-integration.service';
import { AdvancedSearchService } from './application/services/advanced-search.service';

// Domain Services
import { AdvancedSearchDomainService } from './domain/services/advanced-search-domain.service';

// Command Handlers
import { CreateCalendarIntegrationHandler } from './application/commands/create-calendar-integration.handler';
import { SyncCalendarHandler } from './application/commands/sync-calendar.handler';
import { CreateAvailabilityHandler } from './application/handlers/create-availability.handler';
import { CreateReservationHandler } from './application/handlers/create-reservation.handler';
import { CreateScheduleHandler } from './application/handlers/create-schedule.handler';

// Reassignment Command Handlers
import {
  CreateReassignmentRequestHandler,
  RespondToReassignmentRequestHandler,
  FindEquivalentResourcesHandler,
  ProcessReassignmentRequestHandler,
  CancelReassignmentRequestHandler,
  AutoProcessReassignmentRequestsHandler,
  ApplyReassignmentHandler,
  OptimizeReassignmentQueueHandler
} from './application/handlers/reassignment.command-handlers';

// Recurring Reservation Command Handlers
import {
  CreateRecurringReservationHandler,
  UpdateRecurringReservationHandler,
  CancelRecurringReservationHandler,
  GenerateRecurringReservationInstancesHandler,
  ConfirmRecurringReservationInstanceHandler,
  ValidateRecurringReservationHandler,
  BulkCancelRecurringReservationsHandler
} from './application/handlers/recurring-reservation.command-handlers';

// Waiting List Command Handlers
import {
  JoinWaitingListHandler,
  LeaveWaitingListHandler,
  ConfirmWaitingListSlotHandler,
  ProcessWaitingListSlotsHandler,
  EscalatePriorityHandler,
  ProcessExpiredEntriesHandler,
  BulkNotifyWaitingListHandler,
  OptimizeWaitingListHandler
} from './application/handlers/waiting-list.command-handlers';

// Query Handlers
import { GetCalendarIntegrationsHandler } from './application/queries/get-calendar-integrations.handler';
import { GetAvailabilityWithConflictsHandler } from './application/queries/get-availability-with-conflicts.handler';
import { GetCalendarViewHandler } from './application/queries/get-calendar-view.handler';
import { GetReservationHistoryHandler, ExportReservationHistoryHandler } from './application/handlers/get-reservation-history.handler';
import { GetAvailabilityHandler, GetResourceAvailabilityHandler } from './application/handlers/get-availability.handler';

// Reassignment Query Handlers
import {
  GetReassignmentRequestHandler,
  GetReassignmentRequestsHandler,
  GetUserReassignmentRequestsHandler,
  GetEquivalentResourcesHandler,
  GetReassignmentRequestStatsHandler,
  GetReassignmentAnalyticsHandler,
  ValidateReassignmentRequestQueryHandler,
  GetReassignmentSuggestionsHandler,
  GetPendingReassignmentRequestsHandler,
  GetReassignmentSuccessPredictionHandler,
  SearchReassignmentRequestsHandler
} from './application/handlers/reassignment.query-handlers';

// Recurring Reservation Query Handlers  
import {
  GetRecurringReservationHandler,
  GetRecurringReservationsHandler,
  GetRecurringReservationInstancesHandler,
  GetRecurringReservationStatsHandler,
  ValidateRecurringReservationQueryHandler,
  GetRecurringReservationConflictsHandler,
  GetUserRecurringReservationsHandler,
  GetRecurringReservationAnalyticsHandler,
  GetUpcomingRecurringInstancesHandler
} from './application/handlers/recurring-reservation.query-handlers';

// Waiting List Query Handlers
import {
  GetWaitingListHandler,
  GetWaitingListsHandler,
  GetWaitingListEntryHandler,
  GetUserWaitingListEntriesHandler,
  GetWaitingListStatsHandler,
  GetWaitingListAnalyticsHandler,
  ValidateWaitingListEntryQueryHandler,
  GetWaitingListAlternativesHandler,
  GetExpiredWaitingListEntriesHandler,
  SearchWaitingListsHandler
} from './application/handlers/waiting-list.query-handlers';

// Advanced Search Query Handlers - RF-09
import {
  AdvancedResourceSearchHandler,
  RealTimeAvailabilitySearchHandler,
  SearchHistoryHandler,
  PopularResourcesHandler,
  QuickSearchHandler
} from './application/handlers/advanced-search.query-handlers';

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
import { NotificationModule as LocalNotificationModule } from './infrastructure/modules/notification.module';
import { AuditModule } from './infrastructure/modules/audit.module';

// Shared modules
import { CommonModule } from '../../libs/common/common.module';
import { EventBusModule } from '../../libs/event-bus/event-bus.module';
import { LoggingModule } from '../../libs/logging/logging.module';
import { NotificationModule } from '../../libs/notification/notification.module';
import { ResourcesModule } from '../resources-service/resources.module';

const commandHandlers = [
  CreateCalendarIntegrationHandler,
  SyncCalendarHandler,
  CreateAvailabilityHandler,
  CreateReservationHandler,
  CreateScheduleHandler,
  // Reassignment Command Handlers
  CreateReassignmentRequestHandler,
  RespondToReassignmentRequestHandler,
  FindEquivalentResourcesHandler,
  ProcessReassignmentRequestHandler,
  CancelReassignmentRequestHandler,
  AutoProcessReassignmentRequestsHandler,
  ApplyReassignmentHandler,
  OptimizeReassignmentQueueHandler,
  // Recurring Reservation Command Handlers
  CreateRecurringReservationHandler,
  UpdateRecurringReservationHandler,
  CancelRecurringReservationHandler,
  GenerateRecurringReservationInstancesHandler,
  ConfirmRecurringReservationInstanceHandler,
  ValidateRecurringReservationHandler,
  BulkCancelRecurringReservationsHandler,
  // Waiting List Command Handlers
  JoinWaitingListHandler,
  LeaveWaitingListHandler,
  ConfirmWaitingListSlotHandler,
  ProcessWaitingListSlotsHandler,
  EscalatePriorityHandler,
  ProcessExpiredEntriesHandler,
  BulkNotifyWaitingListHandler,
  OptimizeWaitingListHandler,
];

const queryHandlers = [
  GetCalendarIntegrationsHandler,
  GetAvailabilityWithConflictsHandler,
  GetCalendarViewHandler,
  GetReservationHistoryHandler,
  ExportReservationHistoryHandler,
  // Availability Query Handlers
  GetAvailabilityHandler,
  GetResourceAvailabilityHandler,
  // Advanced Search Query Handlers - RF-09
  AdvancedResourceSearchHandler,
  RealTimeAvailabilitySearchHandler,
  SearchHistoryHandler,
  PopularResourcesHandler,
  QuickSearchHandler,
  // Reassignment Query Handlers
  GetReassignmentRequestHandler,
  GetReassignmentRequestsHandler,
  GetUserReassignmentRequestsHandler,
  GetEquivalentResourcesHandler,
  GetReassignmentRequestStatsHandler,
  GetReassignmentAnalyticsHandler,
  ValidateReassignmentRequestQueryHandler,
  GetReassignmentSuggestionsHandler,
  GetPendingReassignmentRequestsHandler,
  GetReassignmentSuccessPredictionHandler,
  SearchReassignmentRequestsHandler,
  // Recurring Reservation Query Handlers
  GetRecurringReservationHandler,
  GetRecurringReservationsHandler,
  GetRecurringReservationInstancesHandler,
  GetRecurringReservationStatsHandler,
  ValidateRecurringReservationQueryHandler,
  GetRecurringReservationConflictsHandler,
  GetUserRecurringReservationsHandler,
  GetRecurringReservationAnalyticsHandler,
  GetUpcomingRecurringInstancesHandler,
  // Waiting List Query Handlers
  GetWaitingListHandler,
  GetWaitingListsHandler,
  GetWaitingListEntryHandler,
  GetUserWaitingListEntriesHandler,
  GetWaitingListStatsHandler,
  GetWaitingListAnalyticsHandler,
  ValidateWaitingListEntryQueryHandler,
  GetWaitingListAlternativesHandler,
  GetExpiredWaitingListEntriesHandler,
  SearchWaitingListsHandler,
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
    ResourcesModule,
    NotificationModule,
    LocalNotificationModule,
    AuditModule,
  ],
  controllers: [
    AvailabilityController,
    AdvancedSearchController,
  ],
  providers: [
    AvailabilityService,
    CalendarIntegrationService,
    AdvancedSearchService,
    AdvancedSearchDomainService,
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
