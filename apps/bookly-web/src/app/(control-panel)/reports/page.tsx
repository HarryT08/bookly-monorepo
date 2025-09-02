'use client';

import { useState, useEffect } from 'react';
import {
	Box,
	Card,
	CardContent,
	Grid,
	Typography,
	Tab,
	Tabs,
	Alert,
	CircularProgress,
	Divider,
	IconButton,
	Tooltip
} from '@mui/material';
import {
	Assessment as AssessmentIcon,
	People as PeopleIcon,
	FileDownload as FileDownloadIcon,
	Refresh as RefreshIcon,
	Dashboard as DashboardIcon
} from '@mui/icons-material';
import { AdminGuard } from '@/components/auth';
import { reportsService, ReportStatistics } from '@/services/reports';
import UsageReportsTab from './components/UsageReportsTab';
import UserReportsTab from './components/UserReportsTab';
import ExportsTab from './components/ExportsTab';

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`reports-tabpanel-${index}`}
			aria-labelledby={`reports-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
}

function a11yProps(index: number) {
	return {
		id: `reports-tab-${index}`,
		'aria-controls': `reports-tabpanel-${index}`
	};
}

export default function ReportsPage() {
	const [tabValue, setTabValue] = useState(0);
	const [statistics, setStatistics] = useState<ReportStatistics | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const loadStatistics = async () => {
		try {
			setLoading(true);
			setError(null);
			const stats = await reportsService.getStatistics();
			setStatistics(stats);
		} catch (err) {
			console.error('Error loading statistics:', err);
			setError('Error al cargar las estadísticas del sistema');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadStatistics();
	}, []);

	return (
		<AdminGuard>
			<Box sx={{ width: '100%', p: 3 }}>
				{/* Header */}
				<Box sx={{ mb: 4 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<DashboardIcon sx={{ fontSize: 32, color: 'primary.main' }} />
							<Box>
								<Typography
									variant="h4"
									component="h1"
									gutterBottom
								>
									Centro de Reportes
								</Typography>
								<Typography
									variant="subtitle1"
									color="text.secondary"
								>
									Generar y gestionar reportes del sistema Bookly
								</Typography>
							</Box>
						</Box>
						<Tooltip title="Actualizar estadísticas">
							<IconButton
								onClick={loadStatistics}
								disabled={loading}
							>
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					</Box>
				</Box>

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

				{/* Statistics Cards */}
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
						<CircularProgress />
					</Box>
				) : (
					statistics && (
						<Grid
							container
							spacing={3}
							sx={{ mb: 4 }}
						>
							<Grid
								item
								xs={12}
								sm={6}
								md={3}
							>
								<Card>
									<CardContent>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
											<AssessmentIcon color="primary" />
											<Box>
												<Typography
													variant="h6"
													component="div"
												>
													{statistics.totalReports}
												</Typography>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													Total Reportes
												</Typography>
											</Box>
										</Box>
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
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
											<FileDownloadIcon color="secondary" />
											<Box>
												<Typography
													variant="h6"
													component="div"
												>
													{statistics.totalExports}
												</Typography>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													Total Exportaciones
												</Typography>
											</Box>
										</Box>
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
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
											<PeopleIcon color="success" />
											<Box>
												<Typography
													variant="h6"
													component="div"
												>
													{Math.round(statistics.systemUsage.utilizationRate)}%
												</Typography>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													Utilización Sistema
												</Typography>
											</Box>
										</Box>
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
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
											<AssessmentIcon color="info" />
											<Box>
												<Typography
													variant="h6"
													component="div"
												>
													{statistics.systemUsage.totalReservations}
												</Typography>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													Total Reservas
												</Typography>
											</Box>
										</Box>
									</CardContent>
								</Card>
							</Grid>
						</Grid>
					)
				)}

				<Divider sx={{ mb: 3 }} />

				{/* Tabs */}
				<Card>
					<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
						<Tabs
							value={tabValue}
							onChange={handleTabChange}
							aria-label="reports tabs"
							variant="fullWidth"
						>
							<Tab
								label="Reportes de Uso"
								icon={<AssessmentIcon />}
								iconPosition="start"
								{...a11yProps(0)}
							/>
							<Tab
								label="Reportes de Usuarios"
								icon={<PeopleIcon />}
								iconPosition="start"
								{...a11yProps(1)}
							/>
							<Tab
								label="Exportaciones"
								icon={<FileDownloadIcon />}
								iconPosition="start"
								{...a11yProps(2)}
							/>
						</Tabs>
					</Box>

					{/* Tab Panels */}
					<TabPanel
						value={tabValue}
						index={0}
					>
						<UsageReportsTab />
					</TabPanel>

					<TabPanel
						value={tabValue}
						index={1}
					>
						<UserReportsTab />
					</TabPanel>

					<TabPanel
						value={tabValue}
						index={2}
					>
						<ExportsTab />
					</TabPanel>
				</Card>
			</Box>
		</AdminGuard>
	);
}
