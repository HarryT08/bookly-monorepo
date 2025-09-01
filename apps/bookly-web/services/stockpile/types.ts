/**
 * Stockpile Service Types
 * Types for approval flows, document generation, and notifications (Hito 3 - RF20, RF21, RF22)
 */

// ================================
// RF-20: Approval Flow Types
// ================================

export enum ApprovalRequestStatus {
	PENDING = 'PENDING',
	APPROVED = 'APPROVED',
	REJECTED = 'REJECTED',
	TIMEOUT = 'TIMEOUT',
	CANCELLED = 'CANCELLED'
}

export enum ApprovalActionType {
	APPROVE = 'APPROVE',
	REJECT = 'REJECT',
	REQUEST_CHANGES = 'REQUEST_CHANGES',
	TIMEOUT = 'TIMEOUT'
}

export interface ApprovalFlow {
	id: string;
	name: string;
	description?: string;
	createdBy: string;
	programId?: string;
	resourceType?: string;
	categoryId?: string;
	isDefault: boolean;
	requiresAllApprovals: boolean;
	autoApprovalEnabled: boolean;
	reviewTimeHours?: number;
	reminderHours?: number;
	isActive: boolean;
	levels: ApprovalLevel[];
	createdAt: Date;
	updatedAt: Date;
}

export interface ApprovalLevel {
	id: string;
	flowId: string;
	level: number;
	name: string;
	description?: string;
	approverRoles: string[];
	approverUsers: string[];
	requiresAll: boolean;
	timeoutHours?: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface ApprovalRequest {
	id: string;
	reservationId: string;
	levelId: string;
	status: ApprovalRequestStatus;
	approverId?: string;
	comments?: string;
	requestedAt: Date;
	respondedAt?: Date;
	timeoutAt?: Date;
	notificationsSent: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
	// Extended fields for UI
	reservation?: {
		id: string;
		title: string;
		startDate: Date;
		endDate: Date;
		resourceName: string;
		requesterName: string;
		requesterEmail: string;
	};
	level?: ApprovalLevel;
	approver?: {
		id: string;
		name: string;
		email: string;
	};
}

export interface ApprovalAction {
	id: string;
	requestId: string;
	userId: string;
	action: ApprovalActionType;
	comments?: string;
	ipAddress?: string;
	userAgent?: string;
	createdAt: Date;
}

// ================================
// RF-21: Document Generation Types
// ================================

export enum DocumentEventType {
	RESERVATION_APPROVED = 'RESERVATION_APPROVED',
	RESERVATION_REJECTED = 'RESERVATION_REJECTED',
	RESERVATION_CANCELLED = 'RESERVATION_CANCELLED',
	RESERVATION_MODIFIED = 'RESERVATION_MODIFIED'
}

export enum DocumentFormat {
	PDF = 'PDF',
	DOCX = 'DOCX',
	HTML = 'HTML'
}

export interface DocumentTemplate {
	id: string;
	name: string;
	eventType: DocumentEventType;
	format: DocumentFormat;
	description?: string;
	resourceType?: string;
	categoryId?: string;
	templatePath?: string;
	content?: string;
	variables: Record<string, any>;
	isDefault: boolean;
	isActive: boolean;
	canSendAsAttachment: boolean;
	canSendAsLink: boolean;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface GeneratedDocument {
	id: string;
	templateId: string;
	reservationId: string;
	fileName: string;
	filePath: string;
	mimeType: string;
	fileSize?: number;
	generatedBy: string;
	variables?: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
	downloadUrl?: string;
}

// ================================
// RF-22: Notification Types
// ================================

export enum NotificationChannelType {
	EMAIL = 'EMAIL',
	SMS = 'SMS',
	WHATSAPP = 'WHATSAPP',
	IN_APP = 'IN_APP',
	PUSH = 'PUSH'
}

export enum NotificationEventType {
	APPROVAL_REQUESTED = 'APPROVAL_REQUESTED',
	APPROVAL_APPROVED = 'APPROVAL_APPROVED',
	APPROVAL_REJECTED = 'APPROVAL_REJECTED',
	APPROVAL_TIMEOUT = 'APPROVAL_TIMEOUT',
	APPROVAL_REMINDER = 'APPROVAL_REMINDER',
	DOCUMENT_GENERATED = 'DOCUMENT_GENERATED'
}

export enum DocumentDeliveryMethod {
	ATTACHMENT = 'ATTACHMENT',
	LINK = 'LINK',
	BOTH = 'BOTH'
}

export enum NotificationStatus {
	PENDING = 'PENDING',
	SENT = 'SENT',
	DELIVERED = 'DELIVERED',
	READ = 'READ',
	FAILED = 'FAILED'
}

export interface NotificationChannel {
	id: string;
	name: string;
	channel: NotificationChannelType;
	displayName: string;
	supportsAttachments: boolean;
	supportsLinks: boolean;
	maxMessageLength?: number;
	isActive: boolean;
	settings: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
}

export interface NotificationTemplate {
	id: string;
	name: string;
	channelId: string;
	eventType: NotificationEventType;
	content: string;
	subject?: string;
	resourceType?: string;
	categoryId?: string;
	variables: Record<string, any>;
	isDefault: boolean;
	isActive: boolean;
	attachDocument: boolean;
	documentAsLink: boolean;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface NotificationConfig {
	id: string;
	channelId: string;
	programId?: string;
	resourceType?: string;
	categoryId?: string;
	isEnabled: boolean;
	isImmediate: boolean;
	batchInterval?: number;
	sendDocuments: boolean;
	documentMethod?: DocumentDeliveryMethod;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface SentNotification {
	id: string;
	templateId: string;
	reservationId: string;
	recipientId: string;
	channel: NotificationChannelType;
	status: NotificationStatus;
	content: string;
	subject?: string;
	hasAttachment: boolean;
	attachmentPath?: string;
	variables: Record<string, any>;
	sentAt?: Date;
	deliveredAt?: Date;
	readAt?: Date;
	errorMessage?: string;
	createdAt: Date;
	updatedAt: Date;
}

// ================================
// Request/Response DTOs
// ================================

export interface CreateApprovalFlowRequest {
	name: string;
	description?: string;
	programId?: string;
	resourceType?: string;
	categoryId?: string;
	isDefault?: boolean;
	requiresAllApprovals?: boolean;
	autoApprovalEnabled?: boolean;
	reviewTimeHours?: number;
	reminderHours?: number;
	levels: CreateApprovalLevelRequest[];
}

export interface CreateApprovalLevelRequest {
	level: number;
	name: string;
	description?: string;
	approverRoles?: string[];
	approverUsers?: string[];
	requiresAll?: boolean;
	timeoutHours?: number;
}

export interface UpdateApprovalFlowRequest {
	name?: string;
	description?: string;
	isActive?: boolean;
	requiresAllApprovals?: boolean;
	autoApprovalEnabled?: boolean;
	reviewTimeHours?: number;
	reminderHours?: number;
}

export interface ProcessApprovalRequest {
	action: ApprovalActionType;
	comments?: string;
}

export interface CreateDocumentTemplateRequest {
	name: string;
	eventType: DocumentEventType;
	format: DocumentFormat;
	description?: string;
	resourceType?: string;
	categoryId?: string;
	content?: string;
	templatePath?: string;
	variables?: Record<string, any>;
	isDefault?: boolean;
	canSendAsAttachment?: boolean;
	canSendAsLink?: boolean;
}

export interface UpdateDocumentTemplateRequest {
	name?: string;
	description?: string;
	content?: string;
	variables?: Record<string, any>;
	isActive?: boolean;
	canSendAsAttachment?: boolean;
	canSendAsLink?: boolean;
}

export interface GenerateDocumentRequest {
	templateId: string;
	reservationId: string;
	variables: Record<string, any>;
}

export interface CreateNotificationTemplateRequest {
	name: string;
	channelId: string;
	eventType: NotificationEventType;
	content: string;
	subject?: string;
	resourceType?: string;
	categoryId?: string;
	variables?: Record<string, any>;
	isDefault?: boolean;
	attachDocument?: boolean;
	documentAsLink?: boolean;
}

export interface UpdateNotificationTemplateRequest {
	name?: string;
	content?: string;
	subject?: string;
	variables?: Record<string, any>;
	isActive?: boolean;
	attachDocument?: boolean;
	documentAsLink?: boolean;
}

export interface SendNotificationRequest {
	templateId: string;
	reservationId: string;
	recipientId: string;
	variables: Record<string, any>;
	documentId?: string;
}

// ================================
// Filter and Query Types
// ================================

export interface ApprovalRequestFilter {
	approverId?: string;
	status?: ApprovalRequestStatus;
	programId?: string;
	resourceType?: string;
	categoryId?: string;
	startDate?: Date;
	endDate?: Date;
	page?: number;
	limit?: number;
}

export interface ApprovalFlowFilter {
	programId?: string;
	resourceType?: string;
	categoryId?: string;
	isActive?: boolean;
	isDefault?: boolean;
	page?: number;
	limit?: number;
}

export interface DocumentFilter {
	reservationId?: string;
	templateId?: string;
	eventType?: DocumentEventType;
	format?: DocumentFormat;
	startDate?: Date;
	endDate?: Date;
	page?: number;
	limit?: number;
}

export interface NotificationFilter {
	reservationId?: string;
	recipientId?: string;
	channel?: NotificationChannelType;
	status?: NotificationStatus;
	eventType?: NotificationEventType;
	startDate?: Date;
	endDate?: Date;
	page?: number;
	limit?: number;
}

// ================================
// Response Types
// ================================

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface ReservationApprovalStatus {
	reservationId: string;
	status: string;
	currentLevel?: number;
	pendingRequests: ApprovalRequest[];
	completedRequests: ApprovalRequest[];
}

export interface ApprovalDashboardStats {
	pendingCount: number;
	approvedToday: number;
	rejectedToday: number;
	timeoutCount: number;
	avgResponseTime: number;
}

export interface DocumentStats {
	generatedToday: number;
	totalGenerated: number;
	byEventType: Record<DocumentEventType, number>;
	byFormat: Record<DocumentFormat, number>;
}

export interface NotificationStats {
	sentToday: number;
	deliveryRate: number;
	byChannel: Record<NotificationChannelType, number>;
	failedCount: number;
}
