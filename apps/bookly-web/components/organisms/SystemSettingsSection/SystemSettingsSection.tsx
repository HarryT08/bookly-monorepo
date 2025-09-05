import { Box, FormControlLabel, Chip } from '@mui/material';
import { Storage as StorageIcon } from '@mui/icons-material';
import { SettingsCard } from '../SettingsCard';
import { SettingField } from '../../molecules/SettingField';
import { Switch } from '../../atoms';
import { SystemSettings } from '../../../types/settings';

interface SystemSettingsSectionProps {
	settings: SystemSettings;
	onSettingChange: (key: keyof SystemSettings, value: any) => void;
}

export function SystemSettingsSection({ settings, onSettingChange }: SystemSettingsSectionProps) {
	return (
		<SettingsCard
			title="Configuración del Sistema"
			icon={<StorageIcon />}
			iconColor="warning.main"
		>
			<Box
				display="flex"
				flexWrap="wrap"
				gap={2}
			>
				<Box
					flex={{ xs: '1 1 100%', md: '1 1 25%' }}
					minWidth={{ xs: '100%', md: '20%' }}
				>
					<FormControlLabel
						control={
							<Switch
								checked={settings.maintenanceMode}
								onChange={(e) => onSettingChange('maintenanceMode', e.target.checked)}
							/>
						}
						label="Modo Mantenimiento"
					/>
					{settings.maintenanceMode && (
						<Chip
							size="small"
							color="warning"
							label="Sistema en mantenimiento"
							sx={{ mt: 1, display: 'block' }}
						/>
					)}
				</Box>

				<Box
					flex={{ xs: '1 1 100%', md: '1 1 25%' }}
					minWidth={{ xs: '100%', md: '20%' }}
				>
					<FormControlLabel
						control={
							<Switch
								checked={settings.debugMode}
								onChange={(e) => onSettingChange('debugMode', e.target.checked)}
							/>
						}
						label="Modo Debug"
					/>
				</Box>

				<Box
					flex={{ xs: '1 1 100%', md: '1 1 25%' }}
					minWidth={{ xs: '100%', md: '20%' }}
				>
					<SettingField
						type="number"
						label="Límite API (req/min)"
						value={settings.apiRateLimit}
						onChange={(value) => onSettingChange('apiRateLimit', value)}
						fullWidth
					/>
				</Box>

				<Box
					flex={{ xs: '1 1 100%', md: '1 1 25%' }}
					minWidth={{ xs: '100%', md: '20%' }}
				>
					<SettingField
						type="number"
						label="Tamaño máximo (MB)"
						value={settings.maxUploadSize}
						onChange={(value) => onSettingChange('maxUploadSize', value)}
						fullWidth
					/>
				</Box>
			</Box>
		</SettingsCard>
	);
}

export default SystemSettingsSection;
