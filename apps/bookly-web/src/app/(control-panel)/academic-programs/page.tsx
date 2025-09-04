'use client';

import React, { useState, useEffect } from 'react';
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
	Button,
	TextField,
	InputAdornment,
	Chip,
	IconButton,
	Menu,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	FormControl,
	InputLabel,
	Select,
	CircularProgress,
	Alert,
	Card,
	CardContent
} from '@mui/material';
import {
	Search as SearchIcon,
	MoreVert as MoreVertIcon,
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	School as SchoolIcon,
	Visibility as VisibilityIcon,
	Group as GroupIcon,
	CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

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

export default function AcademicProgramsPage() {
	const [programs, setPrograms] = useState<AcademicProgram[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedProgram, setSelectedProgram] = useState<AcademicProgram | null>(null);
	const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [stats, setStats] = useState({
		totalPrograms: 0,
		activePrograms: 0,
		totalStudents: 0
	});

	useEffect(() => {
		const fetchPrograms = async () => {
			try {
				setLoading(true);
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

				setPrograms(mockPrograms);
				setStats({
					totalPrograms: mockPrograms.length,
					activePrograms: mockPrograms.filter((p) => p.status === 'ACTIVE').length,
					totalStudents: mockPrograms.reduce((sum, p) => sum + p.studentsCount, 0)
				});
			} catch (err) {
				setError('Error al cargar programas académicos');
				console.error('Error loading programs:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchPrograms();
	}, []);

	const filteredPrograms = programs.filter(
		(program) =>
			program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			program.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			program.faculty.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleActionClick = (event: React.MouseEvent<HTMLElement>, program: AcademicProgram) => {
		setSelectedProgram(program);
		setActionMenuAnchor(event.currentTarget);
	};

	const handleActionClose = () => {
		setActionMenuAnchor(null);
		setSelectedProgram(null);
	};

	const getStatusChip = (status: AcademicProgram['status']) => {
		return (
			<Chip
				size="small"
				color={status === 'ACTIVE' ? 'success' : 'default'}
				label={status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
				icon={status === 'ACTIVE' ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : undefined}
			/>
		);
	};

	const getLevelChip = (level: AcademicProgram['level']) => {
		const levelConfig = {
			UNDERGRADUATE: { color: 'primary' as const, label: 'Pregrado' },
			GRADUATE: { color: 'secondary' as const, label: 'Postgrado' },
			POSTGRADUATE: { color: 'info' as const, label: 'Doctorado' }
		};

		const config = levelConfig[level];
		return (
			<Chip
				size="small"
				color={config.color}
				label={config.label}
			/>
		);
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
					Programas Académicos
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					color="primary"
					onClick={() => setCreateDialogOpen(true)}
				>
					Crear Programa
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
			<Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
				<Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
					<Card>
						<CardContent>
							<Box
								display="flex"
								alignItems="center"
							>
								<SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
								<Box>
									<Typography variant="h5">{stats.totalPrograms}</Typography>
									<Typography color="text.secondary">Total Programas</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>
				<Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
					<Card>
						<CardContent>
							<Box
								display="flex"
								alignItems="center"
							>
								<VisibilityIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
								<Box>
									<Typography variant="h5">{stats.activePrograms}</Typography>
									<Typography color="text.secondary">Programas Activos</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>
				<Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
					<Card>
						<CardContent>
							<Box
								display="flex"
								alignItems="center"
							>
								<GroupIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
								<Box>
									<Typography variant="h5">{stats.totalStudents}</Typography>
									<Typography color="text.secondary">Total Estudiantes</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>
			</Box>

			<Paper sx={{ p: 2, mb: 2 }}>
				<TextField
					fullWidth
					variant="outlined"
					placeholder="Buscar programas..."
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
			</Paper>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Programa</TableCell>
							<TableCell>Facultad</TableCell>
							<TableCell>Nivel</TableCell>
							<TableCell>Duración</TableCell>
							<TableCell>Estudiantes</TableCell>
							<TableCell>Coordinador</TableCell>
							<TableCell>Estado</TableCell>
							<TableCell align="center">Acciones</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredPrograms.map((program) => (
							<TableRow key={program.id}>
								<TableCell>
									<Box>
										<Typography
											variant="body2"
											fontWeight="bold"
										>
											{program.name}
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
										>
											{program.code}
										</Typography>
									</Box>
								</TableCell>
								<TableCell>{program.faculty}</TableCell>
								<TableCell>{getLevelChip(program.level)}</TableCell>
								<TableCell>{program.duration} semestres</TableCell>
								<TableCell>{program.studentsCount}</TableCell>
								<TableCell>{program.coordinatorName || 'Sin asignar'}</TableCell>
								<TableCell>{getStatusChip(program.status)}</TableCell>
								<TableCell align="center">
									<IconButton onClick={(e) => handleActionClick(e, program)}>
										<MoreVertIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Menu
				anchorEl={actionMenuAnchor}
				open={Boolean(actionMenuAnchor)}
				onClose={handleActionClose}
			>
				<MenuItem
					onClick={() => {
						handleActionClose();
						// Handle view program details
					}}
				>
					<VisibilityIcon sx={{ mr: 1 }} />
					Ver Detalles
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleActionClose();
						// Handle edit program
					}}
				>
					<EditIcon sx={{ mr: 1 }} />
					Editar
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleActionClose();
						// Handle toggle status
					}}
				>
					<CheckCircleIcon sx={{ mr: 1 }} />
					{selectedProgram?.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleActionClose();
						// Handle delete program
					}}
				>
					<DeleteIcon sx={{ mr: 1 }} />
					Eliminar
				</MenuItem>
			</Menu>

			{/* Create Program Dialog */}
			<Dialog
				open={createDialogOpen}
				onClose={() => setCreateDialogOpen(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>Crear Nuevo Programa Académico</DialogTitle>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
						<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
							<Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
								<TextField
									fullWidth
									label="Nombre del Programa"
									variant="outlined"
								/>
							</Box>
							<Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
								<TextField
									fullWidth
									label="Código"
									variant="outlined"
								/>
							</Box>
						</Box>
						<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
							<Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
								<TextField
									fullWidth
									label="Facultad"
									variant="outlined"
								/>
							</Box>
							<Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
								<FormControl fullWidth>
									<InputLabel>Nivel</InputLabel>
									<Select label="Nivel">
										<MenuItem value="UNDERGRADUATE">Pregrado</MenuItem>
										<MenuItem value="GRADUATE">Postgrado</MenuItem>
										<MenuItem value="POSTGRADUATE">Doctorado</MenuItem>
									</Select>
								</FormControl>
							</Box>
						</Box>
						<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
							<Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
								<TextField
									fullWidth
									label="Duración (semestres)"
									type="number"
									variant="outlined"
								/>
							</Box>
							<Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
								<TextField
									fullWidth
									label="Coordinador"
									variant="outlined"
								/>
							</Box>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
					<Button
						variant="contained"
						onClick={() => {
							setCreateDialogOpen(false);
							// Handle create program
						}}
					>
						Crear
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
