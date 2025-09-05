export interface SystemSettings {
	// General Settings
	systemName: string;
	systemDescription: string;
	defaultLanguage: string;
	timezone: string;

	// Security Settings
	enableTwoFactor: boolean;
	sessionTimeout: number;
	maxLoginAttempts: number;
	passwordExpiration: number;

	// Notification Settings
	emailNotifications: boolean;
	smsNotifications: boolean;
	pushNotifications: boolean;
	notificationLanguage: string;

	// Reservation Settings
	maxReservationDays: number;
	minReservationTime: number;
	maxReservationDuration: number;
	autoApprovalEnabled: boolean;

	// System Settings
	maintenanceMode: boolean;
	debugMode: boolean;
	apiRateLimit: number;
	maxUploadSize: number;
}

export interface SettingsFormProps {
	settings: SystemSettings;
	onSettingChange: (key: keyof SystemSettings, value: string | number | boolean) => void;
	onSave: () => Promise<void>;
}

export interface SettingsDialogProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}
