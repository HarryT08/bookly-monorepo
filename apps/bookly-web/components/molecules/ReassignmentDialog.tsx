/**
 * ReassignmentDialog - Dialog component for reassigning reservations
 */

'use client';

import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Stack,
	Typography,
	Alert,
	CircularProgress
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useResources } from '@hooks/useResources';
import { useAuth } from '@hooks/useAuth';
import { reservationService } from '@services/availability/services';
import type { ResourceResponseDto } from '@services/resources/types';
import type { Reservation, CreateReservationRequest } from '@services/availability/types';

interface ReassignmentDialogProps {
	open: boolean;
	onClose: () => void;
	reservation: Reservation;
	onSuccess: (reassignmentId: string) => void;
}

interface ReassignmentRequest {
	newResourceId: string;
	newStartDate: string;
	newEndDate: string;
	reason: string;
	priority: 'low' | 'medium' | 'high';
}

export default function ReassignmentDialog({ open, onClose, reservation, onSuccess }: ReassignmentDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { user } = useAuth();
	const { resources, fetchResources } = useResources();
	const [loading, setLoading] = useState(false);

	const formatDateForInput = (date: Date): string => {
		return date.toISOString().slice(0, 16);
	};

	const [formData, setFormData] = useState<ReassignmentRequest>({
		newResourceId: '',
		newStartDate: formatDateForInput(new Date(reservation.startDate)),
		newEndDate: formatDateForInput(new Date(reservation.endDate)),
		reason: '',
		priority: 'medium'
	});

	const [errors, setErrors] = useState<Partial<ReassignmentRequest>>({});

	useEffect(() => {
		if (open) {
			fetchResources({});
			setFormData({
				newResourceId: '',
				newStartDate: formatDateForInput(new Date(reservation.startDate)),
				newEndDate: formatDateForInput(new Date(reservation.endDate)),
				reason: '',
				priority: 'medium'
			});
			setErrors({});
		}
	}, [open, reservation, fetchResources]);

	const validateForm = (): boolean => {
		const newErrors: Partial<ReassignmentRequest> = {};

		if (!formData.newResourceId) {
			newErrors.newResourceId = 'New resource is required';
		}

		if (!formData.reason.trim()) {
			newErrors.reason = 'Reason for reassignment is required';
		}

		const startDate = new Date(formData.newStartDate);
		const endDate = new Date(formData.newEndDate);

		if (startDate >= endDate) {
			newErrors.newEndDate = 'End date must be after start date';
		}

		if (startDate < new Date()) {
			newErrors.newStartDate = 'Start date cannot be in the past';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			if (!user?.id) {
				enqueueSnackbar('Usuario no autenticado', { variant: 'error' });
				return;
			}

			setLoading(true);

			// For now, we'll create a new reservation as a reassignment placeholder
			// In a real implementation, this would call a dedicated reassignment API
			const reservationData: CreateReservationRequest = {
				title: `${reservation.title} (Reassigned)`,
				description: `Reassigned from resource ${reservation.resourceId}. Reason: ${formData.reason}`,
				startDate: new Date(formData.newStartDate),
				endDate: new Date(formData.newEndDate),
				resourceId: formData.newResourceId,
				userId: user.id,
				priority: formData.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH'
			};

			const newReservation = await reservationService.createReservation(reservationData);

			if (newReservation) {
				enqueueSnackbar('Reassignment request created successfully', { variant: 'success' });
				onSuccess(newReservation.id || 'reassignment-created');
				onClose();
			}
		} catch (error) {
			console.error('Reassignment error:', error);
			enqueueSnackbar('Failed to create reassignment request', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	const handleDateChange = (field: 'newStartDate' | 'newEndDate', value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value
		}));
	};

	const availableResources = resources.filter(
		(resource: ResourceResponseDto) => resource.id !== reservation.resourceId && resource.isActive
	);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>Reassign Reservation</DialogTitle>

			<DialogContent>
				<Stack
					spacing={3}
					sx={{ mt: 1 }}
				>
					<Alert severity="info">
						Current reservation: {reservation.title} at {reservation.resourceName}
					</Alert>

					<FormControl
						fullWidth
						error={!!errors.newResourceId}
						disabled={loading}
					>
						<InputLabel>New Resource</InputLabel>
						<Select
							value={formData.newResourceId}
							label="New Resource"
							onChange={(e) => setFormData((prev) => ({ ...prev, newResourceId: e.target.value }))}
						>
							{availableResources.map((resource: ResourceResponseDto) => (
								<MenuItem
									key={resource.id}
									value={resource.id}
								>
									{resource.name} - {resource.category?.name || 'No Category'}
								</MenuItem>
							))}
						</Select>
						{errors.newResourceId && (
							<Typography
								variant="caption"
								color="error"
							>
								{errors.newResourceId}
							</Typography>
						)}
					</FormControl>

					<Stack
						direction="row"
						spacing={2}
					>
						<TextField
							label="New Start Date & Time"
							type="datetime-local"
							value={formData.newStartDate}
							onChange={(e) => handleDateChange('newStartDate', e.target.value)}
							error={!!errors.newStartDate}
							helperText={errors.newStartDate}
							InputLabelProps={{ shrink: true }}
							fullWidth
						/>

						<TextField
							label="New End Date & Time"
							type="datetime-local"
							value={formData.newEndDate}
							onChange={(e) => handleDateChange('newEndDate', e.target.value)}
							error={!!errors.newEndDate}
							helperText={errors.newEndDate}
							InputLabelProps={{ shrink: true }}
							fullWidth
						/>
					</Stack>

					<FormControl fullWidth>
						<InputLabel>Priority</InputLabel>
						<Select
							value={formData.priority}
							label="Priority"
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									priority: e.target.value as 'low' | 'medium' | 'high'
								}))
							}
						>
							<MenuItem value="low">Low</MenuItem>
							<MenuItem value="medium">Medium</MenuItem>
							<MenuItem value="high">High</MenuItem>
						</Select>
					</FormControl>

					<TextField
						label="Reason for Reassignment"
						multiline
						rows={3}
						value={formData.reason}
						onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
						error={!!errors.reason}
						helperText={errors.reason}
						placeholder="Please explain why this reservation needs to be reassigned..."
						fullWidth
						required
					/>
				</Stack>
			</DialogContent>

			<DialogActions>
				<Button
					onClick={onClose}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={loading}
					startIcon={loading ? <CircularProgress size={20} /> : null}
				>
					{loading ? 'Creating Request...' : 'Request Reassignment'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export { ReassignmentDialog };
