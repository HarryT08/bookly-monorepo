'use client';

import { useState, useCallback } from 'react';
import {
	Box,
	Typography,
	Button,
	Card,
	CardContent,
	CardActions,
	Stack,
	Chip,
	Alert,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Tabs,
	Tab,
	Badge,
	Tooltip,
	CircularProgress
} from '@mui/material';
import {
	HourglassEmpty as WaitlistIcon,
	Cancel as CancelIcon,
	Edit as EditIcon,
	Refresh as RefreshIcon,
	Notifications as NotificationIcon,
	CheckCircle as AcceptIcon,
	Close as DeclineIcon,
	Schedule as ScheduleIcon,
	LocationOn as LocationIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

import { PageTitle } from '@components/atoms';
import { useWaitlist } from '@hooks/useWaitlist';
import { WaitlistEntry, WaitlistNotification, WaitlistStatus } from '@services/availability/types';

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
		>
			{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
		</div>
	);
}

const STATUS_CONFIG = {
	[WaitlistStatus.ACTIVE]: { color: 'primary', label: 'Active' },
	[WaitlistStatus.NOTIFIED]: { color: 'warning', label: 'Notified' },
	[WaitlistStatus.FULFILLED]: { color: 'success', label: 'Fulfilled' },
	[WaitlistStatus.EXPIRED]: { color: 'error', label: 'Expired' },
	[WaitlistStatus.CANCELLED]: { color: 'default', label: 'Cancelled' }
} as const;

const PRIORITY_CONFIG = {
	LOW: { color: 'success', label: 'Low' },
	MEDIUM: { color: 'warning', label: 'Medium' },
	HIGH: { color: 'error', label: 'High' }
} as const;

export default function WaitlistPage() {
	const router = useRouter();
	const { myEntries, notifications, loading, error, cancelEntry, respondToNotification, refreshData } = useWaitlist();

	const [selectedTab, setSelectedTab] = useState(0);
	const [cancelDialog, setCancelDialog] = useState<{ open: boolean; entry: WaitlistEntry | null }>({
		open: false,
		entry: null
	});

	const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
		setSelectedTab(newValue);
	}, []);

	const handleCancelEntry = useCallback(
		async (entry: WaitlistEntry) => {
			if (!entry.id) return;

			const success = await cancelEntry(entry.id);

			if (success) {
				setCancelDialog({ open: false, entry: null });
			}
		},
		[cancelEntry]
	);

	const handleNotificationResponse = useCallback(
		async (notification: WaitlistNotification, response: 'ACCEPT' | 'DECLINE') => {
			if (!notification.id) return;

			const success = await respondToNotification(notification.id, response);

			if (success && response === 'ACCEPT') {
				// Optionally navigate to reservations page
				router.push('/reservations');
			}
		},
		[respondToNotification, router]
	);

	const formatDateTime = (date: Date) => {
		return date.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	};

	const getWaitingTime = (createdAt: Date) => {
		const diffMs = Date.now() - createdAt.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

		if (diffDays > 0) {
			return `${diffDays}d ${diffHours}h`;
		} else if (diffHours > 0) {
			return `${diffHours}h`;
		} else {
			return 'Less than 1 hour';
		}
	};

	const renderWaitlistEntry = (entry: WaitlistEntry) => {
		const statusConfig = STATUS_CONFIG[entry.status];
		const priorityConfig = PRIORITY_CONFIG[entry.priority];

		return (
			<Card
				key={entry.id}
				sx={{ mb: 2 }}
			>
				<CardContent>
					<Stack spacing={2}>
						{/* Header */}
						<Stack
							direction="row"
							justifyContent="space-between"
							alignItems="flex-start"
						>
							<Box>
								<Typography
									variant="h6"
									gutterBottom
								>
									{entry.title}
								</Typography>
								<Stack
									direction="row"
									spacing={1}
									alignItems="center"
								>
									<LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
									<Typography
										variant="body2"
										color="text.secondary"
									>
										{entry.resourceName}
									</Typography>
								</Stack>
							</Box>

							<Stack
								direction="row"
								spacing={1}
							>
								<Chip
									label={`Position ${entry.position}`}
									color="primary"
									variant="outlined"
									size="small"
								/>
								<Chip
									label={statusConfig.label}
									color={statusConfig.color as any}
									size="small"
								/>
								<Chip
									label={priorityConfig.label}
									color={priorityConfig.color as any}
									size="small"
								/>
							</Stack>
						</Stack>

						{/* Description */}
						{entry.description && (
							<Typography
								variant="body2"
								color="text.secondary"
							>
								{entry.description}
							</Typography>
						)}

						{/* Time Information */}
						<Stack
							direction="row"
							spacing={3}
						>
							<Box>
								<Typography
									variant="caption"
									display="block"
									color="text.secondary"
								>
									Requested Time
								</Typography>
								<Typography variant="body2">
									{formatDateTime(entry.requestedStartDate)} -{' '}
									{formatDateTime(entry.requestedEndDate)}
								</Typography>
							</Box>

							<Box>
								<Typography
									variant="caption"
									display="block"
									color="text.secondary"
								>
									Waiting Since
								</Typography>
								<Typography variant="body2">{getWaitingTime(entry.createdAt!)} ago</Typography>
							</Box>
						</Stack>

						{/* Expiration Warning */}
						{entry.status === WaitlistStatus.NOTIFIED && entry.expiresAt && (
							<Alert severity="warning">
								<Typography variant="body2">
									<strong>Action Required:</strong> You've been notified of availability. Respond by{' '}
									{formatDateTime(entry.expiresAt)} or your spot will be offered to the next person.
								</Typography>
							</Alert>
						)}
					</Stack>
				</CardContent>

				<CardActions>
					<Stack
						direction="row"
						spacing={1}
						sx={{ ml: 'auto' }}
					>
						{entry.status === WaitlistStatus.ACTIVE && (
							<>
								<Tooltip title="Edit entry">
									<IconButton
										size="small"
										color="primary"
									>
										<EditIcon />
									</IconButton>
								</Tooltip>

								<Button
									size="small"
									startIcon={<CancelIcon />}
									onClick={() => setCancelDialog({ open: true, entry })}
									color="error"
								>
									Cancel
								</Button>
							</>
						)}
					</Stack>
				</CardActions>
			</Card>
		);
	};

	const renderNotification = (notification: WaitlistNotification) => {
		const isExpired = notification.expiresAt < new Date();

		return (
			<Card
				key={notification.id}
				sx={{ mb: 2 }}
			>
				<CardContent>
					<Stack spacing={2}>
						<Stack
							direction="row"
							justifyContent="space-between"
							alignItems="flex-start"
						>
							<Box>
								<Typography
									variant="h6"
									gutterBottom
								>
									Resource Available!
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
								>
									Your requested resource is now available
								</Typography>
							</Box>

							{isExpired && (
								<Chip
									label="Expired"
									color="error"
									size="small"
								/>
							)}
						</Stack>

						<Box
							sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1, border: 1, borderColor: 'success.200' }}
						>
							<Stack
								direction="row"
								spacing={2}
								alignItems="center"
							>
								<ScheduleIcon color="success" />
								<Box>
									<Typography
										variant="body2"
										fontWeight="medium"
									>
										Available Time Slot
									</Typography>
									<Typography variant="body2">
										{formatDateTime(notification.availableSlot.start)} -{' '}
										{formatDateTime(notification.availableSlot.end)}
									</Typography>
								</Box>
							</Stack>
						</Box>

						<Typography
							variant="body2"
							color="text.secondary"
						>
							<strong>Expires:</strong> {formatDateTime(notification.expiresAt)}
							{!isExpired &&
								` (${Math.ceil((notification.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60))} hours remaining)`}
						</Typography>
					</Stack>
				</CardContent>

				{!isExpired && notification.status === 'SENT' && (
					<CardActions>
						<Stack
							direction="row"
							spacing={1}
							sx={{ ml: 'auto' }}
						>
							<Button
								startIcon={<DeclineIcon />}
								onClick={() => handleNotificationResponse(notification, 'DECLINE')}
								disabled={loading.respond}
							>
								Decline
							</Button>

							<Button
								variant="contained"
								startIcon={<AcceptIcon />}
								onClick={() => handleNotificationResponse(notification, 'ACCEPT')}
								disabled={loading.respond}
								color="success"
							>
								Accept & Reserve
							</Button>
						</Stack>
					</CardActions>
				)}
			</Card>
		);
	};

	const activeNotifications = notifications.filter((n) => n.status === 'SENT' && n.expiresAt > new Date());
	const activeEntries = myEntries.filter((e) => e.status === WaitlistStatus.ACTIVE);

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
					title="Waiting List"
					subtitle="Manage your resource waiting list entries and notifications"
				/>

				<Button
					variant="outlined"
					startIcon={<RefreshIcon />}
					onClick={refreshData}
					disabled={loading.entries || loading.notifications}
				>
					Refresh
				</Button>
			</Stack>

			{/* Error Alert */}
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
								badgeContent={activeNotifications.length}
								color="error"
							>
								Notifications
							</Badge>
						}
						icon={<NotificationIcon />}
						iconPosition="start"
					/>
					<Tab
						label={`My Waiting List (${activeEntries.length})`}
						icon={<WaitlistIcon />}
						iconPosition="start"
					/>
				</Tabs>
			</Box>

			{/* Notifications Tab */}
			<TabPanel
				value={selectedTab}
				index={0}
			>
				{loading.notifications ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
						<CircularProgress />
					</Box>
				) : notifications.length === 0 ? (
					<Alert severity="info">
						<Typography variant="body2">
							No notifications at this time. You'll be notified here when resources become available.
						</Typography>
					</Alert>
				) : (
					<Stack spacing={2}>{notifications.map(renderNotification)}</Stack>
				)}
			</TabPanel>

			{/* Waiting List Tab */}
			<TabPanel
				value={selectedTab}
				index={1}
			>
				{loading.entries ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
						<CircularProgress />
					</Box>
				) : myEntries.length === 0 ? (
					<Alert severity="info">
						<Typography variant="body2">
							You're not currently on any waiting lists. When you try to reserve a resource that's
							unavailable, you'll have the option to join its waiting list.
						</Typography>
					</Alert>
				) : (
					<Stack spacing={2}>{myEntries.map(renderWaitlistEntry)}</Stack>
				)}
			</TabPanel>

			{/* Cancel Confirmation Dialog */}
			<Dialog
				open={cancelDialog.open}
				onClose={() => setCancelDialog({ open: false, entry: null })}
			>
				<DialogTitle>Cancel Waiting List Entry</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to cancel your waiting list entry for "{cancelDialog.entry?.title}"? This
						action cannot be undone and you'll lose your current position.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCancelDialog({ open: false, entry: null })}>Keep Entry</Button>
					<Button
						color="error"
						variant="contained"
						onClick={() => cancelDialog.entry && handleCancelEntry(cancelDialog.entry)}
						disabled={loading.cancel}
					>
						{loading.cancel ? 'Cancelling...' : 'Cancel Entry'}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
