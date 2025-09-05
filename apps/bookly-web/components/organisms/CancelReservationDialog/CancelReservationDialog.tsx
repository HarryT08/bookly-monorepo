import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Button, TextField } from '../../atoms';

interface CancelReservationDialogProps {
	open: boolean;
	reservationTitle?: string;
	onClose: () => void;
	onConfirm: (reason: string) => void;
	loading?: boolean;
}

export function CancelReservationDialog({
	open,
	reservationTitle = 'esta reserva',
	onClose,
	onConfirm,
	loading = false
}: CancelReservationDialogProps) {
	const [reason, setReason] = useState('');

	const handleConfirm = () => {
		onConfirm(reason);
		setReason('');
	};

	const handleClose = () => {
		setReason('');
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle>Cancelar Reserva - {reservationTitle}</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					margin="dense"
					label="Motivo de la Cancelación"
					fullWidth
					multiline
					rows={3}
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					placeholder="Por favor proporciona un motivo para la cancelación..."
					required
				/>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={handleClose}
					disabled={loading}
				>
					Cancelar
				</Button>
				<Button
					onClick={handleConfirm}
					variant="contained"
					color="error"
					disabled={loading || !reason.trim()}
				>
					{loading ? 'Cancelando...' : 'Confirmar Cancelación'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
