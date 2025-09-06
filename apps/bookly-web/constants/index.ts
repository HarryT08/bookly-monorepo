// Application Constants
export const APP_CONFIG = {
	NAME: 'Bookly',
	VERSION: '1.0.0',
	DESCRIPTION: 'Sistema de Reservas Institucionales',
	COMPANY: 'UFPS',
	SUPPORT_EMAIL: 'soporte@ufps.edu.co',
	DOCUMENTATION_URL: 'https://docs.bookly.ufps.edu.co'
} as const;

// API Configuration
export const API_CONFIG = {
	BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
	VERSION: 'v1',
	TIMEOUT: 10000,
	RETRY_ATTEMPTS: 3,
	RETRY_DELAY: 1000
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
	TOKEN_KEY: 'auth_token',
	REFRESH_TOKEN_KEY: 'refresh_token',
	USER_KEY: 'user_data',
	SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
	REMEMBER_ME_TIMEOUT: 30 * 24 * 60 * 60 * 1000, // 30 days
	SSO_GOOGLE_URL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001',
	REDIRECT_AFTER_LOGIN: '/dashboard',
	REDIRECT_AFTER_LOGOUT: '/sign-in'
} as const;

// UI Configuration
export const UI_CONFIG = {
	DEFAULT_LANGUAGE: 'es',
	SUPPORTED_LANGUAGES: ['es', 'en'] as const,
	DEFAULT_THEME: 'light',
	SUPPORTED_THEMES: ['light', 'dark', 'auto'] as const,
	PAGINATION: {
		DEFAULT_PAGE_SIZE: 10,
		PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100] as const,
		MAX_PAGE_SIZE: 100
	},
	SEARCH: {
		MIN_SEARCH_LENGTH: 2,
		DEBOUNCE_DELAY: 300
	},
	NOTIFICATIONS: {
		AUTO_HIDE_DURATION: {
			SUCCESS: 3000,
			INFO: 4000,
			WARNING: 4000,
			ERROR: 5000
		},
		MAX_NOTIFICATIONS: 5
	}
} as const;

// Routes Configuration
export const ROUTES = {
	// Public Routes
	HOME: '/',
	SIGN_IN: '/sign-in',
	SIGN_UP: '/sign-up',
	FORGOT_PASSWORD: '/forgot-password',
	RESET_PASSWORD: '/reset-password',

	// Main Routes
	DASHBOARD: '/dashboard',
	USERS: '/users',
	ROLES: '/roles',
	PERMISSIONS: '/permissions',
	RESOURCES: '/resources',
	RESERVATIONS: '/reservations',
	REPORTS: '/reports',
	ACADEMIC_PROGRAMS: '/academic-programs',
	AUDITS: '/audits',
	CALENDAR: '/calendar',
	SETTINGS: '/settings',

	// Control Panel Routes
	CONTROL_PANEL: {
		BASE: '/control-panel',
		APPROVALS: '/control-panel/approvals',
		SURVEILLANCE: '/control-panel/surveillance',
		NOTIFICATIONS: '/control-panel/notifications',
		MAINTENANCE: {
			BASE: '/control-panel/maintenance',
			INCIDENTS: '/control-panel/maintenance/incidents',
			SCHEDULES: '/control-panel/maintenance/schedules'
		},
		CATEGORIES: '/control-panel/categories',
		DOCUMENTS: '/control-panel/documents',
		IMPORT: '/control-panel/import',
		REASSIGNMENT: '/control-panel/reassignment'
	}
} as const;

// Business Rules
export const BUSINESS_RULES = {
	RESERVATIONS: {
		MIN_DURATION_MINUTES: 30,
		MAX_DURATION_HOURS: 8,
		MAX_ADVANCE_DAYS: 60,
		MIN_CANCELLATION_HOURS: 2
	},
	RESOURCES: {
		MIN_CAPACITY: 1,
		MAX_CAPACITY: 1000,
		DEFAULT_CAPACITY: 20
	},
	MAINTENANCE: {
		TYPES: {
			PREVENTIVO: 'PREVENTIVO',
			CORRECTIVO: 'CORRECTIVO',
			EMERGENCIA: 'EMERGENCIA',
			LIMPIEZA: 'LIMPIEZA'
		} as const,
		PRIORITY_LEVELS: {
			LOW: 'BAJA',
			MEDIUM: 'MEDIA',
			HIGH: 'ALTA',
			CRITICAL: 'CRITICA'
		} as const
	},
	APPROVAL: {
		STATUSES: {
			PENDING: 'PENDIENTE',
			APPROVED: 'APROBADO',
			REJECTED: 'RECHAZADO',
			EXPIRED: 'VENCIDO'
		} as const,
		AUTO_EXPIRE_HOURS: 72
	}
} as const;

// File Upload Configuration
export const FILE_CONFIG = {
	MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
	ALLOWED_EXTENSIONS: {
		IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
		DOCUMENTS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
		IMPORT: ['.csv', '.xlsx']
	},
	UPLOAD_PATHS: {
		RESOURCES: '/uploads/resources',
		DOCUMENTS: '/uploads/documents',
		IMPORTS: '/uploads/imports',
		AVATARS: '/uploads/avatars'
	}
} as const;

// Error Codes
export const ERROR_CODES = {
	// Authentication Errors
	AUTH_INVALID_CREDENTIALS: 'AUTH-0001',
	AUTH_TOKEN_EXPIRED: 'AUTH-0002',
	AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH-0003',
	AUTH_ACCOUNT_LOCKED: 'AUTH-0004',
	AUTH_EMAIL_NOT_VERIFIED: 'AUTH-0005',

	// Resource Errors
	RESOURCE_NOT_FOUND: 'RSRC-0001',
	RESOURCE_ALREADY_RESERVED: 'RSRC-0002',
	RESOURCE_UNDER_MAINTENANCE: 'RSRC-0003',
	RESOURCE_ACCESS_DENIED: 'RSRC-0004',
	RESOURCE_CAPACITY_EXCEEDED: 'RSRC-0005',

	// Validation Errors
	VALIDATION_REQUIRED_FIELD: 'VAL-0001',
	VALIDATION_INVALID_FORMAT: 'VAL-0002',
	VALIDATION_OUT_OF_RANGE: 'VAL-0003',
	VALIDATION_DUPLICATE_VALUE: 'VAL-0004',

	// System Errors
	SYSTEM_DATABASE_ERROR: 'SYS-0001',
	SYSTEM_NETWORK_ERROR: 'SYS-0002',
	SYSTEM_TIMEOUT: 'SYS-0003',
	SYSTEM_MAINTENANCE: 'SYS-0004'
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
	AUTH_TOKEN: AUTH_CONFIG.TOKEN_KEY,
	REFRESH_TOKEN: AUTH_CONFIG.REFRESH_TOKEN_KEY,
	USER_DATA: AUTH_CONFIG.USER_KEY,
	THEME: 'bookly_theme',
	LANGUAGE: 'bookly_language',
	SIDEBAR_COLLAPSED: 'bookly_sidebar_collapsed',
	TABLE_PREFERENCES: 'bookly_table_preferences',
	SEARCH_HISTORY: 'bookly_search_history'
} as const;

// Date/Time Formats
export const DATE_FORMATS = {
	DISPLAY: 'DD/MM/YYYY',
	DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
	ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
	TIME_ONLY: 'HH:mm',
	MONTH_YEAR: 'MM/YYYY',
	SHORT_DATE: 'DD/MM/YY'
} as const;

// Status Colors
export const STATUS_COLORS = {
	SUCCESS: '#4CAF50',
	ERROR: '#F44336',
	WARNING: '#FF9800',
	INFO: '#2196F3',
	PENDING: '#FFC107',
	APPROVED: '#8BC34A',
	REJECTED: '#F44336',
	ACTIVE: '#4CAF50',
	INACTIVE: '#9E9E9E'
} as const;

export default {
	APP_CONFIG,
	API_CONFIG,
	AUTH_CONFIG,
	UI_CONFIG,
	ROUTES,
	BUSINESS_RULES,
	FILE_CONFIG,
	ERROR_CODES,
	STORAGE_KEYS,
	DATE_FORMATS,
	STATUS_COLORS
};
