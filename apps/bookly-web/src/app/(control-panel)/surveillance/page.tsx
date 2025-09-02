'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControlLabel,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Stack,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography
} from '@mui/material';
import {
	Security as SecurityIcon,
	CheckCircle as CheckInIcon,
	Cancel as CheckOutIcon,
	Warning as WarningIcon,
	Refresh as RefreshIcon,
	Notifications as NotificationsIcon,
	Print as PrintIcon
} from '@mui/icons-material';

import { PageTitle } from '@components/atoms';
import { useApprovalRequest, useDocumentGeneration } from '@hooks/useStockpile';
import { ApprovalDashboardStats } from '@services/stockpile';

interface ActiveReservation {
	id: string;
	resourceName: string;
	resourceLocation: string;
	userName: string;
	userEmail: string;
	startTime: Date;
	endTime: Date;
	status: 'APPROVED' | 'IN_PROGRESS' | 'OVERDUE';
	checkedIn: boolean;
	checkedOut: boolean;
	approvedBy: string;
	documentId?: string;
}

interface SecurityAlert {
	id: string;
	type: 'OVERDUE' | 'UNAUTHORIZED' | 'EMERGENCY' | 'MAINTENANCE';
	message: string;
	resourceName: string;
	timestamp: Date;
	resolved: boolean;
}

export default function SurveillancePage() {
	// State management
	const [activeReservations, setActiveReservations] = useState<ActiveReservation[]>([]);
	const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
	const [_stats, setStats] = useState<ApprovalDashboardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedReservation, setSelectedReservation] = useState<ActiveReservation | null>(null);
	const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
	const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false);
	const [autoRefresh, setAutoRefresh] = useState(true);
	const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

	// Hooks
	const {
		loading: _requestLoading,
		error: _requestError,
		getPendingRequests: _getPendingRequests,
		getDashboardStats
	} = useApprovalRequest();

	const { downloadDocument } = useDocumentGeneration();

	// Mock data for active reservations (replace with real API calls)
	const loadActiveReservations = useCallback(async () => {
		// This would be replaced with actual API call
		const mockReservations: ActiveReservation[] = [
			{
				id: '1',
				resourceName: 'Aula Magna',
				resourceLocation: 'Building A, Floor 2',
				userName: 'Dr. Juan Pérez',
				userEmail: 'juan.perez@ufps.edu.co',
				startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
				endTime: new Date(Date.now() + 90 * 60 * 1000), // 90 minutes from now
				status: 'IN_PROGRESS',
				checkedIn: true,
				checkedOut: false,
				approvedBy: 'Admin User',
				documentId: 'doc-123'
			},
			{
				id: '2',
				resourceName: 'Laboratorio de Sistemas',
				resourceLocation: 'Building B, Floor 1',
				userName: 'Prof. María García',
				userEmail: 'maria.garcia@ufps.edu.co',
				startTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
				endTime: new Date(Date.now() + 135 * 60 * 1000), // 2 hours 15 minutes from now
				status: 'APPROVED',
				checkedIn: false,
				checkedOut: false,
				approvedBy: 'Admin User',
				documentId: 'doc-124'
			},
			{
				id: '3',
				resourceName: 'Sala de Conferencias',
				resourceLocation: 'Building C, Floor 3',
				userName: 'Dr. Carlos López',
				userEmail: 'carlos.lopez@ufps.edu.co',
				startTime: new Date(Date.now() - 150 * 60 * 1000), // 2.5 hours ago
				endTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
				status: 'OVERDUE',
				checkedIn: true,
				checkedOut: false,
				approvedBy: 'Admin User',
				documentId: 'doc-125'
			}
		];

		setActiveReservations(mockReservations);
	}, []);

	// Mock data for security alerts
	const loadSecurityAlerts = useCallback(async () => {
		const mockAlerts: SecurityAlert[] = [
			{
				id: '1',
				type: 'OVERDUE',
				message: 'Reservation has exceeded time limit by 30 minutes',
				resourceName: 'Sala de Conferencias',
				timestamp: new Date(Date.now() - 15 * 60 * 1000),
				resolved: false
			},
			{
				id: '2',
				type: 'UNAUTHORIZED',
				message: 'Attempted access without valid reservation',
				resourceName: 'Aula Magna',
				timestamp: new Date(Date.now() - 45 * 60 * 1000),
				resolved: false
			},
			{
				id: '3',
				type: 'MAINTENANCE',
				message: 'Equipment maintenance required',
				resourceName: 'Laboratorio de Sistemas',
				timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
				resolved: true
			}
		];

		setSecurityAlerts(mockAlerts);
	}, []);

	const loadStats = useCallback(async () => {
		const result = await getDashboardStats();

		if (result) {
			setStats(result);
		}
	}, [getDashboardStats]);

	const loadData = useCallback(async () => {
		setLoading(true);
		await Promise.all([loadActiveReservations(), loadSecurityAlerts(), loadStats()]);
		setLoading(false);
	}, [loadActiveReservations, loadSecurityAlerts, loadStats]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// Auto refresh functionality
	useEffect(() => {
		if (autoRefresh) {
			const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
			setRefreshInterval(interval);
			return () => clearInterval(interval);
		} else {
			if (refreshInterval) {
				clearInterval(refreshInterval);
				setRefreshInterval(null);
			}
		}
	}, [autoRefresh, loadData, refreshInterval]);

	// Event handlers
	const handleCheckIn = (reservation: ActiveReservation) => {
		setSelectedReservation(reservation);
		setCheckInDialogOpen(true);
	};

	const handleCheckOut = (reservation: ActiveReservation) => {
		setSelectedReservation(reservation);
		setCheckOutDialogOpen(true);
	};

	const handleConfirmCheckIn = async () => {
		if (!selectedReservation) return;

		// Update reservation status (replace with API call)
		setActiveReservations((prev) =>
			prev.map((res) =>
				res.id === selectedReservation.id ? { ...res, checkedIn: true, status: 'IN_PROGRESS' as const } : res
			)
		);

		setCheckInDialogOpen(false);
		setSelectedReservation(null);
	};

	const handleConfirmCheckOut = async () => {
		if (!selectedReservation) return;

		// Update reservation status (replace with API call)
		setActiveReservations((prev) =>
			prev.map((res) => (res.id === selectedReservation.id ? { ...res, checkedOut: true } : res))
		);

		setCheckOutDialogOpen(false);
		setSelectedReservation(null);
	};

	const handleDownloadDocument = async (documentId: string, reservationId: string) => {
		await downloadDocument(documentId, `reservation-${reservationId}.pdf`);
	};

	const handleResolveAlert = (alertId: string) => {
		setSecurityAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, resolved: true } : alert)));
	};

	const getStatusColor = (status: ActiveReservation['status']) => {
		switch (status) {
			case 'APPROVED':
				return 'info';
			case 'IN_PROGRESS':
				return 'success';
			case 'OVERDUE':
				return 'error';
			default:
				return 'default';
		}
	};

	const getAlertColor = (type: SecurityAlert['type']) => {
		switch (type) {
			case 'EMERGENCY':
				return 'error';
			case 'OVERDUE':
				return 'warning';
			case 'UNAUTHORIZED':
				return 'error';
			case 'MAINTENANCE':
				return 'info';
			default:
				return 'default';
		}
	};

	const formatTime = (date: Date): string => {
		return new Intl.DateTimeFormat('es-CO', {
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	};

	const formatDateTime = (date: Date): string => {
		return new Intl.DateTimeFormat('es-CO', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	};

	const unresolvedAlerts = securityAlerts.filter((alert) => !alert.resolved);
	const activeCount = activeReservations.filter((res) => res.status === 'IN_PROGRESS').length;
	const overdueCount = activeReservations.filter((res) => res.status === 'OVERDUE').length;

	return (
		<Box sx={{ p: 3 }}>
			<Stack spacing={3}>
				{/* Header */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<PageTitle title="Security Control Panel" />
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
					>
						<FormControlLabel
							control={
								<Switch
									checked={autoRefresh}
									onChange={(e) => setAutoRefresh(e.target.checked)}
								/>
							}
							label="Auto Refresh"
						/>
						<Button
							variant="outlined"
							startIcon={<RefreshIcon />}
							onClick={loadData}
							disabled={loading}
						>
							Refresh
						</Button>
					</Stack>
				</Box>

				{/* Alert Banner */}
				{unresolvedAlerts.length > 0 && (
					<Alert
						severity="warning"
						icon={<WarningIcon />}
						action={
							<Button
								color="inherit"
								size="small"
							>
								View All ({unresolvedAlerts.length})
							</Button>
						}
					>
						{unresolvedAlerts.length} unresolved security alert{unresolvedAlerts.length !== 1 ? 's' : ''}{' '}
						require attention
					</Alert>
				)}

				{/* Stats Overview */}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: {
							xs: '1fr',
							sm: 'repeat(2, 1fr)',
							md: 'repeat(4, 1fr)'
						},
						gap: 3
					}}
				>
					<Box>
						<Card>
							<CardContent>
								<Stack
									direction="row"
									alignItems="center"
									spacing={2}
								>
									<SecurityIcon color="primary" />
									<Box>
										<Typography
											variant="h4"
											color="primary"
										>
											{activeReservations.length}
										</Typography>
										<Typography color="textSecondary">Total Reservations</Typography>
									</Box>
								</Stack>
							</CardContent>
						</Card>
					</Box>
					<Box>
						<Card>
							<CardContent>
								<Stack
									direction="row"
									alignItems="center"
									spacing={2}
								>
									<CheckInIcon color="success" />
									<Box>
										<Typography
											variant="h4"
											color="success.main"
										>
											{activeCount}
										</Typography>
										<Typography color="textSecondary">Active Now</Typography>
									</Box>
								</Stack>
							</CardContent>
						</Card>
					</Box>
					<Box>
						<Card>
							<CardContent>
								<Stack
									direction="row"
									alignItems="center"
									spacing={2}
								>
									<WarningIcon color="error" />
									<Box>
										<Typography
											variant="h4"
											color="error.main"
										>
											{overdueCount}
										</Typography>
										<Typography color="textSecondary">Overdue</Typography>
									</Box>
								</Stack>
							</CardContent>
						</Card>
					</Box>
					<Box>
						<Card>
							<CardContent>
								<Stack
									direction="row"
									alignItems="center"
									spacing={2}
								>
									<NotificationsIcon color="warning" />
									<Box>
										<Typography
											variant="h4"
											color="warning.main"
										>
											{unresolvedAlerts.length}
										</Typography>
										<Typography color="textSecondary">Active Alerts</Typography>
									</Box>
								</Stack>
							</CardContent>
						</Card>
					</Box>
				</Box>

				{/* Main Content */}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: {
							xs: '1fr',
							lg: '2fr 1fr'
						},
						gap: 3
					}}
				>
					<Box>
						<Card>
							<CardContent>
								<Typography
									variant="h6"
									gutterBottom
								>
									Active Reservations
								</Typography>
								<TableContainer>
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell>Resource</TableCell>
												<TableCell>User</TableCell>
												<TableCell>Time</TableCell>
												<TableCell>Status</TableCell>
												<TableCell align="center">Actions</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{activeReservations.map((reservation) => (
												<TableRow key={reservation.id}>
													<TableCell>
														<Stack>
															<Typography
																variant="body2"
																fontWeight="medium"
															>
																{reservation.resourceName}
															</Typography>
															<Typography
																variant="caption"
																color="textSecondary"
															>
																{reservation.resourceLocation}
															</Typography>
														</Stack>
													</TableCell>
													<TableCell>
														<Stack>
															<Typography variant="body2">
																{reservation.userName}
															</Typography>
															<Typography
																variant="caption"
																color="textSecondary"
															>
																{reservation.userEmail}
															</Typography>
														</Stack>
													</TableCell>
													<TableCell>
														<Stack>
															<Typography variant="body2">
																{formatTime(reservation.startTime)} -{' '}
																{formatTime(reservation.endTime)}
															</Typography>
															<Typography
																variant="caption"
																color="textSecondary"
															>
																Approved by {reservation.approvedBy}
															</Typography>
														</Stack>
													</TableCell>
													<TableCell>
														<Chip
															label={reservation.status.replace('_', ' ')}
															color={getStatusColor(reservation.status)}
															size="small"
														/>
													</TableCell>
													<TableCell align="center">
														<Stack
															direction="row"
															spacing={1}
														>
															{!reservation.checkedIn && (
																<Tooltip title="Check In">
																	<IconButton
																		size="small"
																		color="success"
																		onClick={() => handleCheckIn(reservation)}
																	>
																		<CheckInIcon />
																	</IconButton>
																</Tooltip>
															)}
															{reservation.checkedIn && !reservation.checkedOut && (
																<Tooltip title="Check Out">
																	<IconButton
																		size="small"
																		color="error"
																		onClick={() => handleCheckOut(reservation)}
																	>
																		<CheckOutIcon />
																	</IconButton>
																</Tooltip>
															)}
															{reservation.documentId && (
																<Tooltip title="Download Document">
																	<IconButton
																		size="small"
																		onClick={() =>
																			handleDownloadDocument(
																				reservation.documentId!,
																				reservation.id
																			)
																		}
																	>
																		<PrintIcon />
																	</IconButton>
																</Tooltip>
															)}
														</Stack>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
								{activeReservations.length === 0 && (
									<Box sx={{ textAlign: 'center', py: 4 }}>
										<Typography color="textSecondary">
											No active reservations at this time
										</Typography>
									</Box>
								)}
							</CardContent>
						</Card>
					</Box>

					{/* Security Alerts */}
					<Box>
						<Card>
							<CardContent>
								<Typography
									variant="h6"
									gutterBottom
								>
									Security Alerts
								</Typography>
								<List dense>
									{securityAlerts.slice(0, 10).map((alert, index) => (
										<React.Fragment key={alert.id}>
											{index > 0 && <Divider />}
											<ListItem
												sx={{
													opacity: alert.resolved ? 0.6 : 1
												}}
											>
												<ListItemIcon>
													<Chip
														label={alert.type}
														color={getAlertColor(alert.type)}
														size="small"
													/>
												</ListItemIcon>
												<ListItemText
													primary={alert.message}
													secondary={
														<Stack>
															<Typography variant="caption">
																{alert.resourceName}
															</Typography>
															<Typography
																variant="caption"
																color="textSecondary"
															>
																{formatDateTime(alert.timestamp)}
															</Typography>
														</Stack>
													}
												/>
												{!alert.resolved && (
													<Button
														size="small"
														onClick={() => handleResolveAlert(alert.id)}
													>
														Resolve
													</Button>
												)}
											</ListItem>
										</React.Fragment>
									))}
								</List>
								{securityAlerts.length === 0 && (
									<Box sx={{ textAlign: 'center', py: 4 }}>
										<Typography color="textSecondary">No security alerts</Typography>
									</Box>
								)}
							</CardContent>
						</Card>
					</Box>
				</Box>
			</Stack>

			{/* Check-In Dialog */}
			<Dialog
				open={checkInDialogOpen}
				onClose={() => setCheckInDialogOpen(false)}
			>
				<DialogTitle>Confirm Check-In</DialogTitle>
				<DialogContent>
					{selectedReservation && (
						<Box>
							<Typography gutterBottom>
								<strong>Resource:</strong> {selectedReservation.resourceName}
							</Typography>
							<Typography gutterBottom>
								<strong>User:</strong> {selectedReservation.userName}
							</Typography>
							<Typography gutterBottom>
								<strong>Time:</strong> {formatTime(selectedReservation.startTime)} -{' '}
								{formatTime(selectedReservation.endTime)}
							</Typography>
							<Alert
								severity="info"
								sx={{ mt: 2 }}
							>
								Please verify the user's identity before confirming check-in.
							</Alert>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCheckInDialogOpen(false)}>Cancel</Button>
					<Button
						variant="contained"
						color="success"
						onClick={handleConfirmCheckIn}
					>
						Confirm Check-In
					</Button>
				</DialogActions>
			</Dialog>

			{/* Check-Out Dialog */}
			<Dialog
				open={checkOutDialogOpen}
				onClose={() => setCheckOutDialogOpen(false)}
			>
				<DialogTitle>Confirm Check-Out</DialogTitle>
				<DialogContent>
					{selectedReservation && (
						<Box>
							<Typography gutterBottom>
								<strong>Resource:</strong> {selectedReservation.resourceName}
							</Typography>
							<Typography gutterBottom>
								<strong>User:</strong> {selectedReservation.userName}
							</Typography>
							<Typography gutterBottom>
								<strong>Time:</strong> {formatTime(selectedReservation.startTime)} -{' '}
								{formatTime(selectedReservation.endTime)}
							</Typography>
							<Alert
								severity="warning"
								sx={{ mt: 2 }}
							>
								Please ensure the resource is left in good condition before confirming check-out.
							</Alert>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCheckOutDialogOpen(false)}>Cancel</Button>
					<Button
						variant="contained"
						color="error"
						onClick={handleConfirmCheckOut}
					>
						Confirm Check-Out
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
