'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Link } from '@mui/material';
import NextLink from 'next/link';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Visibility as VisibilityIcon,
	Computer as ComputerIcon,
	MeetingRoom as MeetingRoomIcon,
	CheckCircle as CheckCircleIcon,
	Cancel as CancelIcon
} from '@mui/icons-material';
import { StatusChip } from '../../../components/atoms';
import { ActionMenu } from '../../../components/molecules';
import { StatCardProps } from '../../../components/molecules/StatCard/StatCard';
import { DataTableColumn } from '@/components/organisms';
import { DataTablePageTemplate } from '@/components/templates';
import { PageHeaderProps } from '@components/molecules/page-form-header';

interface Resource {
	id: string;
	name: string;
	code: string;
	type: string;
	status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
	capacity: number;
	location: string;
	description?: string;
	academicProgram?: string;
	createdAt: string;
}

interface ResourcesPageData {
	resources: Resource[];
	stats: {
		totalResources: number;
		activeResources: number;
		maintenanceResources: number;
	};
	loading: boolean;
	error: string | null;
}

export default function ResourcesPage() {
	const [data, setData] = useState<ResourcesPageData>({
		resources: [],
		stats: { totalResources: 0, activeResources: 0, maintenanceResources: 0 },
		loading: true,
		error: null
	});
	const [searchTerm, setSearchTerm] = useState('');
	const [filters, setFilters] = useState({
		type: '',
		status: '',
		academicProgram: ''
	});

	// Mock data fetch
	useEffect(() => {
		const fetchResources = async () => {
			try {
				setData((prev) => ({ ...prev, loading: true, error: null }));

				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));

				const mockResources: Resource[] = [
					{
						id: '1',
						name: 'Sala de Conferencias Principal',
						code: 'CONF-001',
						type: 'Sala de Conferencias',
						status: 'ACTIVE',
						capacity: 50,
						location: 'Edificio A - Piso 2',
						description: 'Sala principal para conferencias y eventos institucionales',
						academicProgram: 'General',
						createdAt: '2023-01-15T00:00:00Z'
					},
					{
						id: '2',
						name: 'Laboratorio de Sistemas',
						code: 'LAB-SIS-01',
						type: 'Laboratorio',
						status: 'ACTIVE',
						capacity: 30,
						location: 'Edificio B - Piso 1',
						description: 'Laboratorio equipado con 30 computadoras para prácticas de programación',
						academicProgram: 'Ingeniería de Sistemas',
						createdAt: '2023-02-10T00:00:00Z'
					},
					{
						id: '3',
						name: 'Auditorio Central',
						code: 'AUD-001',
						type: 'Auditorio',
						status: 'ACTIVE',
						capacity: 200,
						location: 'Edificio Principal',
						description: 'Auditorio principal para eventos masivos',
						academicProgram: 'General',
						createdAt: '2023-01-20T00:00:00Z'
					},
					{
						id: '4',
						name: 'Proyector Portátil HP',
						code: 'PROJ-HP-001',
						type: 'Equipo Multimedia',
						status: 'MAINTENANCE',
						capacity: 1,
						location: 'Almacén de Equipos',
						description: 'Proyector portátil para presentaciones',
						academicProgram: 'General',
						createdAt: '2023-03-05T00:00:00Z'
					},
					{
						id: '5',
						name: 'Laboratorio de Química',
						code: 'LAB-QUI-01',
						type: 'Laboratorio',
						status: 'INACTIVE',
						capacity: 25,
						location: 'Edificio C - Piso 3',
						description: 'Laboratorio en proceso de renovación',
						academicProgram: 'Ingeniería Química',
						createdAt: '2022-09-15T00:00:00Z'
					}
				];

				const stats = {
					totalResources: mockResources.length,
					activeResources: mockResources.filter((r) => r.status === 'ACTIVE').length,
					maintenanceResources: mockResources.filter((r) => r.status === 'MAINTENANCE').length
				};

				setData({
					resources: mockResources,
					stats,
					loading: false,
					error: null
				});
			} catch (err) {
				setData((prev) => ({
					...prev,
					loading: false,
					error: 'Error al cargar recursos'
				}));
				console.error('Error loading resources:', err);
			}
		};

		fetchResources();
	}, []);

	// Filter resources based on search and filters
	const filteredResources = data.resources.filter((resource) => {
		const matchesSearch =
			resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			resource.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
			resource.location.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesFilters =
			(!filters.type || resource.type === filters.type) &&
			(!filters.status || resource.status === filters.status) &&
			(!filters.academicProgram || resource.academicProgram === filters.academicProgram);

		return matchesSearch && matchesFilters;
	});

	const handleResourceAction = (action: string, resource: Resource) => {
		switch (action) {
			case 'view':
				console.log('View resource:', resource);
				break;
			case 'edit':
				console.log('Edit resource:', resource);
				break;
			case 'toggle-status':
				const newStatus = resource.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
				setData((prev) => ({
					...prev,
					resources: prev.resources.map((r) => (r.id === resource.id ? { ...r, status: newStatus } : r)),
					stats: {
						...prev.stats,
						activeResources:
							newStatus === 'ACTIVE' ? prev.stats.activeResources + 1 : prev.stats.activeResources - 1
					}
				}));
				break;
			case 'maintenance':
				setData((prev) => ({
					...prev,
					resources: prev.resources.map((r) => (r.id === resource.id ? { ...r, status: 'MAINTENANCE' } : r)),
					stats: {
						...prev.stats,
						activeResources:
							resource.status === 'ACTIVE' ? prev.stats.activeResources - 1 : prev.stats.activeResources,
						maintenanceResources: prev.stats.maintenanceResources + 1
					}
				}));
				break;
			case 'delete':
				setData((prev) => ({
					...prev,
					resources: prev.resources.filter((r) => r.id !== resource.id),
					stats: {
						totalResources: prev.stats.totalResources - 1,
						activeResources:
							resource.status === 'ACTIVE' ? prev.stats.activeResources - 1 : prev.stats.activeResources,
						maintenanceResources:
							resource.status === 'MAINTENANCE'
								? prev.stats.maintenanceResources - 1
								: prev.stats.maintenanceResources
					}
				}));
				break;
			default:
				break;
		}
	};

	// Page header configuration
	const pageHeaderProps: PageHeaderProps = {
		title: 'Recursos',
		actions: [
			{
				label: 'Crear Recurso',
				variant: 'contained',
				startIcon: <AddIcon />,
				onClick: () => console.log('Navigate to create resource') // In real app: router.push('/resources/create')
			}
		]
	};

	// Stats configuration
	const statsData: StatCardProps[] = [
		{
			title: 'Total Recursos',
			value: data.stats.totalResources.toString(),
			icon: <ComputerIcon />,
			iconColor: 'primary'
		},
		{
			title: 'Recursos Activos',
			value: data.stats.activeResources.toString(),
			icon: <CheckCircleIcon />,
			iconColor: 'success'
		},
		{
			title: 'En Mantenimiento',
			value: data.stats.maintenanceResources.toString(),
			icon: <MeetingRoomIcon />,
			iconColor: 'warning'
		}
	];

	// Filter configuration
	const filterOptions = [
		{
			key: 'type',
			label: 'Tipo',
			options: [
				{ value: '', label: 'Todos los tipos' },
				{ value: 'Sala de Conferencias', label: 'Sala de Conferencias' },
				{ value: 'Laboratorio', label: 'Laboratorio' },
				{ value: 'Auditorio', label: 'Auditorio' },
				{ value: 'Equipo Multimedia', label: 'Equipo Multimedia' }
			]
		},
		{
			key: 'status',
			label: 'Estado',
			options: [
				{ value: '', label: 'Todos los estados' },
				{ value: 'ACTIVE', label: 'Activo' },
				{ value: 'INACTIVE', label: 'Inactivo' },
				{ value: 'MAINTENANCE', label: 'En Mantenimiento' }
			]
		},
		{
			key: 'academicProgram',
			label: 'Programa Académico',
			options: [
				{ value: '', label: 'Todos los programas' },
				{ value: 'General', label: 'General' },
				{ value: 'Ingeniería de Sistemas', label: 'Ingeniería de Sistemas' },
				{ value: 'Ingeniería Química', label: 'Ingeniería Química' }
			]
		}
	];

	// Table columns configuration
	const columns: DataTableColumn[] = [
		{
			id: 'name',
			label: 'Nombre',
			align: 'left',
			render: (_, row: Resource) => (
				<Box>
					<Typography
						variant="body2"
						fontWeight="bold"
					>
						<Link
							component={NextLink}
							href={`/resources/${row.id}`}
							color="primary"
							underline="hover"
						>
							{row.name}
						</Link>
					</Typography>
					<Typography
						variant="caption"
						color="text.secondary"
					>
						{row.code}
					</Typography>
				</Box>
			)
		},
		{
			id: 'type',
			label: 'Tipo',
			align: 'left'
		},
		{
			id: 'capacity',
			label: 'Capacidad',
			align: 'center',
			render: (_, row: Resource) => (row.type === 'Equipo Multimedia' ? 'N/A' : row.capacity.toString())
		},
		{
			id: 'location',
			label: 'Ubicación',
			align: 'left'
		},
		{
			id: 'academicProgram',
			label: 'Programa',
			align: 'left',
			render: (_, row: Resource) => row.academicProgram || 'Sin asignar'
		},
		{
			id: 'status',
			label: 'Estado',
			align: 'center',
			render: (_, row: Resource) => {
				const statusConfig = {
					ACTIVE: { color: 'success' as const, label: 'Activo', icon: <CheckCircleIcon /> },
					INACTIVE: { color: 'default' as const, label: 'Inactivo', icon: <CancelIcon /> },
					MAINTENANCE: { color: 'warning' as const, label: 'Mantenimiento', icon: undefined }
				};
				const config = statusConfig[row.status];
				return (
					<StatusChip
						status={config.color}
						label={config.label}
						icon={config.icon}
					/>
				);
			}
		},
		{
			id: 'actions',
			label: 'Acciones',
			align: 'center',
			render: (_, row: Resource) => (
				<ActionMenu
					actions={[
						{
							key: 'view',
							label: 'Ver Detalles',
							icon: <VisibilityIcon />,
							onClick: () => handleResourceAction('view', row)
						},
						{
							key: 'edit',
							label: 'Editar',
							icon: <EditIcon />,
							onClick: () => handleResourceAction('edit', row)
						},
						{
							key: 'toggle-status',
							label: row.status === 'ACTIVE' ? 'Desactivar' : 'Activar',
							icon: <CheckCircleIcon />,
							onClick: () => handleResourceAction('toggle-status', row)
						},
						{
							key: 'maintenance',
							label: 'Marcar Mantenimiento',
							icon: <MeetingRoomIcon />,
							onClick: () => handleResourceAction('maintenance', row),
							disabled: row.status === 'MAINTENANCE'
						},
						{
							key: 'delete',
							label: 'Eliminar',
							icon: <DeleteIcon />,
							onClick: () => handleResourceAction('delete', row),
							color: 'error'
						}
					]}
				/>
			)
		}
	];

	return (
		<DataTablePageTemplate
			pageHeader={pageHeaderProps}
			statsData={statsData}
			searchPlaceholder="Buscar recursos..."
			searchValue={searchTerm}
			onSearchChange={setSearchTerm}
			filterOptions={filterOptions}
			filterValues={filters}
			onFilterChange={setFilters}
			columns={columns}
			data={filteredResources}
			loading={data.loading}
			error={data.error}
			emptyMessage="No se encontraron recursos"
		/>
	);
}
