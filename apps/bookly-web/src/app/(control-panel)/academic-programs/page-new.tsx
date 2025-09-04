'use client';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import {
	School as SchoolIcon,
	Visibility as VisibilityIcon,
	Group as GroupIcon,
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { StatusChip } from '../../../components/atoms';
import { ActionMenu } from '../../../components/molecules';
import { StatCardProps } from '../../../components/molecules/StatCard/StatCard';
import { DataTableColumn, CreateProgramDialog } from '@/components/organisms';
import { CreateProgramDialogData } from '@/components/organisms/CreateProgramDialog';
import { DataTablePageTemplate } from '@/components/templates';
import { PageHeaderProps } from '@components/molecules/page-form-header';

interface AcademicProgram {
	id: string;
	name: string;
	code: string;
	faculty: string;
	level: 'UNDERGRADUATE' | 'GRADUATE' | 'POSTGRADUATE';
	duration: number;
	status: 'ACTIVE' | 'INACTIVE';
	studentsCount: number;
	coordinatorId?: string;
	coordinatorName?: string;
	createdAt: string;
}

interface ProgramsPageData {
	programs: AcademicProgram[];
	stats: {
		totalPrograms: number;
		activePrograms: number;
		totalStudents: number;
	};
	loading: boolean;
	error: string | null;
}

export default function AcademicProgramsPage() {
	const [data, setData] = useState<ProgramsPageData>({
		programs: [],
		stats: { totalPrograms: 0, activePrograms: 0, totalStudents: 0 },
		loading: true,
		error: null
	});
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [filters, setFilters] = useState({
		faculty: '',
		level: '',
		status: ''
	});

	// Mock data fetch
	useEffect(() => {
		const fetchPrograms = async () => {
			try {
				setData((prev) => ({ ...prev, loading: true, error: null }));

				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));

				const mockPrograms: AcademicProgram[] = [
					{
						id: '1',
						name: 'Ingeniería de Sistemas',
						code: 'ING-SIS',
						faculty: 'Ingeniería',
						level: 'UNDERGRADUATE',
						duration: 10,
						status: 'ACTIVE',
						studentsCount: 450,
						coordinatorName: 'Dr. Carlos Rodríguez',
						createdAt: '2020-01-15T00:00:00Z'
					},
					{
						id: '2',
						name: 'Administración de Empresas',
						code: 'ADM-EMP',
						faculty: 'Ciencias Empresariales',
						level: 'UNDERGRADUATE',
						duration: 8,
						status: 'ACTIVE',
						studentsCount: 320,
						coordinatorName: 'Dra. Ana González',
						createdAt: '2019-08-20T00:00:00Z'
					},
					{
						id: '3',
						name: 'Maestría en Educación',
						code: 'MAE-EDU',
						faculty: 'Educación',
						level: 'GRADUATE',
						duration: 4,
						status: 'ACTIVE',
						studentsCount: 85,
						coordinatorName: 'Dr. Luis Martínez',
						createdAt: '2021-03-10T00:00:00Z'
					},
					{
						id: '4',
						name: 'Arquitectura',
						code: 'ARQ',
						faculty: 'Ingeniería',
						level: 'UNDERGRADUATE',
						duration: 10,
						status: 'INACTIVE',
						studentsCount: 0,
						createdAt: '2018-01-15T00:00:00Z'
					}
				];

				const stats = {
					totalPrograms: mockPrograms.length,
					activePrograms: mockPrograms.filter((p) => p.status === 'ACTIVE').length,
					totalStudents: mockPrograms.reduce((sum, p) => sum + p.studentsCount, 0)
				};

				setData({
					programs: mockPrograms,
					stats,
					loading: false,
					error: null
				});
			} catch (err) {
				setData((prev) => ({
					...prev,
					loading: false,
					error: 'Error al cargar programas académicos'
				}));
				console.error('Error loading programs:', err);
			}
		};

		fetchPrograms();
	}, []);

	// Filter programs based on search and filters
	const filteredPrograms = data.programs.filter((program) => {
		const matchesSearch =
			program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			program.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			program.faculty.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesFilters =
			(!filters.faculty || program.faculty === filters.faculty) &&
			(!filters.level || program.level === filters.level) &&
			(!filters.status || program.status === filters.status);

		return matchesSearch && matchesFilters;
	});

	const handleCreateProgram = async (programData: CreateProgramDialogData) => {
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			const newProgram: AcademicProgram = {
				id: Date.now().toString(),
				name: programData.name,
				code: programData.code,
				faculty: programData.faculty,
				level: programData.level,
				duration: programData.duration,
				status: 'ACTIVE',
				studentsCount: 0,
				coordinatorName: programData.coordinator || undefined,
				createdAt: new Date().toISOString()
			};

			setData((prev) => ({
				...prev,
				programs: [...prev.programs, newProgram],
				stats: {
					...prev.stats,
					totalPrograms: prev.stats.totalPrograms + 1,
					activePrograms: prev.stats.activePrograms + 1
				}
			}));

			setCreateDialogOpen(false);
		} catch (error) {
			console.error('Error creating program:', error);
		}
	};

	const handleProgramAction = (action: string, program: AcademicProgram) => {
		switch (action) {
			case 'view':
				console.log('View program:', program);
				break;
			case 'edit':
				console.log('Edit program:', program);
				break;
			case 'toggle-status':
				const newStatus = program.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
				setData((prev) => ({
					...prev,
					programs: prev.programs.map((p) => (p.id === program.id ? { ...p, status: newStatus } : p)),
					stats: {
						...prev.stats,
						activePrograms:
							newStatus === 'ACTIVE' ? prev.stats.activePrograms + 1 : prev.stats.activePrograms - 1
					}
				}));
				break;
			case 'delete':
				setData((prev) => ({
					...prev,
					programs: prev.programs.filter((p) => p.id !== program.id),
					stats: {
						totalPrograms: prev.stats.totalPrograms - 1,
						activePrograms:
							program.status === 'ACTIVE' ? prev.stats.activePrograms - 1 : prev.stats.activePrograms,
						totalStudents: prev.stats.totalStudents - program.studentsCount
					}
				}));
				break;
			default:
				break;
		}
	};

	// Page header configuration
	const pageHeaderProps: PageHeaderProps = {
		title: 'Programas Académicos',
		actions: [
			{
				label: 'Crear Programa',
				variant: 'contained',
				startIcon: <AddIcon />,
				onClick: () => setCreateDialogOpen(true)
			}
		]
	};

	// Stats configuration
	const statsData: StatCardProps[] = [
		{
			title: 'Total Programas',
			value: data.stats.totalPrograms.toString(),
			icon: <SchoolIcon />,
			iconColor: 'primary'
		},
		{
			title: 'Programas Activos',
			value: data.stats.activePrograms.toString(),
			icon: <VisibilityIcon />,
			iconColor: 'success'
		},
		{
			title: 'Total Estudiantes',
			value: data.stats.totalStudents.toLocaleString(),
			icon: <GroupIcon />,
			iconColor: 'info'
		}
	];

	// Filter configuration
	const filterOptions = [
		{
			key: 'faculty',
			label: 'Facultad',
			options: [
				{ value: '', label: 'Todas las facultades' },
				{ value: 'Ingeniería', label: 'Ingeniería' },
				{ value: 'Ciencias Empresariales', label: 'Ciencias Empresariales' },
				{ value: 'Educación', label: 'Educación' }
			]
		},
		{
			key: 'level',
			label: 'Nivel',
			options: [
				{ value: '', label: 'Todos los niveles' },
				{ value: 'UNDERGRADUATE', label: 'Pregrado' },
				{ value: 'GRADUATE', label: 'Postgrado' },
				{ value: 'POSTGRADUATE', label: 'Doctorado' }
			]
		},
		{
			key: 'status',
			label: 'Estado',
			options: [
				{ value: '', label: 'Todos los estados' },
				{ value: 'ACTIVE', label: 'Activo' },
				{ value: 'INACTIVE', label: 'Inactivo' }
			]
		}
	];

	// Table columns configuration
	const columns: DataTableColumn[] = [
		{
			id: 'program',
			label: 'Programa',
			align: 'left',
			render: (_, row: AcademicProgram) => (
				<Box>
					<Typography
						variant="body2"
						fontWeight="bold"
					>
						{row.name}
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
			id: 'faculty',
			label: 'Facultad',
			align: 'left'
		},
		{
			id: 'level',
			label: 'Nivel',
			align: 'center',
			render: (_, row: AcademicProgram) => {
				const levelConfig = {
					UNDERGRADUATE: { color: 'primary' as const, label: 'Pregrado' },
					GRADUATE: { color: 'secondary' as const, label: 'Postgrado' },
					POSTGRADUATE: { color: 'info' as const, label: 'Doctorado' }
				};
				const config = levelConfig[row.level];
				return (
					<StatusChip
						status={config.color}
						label={config.label}
					/>
				);
			}
		},
		{
			id: 'duration',
			label: 'Duración',
			align: 'center',
			render: (_, row: AcademicProgram) => `${row.duration} semestres`
		},
		{
			id: 'studentsCount',
			label: 'Estudiantes',
			align: 'center'
		},
		{
			id: 'coordinatorName',
			label: 'Coordinador',
			align: 'left',
			render: (_, row: AcademicProgram) => row.coordinatorName || 'Sin asignar'
		},
		{
			id: 'status',
			label: 'Estado',
			align: 'center',
			render: (_, row: AcademicProgram) => (
				<StatusChip
					status={row.status === 'ACTIVE' ? 'success' : 'default'}
					label={row.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
					icon={row.status === 'ACTIVE' ? <CheckCircleIcon /> : undefined}
				/>
			)
		},
		{
			id: 'actions',
			label: 'Acciones',
			align: 'center',
			render: (_, row: AcademicProgram) => (
				<ActionMenu
					actions={[
						{
							key: 'view',
							label: 'Ver Detalles',
							icon: <VisibilityIcon />,
							onClick: () => handleProgramAction('view', row)
						},
						{
							key: 'edit',
							label: 'Editar',
							icon: <EditIcon />,
							onClick: () => handleProgramAction('edit', row)
						},
						{
							key: 'toggle-status',
							label: row.status === 'ACTIVE' ? 'Desactivar' : 'Activar',
							icon: <CheckCircleIcon />,
							onClick: () => handleProgramAction('toggle-status', row)
						},
						{
							key: 'delete',
							label: 'Eliminar',
							icon: <DeleteIcon />,
							onClick: () => handleProgramAction('delete', row),
							color: 'error'
						}
					]}
				/>
			)
		}
	];

	return (
		<>
			<DataTablePageTemplate
				pageHeader={pageHeaderProps}
				statsData={statsData}
				searchPlaceholder="Buscar programas..."
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				filterOptions={filterOptions}
				filterValues={filters}
				onFilterChange={setFilters}
				columns={columns}
				data={filteredPrograms}
				loading={data.loading}
				error={data.error}
				emptyMessage="No se encontraron programas académicos"
			/>

			<CreateProgramDialog
				open={createDialogOpen}
				onClose={() => setCreateDialogOpen(false)}
				onSubmit={handleCreateProgram}
			/>
		</>
	);
}
