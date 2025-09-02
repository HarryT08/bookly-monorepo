'use client';

import { useState, useCallback } from 'react';
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
	Checkbox,
	FormControlLabel,
	Box,
	Chip
} from '@mui/material';
import {
	HourglassEmpty as WaitlistIcon,
	Notifications as NotificationIcon,
	Close as CloseIcon
} from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { JoinWaitlistRequest } from '@services/availability/types';
import { useWaitlist } from '@hooks/useWaitlist';

interface WaitlistDialogProps {
	open: boolean;
	onClose: () => void;
	resourceId: string;
	resourceName: string;
	conflictingReservation?: {
		startDate: Date;
		endDate: Date;
		title: string;
	};
	suggestedAlternatives?: {
		startDate: Date;
		endDate: Date;
		resourceName?: string;
	}[];
}

interface WaitlistFormData {
	title: string;
	description: string;
	requestedStartDate: Date;
	requestedEndDate: Date;
	priority: 'LOW' | 'MEDIUM' | 'HIGH';
	notificationPreferences: {
		email: boolean;
		sms: boolean;
		push: boolean;
	};
}

const PRIORITY_OPTIONS = [
	{ value: 'LOW', label: 'Low', color: 'success', description: 'Standard priority' },
	{ value: 'MEDIUM', label: 'Medium', color: 'warning', description: 'Normal urgency' },
	{ value: 'HIGH', label: 'High', color: 'error', description: 'Urgent request' }
] as const;

export function WaitlistDialog({
	open,
	onClose,
	resourceId,
	resourceName,
	conflictingReservation,
	suggestedAlternatives
}: WaitlistDialogProps) {
	const { joinWaitlist, loading } = useWaitlist();

	const [formData, setFormData] = useState<WaitlistFormData>({
		title: '',
		description: '',
		requestedStartDate: new Date(),
		requestedEndDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
		priority: 'MEDIUM',
		notificationPreferences: {
			email: true,
			sms: false,
			push: true
		}
	});

	const [errors, setErrors] = useState<Partial<Record<keyof WaitlistFormData, string>>>({});

	const updateFormData = useCallback(
		<K extends keyof WaitlistFormData>(field: K, value: WaitlistFormData[K]) => {
			setFormData((prev) => ({ ...prev, [field]: value }));

			// Clear error for this field
			if (errors[field]) {
				setErrors((prev) => ({ ...prev, [field]: undefined }));
			}
		},
		[errors]
	);

	const updateNotificationPreference = useCallback(
		(preference: keyof WaitlistFormData['notificationPreferences'], value: boolean) => {
			setFormData((prev) => ({
				...prev,
				notificationPreferences: {
					...prev.notificationPreferences,
					[preference]: value
				}
			}));
		},
		[]
	);

	const validateForm = useCallback((): boolean => {
		const newErrors: Partial<Record<keyof WaitlistFormData, string>> = {};

		if (!formData.title.trim()) {
			newErrors.title = 'Title is required';
		}

		if (formData.requestedStartDate >= formData.requestedEndDate) {
			newErrors.requestedEndDate = 'End date must be after start date';
		}

		if (formData.requestedStartDate < new Date()) {
			newErrors.requestedStartDate = 'Start date cannot be in the past';
		}

		// At least one notification method should be selected
		const hasNotificationMethod = Object.values(formData.notificationPreferences).some(Boolean);

		if (!hasNotificationMethod) {
			newErrors.notificationPreferences = 'Please select at least one notification method';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [formData]);

	const handleSubmit = useCallback(async () => {
		if (!validateForm()) return;

		const request: JoinWaitlistRequest = {
			resourceId,
			requestedStartDate: formData.requestedStartDate,
			requestedEndDate: formData.requestedEndDate,
			title: formData.title,
			description: formData.description,
			priority: formData.priority,
			notificationPreferences: formData.notificationPreferences
		};

		const success = await joinWaitlist(request);

		if (success) {
			onClose();
			// Reset form
			setFormData({
				title: '',
				description: '',
				requestedStartDate: new Date(),
				requestedEndDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
				priority: 'MEDIUM',
				notificationPreferences: {
					email: true,
					sms: false,
					push: true
				}
			});
			setErrors({});
		}
	}, [validateForm, formData, resourceId, joinWaitlist, onClose]);

	const handleClose = useCallback(() => {
		onClose();
		setErrors({});
	}, [onClose]);

	const getDurationText = () => {
		const durationMs = formData.requestedEndDate.getTime() - formData.requestedStartDate.getTime();
		const hours = Math.floor(durationMs / (1000 * 60 * 60));
		const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

		if (hours > 0 && minutes > 0) {
			return `${hours}h ${minutes}m`;
		} else if (hours > 0) {
			return `${hours}h`;
		} else {
			return `${minutes}m`;
		}
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>
					<Stack
						direction="row"
						alignItems="center"
						spacing={2}
					>
						<WaitlistIcon color="primary" />
						<Box>
							<Typography variant="h6">Join Waiting List</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
							>
								{resourceName} is currently unavailable
							</Typography>
						</Box>
					</Stack>
				</DialogTitle>

				<DialogContent>
					<Stack
						spacing={3}
						sx={{ mt: 1 }}
					>
						{/* Conflict Information */}
						{conflictingReservation && (
							<Alert severity="info">
								<Typography variant="body2">
									<strong>Conflict:</strong> "{conflictingReservation.title}" is scheduled from{' '}
									{conflictingReservation.startDate.toLocaleString()} to{' '}
									{conflictingReservation.endDate.toLocaleString()}
								</Typography>
							</Alert>
						)}

						{/* Suggested Alternatives */}
						{suggestedAlternatives && suggestedAlternatives.length > 0 && (
							<Box>
								<Typography
									variant="subtitle2"
									gutterBottom
								>
									Suggested Alternative Times:
								</Typography>
								<Stack
									direction="row"
									spacing={1}
									flexWrap="wrap"
								>
									{suggestedAlternatives.slice(0, 3).map((alt, index) => (
										<Chip
											key={index}
											label={`${alt.startDate.toLocaleString()} - ${alt.endDate.toLocaleString()}`}
											variant="outlined"
											size="small"
											onClick={() => {
												updateFormData('requestedStartDate', alt.startDate);
												updateFormData('requestedEndDate', alt.endDate);
											}}
											sx={{ mb: 1 }}
										/>
									))}
								</Stack>
							</Box>
						)}

						{/* Basic Information */}
						<TextField
							label="Request Title"
							value={formData.title}
							onChange={(e) => updateFormData('title', e.target.value)}
							error={!!errors.title}
							helperText={errors.title}
							placeholder="e.g., Team Meeting, Research Session"
							required
							fullWidth
						/>

						<TextField
							label="Description"
							value={formData.description}
							onChange={(e) => updateFormData('description', e.target.value)}
							placeholder="Additional details about your request..."
							multiline
							rows={2}
							fullWidth
						/>

						{/* Date and Time */}
						<Stack
							direction={{ xs: 'column', sm: 'row' }}
							spacing={2}
						>
							<DateTimePicker
								label="Requested Start"
								value={formData.requestedStartDate}
								onChange={(date) => date && updateFormData('requestedStartDate', date)}
								minDate={new Date()}
								slotProps={{
									textField: {
										fullWidth: true,
										error: !!errors.requestedStartDate,
										helperText: errors.requestedStartDate
									}
								}}
							/>

							<DateTimePicker
								label="Requested End"
								value={formData.requestedEndDate}
								onChange={(date) => date && updateFormData('requestedEndDate', date)}
								minDate={formData.requestedStartDate}
								slotProps={{
									textField: {
										fullWidth: true,
										error: !!errors.requestedEndDate,
										helperText: errors.requestedEndDate
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
								Requested Duration: {getDurationText()}
							</Typography>
						</Box>

						{/* Priority */}
						<FormControl fullWidth>
							<InputLabel>Priority</InputLabel>
							<Select
								value={formData.priority}
								label="Priority"
								onChange={(e) =>
									updateFormData('priority', e.target.value as WaitlistFormData['priority'])
								}
							>
								{PRIORITY_OPTIONS.map((option) => (
									<MenuItem
										key={option.value}
										value={option.value}
									>
										<Stack
											direction="row"
											spacing={2}
											alignItems="center"
											sx={{ py: 0.5 }}
										>
											<Chip
												label={option.label}
												color={
													option.color as
														| 'primary'
														| 'secondary'
														| 'success'
														| 'error'
														| 'info'
														| 'warning'
														| 'default'
												}
												size="small"
											/>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												{option.description}
											</Typography>
										</Stack>
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Notification Preferences */}
						<Box>
							<Typography
								variant="subtitle2"
								gutterBottom
							>
								<NotificationIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 16 }} />
								Notification Preferences
							</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ mb: 2 }}
							>
								How would you like to be notified when the resource becomes available?
							</Typography>

							<Stack spacing={1}>
								<FormControlLabel
									control={
										<Checkbox
											checked={formData.notificationPreferences.email}
											onChange={(e) => updateNotificationPreference('email', e.target.checked)}
										/>
									}
									label="Email notification"
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={formData.notificationPreferences.push}
											onChange={(e) => updateNotificationPreference('push', e.target.checked)}
										/>
									}
									label="Push notification"
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={formData.notificationPreferences.sms}
											onChange={(e) => updateNotificationPreference('sms', e.target.checked)}
										/>
									}
									label="SMS notification (if available)"
								/>
							</Stack>

							{errors.notificationPreferences && (
								<Typography
									variant="caption"
									color="error"
									sx={{ mt: 1 }}
								>
									{errors.notificationPreferences}
								</Typography>
							)}
						</Box>

						{/* Information Alert */}
						<Alert severity="info">
							<Typography variant="body2">
								You'll be notified when the resource becomes available for your requested time. You'll
								have limited time to confirm your reservation once notified.
							</Typography>
						</Alert>
					</Stack>
				</DialogContent>

				<DialogActions>
					<Button
						startIcon={<CloseIcon />}
						onClick={handleClose}
						disabled={loading.join}
					>
						Cancel
					</Button>

					<Button
						variant="contained"
						startIcon={<WaitlistIcon />}
						onClick={handleSubmit}
						disabled={loading.join}
					>
						{loading.join ? 'Joining...' : 'Join Waiting List'}
					</Button>
				</DialogActions>
			</Dialog>
		</LocalizationProvider>
	);
}
