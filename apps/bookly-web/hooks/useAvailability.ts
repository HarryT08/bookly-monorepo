/**
 * Availability and Reservation Management Hooks
 * Custom React hooks for managing availability, schedules, reservations, and calendar views
 * Based on CQRS patterns and following RF-07, RF-08, RF-10, RF-11 requirements
 */

import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import {
	availabilityService,
	calendarIntegrationService,
	calendarViewService,
	reservationService,
	reservationHistoryService
} from '../services/availability';
import {
	WeeklySchedule,
	Schedule,
	CalendarIntegration,
	CalendarViewData,
	Reservation,
	ReservationHistory,
	AvailabilityQuery,
	CreateReservationRequest,
	UpdateReservationRequest,
	CalendarViewQuery,
	ReservationHistoryQuery,
	AvailabilityCheckResult,
	CalendarProvider,
	ScheduleType
} from '../services/availability/types';
import { PaginatedResponse } from '../services/http/types';

// ========================================
// RF-07: Availability Management Hook
// ========================================

export function useAvailability() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const handleError = useCallback(
		(error: Error, action: string) => {
			console.error(`Error ${action}:`, error);
			setError(error.message);
			enqueueSnackbar(`Error ${action}: ${error.message}`, { variant: 'error' });
		},
		[enqueueSnackbar]
	);

	const clearError = useCallback(() => setError(null), []);

	// Basic Availability Operations
	const createAvailability = useCallback(
		async (data: Omit<WeeklySchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<WeeklySchedule | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await availabilityService.createAvailability(data);
				enqueueSnackbar('Availability created successfully', { variant: 'success' });
				return result;
			} catch (error) {
				handleError(error as Error, 'creating availability');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	const getAvailability = useCallback(
		async (params?: { resourceId?: string; dayOfWeek?: number }): Promise<WeeklySchedule[]> => {
			try {
				setLoading(true);
				clearError();
				return await availabilityService.getAvailability(params);
			} catch (error) {
				handleError(error as Error, 'fetching availability');
				return [];
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError]
	);

	const updateAvailability = useCallback(
		async (id: string, data: Partial<WeeklySchedule>): Promise<WeeklySchedule | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await availabilityService.updateAvailability(id, data);
				enqueueSnackbar('Availability updated successfully', { variant: 'success' });
				return result;
			} catch (error) {
				handleError(error as Error, 'updating availability');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	const deleteAvailability = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				setLoading(true);
				clearError();
				await availabilityService.deleteAvailability(id);
				enqueueSnackbar('Availability deleted successfully', { variant: 'success' });
				return true;
			} catch (error) {
				handleError(error as Error, 'deleting availability');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	const checkAvailability = useCallback(
		async (query: AvailabilityQuery): Promise<AvailabilityCheckResult | null> => {
			try {
				setLoading(true);
				clearError();
				return await availabilityService.checkAvailability(query);
			} catch (error) {
				handleError(error as Error, 'checking availability');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError]
	);

	return {
		loading,
		error,
		clearError,
		createAvailability,
		getAvailability,
		updateAvailability,
		deleteAvailability,
		checkAvailability
	};
}

// ========================================
// Schedule Management Hook
// ========================================

export function useSchedule() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const handleError = useCallback(
		(error: Error, action: string) => {
			console.error(`Error ${action}:`, error);
			setError(error.message);
			enqueueSnackbar(`Error ${action}: ${error.message}`, { variant: 'error' });
		},
		[enqueueSnackbar]
	);

	const clearError = useCallback(() => setError(null), []);

	const createSchedule = useCallback(
		async (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await availabilityService.createSchedule(data);
				enqueueSnackbar('Schedule created successfully', { variant: 'success' });
				return result;
			} catch (error) {
				handleError(error as Error, 'creating schedule');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	const getSchedules = useCallback(
		async (params?: { resourceId?: string; type?: ScheduleType }): Promise<Schedule[]> => {
			try {
				setLoading(true);
				clearError();
				return await availabilityService.getSchedules(params);
			} catch (error) {
				handleError(error as Error, 'fetching schedules');
				return [];
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError]
	);

	const updateSchedule = useCallback(
		async (id: string, data: Partial<Schedule>): Promise<Schedule | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await availabilityService.updateSchedule(id, data);
				enqueueSnackbar('Schedule updated successfully', { variant: 'success' });
				return result;
			} catch (error) {
				handleError(error as Error, 'updating schedule');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	const deleteSchedule = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				setLoading(true);
				clearError();
				await availabilityService.deleteSchedule(id);
				enqueueSnackbar('Schedule deleted successfully', { variant: 'success' });
				return true;
			} catch (error) {
				handleError(error as Error, 'deleting schedule');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	return {
		loading,
		error,
		clearError,
		createSchedule,
		getSchedules,
		updateSchedule,
		deleteSchedule
	};
}

// ========================================
// RF-08: Calendar Integration Hook
// ========================================

export function useCalendarIntegration() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const handleError = useCallback(
		(error: Error, action: string) => {
			console.error(`Error ${action}:`, error);
			setError(error.message);
			enqueueSnackbar(`Error ${action}: ${error.message}`, { variant: 'error' });
		},
		[enqueueSnackbar]
	);

	const clearError = useCallback(() => setError(null), []);

	const createIntegration = useCallback(
		async (
			data: Omit<CalendarIntegration, 'id' | 'createdAt' | 'updatedAt'>
		): Promise<CalendarIntegration | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await calendarIntegrationService.createIntegration(data);
				enqueueSnackbar('Calendar integration created successfully', { variant: 'success' });
				return result;
			} catch (error) {
				handleError(error as Error, 'creating calendar integration');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	const getIntegrations = useCallback(
		async (params?: {
			resourceId?: string;
			provider?: CalendarProvider;
			isActive?: boolean;
		}): Promise<CalendarIntegration[]> => {
			try {
				setLoading(true);
				clearError();
				return await calendarIntegrationService.getIntegrations(params);
			} catch (error) {
				handleError(error as Error, 'fetching calendar integrations');
				return [];
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError]
	);

	const updateIntegration = useCallback(
		async (id: string, data: Partial<CalendarIntegration>): Promise<CalendarIntegration | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await calendarIntegrationService.updateIntegration(id, data);
				enqueueSnackbar('Calendar integration updated successfully', { variant: 'success' });
				return result;
			} catch (error) {
				handleError(error as Error, 'updating calendar integration');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	const deleteIntegration = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				setLoading(true);
				clearError();
				await calendarIntegrationService.deleteIntegration(id);
				enqueueSnackbar('Calendar integration deleted successfully', { variant: 'success' });
				return true;
			} catch (error) {
				handleError(error as Error, 'deleting calendar integration');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	const syncIntegration = useCallback(
		async (integrationId: string): Promise<{ success: boolean; eventsCount: number } | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await calendarIntegrationService.syncIntegration(integrationId);
				enqueueSnackbar(`Calendar synchronized successfully. ${result.eventsCount} events imported.`, {
					variant: 'success'
				});
				return result;
			} catch (error) {
				handleError(error as Error, 'synchronizing calendar');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	const getAvailabilityWithConflicts = useCallback(
		async (params: {
			resourceId: string;
			startDate: Date;
			endDate: Date;
			includeConflicts?: boolean;
		}): Promise<AvailabilityCheckResult | null> => {
			try {
				setLoading(true);
				clearError();
				return await calendarIntegrationService.getAvailabilityWithConflicts(params);
			} catch (error) {
				handleError(error as Error, 'checking availability with conflicts');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError]
	);

	return {
		loading,
		error,
		clearError,
		createIntegration,
		getIntegrations,
		updateIntegration,
		deleteIntegration,
		syncIntegration,
		getAvailabilityWithConflicts
	};
}

// ========================================
// RF-10: Calendar View Hook
// ========================================

export function useCalendarView() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [calendarData, setCalendarData] = useState<CalendarViewData | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const handleError = useCallback(
		(error: Error, action: string) => {
			console.error(`Error ${action}:`, error);
			setError(error.message);
			enqueueSnackbar(`Error ${action}: ${error.message}`, { variant: 'error' });
		},
		[enqueueSnackbar]
	);

	const clearError = useCallback(() => setError(null), []);

	const getCalendarView = useCallback(
		async (query: CalendarViewQuery): Promise<CalendarViewData | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await calendarViewService.getCalendarView(query);
				setCalendarData(result);
				return result;
			} catch (error) {
				handleError(error as Error, 'fetching calendar view');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError]
	);

	const getResourceCalendar = useCallback(
		async (params: {
			resourceId: string;
			startDate: Date;
			endDate: Date;
			includeReservations?: boolean;
			includeScheduleRestrictions?: boolean;
		}): Promise<CalendarViewData | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await calendarViewService.getResourceCalendar(params);
				setCalendarData(result);
				return result;
			} catch (error) {
				handleError(error as Error, 'fetching resource calendar');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError]
	);

	const refreshCalendarView = useCallback(
		async (query: CalendarViewQuery) => {
			return await getCalendarView(query);
		},
		[getCalendarView]
	);

	return {
		loading,
		error,
		calendarData,
		clearError,
		getCalendarView,
		getResourceCalendar,
		refreshCalendarView
	};
}

// ========================================
// Reservation Management Hook
// ========================================

export function useReservation() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [reservations, setReservations] = useState<PaginatedResponse<Reservation> | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const handleError = useCallback(
		(error: Error, action: string) => {
			console.error(`Error ${action}:`, error);
			setError(error.message);
			enqueueSnackbar(`Error ${action}: ${error.message}`, { variant: 'error' });
		},
		[enqueueSnackbar]
	);

	const clearError = useCallback(() => setError(null), []);

	const createReservation = useCallback(
		async (data: CreateReservationRequest): Promise<Reservation | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await reservationService.createReservation(data);
				enqueueSnackbar('Reservation created successfully', { variant: 'success' });
				return result;
			} catch (error) {
				handleError(error as Error, 'creating reservation');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	const getReservations = useCallback(
		async (params?: {
			resourceId?: string;
			userId?: string;
			status?: string;
			startDate?: Date;
			endDate?: Date;
			page?: number;
			limit?: number;
		}): Promise<PaginatedResponse<Reservation> | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await reservationService.getReservations(params);
				setReservations(result);
				return result;
			} catch (error) {
				handleError(error as Error, 'fetching reservations');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError]
	);

	const getReservationById = useCallback(
		async (id: string): Promise<Reservation | null> => {
			try {
				setLoading(true);
				clearError();
				return await reservationService.getReservationById(id);
			} catch (error) {
				handleError(error as Error, 'fetching reservation');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError]
	);

	const updateReservation = useCallback(
		async (data: UpdateReservationRequest): Promise<Reservation | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await reservationService.updateReservation(data);
				enqueueSnackbar('Reservation updated successfully', { variant: 'success' });
				return result;
			} catch (error) {
				handleError(error as Error, 'updating reservation');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	const cancelReservation = useCallback(
		async (id: string, reason?: string): Promise<Reservation | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await reservationService.cancelReservation(id, reason);
				enqueueSnackbar('Reservation cancelled successfully', { variant: 'success' });
				return result;
			} catch (error) {
				handleError(error as Error, 'cancelling reservation');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	const deleteReservation = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				setLoading(true);
				clearError();
				await reservationService.deleteReservation(id);
				enqueueSnackbar('Reservation deleted successfully', { variant: 'success' });
				return true;
			} catch (error) {
				handleError(error as Error, 'deleting reservation');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	return {
		loading,
		error,
		reservations,
		clearError,
		createReservation,
		getReservations,
		getReservationById,
		updateReservation,
		cancelReservation,
		deleteReservation
	};
}

// ========================================
// RF-11: Reservation History Hook
// ========================================

export function useReservationHistory() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [history, setHistory] = useState<PaginatedResponse<ReservationHistory> | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const handleError = useCallback(
		(error: Error, action: string) => {
			console.error(`Error ${action}:`, error);
			setError(error.message);
			enqueueSnackbar(`Error ${action}: ${error.message}`, { variant: 'error' });
		},
		[enqueueSnackbar]
	);

	const clearError = useCallback(() => setError(null), []);

	const getHistory = useCallback(
		async (query?: ReservationHistoryQuery): Promise<PaginatedResponse<ReservationHistory> | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await reservationHistoryService.getHistory(query);
				setHistory(result);
				return result;
			} catch (error) {
				handleError(error as Error, 'fetching reservation history');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError]
	);

	const createHistoryEntry = useCallback(
		async (data: Omit<ReservationHistory, 'id' | 'createdAt'>): Promise<ReservationHistory | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await reservationHistoryService.createHistoryEntry(data);
				return result;
			} catch (error) {
				handleError(error as Error, 'creating history entry');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError]
	);

	const exportHistory = useCallback(
		async (query?: ReservationHistoryQuery): Promise<Blob | null> => {
			try {
				setLoading(true);
				clearError();
				const result = await reservationHistoryService.exportHistory(query);
				enqueueSnackbar('History exported successfully', { variant: 'success' });
				return result;
			} catch (error) {
				handleError(error as Error, 'exporting history');
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, clearError, enqueueSnackbar]
	);

	return {
		loading,
		error,
		history,
		clearError,
		getHistory,
		createHistoryEntry,
		exportHistory
	};
}
