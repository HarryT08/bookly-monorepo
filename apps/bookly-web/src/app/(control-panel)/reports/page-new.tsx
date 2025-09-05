'use client';

import { useState, useEffect } from 'react';
import { Box, Tab, Tabs, Alert, Divider, Card, Tooltip, IconButton } from '@mui/material';
import {
	Assessment as AssessmentIcon,
	People as PeopleIcon,
	FileDownload as FileDownloadIcon,
	Refresh as RefreshIcon,
	Dashboard as DashboardIcon
} from '@mui/icons-material';
import { AdminGuard } from '@/components/auth';
import { reportsService, ReportStatistics } from '@/services/reports';
import { PageHeader, StatsGrid } from '@/components/organisms';
import { LoadingSpinner } from '@/components/atoms';
import UsageReportsTab from './components/UsageReportsTab';
import UserReportsTab from './components/UserReportsTab';
import ExportsTab from './components/ExportsTab';

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

import type { StatCardProps } from '@/components/molecules/StatCard';

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
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

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
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

	// Prepare stats cards data
	const statsCards: StatCardProps[] = statistics
		? [
				{
					title: 'Total Reportes',
					value: statistics.totalReports,
					icon: <AssessmentIcon />
				},
				{
					title: 'Total Exportaciones',
					value: statistics.totalExports,
					icon: <FileDownloadIcon />
				},
				{
					title: 'Utilización Sistema',
					value: `${Math.round(statistics.systemUsage.utilizationRate)}%`,
					icon: <PeopleIcon />
				},
				{
					title: 'Total Reservas',
					value: statistics.systemUsage.totalReservations,
					icon: <AssessmentIcon />
				}
			]
		: [];

	// Page header props
	const pageHeaderProps = {
		title: 'Centro de Reportes',
		subtitle: 'Generar y gestionar reportes del sistema Bookly',
		icon: <DashboardIcon />,
		actions: (
			<Tooltip title="Actualizar estadísticas">
				<IconButton
					onClick={loadStatistics}
					disabled={loading}
					color="primary"
				>
					<RefreshIcon />
				</IconButton>
			</Tooltip>
		)
	};

	return (
		<AdminGuard>
			<Box sx={{ width: '100%', p: 3 }}>
				{/* Page Header */}
				<PageHeader {...pageHeaderProps} />

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

				{/* Statistics Section */}
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
						<LoadingSpinner />
					</Box>
				) : (
					statistics && (
						<Box sx={{ mb: 4 }}>
							<StatsGrid stats={statsCards} />
						</Box>
					)
				)}

				<Divider sx={{ mb: 3 }} />

				{/* Tabs Section */}
				<Card>
					<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
						<Tabs
							value={tabValue}
							onChange={handleTabChange}
							aria-label="reports tabs"
							variant="fullWidth"
							sx={{
								'& .MuiTab-root': {
									minHeight: 64,
									textTransform: 'none',
									fontSize: '1rem'
								}
							}}
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
