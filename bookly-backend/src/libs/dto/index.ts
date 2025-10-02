// Common DTOs shared across all services
export { PaginationDto } from './common/pagination.dto';
export * from './common/response.dto';
export * from './common/base-entity.dto';

// Auth Service DTOs
export * from './auth/login.dto';
export * from './auth/register.dto';
export * from './auth/user.dto';
export * from './auth/role.dto';
export * from './auth/permission.dto';

// Resources Service DTOs
export * from './resources/resource.dto';
export * from './resources/category.dto';
export * from './resources/maintenance.dto';

// Availability Service DTOs
export * from './availability/reservation.dto';
export * from './availability/availability.dto';
export * from './availability/waiting-list.dto';
export * from './availability/audit-export.dto';

// Stockpile Service DTOs
export * from './stockpile/approval.dto';
export * from './stockpile/check-in-out.dto';
export * from './stockpile/approval-flow.dto';
export * from './stockpile/document-template.dto';
export * from './stockpile/notification-template.dto';

// Reports DTOs
export * from './reports/feedback.dto';
export * from './reports/create-feedback.dto';
export * from './reports/generate-usage-report.dto';
export * from './reports/generate-user-report.dto';
export * from './reports/generate-demand-report.dto';
export * from './reports/audit-log.dto';
export * from './reports/export-csv.dto';
export * from './reports/usage-report-filters.dto';
export * from './reports/user-report-filters.dto';
export * from './reports/report-response.dto';
