'use client';

import React, { useEffect, useState } from 'react';
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Typography,
	Tooltip,
	Switch,
	FormControlLabel,
	Autocomplete
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Search as SearchIcon,
	Security as SecurityIcon,
	VpnKey as KeyIcon,
	AdminPanelSettings as AdminIcon,
	CheckCircle as CheckIcon
} from '@mui/icons-material';
import { usePermissionManagement } from '@hooks/useAuth';
import type { CreatePermissionRequest, UpdatePermissionRequest, PermissionWithDetails } from '@services/auth/types';

interface PermissionFormData {
	name: string;
	description: string;
	resource: string;
	action: string;
	scope: string;
	conditions: Record<string, any>;
	isActive: boolean;
}

// Predefined options for form fields
const RESOURCES = [
	'users',
	'roles',
	'permissions',
	'resources',
	'reservations',
	'approvals',
	'reports',
	'categories',
	'settings',
	'audit'
];

const ACTIONS = [
	'create',
	'read',
	'update',
	'delete',
	'list',
	'approve',
	'reject',
	'export',
	'import',
	'manage',
	'view'
];

const SCOPES = ['global', 'program', 'department', 'own', 'assigned', 'public'];

export default function PermissionsPage() {
	const {
		permissions,
		loading,
		pagination,
		getAllPermissions,
		getActivePermissions,
		createPermission,
		updatePermission,
		deletePermission,
		activatePermission,
		deactivatePermission,
		setPagination
	} = usePermissionManagement();

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedResource, setSelectedResource] = useState('');
	const [selectedAction, setSelectedAction] = useState('');
	const [selectedScope, setSelectedScope] = useState('');
	const [openDialog, setOpenDialog] = useState(false);
	const [editingPermission, setEditingPermission] = useState<PermissionWithDetails | null>(null);
	const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
		open: boolean;
		permission: PermissionWithDetails | null;
	}>({
		open: false,
		permission: null
	});

	const [formData, setFormData] = useState<PermissionFormData>({
		name: '',
		description: '',
		resource: '',
		action: '',
		scope: 'global',
		conditions: {},
		isActive: true
	});

	// Load data on component mount
	useEffect(() => {
		getAllPermissions({ page: 1, limit: 10 });
	}, [getAllPermissions]);

	// Handle search and filtering
	const handleSearch = async () => {
		await getAllPermissions({
			page: 1,
			limit: pagination.limit,
			search: searchTerm,
			resource: selectedResource || undefined,
			action: selectedAction || undefined,
			scope: selectedScope || undefined
		});
	};

	const handlePageChange = async (event: unknown, newPage: number) => {
		const page = newPage + 1;
		await getAllPermissions({
			page,
			limit: pagination.limit,
			search: searchTerm,
			resource: selectedResource || undefined,
			action: selectedAction || undefined,
			scope: selectedScope || undefined
		});
		setPagination((prev) => ({ ...prev, page }));
	};

	const handleRowsPerPageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const limit = parseInt(event.target.value, 10);
		await getAllPermissions({
			page: 1,
			limit,
			search: searchTerm,
			resource: selectedResource || undefined,
			action: selectedAction || undefined,
			scope: selectedScope || undefined
		});
		setPagination((prev) => ({ ...prev, limit, page: 1 }));
	};

	// Dialog handlers
	const handleCreatePermission = () => {
		setEditingPermission(null);
		setFormData({
			name: '',
			description: '',
			resource: '',
			action: '',
			scope: 'global',
			conditions: {},
			isActive: true
		});
		setOpenDialog(true);
	};

	const handleEditPermission = (permission: PermissionWithDetails) => {
		setEditingPermission(permission);
		setFormData({
			name: permission.name,
			description: permission.description || '',
			resource: permission.resource,
			action: permission.action,
			scope: permission.scope,
			conditions: permission.conditions || {},
			isActive: permission.isActive
		});
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingPermission(null);
	};

	// Form handlers
	const handleFormChange =
		(field: keyof PermissionFormData) =>
		(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }) => {
			setFormData((prev) => ({
				...prev,
				[field]: event.target.value
			}));
		};

	const handleSwitchChange = (field: keyof PermissionFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			[field]: event.target.checked
		}));
	};

	const handleSubmit = async () => {
		try {
			if (editingPermission) {
				// Update existing permission
				const updateData: UpdatePermissionRequest = {
					name: formData.name,
					description: formData.description,
					resource: formData.resource,
					action: formData.action,
					scope: formData.scope,
					conditions: formData.conditions,
					isActive: formData.isActive
				};
				await updatePermission(editingPermission.id, updateData);
			} else {
				// Create new permission
				const createData: CreatePermissionRequest = {
					name: formData.name,
					description: formData.description,
					resource: formData.resource,
					action: formData.action,
					scope: formData.scope,
					conditions: formData.conditions,
					isActive: formData.isActive
				};
				await createPermission(createData);
			}

			handleCloseDialog();
			// Refresh the list
			await getAllPermissions({
				page: pagination.page,
				limit: pagination.limit,
				search: searchTerm,
				resource: selectedResource || undefined,
				action: selectedAction || undefined,
				scope: selectedScope || undefined
			});
		} catch (error) {
			console.error('Error saving permission:', error);
		}
	};

	// Toggle permission status
	const handleToggleStatus = async (permission: PermissionWithDetails) => {
		try {
			if (permission.isActive) {
				await deactivatePermission(permission.id);
			} else {
				await activatePermission(permission.id);
			}
			// Refresh the list
			await getAllPermissions({
				page: pagination.page,
				limit: pagination.limit,
				search: searchTerm,
				resource: selectedResource || undefined,
				action: selectedAction || undefined,
				scope: selectedScope || undefined
			});
		} catch (error) {
			console.error('Error toggling permission status:', error);
		}
	};

	// Delete handlers
	const handleDeleteClick = (permission: PermissionWithDetails) => {
		setDeleteConfirmDialog({ open: true, permission });
	};

	const handleDeleteConfirm = async () => {
		if (deleteConfirmDialog.permission) {
			await deletePermission(deleteConfirmDialog.permission.id);
			setDeleteConfirmDialog({ open: false, permission: null });
			// Refresh the list
			await getAllPermissions({
				page: pagination.page,
				limit: pagination.limit,
				search: searchTerm,
				resource: selectedResource || undefined,
				action: selectedAction || undefined,
				scope: selectedScope || undefined
			});
		}
	};

	const getResourceColor = (resource: string): 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
		switch (resource) {
			case 'users':
				return 'primary';
			case 'roles':
			case 'permissions':
				return 'secondary';
			case 'resources':
			case 'reservations':
				return 'info';
			case 'approvals':
				return 'warning';
			case 'reports':
				return 'success';
			default:
				return 'primary';
		}
	};

	const getScopeColor = (scope: string): 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
		switch (scope) {
			case 'global':
				return 'error';
			case 'program':
				return 'warning';
			case 'department':
				return 'info';
			case 'own':
				return 'success';
			default:
				return 'primary';
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
					Gestión de Permisos
				</Typography>
				<Typography
					variant="subtitle1"
					color="text.secondary"
				>
					Administra permisos granulares del sistema
				</Typography>
			</Box>

			{/* Statistics Cards */}
			<Grid
				container
				spacing={3}
				sx={{ mb: 4 }}
			>
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<SecurityIcon sx={{ mr: 2, color: 'primary.main' }} />
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
										Permisos Activos
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<KeyIcon sx={{ mr: 2, color: 'info.main' }} />
								<Box>
									<Typography
										variant="h6"
										component="div"
									>
										{[...new Set(permissions.map((p) => p.resource))].length}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										Recursos Protegidos
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<AdminIcon sx={{ mr: 2, color: 'warning.main' }} />
								<Box>
									<Typography
										variant="h6"
										component="div"
									>
										{permissions.filter((p) => p.scope === 'global').length}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										Permisos Globales
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<CheckIcon sx={{ mr: 2, color: 'success.main' }} />
								<Box>
									<Typography
										variant="h6"
										component="div"
									>
										{permissions.filter((p) => p.roleCount && p.roleCount > 0).length}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										Permisos Asignados
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* Controls */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Grid
						container
						spacing={2}
						alignItems="center"
					>
						<Grid
							item
							xs={12}
							md={3}
						>
							<TextField
								fullWidth
								placeholder="Buscar permisos..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
								InputProps={{
									startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
								}}
							/>
						</Grid>
						<Grid
							item
							xs={12}
							md={2}
						>
							<Autocomplete
								options={RESOURCES}
								value={selectedResource}
								onChange={(e, newValue) => setSelectedResource(newValue || '')}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Recurso"
									/>
								)}
							/>
						</Grid>
						<Grid
							item
							xs={12}
							md={2}
						>
							<Autocomplete
								options={ACTIONS}
								value={selectedAction}
								onChange={(e, newValue) => setSelectedAction(newValue || '')}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Acción"
									/>
								)}
							/>
						</Grid>
						<Grid
							item
							xs={12}
							md={2}
						>
							<Autocomplete
								options={SCOPES}
								value={selectedScope}
								onChange={(e, newValue) => setSelectedScope(newValue || '')}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Alcance"
									/>
								)}
							/>
						</Grid>
						<Grid
							item
							xs={12}
							md={1}
						>
							<Button
								variant="outlined"
								onClick={handleSearch}
								fullWidth
							>
								Buscar
							</Button>
						</Grid>
						<Grid
							item
							xs={12}
							md={2}
						>
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={handleCreatePermission}
								fullWidth
							>
								Nuevo Permiso
							</Button>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* Permissions Table */}
			<Card>
				<CardHeader title="Lista de Permisos" />
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
									<TableCell>Recurso</TableCell>
									<TableCell>Acción</TableCell>
									<TableCell>Alcance</TableCell>
									<TableCell>Roles</TableCell>
									<TableCell>Estado</TableCell>
									<TableCell align="center">Acciones</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{loading && permissions.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={8}
											align="center"
										>
											<Typography>Cargando permisos...</Typography>
										</TableCell>
									</TableRow>
								) : permissions.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={8}
											align="center"
										>
											<Typography color="text.secondary">No se encontraron permisos</Typography>
										</TableCell>
									</TableRow>
								) : (
									permissions.map((permission) => (
										<TableRow
											key={permission.id}
											hover
										>
											<TableCell>
												<Box sx={{ display: 'flex', alignItems: 'center' }}>
													<SecurityIcon
														fontSize="small"
														sx={{ mr: 1 }}
													/>
													<Typography
														variant="body2"
														fontWeight="medium"
													>
														{permission.name}
													</Typography>
												</Box>
											</TableCell>
											<TableCell>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													{permission.description || 'Sin descripción'}
												</Typography>
											</TableCell>
											<TableCell>
												<Chip
													size="small"
													color={getResourceColor(permission.resource)}
													label={permission.resource}
												/>
											</TableCell>
											<TableCell>
												<Typography
													variant="body2"
													fontWeight="medium"
												>
													{permission.action}
												</Typography>
											</TableCell>
											<TableCell>
												<Chip
													size="small"
													color={getScopeColor(permission.scope)}
													label={permission.scope}
												/>
											</TableCell>
											<TableCell>
												<Typography variant="body2">
													{permission.roleCount || 0} roles
												</Typography>
											</TableCell>
											<TableCell>
												<FormControlLabel
													control={
														<Switch
															checked={permission.isActive}
															onChange={() => handleToggleStatus(permission)}
															size="small"
														/>
													}
													label={permission.isActive ? 'Activo' : 'Inactivo'}
													labelPlacement="start"
												/>
											</TableCell>
											<TableCell align="center">
												<Tooltip title="Editar">
													<IconButton
														size="small"
														onClick={() => handleEditPermission(permission)}
													>
														<EditIcon fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title="Eliminar">
													<IconButton
														size="small"
														onClick={() => handleDeleteClick(permission)}
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

			{/* Create/Edit Permission Dialog */}
			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>{editingPermission ? 'Editar Permiso' : 'Crear Nuevo Permiso'}</DialogTitle>
				<DialogContent>
					<Grid
						container
						spacing={3}
						sx={{ mt: 1 }}
					>
						<Grid
							item
							xs={12}
							md={6}
						>
							<TextField
								fullWidth
								label="Nombre del Permiso"
								value={formData.name}
								onChange={handleFormChange('name')}
								required
							/>
						</Grid>
						<Grid
							item
							xs={12}
							md={6}
						>
							<Autocomplete
								options={RESOURCES}
								value={formData.resource}
								onChange={(e, newValue) =>
									setFormData((prev) => ({ ...prev, resource: newValue || '' }))
								}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Recurso"
										required
									/>
								)}
							/>
						</Grid>
						<Grid
							item
							xs={12}
							md={6}
						>
							<Autocomplete
								options={ACTIONS}
								value={formData.action}
								onChange={(e, newValue) => setFormData((prev) => ({ ...prev, action: newValue || '' }))}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Acción"
										required
									/>
								)}
							/>
						</Grid>
						<Grid
							item
							xs={12}
							md={6}
						>
							<FormControl fullWidth>
								<InputLabel>Alcance</InputLabel>
								<Select
									value={formData.scope}
									onChange={handleFormChange('scope')}
									label="Alcance"
								>
									{SCOPES.map((scope) => (
										<MenuItem
											key={scope}
											value={scope}
										>
											{scope}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid
							item
							xs={12}
						>
							<TextField
								fullWidth
								multiline
								rows={3}
								label="Descripción"
								value={formData.description}
								onChange={handleFormChange('description')}
							/>
						</Grid>
						<Grid
							item
							xs={12}
						>
							<FormControlLabel
								control={
									<Switch
										checked={formData.isActive}
										onChange={handleSwitchChange('isActive')}
									/>
								}
								label="Permiso Activo"
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Cancelar</Button>
					<Button
						onClick={handleSubmit}
						variant="contained"
					>
						{editingPermission ? 'Actualizar' : 'Crear'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteConfirmDialog.open}
				onClose={() => setDeleteConfirmDialog({ open: false, permission: null })}
			>
				<DialogTitle>Confirmar Eliminación</DialogTitle>
				<DialogContent>
					<Typography>
						¿Estás seguro de que deseas eliminar el permiso "{deleteConfirmDialog.permission?.name}"?
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ mt: 2 }}
					>
						Esta acción eliminará el permiso de todos los roles que lo tengan asignado.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteConfirmDialog({ open: false, permission: null })}>Cancelar</Button>
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
