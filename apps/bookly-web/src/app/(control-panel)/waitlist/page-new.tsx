'use client';

import { useState, useCallback, useMemo } from 'react';
import {
	Box,
	Typography,
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
	Tooltip
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

import { PageHeader } from '@components/organisms';
import { Button, LoadingSpinner } from '@components/atoms';
import { useWaitlist } from '@hooks/useWaitlist';
import { NotificationStatus, WaitlistEntry, WaitlistNotification, WaitlistStatus } from '@services/availability/types';

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

// Waitlist Entry Card Component
interface WaitlistEntryCardProps {
	entry: WaitlistEntry;
	onCancel: (entry: WaitlistEntry) => void;
	onEdit?: (entry: WaitlistEntry) => void;
}

function WaitlistEntryCard({ entry, onCancel, onEdit }: WaitlistEntryCardProps) {
	const statusConfig = STATUS_CONFIG[entry.status];
	const priorityConfig = PRIORITY_CONFIG[entry.priority];

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

	return (
		<Card sx={{ mb: 2 }}>
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
								color={statusConfig.color as 'primary' | 'warning' | 'success' | 'error' | 'default'}
								size="small"
							/>
							<Chip
								label={priorityConfig.label}
								color={priorityConfig.color as 'success' | 'warning' | 'error'}
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
								{formatDateTime(entry.requestedStartDate)} - {formatDateTime(entry.requestedEndDate)}
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
							{onEdit && (
								<Tooltip title="Edit entry">
									<IconButton
										size="small"
										color="primary"
										onClick={() => onEdit(entry)}
									>
										<EditIcon />
									</IconButton>
								</Tooltip>
							)}

							<Button
								size="small"
								startIcon={<CancelIcon />}
								onClick={() => onCancel(entry)}
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
}

// Notification Card Component
interface NotificationCardProps {
	notification: WaitlistNotification;
	onAccept: (notification: WaitlistNotification) => void;
	onDecline: (notification: WaitlistNotification) => void;
	loading?: boolean;
}

function NotificationCard({ notification, onAccept, onDecline, loading = false }: NotificationCardProps) {
	const isExpired = notification.expiresAt < new Date();

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

	return (
		<Card sx={{ mb: 2 }}>
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
						sx={{
							p: 2,
							bgcolor: 'success.50',
							borderRadius: 1,
							border: 1,
							borderColor: 'success.200'
						}}
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
									{formatDateTime(notification.availableStartDate)} -{' '}
									{formatDateTime(notification.availableEndDate)}
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

			{!isExpired && notification.status === NotificationStatus.SENT && (
				<CardActions>
					<Stack
						direction="row"
						spacing={1}
						sx={{ ml: 'auto' }}
					>
						<Button
							startIcon={<DeclineIcon />}
							onClick={() => onDecline(notification)}
							disabled={loading}
						>
							Decline
						</Button>

						<Button
							variant="contained"
							startIcon={<AcceptIcon />}
							onClick={() => onAccept(notification)}
							disabled={loading}
							color="success"
						>
							Accept & Reserve
						</Button>
					</Stack>
				</CardActions>
			)}
		</Card>
	);
}

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

	const handleAcceptNotification = useCallback(
		(notification: WaitlistNotification) => {
			handleNotificationResponse(notification, 'ACCEPT');
		},
		[handleNotificationResponse]
	);

	const handleDeclineNotification = useCallback(
		(notification: WaitlistNotification) => {
			handleNotificationResponse(notification, 'DECLINE');
		},
		[handleNotificationResponse]
	);

	const handleEditEntry = useCallback((entry: WaitlistEntry) => {
		// TODO: Implement edit functionality
		console.error('Edit entry:', entry);
	}, []);

	// Memoized computed values
	const activeNotifications = useMemo(
		() => notifications.filter((n) => n.status === 'SENT' && n.expiresAt > new Date()),
		[notifications]
	);

	const activeEntries = useMemo(() => myEntries.filter((e) => e.status === WaitlistStatus.ACTIVE), [myEntries]);

	// Page header props
	const pageHeaderProps = {
		title: 'Waiting List',
		subtitle: 'Manage your resource waiting list entries and notifications',
		icon: <WaitlistIcon />,
		actions: (
			<Button
				variant="outlined"
				startIcon={<RefreshIcon />}
				onClick={refreshData}
				disabled={loading.entries || loading.notifications}
			>
				Refresh
			</Button>
		)
	};

	return (
		<Box sx={{ p: 3 }}>
			{/* Page Header */}
			<PageHeader {...pageHeaderProps} />

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
						<LoadingSpinner />
					</Box>
				) : notifications.length === 0 ? (
					<Alert severity="info">
						<Typography variant="body2">
							No notifications at this time. You'll be notified here when resources become available.
						</Typography>
					</Alert>
				) : (
					<Stack spacing={2}>
						{notifications.map((notification) => (
							<NotificationCard
								key={notification.id}
								notification={notification}
								onAccept={handleAcceptNotification}
								onDecline={handleDeclineNotification}
								loading={loading.respond}
							/>
						))}
					</Stack>
				)}
			</TabPanel>

			{/* Waiting List Tab */}
			<TabPanel
				value={selectedTab}
				index={1}
			>
				{loading.entries ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
						<LoadingSpinner />
					</Box>
				) : myEntries.length === 0 ? (
					<Alert severity="info">
						<Typography variant="body2">
							You're not currently on any waiting lists. When you try to reserve a resource that's
							unavailable, you'll have the option to join its waiting list.
						</Typography>
					</Alert>
				) : (
					<Stack spacing={2}>
						{myEntries.map((entry) => (
							<WaitlistEntryCard
								key={entry.id}
								entry={entry}
								onCancel={() => setCancelDialog({ open: true, entry })}
								onEdit={handleEditEntry}
							/>
						))}
					</Stack>
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
						loading={loading.cancel}
					>
						Cancel Entry
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
