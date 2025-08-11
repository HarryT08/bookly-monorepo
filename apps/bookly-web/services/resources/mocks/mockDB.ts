import { ResourceResponseDto } from '../types';

export const MOCK_RESOURCES: ResourceResponseDto[] = [
	{
		id: 'res_001',
		name: 'Laboratorio de Computo 1',
		code: 'LAB-CMP-01',
		description: 'Laboratorio equipado con 30 PCs para clases de programación.',
		type: 'LABORATORY',
		capacity: 30,
		location: { building: 'Bloque A', floor: '2', room: 'A-201' },
		status: 'AVAILABLE',
		attributes: { projectors: 1, whiteboard: true },
		availableSchedules: {
			operatingHours: {
				weekly: [
					{ dayOfWeek: 1, start: '08:00', end: '12:00' },
					{ dayOfWeek: 1, start: '14:00', end: '18:00' },
					{ dayOfWeek: 3, start: '08:00', end: '12:00' },
					{ dayOfWeek: 3, start: '14:00', end: '18:00' },
					{ dayOfWeek: 5, start: '08:00', end: '12:00' }
				]
			},
			restrictions: [{ kind: 'holiday', date: '2025-08-15' }],
			priorities: [{ audience: 'faculty', level: 2 }]
		},
		categoryId: 'cat_labs',
		isActive: true,
		createdAt: '2025-07-01T10:00:00.000Z',
		updatedAt: '2025-08-01T12:00:00.000Z'
	},
	{
		id: 'res_002',
		name: 'Auditorio Principal',
		code: 'AUD-PRN-01',
		description: 'Auditorio con capacidad para 250 personas.',
		type: 'AUDITORIUM',
		capacity: 250,
		location: { building: 'Bloque Central', floor: '1', room: 'AU-1' },
		status: 'MAINTENANCE',
		attributes: { sound: 'Dolby 5.1', screen: '200in' },
		availableSchedules: {
			operatingHours: {
				weekly: [
					{ dayOfWeek: 2, start: '09:00', end: '17:00' },
					{ dayOfWeek: 4, start: '09:00', end: '17:00' }
				]
			},
			restrictions: [{ kind: 'maintenance', dayOfWeek: 2, start: '12:00', end: '13:00' }],
			priorities: [{ audience: 'events', level: 3 }]
		},
		categoryId: 'cat_aud',
		isActive: true,
		createdAt: '2025-06-15T09:00:00.000Z',
		updatedAt: '2025-07-30T16:30:00.000Z'
	},
	{
		id: 'res_003',
		name: 'Sala de Reuniones Norte',
		code: 'SAL-REU-N',
		description: 'Sala para reuniones de 12 personas con TV.',
		type: 'ROOM',
		capacity: 12,
		location: { building: 'Bloque B', floor: '3', room: 'B-305' },
		status: 'AVAILABLE',
		attributes: { tv: true, conference_camera: true },
		availableSchedules: {
			operatingHours: {
				weekly: [
					{ dayOfWeek: 1, start: '08:00', end: '12:00' },
					{ dayOfWeek: 2, start: '08:00', end: '12:00' },
					{ dayOfWeek: 4, start: '14:00', end: '18:00' }
				]
			},
			restrictions: [{ kind: 'blocked', date: '2025-07-10' }],
			priorities: [{ audience: 'students', level: 1 }]
		},
		categoryId: 'cat_rooms',
		isActive: true,
		createdAt: '2025-05-20T08:15:00.000Z',
		updatedAt: '2025-07-22T14:45:00.000Z'
	},
	{
		id: 'res_004',
		name: 'Microscopio Electrónico',
		code: 'EQP-MIC-01',
		description: 'Equipo de alta precisión para investigaciones.',
		type: 'EQUIPMENT',
		capacity: 1,
		location: { building: 'Centro de Investigación', floor: 'S1', room: 'CI-07' },
		status: 'RESERVED',
		attributes: { supervisor_required: true },
		availableSchedules: {
			operatingHours: {
				weekly: [
					{ dayOfWeek: 2, start: '10:00', end: '12:00' },
					{ dayOfWeek: 5, start: '10:00', end: '12:00' }
				]
			},
			restrictions: [{ kind: 'supervision_required' }],
			priorities: [{ audience: 'research', level: 4 }]
		},
		categoryId: 'cat_equip',
		isActive: true,
		createdAt: '2025-05-05T11:30:00.000Z',
		updatedAt: '2025-08-02T09:20:00.000Z'
	},
	{
		id: 'res_005',
		name: 'Sala de Estudio 2',
		code: 'SAL-EST-02',
		description: 'Sala silenciosa para grupos pequeños.',
		type: 'ROOM',
		capacity: 6,
		location: { building: 'Biblioteca', floor: '2', room: 'BI-204' },
		status: 'AVAILABLE',
		attributes: { whiteboard: true },
		availableSchedules: {
			operatingHours: {
				weekly: [
					{ dayOfWeek: 1, start: '08:00', end: '12:00' },
					{ dayOfWeek: 3, start: '08:00', end: '12:00' },
					{ dayOfWeek: 5, start: '08:00', end: '12:00' }
				]
			},
			restrictions: [],
			priorities: [{ audience: 'library', level: 1 }]
		},
		categoryId: 'cat_rooms',
		isActive: false,
		createdAt: '2025-04-10T10:10:00.000Z',
		updatedAt: '2025-06-01T10:10:00.000Z'
	},
	{
		id: 'res_006',
		name: 'Laboratorio de Química',
		code: 'LAB-QUI-01',
		description: 'Laboratorio con seguridad certificada.',
		type: 'LABORATORY',
		capacity: 24,
		location: { building: 'Bloque C', floor: '1', room: 'C-110' },
		status: 'OUT_OF_SERVICE',
		attributes: { hood: 4, safety_level: 'B' },
		availableSchedules: {
			operatingHours: {
				weekly: [
					{ dayOfWeek: 1, start: '07:00', end: '11:00' },
					{ dayOfWeek: 2, start: '07:00', end: '11:00' },
					{ dayOfWeek: 4, start: '13:00', end: '17:00' }
				]
			},
			restrictions: [{ kind: 'safety_check', dayOfWeek: 4, start: '11:00', end: '13:00' }],
			priorities: [{ audience: 'lab_classes', level: 2 }]
		},
		categoryId: 'cat_labs',
		isActive: true,
		createdAt: '2025-03-01T07:00:00.000Z',
		updatedAt: '2025-07-10T07:00:00.000Z'
	},
	{
		id: 'res_007',
		name: 'Auditorio Secundario',
		code: 'AUD-SEC-01',
		description: 'Capacidad para 120 personas.',
		type: 'AUDITORIUM',
		capacity: 120,
		location: { building: 'Bloque D', floor: '1', room: 'D-101' },
		status: 'AVAILABLE',
		attributes: { screen: '150in' },
		availableSchedules: {
			operatingHours: {
				weekly: [
					{ dayOfWeek: 1, start: '09:00', end: '13:00' },
					{ dayOfWeek: 3, start: '09:00', end: '13:00' }
				]
			},
			restrictions: [],
			priorities: [{ audience: 'talks', level: 2 }]
		},
		categoryId: 'cat_aud',
		isActive: true,
		createdAt: '2025-02-14T12:00:00.000Z',
		updatedAt: '2025-05-14T12:00:00.000Z'
	},
	{
		id: 'res_008',
		name: 'Carro de Portátiles',
		code: 'EQP-LAP-01',
		description: 'Carro con 20 portátiles para préstamo.',
		type: 'EQUIPMENT',
		capacity: 20,
		location: { building: 'Biblioteca', floor: '1', room: 'BI-105' },
		status: 'AVAILABLE',
		attributes: { brand: 'Dell', model: 'Latitude' },
		availableSchedules: {
			operatingHours: {
				weekly: [
					{ dayOfWeek: 1, start: '08:00', end: '16:00' },
					{ dayOfWeek: 2, start: '08:00', end: '16:00' },
					{ dayOfWeek: 3, start: '08:00', end: '16:00' },
					{ dayOfWeek: 4, start: '08:00', end: '16:00' },
					{ dayOfWeek: 5, start: '08:00', end: '16:00' }
				]
			},
			restrictions: [{ kind: 'inventory_check', dayOfWeek: 5, start: '16:00', end: '17:00' }],
			priorities: [{ audience: 'checkouts', level: 1 }]
		},
		categoryId: 'cat_equip',
		isActive: true,
		createdAt: '2025-01-10T09:00:00.000Z',
		updatedAt: '2025-07-01T09:00:00.000Z'
	},
	{
		id: 'res_009',
		name: 'Sala de Conferencias Sur',
		code: 'SAL-CON-S',
		description: 'Sala con sistema de videoconferencia.',
		type: 'ROOM',
		capacity: 20,
		location: { building: 'Bloque E', floor: '4', room: 'E-401' },
		status: 'RESERVED',
		attributes: { zoom_room: true },
		availableSchedules: {
			operatingHours: {
				weekly: [
					{ dayOfWeek: 2, start: '14:00', end: '18:00' },
					{ dayOfWeek: 4, start: '14:00', end: '18:00' }
				]
			},
			restrictions: [{ kind: 'reservation_conflict_window', minutes: 15 }],
			priorities: [{ audience: 'meetings', level: 2 }]
		},
		categoryId: 'cat_rooms',
		isActive: true,
		createdAt: '2025-03-21T15:45:00.000Z',
		updatedAt: '2025-06-20T11:25:00.000Z'
	},
	{
		id: 'res_010',
		name: 'Laboratorio de Electrónica',
		code: 'LAB-ELC-01',
		description: 'Laboratorio con estaciones de soldadura y osciloscopios.',
		type: 'LABORATORY',
		capacity: 18,
		location: { building: 'Bloque F', floor: '2', room: 'F-205' },
		status: 'AVAILABLE',
		attributes: { oscilloscopes: 6 },
		availableSchedules: {
			operatingHours: {
				weekly: [
					{ dayOfWeek: 1, start: '08:00', end: '12:00' },
					{ dayOfWeek: 1, start: '14:00', end: '18:00' },
					{ dayOfWeek: 3, start: '08:00', end: '12:00' }
				]
			},
			restrictions: [{ kind: 'equipment_calibration', date: '2025-07-02' }],
			priorities: [{ audience: 'lab_sessions', level: 3 }]
		},
		categoryId: 'cat_labs',
		isActive: true,
		createdAt: '2025-06-01T10:30:00.000Z',
		updatedAt: '2025-07-05T10:30:00.000Z'
	},
	{
		id: 'res_011',
		name: 'Proyector 4K',
		code: 'EQP-PRJ-4K',
		description: 'Proyector de alta resolución para eventos.',
		type: 'EQUIPMENT',
		capacity: 1,
		location: { building: 'Bloque Logística', floor: 'PB', room: 'LG-02' },
		status: 'AVAILABLE',
		attributes: { resolution: '4K', brightness: '3500lm' },
		availableSchedules: {
			operatingHours: {
				weekly: [
					{ dayOfWeek: 1, start: '08:00', end: '10:00' },
					{ dayOfWeek: 3, start: '08:00', end: '10:00' },
					{ dayOfWeek: 5, start: '08:00', end: '10:00' }
				]
			},
			restrictions: [{ kind: 'cooldown', minutes: 30 }],
			priorities: [{ audience: 'events', level: 2 }]
		},
		categoryId: 'cat_equip',
		isActive: true,
		createdAt: '2025-05-12T13:20:00.000Z',
		updatedAt: '2025-07-12T13:20:00.000Z'
	},
	{
		id: 'res_012',
		name: 'Sala de Innovación',
		code: 'SAL-INV-01',
		description: 'Espacio flexible para workshops y design sprints.',
		type: 'ROOM',
		capacity: 25,
		location: { building: 'Bloque Innovación', floor: '1', room: 'IN-101' },
		status: 'AVAILABLE',
		attributes: { movable_furniture: true },
		availableSchedules: {
			operatingHours: {
				weekly: [
					{ dayOfWeek: 2, start: '08:00', end: '12:00' },
					{ dayOfWeek: 2, start: '14:00', end: '18:00' },
					{ dayOfWeek: 5, start: '08:00', end: '12:00' }
				]
			},
			restrictions: [{ kind: 'setup_time', minutes: 15 }],
			priorities: [{ audience: 'workshops', level: 2 }]
		},
		categoryId: 'cat_rooms',
		isActive: true,
		createdAt: '2025-07-20T08:00:00.000Z',
		updatedAt: '2025-08-01T08:00:00.000Z'
	}
];
