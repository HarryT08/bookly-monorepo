'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
	Box,
	Typography,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Alert,
	Stack,
	IconButton,
	Tooltip,
	Badge,
	FormControl,
	InputLabel,
	Select,
	MenuItem
} from '@mui/material';
import {
	Refresh as RefreshIcon,
	CheckCircle as ApproveIcon,
	Cancel as RejectIcon,
	Edit as EditIcon,
	Visibility as ViewIcon,
	FilterList as FilterIcon,
	AssignmentTurnedIn as ApprovalsIcon
} from '@mui/icons-material';

import { DataTablePageTemplate } from '@/components/templates';
import { Button, TextField } from '@/components/atoms';
import type { DataTableColumn } from '@/components/organisms';
import { useApprovalRequest, useDocumentGeneration } from '@hooks/useStockpile';
import {
	ApprovalRequest,
	ApprovalRequestStatus,
	ApprovalActionType,
	ProcessApprovalRequest,
	ApprovalRequestFilter,
	ApprovalDashboardStats
} from '@services/stockpile';

const statusColors = {
	[ApprovalRequestStatus.PENDING]: 'warning',
	[ApprovalRequestStatus.APPROVED]: 'success',
	[ApprovalRequestStatus.REJECTED]: 'error',
	[ApprovalRequestStatus.TIMEOUT]: 'error',
	[ApprovalRequestStatus.CANCELLED]: 'default'
} as const;

const statusLabels = {
	[ApprovalRequestStatus.PENDING]: 'Pending',
	[ApprovalRequestStatus.APPROVED]: 'Approved',
	[ApprovalRequestStatus.REJECTED]: 'Rejected',
	[ApprovalRequestStatus.TIMEOUT]: 'Timeout',
	[ApprovalRequestStatus.CANCELLED]: 'Cancelled'
};

// Process Request Dialog Component
interface ProcessRequestDialogProps {
	open: boolean;
	request: ApprovalRequest | null;
	action: ApprovalActionType;
	onClose: () => void;
	onConfirm: (comments: string) => void;
	loading?: boolean;
}

function ProcessRequestDialog({
	open,
	request,
	action,
	onClose,
	onConfirm,
	loading = false
}: ProcessRequestDialogProps) {
	const [comments, setComments] = useState('');

	const getActionText = (actionType: ApprovalActionType): string => {
		switch (actionType) {
			case ApprovalActionType.APPROVE:
				return 'Approve';
			case ApprovalActionType.REJECT:
				return 'Reject';
			case ApprovalActionType.REQUEST_CHANGES:
				return 'Request Changes';
			default:
				return 'Process';
		}
	};

	const handleConfirm = () => {
		onConfirm(comments);
		setComments('');
	};

	const handleClose = () => {
		setComments('');
		onClose();
	};

	const isRejectAction = action === ApprovalActionType.REJECT;
	const isFormValid = !isRejectAction || comments.trim().length > 0;

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle>{getActionText(action)} Request</DialogTitle>
			<DialogContent>
				<Stack
					spacing={2}
					sx={{ mt: 1 }}
				>
					{request && (
						<Alert severity="info">
							You are about to {getActionText(action).toLowerCase()} the reservation request for "
							{request.reservation?.title}" by {request.reservation?.requesterName}.
						</Alert>
					)}

					<TextField
						fullWidth
						multiline
						rows={4}
						label={isRejectAction ? 'Reason for rejection (required)' : 'Comments (optional)'}
						value={comments}
						onChange={(e) => setComments(e.target.value)}
						required={isRejectAction}
						error={isRejectAction && !comments.trim()}
						helperText={isRejectAction && !comments.trim() ? 'Please provide a reason for rejection' : ''}
					/>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={handleClose}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button
					onClick={handleConfirm}
					variant="contained"
					disabled={!isFormValid || loading}
					loading={loading}
					color={action === ApprovalActionType.APPROVE ? 'success' : 'primary'}
				>
					{getActionText(action)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// Filter Dialog Component
interface FilterDialogProps {
	open: boolean;
	filter: ApprovalRequestFilter;
	onClose: () => void;
	onApply: (filter: ApprovalRequestFilter) => void;
	onClear: () => void;
}

function FilterDialog({ open, filter, onClose, onApply, onClear }: FilterDialogProps) {
	const [localFilter, setLocalFilter] = useState<ApprovalRequestFilter>(filter);

	useEffect(() => {
		setLocalFilter(filter);
	}, [filter]);

	const handleApply = () => {
		onApply(localFilter);
		onClose();
	};

	const handleClear = () => {
		const clearedFilter = { page: 1, limit: 10 };
		setLocalFilter(clearedFilter);
		onClear();
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle>Filter Approval Requests</DialogTitle>
			<DialogContent>
				<Stack
					spacing={2}
					sx={{ mt: 1 }}
				>
					<FormControl fullWidth>
						<InputLabel>Status</InputLabel>
						<Select
							value={localFilter.status || ''}
							onChange={(e) =>
								setLocalFilter({
									...localFilter,
									status: (e.target.value as ApprovalRequestStatus) || undefined
								})
							}
							label="Status"
						>
							<MenuItem value="">All</MenuItem>
							{Object.values(ApprovalRequestStatus).map((status) => (
								<MenuItem
									key={status}
									value={status}
								>
									{statusLabels[status]}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<TextField
						fullWidth
						label="Program ID"
						value={localFilter.programId || ''}
						onChange={(e) =>
							setLocalFilter({
								...localFilter,
								programId: e.target.value || undefined
							})
						}
					/>

					<TextField
						fullWidth
						label="Resource Type"
						value={localFilter.resourceType || ''}
						onChange={(e) =>
							setLocalFilter({
								...localFilter,
								resourceType: e.target.value || undefined
							})
						}
					/>

					<TextField
						fullWidth
						type="date"
						label="Start Date"
						value={localFilter.startDate ? localFilter.startDate.toISOString().split('T')[0] : ''}
						onChange={(e) =>
							setLocalFilter({
								...localFilter,
								startDate: e.target.value ? new Date(e.target.value) : undefined
							})
						}
						InputLabelProps={{ shrink: true }}
					/>

					<TextField
						fullWidth
						type="date"
						label="End Date"
						value={localFilter.endDate ? localFilter.endDate.toISOString().split('T')[0] : ''}
						onChange={(e) =>
							setLocalFilter({
								...localFilter,
								endDate: e.target.value ? new Date(e.target.value) : undefined
							})
						}
						InputLabelProps={{ shrink: true }}
					/>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button onClick={handleClear}>Clear</Button>
				<Button
					onClick={handleApply}
					variant="contained"
				>
					Apply Filter
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default function ApprovalsPage() {
	// State management
	const [requests, setRequests] = useState<ApprovalRequest[]>([]);
	const [stats, setStats] = useState<ApprovalDashboardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
	const [processDialogOpen, setProcessDialogOpen] = useState(false);
	const [filterDialogOpen, setFilterDialogOpen] = useState(false);
	const [processAction, setProcessAction] = useState<ApprovalActionType>(ApprovalActionType.APPROVE);
	const [filter, setFilter] = useState<ApprovalRequestFilter>({
		page: 1,
		limit: 10,
		status: ApprovalRequestStatus.PENDING
	});
	const [processLoading, setProcessLoading] = useState(false);

	// Hooks
	const {
		loading: requestLoading,
		error: requestError,
		getPendingRequests,
		processRequest,
		getDashboardStats
	} = useApprovalRequest();

	const { downloadDocument } = useDocumentGeneration();

	// Load data
	const loadRequests = useCallback(async () => {
		setLoading(true);
		const result = await getPendingRequests({ ...filter, page });

		if (result) {
			setRequests(result.data);
			setTotalPages(result.totalPages);
			setTotalCount(result.total || 0);
		}

		setLoading(false);
	}, [getPendingRequests, filter, page]);

	const loadStats = useCallback(async () => {
		const result = await getDashboardStats();

		if (result) {
			setStats(result);
		}
	}, [getDashboardStats]);

	useEffect(() => {
		loadRequests();
		loadStats();
	}, [loadRequests, loadStats]);

	// Event handlers
	const handleProcessRequest = (request: ApprovalRequest, action: ApprovalActionType) => {
		setSelectedRequest(request);
		setProcessAction(action);
		setProcessDialogOpen(true);
	};

	const handleConfirmProcess = async (comments: string) => {
		if (!selectedRequest) return;

		setProcessLoading(true);
		const processData: ProcessApprovalRequest = {
			action: processAction,
			comments: comments || undefined
		};

		const success = await processRequest(selectedRequest.id, processData);

		if (success) {
			setProcessDialogOpen(false);
			setSelectedRequest(null);
			loadRequests();
			loadStats();
		}

		setProcessLoading(false);
	};

	const handleDownloadDocument = async (documentId: string, fileName: string) => {
		await downloadDocument(documentId, fileName);
	};

	const handleApplyFilter = (newFilter: ApprovalRequestFilter) => {
		setFilter(newFilter);
		setPage(1);
	};

	const handleClearFilter = () => {
		const clearedFilter = { page: 1, limit: 10 };
		setFilter(clearedFilter);
		setPage(1);
	};

	const handlePageChange = (_event: unknown, newPage: number) => {
		setPage(newPage + 1);
	};

	const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const limit = parseInt(event.target.value, 10);
		setFilter((prev) => ({ ...prev, limit }));
		setPage(1);
	};

	const formatDate = (date: Date): string => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	};

	// Statistics cards
	const statsCards = useMemo(
		() =>
			stats
				? [
						{
							title: 'Pending Requests',
							value: stats.pendingCount,
							icon: (
								<Badge
									badgeContent={stats.pendingCount}
									color="warning"
								>
									<ApprovalsIcon />
								</Badge>
							)
						},
						{
							title: 'Approved Today',
							value: stats.approvedToday,
							icon: <ApproveIcon />
						},
						{
							title: 'Rejected Today',
							value: stats.rejectedToday,
							icon: <RejectIcon />
						},
						{
							title: 'Total This Month',
							value: stats.totalThisMonth,
							icon: <ApprovalsIcon />
						}
					]
				: [],
		[stats]
	);

	// Table columns
	const columns: DataTableColumn<ApprovalRequest>[] = [
		{
			key: 'reservation',
			label: 'Reservation',
			render: (request) => (
				<Typography
					variant="body2"
					fontWeight="bold"
				>
					{request.reservation?.title || 'N/A'}
				</Typography>
			)
		},
		{
			key: 'requester',
			label: 'Requester',
			render: (request) => (
				<Box>
					<Typography variant="body2">{request.reservation?.requesterName || 'Unknown'}</Typography>
					<Typography
						variant="caption"
						color="text.secondary"
					>
						{request.reservation?.requesterEmail}
					</Typography>
				</Box>
			)
		},
		{
			key: 'resource',
			label: 'Resource',
			render: (request) => <Typography variant="body2">{request.reservation?.resourceName || 'N/A'}</Typography>
		},
		{
			key: 'datetime',
			label: 'Date & Time',
			render: (request) =>
				request.reservation ? (
					<Box>
						<Typography variant="body2">{formatDate(request.reservation.startDate)}</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
						>
							to {formatDate(request.reservation.endDate)}
						</Typography>
					</Box>
				) : (
					<Typography variant="body2">N/A</Typography>
				)
		},
		{
			key: 'level',
			label: 'Level',
			render: (request) => (
				<Chip
					label={request.level?.name || 'Level N/A'}
					size="small"
					variant="outlined"
				/>
			)
		},
		{
			key: 'status',
			label: 'Status',
			render: (request) => (
				<Chip
					label={statusLabels[request.status]}
					color={statusColors[request.status] as 'warning' | 'success' | 'error' | 'default'}
					size="small"
				/>
			)
		},
		{
			key: 'requestedAt',
			label: 'Requested At',
			render: (request) => <Typography variant="caption">{formatDate(request.requestedAt)}</Typography>
		},
		{
			key: 'actions',
			label: 'Actions',
			align: 'center',
			render: (request) => (
				<Stack
					direction="row"
					spacing={1}
				>
					{request.status === ApprovalRequestStatus.PENDING && (
						<>
							<Tooltip title="Approve">
								<IconButton
									color="success"
									size="small"
									onClick={() => handleProcessRequest(request, ApprovalActionType.APPROVE)}
								>
									<ApproveIcon />
								</IconButton>
							</Tooltip>
							<Tooltip title="Reject">
								<IconButton
									color="error"
									size="small"
									onClick={() => handleProcessRequest(request, ApprovalActionType.REJECT)}
								>
									<RejectIcon />
								</IconButton>
							</Tooltip>
							<Tooltip title="Request Changes">
								<IconButton
									color="warning"
									size="small"
									onClick={() => handleProcessRequest(request, ApprovalActionType.REQUEST_CHANGES)}
								>
									<EditIcon />
								</IconButton>
							</Tooltip>
						</>
					)}
					<Tooltip title="View Details">
						<IconButton
							size="small"
							onClick={() => setSelectedRequest(request)}
						>
							<ViewIcon />
						</IconButton>
					</Tooltip>
				</Stack>
			)
		}
	];

	// Filter options for the DataTablePageTemplate
	const filterOptions = [
		{
			key: 'status',
			label: 'Status',
			value: filter.status || '',
			onChange: (value: string) =>
				setFilter((prev) => ({
					...prev,
					status: (value as ApprovalRequestStatus) || undefined
				})),
			options: [
				{ value: '', label: 'All' },
				...Object.values(ApprovalRequestStatus).map((status) => ({
					value: status,
					label: statusLabels[status]
				}))
			]
		}
	];

	// Page header props
	const pageHeaderProps = {
		title: 'Approval Requests',
		subtitle: 'Manage reservation approval requests and workflow',
		icon: <ApprovalsIcon />,
		actions: (
			<Stack
				direction="row"
				spacing={2}
			>
				<Button
					variant="outlined"
					startIcon={<FilterIcon />}
					onClick={() => setFilterDialogOpen(true)}
				>
					Filter
				</Button>
				<Button
					variant="outlined"
					startIcon={<RefreshIcon />}
					onClick={loadRequests}
				>
					Refresh
				</Button>
			</Stack>
		)
	};

	return (
		<>
			<DataTablePageTemplate
				pageHeader={pageHeaderProps}
				statsCards={statsCards}
				data={requests}
				columns={columns}
				loading={loading}
				error={requestError}
				searchPlaceholder="Search approval requests..."
				filterOptions={filterOptions}
				pagination={{
					count: totalCount,
					page: page - 1,
					rowsPerPage: filter.limit || 10,
					onPageChange: handlePageChange,
					onRowsPerPageChange: handleRowsPerPageChange
				}}
				emptyMessage="No approval requests found"
				emptyDescription="No requests match the current filter criteria."
			/>

			{/* Process Request Dialog */}
			<ProcessRequestDialog
				open={processDialogOpen}
				request={selectedRequest}
				action={processAction}
				onClose={() => setProcessDialogOpen(false)}
				onConfirm={handleConfirmProcess}
				loading={processLoading}
			/>

			{/* Filter Dialog */}
			<FilterDialog
				open={filterDialogOpen}
				filter={filter}
				onClose={() => setFilterDialogOpen(false)}
				onApply={handleApplyFilter}
				onClear={handleClearFilter}
			/>
		</>
	);
}
