'use client';

import { useState, useCallback } from 'react';
import {
	Box,
	Typography,
	Button,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Stack,
	Paper,
	Alert,
	Divider,
	Chip
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

import { PageTitle } from '@components/atoms';
import { RecurrenceSelector, RecurrencePattern } from '../../../../components/molecules/RecurrenceSelector';
import { useReservation } from '@hooks/useAvailability';
import { useAuth } from '@hooks/useAuth';
import { CreateReservationRequest } from '@services/availability/types';

interface ReservationFormData {
	title: string;
	description: string;
	resourceId: string;
	startDate: Date;
	endDate: Date;
	recurrence: RecurrencePattern;
	notes: string;
	priority: 'LOW' | 'MEDIUM' | 'HIGH';
	isPrivate: boolean;
}

const PRIORITY_OPTIONS = [
	{ value: 'LOW', label: 'Low', color: 'success' },
	{ value: 'MEDIUM', label: 'Medium', color: 'warning' },
	{ value: 'HIGH', label: 'High', color: 'error' }
] as const;

export default function CreateReservationPage() {
	const router = useRouter();
	const { enqueueSnackbar } = useSnackbar();
	const { user } = useAuth();
	const { createReservation, loading } = useReservation();

	const [formData, setFormData] = useState<ReservationFormData>({
		title: '',
		description: '',
		resourceId: '',
		startDate: new Date(),
		endDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
		recurrence: {
			frequency: 'NONE',
			interval: 1
		},
		notes: '',
		priority: 'MEDIUM',
		isPrivate: false
	});

	const [errors, setErrors] = useState<Partial<Record<keyof ReservationFormData, string>>>({});

	const validateForm = useCallback((): boolean => {
		const newErrors: Partial<Record<keyof ReservationFormData, string>> = {};

		if (!formData.title.trim()) {
			newErrors.title = 'Title is required';
		}

		if (!formData.resourceId) {
			newErrors.resourceId = 'Resource selection is required';
		}

		if (formData.startDate >= formData.endDate) {
			newErrors.endDate = 'End date must be after start date';
		}

		// Validate recurrence pattern
		if (formData.recurrence.frequency !== 'NONE') {
			if (
				formData.recurrence.frequency === 'WEEKLY' &&
				(!formData.recurrence.daysOfWeek || formData.recurrence.daysOfWeek.length === 0)
			) {
				newErrors.recurrence = 'Please select at least one day of the week for weekly recurrence';
			}

			if (formData.recurrence.endDate && formData.recurrence.endDate <= formData.startDate) {
				newErrors.recurrence = 'Recurrence end date must be after start date';
			}

			if (formData.recurrence.occurrences && formData.recurrence.occurrences < 1) {
				newErrors.recurrence = 'Number of occurrences must be at least 1';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [formData]);

	const updateFormData = useCallback(
		<K extends keyof ReservationFormData>(field: K, value: ReservationFormData[K]) => {
			setFormData((prev) => ({ ...prev, [field]: value }));

			// Clear error for this field
			if (errors[field]) {
				setErrors((prev) => ({ ...prev, [field]: undefined }));
			}
		},
		[errors]
	);

	const handleSubmit = useCallback(async () => {
		if (!validateForm()) {
			enqueueSnackbar('Please fix the form errors before submitting', { variant: 'error' });
			return;
		}

		try {
			if (!user?.id) {
				enqueueSnackbar('User not authenticated', { variant: 'error' });
				return;
			}

			const reservationRequest: CreateReservationRequest = {
				title: formData.title,
				description: formData.description,
				resourceId: formData.resourceId,
				startDate: formData.startDate,
				endDate: formData.endDate,
				notes: formData.notes,
				priority: formData.priority,
				isPrivate: formData.isPrivate,
				userId: user.id,
				// Add recurrence if not NONE
				...(formData.recurrence.frequency !== 'NONE' && {
					isRecurring: true,
					recurrence: {
						frequency: formData.recurrence.frequency as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
						interval: formData.recurrence.interval,
						endDate: formData.recurrence.endDate,
						occurrences: formData.recurrence.occurrences,
						daysOfWeek: formData.recurrence.daysOfWeek
					}
				})
			};

			const success = await createReservation(reservationRequest);

			if (success) {
				enqueueSnackbar(
					formData.recurrence.frequency !== 'NONE'
						? 'Recurring reservation created successfully'
						: 'Reservation created successfully',
					{ variant: 'success' }
				);
				router.push('/reservations');
			}
		} catch (_error) {
			enqueueSnackbar('Failed to create reservation', { variant: 'error' });
		}
	}, [formData, validateForm, createReservation, enqueueSnackbar, router, user?.id]);

	const handleCancel = useCallback(() => {
		router.back();
	}, [router]);

	const getRecurrenceSummary = () => {
		if (formData.recurrence.frequency === 'NONE') return null;

		let summary = '';
		const interval = formData.recurrence.interval > 1 ? `every ${formData.recurrence.interval}` : 'every';

		switch (formData.recurrence.frequency) {
			case 'DAILY':
				summary = `Repeats ${interval} day${formData.recurrence.interval > 1 ? 's' : ''}`;
				break;
			case 'WEEKLY':
				summary = `Repeats ${interval} week${formData.recurrence.interval > 1 ? 's' : ''}`;
				break;
			case 'MONTHLY':
				summary = `Repeats ${interval} month${formData.recurrence.interval > 1 ? 's' : ''}`;
				break;
			case 'YEARLY':
				summary = `Repeats ${interval} year${formData.recurrence.interval > 1 ? 's' : ''}`;
				break;
		}

		if (formData.recurrence.endDate) {
			summary += ` until ${formData.recurrence.endDate.toLocaleDateString()}`;
		} else if (formData.recurrence.occurrences) {
			summary += ` for ${formData.recurrence.occurrences} occurrences`;
		}

		return summary;
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
				{/* Header */}
				<PageTitle
					title="Create New Reservation"
					subtitle="Schedule a new resource reservation with optional recurring pattern"
				/>

				<Paper sx={{ p: 3, mt: 3 }}>
					<Stack spacing={3}>
						{/* Basic Information */}
						<Box>
							<Typography
								variant="h6"
								gutterBottom
							>
								Basic Information
							</Typography>

							<Stack spacing={3}>
								<TextField
									label="Title"
									value={formData.title}
									onChange={(e) => updateFormData('title', e.target.value)}
									error={!!errors.title}
									helperText={errors.title}
									placeholder="e.g., Weekly Team Meeting"
									fullWidth
									required
								/>

								<TextField
									label="Description"
									value={formData.description}
									onChange={(e) => updateFormData('description', e.target.value)}
									placeholder="Add details about the reservation..."
									multiline
									rows={3}
									fullWidth
								/>

								<FormControl
									fullWidth
									required
									error={!!errors.resourceId}
								>
									<InputLabel>Resource</InputLabel>
									<Select
										value={formData.resourceId}
										label="Resource"
										onChange={(e) => updateFormData('resourceId', e.target.value)}
									>
										{/* TODO: Replace with actual resources from API */}
										<MenuItem value="resource-1">Conference Room A</MenuItem>
										<MenuItem value="resource-2">Laboratory B</MenuItem>
										<MenuItem value="resource-3">Auditorium C</MenuItem>
										<MenuItem value="resource-4">Meeting Room D</MenuItem>
									</Select>
									{errors.resourceId && (
										<Typography
											variant="caption"
											color="error"
											sx={{ mt: 0.5, ml: 1.5 }}
										>
											{errors.resourceId}
										</Typography>
									)}
								</FormControl>

								<FormControl fullWidth>
									<InputLabel>Priority</InputLabel>
									<Select
										value={formData.priority}
										label="Priority"
										onChange={(e) =>
											updateFormData(
												'priority',
												e.target.value as ReservationFormData['priority']
											)
										}
									>
										{PRIORITY_OPTIONS.map((option) => (
											<MenuItem
												key={option.value}
												value={option.value}
											>
												<Stack
													direction="row"
													spacing={1}
													alignItems="center"
												>
													<Chip
														label={option.label}
														color={option.color as 'success' | 'warning' | 'error'}
														size="small"
													/>
												</Stack>
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Stack>
						</Box>

						<Divider />

						{/* Date and Time */}
						<Box>
							<Typography
								variant="h6"
								gutterBottom
							>
								Date and Time
							</Typography>

							<Stack spacing={3}>
								<Stack
									direction={{ xs: 'column', sm: 'row' }}
									spacing={2}
								>
									<DateTimePicker
										label="Start Date & Time"
										value={formData.startDate}
										onChange={(date) => date && updateFormData('startDate', date)}
										slotProps={{
											textField: {
												fullWidth: true,
												error: !!errors.startDate,
												helperText: errors.startDate
											}
										}}
									/>

									<DateTimePicker
										label="End Date & Time"
										value={formData.endDate}
										onChange={(date) => date && updateFormData('endDate', date)}
										minDate={formData.startDate}
										slotProps={{
											textField: {
												fullWidth: true,
												error: !!errors.endDate,
												helperText: errors.endDate
											}
										}}
									/>
								</Stack>

								{/* Duration Display */}
								<Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										<CalendarIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 16 }} />
										Duration:{' '}
										{Math.round(
											(formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60)
										)}{' '}
										minutes
									</Typography>
								</Box>
							</Stack>
						</Box>

						<Divider />

						{/* Recurrence Pattern */}
						<Box>
							<Typography
								variant="h6"
								gutterBottom
							>
								Recurrence Pattern (RF-12)
							</Typography>

							<RecurrenceSelector
								value={formData.recurrence}
								onChange={(recurrence) => updateFormData('recurrence', recurrence)}
								startDate={formData.startDate}
								error={errors.recurrence}
							/>

							{/* Recurrence Summary */}
							{getRecurrenceSummary() && (
								<Alert
									severity="info"
									sx={{ mt: 2 }}
								>
									<Typography variant="body2">
										<strong>Pattern Summary:</strong> {getRecurrenceSummary()}
									</Typography>
								</Alert>
							)}
						</Box>

						<Divider />

						{/* Additional Notes */}
						<Box>
							<Typography
								variant="h6"
								gutterBottom
							>
								Additional Information
							</Typography>

							<TextField
								label="Notes"
								value={formData.notes}
								onChange={(e) => updateFormData('notes', e.target.value)}
								placeholder="Any additional notes or requirements..."
								multiline
								rows={2}
								fullWidth
							/>
						</Box>

						{/* Actions */}
						<Stack
							direction="row"
							spacing={2}
							sx={{ pt: 2 }}
						>
							<Button
								variant="outlined"
								startIcon={<CancelIcon />}
								onClick={handleCancel}
								disabled={loading}
							>
								Cancel
							</Button>

							<Button
								variant="contained"
								startIcon={<SaveIcon />}
								onClick={handleSubmit}
								disabled={loading}
								sx={{ ml: 'auto' }}
							>
								{loading ? 'Creating...' : 'Create Reservation'}
							</Button>
						</Stack>
					</Stack>
				</Paper>
			</Box>
		</LocalizationProvider>
	);
}
