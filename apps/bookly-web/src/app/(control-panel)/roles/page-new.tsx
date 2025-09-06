'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
	Box,
	Chip,
	Tooltip,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Group as GroupIcon,
	AdminPanelSettings as AdminIcon,
	Security as SecurityIcon
} from '@mui/icons-material';
import { useRoleManagement, usePermissionManagement } from '@hooks/useAuth';
import type { CreateRoleRequest, UpdateRoleRequest, RoleWithPermissions } from '@services/auth/types';
import { DataTablePageTemplate } from '@components/templates';
import { Button } from '@components/atoms';
import { RoleDialog } from '@components/organisms';
import type { RoleDialogData } from '@components/organisms';
import type { DataTableColumn } from '@components/organisms';

const ROLE_CATEGORIES = [
	{ value: 'ACADEMICO', label: 'Académico' },
	{ value: 'ADMINISTRATIVO', label: 'Administrativo' },
	{ value: 'SEGURIDAD', label: 'Seguridad' },
	{ value: 'INVITADO', label: 'Invitado' }
];

export default function RolesPage() {
	const { roles, loading, pagination, getAllRoles, createRole, updateRole, deleteRole, setPagination } =
		useRoleManagement();

	const { permissions, getActivePermissions } = usePermissionManagement();

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('');
	const [openDialog, setOpenDialog] = useState(false);
	const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);
	const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
		open: boolean;
		role: RoleWithPermissions | null;
	}>({
		open: false,
		role: null
	});
	const [dialogLoading, setDialogLoading] = useState(false);

	// Load data on component mount
	useEffect(() => {
		getAllRoles({ page: 1, limit: 10 });
		getActivePermissions();
	}, [getAllRoles, getActivePermissions]);

	// Handle search and filtering
	const handleSearch = async (query: string) => {
		setSearchTerm(query);
		await getAllRoles({
			page: 1,
			limit: pagination.limit,
			search: query
		});
	};

	const _handlePageChange = (_: unknown, newPage: number) => {
		setPagination((prev) => ({
			...prev,
			page: newPage + 1
		}));
	};

	const _handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newLimit = parseInt(event.target.value, 10);
		setPagination((prev) => ({
			...prev,
			limit: newLimit,
			page: 1
		}));
	};

	// Dialog handlers
	const handleCreateRole = () => {
		setEditingRole(null);
		setOpenDialog(true);
	};

	const handleEditRole = (role: RoleWithPermissions) => {
		setEditingRole(role);
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingRole(null);
	};

	const handleSubmitRole = async (data: RoleDialogData) => {
		try {
			setDialogLoading(true);

			if (editingRole) {
				// Update existing role
				const updateData: UpdateRoleRequest = {
					name: data.name,
					description: data.description,
					category: data.category,
					permissions: data.permissions
				};
				await updateRole(editingRole.id, updateData);
			} else {
				// Create new role
				const createData: CreateRoleRequest = {
					name: data.name,
					description: data.description,
					category: data.category,
					permissions: data.permissions
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
		} finally {
			setDialogLoading(false);
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

	// Statistics cards
	const statsCards = useMemo(
		() => [
			{
				title: 'Roles Activos',
				value: roles.filter((r) => r.isActive).length,
				icon: <GroupIcon />
			},
			{
				title: 'Roles del Sistema',
				value: roles.filter((r) => r.isPredefined).length,
				icon: <AdminIcon />
			},
			{
				title: 'Permisos Disponibles',
				value: permissions.filter((p) => p.isActive).length,
				icon: <SecurityIcon />
			},
			{
				title: 'Asignaciones Totales',
				value: roles.reduce((acc, role) => acc + (role.userCount || 0), 0),
				icon: <GroupIcon />
			}
		],
		[roles, permissions]
	);

	// Table columns
	const columns: DataTableColumn<RoleWithPermissions>[] = [
		{
			id: 'displayName',
			key: 'displayName',
			label: 'Nombre',
			render: (role) => (
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					{getCategoryIcon(role.displayName || '')}
					<Typography sx={{ ml: 1, fontWeight: 'medium' }}>{role.displayName}</Typography>
				</Box>
			)
		},
		{
			id: 'description',
			key: 'description',
			label: 'Descripción',
			render: (role) => (
				<Typography
					variant="body2"
					color="text.secondary"
				>
					{role.description || 'Sin descripción'}
				</Typography>
			)
		},
		{
			id: 'category',
			key: 'category',
			label: 'Categoría',
			render: (role) => (
				<Chip
					size="small"
					color={getCategoryColor(role.displayName || '')}
					label={ROLE_CATEGORIES.find((c) => c.value === role.displayName)?.label || role.displayName}
				/>
			)
		},
		{
			id: 'permissions',
			key: 'permissions',
			label: 'Permisos',
			render: (role) => <Typography variant="body2">{role.permissions?.length || 0} permisos</Typography>
		},
		{
			id: 'userCount',
			key: 'userCount',
			label: 'Usuarios',
			render: (role) => <Typography variant="body2">{role.userCount || 0} usuarios</Typography>
		},
		{
			id: 'isActive',
			key: 'isActive',
			label: 'Estado',
			render: (role) => (
				<Chip
					size="small"
					color={role.isActive ? 'success' : 'default'}
					label={role.isActive ? 'Activo' : 'Inactivo'}
				/>
			)
		},
		{
			id: 'isPredefined',
			key: 'isPredefined',
			label: 'Tipo',
			render: (role) => (
				<Chip
					size="small"
					color={role.isPredefined ? 'warning' : 'info'}
					label={role.isPredefined ? 'Sistema' : 'Personalizado'}
				/>
			)
		},
		{
			id: 'actions',
			key: 'actions',
			label: 'Acciones',
			align: 'center',
			render: (role) => (
				<Box>
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
				</Box>
			)
		}
	];

	// Filter options
	const filterOptions = [
		{
			key: 'category',
			label: 'Categoría',
			value: selectedCategory,
			onChange: setSelectedCategory,
			options: [{ value: '', label: 'Todas' }, ...ROLE_CATEGORIES]
		}
	];

	return (
		<>
			<DataTablePageTemplate
				title="Gestión de Roles"
				subtitle="Administra roles y permisos del sistema"
				actions={
					<Button
						variant="contained"
						onClick={handleCreateRole}
						startIcon={<GroupIcon />}
					>
						Nuevo Rol
					</Button>
				}
				stats={statsCards}
				table={{
					columns,
					data: roles,
					loading,
					emptyMessage: 'No se encontraron roles'
				}}
				filterBar={{
					searchPlaceholder: 'Buscar roles...',
					onSearchChange: handleSearch,
					filters: filterOptions
				}}
			/>

			{/* Create/Edit Role Dialog */}
			<RoleDialog
				open={openDialog}
				role={editingRole}
				permissions={permissions}
				onClose={handleCloseDialog}
				onSubmit={handleSubmitRole}
				loading={dialogLoading}
			/>

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
		</>
	);
}
