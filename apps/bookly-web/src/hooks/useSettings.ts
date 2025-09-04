import { useState } from 'react';
import { SystemSettings } from '../types/settings';

export function useSettings() {
	const [settings, setSettings] = useState<SystemSettings>({
		// General Settings
		systemName: 'Bookly - UFPS',
		systemDescription: 'Sistema de Reservas Institucionales',
		defaultLanguage: 'es',
		timezone: 'America/Bogota',

		// Security Settings
		enableTwoFactor: false,
		sessionTimeout: 30,
		maxLoginAttempts: 5,
		passwordExpiration: 90,

		// Notification Settings
		emailNotifications: true,
		smsNotifications: false,
		pushNotifications: true,
		notificationLanguage: 'es',

		// Reservation Settings
		maxReservationDays: 30,
		minReservationTime: 30,
		maxReservationDuration: 480,
		autoApprovalEnabled: false,

		// System Settings
		maintenanceMode: false,
		debugMode: false,
		apiRateLimit: 100,
		maxUploadSize: 10
	});

	const [saveMessage, setSaveMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSettingChange = (key: keyof SystemSettings, value: any) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setSaveMessage('Configuración guardada exitosamente');
			setTimeout(() => setSaveMessage(null), 3000);
		} catch (error) {
			setSaveMessage('Error al guardar la configuración');
			setTimeout(() => setSaveMessage(null), 3000);
		} finally {
			setIsLoading(false);
		}
	};

	const showMessage = (message: string) => {
		setSaveMessage(message);
		setTimeout(() => setSaveMessage(null), 3000);
	};

	return {
		settings,
		saveMessage,
		isLoading,
		handleSettingChange,
		handleSave,
		showMessage
	};
}
