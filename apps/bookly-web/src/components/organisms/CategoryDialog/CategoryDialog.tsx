import { useState, useEffect } from 'react';
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
	FormControlLabel
} from '@mui/material';
import { Button, TextField, Switch } from '../../atoms';

interface CategoryDialogData {
	type: string;
	subtype?: string;
	name: string;
	code: string;
	description?: string;
	color?: string;
	isActive: boolean;
	isDefault: boolean;
	sortOrder: number;
	service: string;
}

interface Category {
	id: string;
	type: string;
	subtype?: string;
	name: string;
	code: string;
	description?: string;
	color?: string;
	isActive: boolean;
	isDefault: boolean;
	sortOrder: number;
	service: string;
	createdAt: Date;
	updatedAt: Date;
}

interface CategoryDialogProps {
	open: boolean;
	category?: Category | null;
	onClose: () => void;
	onSubmit: (data: CategoryDialogData) => void;
	loading?: boolean;
}

const CATEGORY_TYPES = ['RESOURCE_TYPE', 'MAINTENANCE_TYPE', 'APPROVAL_STATUS', 'INCIDENT_TYPE', 'USER_ROLE'];

const SERVICES = ['RESOURCES_SERVICE', 'AUTH_SERVICE', 'STOCKPILE_SERVICE', 'REPORTS_SERVICE'];

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0288d1', '#689f38', '#fbc02d'];

const INITIAL_DATA: CategoryDialogData = {
	type: '',
	subtype: '',
	name: '',
	code: '',
	description: '',
	color: COLORS[0],
	isActive: true,
	isDefault: false,
	sortOrder: 0,
	service: ''
};

export function CategoryDialog({ open, category, onClose, onSubmit, loading = false }: CategoryDialogProps) {
	const [formData, setFormData] = useState<CategoryDialogData>(INITIAL_DATA);

	useEffect(() => {
		if (category) {
			setFormData({
				type: category.type,
				subtype: category.subtype || '',
				name: category.name,
				code: category.code,
				description: category.description || '',
				color: category.color || COLORS[0],
				isActive: category.isActive,
				isDefault: category.isDefault,
				sortOrder: category.sortOrder,
				service: category.service
			});
		} else {
			setFormData(INITIAL_DATA);
		}
	}, [category]);

	const handleSubmit = () => {
		onSubmit(formData);
		setFormData(INITIAL_DATA);
	};

	const handleClose = () => {
		setFormData(INITIAL_DATA);
		onClose();
	};

	const isValid = formData.name && formData.code && formData.type && formData.service;

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>{category ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
			<DialogContent>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
					<Box sx={{ display: 'flex', gap: 2 }}>
						<FormControl
							fullWidth
							required
						>
							<InputLabel>Tipo</InputLabel>
							<Select
								value={formData.type}
								onChange={(e) => setFormData({ ...formData, type: e.target.value })}
								label="Tipo"
							>
								{CATEGORY_TYPES.map((type) => (
									<MenuItem
										key={type}
										value={type}
									>
										{type}
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<FormControl
							fullWidth
							required
						>
							<InputLabel>Servicio</InputLabel>
							<Select
								value={formData.service}
								onChange={(e) => setFormData({ ...formData, service: e.target.value })}
								label="Servicio"
							>
								{SERVICES.map((service) => (
									<MenuItem
										key={service}
										value={service}
									>
										{service}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>

					<Box sx={{ display: 'flex', gap: 2 }}>
						<TextField
							label="Nombre"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							fullWidth
							required
						/>
						<TextField
							label="Código"
							value={formData.code}
							onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
							fullWidth
							required
							inputProps={{ style: { textTransform: 'uppercase' } }}
						/>
					</Box>

					<TextField
						label="Subtipo"
						value={formData.subtype}
						onChange={(e) => setFormData({ ...formData, subtype: e.target.value })}
						fullWidth
					/>

					<TextField
						label="Descripción"
						value={formData.description}
						onChange={(e) => setFormData({ ...formData, description: e.target.value })}
						fullWidth
						multiline
						rows={3}
					/>

					<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
						<Typography variant="subtitle1">Color:</Typography>
						<Box sx={{ display: 'flex', gap: 1 }}>
							{COLORS.map((color) => (
								<Box
									key={color}
									onClick={() => setFormData({ ...formData, color })}
									sx={{
										width: 32,
										height: 32,
										borderRadius: '50%',
										backgroundColor: color,
										border: formData.color === color ? '3px solid #000' : '1px solid #ccc',
										cursor: 'pointer'
									}}
								/>
							))}
						</Box>
					</Box>

					<TextField
						label="Orden"
						type="number"
						value={formData.sortOrder}
						onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
						fullWidth
					/>

					<Box sx={{ display: 'flex', gap: 2 }}>
						<FormControlLabel
							control={
								<Switch
									checked={formData.isActive}
									onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
								/>
							}
							label="Activa"
						/>
						<FormControlLabel
							control={
								<Switch
									checked={formData.isDefault}
									onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
								/>
							}
							label="Por defecto"
						/>
					</Box>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={handleClose}
					disabled={loading}
				>
					Cancelar
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={!isValid || loading}
				>
					{loading ? 'Guardando...' : category ? 'Actualizar' : 'Crear'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export type { CategoryDialogData, Category };
