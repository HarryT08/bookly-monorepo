'use client';

import { useState, useEffect } from 'react';
import {
	Box,
	Card,
	CardContent,
	Typography,
	Button,
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
	Switch,
	Avatar
} from '@mui/material';
import {
	Search as SearchIcon,
	FileDownload as FileDownloadIcon,
	Refresh as RefreshIcon,
	FilterList as FilterListIcon,
	Person as PersonIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import {
	userReportsService,
	UserReportFilters,
	UserReportResponse,
	ReportFilterOptions,
	exportReportsService
} from '@/services/reports';

export default function UserReportsTab() {
	const [loading, setLoading] = useState(false);
	const [reportData, setReportData] = useState<UserReportResponse | null>(null);
	const [filterOptions, setFilterOptions] = useState<ReportFilterOptions | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [exporting, setExporting] = useState(false);

	// Filters state
	const [filters, setFilters] = useState<UserReportFilters>({
		startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
		endDate: new Date().toISOString().split('T')[0], // today
		userIds: [],
		roles: [],
		includeDetails: true,
		page: 1,
		limit: 10
	});

	const loadFilterOptions = async () => {
		try {
			// Note: This endpoint may not exist in backend yet, using generic filter options
			const options = await userReportsService.getReportHistory();
			// Simulate filter options structure
			setFilterOptions({
				programs: [],
				resourceTypes: [],
				categories: [],
				users: [],
				dateRanges: []
			});
		} catch (err) {
			console.error('Error loading filter options:', err);
			// Set empty options to allow the component to work
			setFilterOptions({
				programs: [],
				resourceTypes: [],
				categories: [],
				users: [],
				dateRanges: []
			});
		}
	};

	const generateReport = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await userReportsService.generateUserReport(filters);
			setReportData(data);
		} catch (err) {
			console.error('Error generating user report:', err);
			setError('Error al generar el reporte de usuarios');
		} finally {
			setLoading(false);
		}
	};

	const handleExportCSV = async () => {
		try {
			setExporting(true);
			const exportConfig = {
				reportType: 'users' as const,
				filters,
				format: 'csv' as const,
				title: 'Reporte de Usuarios',
				description: `Reporte generado para el período ${filters.startDate} - ${filters.endDate}`
			};

			const exportResponse = await exportReportsService.exportToCsv(exportConfig);

			// Start polling for export completion
			const checkStatus = async () => {
				try {
					const status = await exportReportsService.getExportStatus(exportResponse.id);

					if (status.status === 'COMPLETED') {
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

	const handleFilterChange = (key: keyof UserReportFilters, value: any) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
			...(key !== 'page' && { page: 1 }) // Reset page when filters change
		}));
	};

	const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
		handleFilterChange('page', value);
	};

	const getRoleColor = (role: string) => {
		const roleColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
			ADMIN: 'error',
			PROGRAM_ADMIN: 'warning',
			TEACHER: 'primary',
			STUDENT: 'info',
			ADMINISTRATIVE: 'secondary',
			SECURITY: 'success'
		};
		return roleColors[role] || 'default';
	};

	const getUtilizationColor = (rate: number) => {
		if (rate >= 80) return 'success';

		if (rate >= 60) return 'warning';

		if (rate >= 40) return 'info';

		return 'default';
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
							Filtros de Reporte de Usuarios
						</Typography>

						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: {
									xs: '1fr',
									md: 'repeat(4, 1fr)'
								},
								gap: 3
							}}
						>
							{/* Date Range */}
							<Box>
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
							</Box>

							<Box>
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
							</Box>

							{/* Roles Filter */}
							<Box>
								<FormControl
									fullWidth
									size="small"
								>
									<InputLabel>Roles</InputLabel>
									<Select
										multiple
										value={filters.roles || []}
										onChange={(e) => handleFilterChange('roles', e.target.value)}
										renderValue={(selected) => (
											<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
												{(selected as string[]).map((value) => (
													<Chip
														key={value}
														label={value}
														size="small"
														color={getRoleColor(value)}
													/>
												))}
											</Box>
										)}
									>
										{[
											'ADMIN',
											'PROGRAM_ADMIN',
											'TEACHER',
											'STUDENT',
											'ADMINISTRATIVE',
											'SECURITY'
										].map((role) => (
											<MenuItem
												key={role}
												value={role}
											>
												{role}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>

							{/* Options */}
							<Box>
								<FormControlLabel
									control={
										<Switch
											checked={filters.includeDetails || false}
											onChange={(e) => handleFilterChange('includeDetails', e.target.checked)}
										/>
									}
									label="Incluir detalles"
								/>
							</Box>

							{/* Actions */}
							<Box sx={{ gridColumn: '1 / -1' }}>
								<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
							</Box>
						</Box>
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
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: {
										xs: '1fr',
										sm: 'repeat(2, 1fr)'
									},
									gap: 3,
									mb: 3
								}}
							>
								<Box>
									<Card>
										<CardContent>
											<Typography
												variant="h6"
												component="div"
											>
												{reportData.summary.totalUsers}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												Total Usuarios
											</Typography>
										</CardContent>
									</Card>
								</Box>
								<Box>
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
								</Box>
								<Box>
									<Card>
										<CardContent>
											<Typography
												variant="h6"
												component="div"
											>
												{Math.round(reportData.summary.averageReservationsPerUser)}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												Promedio por Usuario
											</Typography>
										</CardContent>
									</Card>
								</Box>
								<Box>
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
								</Box>
							</Box>

							{/* Data Table */}
							<Card>
								<CardContent>
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											mb: 2
										}}
									>
										<Typography variant="h6">
											Detalles del Reporte ({reportData.pagination.total} usuarios)
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
													<TableCell>Usuario</TableCell>
													<TableCell>Rol</TableCell>
													<TableCell align="right">Reservas</TableCell>
													<TableCell align="right">Confirmadas</TableCell>
													<TableCell align="right">Canceladas</TableCell>
													<TableCell align="right">Utilización</TableCell>
													<TableCell align="right">Horas Totales</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{reportData.data.map((user) => (
													<TableRow key={user.userId}>
														<TableCell>
															<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
																<Avatar sx={{ width: 32, height: 32 }}>
																	<PersonIcon />
																</Avatar>
																<Box>
																	<Typography variant="subtitle2">
																		{user.userName}
																	</Typography>
																	<Typography
																		variant="caption"
																		color="text.secondary"
																	>
																		{user.userEmail}
																	</Typography>
																</Box>
															</Box>
														</TableCell>
														<TableCell>
															<Chip
																label={user.userRole}
																color={getRoleColor(user.userRole)}
																size="small"
															/>
														</TableCell>
														<TableCell align="right">
															<Typography
																variant="body2"
																fontWeight="medium"
															>
																{user.totalReservations}
															</Typography>
														</TableCell>
														<TableCell align="right">
															<Typography
																variant="body2"
																color="success.main"
															>
																{user.confirmedReservations}
															</Typography>
														</TableCell>
														<TableCell align="right">
															<Typography
																variant="body2"
																color="error.main"
															>
																{user.cancelledReservations}
															</Typography>
														</TableCell>
														<TableCell align="right">
															<Chip
																label={`${Math.round(user.utilizationRate)}%`}
																color={getUtilizationColor(user.utilizationRate)}
																size="small"
															/>
														</TableCell>
														<TableCell align="right">
															<Typography variant="body2">{user.totalHours}h</Typography>
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
