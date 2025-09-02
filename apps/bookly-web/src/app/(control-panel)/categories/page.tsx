'use client';

import { useState, useEffect } from 'react';
import {
	Box,
	Card,
	CardContent,
	Typography,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Chip,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	Paper,
	Tooltip,
	Switch,
	FormControlLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';

// Types
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

interface CategoryFormData {
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

const CATEGORY_TYPES = ['RESOURCE_TYPE', 'MAINTENANCE_TYPE', 'APPROVAL_STATUS', 'INCIDENT_TYPE', 'USER_ROLE'];

const SERVICES = ['RESOURCES_SERVICE', 'AUTH_SERVICE', 'STOCKPILE_SERVICE', 'REPORTS_SERVICE'];

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0288d1', '#689f38', '#fbc02d'];

export default function CategoriesPage() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [openDialog, setOpenDialog] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [filterType, setFilterType] = useState('');
	const [filterService, setFilterService] = useState('');

	const [formData, setFormData] = useState<CategoryFormData>({
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
	});

	// Load categories
	useEffect(() => {
		loadCategories();
	}, []);

	const loadCategories = async () => {
		try {
			setLoading(true);
			// TODO: Replace with actual API call
			const mockCategories: Category[] = [
				{
					id: '1',
					type: 'RESOURCE_TYPE',
					name: 'Salón',
					code: 'SALON',
					description: 'Salones de clase tradicionales',
					color: '#1976d2',
					isActive: true,
					isDefault: true,
					sortOrder: 1,
					service: 'RESOURCES_SERVICE',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					id: '2',
					type: 'RESOURCE_TYPE',
					name: 'Laboratorio',
					code: 'LAB',
					description: 'Laboratorios de cómputo y ciencias',
					color: '#388e3c',
					isActive: true,
					isDefault: true,
					sortOrder: 2,
					service: 'RESOURCES_SERVICE',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					id: '3',
					type: 'MAINTENANCE_TYPE',
					name: 'Preventivo',
					code: 'PREVENTIVO',
					description: 'Mantenimiento preventivo programado',
					color: '#f57c00',
					isActive: true,
					isDefault: true,
					sortOrder: 1,
					service: 'RESOURCES_SERVICE',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					id: '4',
					type: 'MAINTENANCE_TYPE',
					name: 'Correctivo',
					code: 'CORRECTIVO',
					description: 'Mantenimiento correctivo',
					color: '#d32f2f',
					isActive: true,
					isDefault: false,
					sortOrder: 2,
					service: 'RESOURCES_SERVICE',
					createdAt: new Date(),
					updatedAt: new Date()
				}
			];
			setCategories(mockCategories);
		} catch (_error) {
			enqueueSnackbar('Error al cargar las categorías', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	const handleOpenDialog = (category?: Category) => {
		if (category) {
			setEditingCategory(category);
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
			setEditingCategory(null);
			setFormData({
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
			});
		}

		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingCategory(null);
	};

	const handleSave = async () => {
		try {
			if (editingCategory) {
				// TODO: Update API call
				enqueueSnackbar('Categoría actualizada exitosamente', { variant: 'success' });
			} else {
				// TODO: Create API call
				enqueueSnackbar('Categoría creada exitosamente', { variant: 'success' });
			}

			handleCloseDialog();
			loadCategories();
		} catch (_error) {
			enqueueSnackbar('Error al crear la categoría', { variant: 'error' });
		}
	};

	const _handleDeleteCategory = async (_id: string) => {
		if (window.confirm('¿Está seguro de eliminar esta categoría?')) {
			try {
				// TODO: Delete API call
				enqueueSnackbar('Categoría eliminada exitosamente', { variant: 'success' });

				loadCategories();
			} catch (_error) {
				enqueueSnackbar('Error al eliminar la categoría', { variant: 'error' });
			}
		}
	};

	const handleToggleActive = async (_category: Category) => {
		try {
			// TODO: Update API call
			enqueueSnackbar('Estado actualizado exitosamente', { variant: 'success' });
			loadCategories();
		} catch (_error) {
			enqueueSnackbar('Error al actualizar el estado', { variant: 'error' });
		}
	};

	const filteredCategories = categories.filter((category) => {
		return (!filterType || category.type === filterType) && (!filterService || category.service === filterService);
	});

	const paginatedCategories = filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Typography
					variant="h4"
					component="h1"
				>
					Gestión de Categorías
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => handleOpenDialog()}
				>
					Nueva Categoría
				</Button>
			</Box>

			{/* Filters */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
						<FormControl
							variant="outlined"
							sx={{ minWidth: 200 }}
						>
							<InputLabel>Tipo</InputLabel>
							<Select
								value={filterType}
								onChange={(e) => setFilterType(e.target.value)}
								label="Tipo"
							>
								<MenuItem value="">Todos</MenuItem>
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
							variant="outlined"
							sx={{ minWidth: 200 }}
						>
							<InputLabel>Servicio</InputLabel>
							<Select
								value={filterService}
								onChange={(e) => setFilterService(e.target.value)}
								label="Servicio"
							>
								<MenuItem value="">Todos</MenuItem>
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
						<Button
							variant="outlined"
							onClick={() => {
								setFilterType('');
								setFilterService('');
							}}
						>
							Limpiar Filtros
						</Button>
					</Box>
				</CardContent>
			</Card>

			{/* Categories Table */}
			<Card>
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Nombre</TableCell>
								<TableCell>Código</TableCell>
								<TableCell>Tipo</TableCell>
								<TableCell>Servicio</TableCell>
								<TableCell>Color</TableCell>
								<TableCell>Estado</TableCell>
								<TableCell>Por Defecto</TableCell>
								<TableCell>Acciones</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell
										colSpan={8}
										align="center"
									>
										Cargando...
									</TableCell>
								</TableRow>
							) : paginatedCategories.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={8}
										align="center"
									>
										No hay categorías disponibles
									</TableCell>
								</TableRow>
							) : (
								paginatedCategories.map((category) => (
									<TableRow key={category.id}>
										<TableCell>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												{category.name}
												{category.isDefault && (
													<Chip
														label="Por defecto"
														size="small"
														color="primary"
														variant="outlined"
													/>
												)}
											</Box>
										</TableCell>
										<TableCell>{category.code}</TableCell>
										<TableCell>{category.type}</TableCell>
										<TableCell>{category.service}</TableCell>
										<TableCell>
											<Box
												sx={{
													width: 24,
													height: 24,
													borderRadius: '50%',
													backgroundColor: category.color,
													border: '1px solid #ccc'
												}}
											/>
										</TableCell>
										<TableCell>
											<Switch
												checked={category.isActive}
												onChange={() => handleToggleActive(category)}
												disabled={category.isDefault}
											/>
										</TableCell>
										<TableCell>{category.isDefault ? 'Sí' : 'No'}</TableCell>
										<TableCell>
											<Box sx={{ display: 'flex', gap: 1 }}>
												<Tooltip title="Ver">
													<IconButton size="small">
														<ViewIcon />
													</IconButton>
												</Tooltip>
												<Tooltip title="Editar">
													<IconButton
														size="small"
														onClick={() => handleOpenDialog(category)}
													>
														<EditIcon />
													</IconButton>
												</Tooltip>
												<Tooltip title="Eliminar">
													<IconButton
														size="small"
														onClick={() => _handleDeleteCategory(category.id)}
														disabled={category.isDefault}
													>
														<DeleteIcon />
													</IconButton>
												</Tooltip>
											</Box>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
					<TablePagination
						component="div"
						count={filteredCategories.length}
						page={page}
						onPageChange={(_, newPage) => setPage(newPage)}
						rowsPerPage={rowsPerPage}
						onRowsPerPageChange={(e) => {
							setRowsPerPage(parseInt(e.target.value, 10));
							setPage(0);
						}}
						labelRowsPerPage="Filas por página:"
					/>
				</TableContainer>
			</Card>

			{/* Create/Edit Dialog */}
			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
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
					<Button onClick={handleCloseDialog}>Cancelar</Button>
					<Button
						onClick={handleSave}
						variant="contained"
						disabled={!formData.name || !formData.code || !formData.type || !formData.service}
					>
						{editingCategory ? 'Actualizar' : 'Crear'}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
