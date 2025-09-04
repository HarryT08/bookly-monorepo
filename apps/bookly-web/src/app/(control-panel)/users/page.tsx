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
	Avatar,
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
	Alert
} from '@mui/material';
import {
	Search as SearchIcon,
	MoreVert as MoreVertIcon,
	PersonAdd as PersonAddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Block as BlockIcon,
	CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	roles: string[];
	status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
	lastLoginAt?: string;
	createdAt: string;
}

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
	const [roleDialogOpen, setRoleDialogOpen] = useState(false);

	// Mock data for demonstration
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setLoading(true);
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));

				setUsers([
					{
						id: '1',
						email: 'admin@ufps.edu.co',
						firstName: 'Administrador',
						lastName: 'Sistema',
						roles: ['ADMIN'],
						status: 'ACTIVE',
						lastLoginAt: '2024-01-15T10:30:00Z',
						createdAt: '2023-01-01T00:00:00Z'
					},
					{
						id: '2',
						email: 'estudiante@ufps.edu.co',
						firstName: 'Juan',
						lastName: 'Pérez',
						roles: ['STUDENT'],
						status: 'ACTIVE',
						lastLoginAt: '2024-01-14T15:20:00Z',
						createdAt: '2023-02-15T00:00:00Z'
					},
					{
						id: '3',
						email: 'docente@ufps.edu.co',
						firstName: 'María',
						lastName: 'García',
						roles: ['TEACHER'],
						status: 'ACTIVE',
						lastLoginAt: '2024-01-13T09:15:00Z',
						createdAt: '2023-03-10T00:00:00Z'
					}
				]);
			} catch (err) {
				setError('Error al cargar usuarios');
				console.error('Error loading users:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	const filteredUsers = users.filter(
		(user) =>
			user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleActionClick = (event: React.MouseEvent<HTMLElement>, user: User) => {
		setSelectedUser(user);
		setActionMenuAnchor(event.currentTarget);
	};

	const handleActionClose = () => {
		setActionMenuAnchor(null);
		setSelectedUser(null);
	};

	const getStatusChip = (status: User['status']) => {
		const statusConfig = {
			ACTIVE: { color: 'success' as const, label: 'Activo', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
			INACTIVE: { color: 'default' as const, label: 'Inactivo', icon: null },
			BLOCKED: { color: 'error' as const, label: 'Bloqueado', icon: <BlockIcon sx={{ fontSize: 16 }} /> }
		};

		const config = statusConfig[status];
		return (
			<Chip
				size="small"
				color={config.color}
				label={config.label}
				icon={config.icon}
			/>
		);
	};

	const getRoleChips = (roles: string[]) => {
		const roleColors = {
			ADMIN: 'error' as const,
			TEACHER: 'primary' as const,
			STUDENT: 'secondary' as const,
			STAFF: 'info' as const
		};

		return roles.map((role) => (
			<Chip
				key={role}
				size="small"
				color={roleColors[role as keyof typeof roleColors] || 'default'}
				label={role}
				sx={{ mr: 0.5 }}
			/>
		));
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
					Gestión de Usuarios
				</Typography>
				<Button
					variant="contained"
					startIcon={<PersonAddIcon />}
					color="primary"
				>
					Agregar Usuario
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

			<Paper sx={{ p: 2, mb: 2 }}>
				<TextField
					fullWidth
					variant="outlined"
					placeholder="Buscar usuarios..."
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
							<TableCell>Usuario</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Roles</TableCell>
							<TableCell>Estado</TableCell>
							<TableCell>Último Acceso</TableCell>
							<TableCell align="center">Acciones</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredUsers.map((user) => (
							<TableRow key={user.id}>
								<TableCell>
									<Box
										display="flex"
										alignItems="center"
									>
										<Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
											{user.firstName[0]}
											{user.lastName[0]}
										</Avatar>
										<Box>
											<Typography
												variant="body2"
												fontWeight="bold"
											>
												{user.firstName} {user.lastName}
											</Typography>
										</Box>
									</Box>
								</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>{getRoleChips(user.roles)}</TableCell>
								<TableCell>{getStatusChip(user.status)}</TableCell>
								<TableCell>
									{user.lastLoginAt
										? new Date(user.lastLoginAt).toLocaleDateString('es-CO', {
												year: 'numeric',
												month: 'short',
												day: 'numeric',
												hour: '2-digit',
												minute: '2-digit'
											})
										: 'Nunca'}
								</TableCell>
								<TableCell align="center">
									<IconButton onClick={(e) => handleActionClick(e, user)}>
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
						// Handle edit user
					}}
				>
					<EditIcon sx={{ mr: 1 }} />
					Editar
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleActionClose();
						setRoleDialogOpen(true);
					}}
				>
					<PersonAddIcon sx={{ mr: 1 }} />
					Gestionar Roles
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleActionClose();
						// Handle block user
					}}
				>
					<BlockIcon sx={{ mr: 1 }} />
					{selectedUser?.status === 'BLOCKED' ? 'Desbloquear' : 'Bloquear'}
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleActionClose();
						// Handle delete user
					}}
				>
					<DeleteIcon sx={{ mr: 1 }} />
					Eliminar
				</MenuItem>
			</Menu>

			<Dialog
				open={roleDialogOpen}
				onClose={() => setRoleDialogOpen(false)}
			>
				<DialogTitle>
					Gestionar Roles - {selectedUser?.firstName} {selectedUser?.lastName}
				</DialogTitle>
				<DialogContent>
					<FormControl
						fullWidth
						sx={{ mt: 2 }}
					>
						<InputLabel>Roles</InputLabel>
						<Select
							multiple
							value={selectedUser?.roles || []}
							label="Roles"
						>
							<MenuItem value="ADMIN">Administrador</MenuItem>
							<MenuItem value="TEACHER">Docente</MenuItem>
							<MenuItem value="STUDENT">Estudiante</MenuItem>
							<MenuItem value="STAFF">Personal</MenuItem>
						</Select>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setRoleDialogOpen(false)}>Cancelar</Button>
					<Button
						variant="contained"
						onClick={() => {
							setRoleDialogOpen(false);
							// Handle save roles
						}}
					>
						Guardar
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
