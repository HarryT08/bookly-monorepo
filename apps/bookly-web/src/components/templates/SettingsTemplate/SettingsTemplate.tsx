import { useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Button } from '../../atoms/Button';
import {
	GeneralSettingsSection,
	SecuritySettingsSection,
	NotificationSettingsSection,
	ReservationSettingsSection,
	SystemSettingsSection,
	SystemActionsSection
} from '../../organisms';
import { SystemSettings } from '../../../types/settings';
import { BackupDialog, UpdateDialog } from '..';

interface SettingsTemplateProps {
	settings: SystemSettings;
	onSettingChange: (key: keyof SystemSettings, value: any) => void;
	onSave: () => Promise<void>;
	saveMessage: string | null;
	isLoading?: boolean;
	onShowMessage: (message: string) => void;
}

export function SettingsTemplate({
	settings,
	onSettingChange,
	onSave,
	saveMessage,
	isLoading = false,
	onShowMessage
}: SettingsTemplateProps) {
	const [backupDialogOpen, setBackupDialogOpen] = useState(false);
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

	const handleBackup = () => {
		setBackupDialogOpen(false);
		onShowMessage('Backup iniciado. Se notificará cuando complete.');
	};

	const handleUpdate = () => {
		setUpdateDialogOpen(false);
		onShowMessage('Actualización iniciada. El sistema se reiniciará automáticamente.');
	};

	const handleClearCache = () => {
		onShowMessage('Cache del sistema limpiado');
	};

	const handleRestart = () => {
		onShowMessage('Sistema reiniciado');
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography
				variant="h4"
				component="h1"
				sx={{ mb: 3 }}
			>
				Configuración del Sistema
			</Typography>

			{saveMessage && (
				<Alert
					severity={saveMessage.includes('Error') ? 'error' : 'success'}
					sx={{ mb: 2 }}
				>
					{saveMessage}
				</Alert>
			)}

			<Box
				display="flex"
				flexWrap="wrap"
				gap={3}
			>
				{/* General Settings */}
				<Box
					flex={{ xs: '1 1 100%', md: '1 1 50%' }}
					minWidth={{ xs: '100%', md: '45%' }}
				>
					<GeneralSettingsSection
						settings={settings}
						onSettingChange={onSettingChange}
					/>
				</Box>

				{/* Security Settings */}
				<Box
					flex={{ xs: '1 1 100%', md: '1 1 50%' }}
					minWidth={{ xs: '100%', md: '45%' }}
				>
					<SecuritySettingsSection
						settings={settings}
						onSettingChange={onSettingChange}
					/>
				</Box>

				{/* Notification Settings */}
				<Box
					flex={{ xs: '1 1 100%', md: '1 1 50%' }}
					minWidth={{ xs: '100%', md: '45%' }}
				>
					<NotificationSettingsSection
						settings={settings}
						onSettingChange={onSettingChange}
					/>
				</Box>

				{/* Reservation Settings */}
				<Box
					flex={{ xs: '1 1 100%', md: '1 1 50%' }}
					minWidth={{ xs: '100%', md: '45%' }}
				>
					<ReservationSettingsSection
						settings={settings}
						onSettingChange={onSettingChange}
					/>
				</Box>

				{/* System Settings */}
				<Box flex={{ xs: '1 1 100%' }}>
					<SystemSettingsSection
						settings={settings}
						onSettingChange={onSettingChange}
					/>
				</Box>

				{/* System Actions */}
				<Box flex={{ xs: '1 1 100%' }}>
					<SystemActionsSection
						onBackup={() => setBackupDialogOpen(true)}
						onUpdate={() => setUpdateDialogOpen(true)}
						onClearCache={handleClearCache}
						onRestart={handleRestart}
					/>
				</Box>
			</Box>

			{/* Save Button */}
			<Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
				<Button
					variant="contained"
					size="large"
					onClick={onSave}
					loading={isLoading}
				>
					Guardar Configuración
				</Button>
			</Box>

			{/* Backup Dialog */}
			<BackupDialog
				open={backupDialogOpen}
				onClose={() => setBackupDialogOpen(false)}
				onConfirm={handleBackup}
			/>

			{/* Update Dialog */}
			<UpdateDialog
				open={updateDialogOpen}
				onClose={() => setUpdateDialogOpen(false)}
				onConfirm={handleUpdate}
			/>
		</Box>
	);
}

export default SettingsTemplate;
