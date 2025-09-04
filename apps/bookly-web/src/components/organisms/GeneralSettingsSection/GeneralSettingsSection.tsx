import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { SettingsCard } from '../SettingsCard';
import { SettingField } from '../../molecules/SettingField';
import { SystemSettings } from '../../../types/settings';

interface GeneralSettingsSectionProps {
	settings: SystemSettings;
	onSettingChange: (key: keyof SystemSettings, value: any) => void;
}

export function GeneralSettingsSection({ settings, onSettingChange }: GeneralSettingsSectionProps) {
	return (
		<SettingsCard
			title="Configuración General"
			icon={<InfoIcon />}
			iconColor="primary.main"
		>
			<Box
				display="flex"
				flexDirection="column"
				gap={2}
			>
				<SettingField
					type="text"
					label="Nombre del Sistema"
					value={settings.systemName}
					onChange={(value) => onSettingChange('systemName', value)}
				/>

				<SettingField
					type="textarea"
					label="Descripción"
					value={settings.systemDescription}
					onChange={(value) => onSettingChange('systemDescription', value)}
					rows={2}
				/>

				<Box
					display="flex"
					flexWrap="wrap"
					gap={2}
				>
					<Box
						flex={{ xs: '1 1 100%', sm: '1 1 45%' }}
						minWidth={{ xs: '100%', sm: '45%' }}
					>
						<FormControl fullWidth>
							<InputLabel>Idioma por Defecto</InputLabel>
							<Select
								value={settings.defaultLanguage}
								label="Idioma por Defecto"
								onChange={(e) => onSettingChange('defaultLanguage', e.target.value)}
							>
								<MenuItem value="es">Español</MenuItem>
								<MenuItem value="en">English</MenuItem>
							</Select>
						</FormControl>
					</Box>

					<Box
						flex={{ xs: '1 1 100%', sm: '1 1 45%' }}
						minWidth={{ xs: '100%', sm: '45%' }}
					>
						<FormControl fullWidth>
							<InputLabel>Zona Horaria</InputLabel>
							<Select
								value={settings.timezone}
								label="Zona Horaria"
								onChange={(e) => onSettingChange('timezone', e.target.value)}
							>
								<MenuItem value="America/Bogota">Colombia (UTC-5)</MenuItem>
								<MenuItem value="America/New_York">New York (UTC-5)</MenuItem>
								<MenuItem value="Europe/Madrid">Madrid (UTC+1)</MenuItem>
							</Select>
						</FormControl>
					</Box>
				</Box>
			</Box>
		</SettingsCard>
	);
}

export default GeneralSettingsSection;
