'use client';

import { useState, useEffect } from 'react';
import { StatusChip, Chip } from '../../../components/atoms';
import { ActionMenu } from '../../../components/molecules';
import { CancelReservationDialog, DataTableColumn, PageHeaderProps } from '../../../components/organisms';
import { Box, Typography, Avatar, Button } from '@mui/material';
import {
	CalendarToday,
	Room,
	Person,
	Schedule,
	Cancel,
	Edit,
	Visibility,
	CheckCircle,
	Block,
	EventAvailable,
	Add as AddIcon
} from '@mui/icons-material';
import { DataTablePageTemplate } from '@/components/templates';

// Types
interface Reservation {
	id: string;
	title: string;
	resource: {
		name: string;
		type: string;
		location?: string;
	};
	user: {
		name: string;
		avatar?: string;
		email: string;
	};
	startDate: string;
	endDate: string;
	startTime: string;
	endTime: string;
	status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'active' | 'completed';
	participants?: number;
	purpose: string;
	isRecurring?: boolean;
	approvedBy?: string;
	createdAt: string;
}

// Mock data
const mockReservations: Reservation[] = [
	{
		id: '1',
		title: 'Reunión Consejo Académico',
		resource: {
			name: 'Sala de Juntas Principal',
			type: 'Sala de Reuniones',
			location: 'Edificio Central - Piso 3'
		},
		user: {
			name: 'Dr. María González',
			email: 'maria.gonzalez@ufps.edu.co',
			avatar: '/avatars/maria.jpg'
		},
		startDate: '2024-01-15',
		endDate: '2024-01-15',
		startTime: '14:00',
		endTime: '16:00',
		status: 'approved',
		participants: 12,
		purpose: 'Reunión mensual del consejo académico para revisar propuestas curriculares',
		approvedBy: 'Admin General',
		createdAt: '2024-01-10T10:30:00Z'
	},
	{
		id: '2',
		title: 'Conferencia Magistral: IA en Educación',
		resource: {
			name: 'Auditorio Central',
			type: 'Auditorio',
			location: 'Edificio Central - Planta Baja'
		},
		user: {
			name: 'Prof. Carlos Rodríguez',
			email: 'carlos.rodriguez@ufps.edu.co'
		},
		startDate: '2024-01-20',
		endDate: '2024-01-20',
		startTime: '10:00',
		endTime: '12:00',
		status: 'pending',
		participants: 200,
		purpose: 'Conferencia sobre aplicaciones de inteligencia artificial en procesos educativos',
		createdAt: '2024-01-12T15:20:00Z'
	},
	{
		id: '3',
		title: 'Laboratorio de Química Orgánica',
		resource: {
			name: 'Lab. Química 201',
			type: 'Laboratorio',
			location: 'Edificio de Ciencias - Piso 2'
		},
		user: {
			name: 'Dra. Ana Martínez',
			email: 'ana.martinez@ufps.edu.co'
		},
		startDate: '2024-01-16',
		endDate: '2024-01-16',
		startTime: '08:00',
		endTime: '11:00',
		status: 'active',
		participants: 25,
		purpose: 'Práctica de síntesis orgánica para estudiantes de 5to semestre',
		isRecurring: true,
		approvedBy: 'Admin Programa',
		createdAt: '2024-01-08T09:15:00Z'
	},
	{
		id: '4',
		title: 'Examen Final - Cálculo III',
		resource: {
			name: 'Aula Magna 101',
			type: 'Aula',
			location: 'Edificio Académico A - Piso 1'
		},
		user: {
			name: 'Prof. Luis Herrera',
			email: 'luis.herrera@ufps.edu.co'
		},
		startDate: '2024-01-25',
		endDate: '2024-01-25',
		startTime: '07:00',
		endTime: '10:00',
		status: 'approved',
		participants: 80,
		purpose: 'Examen final del curso de Cálculo III para estudiantes de Ingeniería',
		approvedBy: 'Admin General',
		createdAt: '2024-01-05T11:00:00Z'
	},
	{
		id: '5',
		title: 'Defensa de Tesis Doctoral',
		resource: {
			name: 'Sala de Videoconferencias',
			type: 'Sala de Reuniones',
			location: 'Edificio Posgrados - Piso 2'
		},
		user: {
			name: 'Candidato: Jorge Pérez',
			email: 'jorge.perez@mail.ufps.edu.co'
		},
		startDate: '2024-01-30',
		endDate: '2024-01-30',
		startTime: '15:00',
		endTime: '17:00',
		status: 'approved',
		participants: 8,
		purpose:
			'Defensa de tesis doctoral: "Análisis de algoritmos de machine learning aplicados a sistemas embebidos"',
		approvedBy: 'Admin Posgrados',
		createdAt: '2024-01-02T14:30:00Z'
	},
	{
		id: '6',
		title: 'Mantenimiento Equipos Lab',
		resource: {
			name: 'Lab. Sistemas 301',
			type: 'Laboratorio',
			location: 'Edificio Ingeniería - Piso 3'
		},
		user: {
			name: 'Técnico: Roberto Silva',
			email: 'roberto.silva@ufps.edu.co'
		},
		startDate: '2024-01-18',
		endDate: '2024-01-18',
		startTime: '12:00',
		endTime: '14:00',
		status: 'cancelled',
		participants: 0,
		purpose: 'Mantenimiento preventivo de equipos de cómputo y redes',
		createdAt: '2024-01-10T08:00:00Z'
	}
];

const statusColors = {
	pending: 'warning',
	approved: 'success',
	rejected: 'error',
	cancelled: 'default',
	active: 'info',
	completed: 'success'
} as const;

const statusLabels = {
	pending: 'Pendiente',
	approved: 'Aprobada',
	rejected: 'Rechazada',
	cancelled: 'Cancelada',
	active: 'Activa',
	completed: 'Completada'
};

export default function ReservationsPage() {
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [typeFilter, setTypeFilter] = useState<string>('all');
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

	// Mock API calls
	useEffect(() => {
		const fetchReservations = async () => {
			setLoading(true);
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setReservations(mockReservations);
			setFilteredReservations(mockReservations);
			setLoading(false);
		};

		fetchReservations();
	}, []);

	// Filtering logic
	useEffect(() => {
		const filtered = reservations.filter((reservation) => {
			const matchesSearch =
				reservation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				reservation.resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				reservation.user.name.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
			const matchesType = typeFilter === 'all' || reservation.resource.type === typeFilter;

			return matchesSearch && matchesStatus && matchesType;
		});

		setFilteredReservations(filtered);
	}, [reservations, searchTerm, statusFilter, typeFilter]);

	const handleSearch = (term: string) => {
		setSearchTerm(term);
	};

	const handleStatusFilter = (status: string) => {
		setStatusFilter(status);
	};

	const handleTypeFilter = (type: string) => {
		setTypeFilter(type);
	};

	const handleViewReservation = (reservation: Reservation) => {
		console.log('Viewing reservation:', reservation);
		// Navigate to reservation details or open modal
	};

	const handleEditReservation = (reservation: Reservation) => {
		console.log('Editing reservation:', reservation);
		// Navigate to edit form
	};

	const handleApproveReservation = (reservation: Reservation) => {
		console.log('Approving reservation:', reservation);
		// Update reservation status
		setReservations((prev) =>
			prev.map((r) => (r.id === reservation.id ? { ...r, status: 'approved', approvedBy: 'Current User' } : r))
		);
	};

	const handleRejectReservation = (reservation: Reservation) => {
		console.log('Rejecting reservation:', reservation);
		// Update reservation status
		setReservations((prev) => prev.map((r) => (r.id === reservation.id ? { ...r, status: 'rejected' } : r)));
	};

	const handleCancelReservation = (reservation: Reservation) => {
		setSelectedReservation(reservation);
		setCancelDialogOpen(true);
	};

	const handleConfirmCancel = (reason: string) => {
		if (selectedReservation) {
			console.log('Cancelling reservation:', selectedReservation, 'Reason:', reason);
			setReservations((prev) =>
				prev.map((r) => (r.id === selectedReservation.id ? { ...r, status: 'cancelled' } : r))
			);
		}

		setCancelDialogOpen(false);
		setSelectedReservation(null);
	};

	const formatDateTime = (date: string, time: string) => {
		const formattedDate = new Date(date).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
		return `${formattedDate} ${time}`;
	};

	const columns: DataTableColumn<Reservation>[] = [
		{
			id: 'title',
			label: 'Reserva',
			minWidth: 200,
			render: (reservation) => (
				<Box>
					<Typography
						variant="subtitle2"
						fontWeight="bold"
					>
						{reservation.title}
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
						<Room sx={{ fontSize: 14, color: 'text.secondary' }} />
						<Typography
							variant="caption"
							color="text.secondary"
						>
							{reservation.resource.name}
						</Typography>
					</Box>
					{reservation.resource.location && (
						<Typography
							variant="caption"
							color="text.secondary"
							display="block"
						>
							{reservation.resource.location}
						</Typography>
					)}
				</Box>
			)
		},
		{
			id: 'user',
			label: 'Solicitante',
			minWidth: 150,
			render: (reservation) => (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Avatar
						sx={{ width: 32, height: 32 }}
						src={reservation.user.avatar}
					>
						{reservation.user.name
							.split(' ')
							.map((n) => n[0])
							.join('')}
					</Avatar>
					<Box>
						<Typography
							variant="body2"
							fontWeight="medium"
						>
							{reservation.user.name}
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
						>
							{reservation.user.email}
						</Typography>
					</Box>
				</Box>
			)
		},
		{
			id: 'schedule',
			label: 'Horario',
			minWidth: 180,
			render: (reservation) => (
				<Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
						<CalendarToday sx={{ fontSize: 14, color: 'primary.main' }} />
						<Typography variant="body2">
							{formatDateTime(reservation.startDate, reservation.startTime)}
						</Typography>
					</Box>
					<Typography
						variant="body2"
						sx={{ ml: 2.5 }}
					>
						{formatDateTime(reservation.endDate, reservation.endTime)}
					</Typography>
					{reservation.isRecurring && (
						<Chip
							label="Recurrente"
							size="small"
							color="info"
							sx={{ mt: 0.5 }}
						/>
					)}
				</Box>
			)
		},
		{
			id: 'details',
			label: 'Detalles',
			minWidth: 150,
			render: (reservation) => (
				<Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
						<Person sx={{ fontSize: 14, color: 'text.secondary' }} />
						<Typography variant="body2">{reservation.participants} participantes</Typography>
					</Box>
					<Chip
						label={reservation.resource.type}
						size="small"
						variant="outlined"
					/>
				</Box>
			)
		},
		{
			id: 'status',
			label: 'Estado',
			minWidth: 120,
			render: (reservation) => (
				<Box>
					<StatusChip
						status={reservation.status}
						color={statusColors[reservation.status]}
						label={statusLabels[reservation.status]}
					/>
					{reservation.approvedBy && (
						<Typography
							variant="caption"
							color="text.secondary"
							display="block"
							sx={{ mt: 0.5 }}
						>
							Por: {reservation.approvedBy}
						</Typography>
					)}
				</Box>
			)
		},
		{
			id: 'actions',
			label: 'Acciones',
			minWidth: 100,
			align: 'center',
			render: (reservation) => (
				<ActionMenu
					items={[
						{
							key: 'view',
							label: 'Ver Detalles',
							icon: <Visibility fontSize="small" />,
							onClick: () => handleViewReservation(reservation)
						},
						{
							key: 'edit',
							label: 'Editar',
							icon: <Edit fontSize="small" />,
							onClick: () => handleEditReservation(reservation),
							disabled: ['cancelled', 'completed', 'rejected'].includes(reservation.status)
						},
						...(reservation.status === 'pending'
							? [
									{
										key: 'approve',
										label: 'Aprobar',
										icon: <CheckCircle fontSize="small" />,
										onClick: () => handleApproveReservation(reservation)
									},
									{
										key: 'reject',
										label: 'Rechazar',
										icon: <Block fontSize="small" />,
										onClick: () => handleRejectReservation(reservation)
									}
								]
							: []),
						...(reservation.status !== 'cancelled' && reservation.status !== 'completed'
							? [
									{
										key: 'cancel',
										label: 'Cancelar',
										icon: <Cancel fontSize="small" />,
										onClick: () => handleCancelReservation(reservation),
										color: 'error' as const
									}
								]
							: [])
					]}
				/>
			)
		}
	];

	const statsCards = [
		{
			title: 'Total Reservas',
			value: reservations.length,
			icon: CalendarToday,
			color: 'primary' as const
		},
		{
			title: 'Pendientes',
			value: reservations.filter((r) => r.status === 'pending').length,
			icon: Schedule,
			color: 'warning' as const
		},
		{
			title: 'Aprobadas',
			value: reservations.filter((r) => r.status === 'approved').length,
			icon: CheckCircle,
			color: 'success' as const
		},
		{
			title: 'Activas Hoy',
			value: reservations.filter((r) => r.status === 'active').length,
			icon: EventAvailable,
			color: 'info' as const
		}
	];

	const filterOptions = [
		{
			label: 'Estado',
			value: statusFilter,
			onChange: handleStatusFilter,
			options: [
				{ value: 'all', label: 'Todos los estados' },
				{ value: 'pending', label: 'Pendiente' },
				{ value: 'approved', label: 'Aprobada' },
				{ value: 'active', label: 'Activa' },
				{ value: 'completed', label: 'Completada' },
				{ value: 'cancelled', label: 'Cancelada' },
				{ value: 'rejected', label: 'Rechazada' }
			]
		},
		{
			label: 'Tipo de Recurso',
			value: typeFilter,
			onChange: handleTypeFilter,
			options: [
				{ value: 'all', label: 'Todos los tipos' },
				{ value: 'Aula', label: 'Aula' },
				{ value: 'Laboratorio', label: 'Laboratorio' },
				{ value: 'Auditorio', label: 'Auditorio' },
				{ value: 'Sala de Reuniones', label: 'Sala de Reuniones' }
			]
		}
	];

	const pageHeaderProps: PageHeaderProps = {
		title: 'Gestión de Reservas',
		subtitle: 'Administra las reservas de recursos institucionales',
		actions: (
			<Button
				variant="contained"
				startIcon={<AddIcon />}
				onClick={() => {/* TODO: Navigate to create reservation */}}
			>
				Nueva Reserva
			</Button>
		)
	};

	return (
		<>
			<DataTablePageTemplate
				pageHeader={pageHeaderProps}
				statsCards={statsCards}
				data={filteredReservations}
				columns={columns}
				loading={loading}
				searchPlaceholder="Buscar por título, recurso o solicitante..."
				onSearch={handleSearch}
				filterOptions={filterOptions}
				emptyMessage="No se encontraron reservas"
				emptyDescription="No hay reservas que coincidan con los criterios de búsqueda."
			/>

			<CancelReservationDialog
				open={cancelDialogOpen}
				reservationTitle={selectedReservation?.title}
				onClose={() => {
					setCancelDialogOpen(false);
					setSelectedReservation(null);
				}}
				onConfirm={handleConfirmCancel}
				loading={false}
			/>
		</>
	);
}
