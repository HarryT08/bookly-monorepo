'use client';

import { useState, useEffect } from 'react';
import {
	Box,
	Paper,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	InputAdornment,
	Chip,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	CircularProgress,
	Alert,
	Card,
	CardContent,
	TablePagination,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Tooltip,
} from '@mui/material';
import {
	Search as SearchIcon,
	FilterList as FilterListIcon,
	Download as DownloadIcon,
	Visibility as VisibilityIcon,
	Person as PersonIcon,
	Security as SecurityIcon,
	Storage as StorageIcon,
	Assignment as AssignmentIcon
} from '@mui/icons-material';

interface AuditLog {
	id: string;
	timestamp: string;
	userId: string;
	userEmail: string;
	userName: string;
	action: string;
	resource: string;
	resourceId: string;
	details: Record<string, any>;
	ipAddress: string;
	userAgent: string;
	severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	category: 'AUTH' | 'RESOURCE' | 'RESERVATION' | 'APPROVAL' | 'SYSTEM';
}

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
				// Simulate API call
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

	const getSeverityChip = (severity: AuditLog['severity']) => {
		const severityConfig = {
			LOW: { color: 'success' as const, label: 'Bajo' },
			MEDIUM: { color: 'warning' as const, label: 'Medio' },
			HIGH: { color: 'error' as const, label: 'Alto' },
			CRITICAL: { color: 'error' as const, label: 'Crítico' }
		};

		const config = severityConfig[severity];
		return (
			<Chip
				size="small"
				color={config.color}
				label={config.label}
				variant={severity === 'CRITICAL' ? 'filled' : 'outlined'}
			/>
		);
	};

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

	if (loading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="400px"
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				mb={3}
			>
				<Typography
					variant="h4"
					component="h1"
				>
					Auditoría del Sistema
				</Typography>
				<Button
					variant="outlined"
					startIcon={<DownloadIcon />}
				>
					Exportar Logs
				</Button>
			</Box>

			{error && (
				<Alert
					severity="error"
					sx={{ mb: 2 }}
				>
					{error}
				</Alert>
			)}

			{/* Statistics Cards */}
			<Box
				display="flex"
				flexWrap="wrap"
				gap={3}
				sx={{ mb: 3 }}
			>
				<Box
					flex={{ xs: '1 1 100%', md: '1 1 calc(25% - 18px)' }}
					minWidth={{ xs: '100%', md: '200px' }}
				>
					<Card>
						<CardContent>
							<Box
								display="flex"
								alignItems="center"
							>
								<AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
								<Box>
									<Typography variant="h5">{stats.totalLogs}</Typography>
									<Typography color="text.secondary">Total Eventos</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>
				<Box
					flex={{ xs: '1 1 100%', md: '1 1 25%' }}
					minWidth={{ xs: '100%', md: '150px' }}
				>
					<Card>
						<CardContent>
							<Box
								display="flex"
								alignItems="center"
							>
								<SecurityIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
								<Box>
									<Typography variant="h5">{stats.criticalEvents}</Typography>
									<Typography color="text.secondary">Eventos Críticos</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>
				<Box
					flex={{ xs: '1 1 100%', md: '1 1 25%' }}
					minWidth={{ xs: '100%', md: '150px' }}
				>
					<Card>
						<CardContent>
							<Box
								display="flex"
								alignItems="center"
							>
								<StorageIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
								<Box>
									<Typography variant="h5">{stats.todayEvents}</Typography>
									<Typography color="text.secondary">Eventos Hoy</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>
				<Box
					flex={{ xs: '1 1 100%', md: '1 1 25%' }}
					minWidth={{ xs: '100%', md: '150px' }}
				>
					<Card>
						<CardContent>
							<Box
								display="flex"
								alignItems="center"
							>
								<PersonIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
								<Box>
									<Typography variant="h5">{stats.failedLogins}</Typography>
									<Typography color="text.secondary">Intentos de Logins Fallidos</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>
			</Box>

			{/* Filters */}
			<Paper sx={{ p: 2, mb: 2 }}>
				<Box
					display="flex"
					flexWrap="wrap"
					gap={2}
					alignItems="center"
				>
					<Box
						flex={{ xs: '1 1 100%', md: '1 1 40%' }}
						minWidth={{ xs: '100%', md: '200px' }}
					>
						<TextField
							fullWidth
							variant="outlined"
							placeholder="Buscar logs..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								)
							}}
						/>
					</Box>
					<Box
						flex={{ xs: '1 1 100%', md: '1 1 25%' }}
						minWidth={{ xs: '100%', md: '150px' }}
					>
						<FormControl fullWidth>
							<InputLabel>Categoría</InputLabel>
							<Select
								value={categoryFilter}
								label="Categoría"
								onChange={(e) => setCategoryFilter(e.target.value)}
							>
								<MenuItem value="">Todas</MenuItem>
								<MenuItem value="AUTH">Autenticación</MenuItem>
								<MenuItem value="RESOURCE">Recursos</MenuItem>
								<MenuItem value="RESERVATION">Reservas</MenuItem>
								<MenuItem value="APPROVAL">Aprobaciones</MenuItem>
								<MenuItem value="SYSTEM">Sistema</MenuItem>
							</Select>
						</FormControl>
					</Box>
					<Box
						flex={{ xs: '1 1 100%', md: '1 1 25%' }}
						minWidth={{ xs: '100%', md: '150px' }}
					>
						<FormControl fullWidth>
							<InputLabel>Severidad</InputLabel>
							<Select
								value={severityFilter}
								label="Severidad"
								onChange={(e) => setSeverityFilter(e.target.value)}
							>
								<MenuItem value="">Todas</MenuItem>
								<MenuItem value="LOW">Bajo</MenuItem>
								<MenuItem value="MEDIUM">Medio</MenuItem>
								<MenuItem value="HIGH">Alto</MenuItem>
								<MenuItem value="CRITICAL">Crítico</MenuItem>
							</Select>
						</FormControl>
					</Box>
					<Box
						flex={{ xs: '1 1 100%', md: '1 1 auto' }}
						minWidth={{ xs: '100%', md: '120px' }}
					>
						<Button
							fullWidth
							variant="outlined"
							startIcon={<FilterListIcon />}
							onClick={() => {
								setCategoryFilter('');
								setSeverityFilter('');
								setSearchTerm('');
							}}
						>
							Limpiar
						</Button>
					</Box>
				</Box>
			</Paper>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Fecha/Hora</TableCell>
							<TableCell>Usuario</TableCell>
							<TableCell>Acción</TableCell>
							<TableCell>Recurso</TableCell>
							<TableCell>Severidad</TableCell>
							<TableCell>IP</TableCell>
							<TableCell align="center">Detalles</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log) => (
							<TableRow key={log.id}>
								<TableCell>
									<Typography variant="body2">
										{new Date(log.timestamp).toLocaleDateString('es-CO', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
											second: '2-digit'
										})}
									</Typography>
								</TableCell>
								<TableCell>
									<Box>
										<Typography
											variant="body2"
											fontWeight="bold"
										>
											{log.userName}
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
										>
											{log.userEmail}
										</Typography>
									</Box>
								</TableCell>
								<TableCell>
									<Box
										display="flex"
										alignItems="center"
									>
										{getCategoryIcon(log.category)}
										<Typography
											variant="body2"
											sx={{ ml: 1 }}
										>
											{log.action.replace(/_/g, ' ')}
										</Typography>
									</Box>
								</TableCell>
								<TableCell>{log.resource}</TableCell>
								<TableCell>{getSeverityChip(log.severity)}</TableCell>
								<TableCell>
									<Typography
										variant="body2"
										fontFamily="monospace"
									>
										{log.ipAddress}
									</Typography>
								</TableCell>
								<TableCell align="center">
									<Tooltip title="Ver detalles">
										<IconButton
											onClick={() => handleViewDetails(log)}
											size="small"
										>
											<VisibilityIcon />
										</IconButton>
									</Tooltip>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={filteredLogs.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={(_, newPage) => setPage(newPage)}
					onRowsPerPageChange={(e) => {
						setRowsPerPage(parseInt(e.target.value, 10));
						setPage(0);
					}}
				/>
			</TableContainer>

			{/* Details Dialog */}
			<Dialog
				open={detailsDialogOpen}
				onClose={() => setDetailsDialogOpen(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>Detalles del Evento de Auditoría</DialogTitle>
				<DialogContent>
					{selectedLog && (
						<Box
							display="flex"
							flexWrap="wrap"
							gap={2}
							sx={{ mt: 1 }}
						>
							<Box
								flex={{ xs: '1 1 100%', md: '1 1 50%' }}
								minWidth={{ xs: '100%', md: '45%' }}
							>
								<Typography variant="subtitle2">ID del Evento</Typography>
								<Typography
									variant="body2"
									sx={{ mb: 2 }}
								>
									{selectedLog.id}
								</Typography>
							</Box>
							<Box
								flex={{ xs: '1 1 100%', md: '1 1 50%' }}
								minWidth={{ xs: '100%', md: '45%' }}
							>
								<Typography variant="subtitle2">Timestamp</Typography>
								<Typography
									variant="body2"
									sx={{ mb: 2 }}
								>
									{new Date(selectedLog.timestamp).toLocaleString('es-CO')}
								</Typography>
							</Box>
							<Box
								flex={{ xs: '1 1 100%', md: '1 1 50%' }}
								minWidth={{ xs: '100%', md: '45%' }}
							>
								<Typography variant="subtitle2">Usuario</Typography>
								<Typography
									variant="body2"
									sx={{ mb: 2 }}
								>
									{selectedLog.userName} ({selectedLog.userEmail})
								</Typography>
							</Box>
							<Box
								flex={{ xs: '1 1 100%', md: '1 1 50%' }}
								minWidth={{ xs: '100%', md: '45%' }}
							>
								<Typography variant="subtitle2">Dirección IP</Typography>
								<Typography
									variant="body2"
									fontFamily="monospace"
									sx={{ mb: 2 }}
								>
									{selectedLog.ipAddress}
								</Typography>
							</Box>
							<Box
								flex={{ xs: '1 1 100%' }}
								minWidth="100%"
							>
								<Typography variant="subtitle2">User Agent</Typography>
								<Typography
									variant="body2"
									fontFamily="monospace"
									sx={{ mb: 2 }}
								>
									{selectedLog.userAgent}
								</Typography>
							</Box>
							<Box
								flex={{ xs: '1 1 100%' }}
								minWidth="100%"
							>
								<Typography variant="subtitle2">Detalles del Evento</Typography>
								<Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
									<pre style={{ margin: 0, fontSize: '0.875rem' }}>
										{JSON.stringify(selectedLog.details, null, 2)}
									</pre>
								</Paper>
							</Box>
						</Box>
					)}
				</DialogContent>
			</Dialog>
		</Box>
	);
}
