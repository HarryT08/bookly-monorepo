import { useState, useCallback } from 'react';
import { maintenanceService } from '@services/maintenance';
import type {
	MaintenanceRecord,
	CreateMaintenanceRecord,
	UpdateMaintenanceRecord,
	IncidentReport,
	CreateIncidentReport,
	UpdateIncidentReport,
	ScheduledMaintenance,
	CreateScheduledMaintenance,
	UpdateScheduledMaintenance,
	MaintenanceRecordFilters,
	IncidentReportFilters,
	ScheduledMaintenanceFilters,
	Statistics
} from '@services/maintenance/types';

interface UseMaintenanceReturn {
	// State
	maintenanceRecords: MaintenanceRecord[];
	scheduledMaintenance: ScheduledMaintenance[];
	incidents: IncidentReport[];
	statistics: Statistics | null;
	isLoading: boolean;
	error: string | null;

	// Maintenance Records
	getMaintenanceRecords: (filters?: MaintenanceRecordFilters) => Promise<void>;
	createMaintenanceRecord: (data: CreateMaintenanceRecord) => Promise<boolean>;
	updateMaintenanceRecord: (id: string, data: UpdateMaintenanceRecord) => Promise<boolean>;
	deleteMaintenanceRecord: (id: string) => Promise<boolean>;

	// Incidents
	getIncidents: (filters?: IncidentReportFilters) => Promise<void>;
	createIncident: (data: CreateIncidentReport) => Promise<boolean>;
	updateIncident: (id: string, data: UpdateIncidentReport) => Promise<boolean>;
	deleteIncident: (id: string) => Promise<boolean>;

	// Scheduled Maintenance
	getScheduledMaintenance: (filters?: ScheduledMaintenanceFilters) => Promise<void>;
	createScheduledMaintenance: (data: CreateScheduledMaintenance) => Promise<boolean>;
	updateScheduledMaintenance: (id: string, data: UpdateScheduledMaintenance) => Promise<boolean>;
	deleteScheduledMaintenance: (id: string) => Promise<boolean>;

	// Statistics
	getStatistics: (filters?: MaintenanceRecordFilters) => Promise<void>;

	// Utilities
	clearError: () => void;
	refreshData: () => Promise<void>;
}

export function useMaintenance(): UseMaintenanceReturn {
	const [records, setRecords] = useState<MaintenanceRecord[]>([]);
	const [incidents, setIncidents] = useState<IncidentReport[]>([]);
	const [schedules, setSchedules] = useState<ScheduledMaintenance[]>([]);
	const [statistics, setStatistics] = useState<Statistics | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleError = useCallback((err: unknown, operation: string) => {
		console.error(`Error in ${operation}:`, err);
		const errorMessage = err instanceof Error ? err.message : `Error en ${operation}`;
		setError(errorMessage);
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	// Maintenance Records Operations
	const getMaintenanceRecords = useCallback(
		async (filters?: MaintenanceRecordFilters) => {
			setLoading(true);
			setError(null);
			try {
				const response = await maintenanceService.getAll(filters);
				setRecords(Array.isArray(response) ? response : response.data || []);
			} catch (err) {
				handleError(err, 'obtener registros de mantenimiento');
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	const createMaintenanceRecord = useCallback(
		async (data: CreateMaintenanceRecord): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				const newRecord = await maintenanceService.create(data);
				setRecords((prev) => [...prev, newRecord]);
				return true;
			} catch (err) {
				handleError(err, 'crear registro de mantenimiento');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	const updateMaintenanceRecord = useCallback(
		async (id: string, data: UpdateMaintenanceRecord): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				const updatedRecord = await maintenanceService.update(id, data);
				setRecords((prev) => prev.map((record) => (record.id === id ? updatedRecord : record)));
				return true;
			} catch (err) {
				handleError(err, 'actualizar registro de mantenimiento');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	const deleteMaintenanceRecord = useCallback(
		async (id: string): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				await maintenanceService.delete(id);
				setRecords((prev) => prev.filter((record) => record.id !== id));
				return true;
			} catch (err) {
				handleError(err, 'eliminar registro de mantenimiento');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	// Incidents Operations
	const getIncidents = useCallback(
		async (filters?: IncidentReportFilters) => {
			setLoading(true);
			setError(null);
			try {
				const data = await maintenanceService.getIncidents(filters);
				setIncidents(Array.isArray(data) ? data : data.data || []);
			} catch (err) {
				handleError(err, 'obtener incidencias');
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	const createIncident = useCallback(
		async (data: CreateIncidentReport): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				const newIncident = await maintenanceService.createIncident(data);
				setIncidents((prev) => [...prev, newIncident]);
				return true;
			} catch (err) {
				handleError(err, 'crear incidencia');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	const updateIncident = useCallback(
		async (id: string, data: UpdateIncidentReport): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				const updatedIncident = await maintenanceService.updateIncident(id, data);
				setIncidents((prev) => prev.map((incident) => (incident.id === id ? updatedIncident : incident)));
				return true;
			} catch (err) {
				handleError(err, 'actualizar incidencia');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	const deleteIncident = useCallback(
		async (id: string): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				await maintenanceService.deleteIncident(id);
				setIncidents((prev) => prev.filter((incident) => incident.id !== id));
				return true;
			} catch (err) {
				handleError(err, 'eliminar incidencia');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	// Scheduled Maintenance Operations
	const getScheduledMaintenance = useCallback(
		async (filters?: ScheduledMaintenanceFilters) => {
			setLoading(true);
			setError(null);
			try {
				const response = await maintenanceService.getScheduledMaintenance(filters);
				setSchedules(Array.isArray(response) ? response : response.data || []);
			} catch (err) {
				handleError(err, 'obtener mantenimientos programados');
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	const createScheduledMaintenance = useCallback(
		async (data: CreateScheduledMaintenance): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				const newSchedule = await maintenanceService.createScheduledMaintenance(data);
				setSchedules((prev) => [...prev, newSchedule]);
				return true;
			} catch (err) {
				handleError(err, 'crear mantenimiento programado');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	const updateScheduledMaintenance = useCallback(
		async (id: string, data: UpdateScheduledMaintenance): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				const updatedSchedule = await maintenanceService.updateScheduledMaintenance(id, data);
				setSchedules((prev) => prev.map((schedule) => (schedule.id === id ? updatedSchedule : schedule)));
				return true;
			} catch (err) {
				handleError(err, 'actualizar mantenimiento programado');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	const deleteScheduledMaintenance = useCallback(
		async (id: string): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				await maintenanceService.deleteScheduledMaintenance(id);
				setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
				return true;
			} catch (err) {
				handleError(err, 'eliminar mantenimiento programado');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	// Statistics Operations
	const getStatistics = useCallback(
		async (filters?: MaintenanceRecordFilters) => {
			setLoading(true);
			setError(null);
			try {
				const data = await maintenanceService.getStatistics(filters);
				setStatistics(data);
			} catch (err) {
				handleError(err, 'obtener estadísticas');
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	// Utility function to refresh all data
	const refreshData = useCallback(async () => {
		await Promise.all([getMaintenanceRecords(), getIncidents(), getScheduledMaintenance(), getStatistics()]);
	}, [getMaintenanceRecords, getIncidents, getScheduledMaintenance, getStatistics]);

	return {
		// State
		maintenanceRecords: records,
		scheduledMaintenance: schedules,
		incidents,
		statistics,
		isLoading: loading,
		error,

		// Maintenance Records
		getMaintenanceRecords,
		createMaintenanceRecord,
		updateMaintenanceRecord,
		deleteMaintenanceRecord,

		// Incidents
		getIncidents,
		createIncident,
		updateIncident,
		deleteIncident,

		// Scheduled Maintenance
		getScheduledMaintenance,
		createScheduledMaintenance,
		updateScheduledMaintenance,
		deleteScheduledMaintenance,

		// Statistics
		getStatistics,

		// Utilities
		clearError,
		refreshData
	};
}
