import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommonModule } from '@libs/common/common.module';
import { LoggingModule } from '@libs/logging/logging.module';
import { EventBusModule } from '@libs/event-bus/event-bus.module';
import { MonitoringModule } from '@libs/monitoring/monitoring.module';
import { HealthModule } from '../../health/health.module';

// Controllers
import { StockpileController } from './infrastructure/controllers/stockpile.controller';
import { ApprovalFlowController } from './infrastructure/controllers/approval-flow.controller';
import { DocumentTemplateController } from './infrastructure/controllers/document-template.controller';
import { NotificationTemplateController } from './infrastructure/controllers/notification-template.controller';

// Services
import { StockpileService } from './application/services/stockpile.service';
import { ApprovalFlowService } from './application/services/approval-flow.service';
import { DocumentTemplateService } from './application/services/document-template.service';
import { NotificationTemplateService } from './application/services/notification-template.service';

// Repository Interfaces
import { ApprovalFlowRepository } from './domain/repositories/approval-flow.repository';
import { DocumentTemplateRepository } from './domain/repositories/document-template.repository';
import { NotificationTemplateRepository } from './domain/repositories/notification-template.repository';

// Repository Implementations
import { PrismaApprovalFlowRepository } from './infrastructure/repositories/approval-flow.repository';
import { PrismaDocumentTemplateRepository } from './infrastructure/repositories/document-template.repository';
import { PrismaNotificationTemplateRepository } from './infrastructure/repositories/notification-template.repository';

// Command Handlers - Approval Flow
import {
  CreateApprovalFlowHandler,
  UpdateApprovalFlowHandler,
  CreateApprovalLevelHandler,
  SubmitReservationForApprovalHandler,
  ProcessApprovalRequestHandler,
  CancelReservationHandler,
  ProcessTimeoutHandler,
  SendApprovalReminderHandler
} from './application/commands/handlers/approval-flow.handlers';

// Command Handlers - Document Template
import {
  CreateDocumentTemplateHandler,
  UpdateDocumentTemplateHandler,
  GenerateDocumentHandler,
  UploadDocumentTemplateHandler,
  DeleteDocumentTemplateHandler
} from './application/commands/handlers/document-template.handlers';

// Command Handlers - Notification Template
import {
  CreateNotificationChannelHandler,
  CreateNotificationTemplateHandler,
  UpdateNotificationTemplateHandler,
  CreateNotificationConfigHandler,
  SendNotificationHandler,
  SendBatchNotificationsHandler,
  MarkNotificationAsReadHandler
} from './application/commands/handlers/notification-template.handlers';

// Command Handlers - Stockpile (Core Business Logic)
import {
  ApproveRequestHandler,
  RejectRequestHandler,
  CheckInHandler,
  CheckOutHandler
} from './application/commands/handlers/stockpile.handlers';

// Query Handlers - Approval Flow
import {
  GetApprovalFlowsHandler,
  GetApprovalFlowByIdHandler,
  GetDefaultApprovalFlowHandler,
  GetApprovalLevelsByFlowIdHandler,
  GetApprovalRequestsByReservationHandler,
  GetPendingApprovalRequestsHandler,
  GetReservationStatusHandler,
  GetExpiredApprovalRequestsHandler,
  GetApprovalHistoryHandler,
  GetUserApprovalStatisticsHandler
} from './application/queries/handlers/approval-flow.handlers';

// Query Handlers - Document Template
import {
  GetDocumentTemplatesHandler,
  GetDocumentTemplateByIdHandler,
  GetDefaultDocumentTemplateHandler,
  GetGeneratedDocumentsByReservationHandler,
  GetGeneratedDocumentByIdHandler,
  GetDocumentTemplateVariablesHandler,
  GetAvailableDocumentVariablesHandler
} from './application/queries/handlers/document-template.handlers';

// Query Handlers - Notification Template
import {
  GetNotificationChannelsHandler,
  GetNotificationChannelByIdHandler,
  GetNotificationTemplatesHandler,
  GetNotificationTemplateByIdHandler,
  GetDefaultNotificationTemplateHandler,
  GetNotificationConfigsHandler,
  GetNotificationConfigByIdHandler,
  GetSentNotificationsByReservationHandler,
  GetSentNotificationsByRecipientHandler,
  GetPendingNotificationsHandler,
  GetNotificationsForBatchHandler,
  GetNotificationTemplateVariablesHandler,
  GetAvailableNotificationVariablesHandler
} from './application/queries/handlers/notification-template.handlers';

// Event Handlers
import {
  ReservationSubmittedHandler,
  ApprovalRequestCreatedHandler,
  ReservationApprovedHandler,
  ReservationRejectedHandler,
  ReservationCancelledHandler,
  ApprovalRequestTimeoutHandler,
  ApprovalReminderHandler
} from './application/events/handlers/approval-flow.handlers';

const CommandHandlers = [
  // Approval Flow
  CreateApprovalFlowHandler,
  UpdateApprovalFlowHandler,
  CreateApprovalLevelHandler,
  SubmitReservationForApprovalHandler,
  ProcessApprovalRequestHandler,
  CancelReservationHandler,
  ProcessTimeoutHandler,
  SendApprovalReminderHandler,
  // Document Template
  CreateDocumentTemplateHandler,
  UpdateDocumentTemplateHandler,
  GenerateDocumentHandler,
  UploadDocumentTemplateHandler,
  DeleteDocumentTemplateHandler,
  // Notification Template
  CreateNotificationChannelHandler,
  CreateNotificationTemplateHandler,
  UpdateNotificationTemplateHandler,
  CreateNotificationConfigHandler,
  SendNotificationHandler,
  SendBatchNotificationsHandler,
  MarkNotificationAsReadHandler,
  // Stockpile (Core Business Logic)
  ApproveRequestHandler,
  RejectRequestHandler,
  CheckInHandler,
  CheckOutHandler
];

const QueryHandlers = [
  // Approval Flow
  GetApprovalFlowsHandler,
  GetApprovalFlowByIdHandler,
  GetDefaultApprovalFlowHandler,
  GetApprovalLevelsByFlowIdHandler,
  GetApprovalRequestsByReservationHandler,
  GetPendingApprovalRequestsHandler,
  GetReservationStatusHandler,
  GetExpiredApprovalRequestsHandler,
  GetApprovalHistoryHandler,
  GetUserApprovalStatisticsHandler,
  // Document Template
  GetDocumentTemplatesHandler,
  GetDocumentTemplateByIdHandler,
  GetDefaultDocumentTemplateHandler,
  GetGeneratedDocumentsByReservationHandler,
  GetGeneratedDocumentByIdHandler,
  GetDocumentTemplateVariablesHandler,
  GetAvailableDocumentVariablesHandler,
  // Notification Template
  GetNotificationChannelsHandler,
  GetNotificationChannelByIdHandler,
  GetNotificationTemplatesHandler,
  GetNotificationTemplateByIdHandler,
  GetDefaultNotificationTemplateHandler,
  GetNotificationConfigsHandler,
  GetNotificationConfigByIdHandler,
  GetSentNotificationsByReservationHandler,
  GetSentNotificationsByRecipientHandler,
  GetPendingNotificationsHandler,
  GetNotificationsForBatchHandler,
  GetNotificationTemplateVariablesHandler,
  GetAvailableNotificationVariablesHandler
];

const EventHandlers = [
  ReservationSubmittedHandler,
  ApprovalRequestCreatedHandler,
  ReservationApprovedHandler,
  ReservationRejectedHandler,
  ReservationCancelledHandler,
  ApprovalRequestTimeoutHandler,
  ApprovalReminderHandler
];

@Module({
  imports: [
    CqrsModule,
    CommonModule,
    EventBusModule,
    LoggingModule,
    MonitoringModule,
    HealthModule
  ],
  controllers: [
    StockpileController,
    ApprovalFlowController,
    DocumentTemplateController,
    NotificationTemplateController
  ],
  providers: [
    // Services
    StockpileService,
    ApprovalFlowService,
    DocumentTemplateService,
    NotificationTemplateService,
    
    // Repository Providers
    {
      provide: 'ApprovalFlowRepository',
      useClass: PrismaApprovalFlowRepository
    },
    {
      provide: 'DocumentTemplateRepository',
      useClass: PrismaDocumentTemplateRepository
    },
    {
      provide: 'NotificationTemplateRepository',
      useClass: PrismaNotificationTemplateRepository
    },
    
    // CQRS Handlers
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers
  ],
  exports: [
    StockpileService,
    ApprovalFlowService,
    DocumentTemplateService,
    NotificationTemplateService
  ],
})
export class StockpileModule {}
