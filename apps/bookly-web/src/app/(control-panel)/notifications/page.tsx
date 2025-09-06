'use client';

import { useState, useEffect, useCallback } from 'react';
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
	Stack,
	Pagination,
	IconButton,
	Tooltip
} from '@mui/material';
import {
	Refresh as RefreshIcon,
	Send as SendIcon,
	Visibility as ViewIcon,
	Email as EmailIcon,
	Sms as SmsIcon,
	WhatsApp as WhatsAppIcon,
	Notifications as NotificationsIcon
} from '@mui/icons-material';

import { PageTitle } from '@components/atoms';
import { useNotification } from '@hooks/useStockpile';
import {
	SentNotification,
	NotificationChannelType,
	NotificationStatus,
	NotificationFilter,
	NotificationStats
} from '@services/stockpile';

const statusColors = {
	[NotificationStatus.PENDING]: 'warning',
	[NotificationStatus.SENT]: 'info',
	[NotificationStatus.DELIVERED]: 'success',
	[NotificationStatus.READ]: 'primary',
	[NotificationStatus.FAILED]: 'error'
} as const;

const channelIcons = {
	[NotificationChannelType.EMAIL]: <EmailIcon />,
	[NotificationChannelType.SMS]: <SmsIcon />,
	[NotificationChannelType.WHATSAPP]: <WhatsAppIcon />,
	[NotificationChannelType.IN_APP]: <NotificationsIcon />,
	[NotificationChannelType.PUSH]: <SendIcon />
};

export default function NotificationsPage() {
	const [notifications, setNotifications] = useState<SentNotification[]>([]);
	const [stats, setStats] = useState<NotificationStats | null>(null);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [filter, setFilter] = useState<NotificationFilter>({});

	const { getNotifications, getNotificationStats, retryNotification, deleteNotification } = useNotification();

	const loadNotifications = useCallback(async () => {
		setLoading(true);
		const result = await getNotifications({ ...filter, page });

		if (result) {
			setNotifications(result.data);
			setTotalPages(result.totalPages);
		}

		setLoading(false);
	}, [getNotifications, filter, page]);

	const loadStats = useCallback(async () => {
		const result = await getNotificationStats();

		if (result) {
			setStats(result);
		}
	}, [getNotificationStats]);

	useEffect(() => {
		loadNotifications();
		loadStats();
	}, [loadNotifications, loadStats]);

	const handleMarkAsRead = async (id: string) => {
		// Mark as read functionality - to be implemented
		void id;
		loadNotifications();
	};

	const handleResend = async (id: string) => {
		await retryNotification(id);
		loadNotifications();
		loadStats();
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
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<PageTitle title="Notifications" />
					<Button
						variant="outlined"
						startIcon={<RefreshIcon />}
						onClick={loadNotifications}
					>
						Refresh
					</Button>
				</Box>

				{stats && (
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
							gap: 2
						}}
					>
						<Box>
							<Card>
								<CardContent>
									<Typography
										color="textSecondary"
										gutterBottom
									>
										Sent Today
									</Typography>
									<Typography variant="h4">{stats.sentToday}</Typography>
								</CardContent>
							</Card>
						</Box>
						<Box>
							<Card>
								<CardContent>
									<Typography
										color="textSecondary"
										gutterBottom
									>
										Delivery Rate
									</Typography>
									<Typography variant="h4">{Math.round(stats.deliveryRate)}%</Typography>
								</CardContent>
							</Card>
						</Box>
						<Box>
							<Card>
								<CardContent>
									<Typography
										color="textSecondary"
										gutterBottom
									>
										Email Sent
									</Typography>
									<Typography variant="h4">{stats.byChannel.EMAIL || 0}</Typography>
								</CardContent>
							</Card>
						</Box>
						<Box>
							<Card>
								<CardContent>
									<Typography
										color="textSecondary"
										gutterBottom
									>
										Failed
									</Typography>
									<Typography
										variant="h4"
										color="error.main"
									>
										{stats.failedCount}
									</Typography>
								</CardContent>
							</Card>
						</Box>
					</Box>
				)}

				{/* Error handling placeholder - to be implemented with actual error state */}

				<Card>
					<CardContent>
						<TableContainer
							component={Paper}
							elevation={0}
						>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>Channel</TableCell>
										<TableCell>Recipient</TableCell>
										<TableCell>Subject</TableCell>
										<TableCell>Status</TableCell>
										<TableCell>Sent At</TableCell>
										<TableCell>Delivered At</TableCell>
										<TableCell>Actions</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{loading ? (
										<TableRow>
											<TableCell
												colSpan={7}
												align="center"
											>
												Loading notifications...
											</TableCell>
										</TableRow>
									) : notifications.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={7}
												align="center"
											>
												No notifications found
											</TableCell>
										</TableRow>
									) : (
										notifications.map((notification) => (
											<TableRow key={notification.id}>
												<TableCell>
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
														{channelIcons[notification.channel]}
														{notification.channel}
													</Box>
												</TableCell>
												<TableCell>{notification.recipientId}</TableCell>
												<TableCell>
													<Typography
														variant="body2"
														noWrap
													>
														{notification.subject || 'No Subject'}
													</Typography>
												</TableCell>
												<TableCell>
													<Chip
														label={notification.status}
														color={
															statusColors[notification.status] as
																| 'success'
																| 'warning'
																| 'info'
														}
														size="small"
													/>
												</TableCell>
												<TableCell>
													<Typography variant="caption">
														{notification.sentAt
															? formatDate(notification.sentAt)
															: 'Not sent'}
													</Typography>
												</TableCell>
												<TableCell>
													<Typography variant="caption">
														{notification.deliveredAt
															? formatDate(notification.deliveredAt)
															: '-'}
													</Typography>
												</TableCell>
												<TableCell>
													<Stack
														direction="row"
														spacing={1}
													>
														{notification.status === NotificationStatus.DELIVERED && (
															<Tooltip title="Mark as Read">
																<IconButton
																	size="small"
																	onClick={() => handleMarkAsRead(notification.id)}
																>
																	<ViewIcon />
																</IconButton>
															</Tooltip>
														)}
														{notification.status === NotificationStatus.FAILED && (
															<Tooltip title="Resend">
																<IconButton
																	size="small"
																	color="primary"
																	onClick={() => handleResend(notification.id)}
																>
																	<SendIcon />
																</IconButton>
															</Tooltip>
														)}
													</Stack>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>

						{totalPages > 1 && (
							<Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
								<Pagination
									count={totalPages}
									page={page}
									onChange={(_, newPage) => setPage(newPage)}
									color="primary"
								/>
							</Box>
						)}
					</CardContent>
				</Card>
			</Stack>
		</Box>
	);
}
