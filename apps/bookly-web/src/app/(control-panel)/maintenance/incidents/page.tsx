'use client';

import React, { useState } from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	Button,
	TextField,
	InputAdornment,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Avatar,
	IconButton,
	TablePagination,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions
} from '@mui/material';
import {
	Search as SearchIcon,
	Add as AddIcon,
	Visibility as ViewIcon,
	Edit as EditIcon,
	Warning as WarningIcon,
	FilterList as FilterIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { enqueueSnackbar } from 'notistack';
import { MaintenanceColors } from '@services/maintenance/types';

// Types
interface MockIncident {
	id: string;
	resourceName: string;
	resourceType: string;
	title: string;
	description: string;
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	status: 'REPORTED' | 'IN_REVIEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
	reportedBy: string;
	assignedTo?: string;
	reportedAt: string;
	resolvedAt?: string;
	category: string;
}

// Mock data
const mockIncidents: MockIncident[] = [
	{
		id: '1',
		resourceName: 'Proyector Salón 205',
		resourceType: 'EQUIPO',
		title: 'Proyector no enciende',
		description: 'La lámpara del proyector no enciende cuando se presiona el botón de encendido',
		reportedBy: 'Ana Martínez',
		reportedAt: '2024-01-08T10:30:00',
		status: 'REPORTED',
		priority: 'HIGH',
		assignedTo: 'Juan Pérez',
		category: 'HARDWARE'
	},
	{
		id: '2',
		resourceName: 'Aire Acondicionado Lab 3',
		resourceType: 'EQUIPO',
		title: 'Aire no enfría',
		description: 'El aire acondicionado funciona pero no enfría adecuadamente el laboratorio',
		reportedBy: 'Pedro Silva',
		reportedAt: '2024-01-07T14:15:00',
		status: 'IN_REVIEW',
		priority: 'MEDIUM',
		assignedTo: 'María García',
		category: 'CLIMATIZACION'
	},
	{
		id: '3',
		resourceName: 'Puerta Salón 101',
		resourceType: 'INFRAESTRUCTURA',
		title: 'Cerradura dañada',
		description: 'La cerradura de la puerta principal está trabada y no se puede abrir con facilidad',
		reportedBy: 'Carlos López',
		reportedAt: '2024-01-06T09:00:00',
		status: 'RESOLVED',
		priority: 'MEDIUM',
		assignedTo: 'Luis Rodríguez',
		category: 'SEGURIDAD'
	},
	{
		id: '4',
		resourceName: 'Red WiFi Biblioteca',
		resourceType: 'SERVICIO',
		title: 'Conexión intermitente',
		description: 'La conexión a internet WiFi se desconecta frecuentemente en el área de la biblioteca',
		reportedBy: 'Sofia Mendoza',
		reportedAt: '2024-01-07T14:30:00',
		status: 'IN_PROGRESS',
		priority: 'HIGH',
		assignedTo: 'Diego Torres',
		category: 'REDES'
	}
];

const statusOptions = [
	{ value: 'ABIERTO', label: 'Abierto', color: 'error' },
	{ value: 'EN_REVISION', label: 'En Revisión', color: 'warning' },
	{ value: 'EN_PROGRESO', label: 'En Progreso', color: 'info' },
	{ value: 'SOLUCIONADO', label: 'Solucionado', color: 'success' },
	{ value: 'CERRADO', label: 'Cerrado', color: 'default' }
];

const priorityOptions = [
	{ value: 'ALTA', label: 'Alta', color: 'error' },
	{ value: 'MEDIA', label: 'Media', color: 'warning' },
	{ value: 'BAJA', label: 'Baja', color: 'success' }
];

export default function IncidentsPage() {
	const [incidents, setIncidents] = useState(mockIncidents);
	const [filteredIncidents, setFilteredIncidents] = useState(mockIncidents);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [priorityFilter, setPriorityFilter] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [selectedIncident, setSelectedIncident] = useState<MockIncident | null>(null);
	const [detailsOpen, setDetailsOpen] = useState(false);

	// Filter incidents
	React.useEffect(() => {
		let filtered = incidents;

		if (searchTerm) {
			filtered = filtered.filter(
				(incident) =>
					incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					incident.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
					incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		if (statusFilter) {
			filtered = filtered.filter((incident) => incident.status === statusFilter);
		}

		if (priorityFilter) {
			filtered = filtered.filter((incident) => incident.priority === priorityFilter);
		}

		setFilteredIncidents(filtered);
		setPage(0);
	}, [incidents, searchTerm, statusFilter, priorityFilter]);

	const handleViewIncident = (incident: MockIncident) => {
		setSelectedIncident(incident);
		setDetailsOpen(true);
	};

	const handleStatusChange = (incidentId: string, newStatus: MockIncident['status']) => {
		setIncidents((prev) =>
			prev.map((incident) => (incident.id === incidentId ? { ...incident, status: newStatus } : incident))
		);
		enqueueSnackbar('Estado de incidencia actualizado', { variant: 'success' });
	};

	const getStatusColor = (status: string): MaintenanceColors => {
		const option = statusOptions.find((opt) => opt.value === status);
		return (option?.color || 'default') as MaintenanceColors;
	};

	const getPriorityColor = (priority: string): MaintenanceColors => {
		const option = priorityOptions.find((opt) => opt.value === priority);
		return (option?.color || 'default') as MaintenanceColors;
	};

	const paginatedIncidents = filteredIncidents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<div>
					<Typography
						variant="h4"
						component="h1"
						gutterBottom
					>
						Gestión de Incidencias
					</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
					>
						Administre y haga seguimiento a las incidencias reportadas
					</Typography>
				</div>
				<Button
					component={Link}
					href="/maintenance/incidents/new"
					variant="contained"
					startIcon={<AddIcon />}
				>
					Reportar Incidencia
				</Button>
			</Box>

			{/* Filters */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
							gap: 2,
							alignItems: 'center'
						}}
					>
						<Box>
							<TextField
								fullWidth
								placeholder="Buscar incidencias..."
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
						<Box>
							<FormControl fullWidth>
								<InputLabel>Estado</InputLabel>
								<Select
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									label="Estado"
								>
									<MenuItem value="">Todos los estados</MenuItem>
									{statusOptions.map((option) => (
										<MenuItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Box>
						<Box>
							<FormControl fullWidth>
								<InputLabel>Prioridad</InputLabel>
								<Select
									value={priorityFilter}
									onChange={(e) => setPriorityFilter(e.target.value)}
									label="Prioridad"
								>
									<MenuItem value="">Todas las prioridades</MenuItem>
									{priorityOptions.map((option) => (
										<MenuItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Box>
						<Box>
							<Button
								fullWidth
								variant="outlined"
								startIcon={<FilterIcon />}
								onClick={() => {
									setSearchTerm('');
									setStatusFilter('');
									setPriorityFilter('');
								}}
							>
								Limpiar
							</Button>
						</Box>
					</Box>
				</CardContent>
			</Card>

			{/* Results Summary */}
			<Card sx={{ mb: 2 }}>
				<CardContent sx={{ py: 2 }}>
					<Typography
						variant="body2"
						color="text.secondary"
					>
						Mostrando {filteredIncidents.length} de {incidents.length} incidencias
					</Typography>
				</CardContent>
			</Card>

			{/* Incidents Table */}
			<Card>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Recurso</TableCell>
								<TableCell>Incidencia</TableCell>
								<TableCell>Reportado Por</TableCell>
								<TableCell>Estado</TableCell>
								<TableCell>Prioridad</TableCell>
								<TableCell>Asignado a</TableCell>
								<TableCell>Fecha</TableCell>
								<TableCell align="center">Acciones</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{paginatedIncidents.map((incident) => (
								<TableRow
									key={incident.id}
									hover
								>
									<TableCell>
										<Box sx={{ display: 'flex', alignItems: 'center' }}>
											<Avatar sx={{ mr: 2, bgcolor: 'error.light' }}>
												<WarningIcon />
											</Avatar>
											<div>
												<Typography variant="subtitle2">{incident.resourceName}</Typography>
												<Typography
													variant="caption"
													color="text.secondary"
												>
													{incident.resourceType}
												</Typography>
											</div>
										</Box>
									</TableCell>
									<TableCell>
										<Typography variant="subtitle2">{incident.title}</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
											noWrap
										>
											{incident.description.length > 50
												? `${incident.description.substring(0, 50)}...`
												: incident.description}
										</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="body2">{incident.reportedBy}</Typography>
									</TableCell>
									<TableCell>
										<FormControl
											size="small"
											sx={{ minWidth: 120 }}
										>
											<Select
												value={incident.status}
												onChange={(e) => handleStatusChange(incident.id, e.target.value)}
												variant="standard"
											>
												{statusOptions.map((option) => (
													<MenuItem
														key={option.value}
														value={option.value}
													>
														<Chip
															label={option.label}
															color={option.color as MaintenanceColors}
															size="small"
														/>
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</TableCell>
									<TableCell>
										<Chip
											label={incident.priority}
											color={getPriorityColor(incident.priority) as never}
											size="small"
										/>
									</TableCell>
									<TableCell>
										<Typography variant="body2">{incident.assignedTo}</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="body2">
											{new Date(incident.reportedAt).toLocaleDateString()}
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
										>
											{new Date(incident.reportedAt).toLocaleTimeString()}
										</Typography>
									</TableCell>
									<TableCell align="center">
										<IconButton
											size="small"
											onClick={() => handleViewIncident(incident)}
											title="Ver detalles"
										>
											<ViewIcon />
										</IconButton>
										<IconButton
											component={Link}
											href={`/maintenance/incidents/${incident.id}/edit`}
											size="small"
											title="Editar"
										>
											<EditIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={filteredIncidents.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={(_, newPage) => setPage(newPage)}
					onRowsPerPageChange={(event) => {
						setRowsPerPage(parseInt(event.target.value, 10));
						setPage(0);
					}}
				/>
			</Card>

			{/* Details Dialog */}
			<Dialog
				open={detailsOpen}
				onClose={() => setDetailsOpen(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>Detalles de la Incidencia</DialogTitle>
				<DialogContent>
					{selectedIncident && (
						<Box sx={{ mt: 2 }}>
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
									gap: 2
								}}
							>
								<Box sx={{ gridColumn: '1 / -1' }}>
									<Typography
										variant="h6"
										gutterBottom
									>
										{selectedIncident.title}
									</Typography>
									<Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
										<Chip
											label={selectedIncident.status}
											color={getStatusColor(selectedIncident.status)}
											size="small"
										/>
										<Chip
											label={selectedIncident.priority}
											color={getPriorityColor(selectedIncident.priority)}
											size="small"
										/>
									</Box>
								</Box>

								<Box>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Recurso Afectado
									</Typography>
									<Typography
										variant="body2"
										paragraph
									>
										{selectedIncident.resourceName} ({selectedIncident.resourceType})
									</Typography>
								</Box>

								<Box>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Categoría
									</Typography>
									<Typography
										variant="body2"
										paragraph
									>
										{selectedIncident.category}
									</Typography>
								</Box>

								<Box>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Descripción
									</Typography>
									<Typography
										variant="body2"
										paragraph
									>
										{selectedIncident.description}
									</Typography>
								</Box>

								<Box>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Reportado Por
									</Typography>
									<Typography
										variant="body2"
										paragraph
									>
										{selectedIncident.reportedBy}
									</Typography>
								</Box>

								<Box>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Asignado A
									</Typography>
									<Typography
										variant="body2"
										paragraph
									>
										{selectedIncident.assignedTo}
									</Typography>
								</Box>

								<Box>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Fecha de Reporte
									</Typography>
									<Typography variant="body2">
										{new Date(selectedIncident.reportedAt).toLocaleString()}
									</Typography>
								</Box>
							</Box>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDetailsOpen(false)}>Cerrar</Button>
					<Button
						component={Link}
						href={`/maintenance/incidents/${selectedIncident?.id}/edit`}
						variant="contained"
					>
						Editar Incidencia
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
