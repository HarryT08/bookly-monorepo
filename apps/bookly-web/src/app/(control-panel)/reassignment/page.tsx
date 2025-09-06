'use client';

import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Stack,
	Card,
	CardContent,
	CardActions,
	Button,
	Chip,
	Alert,
	Tabs,
	Tab,
	Badge,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	IconButton,
	Tooltip,
	CircularProgress
} from '@mui/material';
import {
	CheckCircle as ApproveIcon,
	Cancel as RejectIcon,
	Delete as CancelIcon,
	Schedule as ScheduleIcon,
	Person as PersonIcon,
	Room as RoomIcon,
	SwapHoriz as TransferIcon,
	SwapHoriz,
	Refresh as RefreshIcon,
	Comment as CommentIcon
} from '@mui/icons-material';
import PageTitle from '../../../../components/atoms/PageTitle';
import { useReassignment } from '../../../../hooks/useReassignment';
import { ReassignmentHistory, ReassignmentType } from '../../../../services/availability/types';

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`reassignment-tabpanel-${index}`}
			aria-labelledby={`reassignment-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 3 }}>{children}</Box>}
		</div>
	);
}

interface ResponseDialogProps {
	open: boolean;
	onClose: () => void;
	request: ReassignmentHistory | null;
	onSubmit: (response: 'APPROVE' | 'REJECT', comments?: string) => void;
	loading: boolean;
}

function ResponseDialog({ open, onClose, request, onSubmit, loading }: ResponseDialogProps) {
	const [response, setResponse] = useState<'APPROVE' | 'REJECT' | null>(null);
	const [comments, setComments] = useState('');

	const handleSubmit = () => {
		if (response) {
			onSubmit(response, comments.trim() || undefined);
			setResponse(null);
			setComments('');
		}
	};

	const handleClose = () => {
		setResponse(null);
		setComments('');
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle>Respond to Reassignment Request</DialogTitle>
			<DialogContent>
				<Stack spacing={3}>
					{request && (
						<Card variant="outlined">
							<CardContent>
								<Typography
									variant="subtitle1"
									gutterBottom
								>
									{request.reason}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
								>
									From: {request.requestedByName} ({request.requesterEmail})
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
								>
									Resource: {request.originalResourceName}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
								>
									Time: {new Date(request.originalStartDate).toLocaleString()} -{' '}
									{new Date(request.originalEndDate).toLocaleString()}
								</Typography>
							</CardContent>
						</Card>
					)}

					<Stack
						direction="row"
						spacing={2}
					>
						<Button
							variant={response === 'APPROVE' ? 'contained' : 'outlined'}
							color="success"
							startIcon={<ApproveIcon />}
							onClick={() => setResponse('APPROVE')}
						>
							Approve
						</Button>
						<Button
							variant={response === 'REJECT' ? 'contained' : 'outlined'}
							color="error"
							startIcon={<RejectIcon />}
							onClick={() => setResponse('REJECT')}
						>
							Reject
						</Button>
					</Stack>

					<TextField
						fullWidth
						multiline
						rows={3}
						label="Comments (Optional)"
						value={comments}
						onChange={(e) => setComments(e.target.value)}
						placeholder="Add any comments about your decision..."
						name="responseReason"
					/>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>Cancel</Button>
				<Button
					variant="contained"
					onClick={handleSubmit}
					disabled={!response || loading}
					startIcon={loading ? <CircularProgress size={20} /> : undefined}
				>
					{loading ? 'Processing...' : 'Submit Response'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default function ReassignmentPage() {
	const {
		sentRequests,
		receivedRequests,
		loading,
		error,
		loadSentRequests,
		loadReceivedRequests,
		respondToRequest,
		cancelRequest,
		refreshData
	} = useReassignment();

	const [selectedTab, setSelectedTab] = useState(0);
	const [responseDialogOpen, setResponseDialogOpen] = useState(false);
	const [responseDialog, setResponseDialog] = useState<{
		request: ReassignmentHistory | null;
	}>({ request: null });

	useEffect(() => {
		loadSentRequests();
		loadReceivedRequests();
	}, [loadSentRequests, loadReceivedRequests]);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setSelectedTab(newValue);
	};

	const handleResponse = (request: ReassignmentHistory, _status: string, _responseReason?: string) => {
		setResponseDialog({ request });
		setResponseDialogOpen(true);
	};
	const handleResponseSubmit = async (response: 'APPROVE' | 'REJECT', comments?: string) => {
		if (responseDialog.request) {
			const success = await respondToRequest(responseDialog.request.id, response, comments);

			if (success) {
				setResponseDialog({ request: null });
				setResponseDialogOpen(false);
			}
		}
	};

	const handleCancel = async (request: ReassignmentHistory) => {
		await cancelRequest(request.id);
	};

	const formatDateTime = (date: Date) => {
		return new Date(date).toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'PENDING':
				return 'warning';
			case 'APPROVED':
				return 'success';
			case 'REJECTED':
				return 'error';
			case 'CANCELLED':
				return 'default';
			default:
				return 'default';
		}
	};

	const getTypeIcon = (type: ReassignmentType) => {
		switch (type) {
			case ReassignmentType.TRANSFER:
				return <TransferIcon />;
			case ReassignmentType.EXCHANGE:
				return <SwapHoriz />;
			case ReassignmentType.RESCHEDULE:
				return <ScheduleIcon />;
			default:
				return <TransferIcon />;
		}
	};

	const renderReassignmentCard = (request: ReassignmentHistory, showActions = false) => (
		<Card
			key={request.id}
			sx={{ mb: 2 }}
		>
			<CardContent>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="flex-start"
				>
					<Box flex={1}>
						<Stack
							direction="row"
							spacing={1}
							alignItems="center"
							sx={{ mb: 1 }}
						>
							{getTypeIcon(request.type || ReassignmentType.TRANSFER)}
							<Typography
								variant="h6"
								gutterBottom
							>
								{request.reason}
							</Typography>
							<Chip
								label={request.status}
								color={getStatusColor(request.status) as any}
								size="small"
							/>
						</Stack>

						<Stack
							direction="row"
							spacing={3}
							sx={{ mb: 2 }}
						>
							<Box>
								<Typography
									variant="caption"
									display="block"
									color="text.secondary"
								>
									{showActions ? 'From' : 'To'}
								</Typography>
								<Typography variant="body2">
									<PersonIcon
										fontSize="small"
										sx={{ mr: 1, verticalAlign: 'middle' }}
									/>
									{showActions ? request.requestedByName : request.targetResourceName}
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="caption"
									display="block"
									color="text.secondary"
								>
									Resource
								</Typography>
								<Typography variant="body2">
									<RoomIcon
										fontSize="small"
										sx={{ mr: 1, verticalAlign: 'middle' }}
									/>
									{request.originalResourceName}
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="caption"
									display="block"
									color="text.secondary"
								>
									Original Time
								</Typography>
								<Typography variant="body2">
									<ScheduleIcon
										fontSize="small"
										sx={{ mr: 1, verticalAlign: 'middle' }}
									/>
									{formatDateTime(request.originalStartDate)} -{' '}
									{formatDateTime(request.originalEndDate)}
								</Typography>
							</Box>
						</Stack>

						{request.newStartDate && request.newEndDate && (
							<Stack
								direction="row"
								spacing={3}
								sx={{ mb: 2 }}
							>
								<Box>
									<Typography
										variant="caption"
										display="block"
										color="text.secondary"
									>
										New Resource
									</Typography>
									<Typography variant="body2">
										<RoomIcon
											fontSize="small"
											sx={{ mr: 1, verticalAlign: 'middle' }}
										/>
										{request.targetResourceName || request.originalResourceName}
									</Typography>
								</Box>
								<Box>
									<Typography
										variant="caption"
										display="block"
										color="text.secondary"
									>
										New Time
									</Typography>
									<Typography variant="body2">
										<ScheduleIcon
											fontSize="small"
											sx={{ mr: 1, verticalAlign: 'middle' }}
										/>
										{formatDateTime(request.newStartDate)} - {formatDateTime(request.newEndDate)}
									</Typography>
								</Box>
							</Stack>
						)}

						<Typography
							variant="body2"
							color="text.secondary"
						>
							<strong>Requested:</strong> {formatDateTime(request.requestedAt)}
							{request.approvedAt && (
								<>
									{' '}
									• <strong>Processed:</strong> {formatDateTime(request.approvedAt)}
								</>
							)}
						</Typography>

						{request.comments && (
							<Alert
								severity="info"
								sx={{ mt: 2 }}
							>
								<Stack
									direction="row"
									spacing={1}
									alignItems="flex-start"
								>
									<CommentIcon fontSize="small" />
									<Typography variant="body2">{request.comments}</Typography>
								</Stack>
							</Alert>
						)}
					</Box>
				</Stack>
			</CardContent>

			{showActions && request.status === 'PENDING' && (
				<CardActions>
					<Stack
						direction="row"
						spacing={1}
						sx={{ ml: 'auto' }}
					>
						<Button
							size="small"
							color="error"
							startIcon={<RejectIcon />}
							onClick={() => handleResponse(request, 'REJECT', '')}
						>
							Reject
						</Button>
						<Button
							variant="contained"
							size="small"
							color="success"
							startIcon={<ApproveIcon />}
							onClick={() => handleResponse(request, 'APPROVE', '')}
						>
							Approve
						</Button>
					</Stack>
				</CardActions>
			)}

			{!showActions && request.status === 'PENDING' && (
				<CardActions>
					<Button
						size="small"
						color="error"
						startIcon={<CancelIcon />}
						onClick={() => handleCancel(request)}
						disabled={false}
					>
						Cancel Request
					</Button>
				</CardActions>
			)}
		</Card>
	);

	const receivedPendingCount = receivedRequests.filter((r) => r.status === 'PENDING').length;

	return (
		<Box sx={{ p: 3 }}>
			{/* Header */}
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ mb: 3 }}
			>
				<PageTitle
					title="Reassignment Requests"
					subtitle="Manage reservation reassignment requests"
				/>

				<Tooltip title="Refresh">
					<IconButton
						onClick={refreshData}
						disabled={loading.requests}
					>
						{loading.requests ? <CircularProgress size={20} /> : <RefreshIcon />}
					</IconButton>
				</Tooltip>
			</Stack>

			{error && (
				<Alert
					severity="error"
					sx={{ mb: 3 }}
				>
					{error}
				</Alert>
			)}

			{/* Tabs */}
			<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
				<Tabs
					value={selectedTab}
					onChange={handleTabChange}
				>
					<Tab
						label={
							<Badge
								badgeContent={receivedPendingCount}
								color="error"
							>
								Received Requests
							</Badge>
						}
					/>
					<Tab label="Sent Requests" />
				</Tabs>
			</Box>

			{/* Received Requests Tab */}
			<TabPanel
				value={selectedTab}
				index={0}
			>
				{loading.requests ? (
					<Box
						display="flex"
						justifyContent="center"
						py={4}
					>
						<CircularProgress />
					</Box>
				) : receivedRequests.length === 0 ? (
					<Alert severity="info">
						No reassignment requests received yet. When someone requests to reassign a reservation to you,
						it will appear here.
					</Alert>
				) : (
					<Stack spacing={2}>
						{receivedRequests.map((request) => renderReassignmentCard(request, true))}
					</Stack>
				)}
			</TabPanel>

			{/* Sent Requests Tab */}
			<TabPanel
				value={selectedTab}
				index={1}
			>
				{loading.requests ? (
					<Box
						display="flex"
						justifyContent="center"
						py={4}
					>
						<CircularProgress />
					</Box>
				) : sentRequests.length === 0 ? (
					<Alert severity="info">
						No reassignment requests sent yet. You can create reassignment requests from your reservations
						page.
					</Alert>
				) : (
					<Stack spacing={2}>{sentRequests.map((request) => renderReassignmentCard(request, false))}</Stack>
				)}
			</TabPanel>

			{/* Response Dialog */}
			<ResponseDialog
				open={responseDialogOpen}
				onClose={() => {
					setResponseDialog({ request: null });
					setResponseDialogOpen(false);
				}}
				request={responseDialog.request}
				onSubmit={handleResponseSubmit}
				loading={loading?.respond || false}
			/>
		</Box>
	);
}
