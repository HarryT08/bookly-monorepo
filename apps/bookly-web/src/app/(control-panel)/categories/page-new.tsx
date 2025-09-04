'use client';

import { useState, useEffect } from 'react';
import { Box, Switch } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';

import { DataTablePageTemplate } from '../../../components/templates';
import { DataTableColumn, CategoryDialog, CategoryDialogData, Category } from '../../../components/organisms';
import { StatusChip, Chip } from '../../../components/atoms';
import { ActionMenu } from '../../../components/molecules';
import { StatCardProps } from '../../../components/molecules/StatCard/StatCard';
import { PageHeaderProps } from '@components/molecules/page-form-header';

const CATEGORY_TYPES = ['RESOURCE_TYPE', 'MAINTENANCE_TYPE', 'APPROVAL_STATUS', 'INCIDENT_TYPE', 'USER_ROLE'];
const SERVICES = ['RESOURCES_SERVICE', 'AUTH_SERVICE', 'STOCKPILE_SERVICE', 'REPORTS_SERVICE'];

export default function CategoriesPage() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [openDialog, setOpenDialog] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterType, setFilterType] = useState<string>('all');
	const [filterService, setFilterService] = useState<string>('all');

	// Load categories
	useEffect(() => {
		loadCategories();
	}, []);

	// Filtering logic
	useEffect(() => {
		const filtered = categories.filter((category) => {
			const matchesSearch =
				category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				category.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
				category.type.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesType = filterType === 'all' || category.type === filterType;
			const matchesService = filterService === 'all' || category.service === filterService;

			return matchesSearch && matchesType && matchesService;
		});

		setFilteredCategories(filtered);
	}, [categories, searchTerm, filterType, filterService]);

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
		} catch (error) {
			console.error('Error loading categories:', error);
			enqueueSnackbar('Error al cargar las categorías', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (term: string) => {
		setSearchTerm(term);
	};

	const handleTypeFilter = (type: string) => {
		setFilterType(type);
	};

	const handleServiceFilter = (service: string) => {
		setFilterService(service);
	};

	const handleOpenDialog = (category?: Category) => {
		setEditingCategory(category || null);
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingCategory(null);
	};

	const handleSave = async (formData: CategoryDialogData) => {
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
		} catch (error) {
			console.error('Error saving category:', error);
			enqueueSnackbar('Error al guardar la categoría', { variant: 'error' });
		}
	};

	const handleDeleteCategory = async (category: Category) => {
		if (window.confirm('¿Está seguro de eliminar esta categoría?')) {
			try {
				// TODO: Delete API call
				enqueueSnackbar('Categoría eliminada exitosamente', { variant: 'success' });
				loadCategories();
			} catch (error) {
				console.error('Error deleting category:', error);
				enqueueSnackbar('Error al eliminar la categoría', { variant: 'error' });
			}
		}
	};

	const handleToggleActive = async (category: Category) => {
		try {
			// TODO: Update API call
			enqueueSnackbar('Estado actualizado exitosamente', { variant: 'success' });
			loadCategories();
		} catch (error) {
			console.error('Error updating status:', error);
			enqueueSnackbar('Error al actualizar el estado', { variant: 'error' });
		}
	};

	const handleCategoryAction = (action: string, category: Category) => {
		switch (action) {
			case 'view':
				console.log('View category:', category);
				break;
			case 'edit':
				handleOpenDialog(category);
				break;
			case 'delete':
				handleDeleteCategory(category);
				break;
			default:
				break;
		}
	};

	const columns: DataTableColumn<Category>[] = [
		{
			id: 'name',
			label: 'Nombre',
			minWidth: 200,
			render: (category) => (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					{category.name}
					{category.isDefault && <Chip label="Por defecto" size="small" color="primary" variant="outlined" />}
				</Box>
			)
		},
		{
			id: 'code',
			label: 'Código',
			minWidth: 120,
			render: (category) => category.code
		},
		{
			id: 'type',
			label: 'Tipo',
			minWidth: 150,
			render: (category) => category.type
		},
		{
			id: 'service',
			label: 'Servicio',
			minWidth: 150,
			render: (category) => category.service
		},
		{
			id: 'color',
			label: 'Color',
			minWidth: 80,
			align: 'center',
			render: (category) => (
				<Box
					sx={{
						width: 24,
						height: 24,
						borderRadius: '50%',
						backgroundColor: category.color,
						border: '1px solid #ccc',
						mx: 'auto'
					}}
				/>
			)
		},
		{
			id: 'status',
			label: 'Estado',
			minWidth: 100,
			align: 'center',
			render: (category) => (
				<Switch
					checked={category.isActive}
					onChange={() => handleToggleActive(category)}
					disabled={category.isDefault}
				/>
			)
		},
		{
			id: 'isDefault',
			label: 'Por Defecto',
			minWidth: 100,
			align: 'center',
			render: (category) => (category.isDefault ? 'Sí' : 'No')
		},
		{
			id: 'actions',
			label: 'Acciones',
			minWidth: 120,
			align: 'center',
			render: (category) => (
				<ActionMenu
					actions={[
						{
							key: 'view',
							label: 'Ver',
							icon: <ViewIcon />,
							onClick: () => handleCategoryAction('view', category)
						},
						{
							key: 'edit',
							label: 'Editar',
							icon: <EditIcon />,
							onClick: () => handleCategoryAction('edit', category)
						},
						{
							key: 'delete',
							label: 'Eliminar',
							icon: <DeleteIcon />,
							onClick: () => handleCategoryAction('delete', category),
							disabled: category.isDefault,
							color: 'error'
						}
					]}
				/>
			)
		}
	];

	const statsCards: StatCardProps[] = [
		{
			title: 'Total Categorías',
			value: categories.length.toString(),
			icon: <ViewIcon />,
			iconColor: 'primary'
		},
		{
			title: 'Categorías Activas',
			value: categories.filter((c) => c.isActive).length.toString(),
			icon: <AddIcon />,
			iconColor: 'success'
		},
		{
			title: 'Tipos Únicos',
			value: [...new Set(categories.map((c) => c.type))].length.toString(),
			icon: <EditIcon />,
			iconColor: 'info'
		},
		{
			title: 'Por Defecto',
			value: categories.filter((c) => c.isDefault).length.toString(),
			icon: <DeleteIcon />,
			iconColor: 'warning'
		}
	];

	const filterOptions = [
		{
			label: 'Tipo',
			value: filterType,
			onChange: handleTypeFilter,
			options: [
				{ value: 'all', label: 'Todos los tipos' },
				...CATEGORY_TYPES.map((type) => ({ value: type, label: type }))
			]
		},
		{
			label: 'Servicio',
			value: filterService,
			onChange: handleServiceFilter,
			options: [
				{ value: 'all', label: 'Todos los servicios' },
				...SERVICES.map((service) => ({ value: service, label: service }))
			]
		}
	];

	const pageHeaderProps: PageHeaderProps = {
		title: 'Gestión de Categorías',
		subtitle: 'Administra las categorías del sistema para recursos, mantenimiento y más',
		actions: [
			{
				label: 'Nueva Categoría',
				variant: 'contained',
				startIcon: <AddIcon />,
				onClick: () => handleOpenDialog()
			}
		]
	};

	return (
		<>
			<DataTablePageTemplate
				pageHeader={pageHeaderProps}
				statsData={statsCards}
				data={filteredCategories}
				columns={columns}
				loading={loading}
				searchPlaceholder="Buscar por nombre, código o tipo..."
				onSearch={handleSearch}
				filterOptions={filterOptions}
				emptyMessage="No se encontraron categorías"
				emptyDescription="No hay categorías que coincidan con los criterios de búsqueda."
			/>

			<CategoryDialog
				open={openDialog}
				category={editingCategory}
				onClose={handleCloseDialog}
				onSubmit={handleSave}
			/>
		</>
	);
}
