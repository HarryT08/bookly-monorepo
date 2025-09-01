import { useState, useCallback, useEffect } from 'react';
import {
	usageReportsService,
	userReportsService,
	exportReportsService,
	reportsService,
	UsageReportFilters,
	UserReportFilters,
	UsageReportResponse,
	UserReportResponse,
	ExportCsvConfig,
	ExportResponse,
	ExportHistory,
	ReportStatistics,
	PersonalStats
} from '@/services/reports';

// Usage Reports Hook
export function useUsageReports(initialFilters?: Partial<UsageReportFilters>) {
	const [data, setData] = useState<UsageReportResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<UsageReportFilters>({
		startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		endDate: new Date().toISOString().split('T')[0],
		programIds: [],
		resourceTypes: [],
		categories: [],
		includeDetails: true,
		page: 1,
		limit: 10,
		...initialFilters
	});

	const generateReport = useCallback(
		async (customFilters?: Partial<UsageReportFilters>) => {
			try {
				setLoading(true);
				setError(null);
				const reportFilters = { ...filters, ...customFilters };
				const result = await usageReportsService.generateUsageReport(reportFilters);
				setData(result);

				if (customFilters) {
					setFilters((prev) => ({ ...prev, ...customFilters }));
				}
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'Error al generar el reporte de uso');
				console.error('Error generating usage report:', err);
			} finally {
				setLoading(false);
			}
		},
		[filters]
	);

	const getSummary = useCallback(
		async (customFilters?: Partial<UsageReportFilters>) => {
			try {
				const reportFilters = { ...filters, ...customFilters };
				const result = await usageReportsService.getUsageReportSummary(reportFilters);
				return result;
			} catch (err: any) {
				setError(err.message || 'Error al obtener el resumen');
				throw err;
			}
		},
		[filters]
	);

	const updateFilters = useCallback((newFilters: Partial<UsageReportFilters>) => {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		data,
		loading,
		error,
		filters,
		generateReport,
		getSummary,
		updateFilters,
		clearError
	};
}

// User Reports Hook
export function useUserReports(initialFilters?: Partial<UserReportFilters>) {
	const [data, setData] = useState<UserReportResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<UserReportFilters>({
		startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		endDate: new Date().toISOString().split('T')[0],
		userIds: [],
		roles: [],
		includeDetails: true,
		page: 1,
		limit: 10,
		...initialFilters
	});

	const generateReport = useCallback(
		async (customFilters?: Partial<UserReportFilters>) => {
			try {
				setLoading(true);
				setError(null);
				const reportFilters = { ...filters, ...customFilters };
				const result = await userReportsService.generateUserReport(reportFilters);
				setData(result);

				if (customFilters) {
					setFilters((prev) => ({ ...prev, ...customFilters }));
				}
			} catch (err: any) {
				setError(err.message || 'Error al generar el reporte de usuarios');
				console.error('Error generating user report:', err);
			} finally {
				setLoading(false);
			}
		},
		[filters]
	);

	const getSummary = useCallback(
		async (customFilters?: Partial<UserReportFilters>) => {
			try {
				const reportFilters = { ...filters, ...customFilters };
				const result = await userReportsService.getUserReportSummary(reportFilters);
				return result;
			} catch (err: any) {
				setError(err.message || 'Error al obtener el resumen');
				throw err;
			}
		},
		[filters]
	);

	const updateFilters = useCallback((newFilters: Partial<UserReportFilters>) => {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		data,
		loading,
		error,
		filters,
		generateReport,
		getSummary,
		updateFilters,
		clearError
	};
}

// Export Reports Hook
export function useReportExports() {
	const [exports, setExports] = useState<ExportHistory[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [exporting, setExporting] = useState<string | null>(null); // Track which report is being exported

	const loadExports = useCallback(async (limit?: number, reportType?: string) => {
		try {
			setLoading(true);
			setError(null);
			const result = await exportReportsService.getExportHistory(limit, reportType);
			setExports(result);
		} catch (err: any) {
			setError(err.message || 'Error al cargar las exportaciones');
			console.error('Error loading exports:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	const exportToCsv = useCallback(
		async (config: ExportCsvConfig): Promise<ExportResponse | null> => {
			try {
				setExporting(config.reportType);
				setError(null);
				const result = await exportReportsService.exportToCsv(config);

				// Reload exports list to show the new export
				await loadExports();

				return result;
			} catch (err: any) {
				setError(err.message || 'Error al exportar');
				console.error('Error exporting to CSV:', err);
				return null;
			} finally {
				setExporting(null);
			}
		},
		[loadExports]
	);

	const downloadExport = useCallback(
		async (exportId: string, filename: string) => {
			try {
				setError(null);
				const blob = await exportReportsService.downloadExport(exportId);

				// Create download link
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = filename;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);

				// Reload exports to update download count
				await loadExports();
			} catch (err: any) {
				setError(err.message || 'Error al descargar');
				console.error('Error downloading export:', err);
			}
		},
		[loadExports]
	);

	const getExportStatus = useCallback(async (exportId: string) => {
		try {
			const result = await exportReportsService.getExportStatus(exportId);
			return result;
		} catch (err: any) {
			console.error('Error getting export status:', err);
			return null;
		}
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		exports,
		loading,
		error,
		exporting,
		loadExports,
		exportToCsv,
		downloadExport,
		getExportStatus,
		clearError
	};
}

// Personal Stats Hook (for current user)
export function usePersonalStats() {
	const [stats, setStats] = useState<PersonalStats | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadStats = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await userReportsService.getMyStats();
			setStats(result);
		} catch (err: any) {
			setError(err.message || 'Error al cargar las estadísticas personales');
			console.error('Error loading personal stats:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	useEffect(() => {
		loadStats();
	}, [loadStats]);

	return {
		stats,
		loading,
		error,
		loadStats,
		clearError
	};
}

// General Reports Statistics Hook
export function useReportStatistics() {
	const [statistics, setStatistics] = useState<ReportStatistics | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadStatistics = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await reportsService.getStatistics();
			setStatistics(result);
		} catch (err: any) {
			setError(err.message || 'Error al cargar las estadísticas');
			console.error('Error loading statistics:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	useEffect(() => {
		loadStatistics();
	}, [loadStatistics]);

	return {
		statistics,
		loading,
		error,
		loadStatistics,
		clearError
	};
}

// Combined Reports Hook (for comprehensive report management)
export function useReports() {
	const usageReports = useUsageReports();
	const userReports = useUserReports();
	const exports = useReportExports();
	const personalStats = usePersonalStats();
	const statistics = useReportStatistics();

	const isAnyLoading =
		usageReports.loading || userReports.loading || exports.loading || personalStats.loading || statistics.loading;

	const hasAnyError =
		usageReports.error || userReports.error || exports.error || personalStats.error || statistics.error;

	const clearAllErrors = useCallback(() => {
		usageReports.clearError();
		userReports.clearError();
		exports.clearError();
		personalStats.clearError();
		statistics.clearError();
	}, [usageReports, userReports, exports, personalStats, statistics]);

	// Utility functions
	const validateDateRange = useCallback((startDate: string, endDate: string) => {
		return reportsService.validateDateRange(startDate, endDate);
	}, []);

	const getPredefinedRanges = useCallback(() => {
		return reportsService.getPredefinedRanges();
	}, []);

	const formatDate = useCallback((date: Date) => {
		return reportsService.formatDate(date);
	}, []);

	return {
		usageReports,
		userReports,
		exports,
		personalStats,
		statistics,
		isAnyLoading,
		hasAnyError,
		clearAllErrors,
		validateDateRange,
		getPredefinedRanges,
		formatDate
	};
}

// Export individual hooks
export default useReports;
