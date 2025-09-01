'use client';

import { useState, useEffect } from 'react';
import {
	Box,
	Grid,
	Card,
	CardContent,
	Typography,
	Button,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Chip,
	Alert,
	CircularProgress,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Pagination,
	IconButton,
	Tooltip,
	FormControlLabel,
	Switch
} from '@mui/material';
import {
	Search as SearchIcon,
	FileDownload as FileDownloadIcon,
	Refresh as RefreshIcon,
	FilterList as FilterListIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import {
	usageReportsService,
	UsageReportFilters,
	UsageReportResponse,
	ReportFilterOptions,
	exportReportsService
} from '@/services/reports';

export default function UsageReportsTab() {
	const [loading, setLoading] = useState(false);
	const [reportData, setReportData] = useState<UsageReportResponse | null>(null);
	const [filterOptions, setFilterOptions] = useState<ReportFilterOptions | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [exporting, setExporting] = useState(false);

	// Filters state
	const [filters, setFilters] = useState<UsageReportFilters>({
		startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
		endDate: new Date().toISOString().split('T')[0], // today
		programIds: [],
		resourceTypes: [],
		categories: [],
		includeDetails: true,
		page: 1,
		limit: 10
	});

	const loadFilterOptions = async () => {
		try {
			const options = await usageReportsService.getUsageFilterOptions();
			setFilterOptions(options);
		} catch (err) {
			console.error('Error loading filter options:', err);
		}
	};

	const generateReport = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await usageReportsService.generateUsageReport(filters);
			setReportData(data);
		} catch (err) {
			console.error('Error generating usage report:', err);
			setError('Error al generar el reporte de uso');
		} finally {
			setLoading(false);
		}
	};

	const handleExportCSV = async () => {
		try {
			setExporting(true);
			const exportConfig = {
				reportType: 'usage' as const,
				filters,
				format: 'csv' as const,
				title: 'Reporte de Uso de Recursos',
				description: `Reporte generado para el período ${filters.startDate} - ${filters.endDate}`
			};

			const exportResponse = await exportReportsService.exportToCsv(exportConfig);

			// Start polling for export completion
			const checkStatus = async () => {
				try {
					const status = await exportReportsService.getExportStatus(exportResponse.id);

					if (status.status === 'COMPLETED' && status.isAvailable) {
						const blob = await exportReportsService.downloadExport(exportResponse.id);

						// Create download link
						const url = window.URL.createObjectURL(blob);
						const link = document.createElement('a');
						link.href = url;
						link.download = exportResponse.filename;
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
						window.URL.revokeObjectURL(url);

						setExporting(false);
					} else if (status.status === 'FAILED') {
						setError('Error al exportar el reporte');
						setExporting(false);
					} else {
						// Continue polling
						setTimeout(checkStatus, 2000);
					}
				} catch (err) {
					console.error('Error checking export status:', err);
					setError('Error al verificar el estado de la exportación');
					setExporting(false);
				}
			};

			setTimeout(checkStatus, 2000);
		} catch (err) {
			console.error('Error exporting report:', err);
			setError('Error al iniciar la exportación');
			setExporting(false);
		}
	};

	const handleFilterChange = (key: keyof UsageReportFilters, value: any) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
			...(key !== 'page' && { page: 1 }) // Reset page when filters change
		}));
	};

	const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
		handleFilterChange('page', value);
	};

	useEffect(() => {
		loadFilterOptions();
	}, []);

	useEffect(() => {
		if (filterOptions) {
			generateReport();
		}
	}, [filters, filterOptions]);

	return (
		<LocalizationProvider
			dateAdapter={AdapterDateFns}
			adapterLocale={es}
		>
			<Box>
				{/* Filters Section */}
				<Card sx={{ mb: 3 }}>
					<CardContent>
						<Typography
							variant="h6"
							gutterBottom
							sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
						>
							<FilterListIcon />
							Filtros de Reporte de Uso
						</Typography>

						<Grid
							container
							spacing={3}
						>
							{/* Date Range */}
							<Grid
								item
								xs={12}
								md={3}
							>
								<DatePicker
									label="Fecha Inicio"
									value={filters.startDate ? new Date(filters.startDate) : null}
									onChange={(date) =>
										handleFilterChange('startDate', date?.toISOString().split('T')[0])
									}
									slotProps={{
										textField: {
											fullWidth: true,
											size: 'small'
										}
									}}
								/>
							</Grid>

							<Grid
								item
								xs={12}
								md={3}
							>
								<DatePicker
									label="Fecha Fin"
									value={filters.endDate ? new Date(filters.endDate) : null}
									onChange={(date) =>
										handleFilterChange('endDate', date?.toISOString().split('T')[0])
									}
									slotProps={{
										textField: {
											fullWidth: true,
											size: 'small'
										}
									}}
								/>
							</Grid>

							{/* Programs Filter */}
							<Grid
								item
								xs={12}
								md={3}
							>
								<FormControl
									fullWidth
									size="small"
								>
									<InputLabel>Programas</InputLabel>
									<Select
										multiple
										value={filters.programIds || []}
										onChange={(e) => handleFilterChange('programIds', e.target.value)}
										renderValue={(selected) => (
											<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
												{(selected as string[]).map((value) => {
													const program = filterOptions?.programs.find((p) => p.id === value);
													return (
														<Chip
															key={value}
															label={program?.name || value}
															size="small"
														/>
													);
												})}
											</Box>
										)}
									>
										{filterOptions?.programs.map((program) => (
											<MenuItem
												key={program.id}
												value={program.id}
											>
												{program.name}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>

							{/* Resource Types Filter */}
							<Grid
								item
								xs={12}
								md={3}
							>
								<FormControl
									fullWidth
									size="small"
								>
									<InputLabel>Tipos de Recurso</InputLabel>
									<Select
										multiple
										value={filters.resourceTypes || []}
										onChange={(e) => handleFilterChange('resourceTypes', e.target.value)}
										renderValue={(selected) => (
											<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
												{(selected as string[]).map((value) => (
													<Chip
														key={value}
														label={value}
														size="small"
													/>
												))}
											</Box>
										)}
									>
										{filterOptions?.resourceTypes.map((type) => (
											<MenuItem
												key={type.type}
												value={type.type}
											>
												{type.type} ({type.count})
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>

							{/* Options */}
							<Grid
								item
								xs={12}
							>
								<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
									<FormControlLabel
										control={
											<Switch
												checked={filters.includeDetails || false}
												onChange={(e) => handleFilterChange('includeDetails', e.target.checked)}
											/>
										}
										label="Incluir detalles"
									/>

									<Button
										variant="contained"
										startIcon={<SearchIcon />}
										onClick={generateReport}
										disabled={loading}
									>
										Generar Reporte
									</Button>

									<Button
										variant="outlined"
										startIcon={exporting ? <CircularProgress size={16} /> : <FileDownloadIcon />}
										onClick={handleExportCSV}
										disabled={!reportData || exporting}
									>
										Exportar CSV
									</Button>
								</Box>
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

				{/* Results Section */}
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
						<CircularProgress />
					</Box>
				) : (
					reportData && (
						<>
							{/* Summary Cards */}
							<Grid
								container
								spacing={3}
								sx={{ mb: 3 }}
							>
								<Grid
									item
									xs={12}
									sm={6}
									md={3}
								>
									<Card>
										<CardContent>
											<Typography
												variant="h6"
												component="div"
											>
												{reportData.summary.totalPrograms}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												Programas Analizados
											</Typography>
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
											<Typography
												variant="h6"
												component="div"
											>
												{reportData.summary.totalReservations}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												Total Reservas
											</Typography>
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
											<Typography
												variant="h6"
												component="div"
											>
												{Math.round(reportData.summary.averageUtilization)}%
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												Utilización Promedio
											</Typography>
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
											<Typography
												variant="h6"
												component="div"
											>
												{reportData.summary.totalHours}h
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												Horas Totales
											</Typography>
										</CardContent>
									</Card>
								</Grid>
							</Grid>

							{/* Data Table */}
							<Card>
								<CardContent>
									<Box
										sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}
									>
										<Typography variant="h6">
											Detalles del Reporte ({reportData.pagination.total} registros)
										</Typography>
										<Tooltip title="Actualizar">
											<IconButton
												onClick={generateReport}
												disabled={loading}
											>
												<RefreshIcon />
											</IconButton>
										</Tooltip>
									</Box>

									<TableContainer
										component={Paper}
										variant="outlined"
									>
										<Table>
											<TableHead>
												<TableRow>
													<TableCell>Programa</TableCell>
													<TableCell>Tipo de Recurso</TableCell>
													<TableCell align="right">Reservas</TableCell>
													<TableCell align="right">Horas</TableCell>
													<TableCell align="right">Utilización</TableCell>
													<TableCell align="right">Recursos Usados</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{reportData.data.map((row, index) => (
													<TableRow key={index}>
														<TableCell>
															<Box>
																<Typography variant="subtitle2">
																	{row.programName}
																</Typography>
																<Typography
																	variant="caption"
																	color="text.secondary"
																>
																	{row.programId}
																</Typography>
															</Box>
														</TableCell>
														<TableCell>{row.resourceType}</TableCell>
														<TableCell align="right">
															<Typography
																variant="body2"
																fontWeight="medium"
															>
																{row.totalReservations}
															</Typography>
														</TableCell>
														<TableCell align="right">
															<Typography variant="body2">{row.totalHours}h</Typography>
														</TableCell>
														<TableCell align="right">
															<Chip
																label={`${Math.round(row.utilizationRate)}%`}
																color={
																	row.utilizationRate > 80
																		? 'success'
																		: row.utilizationRate > 60
																			? 'warning'
																			: 'default'
																}
																size="small"
															/>
														</TableCell>
														<TableCell align="right">
															<Typography variant="body2">
																{row.resourcesUsed.length}
															</Typography>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>

									{/* Pagination */}
									<Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
										<Pagination
											count={reportData.pagination.totalPages}
											page={reportData.pagination.page}
											onChange={handlePageChange}
											color="primary"
										/>
									</Box>
								</CardContent>
							</Card>
						</>
					)
				)}
			</Box>
		</LocalizationProvider>
	);
}
