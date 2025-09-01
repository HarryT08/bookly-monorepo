'use client';

import { useState, useEffect } from 'react';
import {
	Box,
	Card,
	CardContent,
	Typography,
	Button,
	Alert,
	CircularProgress,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Chip,
	IconButton,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	LinearProgress,
	Grid,
	FormControl,
	InputLabel,
	Select,
	MenuItem
} from '@mui/material';
import {
	FileDownload as FileDownloadIcon,
	Refresh as RefreshIcon,
	Delete as DeleteIcon,
	Visibility as VisibilityIcon,
	History as HistoryIcon,
	GetApp as GetAppIcon
} from '@mui/icons-material';
import { exportReportsService, ExportHistory } from '@/services/reports';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ExportsTab() {
	const [loading, setLoading] = useState(false);
	const [exports, setExports] = useState<ExportHistory[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [selectedExport, setSelectedExport] = useState<ExportHistory | null>(null);
	const [detailsDialog, setDetailsDialog] = useState(false);
	const [downloadingId, setDownloadingId] = useState<string | null>(null);
	const [filterType, setFilterType] = useState<string>('all');

	const loadExports = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await exportReportsService.getExportHistory(50, filterType === 'all' ? undefined : filterType);
			setExports(data);
		} catch (err) {
			console.error('Error loading exports:', err);
			setError('Error al cargar el historial de exportaciones');
		} finally {
			setLoading(false);
		}
	};

	const handleDownload = async (exportItem: ExportHistory) => {
		if (!exportItem.isAvailable) {
			setError('La exportación no está disponible o ha expirado');
			return;
		}

		try {
			setDownloadingId(exportItem.id);
			const blob = await exportReportsService.downloadExport(exportItem.id);

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = exportItem.filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			// Refresh the list to update download count
			loadExports();
		} catch (err) {
			console.error('Error downloading export:', err);
			setError('Error al descargar la exportación');
		} finally {
			setDownloadingId(null);
		}
	};

	const handleViewDetails = (exportItem: ExportHistory) => {
		setSelectedExport(exportItem);
		setDetailsDialog(true);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'COMPLETED':
				return 'success';
			case 'PROCESSING':
				return 'info';
			case 'PENDING':
				return 'warning';
			case 'FAILED':
				return 'error';
			case 'EXPIRED':
				return 'default';
			default:
				return 'default';
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'COMPLETED':
				return 'Completado';
			case 'PROCESSING':
				return 'Procesando';
			case 'PENDING':
				return 'Pendiente';
			case 'FAILED':
				return 'Fallido';
			case 'EXPIRED':
				return 'Expirado';
			default:
				return status;
		}
	};

	const formatFileSize = (bytes?: number) => {
		if (!bytes) return 'N/A';

		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
	};

	const formatDate = (dateString: string) => {
		return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
	};

	const isExpired = (expiresAt: string) => {
		return new Date(expiresAt) < new Date();
	};

	const filteredExports = exports.filter((exp) => {
		if (filterType === 'all') return true;
		return exp.reportType === filterType;
	});

	useEffect(() => {
		loadExports();
	}, [filterType]);

	return (
		<Box>
			{/* Header Section */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
						<Typography
							variant="h6"
							sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
						>
							<HistoryIcon />
							Historial de Exportaciones
						</Typography>
						<Tooltip title="Actualizar">
							<IconButton
								onClick={loadExports}
								disabled={loading}
							>
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					</Box>

					<Grid
						container
						spacing={2}
						alignItems="center"
					>
						<Grid
							item
							xs={12}
							sm={6}
							md={4}
						>
							<FormControl
								fullWidth
								size="small"
							>
								<InputLabel>Filtrar por tipo</InputLabel>
								<Select
									value={filterType}
									onChange={(e) => setFilterType(e.target.value)}
									label="Filtrar por tipo"
								>
									<MenuItem value="all">Todos los tipos</MenuItem>
									<MenuItem value="usage">Reportes de Uso</MenuItem>
									<MenuItem value="users">Reportes de Usuarios</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						<Grid
							item
							xs={12}
							sm={6}
							md={4}
						>
							<Typography
								variant="body2"
								color="text.secondary"
							>
								Total: {filteredExports.length} exportaciones
							</Typography>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* Error Alert */}
			{error && (
				<Alert
					severity="error"
					sx={{ mb: 3 }}
					onClose={() => setError(null)}
				>
					{error}
				</Alert>
			)}

			{/* Exports Table */}
			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
					<CircularProgress />
				</Box>
			) : (
				<Card>
					<CardContent>
						<TableContainer
							component={Paper}
							variant="outlined"
						>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>Archivo</TableCell>
										<TableCell>Tipo</TableCell>
										<TableCell>Estado</TableCell>
										<TableCell>Creado</TableCell>
										<TableCell>Expira</TableCell>
										<TableCell>Tamaño</TableCell>
										<TableCell>Descargas</TableCell>
										<TableCell align="center">Acciones</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{filteredExports.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={8}
												align="center"
											>
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{ py: 4 }}
												>
													No hay exportaciones disponibles
												</Typography>
											</TableCell>
										</TableRow>
									) : (
										filteredExports.map((exportItem) => (
											<TableRow key={exportItem.id}>
												<TableCell>
													<Box>
														<Typography variant="subtitle2">
															{exportItem.filename}
														</Typography>
														<Typography
															variant="caption"
															color="text.secondary"
														>
															{exportItem.format.toUpperCase()}
														</Typography>
													</Box>
												</TableCell>
												<TableCell>
													<Typography variant="body2">
														{exportItem.reportType === 'usage' ? 'Uso' : 'Usuarios'}
													</Typography>
												</TableCell>
												<TableCell>
													<Chip
														label={getStatusLabel(exportItem.status)}
														color={getStatusColor(exportItem.status)}
														size="small"
													/>
												</TableCell>
												<TableCell>
													<Typography variant="body2">
														{formatDate(exportItem.createdAt)}
													</Typography>
												</TableCell>
												<TableCell>
													<Typography
														variant="body2"
														color={
															isExpired(exportItem.expiresAt) ? 'error' : 'text.primary'
														}
													>
														{formatDate(exportItem.expiresAt)}
													</Typography>
												</TableCell>
												<TableCell>
													<Typography variant="body2">
														{formatFileSize(exportItem.fileSize)}
													</Typography>
												</TableCell>
												<TableCell>
													<Typography variant="body2">{exportItem.downloadCount}</Typography>
												</TableCell>
												<TableCell align="center">
													<Box sx={{ display: 'flex', gap: 1 }}>
														<Tooltip title="Ver detalles">
															<IconButton
																size="small"
																onClick={() => handleViewDetails(exportItem)}
															>
																<VisibilityIcon />
															</IconButton>
														</Tooltip>

														{exportItem.isAvailable &&
															exportItem.status === 'COMPLETED' && (
																<Tooltip title="Descargar">
																	<IconButton
																		size="small"
																		color="primary"
																		onClick={() => handleDownload(exportItem)}
																		disabled={downloadingId === exportItem.id}
																	>
																		{downloadingId === exportItem.id ? (
																			<CircularProgress size={16} />
																		) : (
																			<GetAppIcon />
																		)}
																	</IconButton>
																</Tooltip>
															)}
													</Box>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</CardContent>
				</Card>
			)}

			{/* Details Dialog */}
			<Dialog
				open={detailsDialog}
				onClose={() => setDetailsDialog(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>Detalles de Exportación</DialogTitle>
				<DialogContent>
					{selectedExport && (
						<Box sx={{ pt: 1 }}>
							<Grid
								container
								spacing={2}
							>
								<Grid
									item
									xs={12}
									sm={6}
								>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Archivo
									</Typography>
									<Typography
										variant="body2"
										sx={{ mb: 2 }}
									>
										{selectedExport.filename}
									</Typography>
								</Grid>

								<Grid
									item
									xs={12}
									sm={6}
								>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Estado
									</Typography>
									<Chip
										label={getStatusLabel(selectedExport.status)}
										color={getStatusColor(selectedExport.status)}
										size="small"
										sx={{ mb: 2 }}
									/>
								</Grid>

								<Grid
									item
									xs={12}
									sm={6}
								>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Tipo de Reporte
									</Typography>
									<Typography
										variant="body2"
										sx={{ mb: 2 }}
									>
										{selectedExport.reportType === 'usage'
											? 'Reporte de Uso'
											: 'Reporte de Usuarios'}
									</Typography>
								</Grid>

								<Grid
									item
									xs={12}
									sm={6}
								>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Formato
									</Typography>
									<Typography
										variant="body2"
										sx={{ mb: 2 }}
									>
										{selectedExport.format.toUpperCase()}
									</Typography>
								</Grid>

								<Grid
									item
									xs={12}
									sm={6}
								>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Fecha de Creación
									</Typography>
									<Typography
										variant="body2"
										sx={{ mb: 2 }}
									>
										{formatDate(selectedExport.createdAt)}
									</Typography>
								</Grid>

								<Grid
									item
									xs={12}
									sm={6}
								>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Fecha de Expiración
									</Typography>
									<Typography
										variant="body2"
										sx={{ mb: 2 }}
										color={isExpired(selectedExport.expiresAt) ? 'error' : 'text.primary'}
									>
										{formatDate(selectedExport.expiresAt)}
									</Typography>
								</Grid>

								{selectedExport.completedAt && (
									<Grid
										item
										xs={12}
										sm={6}
									>
										<Typography
											variant="subtitle2"
											gutterBottom
										>
											Fecha de Finalización
										</Typography>
										<Typography
											variant="body2"
											sx={{ mb: 2 }}
										>
											{formatDate(selectedExport.completedAt)}
										</Typography>
									</Grid>
								)}

								<Grid
									item
									xs={12}
									sm={6}
								>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Tamaño del Archivo
									</Typography>
									<Typography
										variant="body2"
										sx={{ mb: 2 }}
									>
										{formatFileSize(selectedExport.fileSize)}
									</Typography>
								</Grid>

								<Grid
									item
									xs={12}
									sm={6}
								>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Número de Descargas
									</Typography>
									<Typography
										variant="body2"
										sx={{ mb: 2 }}
									>
										{selectedExport.downloadCount}
									</Typography>
								</Grid>

								<Grid
									item
									xs={12}
									sm={6}
								>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Disponible
									</Typography>
									<Chip
										label={selectedExport.isAvailable ? 'Sí' : 'No'}
										color={selectedExport.isAvailable ? 'success' : 'error'}
										size="small"
									/>
								</Grid>
							</Grid>

							{selectedExport.status === 'PROCESSING' && (
								<Box sx={{ mt: 3 }}>
									<Typography
										variant="subtitle2"
										gutterBottom
									>
										Progreso
									</Typography>
									<LinearProgress />
									<Typography
										variant="caption"
										color="text.secondary"
										sx={{ mt: 1, display: 'block' }}
									>
										Procesando exportación...
									</Typography>
								</Box>
							)}
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					{selectedExport?.isAvailable && selectedExport.status === 'COMPLETED' && (
						<Button
							startIcon={<FileDownloadIcon />}
							onClick={() => {
								if (selectedExport) {
									handleDownload(selectedExport);
									setDetailsDialog(false);
								}
							}}
							disabled={downloadingId === selectedExport.id}
						>
							Descargar
						</Button>
					)}
					<Button onClick={() => setDetailsDialog(false)}>Cerrar</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
