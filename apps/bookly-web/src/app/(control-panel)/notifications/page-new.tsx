'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Tooltip, IconButton, Stack } from '@mui/material';
import {
	Refresh as RefreshIcon,
	Send as SendIcon,
	Visibility as ViewIcon,
	Email as EmailIcon,
	Sms as SmsIcon,
	WhatsApp as WhatsAppIcon,
	Notifications as NotificationsIcon
} from '@mui/icons-material';

import { DataTablePageTemplate } from '../../../components/templates';
import { DataTableColumn, PageHeaderProps } from '../../../components/organisms';
import { StatusChip } from '../../../components/atoms';
import { StatCardProps } from '../../../components/molecules/StatCard/StatCard';
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

const channelLabels = {
	[NotificationChannelType.EMAIL]: 'Email',
	[NotificationChannelType.SMS]: 'SMS',
	[NotificationChannelType.WHATSAPP]: 'WhatsApp',
	[NotificationChannelType.IN_APP]: 'In-App',
	[NotificationChannelType.PUSH]: 'Push'
};

const statusLabels = {
	[NotificationStatus.PENDING]: 'Pendiente',
	[NotificationStatus.SENT]: 'Enviado',
	[NotificationStatus.DELIVERED]: 'Entregado',
	[NotificationStatus.READ]: 'Leído',
	[NotificationStatus.FAILED]: 'Fallido'
};

export default function NotificationsPage() {
	const [notifications, setNotifications] = useState<SentNotification[]>([]);
	const [filteredNotifications, setFilteredNotifications] = useState<SentNotification[]>([]);
	const [stats, setStats] = useState<NotificationStats | null>(null);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [channelFilter, setChannelFilter] = useState<string>('all');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [filter, setFilter] = useState<NotificationFilter>({});

	const { getNotifications, getNotificationStats, retryNotification, deleteNotification } = useNotification();

	const loadNotifications = useCallback(async () => {
		setLoading(true);
		const result = await getNotifications({ ...filter, page });

		if (result) {
			setNotifications(result.data);
			setFilteredNotifications(result.data);
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

	// Filtering logic
	useEffect(() => {
		let filtered = notifications.filter((notification) => {
			const matchesSearch =
				notification.recipientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(notification.subject && notification.subject.toLowerCase().includes(searchTerm.toLowerCase()));

			const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
			const matchesChannel = channelFilter === 'all' || notification.channel === channelFilter;

			return matchesSearch && matchesStatus && matchesChannel;
		});

		setFilteredNotifications(filtered);
	}, [notifications, searchTerm, statusFilter, channelFilter]);

	const handleSearch = (term: string) => {
		setSearchTerm(term);
	};

	const handleStatusFilter = (status: string) => {
		setStatusFilter(status);
	};

	const handleChannelFilter = (channel: string) => {
		setChannelFilter(channel);
	};

	const handleMarkAsRead = async (notification: SentNotification) => {
		// Mark as read functionality - to be implemented
		console.log('Mark as read:', notification);
		loadNotifications();
	};

	const handleResend = async (notification: SentNotification) => {
		await retryNotification(notification.id);
		loadNotifications();
		loadStats();
	};

	const handleRefresh = () => {
		loadNotifications();
		loadStats();
	};

	const formatDate = (date: Date): string => {
		return new Intl.DateTimeFormat('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	};

	const columns: DataTableColumn<SentNotification>[] = [
		{
			id: 'channel',
			label: 'Canal',
			minWidth: 120,
			render: (notification) => (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					{channelIcons[notification.channel]}
					<Typography variant="body2">{channelLabels[notification.channel]}</Typography>
				</Box>
			)
		},
		{
			id: 'recipient',
			label: 'Destinatario',
			minWidth: 180,
			render: (notification) => (
				<Typography variant="body2" fontWeight="medium">
					{notification.recipientId}
				</Typography>
			)
		},
		{
			id: 'subject',
			label: 'Asunto',
			minWidth: 200,
			render: (notification) => (
				<Typography variant="body2" noWrap>
					{notification.subject || 'Sin asunto'}
				</Typography>
			)
		},
		{
			id: 'status',
			label: 'Estado',
			minWidth: 120,
			render: (notification) => (
				<StatusChip
					status={statusColors[notification.status]}
					label={statusLabels[notification.status]}
				/>
			)
		},
		{
			id: 'sentAt',
			label: 'Enviado',
			minWidth: 140,
			render: (notification) => (
				<Typography variant="caption">
					{notification.sentAt ? formatDate(notification.sentAt) : 'No enviado'}
				</Typography>
			)
		},
		{
			id: 'deliveredAt',
			label: 'Entregado',
			minWidth: 140,
			render: (notification) => (
				<Typography variant="caption">
					{notification.deliveredAt ? formatDate(notification.deliveredAt) : '-'}
				</Typography>
			)
		},
		{
			id: 'actions',
			label: 'Acciones',
			minWidth: 100,
			align: 'center',
			render: (notification) => (
				<Stack direction="row" spacing={1}>
					{notification.status === NotificationStatus.DELIVERED && (
						<Tooltip title="Marcar como leído">
							<IconButton size="small" onClick={() => handleMarkAsRead(notification)}>
								<ViewIcon />
							</IconButton>
						</Tooltip>
					)}
					{notification.status === NotificationStatus.FAILED && (
						<Tooltip title="Reenviar">
							<IconButton size="small" color="primary" onClick={() => handleResend(notification)}>
								<SendIcon />
							</IconButton>
						</Tooltip>
					)}
				</Stack>
			)
		}
	];

	const statsCards: StatCardProps[] = stats
		? [
				{
					title: 'Enviadas Hoy',
					value: stats.sentToday.toString(),
					icon: <SendIcon />,
					iconColor: 'primary'
				},
				{
					title: 'Tasa de Entrega',
					value: `${Math.round(stats.deliveryRate)}%`,
					icon: <NotificationsIcon />,
					iconColor: 'success'
				},
				{
					title: 'Emails Enviados',
					value: (stats.byChannel.EMAIL || 0).toString(),
					icon: <EmailIcon />,
					iconColor: 'info'
				},
				{
					title: 'Fallidas',
					value: stats.failedCount.toString(),
					icon: <RefreshIcon />,
					iconColor: 'error'
				}
			]
		: [];

	const filterOptions = [
		{
			label: 'Estado',
			value: statusFilter,
			onChange: handleStatusFilter,
			options: [
				{ value: 'all', label: 'Todos los estados' },
				{ value: NotificationStatus.PENDING, label: 'Pendiente' },
				{ value: NotificationStatus.SENT, label: 'Enviado' },
				{ value: NotificationStatus.DELIVERED, label: 'Entregado' },
				{ value: NotificationStatus.READ, label: 'Leído' },
				{ value: NotificationStatus.FAILED, label: 'Fallido' }
			]
		},
		{
			label: 'Canal',
			value: channelFilter,
			onChange: handleChannelFilter,
			options: [
				{ value: 'all', label: 'Todos los canales' },
				{ value: NotificationChannelType.EMAIL, label: 'Email' },
				{ value: NotificationChannelType.SMS, label: 'SMS' },
				{ value: NotificationChannelType.WHATSAPP, label: 'WhatsApp' },
				{ value: NotificationChannelType.IN_APP, label: 'In-App' },
				{ value: NotificationChannelType.PUSH, label: 'Push' }
			]
		}
	];

	const pageHeaderProps: PageHeaderProps = {
		title: 'Notificaciones',
		subtitle: 'Gestiona y monitorea el historial de notificaciones enviadas',
		actionButton: {
			label: 'Actualizar',
			onClick: handleRefresh,
			icon: 'refresh',
			variant: 'outlined'
		}
	};

	return (
		<DataTablePageTemplate
			pageHeader={pageHeaderProps}
			statsCards={statsCards}
			data={filteredNotifications}
			columns={columns}
			loading={loading}
			searchPlaceholder="Buscar por destinatario o asunto..."
			onSearch={handleSearch}
			filterOptions={filterOptions}
			emptyMessage="No se encontraron notificaciones"
			emptyDescription="No hay notificaciones que coincidan con los criterios de búsqueda."
		/>
	);
}
