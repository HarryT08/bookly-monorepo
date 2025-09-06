/**
 * Custom hook for waiting list operations (RF-14)
 * Provides state management and operations for resource waiting lists
 */

import { useState, useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
	WaitlistEntry,
	WaitlistQuery,
	JoinWaitlistRequest,
	WaitlistNotification,
	WaitlistStatus,
	NotificationStatus
} from '@services/availability/types';
import {
	waitlistService,
	mockWaitlistEntries,
	mockWaitlistNotifications
} from '@services/availability/waitlistService';

interface UseWaitlistState {
	myEntries: WaitlistEntry[];
	resourceEntries: WaitlistEntry[];
	notifications: WaitlistNotification[];
	loading: {
		join: boolean;
		entries: boolean;
		notifications: boolean;
		cancel: boolean;
		respond: boolean;
	};
	error: string | null;
}

interface UseWaitlistReturn extends UseWaitlistState {
	joinWaitlist: (request: JoinWaitlistRequest) => Promise<boolean>;
	loadMyEntries: (query?: WaitlistQuery) => Promise<void>;
	loadResourceEntries: (resourceId: string, query?: WaitlistQuery) => Promise<void>;
	cancelEntry: (entryId: string) => Promise<boolean>;
	updateEntry: (entryId: string, updates: Partial<WaitlistEntry>) => Promise<boolean>;
	getPosition: (entryId: string) => Promise<{ position: number; estimatedWaitTime?: number } | null>;
	respondToNotification: (notificationId: string, response: 'ACCEPT' | 'DECLINE') => Promise<boolean>;
	loadNotifications: () => Promise<void>;
	refreshData: () => Promise<void>;
}

const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

export function useWaitlist(): UseWaitlistReturn {
	const { enqueueSnackbar } = useSnackbar();

	const [state, setState] = useState<UseWaitlistState>({
		myEntries: [],
		resourceEntries: [],
		notifications: [],
		loading: {
			join: false,
			entries: false,
			notifications: false,
			cancel: false,
			respond: false
		},
		error: null
	});

	const setLoading = useCallback((key: keyof UseWaitlistState['loading'], value: boolean) => {
		setState((prev) => ({
			...prev,
			loading: { ...prev.loading, [key]: value }
		}));
	}, []);

	const setError = useCallback((error: string | null) => {
		setState((prev) => ({ ...prev, error }));
	}, []);

	const joinWaitlist = useCallback(
		async (request: JoinWaitlistRequest): Promise<boolean> => {
			try {
				setLoading('join', true);
				setError(null);

				if (USE_MOCK_DATA) {
					// Mock implementation
					const newEntry: WaitlistEntry = {
						id: `wait-${Date.now()}`,
						...request,
						priority: request.priority || 'MEDIUM',
						userId: 'current-user-id',
						userName: 'Current User',
						userEmail: 'current.user@university.edu',
						resourceName: `Resource ${request.resourceId}`,
						status: WaitlistStatus.ACTIVE,
						position: state.resourceEntries.filter((e) => e.resourceId === request.resourceId).length + 1,
						createdAt: new Date(),
						updatedAt: new Date(),
						notificationSent: false
					};

					setState((prev) => ({
						...prev,
						myEntries: [...prev.myEntries, newEntry],
						resourceEntries:
							request.resourceId === prev.resourceEntries[0]?.resourceId
								? [...prev.resourceEntries, newEntry]
								: prev.resourceEntries
					}));

					enqueueSnackbar(`Joined waiting list for resource. Position: ${newEntry.position}`, {
						variant: 'success'
					});
					return true;
				}

				const response = await waitlistService.joinWaitlist(request);

				if (response.success && response.data) {
					setState((prev) => ({
						...prev,
						myEntries: [...prev.myEntries, response.data!]
					}));

					enqueueSnackbar(`Joined waiting list. Position: ${response.data.position}`, { variant: 'success' });
					return true;
				} else {
					throw new Error(response.error?.message || 'Failed to join waiting list');
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to join waiting list';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
				return false;
			} finally {
				setLoading('join', false);
			}
		},
		[setLoading, setError, enqueueSnackbar, state.resourceEntries]
	);

	const loadMyEntries = useCallback(
		async (query?: WaitlistQuery) => {
			try {
				setLoading('entries', true);
				setError(null);

				if (USE_MOCK_DATA) {
					// Mock implementation
					const filteredEntries = mockWaitlistEntries.filter((entry) => entry.userId === 'user-1');
					setState((prev) => ({ ...prev, myEntries: filteredEntries }));
					return;
				}

				const response = await waitlistService.getMyWaitlistEntries(query);

				if (response.success && response.data) {
					setState((prev) => ({
						...prev,
						myEntries: response.data!.items
					}));
				} else {
					throw new Error(response.error?.message || 'Failed to load waiting list entries');
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to load entries';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
			} finally {
				setLoading('entries', false);
			}
		},
		[setLoading, setError, enqueueSnackbar]
	);

	const loadResourceEntries = useCallback(
		async (resourceId: string, query?: WaitlistQuery) => {
			try {
				setLoading('entries', true);
				setError(null);

				if (USE_MOCK_DATA) {
					// Mock implementation
					const filteredEntries = mockWaitlistEntries.filter((entry) => entry.resourceId === resourceId);
					setState((prev) => ({ ...prev, resourceEntries: filteredEntries }));
					return;
				}

				const response = await waitlistService.getWaitlistForResource(resourceId, query);

				if (response.success && response.data) {
					setState((prev) => ({
						...prev,
						resourceEntries: response.data!.items
					}));
				} else {
					throw new Error(response.error?.message || 'Failed to load resource waiting list');
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to load resource entries';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
			} finally {
				setLoading('entries', false);
			}
		},
		[setLoading, setError, enqueueSnackbar]
	);

	const cancelEntry = useCallback(
		async (entryId: string): Promise<boolean> => {
			try {
				setLoading('cancel', true);
				setError(null);

				if (USE_MOCK_DATA) {
					// Mock implementation
					setState((prev) => ({
						...prev,
						myEntries: prev.myEntries.filter((entry) => entry.id !== entryId),
						resourceEntries: prev.resourceEntries.filter((entry) => entry.id !== entryId)
					}));

					enqueueSnackbar('Successfully cancelled waiting list entry', { variant: 'success' });
					return true;
				}

				const response = await waitlistService.cancelWaitlistEntry(entryId);

				if (response.success) {
					setState((prev) => ({
						...prev,
						myEntries: prev.myEntries.filter((entry) => entry.id !== entryId),
						resourceEntries: prev.resourceEntries.filter((entry) => entry.id !== entryId)
					}));

					enqueueSnackbar('Successfully cancelled waiting list entry', { variant: 'success' });
					return true;
				} else {
					throw new Error(response.error?.message || 'Failed to cancel entry');
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to cancel entry';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
				return false;
			} finally {
				setLoading('cancel', false);
			}
		},
		[setLoading, setError, enqueueSnackbar]
	);

	const updateEntry = useCallback(
		async (entryId: string, updates: Partial<WaitlistEntry>): Promise<boolean> => {
			try {
				setError(null);

				if (USE_MOCK_DATA) {
					// Mock implementation
					setState((prev) => ({
						...prev,
						myEntries: prev.myEntries.map((entry) =>
							entry.id === entryId ? { ...entry, ...updates } : entry
						),
						resourceEntries: prev.resourceEntries.map((entry) =>
							entry.id === entryId ? { ...entry, ...updates } : entry
						)
					}));

					enqueueSnackbar('Successfully updated waiting list entry', { variant: 'success' });
					return true;
				}

				const response = await waitlistService.updateWaitlistEntry(entryId, updates);

				if (response.success && response.data) {
					setState((prev) => ({
						...prev,
						myEntries: prev.myEntries.map((entry) => (entry.id === entryId ? response.data! : entry)),
						resourceEntries: prev.resourceEntries.map((entry) =>
							entry.id === entryId ? response.data! : entry
						)
					}));

					enqueueSnackbar('Successfully updated waiting list entry', { variant: 'success' });
					return true;
				} else {
					throw new Error(response.error?.message || 'Failed to update entry');
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to update entry';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
				return false;
			}
		},
		[setError, enqueueSnackbar]
	);

	const getPosition = useCallback(
		async (entryId: string) => {
			try {
				if (USE_MOCK_DATA) {
					// Mock implementation
					const entry = [...state.myEntries, ...state.resourceEntries].find((e) => e.id === entryId);

					if (entry) {
						return { position: entry.position, estimatedWaitTime: entry.position * 30 }; // 30 min per position
					}

					return null;
				}

				const response = await waitlistService.getWaitlistPosition(entryId);
				return response.success ? response.data : null;
			} catch (error) {
				setError(error instanceof Error ? error.message : 'Failed to get position');
				return null;
			}
		},
		[state.myEntries, state.resourceEntries, setError]
	);

	const respondToNotification = useCallback(
		async (notificationId: string, response: 'ACCEPT' | 'DECLINE'): Promise<boolean> => {
			try {
				setLoading('respond', true);
				setError(null);

				if (USE_MOCK_DATA) {
					// Mock implementation
					setState((prev) => ({
						...prev,
						notifications: prev.notifications.map((notif) =>
							notif.id === notificationId
								? {
										...notif,
										status:
											response === 'ACCEPT'
												? NotificationStatus.ACCEPTED
												: NotificationStatus.DECLINED
									}
								: notif
						)
					}));

					const action = response === 'ACCEPT' ? 'accepted' : 'declined';
					enqueueSnackbar(`Successfully ${action} the availability notification`, { variant: 'success' });
					return true;
				}

				const serviceResponse = await waitlistService.respondToNotification(notificationId, response);

				if (serviceResponse.success) {
					setState((prev) => ({
						...prev,
						notifications: prev.notifications.filter((notif) => notif.id !== notificationId)
					}));

					const action = response === 'ACCEPT' ? 'accepted' : 'declined';
					enqueueSnackbar(`Successfully ${action} the availability notification`, { variant: 'success' });

					if (response === 'ACCEPT' && serviceResponse.data?.reservationId) {
						enqueueSnackbar(`Reservation created: ${serviceResponse.data.reservationId}`, {
							variant: 'info'
						});
					}

					return true;
				} else {
					throw new Error(serviceResponse.error?.message || 'Failed to respond to notification');
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to respond';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
				return false;
			} finally {
				setLoading('respond', false);
			}
		},
		[setLoading, setError, enqueueSnackbar]
	);

	const loadNotifications = useCallback(async () => {
		try {
			setLoading('notifications', true);
			setError(null);

			if (USE_MOCK_DATA) {
				// Mock implementation
				setState((prev) => ({ ...prev, notifications: mockWaitlistNotifications }));
				return;
			}

			const response = await waitlistService.getWaitlistNotifications();

			if (response.success && response.data) {
				setState((prev) => ({
					...prev,
					notifications: response.data!
				}));
			} else {
				throw new Error(response.error?.message || 'Failed to load notifications');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to load notifications';
			setError(errorMessage);
		} finally {
			setLoading('notifications', false);
		}
	}, [setLoading, setError]);

	const refreshData = useCallback(async () => {
		await Promise.all([loadMyEntries(), loadNotifications()]);
	}, [loadMyEntries, loadNotifications]);

	// Load initial data on mount
	useEffect(() => {
		refreshData();
	}, [refreshData]);

	return {
		...state,
		joinWaitlist,
		loadMyEntries,
		loadResourceEntries,
		cancelEntry,
		updateEntry,
		getPosition,
		respondToNotification,
		loadNotifications,
		refreshData
	};
}
