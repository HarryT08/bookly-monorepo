'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
	Box,
	Typography,
	Button,
	Chip,
	IconButton,
	Menu,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	FormControl,
	InputLabel,
	Select,
	Stack
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Cancel as CancelIcon,
	MoreVert as MoreVertIcon,
	FilterList as FilterIcon,
	Download as DownloadIcon,
	CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';

import { DataTable } from '@components/molecules';
import { PageTitle } from '@components/atoms';
import { useReservation, useReservationHistory } from '@hooks/useAvailability';
import { Reservation, ReservationStatus } from '@services/availability/types';

interface FilterState {
	status: ReservationStatus | 'ALL';
	resourceId: string;
	userId: string;
	startDate: string;
	endDate: string;
}

const STATUS_COLORS = {
	PENDING: 'warning',
	CONFIRMED: 'success',
	CANCELLED: 'error',
	COMPLETED: 'info',
	NO_SHOW: 'default'
} as const;

const STATUS_LABELS = {
	PENDING: 'Pending',
	CONFIRMED: 'Confirmed',
	CANCELLED: 'Cancelled',
	COMPLETED: 'Completed',
	NO_SHOW: 'No Show'
} as const;

export default function ReservationsPage() {
	const router = useRouter();
	const { enqueueSnackbar } = useSnackbar();

	// State management
	const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
	const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(null);
	const [showCancelDialog, setShowCancelDialog] = useState(false);
	const [cancelReason, setCancelReason] = useState('');
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState<FilterState>({
		status: 'ALL',
		resourceId: '',
		userId: '',
		startDate: '',
		endDate: ''
	});
	const [pagination, setPagination] = useState({
		page: 0,
		pageSize: 20,
		total: 0
	});

	// Hooks
	const { loading, error, reservations, getReservations, updateReservation, cancelReservation, deleteReservation } =
		useReservation();

	const { exportHistory } = useReservationHistory();

	// Load reservations
	const loadReservations = useCallback(async () => {
		const params = {
			...(filters.status !== 'ALL' && { status: filters.status }),
			...(filters.resourceId && { resourceId: filters.resourceId }),
			...(filters.userId && { userId: filters.userId }),
			...(filters.startDate && { startDate: new Date(filters.startDate) }),
			...(filters.endDate && { endDate: new Date(filters.endDate) }),
			page: pagination.page + 1,
			limit: pagination.pageSize
		};

		await getReservations(params);
	}, [filters, pagination.page, pagination.pageSize, getReservations]);

	useEffect(() => {
		loadReservations();
	}, [loadReservations]);

	// Update pagination when reservations data changes
	useEffect(() => {
		if (reservations) {
			setPagination((prev) => ({
				...prev,
				total: reservations.data?.length || 0
			}));
		}
	}, [reservations]);

	// Table columns configuration
	const columns = [
		{
			accessorKey: 'title',
			header: 'Title',
			size: 200
		},
		{
			accessorKey: 'resourceName',
			header: 'Resource',
			size: 150
		},
		{
			accessorKey: 'userName',
			header: 'User',
			size: 150
		},
		{
			accessorKey: 'startDate',
			header: 'Start Date',
			size: 150,
			Cell: ({ cell }: any) => {
				const date = new Date(cell.getValue());
				return date.toLocaleString();
			}
		},
		{
			accessorKey: 'endDate',
			header: 'End Date',
			size: 150,
			Cell: ({ cell }: any) => {
				const date = new Date(cell.getValue());
				return date.toLocaleString();
			}
		},
		{
			accessorKey: 'status',
			header: 'Status',
			size: 120,
			Cell: ({ cell }: any) => {
				const status = cell.getValue() as ReservationStatus;
				return (
					<Chip
						label={STATUS_LABELS[status]}
						color={STATUS_COLORS[status] as any}
						size="small"
					/>
				);
			}
		},
		{
			accessorKey: 'isRecurring',
			header: 'Recurring',
			size: 100,
			Cell: ({ cell }: any) => (
				<Chip
					label={cell.getValue() ? 'Yes' : 'No'}
					color={cell.getValue() ? 'primary' : 'default'}
					size="small"
					variant="outlined"
				/>
			)
		},
		{
			id: 'actions',
			header: 'Actions',
			size: 80,
			Cell: ({ row }: any) => (
				<IconButton
					size="small"
					onClick={(e) => handleActionMenuOpen(e, row.original)}
				>
					<MoreVertIcon />
				</IconButton>
			)
		}
	];

	// Event handlers
	const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, reservation: Reservation) => {
		setActionMenuAnchor(event.currentTarget);
		setSelectedReservation(reservation);
	};

	const handleActionMenuClose = () => {
		setActionMenuAnchor(null);
		setSelectedReservation(null);
	};

	const handleCreateReservation = () => {
		router.push('/reservations/create');
	};

	const handleEditReservation = () => {
		if (selectedReservation?.id) {
			router.push(`/reservations/${selectedReservation.id}/edit`);
		}

		handleActionMenuClose();
	};

	const handleViewCalendar = () => {
		router.push('/calendar');
	};

	const handleCancelReservation = async () => {
		if (!selectedReservation?.id) return;

		const success = await cancelReservation(selectedReservation.id, cancelReason);

		if (success) {
			setShowCancelDialog(false);
			setCancelReason('');
			loadReservations();
		}

		handleActionMenuClose();
	};

	const handleDeleteReservation = async () => {
		if (!selectedReservation?.id) return;

		const success = await deleteReservation(selectedReservation.id);

		if (success) {
			loadReservations();
		}

		handleActionMenuClose();
	};

	const handleApplyFilters = () => {
		setPagination((prev) => ({ ...prev, page: 0 }));
		loadReservations();
		setShowFilters(false);
	};

	const handleClearFilters = () => {
		setFilters({
			status: 'ALL',
			resourceId: '',
			userId: '',
			startDate: '',
			endDate: ''
		});
	};

	const handleExportHistory = async () => {
		const params = {
			...(filters.resourceId && { resourceId: filters.resourceId }),
			...(filters.userId && { userId: filters.userId }),
			...(filters.startDate && { startDate: new Date(filters.startDate) }),
			...(filters.endDate && { endDate: new Date(filters.endDate) })
		};

		const blob = await exportHistory(params);

		if (blob) {
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `reservation-history-${new Date().toISOString().split('T')[0]}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	};

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
				<PageTitle
					title="Reservations"
					subtitle="Manage resource reservations and bookings"
				/>

				<Stack
					direction="row"
					spacing={2}
				>
					<Button
						variant="outlined"
						startIcon={<FilterIcon />}
						onClick={() => setShowFilters(true)}
					>
						Filters
					</Button>

					<Button
						variant="outlined"
						startIcon={<CalendarIcon />}
						onClick={handleViewCalendar}
					>
						Calendar View
					</Button>

					<Button
						variant="outlined"
						startIcon={<DownloadIcon />}
						onClick={handleExportHistory}
					>
						Export
					</Button>

					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleCreateReservation}
					>
						New Reservation
					</Button>
				</Stack>
			</Box>

			{error && (
				<Typography
					color="error"
					sx={{ mb: 2 }}
				>
					{error}
				</Typography>
			)}

			<DataTable
				data={reservations?.data || []}
				columns={columns}
				state={{
					isLoading: loading,
					pagination: {
						pageIndex: pagination.page,
						pageSize: pagination.pageSize
					}
				}}
				manualPagination
				rowCount={pagination.total}
				onPaginationChange={(updater) => {
					if (typeof updater === 'function') {
						const newState = updater({
							pageIndex: pagination.page,
							pageSize: pagination.pageSize
						});
						setPagination((prev) => ({
							...prev,
							page: newState.pageIndex,
							pageSize: newState.pageSize
						}));
					}
				}}
			/>

			{/* Action Menu */}
			<Menu
				anchorEl={actionMenuAnchor}
				open={Boolean(actionMenuAnchor)}
				onClose={handleActionMenuClose}
			>
				<MenuItem onClick={handleEditReservation}>
					<EditIcon sx={{ mr: 1 }} />
					Edit
				</MenuItem>

				{selectedReservation?.status === 'CONFIRMED' && (
					<MenuItem onClick={() => setShowCancelDialog(true)}>
						<CancelIcon sx={{ mr: 1 }} />
						Cancel
					</MenuItem>
				)}

				<MenuItem
					onClick={handleDeleteReservation}
					sx={{ color: 'error.main' }}
				>
					<DeleteIcon sx={{ mr: 1 }} />
					Delete
				</MenuItem>
			</Menu>

			{/* Cancel Reservation Dialog */}
			<Dialog
				open={showCancelDialog}
				onClose={() => setShowCancelDialog(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Cancel Reservation</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						label="Cancellation Reason"
						fullWidth
						multiline
						rows={3}
						value={cancelReason}
						onChange={(e) => setCancelReason(e.target.value)}
						placeholder="Please provide a reason for cancellation..."
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowCancelDialog(false)}>Cancel</Button>
					<Button
						onClick={handleCancelReservation}
						variant="contained"
						color="error"
					>
						Confirm Cancellation
					</Button>
				</DialogActions>
			</Dialog>

			{/* Filters Dialog */}
			<Dialog
				open={showFilters}
				onClose={() => setShowFilters(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>Filter Reservations</DialogTitle>
				<DialogContent>
					<Stack
						spacing={3}
						sx={{ mt: 1 }}
					>
						<FormControl fullWidth>
							<InputLabel>Status</InputLabel>
							<Select
								value={filters.status}
								label="Status"
								onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any }))}
							>
								<MenuItem value="ALL">All</MenuItem>
								<MenuItem value="PENDING">Pending</MenuItem>
								<MenuItem value="CONFIRMED">Confirmed</MenuItem>
								<MenuItem value="CANCELLED">Cancelled</MenuItem>
								<MenuItem value="COMPLETED">Completed</MenuItem>
								<MenuItem value="NO_SHOW">No Show</MenuItem>
							</Select>
						</FormControl>

						<TextField
							label="Resource ID"
							value={filters.resourceId}
							onChange={(e) => setFilters((prev) => ({ ...prev, resourceId: e.target.value }))}
							fullWidth
						/>

						<TextField
							label="User ID"
							value={filters.userId}
							onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))}
							fullWidth
						/>

						<Stack
							direction="row"
							spacing={2}
						>
							<TextField
								label="Start Date"
								type="date"
								value={filters.startDate}
								onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
								InputLabelProps={{ shrink: true }}
								fullWidth
							/>

							<TextField
								label="End Date"
								type="date"
								value={filters.endDate}
								onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
								InputLabelProps={{ shrink: true }}
								fullWidth
							/>
						</Stack>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClearFilters}>Clear</Button>
					<Button onClick={() => setShowFilters(false)}>Cancel</Button>
					<Button
						onClick={handleApplyFilters}
						variant="contained"
					>
						Apply Filters
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
