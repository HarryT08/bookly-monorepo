import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { ReassignmentRequest, ReassignmentValidation, ReassignmentHistory } from '../services/availability/types';
import { reassignmentService } from '../services/availability/reassignmentService';

interface UseReassignmentState {
	requests: ReassignmentHistory[];
	sentRequests: ReassignmentHistory[];
	receivedRequests: ReassignmentHistory[];
	currentValidation: ReassignmentValidation | null;
	loading: {
		requests: boolean;
		validation: boolean;
		create: boolean;
		respond: boolean;
		cancel: boolean;
	};
	error: string | null;
}

interface UseReassignmentReturn extends UseReassignmentState {
	// Data loading
	loadRequests: (
		type?: 'sent' | 'received' | 'all',
		status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
	) => Promise<void>;
	loadSentRequests: () => Promise<void>;
	loadReceivedRequests: () => Promise<void>;

	// Validation
	validateReassignment: (
		reservationId: string,
		targetUserId: string,
		newStartTime?: Date,
		newEndTime?: Date,
		newResourceId?: string
	) => Promise<ReassignmentValidation | null>;
	clearValidation: () => void;

	// Request management
	createRequest: (request: ReassignmentRequest) => Promise<string | null>;
	respondToRequest: (reassignmentId: string, response: 'APPROVE' | 'REJECT', comments?: string) => Promise<boolean>;
	cancelRequest: (reassignmentId: string) => Promise<boolean>;

	// Utility
	refreshData: () => Promise<void>;
	getRequestById: (id: string) => ReassignmentHistory | undefined;
	getPendingRequestsCount: () => number;
}

const initialState: UseReassignmentState = {
	requests: [],
	sentRequests: [],
	receivedRequests: [],
	currentValidation: null,
	loading: {
		requests: false,
		validation: false,
		create: false,
		respond: false,
		cancel: false
	},
	error: null
};

export function useReassignment(): UseReassignmentReturn {
	const { enqueueSnackbar } = useSnackbar();
	const [state, setState] = useState<UseReassignmentState>(initialState);

	const setLoading = useCallback((key: keyof UseReassignmentState['loading'], value: boolean) => {
		setState((prev) => ({
			...prev,
			loading: { ...prev.loading, [key]: value }
		}));
	}, []);

	const setError = useCallback((error: string | null) => {
		setState((prev) => ({ ...prev, error }));
	}, []);

	const loadRequests = useCallback(
		async (
			type: 'sent' | 'received' | 'all' = 'all',
			status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
		) => {
			try {
				setLoading('requests', true);
				setError(null);

				const requests = await reassignmentService.getReassignmentRequests(type, status);

				setState((prev) => ({
					...prev,
					requests,
					sentRequests:
						type === 'sent' || type === 'all'
							? requests.filter((r) => r.requestedBy === 'current-user-id')
							: prev.sentRequests,
					receivedRequests:
						type === 'received' || type === 'all'
							? requests.filter((r) => r.targetResourceId === 'current-user-id')
							: prev.receivedRequests
				}));
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to load reassignment requests';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
			} finally {
				setLoading('requests', false);
			}
		},
		[setLoading, setError, enqueueSnackbar]
	);

	const loadSentRequests = useCallback(async () => {
		await loadRequests('sent');
	}, [loadRequests]);

	const loadReceivedRequests = useCallback(async () => {
		await loadRequests('received');
	}, [loadRequests]);

	const validateReassignment = useCallback(
		async (
			reservationId: string,
			targetUserId: string,
			newStartTime?: Date,
			newEndTime?: Date,
			newResourceId?: string
		): Promise<ReassignmentValidation | null> => {
			try {
				setLoading('validation', true);
				setError(null);

				const validation = await reassignmentService.validateReassignment(
					reservationId,
					targetUserId,
					newStartTime,
					newEndTime,
					newResourceId
				);

				setState((prev) => ({ ...prev, currentValidation: validation }));

				if (!validation.isValid) {
					enqueueSnackbar(`Validation failed: ${validation.conflicts.map((c) => c.details).join(', ')}`, {
						variant: 'warning'
					});
				} else if (validation.warnings.length > 0) {
					enqueueSnackbar(`Warning: ${validation.warnings.map((w) => w.message).join(', ')}`, {
						variant: 'info'
					});
				}

				return validation;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to validate reassignment';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
				return null;
			} finally {
				setLoading('validation', false);
			}
		},
		[setLoading, setError, enqueueSnackbar]
	);

	const clearValidation = useCallback(() => {
		setState((prev) => ({ ...prev, currentValidation: null }));
	}, []);

	const createRequest = useCallback(
		async (request: ReassignmentRequest): Promise<string | null> => {
			try {
				setLoading('create', true);
				setError(null);

				const requestId = await reassignmentService.createReassignmentRequest(request);

				enqueueSnackbar('Reassignment request created successfully', { variant: 'success' });

				// Refresh the requests
				await loadRequests();

				return requestId;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to create reassignment request';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
				return null;
			} finally {
				setLoading('create', false);
			}
		},
		[setLoading, setError, enqueueSnackbar, loadRequests]
	);

	const respondToRequest = useCallback(
		async (reassignmentId: string, response: 'APPROVE' | 'REJECT', comments?: string): Promise<boolean> => {
			try {
				setLoading('respond', true);
				setError(null);

				const success = await reassignmentService.respondToReassignmentRequest(
					reassignmentId,
					response,
					comments
				);

				if (success) {
					const action = response === 'APPROVE' ? 'approved' : 'rejected';
					enqueueSnackbar(`Reassignment request ${action} successfully`, { variant: 'success' });

					// Refresh the requests
					await loadRequests();
				}

				return success;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to respond to reassignment request';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
				return false;
			} finally {
				setLoading('respond', false);
			}
		},
		[setLoading, setError, enqueueSnackbar, loadRequests]
	);

	const cancelRequest = useCallback(
		async (reassignmentId: string): Promise<boolean> => {
			try {
				setLoading('cancel', true);
				setError(null);

				const success = await reassignmentService.cancelReassignmentRequest(reassignmentId);

				if (success) {
					enqueueSnackbar('Reassignment request cancelled successfully', { variant: 'success' });

					// Refresh the requests
					await loadRequests();
				}

				return success;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to cancel reassignment request';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
				return false;
			} finally {
				setLoading('cancel', false);
			}
		},
		[setLoading, setError, enqueueSnackbar, loadRequests]
	);

	const refreshData = useCallback(async () => {
		await loadRequests();
	}, [loadRequests]);

	const getRequestById = useCallback(
		(id: string): ReassignmentHistory | undefined => {
			return state.requests.find((request) => request.id === id);
		},
		[state.requests]
	);

	const getPendingRequestsCount = useCallback((): number => {
		return state.receivedRequests.filter((request) => request.status === 'PENDING').length;
	}, [state.receivedRequests]);

	return {
		...state,
		loadRequests,
		loadSentRequests,
		loadReceivedRequests,
		validateReassignment,
		clearValidation,
		createRequest,
		respondToRequest,
		cancelRequest,
		refreshData,
		getRequestById,
		getPendingRequestsCount
	};
}
