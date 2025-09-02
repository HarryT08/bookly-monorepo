/**
 * React hooks for WebSocket integration with Redux store
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { wsClient } from './client';
import type { BooklyEvent } from './types';

/**
 * Hook to manage WebSocket connection lifecycle
 */
export const useWebSocket = () => {
	const { token, isAuthenticated, user } = useAppSelector((state) => state.auth);

	const connect = useCallback(() => {
		if (isAuthenticated && token) {
			wsClient.connect(token);

			// Join user-specific room for notifications
			if (user?.id) {
				wsClient.joinUserRoom(user.id);
			}
		}
	}, [isAuthenticated, token, user?.id]);

	const disconnect = useCallback(() => {
		wsClient.disconnect();
	}, []);

	useEffect(() => {
		if (isAuthenticated && token) {
			connect();
		} else {
			disconnect();
		}

		return () => {
			disconnect();
		};
	}, [isAuthenticated, token, connect, disconnect]);

	return {
		connect,
		disconnect,
		isConnected: wsClient.isConnected()
	};
};

/**
 * Hook to listen for reservation events
 */
export const useReservationEvents = () => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		const handleReservationCreated = (_data: BooklyEvent) => {
			// TODO: Dispatch action to update reservations list
			// dispatch(addReservation(data));
		};

		const handleReservationUpdated = (_data: BooklyEvent) => {
			// TODO: Dispatch action to update reservation
			// dispatch(updateReservation(data));
		};

		const handleReservationCancelled = (_data: BooklyEvent) => {
			// TODO: Dispatch action to remove reservation
			// dispatch(removeReservation(data.eventId));
		};

		const handleReservationApproved = (_data: BooklyEvent) => {
			// TODO: Dispatch action to update reservation status
			// dispatch(updateReservationStatus({ id: data.eventId, status: 'approved' }));
		};

		const handleReservationRejected = (_data: BooklyEvent) => {
			// TODO: Dispatch action to update reservation status
			// dispatch(updateReservationStatus({ id: data.eventId, status: 'rejected' }));
		};

		wsClient.on('reservation:created', handleReservationCreated);
		wsClient.on('reservation:updated', handleReservationUpdated);
		wsClient.on('reservation:cancelled', handleReservationCancelled);
		wsClient.on('reservation:approved', handleReservationApproved);
		wsClient.on('reservation:rejected', handleReservationRejected);

		return () => {
			wsClient.off('reservation:created', handleReservationCreated);
			wsClient.off('reservation:updated', handleReservationUpdated);
			wsClient.off('reservation:cancelled', handleReservationCancelled);
			wsClient.off('reservation:approved', handleReservationApproved);
			wsClient.off('reservation:rejected', handleReservationRejected);
		};
	}, [dispatch]);
};

/**
 * Hook to listen for resource events
 */
export const useResourceEvents = () => {
	useEffect(() => {
		const handleResourceUpdated = (_data: BooklyEvent) => {
			// TODO: Dispatch action to update resource
			// dispatch(updateResource(data));
		};

		const handleResourceMaintenance = (_data: BooklyEvent) => {
			// TODO: Dispatch action to set resource maintenance
			// dispatch(setResourceMaintenance(data));
		};

		const handleResourceUnavailable = (_data: BooklyEvent) => {
			// TODO: Dispatch action to set resource unavailable
			// dispatch(setResourceUnavailable(data));
		};

		wsClient.on('resource:updated', handleResourceUpdated);
		wsClient.on('resource:maintenance', handleResourceMaintenance);
		wsClient.on('resource:unavailable', handleResourceUnavailable);

		return () => {
			wsClient.off('resource:updated', handleResourceUpdated);
			wsClient.off('resource:maintenance', handleResourceMaintenance);
			wsClient.off('resource:unavailable', handleResourceUnavailable);
		};
	}, []);
};

/**
 * Hook to listen for notification events
 */
export const useNotificationEvents = () => {
	useEffect(() => {
		const handleNewNotification = (data: BooklyEvent) => {
			// TODO: Dispatch action to add notification
			// dispatch(addNotification(data));

			// Show browser notification if permission granted
			if (Notification.permission === 'granted' && 'title' in data && 'message' in data) {
				new Notification(String(data.title), {
					body: String(data.message),
					icon: '/favicon.ico'
				});
			}
		};

		const handleNotificationRead = (_data: BooklyEvent) => {
			// TODO: Dispatch action to mark notification as read
			// dispatch(markNotificationAsRead(data.eventId));
		};

		wsClient.on('notification:new', handleNewNotification);
		wsClient.on('notification:read', handleNotificationRead);

		return () => {
			wsClient.off('notification:new', handleNewNotification);
			wsClient.off('notification:read', handleNotificationRead);
		};
	}, []);
};

/**
 * Hook to manage room subscriptions
 */
export const useRoomSubscription = (
	roomId: string,
	roomType: 'user' | 'resource' | 'global' = 'global',
	enabled = true
) => {
	useEffect(() => {
		if (enabled && roomId && wsClient.isConnected()) {
			const subscription = { roomType, roomId };
			wsClient.joinRoom(subscription);

			return () => {
				wsClient.leaveRoom(subscription);
			};
		}
	}, [roomId, roomType, enabled]);
};

/**
 * Hook to subscribe to specific resource updates
 */
export const useResourceSubscription = (resourceId: string) => {
	useRoomSubscription(resourceId, 'resource', !!resourceId);
};

/**
 * Hook to subscribe to specific reservation updates
 */
export const useReservationSubscription = (reservationId: string) => {
	useRoomSubscription(`reservation:${reservationId}`, 'global', !!reservationId);
};
