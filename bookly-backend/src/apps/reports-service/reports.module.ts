import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

// Controllers
import { ReportsCategoryController } from "./infrastructure/controllers/reports-category.controller";
import { ReportsController } from "@apps/reports-service/infrastructure/controllers/reports.controller";
import { UsageReportsController } from "@apps/reports-service/infrastructure/controllers/usage-reports.controller";
import { UserReportsController } from "@apps/reports-service/infrastructure/controllers/user-reports.controller";
import { ExportReportsController } from "@apps/reports-service/infrastructure/controllers/export-reports.controller";
import { AlertsController } from "@apps/reports-service/infrastructure/controllers/alerts.controller";
import { CustomReportsController } from "@apps/reports-service/infrastructure/controllers/custom-reports.controller";
import { DataProcessingController } from "@apps/reports-service/infrastructure/controllers/data-processing.controller";
import { PerformanceController } from "@apps/reports-service/infrastructure/controllers/performance.controller";
import { ScheduledReportsController } from "@apps/reports-service/infrastructure/controllers/scheduled-reports.controller";
import { TemplatesController } from "@apps/reports-service/infrastructure/controllers/templates.controller";

// Modules
import { LoggingModule } from "@/libs/logging/logging.module";
import { CommonModule } from "@/libs/common/common.module";
import { EventBusModule } from "@/libs/event-bus/event-bus.module";
import { PrismaCategoryRepository } from "@apps/reports-service/infrastructure/repositories/prisma-category.repository";
import { HealthModule } from "../../health/health.module";
import { AuthModule } from "@apps/auth-service/auth.module";
import { ResourcesModule } from "@apps/resources-service/resources.module";

// Command Handlers
import { CreateFeedbackHandler } from "@apps/reports-service/application/handlers/create-feedback.handler";
import { GenerateUsageReportHandler } from "@apps/reports-service/application/handlers/generate-usage-report.handler";
import { GenerateUserReportHandler } from "@apps/reports-service/application/handlers/generate-user-report.handler";
import { GenerateDemandReportHandler } from "@apps/reports-service/application/handlers/generate-demand-report.handler";

// Query Handlers
import { UsageReportHandler } from "@apps/reports-service/application/handlers/usage-report.handler";
import { UsageReportSummaryHandler } from "@apps/reports-service/application/handlers/usage-report.handler";
import { ReportFilterOptionsHandler } from "@apps/reports-service/application/handlers/usage-report.handler";
import { UserReportHandler } from "@apps/reports-service/application/handlers/user-report.handler";
import { UserReportSummaryHandler } from "@apps/reports-service/application/handlers/user-report.handler";
import { UserReportHistoryHandler } from "@apps/reports-service/application/handlers/user-report.handler";
import { ExportReportHandler } from "@apps/reports-service/application/handlers/export-report.handler";
import { ExportHistoryHandler } from "@apps/reports-service/application/handlers/export-report.handler";
import { DownloadExportHandler } from "@apps/reports-service/application/handlers/export-report.handler";
import { CachedReportHandler } from "@apps/reports-service/application/handlers/export-report.handler";

// Repositories
import { ReportsRepository } from "@apps/reports-service/domain/repositories/reports.repository";
import { GeneratedReportsRepository } from "@apps/reports-service/domain/repositories/generated-reports.repository";
import { ReportExportsRepository } from "@apps/reports-service/domain/repositories/report-exports.repository";
import { PrismaReportsRepository } from "@apps/reports-service/infrastructure/repositories/prisma-reports.repository";
import { PrismaGeneratedReportsRepository } from "@apps/reports-service/infrastructure/repositories/prisma-generated-reports.repository";
import { PrismaReportExportsRepository } from "@apps/reports-service/infrastructure/repositories/prisma-report-exports.repository";

// Services
import { ReportsAuditService } from "@apps/reports-service/application/services/audit.service";
import { ReportsService } from "@apps/reports-service/application/services/reports.service";
import { CategoryService } from "@apps/reports-service/application/services/category.service";

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
  {
    provide: "CategoryRepository",
    useClass: PrismaCategoryRepository,
  },
];

@Module({
  imports: [
    CqrsModule,
    LoggingModule,
    CommonModule,
    EventBusModule,
    AuthModule,
    HealthModule,
    ResourcesModule,
  ],
  controllers: [
    ReportsController,
    UsageReportsController,
    UserReportsController,
    ExportReportsController,
    ReportsCategoryController,
    AlertsController,
    CustomReportsController,
    DataProcessingController,
    PerformanceController,
    ScheduledReportsController,
    TemplatesController,
  ],
  providers: [
    ReportsAuditService,
    ReportsService,
    CategoryService,
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
  ],
  exports: [ReportsService, CategoryService, ReportsAuditService],
})
export class ReportsModule {}
