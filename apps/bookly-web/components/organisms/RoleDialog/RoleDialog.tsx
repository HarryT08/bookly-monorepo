import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	FormGroup,
	FormControlLabel,
	Checkbox
} from '@mui/material';
import { Button, TextField } from '@/components/atoms';
import type { RoleWithPermissions } from '@services/auth/types';

export interface RoleDialogData {
	name: string;
	description: string;
	category: string;
	permissions: string[];
}

export interface Permission {
	id: string;
	name: string;
	resource: string;
	action: string;
	scope: string;
	isActive: boolean;
}

export interface RoleDialogProps {
	open: boolean;
	role?: RoleWithPermissions | null;
	permissions: Permission[];
	onClose: () => void;
	onSubmit: (data: RoleDialogData) => void;
	loading?: boolean;
}

const ROLE_CATEGORIES = [
	{ value: 'ACADEMICO', label: 'Académico' },
	{ value: 'ADMINISTRATIVO', label: 'Administrativo' },
	{ value: 'SEGURIDAD', label: 'Seguridad' },
	{ value: 'INVITADO', label: 'Invitado' }
];

const INITIAL_DATA: RoleDialogData = {
	name: '',
	description: '',
	category: 'ACADEMICO',
	permissions: []
};

export function RoleDialog({ open, role, permissions, onClose, onSubmit, loading = false }: RoleDialogProps) {
	const [formData, setFormData] = useState<RoleDialogData>(INITIAL_DATA);

	useEffect(() => {
		if (role) {
			setFormData({
				name: role.name,
				description: role.description || '',
				category: role.displayName || 'ACADEMICO',
				permissions: role.permissions?.map((p) => p.id) || []
			});
		} else {
			setFormData(INITIAL_DATA);
		}
	}, [role, open]);

	const handleClose = () => {
		setFormData(INITIAL_DATA);
		onClose();
	};

	const handleSubmit = () => {
		onSubmit(formData);
		setFormData(INITIAL_DATA);
	};

	const handleChange =
		(field: keyof RoleDialogData) =>
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

	const isFormValid = formData.name.trim().length > 0;

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>{role ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>

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
					{/* Role Name */}
					<Box>
						<TextField
							fullWidth
							label="Nombre del Rol"
							value={formData.name}
							onChange={handleChange('name')}
							required
							error={!formData.name.trim()}
							helperText={!formData.name.trim() ? 'El nombre es requerido' : ''}
						/>
					</Box>

					{/* Category */}
					<Box>
						<FormControl fullWidth>
							<InputLabel>Categoría</InputLabel>
							<Select
								value={formData.category}
								onChange={handleChange('category')}
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

					{/* Description */}
					<Box sx={{ gridColumn: '1 / -1' }}>
						<TextField
							fullWidth
							multiline
							rows={3}
							label="Descripción"
							value={formData.description}
							onChange={handleChange('description')}
							placeholder="Describe las responsabilidades y alcance de este rol..."
						/>
					</Box>

					{/* Permissions */}
					<Box sx={{ gridColumn: '1 / -1' }}>
						<Typography
							variant="subtitle1"
							sx={{ mb: 2, fontWeight: 600 }}
						>
							Permisos ({formData.permissions.length} seleccionados)
						</Typography>

						<FormGroup>
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: {
										xs: '1fr',
										md: 'repeat(2, 1fr)'
									},
									gap: 1,
									maxHeight: 300,
									overflowY: 'auto',
									border: 1,
									borderColor: 'divider',
									borderRadius: 1,
									p: 2
								}}
							>
								{permissions.map((permission) => (
									<Box key={permission.id}>
										<FormControlLabel
											control={
												<Checkbox
													checked={formData.permissions.includes(permission.id)}
													onChange={handlePermissionChange(permission.id)}
													size="small"
												/>
											}
											label={
												<Box>
													<Typography
														variant="body2"
														sx={{ fontWeight: 500 }}
													>
														{permission.name}
													</Typography>
													<Typography
														variant="caption"
														color="text.secondary"
														sx={{ display: 'block' }}
													>
														{permission.resource}:{permission.action}:{permission.scope}
													</Typography>
												</Box>
											}
										/>
									</Box>
								))}

								{permissions.length === 0 && (
									<Box
										sx={{
											gridColumn: '1 / -1',
											textAlign: 'center',
											py: 2
										}}
									>
										<Typography
											variant="body2"
											color="text.secondary"
										>
											No hay permisos disponibles
										</Typography>
									</Box>
								)}
							</Box>
						</FormGroup>
					</Box>
				</Box>
			</DialogContent>

			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button
					onClick={handleClose}
					variant="outlined"
					disabled={loading}
				>
					Cancelar
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={!isFormValid || loading}
					loading={loading}
				>
					{role ? 'Actualizar' : 'Crear'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
