'use client';

import { useState } from 'react';
import {
	Box,
	Button,
	Card,
	CardContent,
	TextField,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	IconButton
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import Link from 'next/link';

// Mock data

const maintenanceTypes = [
	{ value: 'PREVENTIVO', label: 'Preventivo' },
	{ value: 'CORRECTIVO', label: 'Correctivo' },
	{ value: 'EMERGENCIA', label: 'Emergencia' },
	{ value: 'LIMPIEZA', label: 'Limpieza' }
];

interface MaintenanceTask {
	id: string;
	description: string;
	estimatedDuration: number; // minutes
	materials: string[];
}

export default function ScheduleMaintenancePage() {
	const [formData, setFormData] = useState({
		resourceId: '',
		type: '',
		title: '',
		description: '',
		priority: 'MEDIA',
		scheduledDate: new Date(),
		estimatedDuration: 60,
		assignedTechnicianId: '',
		isRecurring: false,
		recurringPattern: 'WEEKLY',
		recurringEndDate: null as Date | null,
		specialInstructions: '',
		materials: [] as string[],
		tasks: [] as MaintenanceTask[]
	});

	const [_newMaterial, _setNewMaterial] = useState('');
	const [_newTaskDescription, _setNewTaskDescription] = useState('');
	const [_newTaskDuration, _setNewTaskDuration] = useState(30);

	const handleInputChange = (field: string, value: unknown) => {
		setFormData((prev) => ({
			...prev,
			[field]: value
		}));
	};

	const _addMaterial = () => {
		if (_newMaterial.trim()) {
			setFormData((prev) => ({
				...prev,
				materials: [...prev.materials, _newMaterial.trim()]
			}));
			_setNewMaterial('');
		}
	};

	const _removeMaterial = (index: number) => {
		setFormData((prev) => ({
			...prev,
			materials: prev.materials.filter((_, i) => i !== index)
		}));
	};

	const _addTask = () => {
		if (_newTaskDescription.trim()) {
			const newTask: MaintenanceTask = {
				id: Date.now().toString(),
				description: _newTaskDescription.trim(),
				estimatedDuration: _newTaskDuration,
				materials: []
			};
			setFormData((prev) => ({
				...prev,
				tasks: [...prev.tasks, newTask]
			}));
			_setNewTaskDescription('');
			_setNewTaskDuration(30);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.type || !formData.title) {
			enqueueSnackbar('Por favor complete todos los campos requeridos', { variant: 'error' });
			return;
		}

		try {
			console.error('Scheduling maintenance:', formData);
			enqueueSnackbar('Mantenimiento programado exitosamente', { variant: 'success' });
		} catch (_error) {
			enqueueSnackbar('Error al programar el mantenimiento', { variant: 'error' });
		}
	};

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
				<IconButton
					component={Link}
					href="/maintenance"
					sx={{ mr: 2 }}
				>
					<ArrowBackIcon />
				</IconButton>
				<div>
					<Typography
						variant="h4"
						component="h1"
						gutterBottom
					>
						Programar Mantenimiento
					</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
					>
						Configure un nuevo mantenimiento preventivo o correctivo
					</Typography>
				</div>
			</Box>

			<form onSubmit={handleSubmit}>
				<Card>
					<CardContent>
						<Typography
							variant="h6"
							gutterBottom
						>
							Información Básica
						</Typography>

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
							<FormControl fullWidth>
								<InputLabel>Tipo de Mantenimiento *</InputLabel>
								<Select
									value={formData.type}
									onChange={(e) => handleInputChange('type', e.target.value)}
									label="Tipo de Mantenimiento *"
								>
									{maintenanceTypes.map((type) => (
										<MenuItem
											key={type.value}
											value={type.value}
										>
											{type.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<TextField
								fullWidth
								label="Título *"
								value={formData.title}
								onChange={(e) => handleInputChange('title', e.target.value)}
								placeholder="Ej: Limpieza general del salón"
							/>

							<TextField
								fullWidth
								multiline
								rows={3}
								label="Descripción"
								value={formData.description}
								onChange={(e) => handleInputChange('description', e.target.value)}
								placeholder="Describa los detalles del mantenimiento a realizar"
							/>

							<Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
								<Button
									component={Link}
									href="/maintenance"
									variant="outlined"
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									variant="contained"
									startIcon={<SaveIcon />}
								>
									Programar Mantenimiento
								</Button>
							</Box>
						</Box>
					</CardContent>
				</Card>
			</form>
		</Box>
	);
}
