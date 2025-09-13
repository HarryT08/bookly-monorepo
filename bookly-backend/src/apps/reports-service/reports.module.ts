import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ReportsService } from "./application/services/reports.service";
import { ReportsController } from "./infrastructure/controllers/reports.controller";
import { UsageReportsController } from "./infrastructure/controllers/usage-reports.controller";
import { UserReportsController } from "./infrastructure/controllers/user-reports.controller";
import { ExportReportsController } from "./infrastructure/controllers/export-reports.controller";
import { LoggingModule } from "@/libs/logging/logging.module";
import { CommonModule } from "@/libs/common/common.module";
import { EventBusModule } from "@/libs/event-bus/event-bus.module";

// Command Handlers
import { CreateFeedbackHandler } from "./application/handlers/create-feedback.handler";
import { GenerateUsageReportHandler } from "./application/handlers/generate-usage-report.handler";
import { GenerateUserReportHandler } from "./application/handlers/generate-user-report.handler";
import { GenerateDemandReportHandler } from "./application/handlers/generate-demand-report.handler";

// Query Handlers
import { UsageReportHandler } from "./application/handlers/usage-report.handler";
import { UsageReportSummaryHandler } from "./application/handlers/usage-report.handler";
import { ReportFilterOptionsHandler } from "./application/handlers/usage-report.handler";
import { UserReportHandler } from "./application/handlers/user-report.handler";
import { UserReportSummaryHandler } from "./application/handlers/user-report.handler";
import { UserReportHistoryHandler } from "./application/handlers/user-report.handler";
import { ExportReportHandler } from "./application/handlers/export-report.handler";
import { ExportHistoryHandler } from "./application/handlers/export-report.handler";
import { DownloadExportHandler } from "./application/handlers/export-report.handler";
import { CachedReportHandler } from "./application/handlers/export-report.handler";

// Repositories
import { ReportsRepository } from "./domain/repositories/reports.repository";
import { GeneratedReportsRepository } from "./domain/repositories/generated-reports.repository";
import { ReportExportsRepository } from "./domain/repositories/report-exports.repository";
import { PrismaReportsRepository } from "./infrastructure/repositories/prisma-reports.repository";
import { PrismaGeneratedReportsRepository } from "./infrastructure/repositories/prisma-generated-reports.repository";
import { PrismaReportExportsRepository } from "./infrastructure/repositories/prisma-report-exports.repository";

// Services
import { ReportsAuditService } from "./application/services/audit.service";
import { AuthModule } from "@apps/auth-service/auth.module";

const commandHandlers = [
  CreateFeedbackHandler,
  GenerateUsageReportHandler,
  GenerateUserReportHandler,
  GenerateDemandReportHandler,
];

const queryHandlers = [
  UsageReportHandler,
  UsageReportSummaryHandler,
  ReportFilterOptionsHandler,
  UserReportHandler,
  UserReportSummaryHandler,
  UserReportHistoryHandler,
  ExportReportHandler,
  ExportHistoryHandler,
  DownloadExportHandler,
  CachedReportHandler,
];

const repositories = [
  {
    provide: "ReportsRepository",
    useClass: PrismaReportsRepository,
  },
  {
    provide: "GeneratedReportsRepository",
    useClass: PrismaGeneratedReportsRepository,
  },
  {
    provide: "ReportExportsRepository",
    useClass: PrismaReportExportsRepository,
  },
];

@Module({
  imports: [
    CqrsModule,
    LoggingModule,
    CommonModule,
    EventBusModule,
    AuthModule,
  ],
  controllers: [
    ReportsController,
    UsageReportsController,
    UserReportsController,
    ExportReportsController,
  ],
  providers: [
    ReportsService,
    ReportsAuditService,
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
