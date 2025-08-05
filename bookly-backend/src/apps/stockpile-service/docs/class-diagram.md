# Bookly Stockpile Service - Class Diagram Extensions

## Overview

This document describes the extensions made to the base Bookly class diagram to support the approval flow, document generation, and notification system implemented in the stockpile-service.

## Domain Entities

### Approval Flow Domain

#### ApprovalFlowEntity
```typescript
class ApprovalFlowEntity {
  - id: string
  - name: string
  - description?: string
  - programId: string
  - resourceTypes: string[]
  - categoryIds: string[]
  - isActive: boolean
  - autoApprovalEnabled: boolean
  - autoApprovalConditions: Record<string, any>
  - timeoutHours: number
  - escalationEnabled: boolean
  - escalationHours?: number
  - createdBy: string
  - createdAt: Date
  - updatedAt: Date
  - levels: ApprovalLevelEntity[]

  + constructor(...)
  + canAutoApprove(): boolean
  + getNextLevel(currentLevel: number): ApprovalLevelEntity | null
  + isApplicableToReservation(reservation: any): boolean
  + addLevel(level: ApprovalLevelEntity): void
  + removeLevel(levelId: string): void
  + activate(): void
  + deactivate(): void
}
```

#### ApprovalLevelEntity
```typescript
class ApprovalLevelEntity {
  - id: string
  - flowId: string
  - level: number
  - name: string
  - description?: string
  - approverRoles: string[]
  - approverUsers: string[]
  - requiresAll: boolean
  - timeoutHours: number
  - isActive: boolean
  - createdAt: Date
  - updatedAt: Date

  + constructor(...)
  + canApprove(userId: string, userRoles: string[]): boolean
  + isTimedOut(requestCreatedAt: Date): boolean
  + getApprovers(): string[]
}
```

#### ApprovalRequestEntity
```typescript
class ApprovalRequestEntity {
  - id: string
  - reservationId: string
  - flowId: string
  - requesterId: string
  - status: ApprovalStatus
  - currentLevel: number
  - reason?: string
  - priority: RequestPriority
  - requestedDate: Date
  - approvedAt?: Date
  - rejectedAt?: Date
  - completedAt?: Date
  - createdAt: Date
  - updatedAt: Date
  - metadata: Record<string, any>

  + constructor(...)
  + approve(approverId: string, reason?: string): void
  + reject(approverId: string, reason: string): void
  + moveToNextLevel(): void
  + isExpired(): boolean
  + canBeApprovedBy(userId: string, userRoles: string[]): boolean
}
```

#### ApprovalActionEntity
```typescript
class ApprovalActionEntity {
  - id: string
  - requestId: string
  - levelId: string
  - action: ApprovalActionType
  - performedBy: string
  - performedAt: Date
  - reason?: string
  - conditions?: string
  - createdAt: Date

  + constructor(...)
  + isApproval(): boolean
  + isRejection(): boolean
}
```

### Document Template Domain

#### DocumentTemplateEntity
```typescript
class DocumentTemplateEntity {
  - id: string
  - name: string
  - description?: string
  - resourceType?: string
  - categoryId?: string
  - eventType: DocumentEventType
  - content: string
  - fileName?: string
  - filePath?: string
  - fileSize?: number
  - variables: Record<string, any>
  - isDefault: boolean
  - isActive: boolean
  - createdBy: string
  - createdAt: Date
  - updatedAt: Date

  + constructor(...)
  + generateDocument(variables: Record<string, any>): GeneratedDocumentEntity
  + validateVariables(variables: Record<string, any>): boolean
  + updateContent(content: string): void
  + uploadFile(fileName: string, filePath: string, fileSize: number): void
  + activate(): void
  + deactivate(): void
}
```

#### GeneratedDocumentEntity
```typescript
class GeneratedDocumentEntity {
  - id: string
  - templateId: string
  - reservationId: string
  - fileName: string
  - filePath: string
  - fileSize: number
  - generatedBy: string
  - generatedAt: Date
  - variables: Record<string, any>
  - createdAt: Date
  - updatedAt: Date

  + constructor(...)
  + getDownloadUrl(): string
  + isExpired(): boolean
}
```

### Notification Template Domain

#### NotificationTemplateEntity
```typescript
class NotificationTemplateEntity {
  - id: string
  - name: string
  - description?: string
  - eventType: string
  - channel: NotificationChannelType
  - subject?: string
  - content: string
  - variables: Record<string, any>
  - attachDocument: boolean
  - documentAsLink: boolean
  - isActive: boolean
  - createdBy: string
  - createdAt: Date
  - updatedAt: Date

  + constructor(...)
  + renderContent(variables: Record<string, any>): string
  + renderSubject(variables: Record<string, any>): string
  + shouldIncludeDocument(): boolean
  + shouldIncludeDocumentLink(): boolean
  + validateVariables(variables: Record<string, any>): boolean
}
```

#### NotificationChannelEntity
```typescript
class NotificationChannelEntity {
  - id: string
  - name: NotificationChannelType
  - displayName: string
  - description?: string
  - isEnabled: boolean
  - configuration: Record<string, any>
  - createdAt: Date
  - updatedAt: Date

  + constructor(...)
  + isConfigured(): boolean
  + canSendNotification(): boolean
}
```

#### NotificationConfigEntity
```typescript
class NotificationConfigEntity {
  - id: string
  - programId: string
  - resourceType?: string
  - categoryId?: string
  - channelId: string
  - isEnabled: boolean
  - isImmediate: boolean
  - batchInterval: number
  - sendDocuments: boolean
  - documentMethod: DocumentDeliveryMethod
  - createdBy: string
  - createdAt: Date
  - updatedAt: Date

  + constructor(...)
  + shouldSendImmediately(): boolean
  + shouldBatchNotifications(): boolean
  + shouldIncludeDocuments(): boolean
}
```

#### SentNotificationEntity
```typescript
class SentNotificationEntity {
  - id: string
  - templateId: string
  - reservationId: string
  - recipientId: string
  - channel: NotificationChannelType
  - status: NotificationStatus
  - subject?: string
  - content: string
  - hasAttachment: boolean
  - attachmentPath?: string
  - sentAt?: Date
  - deliveredAt?: Date
  - readAt?: Date
  - errorMessage?: string
  - createdAt: Date
  - updatedAt: Date
  - variables: Record<string, any>

  + constructor(...)
  + markAsSent(): void
  + markAsDelivered(): void
  + markAsRead(): SentNotificationEntity
  + markAsFailed(error: string): void
  + isDelivered(): boolean
  + isFailed(): boolean
}
```

## Enumerations

### ApprovalStatus
```typescript
enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}
```

### RequestPriority
```typescript
enum RequestPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}
```

### ApprovalActionType
```typescript
enum ApprovalActionType {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  CANCELLED = 'CANCELLED'
}
```

### DocumentEventType
```typescript
enum DocumentEventType {
  APPROVAL = 'APPROVAL',
  REJECTION = 'REJECTION',
  CANCELLATION = 'CANCELLATION',
  REMINDER = 'REMINDER',
  CONFIRMATION = 'CONFIRMATION'
}
```

### NotificationChannelType
```typescript
enum NotificationChannelType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH'
}
```

### NotificationStatus
```typescript
enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}
```

### DocumentDeliveryMethod
```typescript
enum DocumentDeliveryMethod {
  ATTACHMENT = 'ATTACHMENT',
  LINK = 'LINK',
  EMBEDDED = 'EMBEDDED'
}
```

## Repository Interfaces

### ApprovalFlowRepository
```typescript
interface ApprovalFlowRepository {
  + createApprovalFlow(flow: ApprovalFlowEntity): Promise<ApprovalFlowEntity>
  + findApprovalFlowById(id: string): Promise<ApprovalFlowEntity | null>
  + findApprovalFlows(filters: ApprovalFlowFilters): Promise<{ flows: ApprovalFlowEntity[]; total: number }>
  + updateApprovalFlow(id: string, flow: Partial<ApprovalFlowEntity>): Promise<ApprovalFlowEntity>
  + deleteApprovalFlow(id: string): Promise<void>
  + findApplicableFlow(reservation: any): Promise<ApprovalFlowEntity | null>
  + createApprovalLevel(level: ApprovalLevelEntity): Promise<ApprovalLevelEntity>
  + updateApprovalLevel(id: string, level: Partial<ApprovalLevelEntity>): Promise<ApprovalLevelEntity>
  + deleteApprovalLevel(id: string): Promise<void>
  + createApprovalRequest(request: ApprovalRequestEntity): Promise<ApprovalRequestEntity>
  + findApprovalRequestById(id: string): Promise<ApprovalRequestEntity | null>
  + updateApprovalRequest(id: string, request: Partial<ApprovalRequestEntity>): Promise<ApprovalRequestEntity>
  + findPendingApprovalRequestsByApprover(approverId: string): Promise<ApprovalRequestEntity[]>
  + createApprovalAction(action: ApprovalActionEntity): Promise<ApprovalActionEntity>
  + findApprovalActionsByRequestId(requestId: string): Promise<ApprovalActionEntity[]>
}
```

### DocumentTemplateRepository
```typescript
interface DocumentTemplateRepository {
  + createDocumentTemplate(template: DocumentTemplateEntity): Promise<DocumentTemplateEntity>
  + findDocumentTemplateById(id: string): Promise<DocumentTemplateEntity | null>
  + findDocumentTemplates(filters: DocumentTemplateFilters): Promise<{ templates: DocumentTemplateEntity[]; total: number }>
  + updateDocumentTemplate(id: string, template: Partial<DocumentTemplateEntity>): Promise<DocumentTemplateEntity>
  + deleteDocumentTemplate(id: string): Promise<void>
  + findDefaultDocumentTemplate(resourceType?: string, categoryId?: string, eventType?: string): Promise<DocumentTemplateEntity | null>
  + createGeneratedDocument(document: GeneratedDocumentEntity): Promise<GeneratedDocumentEntity>
  + findGeneratedDocumentById(id: string): Promise<GeneratedDocumentEntity | null>
  + findDocumentTemplatesByScope(resourceType?: string, categoryId?: string, eventType?: DocumentEventType): Promise<DocumentTemplateEntity[]>
  + findGeneratedDocumentsByReservationId(reservationId: string): Promise<GeneratedDocumentEntity[]>
}
```

### NotificationTemplateRepository
```typescript
interface NotificationTemplateRepository {
  + createNotificationTemplate(template: NotificationTemplateEntity): Promise<NotificationTemplateEntity>
  + findNotificationTemplateById(id: string): Promise<NotificationTemplateEntity | null>
  + findNotificationTemplates(filters: NotificationTemplateFilters): Promise<{ templates: NotificationTemplateEntity[]; total: number }>
  + updateNotificationTemplate(id: string, template: Partial<NotificationTemplateEntity>): Promise<NotificationTemplateEntity>
  + deleteNotificationTemplate(id: string): Promise<void>
  + findNotificationTemplateByEventAndChannel(eventType: string, channel: NotificationChannelType): Promise<NotificationTemplateEntity | null>
  + createNotificationChannel(channel: NotificationChannelEntity): Promise<NotificationChannelEntity>
  + findNotificationChannelById(id: string): Promise<NotificationChannelEntity | null>
  + findNotificationChannels(): Promise<NotificationChannelEntity[]>
  + updateNotificationChannel(id: string, channel: Partial<NotificationChannelEntity>): Promise<NotificationChannelEntity>
  + findNotificationChannelByType(type: NotificationChannelType): Promise<NotificationChannelEntity | null>
  + createNotificationConfig(config: NotificationConfigEntity): Promise<NotificationConfigEntity>
  + findNotificationConfigById(id: string): Promise<NotificationConfigEntity | null>
  + findNotificationConfigs(filters: NotificationConfigFilters): Promise<NotificationConfigEntity[]>
  + updateNotificationConfig(id: string, config: Partial<NotificationConfigEntity>): Promise<NotificationConfigEntity>
  + deleteNotificationConfig(id: string): Promise<void>
  + createSentNotification(notification: SentNotificationEntity): Promise<SentNotificationEntity>
  + findSentNotificationById(id: string): Promise<SentNotificationEntity | null>
  + updateSentNotification(id: string, notification: Partial<SentNotificationEntity>): Promise<SentNotificationEntity>
  + findSentNotificationsByRecipient(recipientId: string, filters: SentNotificationFilters): Promise<{ notifications: SentNotificationEntity[]; total: number }>
  + findNotificationsForBatch(channelId: string, batchIntervalMs: number): Promise<SentNotificationEntity[]>
}
```

## CQRS Commands

### Approval Flow Commands
- `CreateApprovalFlowCommand`
- `UpdateApprovalFlowCommand`
- `DeleteApprovalFlowCommand`
- `CreateApprovalRequestCommand`
- `ApproveRequestCommand`
- `RejectRequestCommand`

### Document Template Commands
- `CreateDocumentTemplateCommand`
- `UpdateDocumentTemplateCommand`
- `DeleteDocumentTemplateCommand`
- `UploadDocumentTemplateCommand`
- `GenerateDocumentCommand`

### Notification Template Commands
- `CreateNotificationTemplateCommand`
- `UpdateNotificationTemplateCommand`
- `DeleteNotificationTemplateCommand`
- `SendNotificationCommand`
- `CreateNotificationConfigCommand`
- `UpdateNotificationConfigCommand`

## CQRS Queries

### Approval Flow Queries
- `GetApprovalFlowsQuery`
- `GetApprovalFlowByIdQuery`
- `GetPendingApprovalRequestsQuery`
- `GetApprovalHistoryQuery`
- `GetUserApprovalStatisticsQuery`

### Document Template Queries
- `GetDocumentTemplatesQuery`
- `GetDocumentTemplateByIdQuery`
- `GetDefaultDocumentTemplateQuery`
- `GetGeneratedDocumentsQuery`

### Notification Template Queries
- `GetNotificationTemplatesQuery`
- `GetNotificationTemplateByIdQuery`
- `GetNotificationChannelsQuery`
- `GetNotificationConfigsQuery`
- `GetSentNotificationsQuery`
- `GetNotificationsForBatchQuery`

## Domain Events

### Approval Flow Events
- `ReservationApprovedEvent`
- `ReservationRejectedEvent`
- `ApprovalRequestCreatedEvent`
- `ApprovalLevelCompletedEvent`
- `ApprovalFlowCompletedEvent`

### Document Template Events
- `DocumentGeneratedEvent`
- `DocumentTemplateCreatedEvent`
- `DocumentTemplateUpdatedEvent`

### Notification Template Events
- `NotificationSentEvent`
- `NotificationTemplateCreatedEvent`
- `NotificationTemplateUpdatedEvent`
- `NotificationConfigUpdatedEvent`

## Relationships

### Core Relationships
1. **ApprovalFlowEntity** (1) → (n) **ApprovalLevelEntity**
2. **ApprovalFlowEntity** (1) → (n) **ApprovalRequestEntity**
3. **ApprovalRequestEntity** (1) → (n) **ApprovalActionEntity**
4. **DocumentTemplateEntity** (1) → (n) **GeneratedDocumentEntity**
5. **NotificationTemplateEntity** (1) → (n) **SentNotificationEntity**
6. **NotificationChannelEntity** (1) → (n) **NotificationConfigEntity**
7. **NotificationChannelEntity** (1) → (n) **SentNotificationEntity**

### External Relationships (with other services)
1. **ApprovalRequestEntity.reservationId** → **Reservation** (availability-service)
2. **ApprovalRequestEntity.requesterId** → **User** (auth-service)
3. **ApprovalFlowEntity.programId** → **Program** (resources-service)
4. **DocumentTemplateEntity.categoryId** → **Category** (resources-service)
5. **SentNotificationEntity.recipientId** → **User** (auth-service)

## Integration Points

### Event Bus Integration
- All domain events are published to RabbitMQ
- Events follow the standardized `DomainEvent` structure
- Event handlers in other services can subscribe to relevant events

### File Storage Integration
- Document templates and generated documents are stored in file system
- File paths are stored in database entities
- File upload/download handled through dedicated endpoints

### Notification Integration
- Email notifications via SMTP
- SMS notifications via external provider
- In-app notifications via WebSocket
- Push notifications via Firebase/APNs

### Caching Integration
- Redis caching for frequently accessed templates
- Cache invalidation on template updates
- Batch notification processing with Redis queues

## Security Considerations

### Access Control
- Role-based access control (RBAC) for all operations
- Program-scoped permissions for coordinators
- Audit logging for all sensitive operations

### Data Protection
- Sensitive data encryption at rest
- Secure file storage with access controls
- PII handling in notifications and documents

### API Security
- JWT authentication for all endpoints
- Rate limiting to prevent abuse
- Input validation and sanitization

This class diagram extension provides a comprehensive view of the approval flow, document generation, and notification system architecture, showing how the new entities integrate with the existing Bookly system while maintaining clean separation of concerns and following domain-driven design principles.
