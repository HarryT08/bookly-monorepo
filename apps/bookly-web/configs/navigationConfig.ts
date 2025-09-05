import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
	{
		id: 'users',
		title: 'Usuarios',
		translate: 'USERS',
		type: 'item',
		icon: 'heroicons-outline:user-group',
		url: '/users'
	},
	{
		id: 'roles',
		title: 'Roles',
		translate: 'ROLES',
		type: 'item',
		icon: 'heroicons-outline:users',
		url: '/roles'
	},
	{
		id: 'permissions',
		title: 'Permisos',
		translate: 'PERMISSIONS',
		type: 'item',
		icon: 'heroicons-outline:key',
		url: '/permissions'
	},
	{
		id: 'resources',
		title: 'Recursos',
		translate: 'RESOURCES',
		type: 'item',
		icon: 'heroicons-outline:cube',
		url: '/resources'
	},
	{
		id: 'reservations',
		title: 'Reservas',
		translate: 'RESERVATIONS',
		type: 'item',
		icon: 'heroicons-outline:rectangle-group',
		url: '/reservations'
	},
	{
		id: 'reports',
		title: 'Reportes',
		translate: 'REPORTS',
		type: 'item',
		icon: 'heroicons-outline:chart-bar',
		url: '/reports'
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
				url: '/control-panel/approvals'
			},
			{
				id: 'surveillance',
				title: 'Vigilancia',
				translate: 'SURVEILLANCE',
				type: 'item',
				icon: 'heroicons-outline:eye',
				url: '/control-panel/surveillance'
			},
			{
				id: 'notifications',
				title: 'Notificaciones',
				translate: 'NOTIFICATIONS',
				type: 'item',
				icon: 'heroicons-outline:bell',
				url: '/control-panel/notifications'
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
						url: '/control-panel/maintenance/incidents'
					},
					{
						id: 'maintenance-schedules',
						title: 'Programación',
						translate: 'SCHEDULES',
						type: 'item',
						url: '/control-panel/maintenance/schedules'
					}
				]
			}
		]
	},
	{
		id: 'academic-programs',
		title: 'Programas Académicos',
		translate: 'ACADEMIC_PROGRAMS',
		type: 'item',
		icon: 'heroicons-outline:academic-cap',
		url: '/academic-programs'
	},
	{
		id: 'audits',
		title: 'Auditorías',
		translate: 'AUDITS',
		type: 'item',
		icon: 'heroicons-outline:document-text',
		url: '/audits'
	},
	{
		id: 'calendar',
		title: 'Calendario',
		translate: 'CALENDAR',
		type: 'item',
		icon: 'heroicons-outline:calendar',
		url: '/calendar'
	},
	{
		id: 'settings',
		title: 'Configuración',
		translate: 'SETTINGS',
		type: 'item',
		icon: 'heroicons-outline:cog',
		url: '/settings'
	}
];

export default navigationConfig;
