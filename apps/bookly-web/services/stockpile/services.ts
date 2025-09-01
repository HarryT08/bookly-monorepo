/**
 * Stockpile Services
 * API integration for approval flows, document generation, and notifications (Hito 3 - RF20, RF21, RF22)
 */

import { client } from '@services/http/client';
import {
	// Types
	ApprovalFlow,
	ApprovalLevel,
	ApprovalRequest,
	ApprovalAction,
	DocumentTemplate,
	GeneratedDocument,
	NotificationTemplate,
	NotificationChannel,
	NotificationConfig,
	SentNotification,
	// Request DTOs
	CreateApprovalFlowRequest,
	UpdateApprovalFlowRequest,
	ProcessApprovalRequest,
	CreateDocumentTemplateRequest,
	UpdateDocumentTemplateRequest,
	GenerateDocumentRequest,
	CreateNotificationTemplateRequest,
	UpdateNotificationTemplateRequest,
	SendNotificationRequest,
	// Filter types
	ApprovalRequestFilter,
	ApprovalFlowFilter,
	DocumentFilter,
	NotificationFilter,
	// Response types
	PaginatedResponse,
	ReservationApprovalStatus,
	ApprovalDashboardStats,
	DocumentStats,
	NotificationStats
} from './types';

const STOCKPILE_API_BASE = process.env.NEXT_PUBLIC_STOCKPILE_API_URL || 'http://localhost:3002';

// ================================
// RF-20: Approval Flow Services
// ================================

export const approvalFlowService = {
	// Create approval flow
	async createApprovalFlow(data: CreateApprovalFlowRequest): Promise<ApprovalFlow> {
		return await client.post(`${STOCKPILE_API_BASE}/approval-flows`, { json: data }).json<ApprovalFlow>();
	},

	// Update approval flow
	async updateApprovalFlow(id: string, data: UpdateApprovalFlowRequest): Promise<ApprovalFlow> {
		return await client.put(`${STOCKPILE_API_BASE}/approval-flows/${id}`, { json: data }).json<ApprovalFlow>();
	},

	// Get approval flows with filtering
	async getApprovalFlows(filter: ApprovalFlowFilter = {}): Promise<PaginatedResponse<ApprovalFlow>> {
		const params = new URLSearchParams();
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined) {
				params.append(key, String(value));
			}
		});

		return await client
			.get(`${STOCKPILE_API_BASE}/approval-flows?${params}`)
			.json<PaginatedResponse<ApprovalFlow>>();
	},

	// Get approval flow by ID
	async getApprovalFlow(id: string): Promise<ApprovalFlow> {
		return await client.get(`${STOCKPILE_API_BASE}/approval-flows/${id}`).json<ApprovalFlow>();
	},

	// Delete approval flow
	async deleteApprovalFlow(id: string): Promise<void> {
		await client.delete(`${STOCKPILE_API_BASE}/approval-flows/${id}`);
	},

	// Add level to approval flow
	async addApprovalLevel(flowId: string, levelData: any): Promise<ApprovalLevel> {
		return await client
			.post(`${STOCKPILE_API_BASE}/approval-flows/${flowId}/levels`, { json: levelData })
			.json<ApprovalLevel>();
	},

	// Update approval level
	async updateApprovalLevel(flowId: string, levelId: string, levelData: any): Promise<ApprovalLevel> {
		return await client
			.put(`${STOCKPILE_API_BASE}/approval-flows/${flowId}/levels/${levelId}`, { json: levelData })
			.json<ApprovalLevel>();
	},

	// Delete approval level
	async deleteApprovalLevel(flowId: string, levelId: string): Promise<void> {
		await client.delete(`${STOCKPILE_API_BASE}/approval-flows/${flowId}/levels/${levelId}`);
	}
};

export const approvalRequestService = {
	// Get pending approval requests
	async getPendingRequests(filter: ApprovalRequestFilter = {}): Promise<PaginatedResponse<ApprovalRequest>> {
		const params = new URLSearchParams();
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined) {
				params.append(key, String(value));
			}
		});

		return await client
			.get(`${STOCKPILE_API_BASE}/approval-flows/requests/pending?${params}`)
			.json<PaginatedResponse<ApprovalRequest>>();
	},

	// Process approval request (approve/reject/request changes)
	async processRequest(requestId: string, data: ProcessApprovalRequest): Promise<void> {
		await client.post(`${STOCKPILE_API_BASE}/approval-flows/requests/${requestId}/process`, { json: data });
	},

	// Get approval requests by reservation
	async getRequestsByReservation(reservationId: string): Promise<ApprovalRequest[]> {
		return await client
			.get(`${STOCKPILE_API_BASE}/approval-flows/reservations/${reservationId}/requests`)
			.json<ApprovalRequest[]>();
	},

	// Get reservation approval status
	async getReservationStatus(reservationId: string): Promise<ReservationApprovalStatus> {
		return await client
			.get(`${STOCKPILE_API_BASE}/approval-flows/reservations/${reservationId}/status`)
			.json<ReservationApprovalStatus>();
	},

	// Cancel reservation
	async cancelReservation(reservationId: string, reason?: string): Promise<void> {
		await client.post(`${STOCKPILE_API_BASE}/approval-flows/reservations/${reservationId}/cancel`, {
			json: { reason }
		});
	},

	// Get approval request history
	async getRequestHistory(requestId: string): Promise<ApprovalAction[]> {
		return await client
			.get(`${STOCKPILE_API_BASE}/approval-flows/requests/${requestId}/history`)
			.json<ApprovalAction[]>();
	},

	// Get approval dashboard stats
	async getDashboardStats(): Promise<ApprovalDashboardStats> {
		return await client.get(`${STOCKPILE_API_BASE}/approval-flows/dashboard/stats`).json<ApprovalDashboardStats>();
	}
};

// ================================
// RF-21: Document Generation Services
// ================================

export const documentTemplateService = {
	// Create document template
	async createTemplate(data: CreateDocumentTemplateRequest): Promise<DocumentTemplate> {
		return await client.post(`${STOCKPILE_API_BASE}/document-templates`, { json: data }).json<DocumentTemplate>();
	},

	// Update document template
	async updateTemplate(id: string, data: UpdateDocumentTemplateRequest): Promise<DocumentTemplate> {
		return await client
			.put(`${STOCKPILE_API_BASE}/document-templates/${id}`, { json: data })
			.json<DocumentTemplate>();
	},

	// Get document templates with filtering
	async getTemplates(filter: DocumentFilter = {}): Promise<PaginatedResponse<DocumentTemplate>> {
		const params = new URLSearchParams();
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined) {
				params.append(key, String(value));
			}
		});

		return await client
			.get(`${STOCKPILE_API_BASE}/document-templates?${params}`)
			.json<PaginatedResponse<DocumentTemplate>>();
	},

	// Get document template by ID
	async getTemplate(id: string): Promise<DocumentTemplate> {
		return await client.get(`${STOCKPILE_API_BASE}/document-templates/${id}`).json<DocumentTemplate>();
	},

	// Delete document template
	async deleteTemplate(id: string): Promise<void> {
		await client.delete(`${STOCKPILE_API_BASE}/document-templates/${id}`);
	},

	// Preview template with variables
	async previewTemplate(id: string, variables: Record<string, any>): Promise<{ content: string; fileName: string }> {
		return await client
			.post(`${STOCKPILE_API_BASE}/document-templates/${id}/preview`, { json: { variables } })
			.json<{ content: string; fileName: string }>();
	}
};

export const documentGenerationService = {
	// Generate document from template
	async generateDocument(data: GenerateDocumentRequest): Promise<GeneratedDocument> {
		return await client.post(`${STOCKPILE_API_BASE}/documents/generate`, { json: data }).json<GeneratedDocument>();
	},

	// Get generated documents with filtering
	async getDocuments(filter: DocumentFilter = {}): Promise<PaginatedResponse<GeneratedDocument>> {
		const params = new URLSearchParams();
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined) {
				params.append(key, String(value));
			}
		});

		return await client
			.get(`${STOCKPILE_API_BASE}/documents?${params}`)
			.json<PaginatedResponse<GeneratedDocument>>();
	},

	// Get generated document by ID
	async getDocument(id: string): Promise<GeneratedDocument> {
		return await client.get(`${STOCKPILE_API_BASE}/documents/${id}`).json<GeneratedDocument>();
	},

	// Download document
	async downloadDocument(id: string): Promise<Blob> {
		return await client.get(`${STOCKPILE_API_BASE}/documents/${id}/download`).blob();
	},

	// Delete generated document
	async deleteDocument(id: string): Promise<void> {
		await client.delete(`${STOCKPILE_API_BASE}/documents/${id}`);
	},

	// Get document statistics
	async getDocumentStats(): Promise<DocumentStats> {
		return await client.get(`${STOCKPILE_API_BASE}/documents/stats`).json<DocumentStats>();
	}
};

// ================================
// RF-22: Notification Services
// ================================

export const notificationChannelService = {
	// Get available notification channels
	async getChannels(): Promise<NotificationChannel[]> {
		return await client.get(`${STOCKPILE_API_BASE}/notification-channels`).json<NotificationChannel[]>();
	},

	// Get notification channel by ID
	async getChannel(id: string): Promise<NotificationChannel> {
		return await client.get(`${STOCKPILE_API_BASE}/notification-channels/${id}`).json<NotificationChannel>();
	},

	// Update notification channel settings
	async updateChannel(id: string, settings: Record<string, any>): Promise<NotificationChannel> {
		return await client
			.put(`${STOCKPILE_API_BASE}/notification-channels/${id}`, { json: { settings } })
			.json<NotificationChannel>();
	}
};

export const notificationTemplateService = {
	// Create notification template
	async createTemplate(data: CreateNotificationTemplateRequest): Promise<NotificationTemplate> {
		return await client
			.post(`${STOCKPILE_API_BASE}/notification-templates`, { json: data })
			.json<NotificationTemplate>();
	},

	// Update notification template
	async updateTemplate(id: string, data: UpdateNotificationTemplateRequest): Promise<NotificationTemplate> {
		return await client
			.put(`${STOCKPILE_API_BASE}/notification-templates/${id}`, { json: data })
			.json<NotificationTemplate>();
	},

	// Get notification templates with filtering
	async getTemplates(filter: NotificationFilter = {}): Promise<PaginatedResponse<NotificationTemplate>> {
		const params = new URLSearchParams();
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined) {
				params.append(key, String(value));
			}
		});

		return await client
			.get(`${STOCKPILE_API_BASE}/notification-templates?${params}`)
			.json<PaginatedResponse<NotificationTemplate>>();
	},

	// Get notification template by ID
	async getTemplate(id: string): Promise<NotificationTemplate> {
		return await client.get(`${STOCKPILE_API_BASE}/notification-templates/${id}`).json<NotificationTemplate>();
	},

	// Delete notification template
	async deleteTemplate(id: string): Promise<void> {
		await client.delete(`${STOCKPILE_API_BASE}/notification-templates/${id}`);
	},

	// Preview template with variables
	async previewTemplate(id: string, variables: Record<string, any>): Promise<{ subject?: string; content: string }> {
		return await client
			.post(`${STOCKPILE_API_BASE}/notification-templates/${id}/preview`, { json: { variables } })
			.json<{ subject?: string; content: string }>();
	}
};

export const notificationService = {
	// Send notification
	async sendNotification(data: SendNotificationRequest): Promise<SentNotification> {
		return await client.post(`${STOCKPILE_API_BASE}/notifications/send`, { json: data }).json<SentNotification>();
	},

	// Get sent notifications with filtering
	async getNotifications(filter: NotificationFilter = {}): Promise<PaginatedResponse<SentNotification>> {
		const params = new URLSearchParams();
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined) {
				params.append(key, String(value));
			}
		});

		return await client
			.get(`${STOCKPILE_API_BASE}/notifications?${params}`)
			.json<PaginatedResponse<SentNotification>>();
	},

	// Get notification by ID
	async getNotification(id: string): Promise<SentNotification> {
		return await client.get(`${STOCKPILE_API_BASE}/notifications/${id}`).json<SentNotification>();
	},

	// Mark notification as read
	async markAsRead(id: string): Promise<void> {
		await client.patch(`${STOCKPILE_API_BASE}/notifications/${id}/read`);
	},

	// Get notification statistics
	async getNotificationStats(): Promise<NotificationStats> {
		return await client.get(`${STOCKPILE_API_BASE}/notifications/stats`).json<NotificationStats>();
	},

	// Resend failed notification
	async resendNotification(id: string): Promise<void> {
		await client.post(`${STOCKPILE_API_BASE}/notifications/${id}/resend`);
	}
};

export const notificationConfigService = {
	// Get notification configurations
	async getConfigs(): Promise<NotificationConfig[]> {
		return await client.get(`${STOCKPILE_API_BASE}/notification-configs`).json<NotificationConfig[]>();
	},

	// Create notification configuration
	async createConfig(data: Partial<NotificationConfig>): Promise<NotificationConfig> {
		return await client
			.post(`${STOCKPILE_API_BASE}/notification-configs`, { json: data })
			.json<NotificationConfig>();
	},

	// Update notification configuration
	async updateConfig(id: string, data: Partial<NotificationConfig>): Promise<NotificationConfig> {
		return await client
			.put(`${STOCKPILE_API_BASE}/notification-configs/${id}`, { json: data })
			.json<NotificationConfig>();
	},

	// Delete notification configuration
	async deleteConfig(id: string): Promise<void> {
		await client.delete(`${STOCKPILE_API_BASE}/notification-configs/${id}`);
	}
};
