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
	ApprovalDashboardStats,
	DocumentTemplate,
	GeneratedDocument,
	DocumentFilter,
	DocumentStats,
	CreateDocumentTemplateRequest,
	UpdateDocumentTemplateRequest,
	GenerateDocumentRequest,
	NotificationChannel,
	NotificationTemplate,
	NotificationConfig,
	SentNotification,
	NotificationStats,
	CreateNotificationTemplateRequest,
	UpdateNotificationTemplateRequest,
	SendNotificationRequest,
	GetNotificationTemplatesRequest,
	NotificationFilter
} from './types';

const APPROVAL_BASE_URL = '/approval-flows';

export const approvalFlowService = {
	async createApprovalFlow(data: CreateApprovalFlowRequest): Promise<ApprovalFlow> {
		const response = await stockpileClient.post<ApprovalFlow>(`${APPROVAL_BASE_URL}/flows`, data);
		return response.data;
	},

	async updateApprovalFlow(id: string, data: UpdateApprovalFlowRequest): Promise<ApprovalFlow> {
		const response = await stockpileClient.put<ApprovalFlow>(`${APPROVAL_BASE_URL}/flows/${id}`, data);
		return response.data;
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

		const response = await stockpileClient.get<PaginatedResponse<ApprovalFlow>>(
			`${APPROVAL_BASE_URL}/flows?${params.toString()}`
		);
		return response.data;
	},

	async getApprovalFlow(id: string): Promise<ApprovalFlow> {
		const response = await stockpileClient.get<ApprovalFlow>(`${APPROVAL_BASE_URL}/flows/${id}`);
		return response.data;
	},

	async deleteApprovalFlow(id: string): Promise<void> {
		await stockpileClient.delete(`${APPROVAL_BASE_URL}/flows/${id}`);
	},

	async addApprovalLevel(flowId: string, data: CreateApprovalLevelRequest): Promise<ApprovalLevel> {
		const response = await stockpileClient.post<ApprovalLevel>(`${APPROVAL_BASE_URL}/flows/${flowId}/levels`, data);
		return response.data;
	},

	async updateApprovalLevel(
		flowId: string,
		levelId: string,
		data: Partial<CreateApprovalLevelRequest>
	): Promise<ApprovalLevel> {
		const response = await stockpileClient.put<ApprovalLevel>(
			`${APPROVAL_BASE_URL}/flows/${flowId}/levels/${levelId}`,
			data
		);
		return response.data;
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

		const response = await stockpileClient.get<PaginatedResponse<ApprovalRequest>>(
			`${APPROVAL_BASE_URL}/requests/pending?${params}`
		);
		return response.data;
	},

	async processRequest(requestId: string, data: ProcessApprovalRequest): Promise<ApprovalRequest> {
		const response = await stockpileClient.post<ApprovalRequest>(
			`${APPROVAL_BASE_URL}/requests/${requestId}/process`,
			data
		);
		return response.data;
	},

	async getRequestsByReservation(reservationId: string): Promise<ApprovalRequest[]> {
		const response = await stockpileClient.get<ApprovalRequest[]>(
			`${APPROVAL_BASE_URL}/requests/reservation/${reservationId}`
		);
		return response.data;
	},

	async getReservationStatus(reservationId: string): Promise<ReservationApprovalStatus> {
		const response = await stockpileClient.get<ReservationApprovalStatus>(
			`${APPROVAL_BASE_URL}/status/${reservationId}`
		);
		return response.data;
	},

	async cancelReservation(reservationId: string, reason?: string): Promise<void> {
		const data = reason ? { reason } : {};
		await stockpileClient.post(`${APPROVAL_BASE_URL}/cancel/${reservationId}`, data);
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

		const response = await stockpileClient.get<PaginatedResponse<ApprovalRequest>>(
			`${APPROVAL_BASE_URL}/requests/history?${params}`
		);
		return response.data;
	},

	async getDashboardStats(): Promise<ApprovalDashboardStats> {
		const response = await stockpileClient.get<ApprovalDashboardStats>(`${APPROVAL_BASE_URL}/stats/dashboard`);
		return response.data;
	}
};

const DOCUMENT_BASE_URL = '/documents';

export const documentTemplateService = {
	async createTemplate(data: CreateDocumentTemplateRequest): Promise<DocumentTemplate> {
		const response = await stockpileClient.post<DocumentTemplate>(`${DOCUMENT_BASE_URL}/templates`, data);
		return response.data;
	},

	async updateTemplate(id: string, data: UpdateDocumentTemplateRequest): Promise<DocumentTemplate> {
		const response = await stockpileClient.put<DocumentTemplate>(`${DOCUMENT_BASE_URL}/templates/${id}`, data);
		return response.data;
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

		const response = await stockpileClient.get<PaginatedResponse<DocumentTemplate>>(
			`${DOCUMENT_BASE_URL}/templates?${params}`
		);
		return response.data;
	},

	async getTemplate(id: string): Promise<DocumentTemplate> {
		const response = await stockpileClient.get<DocumentTemplate>(`${DOCUMENT_BASE_URL}/templates/${id}`);
		return response.data;
	},

	async deleteTemplate(id: string): Promise<void> {
		await stockpileClient.delete(`${DOCUMENT_BASE_URL}/templates/${id}`);
	},

	async previewTemplate(id: string, variables: Record<string, unknown>): Promise<{ preview: string }> {
		const response = await stockpileClient.post<{ preview: string }>(
			`${DOCUMENT_BASE_URL}/templates/${id}/preview`,
			{ variables }
		);
		return response.data;
	}
};

export const documentGenerationService = {
	async generateDocument(data: GenerateDocumentRequest): Promise<GeneratedDocument> {
		const response = await stockpileClient.post<GeneratedDocument>(`${DOCUMENT_BASE_URL}/generate`, data);
		return response.data;
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

		const response = await stockpileClient.get<PaginatedResponse<GeneratedDocument>>(
			`${DOCUMENT_BASE_URL}?${params}`
		);
		return response.data;
	},

	async getDocument(id: string): Promise<GeneratedDocument> {
		const response = await stockpileClient.get<GeneratedDocument>(`${DOCUMENT_BASE_URL}/${id}`);
		return response.data;
	},

	async downloadDocument(id: string): Promise<Blob> {
		const response = await stockpileClient.get<Blob>(`${DOCUMENT_BASE_URL}/${id}/download`);
		return response.data;
	},

	async deleteDocument(id: string): Promise<void> {
		await stockpileClient.delete(`${DOCUMENT_BASE_URL}/${id}`);
	},

	async getDocumentStats(): Promise<DocumentStats> {
		const response = await stockpileClient.get<DocumentStats>(`${DOCUMENT_BASE_URL}/stats`);
		return response.data;
	}
};

const NOTIFICATION_BASE_URL = '/notifications';

export const notificationChannelService = {
	async getChannels(): Promise<NotificationChannel[]> {
		const response = await stockpileClient.get<NotificationChannel[]>(`${NOTIFICATION_BASE_URL}/channels`);
		return response.data;
	},

	async getChannel(id: string): Promise<NotificationChannel> {
		const response = await stockpileClient.get<NotificationChannel>(`${NOTIFICATION_BASE_URL}/channels/${id}`);
		return response.data;
	},

	async updateChannel(id: string, settings: Record<string, unknown>): Promise<NotificationChannel> {
		const response = await stockpileClient.put<NotificationChannel>(`${NOTIFICATION_BASE_URL}/channels/${id}`, {
			settings
		});
		return response.data;
	}
};

export const notificationTemplateService = {
	async createTemplate(data: CreateNotificationTemplateRequest): Promise<NotificationTemplate> {
		const response = await stockpileClient.post<NotificationTemplate>(`${NOTIFICATION_BASE_URL}/templates`, data);
		return response.data;
	},

	async updateTemplate(id: string, data: UpdateNotificationTemplateRequest): Promise<NotificationTemplate> {
		const response = await stockpileClient.put<NotificationTemplate>(
			`${NOTIFICATION_BASE_URL}/templates/${id}`,
			data
		);
		return response.data;
	},

	async getTemplates(filters?: GetNotificationTemplatesRequest): Promise<PaginatedResponse<NotificationTemplate>> {
		const params = new URLSearchParams();

		if (filters?.channel) params.append('channel', filters.channel);

		if (filters?.eventType) params.append('eventType', filters.eventType);

		if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

		if (filters?.resourceType) params.append('resourceType', filters.resourceType);

		if (filters?.categoryId) params.append('categoryId', filters.categoryId);

		if (filters?.page) params.append('page', filters.page.toString());

		if (filters?.limit) params.append('limit', filters.limit.toString());

		const response = await stockpileClient.get<PaginatedResponse<NotificationTemplate>>(
			`${NOTIFICATION_BASE_URL}/templates?${params}`
		);
		return response.data;
	},

	async getTemplate(id: string): Promise<NotificationTemplate> {
		const response = await stockpileClient.get<NotificationTemplate>(`${NOTIFICATION_BASE_URL}/templates/${id}`);
		return response.data;
	},

	async deleteTemplate(id: string): Promise<void> {
		await stockpileClient.delete(`${NOTIFICATION_BASE_URL}/templates/${id}`);
	},

	async previewTemplate(id: string, variables: Record<string, unknown>): Promise<{ preview: string }> {
		const response = await stockpileClient.post<{ preview: string }>(
			`${NOTIFICATION_BASE_URL}/templates/${id}/preview`,
			{ variables }
		);
		return response.data;
	}
};

export const notificationService = {
	async sendNotification(data: SendNotificationRequest): Promise<SentNotification> {
		const response = await stockpileClient.post<SentNotification>(`${NOTIFICATION_BASE_URL}/send`, data);
		return response.data;
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

		const response = await stockpileClient.get<PaginatedResponse<SentNotification>>(
			`${NOTIFICATION_BASE_URL}?${params}`
		);
		return response.data;
	},

	async getNotification(id: string): Promise<SentNotification> {
		const response = await stockpileClient.get<SentNotification>(`${NOTIFICATION_BASE_URL}/${id}`);
		return response.data;
	},

	async retryNotification(id: string): Promise<SentNotification> {
		const response = await stockpileClient.post<SentNotification>(`${NOTIFICATION_BASE_URL}/${id}/retry`);
		return response.data;
	},

	async deleteNotification(id: string): Promise<void> {
		await stockpileClient.delete(`${NOTIFICATION_BASE_URL}/${id}`);
	},

	async getNotificationStats(): Promise<NotificationStats> {
		const response = await stockpileClient.get<NotificationStats>(`${NOTIFICATION_BASE_URL}/stats`);
		return response.data;
	}
};

export const stockpileConfigService = {
	async getConfig(key?: string): Promise<NotificationConfig | Record<string, NotificationConfig>> {
		const url = key ? `${NOTIFICATION_BASE_URL}/config/${key}` : `${NOTIFICATION_BASE_URL}/config`;
		const response = await stockpileClient.get<NotificationConfig | Record<string, NotificationConfig>>(url);
		return response.data;
	},

	async updateConfig(key: string, value: Partial<NotificationConfig>): Promise<NotificationConfig> {
		const response = await stockpileClient.put<NotificationConfig>(`${NOTIFICATION_BASE_URL}/config/${key}`, {
			value
		});
		return response.data;
	}
};
