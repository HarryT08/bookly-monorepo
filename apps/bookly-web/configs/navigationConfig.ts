import { FuseNavItemType } from '../lib/fuse/core/FuseNavigation/types/FuseNavItemType';
import { ROUTES } from '../constants';

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
	{
		id: 'dashboard',
		title: 'Panel Principal',
		translate: 'DASHBOARD',
		type: 'item',
		icon: 'heroicons-outline:home',
		url: ROUTES.DASHBOARD
	},
	{
		id: 'users',
		title: 'Usuarios',
		translate: 'USERS',
		type: 'item',
		icon: 'heroicons-outline:user-group',
		url: ROUTES.USERS
	},
	{
		id: 'roles',
		title: 'Roles',
		translate: 'ROLES',
		type: 'item',
		icon: 'heroicons-outline:users',
		url: ROUTES.ROLES
	},
	{
		id: 'permissions',
		title: 'Permisos',
		translate: 'PERMISSIONS',
		type: 'item',
		icon: 'heroicons-outline:key',
		url: ROUTES.PERMISSIONS
	},
	{
		id: 'resources',
		title: 'Recursos',
		translate: 'RESOURCES',
		type: 'item',
		icon: 'heroicons-outline:cube',
		url: ROUTES.RESOURCES
	},
	{
		id: 'reservations',
		title: 'Reservas',
		translate: 'RESERVATIONS',
		type: 'item',
		icon: 'heroicons-outline:rectangle-group',
		url: ROUTES.RESERVATIONS
	},
	{
		id: 'reports',
		title: 'Reportes',
		translate: 'REPORTS',
		type: 'item',
		icon: 'heroicons-outline:chart-bar',
		url: ROUTES.REPORTS
	},
	{
		id: 'control-panel',
		title: 'Panel de Control',
		translate: 'CONTROL_PANEL',
		type: 'group',
		children: [
			{
				id: 'approvals',
				title: 'Aprobaciones',
				translate: 'APPROVALS',
				type: 'item',
				icon: 'heroicons-outline:clipboard-document-check',
				url: ROUTES.CONTROL_PANEL.APPROVALS
			},
			{
				id: 'surveillance',
				title: 'Vigilancia',
				translate: 'SURVEILLANCE',
				type: 'item',
				icon: 'heroicons-outline:eye',
				url: ROUTES.CONTROL_PANEL.SURVEILLANCE
			},
			{
				id: 'categories',
				title: 'Categorías',
				translate: 'CATEGORIES',
				type: 'item',
				icon: 'heroicons-outline:tag',
				url: ROUTES.CONTROL_PANEL.CATEGORIES
			},
			{
				id: 'import',
				title: 'Importar Datos',
				translate: 'IMPORT',
				type: 'item',
				icon: 'heroicons-outline:arrow-up-tray',
				url: ROUTES.CONTROL_PANEL.IMPORT
			},
			{
				id: 'documents',
				title: 'Documentos',
				translate: 'DOCUMENTS',
				type: 'item',
				icon: 'heroicons-outline:document-text',
				url: ROUTES.CONTROL_PANEL.DOCUMENTS
			},
			{
				id: 'notifications',
				title: 'Notificaciones',
				translate: 'NOTIFICATIONS',
				type: 'item',
				icon: 'heroicons-outline:bell',
				url: ROUTES.CONTROL_PANEL.NOTIFICATIONS
			},
			{
				id: 'maintenance',
				title: 'Mantenimiento',
				translate: 'MAINTENANCE',
				type: 'collapsable',
				icon: 'heroicons-outline:wrench-screwdriver',
				children: [
					{
						id: 'maintenance-incidents',
						title: 'Incidentes',
						translate: 'INCIDENTS',
						type: 'item',
						url: ROUTES.CONTROL_PANEL.MAINTENANCE.INCIDENTS
					},
					{
						id: 'maintenance-schedules',
						title: 'Programación',
						translate: 'SCHEDULES',
						type: 'item',
						url: ROUTES.CONTROL_PANEL.MAINTENANCE.SCHEDULES
					}
				]
			},
			{
				id: 'reassignment',
				title: 'Reasignaciones',
				translate: 'REASSIGNMENT',
				type: 'item',
				icon: 'heroicons-outline:arrow-path-rounded-square',
				url: ROUTES.CONTROL_PANEL.REASSIGNMENT
			}
		]
	},
	{
		id: 'academic-programs',
		title: 'Programas Académicos',
		translate: 'ACADEMIC_PROGRAMS',
		type: 'item',
		icon: 'heroicons-outline:academic-cap',
		url: ROUTES.ACADEMIC_PROGRAMS
	},
	{
		id: 'audits',
		title: 'Auditorías',
		translate: 'AUDITS',
		type: 'item',
		icon: 'heroicons-outline:shield-check',
		url: ROUTES.AUDITS
	},
	{
		id: 'calendar',
		title: 'Calendario',
		translate: 'CALENDAR',
		type: 'item',
		icon: 'heroicons-outline:calendar',
		url: ROUTES.CALENDAR
	},
	{
		id: 'settings',
		title: 'Configuración',
		translate: 'SETTINGS',
		type: 'item',
		icon: 'heroicons-outline:cog-6-tooth',
		url: ROUTES.SETTINGS
	}
];

export default navigationConfig;
