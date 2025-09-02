'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
	Box,
	Card,
	CardContent,
	Typography,
	Button,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
	Alert,
	Stack,
	Pagination,
	IconButton,
	Tooltip,
	Badge
} from '@mui/material';
import {
	Refresh as RefreshIcon,
	CheckCircle as ApproveIcon,
	Cancel as RejectIcon,
	Edit as EditIcon,
	Visibility as ViewIcon,
	FilterList as FilterIcon
} from '@mui/icons-material';

import { PageTitle } from '@components/atoms';
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

export default function ApprovalsPage() {
	// State management
	const [requests, setRequests] = useState<ApprovalRequest[]>([]);
	const [stats, setStats] = useState<ApprovalDashboardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
	const [processDialogOpen, setProcessDialogOpen] = useState(false);
	const [filterDialogOpen, setFilterDialogOpen] = useState(false);
	const [processAction, setProcessAction] = useState<ApprovalActionType>(ApprovalActionType.APPROVE);
	const [comments, setComments] = useState('');
	const [filter, setFilter] = useState<ApprovalRequestFilter>({
		page: 1,
		limit: 10,
		status: ApprovalRequestStatus.PENDING
	});

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
		setComments('');
		setProcessDialogOpen(true);
	};

	const handleConfirmProcess = async () => {
		if (!selectedRequest) return;

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
	};

	const handleDownloadDocument = async (documentId: string, fileName: string) => {
		await downloadDocument(documentId, fileName);
	};

	const handleApplyFilter = () => {
		setPage(1);
		loadRequests();
		setFilterDialogOpen(false);
	};

	const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
		setPage(newPage);
	};

	const getActionText = (action: ApprovalActionType): string => {
		switch (action) {
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

	const formatDate = (date: Date): string => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	};

	return (
		<Box sx={{ p: 3 }}>
			<Stack spacing={3}>
				{/* Header */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<PageTitle title="Approval Requests" />
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
				</Box>

				{/* Stats Cards */}
				{stats && (
					<Grid
						container
						spacing={2}
					>
						<Grid
							item
							xs={12}
							sm={6}
							md={3}
						>
							<Card>
								<CardContent>
									<Typography
										color="textSecondary"
										gutterBottom
									>
										Pending Requests
									</Typography>
									<Typography variant="h4">
										<Badge
											badgeContent={stats.pendingCount}
											color="warning"
										>
											{stats.pendingCount}
										</Badge>
									</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid
							item
							xs={12}
							sm={6}
							md={3}
						>
							<Card>
								<CardContent>
									<Typography
										color="textSecondary"
										gutterBottom
									>
										Approved Today
									</Typography>
									<Typography
										variant="h4"
										color="success.main"
									>
										{stats.approvedToday}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid
							item
							xs={12}
							sm={6}
							md={3}
						>
							<Card>
								<CardContent>
									<Typography
										color="textSecondary"
										gutterBottom
									>
										Rejected Today
									</Typography>
									<Typography
										variant="h4"
										color="error.main"
									>
										{stats.rejectedToday}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid
							item
							xs={12}
							sm={6}
							md={3}
						>
							<Card>
								<CardContent>
									<Typography
										color="textSecondary"
										gutterBottom
									>
										Avg Response Time
									</Typography>
									<Typography variant="h4">{Math.round(stats.avgResponseTime)}h</Typography>
								</CardContent>
							</Card>
						</Grid>
					</Grid>
				)}

				{/* Error Alert */}
				{requestError && <Alert severity="error">{requestError}</Alert>}

				{/* Requests Table */}
				<Card>
					<CardContent>
						<TableContainer
							component={Paper}
							elevation={0}
						>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>Reservation</TableCell>
										<TableCell>Requester</TableCell>
										<TableCell>Resource</TableCell>
										<TableCell>Date & Time</TableCell>
										<TableCell>Level</TableCell>
										<TableCell>Status</TableCell>
										<TableCell>Requested At</TableCell>
										<TableCell>Actions</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{loading ? (
										<TableRow>
											<TableCell
												colSpan={8}
												align="center"
											>
												Loading approval requests...
											</TableCell>
										</TableRow>
									) : requests.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={8}
												align="center"
											>
												No approval requests found
											</TableCell>
										</TableRow>
									) : (
										requests.map((request) => (
											<TableRow key={request.id}>
												<TableCell>
													<Typography
														variant="body2"
														fontWeight="bold"
													>
														{request.reservation?.title || 'N/A'}
													</Typography>
												</TableCell>
												<TableCell>
													<Box>
														<Typography variant="body2">
															{request.reservation?.requesterName || 'Unknown'}
														</Typography>
														<Typography
															variant="caption"
															color="textSecondary"
														>
															{request.reservation?.requesterEmail}
														</Typography>
													</Box>
												</TableCell>
												<TableCell>{request.reservation?.resourceName || 'N/A'}</TableCell>
												<TableCell>
													{request.reservation ? (
														<Box>
															<Typography variant="body2">
																{formatDate(request.reservation.startDate)}
															</Typography>
															<Typography
																variant="caption"
																color="textSecondary"
															>
																to {formatDate(request.reservation.endDate)}
															</Typography>
														</Box>
													) : (
														'N/A'
													)}
												</TableCell>
												<TableCell>
													<Chip
														label={request.level?.name || 'Level N/A'}
														size="small"
														variant="outlined"
													/>
												</TableCell>
												<TableCell>
													<Chip
														label={statusLabels[request.status]}
														color={statusColors[request.status] as any}
														size="small"
													/>
												</TableCell>
												<TableCell>
													<Typography variant="caption">
														{formatDate(request.requestedAt)}
													</Typography>
												</TableCell>
												<TableCell>
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
																		onClick={() =>
																			handleProcessRequest(
																				request,
																				ApprovalActionType.APPROVE
																			)
																		}
																	>
																		<ApproveIcon />
																	</IconButton>
																</Tooltip>
																<Tooltip title="Reject">
																	<IconButton
																		color="error"
																		size="small"
																		onClick={() =>
																			handleProcessRequest(
																				request,
																				ApprovalActionType.REJECT
																			)
																		}
																	>
																		<RejectIcon />
																	</IconButton>
																</Tooltip>
																<Tooltip title="Request Changes">
																	<IconButton
																		color="warning"
																		size="small"
																		onClick={() =>
																			handleProcessRequest(
																				request,
																				ApprovalActionType.REQUEST_CHANGES
																			)
																		}
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
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>

						{/* Pagination */}
						{totalPages > 1 && (
							<Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
								<Pagination
									count={totalPages}
									page={page}
									onChange={handlePageChange}
									color="primary"
								/>
							</Box>
						)}
					</CardContent>
				</Card>
			</Stack>

			{/* Process Request Dialog */}
			<Dialog
				open={processDialogOpen}
				onClose={() => setProcessDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>{getActionText(processAction)} Request</DialogTitle>
				<DialogContent>
					<Stack
						spacing={2}
						sx={{ mt: 1 }}
					>
						{selectedRequest && (
							<Alert severity="info">
								You are about to {getActionText(processAction).toLowerCase()} the reservation request
								for "{selectedRequest.reservation?.title}" by{' '}
								{selectedRequest.reservation?.requesterName}.
							</Alert>
						)}

						<TextField
							fullWidth
							multiline
							rows={4}
							label={
								processAction === ApprovalActionType.REJECT
									? 'Reason for rejection (required)'
									: 'Comments (optional)'
							}
							value={comments}
							onChange={(e) => setComments(e.target.value)}
							required={processAction === ApprovalActionType.REJECT}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setProcessDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleConfirmProcess}
						variant="contained"
						disabled={processAction === ApprovalActionType.REJECT && !comments.trim()}
						color={processAction === ApprovalActionType.APPROVE ? 'success' : 'primary'}
					>
						{getActionText(processAction)}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Filter Dialog */}
			<Dialog
				open={filterDialogOpen}
				onClose={() => setFilterDialogOpen(false)}
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
								value={filter.status || ''}
								onChange={(e) =>
									setFilter({ ...filter, status: e.target.value as ApprovalRequestStatus })
								}
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
							value={filter.programId || ''}
							onChange={(e) => setFilter({ ...filter, programId: e.target.value || undefined })}
						/>

						<TextField
							fullWidth
							label="Resource Type"
							value={filter.resourceType || ''}
							onChange={(e) => setFilter({ ...filter, resourceType: e.target.value || undefined })}
						/>

						<TextField
							fullWidth
							type="date"
							label="Start Date"
							value={filter.startDate ? filter.startDate.toISOString().split('T')[0] : ''}
							onChange={(e) =>
								setFilter({
									...filter,
									startDate: e.target.value ? new Date(e.target.value) : undefined
								})
							}
							InputLabelProps={{ shrink: true }}
						/>

						<TextField
							fullWidth
							type="date"
							label="End Date"
							value={filter.endDate ? filter.endDate.toISOString().split('T')[0] : ''}
							onChange={(e) =>
								setFilter({
									...filter,
									endDate: e.target.value ? new Date(e.target.value) : undefined
								})
							}
							InputLabelProps={{ shrink: true }}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
					<Button onClick={() => setFilter({ page: 1, limit: 10 })}>Clear</Button>
					<Button
						onClick={handleApplyFilter}
						variant="contained"
					>
						Apply Filter
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
