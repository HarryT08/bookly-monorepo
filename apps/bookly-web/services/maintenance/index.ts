export * from './types';
export * from './maintenance-records';
export * from './incident-reports';
export * from './scheduled-maintenance';

// Combined maintenance service
import { maintenanceRecordsApi } from './maintenance-records';
import { incidentReportsApi } from './incident-reports';
import { scheduledMaintenanceApi } from './scheduled-maintenance';

export const maintenanceService = {
	// Maintenance Records
	getAll: maintenanceRecordsApi.getAll,
	getById: maintenanceRecordsApi.getById,
	create: maintenanceRecordsApi.create,
	update: maintenanceRecordsApi.update,
	delete: maintenanceRecordsApi.delete,
	getByResource: maintenanceRecordsApi.getByResource,
	getStatistics: maintenanceRecordsApi.getStatistics,

	// Incidents
	getIncidents: incidentReportsApi.getAll,
	createIncident: incidentReportsApi.create,
	updateIncident: incidentReportsApi.update,
	deleteIncident: incidentReportsApi.delete,

	// Scheduled Maintenance
	getScheduledMaintenance: scheduledMaintenanceApi.getAll,
	createScheduledMaintenance: scheduledMaintenanceApi.create,
	updateScheduledMaintenance: scheduledMaintenanceApi.update,
	deleteScheduledMaintenance: scheduledMaintenanceApi.delete
};
