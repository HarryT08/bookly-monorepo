/**
 * Stockpile Services - API integration for approval flows, document generation, and notifications
 * Implements RF-20 (Validation), RF-21 (Document Generation), RF-22 (Notifications)
 */

import { stockpileClient } from '../http';
import type {
	ApprovalFlow,
	ApprovalLevel,
	ApprovalRequest,
	CreateApprovalFlowRequest,
	UpdateApprovalFlowRequest,
	CreateApprovalLevelRequest,
	ProcessApprovalRequest,
	ApprovalFlowFilter,
	ApprovalRequestFilter,
	PaginatedResponse,
	ReservationApprovalStatus,
	ApprovalDashboardStats
} from './types';

const APPROVAL_BASE_URL = '/approval-flows';

export const approvalFlowService = {
	async createApprovalFlow(data: CreateApprovalFlowRequest): Promise<ApprovalFlow> {
		const response = await stockpileClient.post(`${APPROVAL_BASE_URL}/flows`, { json: data });
		return response.json();
	},

	async updateApprovalFlow(id: string, data: UpdateApprovalFlowRequest): Promise<ApprovalFlow> {
		const response = await stockpileClient.put(`${APPROVAL_BASE_URL}/flows/${id}`, { json: data });
		return response.json();
	},

	async getApprovalFlows(filter?: ApprovalFlowFilter): Promise<PaginatedResponse<ApprovalFlow>> {
		const params = new URLSearchParams();

		if (filter) {
			Object.entries(filter).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		const response = await stockpileClient.get(`${APPROVAL_BASE_URL}/flows?${params.toString()}`);
		return response.json();
	},

	async getApprovalFlow(id: string): Promise<ApprovalFlow> {
		const response = await stockpileClient.get(`${APPROVAL_BASE_URL}/flows/${id}`);
		return response.json();
	},

	async deleteApprovalFlow(id: string): Promise<void> {
		await stockpileClient.delete(`${APPROVAL_BASE_URL}/flows/${id}`);
	},

	async addApprovalLevel(flowId: string, data: CreateApprovalLevelRequest): Promise<ApprovalLevel> {
		const response = await stockpileClient.post(`${APPROVAL_BASE_URL}/flows/${flowId}/levels`, { json: data });
		return response.json();
	},

	async updateApprovalLevel(
		flowId: string,
		levelId: string,
		data: Partial<CreateApprovalLevelRequest>
	): Promise<ApprovalLevel> {
		const response = await stockpileClient.put(`${APPROVAL_BASE_URL}/flows/${flowId}/levels/${levelId}`, {
			json: data
		});
		return response.json();
	},

	async deleteApprovalLevel(flowId: string, levelId: string): Promise<void> {
		await stockpileClient.delete(`${APPROVAL_BASE_URL}/flows/${flowId}/levels/${levelId}`);
	}
};

export const approvalRequestService = {
	async getPendingRequests(filter?: ApprovalRequestFilter): Promise<PaginatedResponse<ApprovalRequest>> {
		const params = new URLSearchParams();

		if (filter) {
			Object.entries(filter).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		const response = await stockpileClient.get(`${APPROVAL_BASE_URL}/requests/pending?${params}`);
		return response.json();
	},

	async processRequest(requestId: string, data: ProcessApprovalRequest): Promise<ApprovalRequest> {
		const response = await stockpileClient.post(`${APPROVAL_BASE_URL}/requests/${requestId}/process`, {
			json: data
		});
		return response.json();
	},

	async getRequestsByReservation(reservationId: string): Promise<ApprovalRequest[]> {
		const response = await stockpileClient.get(`${APPROVAL_BASE_URL}/requests/reservation/${reservationId}`);
		return response.json();
	},

	async getReservationStatus(reservationId: string): Promise<ReservationApprovalStatus> {
		const response = await stockpileClient.get(`${APPROVAL_BASE_URL}/status/${reservationId}`);
		return response.json();
	},

	async cancelReservation(reservationId: string, reason?: string): Promise<void> {
		const json = reason ? { reason } : {};
		await stockpileClient.post(`${APPROVAL_BASE_URL}/cancel/${reservationId}`, { json });
	},

	async getRequestHistory(filter?: ApprovalRequestFilter): Promise<PaginatedResponse<ApprovalRequest>> {
		const params = new URLSearchParams();

		if (filter) {
			Object.entries(filter).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		const response = await stockpileClient.get(`${APPROVAL_BASE_URL}/requests/history?${params}`);
		return response.json();
	},

	async getDashboardStats(): Promise<ApprovalDashboardStats> {
		const response = await stockpileClient.get(`${APPROVAL_BASE_URL}/stats/dashboard`);
		return response.json();
	}
};

import type {
	DocumentTemplate,
	GeneratedDocument,
	CreateDocumentTemplateRequest,
	UpdateDocumentTemplateRequest,
	GenerateDocumentRequest,
	DocumentFilter,
	DocumentStats,
	NotificationChannel,
	NotificationTemplate,
	NotificationConfig,
	SentNotification,
	CreateNotificationTemplateRequest,
	UpdateNotificationTemplateRequest,
	SendNotificationRequest,
	NotificationFilter,
	NotificationStats
} from './types';

const DOCUMENT_BASE_URL = '/document-templates';

export const documentTemplateService = {
	async createTemplate(data: CreateDocumentTemplateRequest): Promise<DocumentTemplate> {
		const response = await stockpileClient.post(`${DOCUMENT_BASE_URL}/templates`, { json: data });
		return response.json();
	},

	async updateTemplate(id: string, data: UpdateDocumentTemplateRequest): Promise<DocumentTemplate> {
		const response = await stockpileClient.put(`${DOCUMENT_BASE_URL}/templates/${id}`, { json: data });
		return response.json();
	},

	async getTemplates(filter?: DocumentFilter): Promise<PaginatedResponse<DocumentTemplate>> {
		const params = new URLSearchParams();

		if (filter) {
			Object.entries(filter).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		const response = await stockpileClient.get(`${DOCUMENT_BASE_URL}/templates?${params}`);
		return response.json();
	},

	async getTemplate(id: string): Promise<DocumentTemplate> {
		const response = await stockpileClient.get(`${DOCUMENT_BASE_URL}/templates/${id}`);
		return response.json();
	},

	async deleteTemplate(id: string): Promise<void> {
		await stockpileClient.delete(`${DOCUMENT_BASE_URL}/templates/${id}`);
	},

	async previewTemplate(id: string, variables: Record<string, unknown>): Promise<{ preview: string }> {
		const response = await stockpileClient.post(`${DOCUMENT_BASE_URL}/templates/${id}/preview`, {
			json: { variables }
		});
		return response.json();
	}
};

export const documentGenerationService = {
	async generateDocument(data: GenerateDocumentRequest): Promise<GeneratedDocument> {
		const response = await stockpileClient.post(`${DOCUMENT_BASE_URL}/generate`, { json: data });
		return response.json();
	},

	async getDocuments(filter?: DocumentFilter): Promise<PaginatedResponse<GeneratedDocument>> {
		const params = new URLSearchParams();

		if (filter) {
			Object.entries(filter).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		const response = await stockpileClient.get(`${DOCUMENT_BASE_URL}?${params}`);
		return response.json();
	},

	async getDocument(id: string): Promise<GeneratedDocument> {
		const response = await stockpileClient.get(`${DOCUMENT_BASE_URL}/${id}`);
		return response.json();
	},

	async downloadDocument(id: string): Promise<Blob> {
		const response = await stockpileClient.get(`${DOCUMENT_BASE_URL}/${id}/download`);
		return response.blob();
	},

	async deleteDocument(id: string): Promise<void> {
		await stockpileClient.delete(`${DOCUMENT_BASE_URL}/${id}`);
	},

	async getDocumentStats(): Promise<DocumentStats> {
		const response = await stockpileClient.get(`${DOCUMENT_BASE_URL}/stats`);
		return response.json();
	}
};

const NOTIFICATION_BASE_URL = '/notifications';

export const notificationChannelService = {
	async getChannels(): Promise<NotificationChannel[]> {
		const response = await stockpileClient.get(`${NOTIFICATION_BASE_URL}/channels`);
		return response.json();
	},

	async getChannel(id: string): Promise<NotificationChannel> {
		const response = await stockpileClient.get(`${NOTIFICATION_BASE_URL}/channels/${id}`);
		return response.json();
	},

	async updateChannel(id: string, settings: Record<string, unknown>): Promise<NotificationChannel> {
		const response = await stockpileClient.put(`${NOTIFICATION_BASE_URL}/channels/${id}`, { json: { settings } });
		return response.json();
	}
};

export const notificationTemplateService = {
	async createTemplate(data: CreateNotificationTemplateRequest): Promise<NotificationTemplate> {
		const response = await stockpileClient.post(`${NOTIFICATION_BASE_URL}/templates`, { json: data });
		return response.json();
	},

	async updateTemplate(id: string, data: UpdateNotificationTemplateRequest): Promise<NotificationTemplate> {
		const response = await stockpileClient.put(`${NOTIFICATION_BASE_URL}/templates/${id}`, { json: data });
		return response.json();
	},

	async getTemplates(filter?: NotificationFilter): Promise<PaginatedResponse<NotificationTemplate>> {
		const params = new URLSearchParams();

		if (filter) {
			Object.entries(filter).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		const response = await stockpileClient.get(`${NOTIFICATION_BASE_URL}/templates?${params}`);
		return response.json();
	},

	async getTemplate(id: string): Promise<NotificationTemplate> {
		const response = await stockpileClient.get(`${NOTIFICATION_BASE_URL}/templates/${id}`);
		return response.json();
	},

	async deleteTemplate(id: string): Promise<void> {
		await stockpileClient.delete(`${NOTIFICATION_BASE_URL}/templates/${id}`);
	},

	async previewTemplate(id: string, variables: Record<string, unknown>): Promise<{ preview: string }> {
		const response = await stockpileClient.post(`${NOTIFICATION_BASE_URL}/templates/${id}/preview`, {
			json: { variables }
		});
		return response.json();
	}
};

export const notificationService = {
	async sendNotification(data: SendNotificationRequest): Promise<SentNotification> {
		const response = await stockpileClient.post(`${NOTIFICATION_BASE_URL}/send`, { json: data });
		return response.json();
	},

	async getNotifications(filter?: NotificationFilter): Promise<PaginatedResponse<SentNotification>> {
		const params = new URLSearchParams();

		if (filter) {
			Object.entries(filter).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		const response = await stockpileClient.get(`${NOTIFICATION_BASE_URL}?${params}`);
		return response.json();
	},

	async getNotification(id: string): Promise<SentNotification> {
		const response = await stockpileClient.get(`${NOTIFICATION_BASE_URL}/${id}`);
		return response.json();
	},

	async retryNotification(id: string): Promise<SentNotification> {
		const response = await stockpileClient.post(`${NOTIFICATION_BASE_URL}/${id}/retry`);
		return response.json();
	},

	async deleteNotification(id: string): Promise<void> {
		await stockpileClient.delete(`${NOTIFICATION_BASE_URL}/${id}`);
	},

	async getNotificationStats(): Promise<NotificationStats> {
		const response = await stockpileClient.get(`${NOTIFICATION_BASE_URL}/stats`);
		return response.json();
	}
};

export const stockpileConfigService = {
	async getConfig(key?: string): Promise<NotificationConfig | Record<string, NotificationConfig>> {
		const url = key ? `${NOTIFICATION_BASE_URL}/config/${key}` : `${NOTIFICATION_BASE_URL}/config`;
		const response = await stockpileClient.get(url);
		return response.json();
	},

	async updateConfig(key: string, value: Partial<NotificationConfig>): Promise<NotificationConfig> {
		const response = await stockpileClient.put(`${NOTIFICATION_BASE_URL}/config/${key}`, { json: { value } });
		return response.json();
	}
};
