'use client';

import React, { useState } from 'react';
import {
	Box,
	Card,
	CardContent,
	Typography,
	TextField,
	Button,
	Grid,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Chip,
	Autocomplete,
	Alert,
	IconButton,
	Avatar,
	List,
	ListItem,
	ListItemText,
	ListItemAvatar
} from '@mui/material';
import {
	Save as SaveIcon,
	ArrowBack as ArrowBackIcon,
	Delete as DeleteIcon,
	PhotoCamera as PhotoIcon,
	AttachFile as AttachIcon
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import Link from 'next/link';

// Mock data
const mockResources = [
	{ id: '1', name: 'Salón 101', type: 'SALON', location: 'Edificio A - Piso 1' },
	{ id: '2', name: 'Lab Cómputo 1', type: 'LAB', location: 'Edificio B - Piso 2' },
	{ id: '3', name: 'Auditorio Principal', type: 'AUDITORIO', location: 'Edificio C' },
	{ id: '4', name: 'Proyector Salón 205', type: 'EQUIPO', location: 'Salón 205' },
	{ id: '5', name: 'Aire Acondicionado Lab 3', type: 'EQUIPO', location: 'Lab 3' },
	{ id: '6', name: 'Red WiFi Biblioteca', type: 'SERVICIO', location: 'Biblioteca' }
];

const categories = [
	{ value: 'HARDWARE', label: 'Hardware' },
	{ value: 'SOFTWARE', label: 'Software' },
	{ value: 'CLIMATIZACION', label: 'Climatización' },
	{ value: 'SEGURIDAD', label: 'Seguridad' },
	{ value: 'LIMPIEZA', label: 'Limpieza' },
	{ value: 'REDES', label: 'Redes' },
	{ value: 'ELECTRICIDAD', label: 'Electricidad' },
	{ value: 'PLOMERIA', label: 'Plomería' },
	{ value: 'MOBILIARIO', label: 'Mobiliario' },
	{ value: 'OTROS', label: 'Otros' }
];

const priorities = [
	{ value: 'ALTA', label: 'Alta - Requiere atención inmediata', color: 'error' },
	{ value: 'MEDIA', label: 'Media - Atención en horario laboral', color: 'warning' },
	{ value: 'BAJA', label: 'Baja - Puede programarse', color: 'success' }
];

const severityLevels = [
	{
		value: 'CRITICA',
		label: 'Crítica - Impide uso del recurso',
		description: 'El recurso no se puede usar en absoluto'
	},
	{
		value: 'MAYOR',
		label: 'Mayor - Funcionalidad limitada',
		description: 'El recurso funciona pero con limitaciones importantes'
	},
	{
		value: 'MENOR',
		label: 'Menor - Inconvenientes leves',
		description: 'El recurso funciona pero con molestias menores'
	},
	{
		value: 'COSMETICA',
		label: 'Cosmética - Solo apariencia',
		description: 'No afecta la funcionalidad, solo la apariencia'
	}
];

interface Attachment {
	id: string;
	name: string;
	type: 'image' | 'document';
	url: string;
}

export default function NewIncidentPage() {
	const [formData, setFormData] = useState({
		resourceId: '',
		title: '',
		description: '',
		category: '',
		priority: 'MEDIA',
		severity: 'MENOR',
		stepsToReproduce: '',
		expectedBehavior: '',
		actualBehavior: '',
		workaround: '',
		additionalNotes: '',
		reporterName: '',
		reporterEmail: '',
		reporterPhone: '',
		contactPreference: 'EMAIL'
	});

	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const [submitting, setSubmitting] = useState(false);

	const handleInputChange = (field: string, value: any) => {
		setFormData((prev) => ({
			...prev,
			[field]: value
		}));
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		files.forEach((file) => {
			const newAttachment: Attachment = {
				id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
				name: file.name,
				type: file.type.startsWith('image/') ? 'image' : 'document',
				url: URL.createObjectURL(file)
			};
			setAttachments((prev) => [...prev, newAttachment]);
		});
		enqueueSnackbar(`${files.length} archivo(s) adjuntado(s)`, { variant: 'success' });
	};

	const removeAttachment = (id: string) => {
		setAttachments((prev) => prev.filter((att) => att.id !== id));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.resourceId || !formData.title || !formData.description) {
			enqueueSnackbar('Por favor complete todos los campos requeridos', { variant: 'error' });
			return;
		}

		if (!formData.reporterName || !formData.reporterEmail) {
			enqueueSnackbar('Por favor complete la información de contacto', { variant: 'error' });
			return;
		}

		setSubmitting(true);
		try {
			// TODO: Replace with actual API call
			console.log('Creating incident:', { ...formData, attachments });

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			enqueueSnackbar('Incidencia reportada exitosamente', { variant: 'success' });

			// Reset form or redirect
			// router.push('/maintenance/incidents');
		} catch (error) {
			enqueueSnackbar('Error al reportar la incidencia', { variant: 'error' });
		} finally {
			setSubmitting(false);
		}
	};

	const selectedResource = mockResources.find((r) => r.id === formData.resourceId);

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
				<IconButton
					component={Link}
					href="/maintenance/incidents"
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
						Reportar Nueva Incidencia
					</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
					>
						Reporte problemas o fallas en recursos e infraestructura
					</Typography>
				</div>
			</Box>

			<form onSubmit={handleSubmit}>
				<Grid
					container
					spacing={3}
				>
					{/* Resource Selection */}
					<Grid
						item
						xs={12}
					>
						<Card>
							<CardContent>
								<Typography
									variant="h6"
									gutterBottom
								>
									Recurso Afectado
								</Typography>

								<Autocomplete
									options={mockResources}
									getOptionLabel={(option) => `${option.name} - ${option.location} (${option.type})`}
									value={selectedResource || null}
									onChange={(_, newValue) => handleInputChange('resourceId', newValue?.id || '')}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Seleccione el recurso afectado *"
											fullWidth
											helperText="Busque por nombre, ubicación o tipo de recurso"
										/>
									)}
									renderOption={(props, option) => (
										<li {...props}>
											<Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
												{option.type === 'SALON' && '🏛️'}
												{option.type === 'LAB' && '🔬'}
												{option.type === 'AUDITORIO' && '🎭'}
												{option.type === 'EQUIPO' && '💻'}
												{option.type === 'SERVICIO' && '📡'}
											</Avatar>
											<Box>
												<Typography variant="subtitle2">{option.name}</Typography>
												<Typography
													variant="caption"
													color="text.secondary"
												>
													{option.location} • {option.type}
												</Typography>
											</Box>
										</li>
									)}
								/>
							</CardContent>
						</Card>
					</Grid>

					{/* Incident Details */}
					<Grid
						item
						xs={12}
					>
						<Card>
							<CardContent>
								<Typography
									variant="h6"
									gutterBottom
								>
									Detalles de la Incidencia
								</Typography>

								<Grid
									container
									spacing={2}
								>
									<Grid
										item
										xs={12}
									>
										<TextField
											fullWidth
											label="Título de la incidencia *"
											value={formData.title}
											onChange={(e) => handleInputChange('title', e.target.value)}
											placeholder="Ej: Proyector no enciende"
											helperText="Resuma el problema en pocas palabras"
										/>
									</Grid>

									<Grid
										item
										xs={12}
										md={6}
									>
										<FormControl fullWidth>
											<InputLabel>Categoría</InputLabel>
											<Select
												value={formData.category}
												onChange={(e) => handleInputChange('category', e.target.value)}
												label="Categoría"
											>
												{categories.map((category) => (
													<MenuItem
														key={category.value}
														value={category.value}
													>
														{category.label}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Grid>

									<Grid
										item
										xs={12}
										md={6}
									>
										<FormControl fullWidth>
											<InputLabel>Prioridad</InputLabel>
											<Select
												value={formData.priority}
												onChange={(e) => handleInputChange('priority', e.target.value)}
												label="Prioridad"
											>
												{priorities.map((priority) => (
													<MenuItem
														key={priority.value}
														value={priority.value}
													>
														<Chip
															label={priority.label}
															color={priority.color as any}
															size="small"
														/>
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Grid>

									<Grid
										item
										xs={12}
									>
										<FormControl fullWidth>
											<InputLabel>Severidad</InputLabel>
											<Select
												value={formData.severity}
												onChange={(e) => handleInputChange('severity', e.target.value)}
												label="Severidad"
											>
												{severityLevels.map((level) => (
													<MenuItem
														key={level.value}
														value={level.value}
													>
														<Box>
															<Typography variant="subtitle2">{level.label}</Typography>
															<Typography
																variant="caption"
																color="text.secondary"
															>
																{level.description}
															</Typography>
														</Box>
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
											rows={4}
											label="Descripción detallada *"
											value={formData.description}
											onChange={(e) => handleInputChange('description', e.target.value)}
											placeholder="Describa el problema con el mayor detalle posible"
											helperText="Incluya síntomas, cuándo ocurre, frecuencia, etc."
										/>
									</Grid>

									<Grid
										item
										xs={12}
										md={6}
									>
										<TextField
											fullWidth
											multiline
											rows={3}
											label="¿Qué esperaba que pasara?"
											value={formData.expectedBehavior}
											onChange={(e) => handleInputChange('expectedBehavior', e.target.value)}
											placeholder="Describa el comportamiento esperado"
										/>
									</Grid>

									<Grid
										item
										xs={12}
										md={6}
									>
										<TextField
											fullWidth
											multiline
											rows={3}
											label="¿Qué pasó realmente?"
											value={formData.actualBehavior}
											onChange={(e) => handleInputChange('actualBehavior', e.target.value)}
											placeholder="Describa lo que realmente ocurrió"
										/>
									</Grid>

									<Grid
										item
										xs={12}
									>
										<TextField
											fullWidth
											multiline
											rows={3}
											label="Pasos para reproducir el problema"
											value={formData.stepsToReproduce}
											onChange={(e) => handleInputChange('stepsToReproduce', e.target.value)}
											placeholder="1. Primer paso&#10;2. Segundo paso&#10;3. Tercer paso"
											helperText="Enumere los pasos específicos para reproducir el problema"
										/>
									</Grid>

									<Grid
										item
										xs={12}
									>
										<TextField
											fullWidth
											multiline
											rows={2}
											label="Solución temporal (si existe)"
											value={formData.workaround}
											onChange={(e) => handleInputChange('workaround', e.target.value)}
											placeholder="¿Encontró alguna forma temporal de solucionar o evitar el problema?"
										/>
									</Grid>
								</Grid>
							</CardContent>
						</Card>
					</Grid>

					{/* Attachments */}
					<Grid
						item
						xs={12}
					>
						<Card>
							<CardContent>
								<Typography
									variant="h6"
									gutterBottom
								>
									Archivos Adjuntos
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									paragraph
								>
									Adjunte fotos, videos o documentos que ayuden a ilustrar el problema
								</Typography>

								<input
									type="file"
									multiple
									accept="image/*,.pdf,.doc,.docx,.txt"
									onChange={handleFileUpload}
									style={{ display: 'none' }}
									id="file-upload"
								/>

								<Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
									<Button
										variant="outlined"
										component="label"
										htmlFor="file-upload"
										startIcon={<PhotoIcon />}
									>
										Subir Fotos
									</Button>
									<Button
										variant="outlined"
										component="label"
										htmlFor="file-upload"
										startIcon={<AttachIcon />}
									>
										Adjuntar Documentos
									</Button>
								</Box>

								{attachments.length > 0 && (
									<List>
										{attachments.map((attachment) => (
											<ListItem
												key={attachment.id}
												secondaryAction={
													<IconButton
														edge="end"
														onClick={() => removeAttachment(attachment.id)}
													>
														<DeleteIcon />
													</IconButton>
												}
											>
												<ListItemAvatar>
													<Avatar>
														{attachment.type === 'image' ? <PhotoIcon /> : <AttachIcon />}
													</Avatar>
												</ListItemAvatar>
												<ListItemText
													primary={attachment.name}
													secondary={attachment.type === 'image' ? 'Imagen' : 'Documento'}
												/>
											</ListItem>
										))}
									</List>
								)}
							</CardContent>
						</Card>
					</Grid>

					{/* Reporter Information */}
					<Grid
						item
						xs={12}
					>
						<Card>
							<CardContent>
								<Typography
									variant="h6"
									gutterBottom
								>
									Información de Contacto
								</Typography>

								<Grid
									container
									spacing={2}
								>
									<Grid
										item
										xs={12}
										md={6}
									>
										<TextField
											fullWidth
											label="Nombre completo *"
											value={formData.reporterName}
											onChange={(e) => handleInputChange('reporterName', e.target.value)}
											placeholder="Su nombre completo"
										/>
									</Grid>

									<Grid
										item
										xs={12}
										md={6}
									>
										<TextField
											fullWidth
											type="email"
											label="Correo electrónico *"
											value={formData.reporterEmail}
											onChange={(e) => handleInputChange('reporterEmail', e.target.value)}
											placeholder="su.email@ufps.edu.co"
										/>
									</Grid>

									<Grid
										item
										xs={12}
										md={6}
									>
										<TextField
											fullWidth
											label="Teléfono"
											value={formData.reporterPhone}
											onChange={(e) => handleInputChange('reporterPhone', e.target.value)}
											placeholder="(opcional)"
										/>
									</Grid>

									<Grid
										item
										xs={12}
										md={6}
									>
										<FormControl fullWidth>
											<InputLabel>Preferencia de contacto</InputLabel>
											<Select
												value={formData.contactPreference}
												onChange={(e) => handleInputChange('contactPreference', e.target.value)}
												label="Preferencia de contacto"
											>
												<MenuItem value="EMAIL">Correo electrónico</MenuItem>
												<MenuItem value="PHONE">Teléfono</MenuItem>
												<MenuItem value="BOTH">Ambos</MenuItem>
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
											rows={2}
											label="Notas adicionales"
											value={formData.additionalNotes}
											onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
											placeholder="Cualquier información adicional que considere relevante"
										/>
									</Grid>
								</Grid>
							</CardContent>
						</Card>
					</Grid>

					{/* Submit Actions */}
					<Grid
						item
						xs={12}
					>
						<Card>
							<CardContent>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<Alert
										severity="info"
										sx={{ flex: 1, mr: 2 }}
									>
										Su incidencia será revisada y asignada a un técnico especializado. Recibirá
										notificaciones sobre el progreso por correo electrónico.
									</Alert>

									<Box sx={{ display: 'flex', gap: 2 }}>
										<Button
											component={Link}
											href="/maintenance/incidents"
											variant="outlined"
											disabled={submitting}
										>
											Cancelar
										</Button>
										<Button
											type="submit"
											variant="contained"
											startIcon={<SaveIcon />}
											size="large"
											disabled={submitting}
										>
											{submitting ? 'Reportando...' : 'Reportar Incidencia'}
										</Button>
									</Box>
								</Box>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</form>
		</Box>
	);
}
