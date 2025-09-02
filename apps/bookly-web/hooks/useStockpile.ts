'use client';

import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import {
	// Services
	approvalFlowService,
	approvalRequestService,
	documentTemplateService,
	documentGenerationService,
	notificationTemplateService,
	notificationService,
	notificationChannelService,
	// Types
	ApprovalFlow,
	ApprovalRequest,
	DocumentTemplate,
	GeneratedDocument,
	NotificationTemplate,
	SentNotification,
	NotificationChannel,
	CreateApprovalFlowRequest,
	UpdateApprovalFlowRequest,
	ProcessApprovalRequest,
	CreateDocumentTemplateRequest,
	UpdateDocumentTemplateRequest,
	GenerateDocumentRequest,
	CreateNotificationTemplateRequest,
	UpdateNotificationTemplateRequest,
	SendNotificationRequest,
	ApprovalRequestFilter,
	ApprovalFlowFilter,
	DocumentFilter,
	NotificationFilter,
	PaginatedResponse,
	ReservationApprovalStatus,
	ApprovalDashboardStats,
	DocumentStats,
	NotificationStats
} from '@services/stockpile';

// ================================
// RF-20: Approval Flow Hooks
// ================================

export function useApprovalFlow() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const createApprovalFlow = useCallback(
		async (data: CreateApprovalFlowRequest): Promise<ApprovalFlow | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await approvalFlowService.createApprovalFlow(data);
				enqueueSnackbar('Approval flow created successfully', { variant: 'success' });
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to create approval flow';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const updateApprovalFlow = useCallback(
		async (id: string, data: UpdateApprovalFlowRequest): Promise<ApprovalFlow | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await approvalFlowService.updateApprovalFlow(id, data);
				enqueueSnackbar('Approval flow updated successfully', { variant: 'success' });
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to update approval flow';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const getApprovalFlows = useCallback(
		async (filter?: ApprovalFlowFilter): Promise<PaginatedResponse<ApprovalFlow> | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await approvalFlowService.getApprovalFlows(filter);
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to fetch approval flows';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const getApprovalFlow = useCallback(
		async (id: string): Promise<ApprovalFlow | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await approvalFlowService.getApprovalFlow(id);
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to fetch approval flow';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const deleteApprovalFlow = useCallback(
		async (id: string): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				await approvalFlowService.deleteApprovalFlow(id);
				enqueueSnackbar('Approval flow deleted successfully', { variant: 'success' });
				return true;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to delete approval flow';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return false;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	return {
		loading,
		error,
		createApprovalFlow,
		updateApprovalFlow,
		getApprovalFlows,
		getApprovalFlow,
		deleteApprovalFlow
	};
}

export function useApprovalRequest() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const getPendingRequests = useCallback(
		async (filter?: ApprovalRequestFilter): Promise<PaginatedResponse<ApprovalRequest> | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await approvalRequestService.getPendingRequests(filter);
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to fetch pending requests';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const processRequest = useCallback(
		async (requestId: string, data: ProcessApprovalRequest): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				await approvalRequestService.processRequest(requestId, data);
				const actionText =
					data.action === 'APPROVE' ? 'approved' : data.action === 'REJECT' ? 'rejected' : 'updated';
				enqueueSnackbar(`Request ${actionText} successfully`, { variant: 'success' });
				return true;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to process request';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return false;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const getRequestsByReservation = useCallback(
		async (reservationId: string): Promise<ApprovalRequest[] | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await approvalRequestService.getRequestsByReservation(reservationId);
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to fetch reservation requests';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const getReservationStatus = useCallback(
		async (reservationId: string): Promise<ReservationApprovalStatus | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await approvalRequestService.getReservationStatus(reservationId);
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to fetch reservation status';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const cancelReservation = useCallback(
		async (reservationId: string, reason?: string): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				await approvalRequestService.cancelReservation(reservationId, reason);
				enqueueSnackbar('Reservation cancelled successfully', { variant: 'success' });
				return true;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to cancel reservation';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return false;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const getDashboardStats = useCallback(async (): Promise<ApprovalDashboardStats | null> => {
		setLoading(true);
		setError(null);
		try {
			const result = await approvalRequestService.getDashboardStats();
			return result;
		} catch (err: unknown) {
			const message = (err instanceof Error ? err.message : null) || 'Failed to fetch dashboard stats';
			setError(message);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		loading,
		error,
		getPendingRequests,
		processRequest,
		getRequestsByReservation,
		getReservationStatus,
		cancelReservation,
		getDashboardStats
	};
}

// ================================
// RF-21: Document Generation Hooks
// ================================

export function useDocumentTemplate() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const createTemplate = useCallback(
		async (data: CreateDocumentTemplateRequest): Promise<DocumentTemplate | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await documentTemplateService.createTemplate(data);
				enqueueSnackbar('Document template created successfully', { variant: 'success' });
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to create document template';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const updateTemplate = useCallback(
		async (id: string, data: UpdateDocumentTemplateRequest): Promise<DocumentTemplate | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await documentTemplateService.updateTemplate(id, data);
				enqueueSnackbar('Document template updated successfully', { variant: 'success' });
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to update document template';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const getTemplates = useCallback(
		async (filter?: DocumentFilter): Promise<PaginatedResponse<DocumentTemplate> | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await documentTemplateService.getTemplates(filter);
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to fetch document templates';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const getTemplate = useCallback(
		async (id: string): Promise<DocumentTemplate | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await documentTemplateService.getTemplate(id);
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to fetch document template';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const deleteTemplate = useCallback(
		async (id: string): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				await documentTemplateService.deleteTemplate(id);
				enqueueSnackbar('Document template deleted successfully', { variant: 'success' });
				return true;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to delete document template';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return false;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const previewTemplate = useCallback(
		async (
			id: string,
			variables: Record<string, unknown>
		): Promise<{ content: string; fileName: string } | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await documentTemplateService.previewTemplate(id, variables);
				// Transform the result to match the expected return type
				return {
					content: result.preview || '',
					fileName: `template-${id}-preview.html`
				};
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to preview template';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	return {
		loading,
		error,
		createTemplate,
		updateTemplate,
		getTemplates,
		getTemplate,
		deleteTemplate,
		previewTemplate
	};
}

export function useDocumentGeneration() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const generateDocument = useCallback(
		async (data: GenerateDocumentRequest): Promise<GeneratedDocument | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await documentGenerationService.generateDocument(data);
				enqueueSnackbar('Document generated successfully', { variant: 'success' });
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to generate document';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const getDocuments = useCallback(
		async (filter?: DocumentFilter): Promise<PaginatedResponse<GeneratedDocument> | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await documentGenerationService.getDocuments(filter);
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to fetch documents';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const downloadDocument = useCallback(
		async (id: string, fileName?: string): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				const blob = await documentGenerationService.downloadDocument(id);

				// Create download link
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = fileName || `document-${id}.pdf`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);

				enqueueSnackbar('Document downloaded successfully', { variant: 'success' });
				return true;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to download document';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return false;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const deleteDocument = useCallback(
		async (id: string): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				await documentGenerationService.deleteDocument(id);
				enqueueSnackbar('Document deleted successfully', { variant: 'success' });
				return true;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to delete document';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return false;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const getDocumentStats = useCallback(async (): Promise<DocumentStats | null> => {
		setLoading(true);
		setError(null);
		try {
			const result = await documentGenerationService.getDocumentStats();
			return result;
		} catch (err: unknown) {
			const message = (err instanceof Error ? err.message : null) || 'Failed to fetch document stats';
			setError(message);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		loading,
		error,
		generateDocument,
		getDocuments,
		downloadDocument,
		deleteDocument,
		getDocumentStats
	};
}

// ================================
// RF-22: Notification Hooks
// ================================

export function useNotificationTemplate() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const createTemplate = useCallback(
		async (data: CreateNotificationTemplateRequest): Promise<NotificationTemplate | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await notificationTemplateService.createTemplate(data);
				enqueueSnackbar('Notification template created successfully', { variant: 'success' });
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to create notification template';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const updateTemplate = useCallback(
		async (id: string, data: UpdateNotificationTemplateRequest): Promise<NotificationTemplate | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await notificationTemplateService.updateTemplate(id, data);
				enqueueSnackbar('Notification template updated successfully', { variant: 'success' });
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to update notification template';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const getTemplates = useCallback(
		async (filter?: NotificationFilter): Promise<PaginatedResponse<NotificationTemplate> | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await notificationTemplateService.getTemplates(filter);
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to fetch notification templates';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const getTemplate = useCallback(
		async (id: string): Promise<NotificationTemplate | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await notificationTemplateService.getTemplate(id);
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to fetch notification template';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const deleteTemplate = useCallback(
		async (id: string): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				await notificationTemplateService.deleteTemplate(id);
				enqueueSnackbar('Notification template deleted successfully', { variant: 'success' });
				return true;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to delete notification template';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return false;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const previewTemplate = useCallback(
		async (
			id: string,
			variables: Record<string, unknown>
		): Promise<{ subject?: string; content: string } | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await notificationTemplateService.previewTemplate(id, variables);
				return { content: result.preview, subject: 'Documento generado' };
			} catch (err: unknown) {
				const message =
					(err instanceof Error ? err.message : null) || 'Failed to preview notification template';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	return {
		loading,
		error,
		createTemplate,
		updateTemplate,
		getTemplates,
		getTemplate,
		deleteTemplate,
		previewTemplate
	};
}

export function useNotification() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const sendNotification = useCallback(
		async (data: SendNotificationRequest): Promise<SentNotification | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await notificationService.sendNotification(data);
				enqueueSnackbar('Notification sent successfully', { variant: 'success' });
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to send notification';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const getNotifications = useCallback(
		async (filter?: NotificationFilter): Promise<PaginatedResponse<SentNotification> | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await notificationService.getNotifications(filter);
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to fetch notifications';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const retryNotification = useCallback(
		async (id: string): Promise<SentNotification | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await notificationService.retryNotification(id);
				enqueueSnackbar('Notification retried successfully', { variant: 'success' });
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to retry notification';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const getNotificationStats = useCallback(async (): Promise<NotificationStats | null> => {
		setLoading(true);
		setError(null);
		try {
			const result = await notificationService.getNotificationStats();
			return result;
		} catch (err: unknown) {
			const message = (err instanceof Error ? err.message : null) || 'Failed to fetch notification stats';
			setError(message);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	const deleteNotification = useCallback(
		async (id: string): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				await notificationService.deleteNotification(id);
				enqueueSnackbar('Notification deleted successfully', { variant: 'success' });
				return true;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to delete notification';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return false;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	return {
		loading,
		error,
		sendNotification,
		getNotifications,
		retryNotification,
		deleteNotification,
		getNotificationStats
	};
}

export function useNotificationChannel() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const getChannels = useCallback(async (): Promise<NotificationChannel[] | null> => {
		setLoading(true);
		setError(null);
		try {
			const result = await notificationChannelService.getChannels();
			return result;
		} catch (err: unknown) {
			const message = (err instanceof Error ? err.message : null) || 'Failed to fetch notification channels';
			setError(message);
			enqueueSnackbar(message, { variant: 'error' });
			return null;
		} finally {
			setLoading(false);
		}
	}, [enqueueSnackbar]);

	const getChannel = useCallback(
		async (id: string): Promise<NotificationChannel | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await notificationChannelService.getChannel(id);
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to fetch notification channel';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	const updateChannel = useCallback(
		async (id: string, settings: Record<string, unknown>): Promise<NotificationChannel | null> => {
			setLoading(true);
			setError(null);
			try {
				const result = await notificationChannelService.updateChannel(id, settings);
				enqueueSnackbar('Notification channel updated successfully', { variant: 'success' });
				return result;
			} catch (err: unknown) {
				const message = (err instanceof Error ? err.message : null) || 'Failed to update notification channel';
				setError(message);
				enqueueSnackbar(message, { variant: 'error' });
				return null;
			} finally {
				setLoading(false);
			}
		},
		[enqueueSnackbar]
	);

	return {
		loading,
		error,
		getChannels,
		getChannel,
		updateChannel
	};
}
