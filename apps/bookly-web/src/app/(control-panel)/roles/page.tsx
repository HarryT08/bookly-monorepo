'use client';

import React, { useEffect, useState } from 'react';
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Container,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormGroup,
	FormControlLabel,
	Checkbox,
	Chip,
	Tooltip,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	IconButton,
	Paper
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Search as SearchIcon,
	Security as SecurityIcon,
	Group as GroupIcon,
	AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useRoleManagement, usePermissionManagement } from '@hooks/useAuth';
import type { CreateRoleRequest, UpdateRoleRequest, RoleWithPermissions } from '@services/auth/types';

interface RoleFormData {
	name: string;
	description: string;
	category: string;
	permissions: string[];
}

const ROLE_CATEGORIES = [
	{ value: 'ACADEMICO', label: 'Académico' },
	{ value: 'ADMINISTRATIVO', label: 'Administrativo' },
	{ value: 'SEGURIDAD', label: 'Seguridad' },
	{ value: 'INVITADO', label: 'Invitado' }
];

export default function RolesPage() {
	const {
		roles,
		loading,
		pagination,
		getAllRoles,
		getActiveRoles: _getActiveRoles,
		createRole,
		updateRole,
		deleteRole,
		setPagination
	} = useRoleManagement();

	const { permissions, getActivePermissions } = usePermissionManagement();

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('');
	const [openDialog, setOpenDialog] = useState(false);
	const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);
	const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ open: boolean; role: RoleWithPermissions | null }>(
		{
			open: false,
			role: null
		}
	);

	const [formData, setFormData] = useState<RoleFormData>({
		name: '',
		description: '',
		category: 'ACADEMICO',
		permissions: []
	});

	// Load data on component mount
	useEffect(() => {
		getAllRoles({ page: 1, limit: 10 });
		getActivePermissions();
	}, [getAllRoles, getActivePermissions]);

	// Handle search and filtering
	const handleSearch = async () => {
		await getAllRoles({
			page: 1,
			limit: pagination.limit,
			search: searchTerm
		});
	};

	const handlePageChange = async (event: unknown, newPage: number) => {
		const page = newPage + 1;
		await getAllRoles({
			page,
			limit: pagination.limit,
			search: searchTerm
		});
		setPagination((prev) => ({ ...prev, page }));
	};

	const handleRowsPerPageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const limit = parseInt(event.target.value, 10);
		await getAllRoles({
			page: 1,
			limit,
			search: searchTerm
		});
		setPagination((prev) => ({ ...prev, limit, page: 1 }));
	};

	// Dialog handlers
	const handleCreateRole = () => {
		setEditingRole(null);
		setFormData({
			name: '',
			description: '',
			category: 'ACADEMICO',
			permissions: []
		});
		setOpenDialog(true);
	};

	const handleEditRole = (role: RoleWithPermissions) => {
		setEditingRole(role);
		setFormData({
			name: role.name,
			description: role.description || '',
			category: role.displayName || 'ACADEMICO',
			permissions: role.permissions?.map((p) => p.id) || []
		});
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingRole(null);
	};

	// Form handlers
	const handleFormChange =
		(field: keyof RoleFormData) =>
		(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }) => {
			setFormData((prev) => ({
				...prev,
				[field]: event.target.value
			}));
		};

	const handlePermissionChange = (permissionId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			permissions: event.target.checked
				? [...prev.permissions, permissionId]
				: prev.permissions.filter((id) => id !== permissionId)
		}));
	};

	const handleSubmit = async () => {
		try {
			if (editingRole) {
				// Update existing role
				const updateData: UpdateRoleRequest = {
					name: formData.name,
					description: formData.description,
					category: formData.category,
					permissions: formData.permissions
				};
				await updateRole(editingRole.id, updateData);
			} else {
				// Create new role
				const createData: CreateRoleRequest = {
					name: formData.name,
					description: formData.description,
					category: formData.category,
					permissions: formData.permissions
				};
				await createRole(createData);
			}

			handleCloseDialog();
			// Refresh the list
			await getAllRoles({
				page: pagination.page,
				limit: pagination.limit,
				search: searchTerm
			});
		} catch (error) {
			console.error('Error saving role:', error);
		}
	};

	// Delete handlers
	const handleDeleteClick = (role: RoleWithPermissions) => {
		setDeleteConfirmDialog({ open: true, role });
	};

	const handleDeleteConfirm = async () => {
		if (deleteConfirmDialog.role) {
			await deleteRole(deleteConfirmDialog.role.id);
			setDeleteConfirmDialog({ open: false, role: null });
			// Refresh the list
			await getAllRoles({
				page: pagination.page,
				limit: pagination.limit,
				search: searchTerm
			});
		}
	};

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case 'ADMINISTRATIVO':
				return <AdminIcon fontSize="small" />;
			case 'SEGURIDAD':
				return <SecurityIcon fontSize="small" />;
			default:
				return <GroupIcon fontSize="small" />;
		}
	};

	const getCategoryColor = (category: string): 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
		switch (category) {
			case 'ADMINISTRATIVO':
				return 'primary';
			case 'SEGURIDAD':
				return 'error';
			case 'ACADEMICO':
				return 'info';
			default:
				return 'secondary';
		}
	};

	return (
		<Container
			maxWidth="xl"
			sx={{ mt: 4, mb: 4 }}
		>
			{/* Header */}
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h4"
					component="h1"
					gutterBottom
				>
					Gestión de Roles
				</Typography>
				<Typography
					variant="subtitle1"
					color="text.secondary"
				>
					Administra roles y permisos del sistema
				</Typography>
			</Box>

			{/* Statistics Cards */}
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: {
						xs: '1fr',
						sm: 'repeat(2, 1fr)',
						md: 'repeat(4, 1fr)'
					},
					gap: 3,
					mb: 4
				}}
			>
				<Box>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<GroupIcon sx={{ mr: 2, color: 'primary.main' }} />
								<Box>
									<Typography
										variant="h6"
										component="div"
									>
										{roles.filter((r) => r.isActive).length}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										Roles Activos
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>
				<Box>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<AdminIcon sx={{ mr: 2, color: 'warning.main' }} />
								<Box>
									<Typography
										variant="h6"
										component="div"
									>
										{roles.filter((r) => r.isPredefined).length}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										Roles del Sistema
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>
				<Box>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<SecurityIcon sx={{ mr: 2, color: 'success.main' }} />
								<Box>
									<Typography
										variant="h6"
										component="div"
									>
										{permissions.filter((p) => p.isActive).length}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										Permisos Disponibles
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>
				<Box>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<GroupIcon sx={{ mr: 2, color: 'info.main' }} />
								<Box>
									<Typography
										variant="h6"
										component="div"
									>
										{roles.reduce((acc, role) => acc + (role.userCount || 0), 0)}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										Asignaciones Totales
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>
			</Box>

			{/* Controls */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: {
								xs: '1fr',
								md: 'repeat(4, 1fr)'
							},
							gap: 2,
							alignItems: 'center'
						}}
					>
						<Box>
							<TextField
								fullWidth
								placeholder="Buscar roles..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
								InputProps={{
									startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
								}}
							/>
						</Box>
						<Box>
							<FormControl fullWidth>
								<InputLabel>Categoría</InputLabel>
								<Select
									value={selectedCategory}
									onChange={(e) => setSelectedCategory(e.target.value)}
									label="Categoría"
								>
									<MenuItem value="">Todas</MenuItem>
									{ROLE_CATEGORIES.map((category) => (
										<MenuItem
											key={category.value}
											value={category.value}
										>
											{category.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Box>
						<Box>
							<Button
								variant="outlined"
								onClick={handleSearch}
								sx={{ mr: 2 }}
							>
								Buscar
							</Button>
						</Box>
						<Box>
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={handleCreateRole}
								fullWidth
							>
								Nuevo Rol
							</Button>
						</Box>
					</Box>
				</CardContent>
			</Card>

			{/* Roles Table */}
			<Card>
				<CardHeader title="Lista de Roles" />
				<CardContent sx={{ p: 0 }}>
					<TableContainer
						component={Paper}
						elevation={0}
					>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Nombre</TableCell>
									<TableCell>Descripción</TableCell>
									<TableCell>Categoría</TableCell>
									<TableCell>Permisos</TableCell>
									<TableCell>Usuarios</TableCell>
									<TableCell>Estado</TableCell>
									<TableCell>Tipo</TableCell>
									<TableCell align="center">Acciones</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{loading && roles.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={8}
											align="center"
										>
											<Typography>Cargando roles...</Typography>
										</TableCell>
									</TableRow>
								) : roles.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={8}
											align="center"
										>
											<Typography color="text.secondary">No se encontraron roles</Typography>
										</TableCell>
									</TableRow>
								) : (
									roles.map((role) => (
										<TableRow
											key={role.id}
											hover
										>
											<TableCell>
												<Box sx={{ display: 'flex', alignItems: 'center' }}>
													{getCategoryIcon(role.displayName || '')}
													<Typography sx={{ ml: 1, fontWeight: 'medium' }}>
														{role.displayName}
													</Typography>
												</Box>
											</TableCell>
											<TableCell>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													{role.description || 'Sin descripción'}
												</Typography>
											</TableCell>
											<TableCell>
												<Chip
													size="small"
													color={getCategoryColor(role.displayName || '')}
													label={
														ROLE_CATEGORIES.find((c) => c.value === role.displayName)
															?.label || role.displayName
													}
												/>
											</TableCell>
											<TableCell>
												<Typography variant="body2">
													{role.permissions?.length || 0} permisos
												</Typography>
											</TableCell>
											<TableCell>
												<Typography variant="body2">{role.userCount || 0} usuarios</Typography>
											</TableCell>
											<TableCell>
												<Chip
													size="small"
													color={role.isActive ? 'success' : 'default'}
													label={role.isActive ? 'Activo' : 'Inactivo'}
												/>
											</TableCell>
											<TableCell>
												<Chip
													size="small"
													color={role.isPredefined ? 'warning' : 'info'}
													label={role.isPredefined ? 'Sistema' : 'Personalizado'}
												/>
											</TableCell>
											<TableCell align="center">
												<Tooltip title="Editar">
													<IconButton
														size="small"
														onClick={() => handleEditRole(role)}
														disabled={role.isPredefined}
													>
														<EditIcon fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title="Eliminar">
													<IconButton
														size="small"
														onClick={() => handleDeleteClick(role)}
														disabled={role.isPredefined}
														color="error"
													>
														<DeleteIcon fontSize="small" />
													</IconButton>
												</Tooltip>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</TableContainer>

					<TablePagination
						component="div"
						count={pagination.total}
						page={pagination.page - 1}
						onPageChange={handlePageChange}
						rowsPerPage={pagination.limit}
						onRowsPerPageChange={handleRowsPerPageChange}
						rowsPerPageOptions={[5, 10, 25, 50]}
						labelDisplayedRows={({ from, to, count }) =>
							`${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
						}
						labelRowsPerPage="Filas por página:"
					/>
				</CardContent>
			</Card>

			{/* Create/Edit Role Dialog */}
			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>{editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>
				<DialogContent>
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: {
								xs: '1fr',
								md: 'repeat(2, 1fr)'
							},
							gap: 3,
							mt: 1
						}}
					>
						<Box>
							<TextField
								fullWidth
								label="Nombre del Rol"
								value={formData.name}
								onChange={handleFormChange('name')}
								required
							/>
						</Box>
						<Box>
							<FormControl fullWidth>
								<InputLabel>Categoría</InputLabel>
								<Select
									value={formData.category}
									onChange={handleFormChange('category')}
									label="Categoría"
								>
									{ROLE_CATEGORIES.map((category) => (
										<MenuItem
											key={category.value}
											value={category.value}
										>
											{category.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Box>
						<Box sx={{ gridColumn: '1 / -1' }}>
							<TextField
								fullWidth
								multiline
								rows={3}
								label="Descripción"
								value={formData.description}
								onChange={handleFormChange('description')}
							/>
						</Box>
						<Box sx={{ gridColumn: '1 / -1' }}>
							<Typography
								variant="subtitle1"
								sx={{ mb: 2 }}
							>
								Permisos
							</Typography>
							<FormGroup>
								<Box
									sx={{
										display: 'grid',
										gridTemplateColumns: {
											xs: '1fr',
											md: 'repeat(2, 1fr)'
										},
										gap: 1
									}}
								>
									{permissions.map((permission) => (
										<Box key={permission.id}>
											<FormControlLabel
												control={
													<Checkbox
														checked={formData.permissions.includes(permission.id)}
														onChange={handlePermissionChange(permission.id)}
													/>
												}
												label={
													<Box>
														<Typography variant="body2">{permission.name}</Typography>
														<Typography
															variant="caption"
															color="text.secondary"
														>
															{permission.resource}:{permission.action}:{permission.scope}
														</Typography>
													</Box>
												}
											/>
										</Box>
									))}
								</Box>
							</FormGroup>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Cancelar</Button>
					<Button
						onClick={handleSubmit}
						variant="contained"
					>
						{editingRole ? 'Actualizar' : 'Crear'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteConfirmDialog.open}
				onClose={() => setDeleteConfirmDialog({ open: false, role: null })}
			>
				<DialogTitle>Confirmar Eliminación</DialogTitle>
				<DialogContent>
					<Typography>
						¿Estás seguro de que deseas eliminar el rol "{deleteConfirmDialog.role?.displayName}"?
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ mt: 2 }}
					>
						Esta acción no se puede deshacer.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteConfirmDialog({ open: false, role: null })}>Cancelar</Button>
					<Button
						onClick={handleDeleteConfirm}
						variant="contained"
						color="error"
					>
						Eliminar
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}
