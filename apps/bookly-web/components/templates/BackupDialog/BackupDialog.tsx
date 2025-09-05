import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Alert } from '@mui/material';
import { Button } from '../../atoms/Button';

interface BackupDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

export function BackupDialog({ open, onClose, onConfirm }: BackupDialogProps) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
		>
			<DialogTitle>Crear Backup del Sistema</DialogTitle>
			<DialogContent>
				<Typography sx={{ mb: 2 }}>¿Está seguro que desea crear un backup completo del sistema?</Typography>
				<Alert severity="info">
					El proceso puede tomar varios minutos e incluirá:
					<ul>
						<li>Base de datos</li>
						<li>Archivos de configuración</li>
						<li>Archivos subidos</li>
						<li>Logs del sistema</li>
					</ul>
				</Alert>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
				<Button
					variant="contained"
					onClick={onConfirm}
				>
					Crear Backup
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default BackupDialog;
