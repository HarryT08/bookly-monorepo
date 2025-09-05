import { Box, FormControlLabel } from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';
import { SettingsCard } from '../SettingsCard';
import { SettingField } from '../../molecules/SettingField';
import { Switch } from '../../atoms/Switch/Switch';
import { SystemSettings } from '../../../types/settings';

interface ReservationSettingsSectionProps {
	settings: SystemSettings;
	onSettingChange: (key: keyof SystemSettings, value: any) => void;
}

export function ReservationSettingsSection({ settings, onSettingChange }: ReservationSettingsSectionProps) {
	return (
		<SettingsCard
			title="Configuración de Reservas"
			icon={<ScheduleIcon />}
			iconColor="success.main"
		>
			<Box
				display="flex"
				flexDirection="column"
				gap={2}
			>
				<SettingField
					type="number"
					label="Días máximos de anticipación"
					description="Máximo de días para crear una reserva"
					value={settings.maxReservationDays}
					onChange={(value) => onSettingChange('maxReservationDays', value)}
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
						<SettingField
							type="number"
							label="Tiempo mínimo (minutos)"
							value={settings.minReservationTime}
							onChange={(value) => onSettingChange('minReservationTime', value)}
							fullWidth
						/>
					</Box>

					<Box
						flex={{ xs: '1 1 100%', sm: '1 1 45%' }}
						minWidth={{ xs: '100%', sm: '45%' }}
					>
						<SettingField
							type="number"
							label="Duración máxima (minutos)"
							value={settings.maxReservationDuration}
							onChange={(value) => onSettingChange('maxReservationDuration', value)}
							fullWidth
						/>
					</Box>
				</Box>

				<FormControlLabel
					control={
						<Switch
							checked={settings.autoApprovalEnabled}
							onChange={(e) => onSettingChange('autoApprovalEnabled', e.target.checked)}
						/>
					}
					label="Aprobación automática de reservas"
				/>
			</Box>
		</SettingsCard>
	);
}

export default ReservationSettingsSection;
