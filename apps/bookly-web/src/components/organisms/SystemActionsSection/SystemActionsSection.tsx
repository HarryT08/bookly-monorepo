import { Box } from '@mui/material';
import { Backup as BackupIcon, Update as UpdateIcon } from '@mui/icons-material';
import { SettingsCard } from '../SettingsCard';
import { Button } from '../../atoms/Button';

interface SystemActionsSectionProps {
	onBackup: () => void;
	onUpdate: () => void;
	onClearCache: () => void;
	onRestart: () => void;
}

export function SystemActionsSection({ onBackup, onUpdate, onClearCache, onRestart }: SystemActionsSectionProps) {
	return (
		<SettingsCard
			title="Acciones del Sistema"
			icon={<BackupIcon />}
			iconColor="secondary.main"
		>
			<Box
				display="flex"
				flexWrap="wrap"
				gap={2}
			>
				<Box
					flex={{ xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' }}
					minWidth={{ xs: '100%', sm: '45%', md: '20%' }}
				>
					<Button
						fullWidth
						variant="outlined"
						startIcon={<BackupIcon />}
						onClick={onBackup}
					>
						Crear Backup
					</Button>
				</Box>

				<Box
					flex={{ xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' }}
					minWidth={{ xs: '100%', sm: '45%', md: '20%' }}
				>
					<Button
						fullWidth
						variant="outlined"
						startIcon={<UpdateIcon />}
						onClick={onUpdate}
					>
						Actualizar Sistema
					</Button>
				</Box>

				<Box
					flex={{ xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' }}
					minWidth={{ xs: '100%', sm: '45%', md: '20%' }}
				>
					<Button
						fullWidth
						variant="outlined"
						color="warning"
						onClick={onClearCache}
					>
						Limpiar Cache
					</Button>
				</Box>

				<Box
					flex={{ xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' }}
					minWidth={{ xs: '100%', sm: '45%', md: '20%' }}
				>
					<Button
						fullWidth
						variant="outlined"
						color="error"
						onClick={onRestart}
					>
						Reiniciar Sistema
					</Button>
				</Box>
			</Box>
		</SettingsCard>
	);
}

export default SystemActionsSection;
