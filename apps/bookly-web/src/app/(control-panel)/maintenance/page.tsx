'use client';

import React, { useState } from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	CardActions,
	Chip,
	Avatar,
	List,
	ListItem,
	ListItemText,
	ListItemAvatar,
	Divider,
	Button,
	Alert
} from '@mui/material';
import {
	Build as BuildIcon,
	Schedule as ScheduleIcon,
	Warning as WarningIcon,
	CheckCircle as CheckCircleIcon,
	Assignment as AssignmentIcon,
	Timeline as TimelineIcon,
	Add as AddIcon,
	Visibility as ViewIcon
} from '@mui/icons-material';
import Link from 'next/link';

// Mock data - replace with real API calls
const mockStats = {
	scheduled: 15,
	inProgress: 3,
	completed: 47,
	incidents: 8,
	preventive: 28,
	corrective: 19
};

const mockScheduledMaintenance = [
	{
		id: '1',
		resourceName: 'Salón 101',
		type: 'PREVENTIVO',
		scheduledDate: '2024-01-15',
		assignedTo: 'Juan Pérez',
		status: 'PROGRAMADO',
		priority: 'MEDIA'
	},
	{
		id: '2',
		resourceName: 'Lab Cómputo 1',
		type: 'CORRECTIVO',
		scheduledDate: '2024-01-12',
		assignedTo: 'María García',
		status: 'EN_PROGRESO',
		priority: 'ALTA'
	},
	{
		id: '3',
		resourceName: 'Auditorio Principal',
		type: 'LIMPIEZA',
		scheduledDate: '2024-01-10',
		assignedTo: 'Carlos López',
		status: 'COMPLETADO',
		priority: 'BAJA'
	}
];

const mockRecentIncidents = [
	{
		id: '1',
		resourceName: 'Proyector Salón 205',
		description: 'No enciende la lámpara',
		reportedBy: 'Ana Martínez',
		reportedDate: '2024-01-08',
		status: 'ABIERTO',
		priority: 'ALTA'
	},
	{
		id: '2',
		resourceName: 'Aire Lab 3',
		description: 'No enfría adecuadamente',
		reportedBy: 'Pedro Silva',
		reportedDate: '2024-01-07',
		status: 'EN_REVISION',
		priority: 'MEDIA'
	}
];

const getStatusColor = (status: string) => {
	switch (status) {
		case 'PROGRAMADO':
			return 'info';
		case 'EN_PROGRESO':
			return 'warning';
		case 'COMPLETADO':
			return 'success';
		case 'ABIERTO':
			return 'error';
		case 'EN_REVISION':
			return 'warning';
		default:
			return 'default';
	}
};

const getPriorityColor = (priority: string) => {
	switch (priority) {
		case 'ALTA':
			return 'error';
		case 'MEDIA':
			return 'warning';
		case 'BAJA':
			return 'success';
		default:
			return 'default';
	}
};

export default function MaintenancePage() {
	const [_selectedPeriod, _setSelectedPeriod] = useState('month');

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
				<div>
					<Typography
						variant="h4"
						component="h1"
						gutterBottom
					>
						Gestión de Mantenimiento
					</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
					>
						Administre el mantenimiento preventivo y correctivo de recursos
					</Typography>
				</div>
				<Box sx={{ display: 'flex', gap: 2 }}>
					<Button
						component={Link}
						href="/maintenance/schedule"
						variant="contained"
						startIcon={<AddIcon />}
					>
						Programar Mantenimiento
					</Button>
					<Button
						component={Link}
						href="/maintenance/incidents/new"
						variant="outlined"
						startIcon={<WarningIcon />}
					>
						Reportar Incidencia
					</Button>
				</Box>
			</Box>

			{/* Statistics Cards */}
			<Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
				<Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
									<ScheduleIcon />
								</Avatar>
								<Box>
									<Typography
										variant="h4"
										component="div"
									>
										{mockStats.scheduled}
									</Typography>
									<Typography
										color="text.secondary"
										variant="body2"
									>
										Programados
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>

				<Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
									<BuildIcon />
								</Avatar>
								<Box>
									<Typography
										variant="h4"
										component="div"
									>
										{mockStats.inProgress}
									</Typography>
									<Typography
										color="text.secondary"
										variant="body2"
									>
										En Progreso
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>

				<Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
									<CheckCircleIcon />
								</Avatar>
								<Box>
									<Typography
										variant="h4"
										component="div"
									>
										{mockStats.completed}
									</Typography>
									<Typography
										color="text.secondary"
										variant="body2"
									>
										Completados
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>

				<Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
									<WarningIcon />
								</Avatar>
								<Box>
									<Typography
										variant="h4"
										component="div"
									>
										{mockStats.incidents}
									</Typography>
									<Typography
										color="text.secondary"
										variant="body2"
									>
										Incidencias
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>
			</Box>

			{/* Main Content */}
			<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
				<Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(66.666% - 12px)' } }}>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
								<Typography
									variant="h6"
									component="h2"
								>
									Mantenimientos Programados
								</Typography>
								<Button
									component={Link}
									href="/maintenance/scheduled"
									size="small"
									endIcon={<ViewIcon />}
								>
									Ver Todos
								</Button>
							</Box>

							<List>
								{mockScheduledMaintenance.map((maintenance, index) => (
									<React.Fragment key={maintenance.id}>
										<ListItem alignItems="flex-start">
											<ListItemAvatar>
												<Avatar>
													<BuildIcon />
												</Avatar>
											</ListItemAvatar>
											<ListItemText
												primary={
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
														<Typography
															variant="subtitle1"
															component="span"
														>
															{maintenance.resourceName}
														</Typography>
														<Chip
															label={maintenance.type}
															size="small"
															variant="outlined"
														/>
														<Chip
															label={maintenance.status}
															size="small"
															color={getStatusColor(maintenance.status) as any}
														/>
														<Chip
															label={maintenance.priority}
															size="small"
															color={getPriorityColor(maintenance.priority) as any}
														/>
													</Box>
												}
												secondary={
													<>
														<Typography
															component="span"
															variant="body2"
															color="text.primary"
														>
															Asignado a: {maintenance.assignedTo}
														</Typography>
														<br />
														<Typography
															component="span"
															variant="body2"
															color="text.secondary"
														>
															Fecha programada:{' '}
															{new Date(maintenance.scheduledDate).toLocaleDateString()}
														</Typography>
													</>
												}
											/>
											<Button
												component={Link}
												href={`/maintenance/scheduled/${maintenance.id}`}
												size="small"
											>
												Ver Detalles
											</Button>
										</ListItem>
										{index < mockScheduledMaintenance.length - 1 && (
											<Divider
												variant="inset"
												component="li"
											/>
										)}
									</React.Fragment>
								))}
							</List>
						</CardContent>
						<CardActions>
							<Button
								component={Link}
								href="/maintenance/schedule"
								fullWidth
								variant="outlined"
								startIcon={<AddIcon />}
							>
								Programar Nuevo Mantenimiento
							</Button>
						</CardActions>
					</Card>
				</Box>

				{/* Recent Incidents */}
				<Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(33.333% - 12px)' } }}>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
								<Typography
									variant="h6"
									component="h2"
								>
									Incidencias Recientes
								</Typography>
								<Button
									component={Link}
									href="/maintenance/incidents"
									size="small"
									endIcon={<ViewIcon />}
								>
									Ver Todas
								</Button>
							</Box>

							<List>
								{mockRecentIncidents.map((incident, index) => (
									<React.Fragment key={incident.id}>
										<ListItem
											alignItems="flex-start"
											sx={{ px: 0 }}
										>
											<ListItemAvatar>
												<Avatar sx={{ bgcolor: 'error.light' }}>
													<WarningIcon />
												</Avatar>
											</ListItemAvatar>
											<ListItemText
												primary={
													<Box sx={{ mb: 1 }}>
														<Typography
															variant="subtitle2"
															component="div"
														>
															{incident.resourceName}
														</Typography>
														<Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
															<Chip
																label={incident.status}
																size="small"
																color={getStatusColor(incident.status) as any}
															/>
															<Chip
																label={incident.priority}
																size="small"
																color={getPriorityColor(incident.priority) as any}
															/>
														</Box>
													</Box>
												}
												secondary={
													<>
														<Typography
															variant="body2"
															color="text.primary"
															sx={{ mb: 0.5 }}
														>
															{incident.description}
														</Typography>
														<Typography
															variant="caption"
															color="text.secondary"
														>
															Por: {incident.reportedBy} •{' '}
															{new Date(incident.reportedDate).toLocaleDateString()}
														</Typography>
													</>
												}
											/>
										</ListItem>
										{index < mockRecentIncidents.length - 1 && <Divider component="li" />}
									</React.Fragment>
								))}
							</List>
						</CardContent>
						<CardActions>
							<Button
								component={Link}
								href="/maintenance/incidents/new"
								fullWidth
								variant="outlined"
								startIcon={<WarningIcon />}
								color="error"
							>
								Reportar Incidencia
							</Button>
						</CardActions>
					</Card>

					{/* Quick Actions */}
					<Card>
						<CardContent>
							<Typography
								variant="h6"
								component="h2"
								gutterBottom
							>
								Acciones Rápidas
							</Typography>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
								<Button
									component={Link}
									href="/maintenance/reports"
									variant="outlined"
									startIcon={<TimelineIcon />}
									fullWidth
								>
									Ver Reportes
								</Button>
								<Button
									component={Link}
									href="/maintenance/records"
									variant="outlined"
									startIcon={<AssignmentIcon />}
									fullWidth
								>
									Historial de Mantenimiento
								</Button>
								<Button
									component={Link}
									href="/maintenance/calendar"
									variant="outlined"
									startIcon={<ScheduleIcon />}
									fullWidth
								>
									Calendario de Mantenimiento
								</Button>
							</Box>
						</CardContent>
					</Card>
				</Box>
			</Box>

			{/* Performance Alert */}
			<Box sx={{ mt: 4 }}>
				<Alert severity="info">
					<Typography variant="body2">
						<strong>Tip:</strong> Los mantenimientos preventivos regulares pueden reducir las incidencias
						hasta en un 70%. Configure recordatorios automáticos para optimizar el rendimiento de sus
						recursos.
					</Typography>
				</Alert>
			</Box>
		</Box>
	);
}
