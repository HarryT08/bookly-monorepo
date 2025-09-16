import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

// Controllers
import { AvailabilityController } from "./infrastructure/controllers/availability.controller";
import { AdvancedSearchController } from "./infrastructure/controllers/advanced-search.controller";
import { PenaltiesController } from "./infrastructure/controllers/penalties.controller";
import { ReassignmentController } from "./infrastructure/controllers/reassignment.controller";
import { RecurringReservationsController } from "./infrastructure/controllers/recurring-reservations.controller";
import { WaitingListController } from "./infrastructure/controllers/waiting-list.controller";
import { NotificationsController } from "./infrastructure/controllers/notifications.controller";

// Services
import { AvailabilityService } from "./application/services/availability.service";
import { CalendarIntegrationService } from "./application/services/calendar-integration.service";
import { AdvancedSearchService } from "./application/services/advanced-search.service";
import { ScheduleService } from "./application/services/schedule.service";
import { ReassignmentService } from "./application/services/reassignment.service";
import { WaitingListService } from "./application/services/waiting-list.service";
import { RecurringReservationService } from "./application/services/recurring-reservation.service";
import { PenaltyService } from "./application/services/penalty.service";

// Domain Services
import { AdvancedSearchDomainService } from "./domain/services/advanced-search-domain.service";
import { RecurringReservationDomainServiceImpl } from "./domain/services/recurring-reservation-domain.service";
import { ReservationLimitsDomainServiceImpl } from "./domain/services/reservation-limits-domain.service";
import { WaitingListDomainServiceImpl } from "./domain/services/waiting-list-domain.service";
import { PenaltyDomainServiceImpl } from "./domain/services/penalty-domain.service";
import { ReassignmentDomainServiceImpl } from "./domain/services/reassignment-domain.service";

// Command Handlers
import { CreateCalendarIntegrationHandler } from "./application/commands/create-calendar-integration.handler";
import { SyncCalendarHandler } from "./application/commands/sync-calendar.handler";
import { CreateAvailabilityHandler } from "./application/handlers/create-availability.handler";
import { CreateReservationHandler } from "./application/handlers/create-reservation.handler";
import { CreateScheduleHandler } from "./application/handlers/create-schedule.handler";

// Reassignment Command Handlers
import {
  CreateReassignmentRequestHandler,
  RespondToReassignmentRequestHandler,
  FindEquivalentResourcesHandler,
  ProcessReassignmentRequestHandler,
  CancelReassignmentRequestHandler,
  AutoProcessReassignmentRequestsHandler,
  ApplyReassignmentHandler,
  OptimizeReassignmentQueueHandler,
} from "./application/handlers/reassignment.command-handlers";

// Recurring Reservation Command Handlers
import {
  CreateRecurringReservationHandler,
  UpdateRecurringReservationHandler,
  CancelRecurringReservationHandler,
  GenerateRecurringReservationInstancesHandler,
  ConfirmRecurringReservationInstanceHandler,
  ValidateRecurringReservationHandler,
  BulkCancelRecurringReservationsHandler,
} from "./application/handlers/recurring-reservation.command-handlers";

// Waiting List Command Handlers
import {
  JoinWaitingListHandler,
  LeaveWaitingListHandler,
  ConfirmWaitingListSlotHandler,
  ProcessWaitingListSlotsHandler,
  EscalatePriorityHandler,
  ProcessExpiredEntriesHandler,
  BulkNotifyWaitingListHandler,
  OptimizeWaitingListHandler,
} from "./application/handlers/waiting-list.command-handlers";

// Query Handlers
import { GetCalendarIntegrationsHandler } from "./application/queries/get-calendar-integrations.handler";
import { GetAvailabilityWithConflictsHandler } from "./application/queries/get-availability-with-conflicts.handler";
import { GetCalendarViewHandler } from "./application/queries/get-calendar-view.handler";
import {
  GetReservationHistoryHandler,
  ExportReservationHistoryHandler,
} from "./application/handlers/get-reservation-history.handler";
import {
  GetAvailabilityHandler,
  GetResourceAvailabilityHandler,
} from "./application/handlers/get-availability.handler";

// Reassignment Query Handlers
import {
  GetReassignmentRequestHandler,
  GetReassignmentRequestsHandler,
  GetUserReassignmentRequestsHandler,
  GetEquivalentResourcesHandler,
  GetReassignmentRequestStatsHandler,
  GetReassignmentAnalyticsHandler,
  ValidateReassignmentRequestHandler,
  GetReassignmentSuggestionsHandler,
  GetPendingReassignmentRequestsHandler,
  GetReassignmentSuccessPredictionHandler,
  SearchReassignmentRequestsHandler,
  GetReassignmentRequestHistoryHandler,
  GetResourceReassignmentRequestsHandler,
  GetProgramReassignmentRequestsHandler,
  GetUserReassignmentHistoryHandler,
  GetReassignmentTrendsHandler,
} from "./application/handlers/reassignment.query-handlers";

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
  GetUpcomingRecurringInstancesHandler,
} from "./application/handlers/recurring-reservation.query-handlers";

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
  SearchWaitingListsHandler,
} from "./application/handlers/waiting-list.query-handlers";

// Advanced Search Query Handlers - RF-09
import {
  AdvancedResourceSearchHandler,
  RealTimeAvailabilitySearchHandler,
  SearchHistoryHandler,
  PopularResourcesHandler,
  QuickSearchHandler,
} from "./application/handlers/advanced-search.query-handlers";

// Repository implementations (Prisma-based)
import { PrismaAvailabilityRepository } from "./infrastructure/repositories/prisma-availability.repository";
import { PrismaScheduleRepository } from "./infrastructure/repositories/prisma-schedule.repository";
import { PrismaReservationRepository } from "./infrastructure/repositories/prisma-reservation.repository";
import { PrismaCalendarEventRepository } from "./infrastructure/repositories/prisma-calendar-event.repository";
import { PrismaCalendarIntegrationRepository } from "./infrastructure/repositories/prisma-calendar-integration.repository";
import { PrismaReservationHistoryRepository } from "./infrastructure/repositories/prisma-reservation-history.repository";

// Simple stub repository implementations (temporary)
import { SimpleRecurringReservationRepository } from "./infrastructure/repositories/simple-recurring-reservation.repository";
import { SimpleRecurringReservationInstanceRepository } from "./infrastructure/repositories/simple-recurring-reservation-instance.repository";
import { SimpleReservationLimitRepository } from "./infrastructure/repositories/simple-reservation-limit.repository";
import { SimpleWaitingListEntryRepository } from "./infrastructure/repositories/simple-waiting-list-entry.repository";
import { SimplePenaltyRepository } from "./infrastructure/repositories/simple-penalty.repository";
import { SimplePenaltyEventRepository } from "./infrastructure/repositories/simple-penalty-event.repository";
import { SimpleUserPenaltyRepository } from "./infrastructure/repositories/simple-user-penalty.repository";
import { SimpleReassignmentRequestRepository } from "./infrastructure/repositories/simple-reassignment-request.repository";
import { SimpleResourceEquivalenceRepository } from "./infrastructure/repositories/simple-resource-equivalence.repository";
import { SimpleReassignmentConfigurationRepository } from "./infrastructure/repositories/simple-reassignment-configuration.repository";

// Infrastructure Services
import { GoogleCalendarService } from "./infrastructure/services/google-calendar.service";
import { OutlookCalendarService } from "./infrastructure/services/outlook-calendar.service";
import { ICalService } from "./infrastructure/services/ical.service";
import { InternalCalendarService } from "./infrastructure/services/internal-calendar.service";

// Advanced booking modules
import { NotificationModule as LocalNotificationModule } from "./infrastructure/modules/notification.module";
import { AuditModule } from "./infrastructure/modules/audit.module";

// Shared modules
import { CommonModule } from "../../libs/common/common.module";
import { EventBusModule } from "../../libs/event-bus/event-bus.module";
import { LoggingModule } from "../../libs/logging/logging.module";
import { NotificationModule } from "../../libs/notification/notification.module";
import { ResourcesModule } from "../resources-service/resources.module";
import { HealthModule } from "../../health/health.module";

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
  ValidateReassignmentRequestHandler,
  GetReassignmentSuggestionsHandler,
  GetPendingReassignmentRequestsHandler,
  GetReassignmentSuccessPredictionHandler,
  SearchReassignmentRequestsHandler,
  GetReassignmentRequestHistoryHandler,
  GetResourceReassignmentRequestsHandler,
  GetProgramReassignmentRequestsHandler,
  GetUserReassignmentHistoryHandler,
  GetReassignmentTrendsHandler,
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
    provide: "AvailabilityRepository",
    useClass: PrismaAvailabilityRepository,
  },
  {
    provide: "ScheduleRepository",
    useClass: PrismaScheduleRepository,
  },
  {
    provide: "ReservationRepository",
    useClass: PrismaReservationRepository,
  },
  {
    provide: "ReservationHistoryRepository",
    useClass: PrismaReservationHistoryRepository,
  },
  {
    provide: "CalendarIntegrationRepository",
    useClass: PrismaCalendarIntegrationRepository,
  },
  {
    provide: "CalendarEventRepository",
    useClass: PrismaCalendarEventRepository,
  },
  // New repositories - using simple stubs for now
  {
    provide: "RecurringReservationRepository",
    useClass: SimpleRecurringReservationRepository,
  },
  {
    provide: "RecurringReservationInstanceRepository",
    useClass: SimpleRecurringReservationInstanceRepository,
  },
  {
    provide: "ReservationLimitRepository",
    useClass: SimpleReservationLimitRepository,
  },
  {
    provide: "WaitingListEntryRepository",
    useClass: SimpleWaitingListEntryRepository,
  },
  {
    provide: "PenaltyRepository",
    useClass: SimplePenaltyRepository,
  },
  {
    provide: "PenaltyEventRepository",
    useClass: SimplePenaltyEventRepository,
  },
  {
    provide: "UserPenaltyRepository",
    useClass: SimpleUserPenaltyRepository,
  },
  {
    provide: "ReassignmentRequestRepository",
    useClass: SimpleReassignmentRequestRepository,
  },
  {
    provide: "ResourceEquivalenceRepository",
    useClass: SimpleResourceEquivalenceRepository,
  },
  {
    provide: "ReassignmentConfigurationRepository",
    useClass: SimpleReassignmentConfigurationRepository,
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
    HealthModule,
  ],
  controllers: [
    AvailabilityController,
    AdvancedSearchController,
    PenaltiesController,
    ReassignmentController,
    RecurringReservationsController,
    WaitingListController,
    NotificationsController,
  ],
  providers: [
    AvailabilityService,
    CalendarIntegrationService,
    AdvancedSearchService,
    ScheduleService,
    AdvancedSearchDomainService,
    ReassignmentService,
    WaitingListService,
    RecurringReservationService,
    PenaltyService,
    {
      provide: "RecurringReservationDomainService",
      useClass: RecurringReservationDomainServiceImpl,
    },
    {
      provide: "ReservationLimitsDomainService",
      useClass: ReservationLimitsDomainServiceImpl,
    },
    {
      provide: "WaitingListDomainService",
      useClass: WaitingListDomainServiceImpl,
    },
    PenaltyDomainServiceImpl,
    ReassignmentDomainServiceImpl,
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
