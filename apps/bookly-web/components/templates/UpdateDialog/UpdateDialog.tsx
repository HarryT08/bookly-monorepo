import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Alert } from '@mui/material';
import { Button } from '../../atoms/Button';

interface UpdateDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

export function UpdateDialog({ open, onClose, onConfirm }: UpdateDialogProps) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
		>
			<DialogTitle>Actualizar Sistema</DialogTitle>
			<DialogContent>
				<Typography sx={{ mb: 2 }}>Sistema actual: v2.1.0</Typography>
				<Typography sx={{ mb: 2 }}>Actualización disponible: v2.2.0</Typography>
				<Alert
					severity="warning"
					sx={{ mb: 2 }}
				>
					Se recomienda crear un backup antes de actualizar.
				</Alert>
				<Typography
					variant="body2"
					color="text.secondary"
				>
					Cambios en v2.2.0:
					<ul>
						<li>Mejoras de rendimiento</li>
						<li>Nuevas funciones de reportes</li>
						<li>Corrección de errores</li>
						<li>Actualización de seguridad</li>
					</ul>
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
				<Button
					variant="contained"
					onClick={onConfirm}
				>
					Actualizar
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default UpdateDialog;
