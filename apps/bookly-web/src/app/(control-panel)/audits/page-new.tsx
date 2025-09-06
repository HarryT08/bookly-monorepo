'use client';

import { useState, useEffect } from 'react';
import { Button, Box, Typography, Tooltip, IconButton } from '@mui/material';
import {
	Download as DownloadIcon,
	Visibility as VisibilityIcon,
	Person as PersonIcon,
	Security as SecurityIcon,
	Storage as StorageIcon,
	Assignment as AssignmentIcon
} from '@mui/icons-material';
import { DataTablePageTemplate } from '../../../components/templates/DataTablePageTemplate';
import { AuditDetailsDialog, AuditLog } from '../../../components/organisms/AuditDetailsDialog';
import { StatusChip } from '../../../components/atoms/StatusChip';
import { StatCardProps } from '../../../components/molecules/StatCard';
import { FilterOption } from '../../../components/molecules/FilterBar';
import { DataTableColumn } from '../../../components/organisms/DataTable';

export default function AuditsPage() {
	const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<string>('');
	const [severityFilter, setSeverityFilter] = useState<string>('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
	const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
	const [stats, setStats] = useState({
		totalLogs: 0,
		criticalEvents: 0,
		todayEvents: 0,
		failedLogins: 0
	});

	useEffect(() => {
		const fetchAuditLogs = async () => {
			try {
				setLoading(true);
				await new Promise((resolve) => setTimeout(resolve, 1000));

				const mockLogs: AuditLog[] = [
					{
						id: '1',
						timestamp: '2024-01-15T10:30:00Z',
						userId: '1',
						userEmail: 'admin@ufps.edu.co',
						userName: 'Admin Sistema',
						action: 'LOGIN_SUCCESS',
						resource: 'AUTH',
						resourceId: 'auth-session-123',
						details: { sessionId: 'sess_123', location: 'Cúcuta, Colombia' },
						ipAddress: '192.168.1.100',
						userAgent: 'Mozilla/5.0...',
						severity: 'LOW',
						category: 'AUTH'
					},
					{
						id: '2',
						timestamp: '2024-01-15T10:25:00Z',
						userId: '2',
						userEmail: 'estudiante@ufps.edu.co',
						userName: 'Juan Pérez',
						action: 'RESERVATION_CREATED',
						resource: 'RESERVATION',
						resourceId: 'reservation-456',
						details: {
							resourceName: 'Aula 201',
							startTime: '2024-01-16T08:00:00Z',
							duration: 120
						},
						ipAddress: '192.168.1.105',
						userAgent: 'Mozilla/5.0...',
						severity: 'LOW',
						category: 'RESERVATION'
					},
					{
						id: '3',
						timestamp: '2024-01-15T10:20:00Z',
						userId: '3',
						userEmail: 'docente@ufps.edu.co',
						userName: 'María García',
						action: 'RESOURCE_UPDATED',
						resource: 'RESOURCE',
						resourceId: 'resource-789',
						details: {
							changes: ['capacity', 'equipment'],
							oldCapacity: 30,
							newCapacity: 35
						},
						ipAddress: '192.168.1.110',
						userAgent: 'Mozilla/5.0...',
						severity: 'MEDIUM',
						category: 'RESOURCE'
					},
					{
						id: '4',
						timestamp: '2024-01-15T10:15:00Z',
						userId: 'unknown',
						userEmail: 'hacker@evil.com',
						userName: 'Unknown',
						action: 'LOGIN_FAILED',
						resource: 'AUTH',
						resourceId: 'failed-attempt-001',
						details: {
							reason: 'Invalid credentials',
							attempts: 5,
							blocked: true
						},
						ipAddress: '203.0.113.1',
						userAgent: 'curl/7.68.0',
						severity: 'CRITICAL',
						category: 'AUTH'
					},
					{
						id: '5',
						timestamp: '2024-01-15T09:45:00Z',
						userId: '1',
						userEmail: 'admin@ufps.edu.co',
						userName: 'Admin Sistema',
						action: 'APPROVAL_GRANTED',
						resource: 'APPROVAL',
						resourceId: 'approval-321',
						details: {
							reservationId: 'reservation-456',
							approverNotes: 'Aprobado para evento académico'
						},
						ipAddress: '192.168.1.100',
						userAgent: 'Mozilla/5.0...',
						severity: 'MEDIUM',
						category: 'APPROVAL'
					}
				];

				setAuditLogs(mockLogs);
				setStats({
					totalLogs: mockLogs.length,
					criticalEvents: mockLogs.filter((log) => log.severity === 'CRITICAL').length,
					todayEvents: mockLogs.filter(
						(log) => new Date(log.timestamp).toDateString() === new Date().toDateString()
					).length,
					failedLogins: mockLogs.filter((log) => log.action === 'LOGIN_FAILED').length
				});
			} catch (err) {
				setError('Error al cargar logs de auditoría');
				console.error('Error loading audit logs:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchAuditLogs();
	}, []);

	const filteredLogs = auditLogs.filter((log) => {
		const matchesSearch =
			log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
			log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
			log.resource.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesCategory = !categoryFilter || log.category === categoryFilter;
		const matchesSeverity = !severityFilter || log.severity === severityFilter;

		return matchesSearch && matchesCategory && matchesSeverity;
	});

	const getCategoryIcon = (category: AuditLog['category']) => {
		const icons = {
			AUTH: <PersonIcon sx={{ fontSize: 16 }} />,
			RESOURCE: <StorageIcon sx={{ fontSize: 16 }} />,
			RESERVATION: <AssignmentIcon sx={{ fontSize: 16 }} />,
			APPROVAL: <SecurityIcon sx={{ fontSize: 16 }} />,
			SYSTEM: <SecurityIcon sx={{ fontSize: 16 }} />
		};
		return icons[category];
	};

	const handleViewDetails = (log: AuditLog) => {
		setSelectedLog(log);
		setDetailsDialogOpen(true);
	};

	const handleClearFilters = () => {
		setCategoryFilter('');
		setSeverityFilter('');
		setSearchTerm('');
	};

	// Configure stats for the page
	const pageStats: StatCardProps[] = [
		{
			title: 'Total Eventos',
			value: stats.totalLogs,
			icon: <AssignmentIcon />,
			iconColor: 'primary.main'
		},
		{
			title: 'Eventos Críticos',
			value: stats.criticalEvents,
			icon: <SecurityIcon />,
			iconColor: 'error.main'
		},
		{
			title: 'Eventos Hoy',
			value: stats.todayEvents,
			icon: <StorageIcon />,
			iconColor: 'info.main'
		},
		{
			title: 'Intentos de Login Fallidos',
			value: stats.failedLogins,
			icon: <PersonIcon />,
			iconColor: 'warning.main'
		}
	];

	// Configure filter options
	const categoryOptions: FilterOption[] = [
		{ value: '', label: 'Todas' },
		{ value: 'AUTH', label: 'Autenticación' },
		{ value: 'RESOURCE', label: 'Recursos' },
		{ value: 'RESERVATION', label: 'Reservas' },
		{ value: 'APPROVAL', label: 'Aprobaciones' },
		{ value: 'SYSTEM', label: 'Sistema' }
	];

	const severityOptions: FilterOption[] = [
		{ value: '', label: 'Todas' },
		{ value: 'LOW', label: 'Bajo' },
		{ value: 'MEDIUM', label: 'Medio' },
		{ value: 'HIGH', label: 'Alto' },
		{ value: 'CRITICAL', label: 'Crítico' }
	];

	// Configure table columns
	const columns: DataTableColumn[] = [
		{
			id: 'timestamp',
			label: 'Fecha/Hora',
			format: (value: string) => (
				<Typography variant="body2">
					{new Date(value).toLocaleDateString('es-CO', {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
						second: '2-digit'
					})}
				</Typography>
			)
		},
		{
			id: 'user',
			label: 'Usuario',
			render: (_, row: AuditLog) => (
				<Box>
					<Typography
						variant="body2"
						fontWeight="bold"
					>
						{row.userName}
					</Typography>
					<Typography
						variant="caption"
						color="text.secondary"
					>
						{row.userEmail}
					</Typography>
				</Box>
			)
		},
		{
			id: 'action',
			label: 'Acción',
			render: (_, row: AuditLog) => (
				<Box
					display="flex"
					alignItems="center"
				>
					{getCategoryIcon(row.category)}
					<Typography
						variant="body2"
						sx={{ ml: 1 }}
					>
						{row.action.replace(/_/g, ' ')}
					</Typography>
				</Box>
			)
		},
		{
			id: 'resource',
			label: 'Recurso'
		},
		{
			id: 'severity',
			label: 'Severidad',
			render: (value: AuditLog['severity']) => (
				<StatusChip
					status={value.toLowerCase() as any}
					statusLabels={{
						low: 'Bajo',
						medium: 'Medio',
						high: 'Alto',
						critical: 'Crítico'
					}}
				/>
			)
		},
		{
			id: 'ipAddress',
			label: 'IP',
			render: (value: string) => (
				<Typography
					variant="body2"
					fontFamily="monospace"
				>
					{value}
				</Typography>
			)
		},
		{
			id: 'actions',
			label: 'Detalles',
			align: 'center',
			render: (_, row: AuditLog) => (
				<Tooltip title="Ver detalles">
					<IconButton
						onClick={() => handleViewDetails(row)}
						size="small"
					>
						<VisibilityIcon />
					</IconButton>
				</Tooltip>
			)
		}
	];

	return (
		<>
			<DataTablePageTemplate
				pageHeader={{
					title: 'Auditoría del Sistema',
					actions: (
						<Button
							variant="outlined"
							startIcon={<DownloadIcon />}
						>
							Exportar Logs
						</Button>
					)
				}}
				statsData={pageStats}
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				searchPlaceholder="Buscar logs..."
				columns={columns}
				data={filteredLogs}
				loading={loading}
				error={error}
				emptyMessage="No se encontraron logs de auditoría"
			/>

			<AuditDetailsDialog
				open={detailsDialogOpen}
				onClose={() => setDetailsDialogOpen(false)}
				auditLog={selectedLog}
			/>
		</>
	);
}
