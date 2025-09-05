import { List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { Notifications as NotificationsIcon, Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import { SettingsCard } from '../SettingsCard';
import { Switch } from '../../atoms';
import { SystemSettings } from '../../../types/settings';

interface NotificationSettingsSectionProps {
	settings: SystemSettings;
	onSettingChange: (key: keyof SystemSettings, value: any) => void;
}

export function NotificationSettingsSection({ settings, onSettingChange }: NotificationSettingsSectionProps) {
	return (
		<SettingsCard
			title="Configuración de Notificaciones"
			icon={<NotificationsIcon />}
			iconColor="info.main"
		>
			<List>
				<ListItem>
					<ListItemIcon>
						<EmailIcon />
					</ListItemIcon>
					<ListItemText primary="Notificaciones por Email" />
					<ListItemSecondaryAction>
						<Switch
							checked={settings.emailNotifications}
							onChange={(e) => onSettingChange('emailNotifications', e.target.checked)}
						/>
					</ListItemSecondaryAction>
				</ListItem>

				<ListItem>
					<ListItemIcon>
						<PhoneIcon />
					</ListItemIcon>
					<ListItemText primary="Notificaciones SMS" />
					<ListItemSecondaryAction>
						<Switch
							checked={settings.smsNotifications}
							onChange={(e) => onSettingChange('smsNotifications', e.target.checked)}
						/>
					</ListItemSecondaryAction>
				</ListItem>

				<ListItem>
					<ListItemIcon>
						<NotificationsIcon />
					</ListItemIcon>
					<ListItemText primary="Notificaciones Push" />
					<ListItemSecondaryAction>
						<Switch
							checked={settings.pushNotifications}
							onChange={(e) => onSettingChange('pushNotifications', e.target.checked)}
						/>
					</ListItemSecondaryAction>
				</ListItem>
			</List>
		</SettingsCard>
	);
}

export default NotificationSettingsSection;
