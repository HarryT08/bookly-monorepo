import { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem
} from '@mui/material';
import { Button, TextField } from '../../atoms';

export interface CreateProgramDialogData {
	name: string;
	code: string;
	faculty: string;
	level: 'UNDERGRADUATE' | 'GRADUATE' | 'POSTGRADUATE';
	duration: number;
	coordinator: string;
}

interface CreateProgramDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: CreateProgramDialogData) => void;
	loading?: boolean;
}

const INITIAL_DATA: CreateProgramDialogData = {
	name: '',
	code: '',
	faculty: '',
	level: 'UNDERGRADUATE',
	duration: 8,
	coordinator: ''
};

export function CreateProgramDialog({ open, onClose, onSubmit, loading = false }: CreateProgramDialogProps) {
	const [formData, setFormData] = useState<CreateProgramDialogData>(INITIAL_DATA);

	const handleSubmit = () => {
		onSubmit(formData);
		setFormData(INITIAL_DATA);
	};

	const handleClose = () => {
		setFormData(INITIAL_DATA);
		onClose();
	};

	const isValid = formData.name && formData.code && formData.faculty && formData.duration > 0;

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>Crear Nuevo Programa Académico</DialogTitle>
			<DialogContent>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
					<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
						<Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
							<TextField
								fullWidth
								label="Nombre del Programa"
								variant="outlined"
								value={formData.name}
								onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
								required
							/>
						</Box>
						<Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
							<TextField
								fullWidth
								label="Código"
								variant="outlined"
								value={formData.code}
								onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
								required
							/>
						</Box>
					</Box>
					<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
						<Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
							<TextField
								fullWidth
								label="Facultad"
								variant="outlined"
								value={formData.faculty}
								onChange={(e) => setFormData((prev) => ({ ...prev, faculty: e.target.value }))}
								required
							/>
						</Box>
						<Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
							<FormControl fullWidth>
								<InputLabel>Nivel</InputLabel>
								<Select
									label="Nivel"
									value={formData.level}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											level: e.target.value as CreateProgramDialogData['level']
										}))
									}
								>
									<MenuItem value="UNDERGRADUATE">Pregrado</MenuItem>
									<MenuItem value="GRADUATE">Postgrado</MenuItem>
									<MenuItem value="POSTGRADUATE">Doctorado</MenuItem>
								</Select>
							</FormControl>
						</Box>
					</Box>
					<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
						<Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
							<TextField
								fullWidth
								label="Duración (semestres)"
								type="number"
								variant="outlined"
								value={formData.duration}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value) || 0 }))
								}
								required
								inputProps={{ min: 1 }}
							/>
						</Box>
						<Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
							<TextField
								fullWidth
								label="Coordinador"
								variant="outlined"
								value={formData.coordinator}
								onChange={(e) => setFormData((prev) => ({ ...prev, coordinator: e.target.value }))}
							/>
						</Box>
					</Box>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={handleClose}
					disabled={loading}
				>
					Cancelar
				</Button>
				<Button
					variant="contained"
					onClick={handleSubmit}
					disabled={!isValid || loading}
				>
					{loading ? 'Creando...' : 'Crear'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
