import { List, ListItem, ListItemText, ListItemSecondaryAction, TextField } from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import { SettingsCard } from '../SettingsCard';
import { Switch } from '../../atoms';
import { SystemSettings } from '../../../types/settings';

interface SecuritySettingsSectionProps {
	settings: SystemSettings;
	onSettingChange: (key: keyof SystemSettings, value: any) => void;
}

export function SecuritySettingsSection({ settings, onSettingChange }: SecuritySettingsSectionProps) {
	return (
		<SettingsCard
			title="Configuración de Seguridad"
			icon={<SecurityIcon />}
			iconColor="error.main"
		>
			<List>
				<ListItem>
					<ListItemText
						primary="Autenticación de Dos Factores"
						secondary="Requiere verificación adicional para el login"
					/>
					<ListItemSecondaryAction>
						<Switch
							checked={settings.enableTwoFactor}
							onChange={(e) => onSettingChange('enableTwoFactor', e.target.checked)}
						/>
					</ListItemSecondaryAction>
				</ListItem>

				<ListItem>
					<ListItemText
						primary="Tiempo de Sesión (minutos)"
						secondary={`Sesiones expirarán en ${settings.sessionTimeout} minutos`}
					/>
					<ListItemSecondaryAction>
						<TextField
							size="small"
							type="number"
							value={settings.sessionTimeout}
							onChange={(e) => onSettingChange('sessionTimeout', parseInt(e.target.value))}
							sx={{ width: 80 }}
						/>
					</ListItemSecondaryAction>
				</ListItem>

				<ListItem>
					<ListItemText
						primary="Intentos de Login Máximos"
						secondary="Bloquear cuenta después de intentos fallidos"
					/>
					<ListItemSecondaryAction>
						<TextField
							size="small"
							type="number"
							value={settings.maxLoginAttempts}
							onChange={(e) => onSettingChange('maxLoginAttempts', parseInt(e.target.value))}
							sx={{ width: 80 }}
						/>
					</ListItemSecondaryAction>
				</ListItem>
			</List>
		</SettingsCard>
	);
}

export default SecuritySettingsSection;
