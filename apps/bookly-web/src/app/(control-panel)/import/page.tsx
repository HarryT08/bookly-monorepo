'use client';

import React, { useState, useRef } from 'react';
import {
	Box,
	Card,
	CardContent,
	Typography,
	Button,
	Stepper,
	Step,
	StepLabel,
	StepContent,
	Alert,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Chip,
	LinearProgress,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Accordion,
	AccordionSummary,
	AccordionDetails
} from '@mui/material';
import {
	CloudUpload as UploadIcon,
	Download as DownloadIcon,
	Check as CheckIcon,
	Error as ErrorIcon,
	Warning as WarningIcon,
	ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';

// Types
interface ImportRecord {
	row: number;
	data: Record<string, string>;
	status: 'pending' | 'success' | 'error' | 'warning';
	errors: string[];
	warnings: string[];
}

interface ImportResult {
	total: number;
	success: number;
	errors: number;
	warnings: number;
	records: ImportRecord[];
}

const IMPORT_TYPES = [
	{ value: 'resources', label: 'Recursos', template: 'recursos_template.csv' },
	{ value: 'users', label: 'Usuarios', template: 'usuarios_template.csv' },
	{ value: 'programs', label: 'Programas Académicos', template: 'programas_template.csv' },
	{ value: 'categories', label: 'Categorías', template: 'categorias_template.csv' }
];

const FIELD_MAPPINGS = {
	resources: [
		{ key: 'name', label: 'Nombre', required: true },
		{ key: 'type', label: 'Tipo', required: true },
		{ key: 'capacity', label: 'Capacidad', required: true },
		{ key: 'location', label: 'Ubicación', required: false },
		{ key: 'description', label: 'Descripción', required: false },
		{ key: 'programCode', label: 'Código Programa', required: false }
	],
	users: [
		{ key: 'firstName', label: 'Nombre', required: true },
		{ key: 'lastName', label: 'Apellido', required: true },
		{ key: 'email', label: 'Email', required: true },
		{ key: 'role', label: 'Rol', required: true },
		{ key: 'programCode', label: 'Código Programa', required: false }
	],
	programs: [
		{ key: 'name', label: 'Nombre', required: true },
		{ key: 'code', label: 'Código', required: true },
		{ key: 'description', label: 'Descripción', required: false },
		{ key: 'isActive', label: 'Activo', required: false }
	],
	categories: [
		{ key: 'name', label: 'Nombre', required: true },
		{ key: 'code', label: 'Código', required: true },
		{ key: 'type', label: 'Tipo', required: true },
		{ key: 'service', label: 'Servicio', required: true },
		{ key: 'color', label: 'Color', required: false }
	]
};

export default function ImportPage() {
	const [activeStep, setActiveStep] = useState(0);
	const [importType, setImportType] = useState<string>('');
	const [csvFile, setCsvFile] = useState<File | null>(null);
	const [csvData, setCsvData] = useState<string[][]>([]);
	const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
	const [validationResult, setValidationResult] = useState<ImportResult | null>(null);
	const [importing, setImporting] = useState(false);
	const [importResult, setImportResult] = useState<ImportResult | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const steps = [
		'Seleccionar tipo de importación',
		'Cargar archivo CSV',
		'Mapear campos',
		'Validar datos',
		'Importar'
	];

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleReset = () => {
		setActiveStep(0);
		setImportType('');
		setCsvFile(null);
		setCsvData([]);
		setFieldMapping({});
		setValidationResult(null);
		setImportResult(null);
	};

	const downloadTemplate = (templateName: string) => {
		// TODO: Replace with actual template download
		const templates: Record<string, string[][]> = {
			'recursos_template.csv': [
				['name', 'type', 'capacity', 'location', 'description', 'programCode'],
				['Salón 101', 'SALON', '30', 'Edificio A - Piso 1', 'Salón de clase tradicional', 'ING-SIS'],
				['Lab Cómputo 1', 'LAB', '25', 'Edificio B - Piso 2', 'Laboratorio de cómputo', 'ING-SIS']
			],
			'usuarios_template.csv': [
				['firstName', 'lastName', 'email', 'role', 'programCode'],
				['Juan', 'Pérez', 'juan.perez@ufps.edu.co', 'DOCENTE', 'ING-SIS'],
				['María', 'García', 'maria.garcia@ufps.edu.co', 'ESTUDIANTE', 'ING-SIS']
			],
			'programas_template.csv': [
				['name', 'code', 'description', 'isActive'],
				['Ingeniería de Sistemas', 'ING-SIS', 'Programa de Ingeniería de Sistemas', 'true'],
				['Medicina General', 'MED-GEN', 'Programa de Medicina General', 'true']
			],
			'categorias_template.csv': [
				['name', 'code', 'type', 'service', 'color'],
				['Salón', 'SALON', 'RESOURCE_TYPE', 'RESOURCES_SERVICE', '#1976d2'],
				['Laboratorio', 'LAB', 'RESOURCE_TYPE', 'RESOURCES_SERVICE', '#388e3c']
			]
		};

		const csvContent =
			templates[templateName]?.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n') || '';

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = templateName;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (!file) return;

		if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
			enqueueSnackbar('Por favor seleccione un archivo CSV válido', { variant: 'error' });
			return;
		}

		setCsvFile(file);

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			const rows = text
				.split('\n')
				.map((row) => row.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')))
				.filter((row) => row.some((cell) => cell.length > 0));

			setCsvData(rows);

			// Auto-map fields based on headers
			if (rows.length > 0 && importType) {
				const headers = rows[0];
				const expectedFields = FIELD_MAPPINGS[importType as keyof typeof FIELD_MAPPINGS] || [];
				const mapping: Record<string, string> = {};

				expectedFields.forEach((field) => {
					const headerIndex = headers.findIndex(
						(h) =>
							h.toLowerCase() === field.key.toLowerCase() || h.toLowerCase() === field.label.toLowerCase()
					);

					if (headerIndex !== -1) {
						mapping[field.key] = headers[headerIndex];
					}
				});

				setFieldMapping(mapping);
			}

			enqueueSnackbar(`Archivo cargado: ${rows.length - 1} registros encontrados`, { variant: 'success' });
		};

		reader.readAsText(file);
	};

	const validateData = async () => {
		if (!csvData.length || !importType) return;

		const headers = csvData[0];
		const dataRows = csvData.slice(1);
		const expectedFields = FIELD_MAPPINGS[importType as keyof typeof FIELD_MAPPINGS] || [];

		const records: ImportRecord[] = dataRows.map((row, index) => {
			const record: ImportRecord = {
				row: index + 2, // +2 because we skip header and arrays are 0-indexed
				data: {},
				status: 'pending',
				errors: [],
				warnings: []
			};

			// Map data according to field mapping
			Object.entries(fieldMapping).forEach(([fieldKey, headerName]) => {
				const headerIndex = headers.indexOf(headerName);

				if (headerIndex !== -1) {
					record.data[fieldKey] = row[headerIndex] || '';
				}
			});

			// Validate required fields
			expectedFields.forEach((field) => {
				if (field.required && !record.data[field.key]) {
					record.errors.push(`Campo requerido '${field.label}' está vacío`);
				}
			});

			// Type-specific validations
			if (importType === 'users' && record.data.email) {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

				if (!emailRegex.test(record.data.email)) {
					record.errors.push('Email inválido');
				}
			}

			if (importType === 'resources' && record.data.capacity) {
				const capacity = parseInt(record.data.capacity);

				if (isNaN(capacity) || capacity <= 0) {
					record.errors.push('Capacidad debe ser un número mayor a 0');
				}
			}

			// Set status based on validation results
			if (record.errors.length > 0) {
				record.status = 'error';
			} else if (record.warnings.length > 0) {
				record.status = 'warning';
			} else {
				record.status = 'success';
			}

			return record;
		});

		const result: ImportResult = {
			total: records.length,
			success: records.filter((r) => r.status === 'success').length,
			errors: records.filter((r) => r.status === 'error').length,
			warnings: records.filter((r) => r.status === 'warning').length,
			records
		};

		setValidationResult(result);
	};

	const executeImport = async () => {
		if (!validationResult) return;

		setImporting(true);
		try {
			// TODO: Replace with actual API calls
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Simulate import results
			const successfulRecords = validationResult.records.filter((r) => r.status !== 'error');
			const finalResult: ImportResult = {
				...validationResult,
				success: successfulRecords.length,
				errors: validationResult.errors
			};

			setImportResult(finalResult);
			enqueueSnackbar(`Importación completada: ${finalResult.success} registros importados`, {
				variant: 'success'
			});

			if (finalResult.errors > 0) {
				enqueueSnackbar(`${finalResult.errors} registros con errores no fueron importados`, {
					variant: 'warning'
				});
			}
		} catch (error) {
			enqueueSnackbar('Error durante la importación', { variant: 'error' });
		} finally {
			setImporting(false);
		}
	};

	const getStepContent = (step: number) => {
		switch (step) {
			case 0:
				return (
					<Box sx={{ mt: 2 }}>
						<FormControl fullWidth>
							<InputLabel>Tipo de datos a importar</InputLabel>
							<Select
								value={importType}
								onChange={(e) => setImportType(e.target.value)}
								label="Tipo de datos a importar"
							>
								{IMPORT_TYPES.map((type) => (
									<MenuItem
										key={type.value}
										value={type.value}
									>
										{type.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{importType && (
							<Box sx={{ mt: 3 }}>
								<Alert
									severity="info"
									sx={{ mb: 2 }}
								>
									Para asegurar una importación exitosa, descargue y use la plantilla CSV
									proporcionada.
								</Alert>
								<Button
									variant="outlined"
									startIcon={<DownloadIcon />}
									onClick={() => {
										const template = IMPORT_TYPES.find((t) => t.value === importType)?.template;

										if (template) downloadTemplate(template);
									}}
								>
									Descargar Plantilla CSV
								</Button>
							</Box>
						)}

						<Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
							<Button
								variant="contained"
								onClick={handleNext}
								disabled={!importType}
							>
								Siguiente
							</Button>
						</Box>
					</Box>
				);

			case 1:
				return (
					<Box sx={{ mt: 2 }}>
						<input
							type="file"
							accept=".csv"
							onChange={handleFileUpload}
							style={{ display: 'none' }}
							ref={fileInputRef}
						/>

						<Box sx={{ textAlign: 'center', p: 4, border: '2px dashed #ccc', borderRadius: 2 }}>
							<UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
							<Typography
								variant="h6"
								gutterBottom
							>
								Cargar archivo CSV
							</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
								paragraph
							>
								Seleccione el archivo CSV que desea importar
							</Typography>
							<Button
								variant="contained"
								onClick={() => fileInputRef.current?.click()}
							>
								Seleccionar Archivo
							</Button>
						</Box>

						{csvFile && (
							<Alert
								severity="success"
								sx={{ mt: 2 }}
							>
								Archivo cargado: {csvFile.name} ({csvData.length - 1} registros)
							</Alert>
						)}

						<Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
							<Button onClick={handleBack}>Atrás</Button>
							<Button
								variant="contained"
								onClick={handleNext}
								disabled={!csvFile || csvData.length === 0}
							>
								Siguiente
							</Button>
						</Box>
					</Box>
				);

			case 2:
				const expectedFields = FIELD_MAPPINGS[importType as keyof typeof FIELD_MAPPINGS] || [];
				const headers = csvData[0] || [];

				return (
					<Box sx={{ mt: 2 }}>
						<Typography
							variant="h6"
							gutterBottom
						>
							Mapear Campos del CSV
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							paragraph
						>
							Asocie cada campo requerido con las columnas de su archivo CSV
						</Typography>

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							{expectedFields.map((field) => (
								<Box
									key={field.key}
									sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
								>
									<Typography sx={{ minWidth: 150 }}>
										{field.label}
										{field.required && <span style={{ color: 'red' }}>*</span>}
									</Typography>
									<FormControl sx={{ minWidth: 200 }}>
										<InputLabel>Columna CSV</InputLabel>
										<Select
											value={fieldMapping[field.key] || ''}
											onChange={(e) =>
												setFieldMapping({
													...fieldMapping,
													[field.key]: e.target.value
												})
											}
											label="Columna CSV"
										>
											<MenuItem value="">-- Sin mapear --</MenuItem>
											{headers.map((header) => (
												<MenuItem
													key={header}
													value={header}
												>
													{header}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Box>
							))}
						</Box>

						<Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
							<Button onClick={handleBack}>Atrás</Button>
							<Button
								variant="contained"
								onClick={handleNext}
								disabled={expectedFields.some((f) => f.required && !fieldMapping[f.key])}
							>
								Siguiente
							</Button>
						</Box>
					</Box>
				);

			case 3:
				return (
					<Box sx={{ mt: 2 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
							<Typography variant="h6">Validación de Datos</Typography>
							<Button
								variant="outlined"
								onClick={validateData}
								disabled={!csvData.length}
							>
								Validar Datos
							</Button>
						</Box>

						{validationResult && (
							<>
								<Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
									<Chip
										icon={<CheckIcon />}
										label={`${validationResult.success} Válidos`}
										color="success"
									/>
									<Chip
										icon={<WarningIcon />}
										label={`${validationResult.warnings} Advertencias`}
										color="warning"
									/>
									<Chip
										icon={<ErrorIcon />}
										label={`${validationResult.errors} Errores`}
										color="error"
									/>
								</Box>

								{validationResult.records.filter((r) => r.status === 'error').length > 0 && (
									<Accordion>
										<AccordionSummary expandIcon={<ExpandMoreIcon />}>
											<Typography color="error">
												Registros con errores ({validationResult.errors})
											</Typography>
										</AccordionSummary>
										<AccordionDetails>
											<TableContainer component={Paper}>
												<Table size="small">
													<TableHead>
														<TableRow>
															<TableCell>Fila</TableCell>
															<TableCell>Errores</TableCell>
														</TableRow>
													</TableHead>
													<TableBody>
														{validationResult.records
															.filter((r) => r.status === 'error')
															.slice(0, 10)
															.map((record) => (
																<TableRow key={record.row}>
																	<TableCell>{record.row}</TableCell>
																	<TableCell>
																		{record.errors.map((error, idx) => (
																			<Chip
																				key={idx}
																				label={error}
																				size="small"
																				color="error"
																				sx={{ mr: 1, mb: 1 }}
																			/>
																		))}
																	</TableCell>
																</TableRow>
															))}
													</TableBody>
												</Table>
											</TableContainer>
										</AccordionDetails>
									</Accordion>
								)}
							</>
						)}

						<Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
							<Button onClick={handleBack}>Atrás</Button>
							<Button
								variant="contained"
								onClick={handleNext}
								disabled={!validationResult || validationResult.success === 0}
							>
								Importar
							</Button>
						</Box>
					</Box>
				);

			case 4:
				return (
					<Box sx={{ mt: 2 }}>
						<Typography
							variant="h6"
							gutterBottom
						>
							Ejecutar Importación
						</Typography>

						{!importResult && (
							<>
								<Alert
									severity="warning"
									sx={{ mb: 3 }}
								>
									Se importarán {validationResult?.success} registros válidos. Los registros con
									errores serán omitidos.
								</Alert>

								<Box sx={{ textAlign: 'center' }}>
									<Button
										variant="contained"
										size="large"
										onClick={executeImport}
										disabled={importing}
									>
										{importing ? 'Importando...' : 'Ejecutar Importación'}
									</Button>
								</Box>

								{importing && (
									<Box sx={{ mt: 3 }}>
										<LinearProgress />
										<Typography
											variant="body2"
											align="center"
											sx={{ mt: 1 }}
										>
											Procesando registros...
										</Typography>
									</Box>
								)}
							</>
						)}

						{importResult && (
							<>
								<Alert
									severity="success"
									sx={{ mb: 3 }}
								>
									Importación completada exitosamente
								</Alert>

								<Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
									<Chip
										icon={<CheckIcon />}
										label={`${importResult.success} Importados`}
										color="success"
									/>
									{importResult.errors > 0 && (
										<Chip
											icon={<ErrorIcon />}
											label={`${importResult.errors} Fallidos`}
											color="error"
										/>
									)}
								</Box>

								<Box sx={{ textAlign: 'center' }}>
									<Button
										variant="outlined"
										onClick={handleReset}
									>
										Nueva Importación
									</Button>
								</Box>
							</>
						)}

						{!importResult && (
							<Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
								<Button
									onClick={handleBack}
									disabled={importing}
								>
									Atrás
								</Button>
							</Box>
						)}
					</Box>
				);

			default:
				return null;
		}
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography
				variant="h4"
				component="h1"
				gutterBottom
			>
				Importación Masiva CSV
			</Typography>
			<Typography
				variant="body1"
				color="text.secondary"
				paragraph
			>
				Importe datos masivamente usando archivos CSV. Siga los pasos para asegurar una importación exitosa.
			</Typography>

			<Card>
				<CardContent>
					<Stepper
						activeStep={activeStep}
						orientation="vertical"
					>
						{steps.map((label, index) => (
							<Step key={label}>
								<StepLabel>{label}</StepLabel>
								<StepContent>{getStepContent(index)}</StepContent>
							</Step>
						))}
					</Stepper>
				</CardContent>
			</Card>
		</Box>
	);
}
