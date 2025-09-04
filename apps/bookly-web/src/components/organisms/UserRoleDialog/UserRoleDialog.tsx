import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	SelectChangeEvent
} from '@mui/material';
import { Button } from '../../atoms';

interface User {
	id: string;
	firstName: string;
	lastName: string;
	roles: string[];
}

interface UserRoleDialogProps {
	open: boolean;
	user: User | null;
	onClose: () => void;
	onSave: (userId: string, roles: string[]) => void;
	loading?: boolean;
}

const availableRoles = [
	{ value: 'ADMIN', label: 'Administrador' },
	{ value: 'TEACHER', label: 'Docente' },
	{ value: 'STUDENT', label: 'Estudiante' },
	{ value: 'STAFF', label: 'Personal' }
];

export function UserRoleDialog({ open, user, onClose, onSave, loading = false }: UserRoleDialogProps) {
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

	useEffect(() => {
		if (user) {
			setSelectedRoles(user.roles);
		} else {
			setSelectedRoles([]);
		}
	}, [user]);

	const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
		const value = event.target.value;
		setSelectedRoles(typeof value === 'string' ? value.split(',') : value);
	};

	const handleSave = () => {
		if (user) {
			onSave(user.id, selectedRoles);
		}
	};

	const handleClose = () => {
		setSelectedRoles([]);
		onClose();
	};

	if (!user) return null;

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle>
				Gestionar Roles - {user.firstName} {user.lastName}
			</DialogTitle>
			<DialogContent>
				<FormControl
					fullWidth
					sx={{ mt: 2 }}
				>
					<InputLabel>Roles</InputLabel>
					<Select
						multiple
						value={selectedRoles}
						onChange={handleRoleChange}
						label="Roles"
						renderValue={(selected) =>
							selected
								.map((role) => availableRoles.find((r) => r.value === role)?.label || role)
								.join(', ')
						}
					>
						{availableRoles.map((role) => (
							<MenuItem
								key={role.value}
								value={role.value}
							>
								{role.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>
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
					onClick={handleSave}
					disabled={loading}
				>
					{loading ? 'Guardando...' : 'Guardar'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
