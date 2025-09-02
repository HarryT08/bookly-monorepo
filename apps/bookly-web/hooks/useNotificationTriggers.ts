'use client';

import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useNotification } from './useStockpile';

// Types for automatic notification triggers
interface AutoNotificationConfig {
	enabled: boolean;
	channels: NotificationChannelType[];
	templateId: string;
	delay?: number; // minutes
}

interface NotificationTrigger {
	event: string;
	recipientType: 'requester' | 'approver' | 'responsible' | 'all';
	config: AutoNotificationConfig;
}

interface ReservationChangeEvent {
	reservationId: string;
	previousStatus: string;
	newStatus: string;
	userId: string;
	resourceId: string;
	reason?: string;
}

interface ApprovalChangeEvent {
	requestId: string;
	reservationId: string;
	previousStatus: string;
	newStatus: string;
	processedBy: string;
	requesterUserId: string;
	comments?: string;
}

export enum NotificationEvent {
	// RF-22: Notification events for approval changes
	APPROVAL_REQUEST_SUBMITTED = 'approval_request_submitted',
	APPROVAL_REQUEST_APPROVED = 'approval_request_approved',
	APPROVAL_REQUEST_REJECTED = 'approval_request_rejected',
	APPROVAL_REQUEST_EXPIRED = 'approval_request_expired',

	// RF-28: Notification events for reservation changes
	RESERVATION_CONFIRMED = 'reservation_confirmed',
	RESERVATION_CANCELLED = 'reservation_cancelled',
	RESERVATION_MODIFIED = 'reservation_modified',
	RESERVATION_REMINDER_24H = 'reservation_reminder_24h',
	RESERVATION_REMINDER_1H = 'reservation_reminder_1h',
	RESERVATION_OVERDUE = 'reservation_overdue',

	// Additional events
	MAINTENANCE_SCHEDULED = 'maintenance_scheduled',
	RESOURCE_UNAVAILABLE = 'resource_unavailable',
	CHECK_IN_REQUIRED = 'check_in_required',
	CHECK_OUT_OVERDUE = 'check_out_overdue'
}

export enum NotificationChannelType {
	EMAIL = 'EMAIL',
	SMS = 'SMS',
	WHATSAPP = 'WHATSAPP',
	IN_APP = 'IN_APP',
	PUSH = 'PUSH'
}

/**
 * Hook for managing automatic notification triggers
 * RF-22: Sistema de notificaciones automáticas al solicitante
 * RF-28: Notificaciones automáticas de cambios en reservas
 */
export function useNotificationTriggers() {
	const { sendNotification } = useNotification();
	const { enqueueSnackbar } = useSnackbar();

	// Default notification configurations
	const defaultTriggers: Record<NotificationEvent, NotificationTrigger> = {
		[NotificationEvent.APPROVAL_REQUEST_SUBMITTED]: {
			event: NotificationEvent.APPROVAL_REQUEST_SUBMITTED,
			recipientType: 'approver',
			config: {
				enabled: true,
				channels: [NotificationChannelType.EMAIL, NotificationChannelType.IN_APP],
				templateId: 'approval_request_submitted',
				delay: 0
			}
		},
		[NotificationEvent.APPROVAL_REQUEST_APPROVED]: {
			event: NotificationEvent.APPROVAL_REQUEST_APPROVED,
			recipientType: 'requester',
			config: {
				enabled: true,
				channels: [
					NotificationChannelType.EMAIL,
					NotificationChannelType.WHATSAPP,
					NotificationChannelType.IN_APP
				],
				templateId: 'approval_approved',
				delay: 0
			}
		},
		[NotificationEvent.APPROVAL_REQUEST_REJECTED]: {
			event: NotificationEvent.APPROVAL_REQUEST_REJECTED,
			recipientType: 'requester',
			config: {
				enabled: true,
				channels: [NotificationChannelType.EMAIL, NotificationChannelType.IN_APP],
				templateId: 'approval_rejected',
				delay: 0
			}
		},
		[NotificationEvent.APPROVAL_REQUEST_EXPIRED]: {
			event: NotificationEvent.APPROVAL_REQUEST_EXPIRED,
			recipientType: 'requester',
			config: {
				enabled: true,
				channels: [NotificationChannelType.EMAIL, NotificationChannelType.IN_APP],
				templateId: 'approval_expired',
				delay: 0
			}
		},
		[NotificationEvent.RESERVATION_CONFIRMED]: {
			event: NotificationEvent.RESERVATION_CONFIRMED,
			recipientType: 'requester',
			config: {
				enabled: true,
				channels: [
					NotificationChannelType.EMAIL,
					NotificationChannelType.WHATSAPP,
					NotificationChannelType.IN_APP
				],
				templateId: 'reservation_confirmed',
				delay: 0
			}
		},
		[NotificationEvent.RESERVATION_CANCELLED]: {
			event: NotificationEvent.RESERVATION_CANCELLED,
			recipientType: 'requester',
			config: {
				enabled: true,
				channels: [NotificationChannelType.EMAIL, NotificationChannelType.IN_APP],
				templateId: 'reservation_cancelled',
				delay: 0
			}
		},
		[NotificationEvent.RESERVATION_MODIFIED]: {
			event: NotificationEvent.RESERVATION_MODIFIED,
			recipientType: 'requester',
			config: {
				enabled: true,
				channels: [NotificationChannelType.EMAIL, NotificationChannelType.IN_APP],
				templateId: 'reservation_modified',
				delay: 0
			}
		},
		[NotificationEvent.RESERVATION_REMINDER_24H]: {
			event: NotificationEvent.RESERVATION_REMINDER_24H,
			recipientType: 'requester',
			config: {
				enabled: true,
				channels: [NotificationChannelType.EMAIL, NotificationChannelType.WHATSAPP],
				templateId: 'reservation_reminder_24h',
				delay: 0
			}
		},
		[NotificationEvent.RESERVATION_REMINDER_1H]: {
			event: NotificationEvent.RESERVATION_REMINDER_1H,
			recipientType: 'requester',
			config: {
				enabled: true,
				channels: [NotificationChannelType.WHATSAPP, NotificationChannelType.PUSH],
				templateId: 'reservation_reminder_1h',
				delay: 0
			}
		},
		[NotificationEvent.RESERVATION_OVERDUE]: {
			event: NotificationEvent.RESERVATION_OVERDUE,
			recipientType: 'all',
			config: {
				enabled: true,
				channels: [
					NotificationChannelType.EMAIL,
					NotificationChannelType.WHATSAPP,
					NotificationChannelType.IN_APP
				],
				templateId: 'reservation_overdue',
				delay: 0
			}
		},
		[NotificationEvent.MAINTENANCE_SCHEDULED]: {
			event: NotificationEvent.MAINTENANCE_SCHEDULED,
			recipientType: 'all',
			config: {
				enabled: true,
				channels: [NotificationChannelType.EMAIL, NotificationChannelType.IN_APP],
				templateId: 'maintenance_scheduled',
				delay: 0
			}
		},
		[NotificationEvent.RESOURCE_UNAVAILABLE]: {
			event: NotificationEvent.RESOURCE_UNAVAILABLE,
			recipientType: 'requester',
			config: {
				enabled: true,
				channels: [
					NotificationChannelType.EMAIL,
					NotificationChannelType.WHATSAPP,
					NotificationChannelType.IN_APP
				],
				templateId: 'resource_unavailable',
				delay: 0
			}
		},
		[NotificationEvent.CHECK_IN_REQUIRED]: {
			event: NotificationEvent.CHECK_IN_REQUIRED,
			recipientType: 'requester',
			config: {
				enabled: true,
				channels: [NotificationChannelType.WHATSAPP, NotificationChannelType.PUSH],
				templateId: 'check_in_required',
				delay: 0
			}
		},
		[NotificationEvent.CHECK_OUT_OVERDUE]: {
			event: NotificationEvent.CHECK_OUT_OVERDUE,
			recipientType: 'all',
			config: {
				enabled: true,
				channels: [NotificationChannelType.WHATSAPP, NotificationChannelType.IN_APP],
				templateId: 'check_out_overdue',
				delay: 0
			}
		}
	};

	/**
	 * Trigger automatic notification for approval changes
	 * RF-22: Sistema de notificaciones automáticas al solicitante
	 */
	const triggerApprovalNotification = useCallback(
		async (event: ApprovalChangeEvent, notificationEvent: NotificationEvent) => {
			try {
				const trigger = defaultTriggers[notificationEvent];

				if (!trigger.config.enabled) return;

				const notificationData = {
					templateId: trigger.config.templateId,
					reservationId: event.reservationId,
					recipientId: event.requesterUserId,
					variables: {
						requestId: event.requestId,
						reservationId: event.reservationId,
						previousStatus: event.previousStatus,
						newStatus: event.newStatus,
						processedBy: event.processedBy,
						comments: event.comments || 'No comments provided',
						timestamp: new Date().toISOString()
					} as unknown as Record<string, never>
				};

				await sendNotification(notificationData);

				enqueueSnackbar(`Automatic notification sent for ${notificationEvent}`, {
					variant: 'success'
				});
			} catch (error) {
				console.error(`Failed to send automatic notification for ${notificationEvent}:`, error);
				enqueueSnackbar(`Failed to send automatic notification`, {
					variant: 'error'
				});
			}
		},
		[sendNotification, enqueueSnackbar]
	);

	/**
	 * Trigger automatic notification for reservation changes
	 * RF-28: Notificaciones automáticas de cambios en reservas
	 */
	const triggerReservationNotification = useCallback(
		async (event: ReservationChangeEvent, notificationEvent: NotificationEvent) => {
			try {
				const trigger = defaultTriggers[notificationEvent];

				if (!trigger.config.enabled) return;

				const notificationData = {
					reservationId: event.reservationId,
					recipientId: event.userId,
					channels: trigger.config.channels,
					templateId: trigger.config.templateId,
					variables: {
						reservationId: event.reservationId,
						resourceId: event.resourceId,
						previousStatus: event.previousStatus,
						newStatus: event.newStatus,
						reason: event.reason || 'No reason provided',
						timestamp: new Date().toISOString()
					},
					priority:
						notificationEvent.includes('overdue') || notificationEvent.includes('cancelled')
							? 'HIGH'
							: 'NORMAL',
					scheduledFor: trigger.config.delay ? new Date(Date.now() + trigger.config.delay * 60000) : undefined
				};

				await sendNotification(notificationData);

				enqueueSnackbar(`Automatic notification sent for ${notificationEvent}`, {
					variant: 'success'
				});
			} catch (error) {
				console.error(`Failed to send automatic notification for ${notificationEvent}:`, error);
				enqueueSnackbar(`Failed to send automatic notification`, {
					variant: 'error'
				});
			}
		},
		[sendNotification, enqueueSnackbar]
	);

	/**
	 * Handle approval status change and trigger appropriate notifications
	 */
	const handleApprovalStatusChange = useCallback(
		async (
			requestId: string,
			reservationId: string,
			previousStatus: string,
			newStatus: string,
			processedBy: string,
			requesterUserId: string,
			comments?: string
		) => {
			const event: ApprovalChangeEvent = {
				requestId,
				reservationId,
				previousStatus,
				newStatus,
				processedBy,
				requesterUserId,
				comments
			};

			switch (newStatus) {
				case 'APPROVED':
					await triggerApprovalNotification(event, NotificationEvent.APPROVAL_REQUEST_APPROVED);
					break;
				case 'REJECTED':
					await triggerApprovalNotification(event, NotificationEvent.APPROVAL_REQUEST_REJECTED);
					break;
				case 'EXPIRED':
					await triggerApprovalNotification(event, NotificationEvent.APPROVAL_REQUEST_EXPIRED);
					break;
			}

			// If approved, also trigger reservation confirmation
			if (newStatus === 'APPROVED') {
				const reservationEvent: ReservationChangeEvent = {
					reservationId,
					previousStatus: 'PENDING_APPROVAL',
					newStatus: 'CONFIRMED',
					userId: requesterUserId,
					resourceId: '', // Should be provided by the calling component
					reason: 'Approval granted'
				};
				await triggerReservationNotification(reservationEvent, NotificationEvent.RESERVATION_CONFIRMED);
			}
		},
		[triggerApprovalNotification, triggerReservationNotification]
	);

	/**
	 * Schedule reminder notifications
	 */
	const scheduleReservationReminders = useCallback(
		async (reservationId: string, userId: string, resourceId: string, startTime: Date) => {
			const now = new Date();
			const reservation24h = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
			const reservation1h = new Date(startTime.getTime() - 60 * 60 * 1000);

			// Schedule 24h reminder
			if (reservation24h > now) {
				const event: ReservationChangeEvent = {
					reservationId,
					previousStatus: 'CONFIRMED',
					newStatus: 'CONFIRMED',
					userId,
					resourceId,
					reason: '24 hour reminder'
				};

				// Note: In a real implementation, this would be scheduled server-side
				setTimeout(async () => {
					await triggerReservationNotification(event, NotificationEvent.RESERVATION_REMINDER_24H);
				}, reservation24h.getTime() - now.getTime());
			}

			// Schedule 1h reminder
			if (reservation1h > now) {
				const event: ReservationChangeEvent = {
					reservationId,
					previousStatus: 'CONFIRMED',
					newStatus: 'CONFIRMED',
					userId,
					resourceId,
					reason: '1 hour reminder'
				};

				// Note: In a real implementation, this would be scheduled server-side
				setTimeout(async () => {
					await triggerReservationNotification(event, NotificationEvent.RESERVATION_REMINDER_1H);
				}, reservation1h.getTime() - now.getTime());
			}
		},
		[triggerReservationNotification]
	);

	/**
	 * Get notification trigger configuration
	 */
	const getTriggerConfig = useCallback((event: NotificationEvent): NotificationTrigger => {
		return defaultTriggers[event];
	}, []);

	/**
	 * Update notification trigger configuration
	 */
	const updateTriggerConfig = useCallback(
		async (event: NotificationEvent, config: Partial<AutoNotificationConfig>): Promise<boolean> => {
			try {
				// In a real implementation, this would update the configuration in the backend
				defaultTriggers[event].config = {
					...defaultTriggers[event].config,
					...config
				};

				enqueueSnackbar(`Notification trigger updated for ${event}`, {
					variant: 'success'
				});
				return true;
			} catch (error) {
				console.error(`Failed to update trigger config for ${event}:`, error);
				enqueueSnackbar(`Failed to update notification trigger`, {
					variant: 'error'
				});
				return false;
			}
		},
		[enqueueSnackbar]
	);

	return {
		// Event handlers
		handleApprovalStatusChange,
		scheduleReservationReminders,
		triggerApprovalNotification,
		triggerReservationNotification,

		// Configuration
		getTriggerConfig,
		updateTriggerConfig,

		// Constants
		NotificationEvent,
		NotificationChannelType
	};
}

export default useNotificationTriggers;
