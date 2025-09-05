'use client';

import React, { useState, useEffect } from 'react';
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
	Typography,
	Box,
	Alert,
	Stack,
	Chip,
	Divider,
	Card,
	CardContent,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	CircularProgress
} from '@mui/material';
import {
	Close as CloseIcon,
	ExpandMore as ExpandMoreIcon,
	CheckCircle as CheckCircleIcon,
	Error as ErrorIcon,
	Schedule as ScheduleIcon,
	Person as PersonIcon,
	Room as RoomIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Reservation, ReassignmentRequest, ReassignmentType } from '@services/availability/types';

// Hook imports
import { useReassignment } from '@hooks/useReassignment';

interface ReassignmentDialogProps {
	open: boolean;
	onClose: () => void;
	reservation: Reservation;
	onSuccess?: (reassignmentId: string) => void;
}

interface FormData {
	targetUserId: string;
	targetUserEmail: string;
	reason: string;
	type: ReassignmentType;
	newStartTime?: Date;
	newEndTime?: Date;
	newResourceId?: string;
	newResourceName?: string;
}

const initialFormData: FormData = {
	targetUserId: '',
	targetUserEmail: '',
	reason: '',
	type: ReassignmentType.TRANSFER,
	newStartTime: undefined,
	newEndTime: undefined,
	newResourceId: undefined,
	newResourceName: undefined
};

export function ReassignmentDialog({
	open,
	onClose,
	reservation,
	onSuccess
}: ReassignmentDialogProps): React.ReactElement {
	const { currentValidation, loading, error, validateReassignment, clearValidation, createRequest } =
		useReassignment();

	const [formData, setFormData] = useState<FormData>(initialFormData);
	const [validationExpanded, setValidationExpanded] = useState(false);

	useEffect(() => {
		if (open) {
			setFormData({
				...initialFormData,
				newStartTime: new Date(reservation.startDate),
				newEndTime: new Date(reservation.endDate),
				newResourceId: reservation.resourceId,
				newResourceName: reservation.resourceName
			});
			clearValidation();
		}
	}, [open, reservation, clearValidation]);

	const handleInputChange =
		(field: keyof FormData) =>
		(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }) => {
			const value = event.target.value;
			setFormData((prev) => ({ ...prev, [field]: value }));
		};

	const handleDateChange = (field: 'newStartTime' | 'newEndTime') => (date: Date | null) => {
		setFormData((prev) => ({ ...prev, [field]: date || undefined }));
	};

	const handleValidate = async () => {
		if (!formData.targetUserId) {
			return;
		}

		await validateReassignment(
			reservation.id,
			formData.targetUserId,
			formData.newStartTime,
			formData.newEndTime,
			formData.newResourceId
		);
		setValidationExpanded(true);
	};

	const handleSubmit = async () => {
		if (!currentValidation?.isValid || !formData.targetUserId || !formData.reason) {
			return;
		}

		const request: ReassignmentRequest = {
			originalReservationId: reservation.id,
			targetUserId: formData.targetUserId,
			targetUserEmail: formData.targetUserEmail,
			reason: formData.reason,
			type: formData.type,
			originalStartTime: new Date(reservation.startDate),
			originalEndTime: new Date(reservation.endDate),
			newStartTime: formData.newStartTime || new Date(reservation.startDate),
			newEndTime: formData.newEndTime || new Date(reservation.endDate),
			newResourceId: formData.newResourceId || reservation.resourceId,
			newResourceName: formData.newResourceName || reservation.resourceName || '',
			priority: 'MEDIUM'
		};

		const reassignmentId = await createRequest(request);

		if (reassignmentId) {
			onSuccess?.(reassignmentId);
			onClose();
		}
	};

	const canValidate = formData.targetUserId.trim() !== '';
	const canSubmit = currentValidation?.isValid && formData.reason.trim() !== '' && !loading.create;

	const formatDateTime = (date: Date) => {
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: { minHeight: '70vh' }
			}}
		>
			<DialogTitle>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Typography variant="h6">Reassign Reservation</Typography>
					<Button
						onClick={onClose}
						size="small"
					>
						<CloseIcon />
					</Button>
				</Stack>
			</DialogTitle>

			<DialogContent>
				<Stack spacing={3}>
					{/* Current Reservation Info */}
					<Card variant="outlined">
						<CardContent>
							<Typography
								variant="subtitle1"
								gutterBottom
							>
								Current Reservation Details
							</Typography>
							<Stack
								direction="row"
								spacing={3}
							>
								<Box>
									<Typography
										variant="caption"
										display="block"
										color="text.secondary"
									>
										Resource
									</Typography>
									<Typography variant="body2">
										<RoomIcon
											fontSize="small"
											sx={{ mr: 1, verticalAlign: 'middle' }}
										/>
										{reservation.resourceName}
									</Typography>
								</Box>
								<Box>
									<Typography
										variant="caption"
										display="block"
										color="text.secondary"
									>
										Time Slot
									</Typography>
									<Typography variant="body2">
										<ScheduleIcon
											fontSize="small"
											sx={{ mr: 1, verticalAlign: 'middle' }}
										/>
										{formatDateTime(new Date(reservation.startDate))} -{' '}
										{formatDateTime(new Date(reservation.endDate))}
									</Typography>
								</Box>
								<Box>
									<Typography
										variant="caption"
										display="block"
										color="text.secondary"
									>
										Current Owner
									</Typography>
									<Typography variant="body2">
										<PersonIcon
											fontSize="small"
											sx={{ mr: 1, verticalAlign: 'middle' }}
										/>
										{reservation.userName}
									</Typography>
								</Box>
							</Stack>
						</CardContent>
					</Card>

					{/* Reassignment Form */}
					<Stack spacing={2}>
						<FormControl fullWidth>
							<InputLabel>Reassignment Type</InputLabel>
							<Select
								value={formData.type}
								onChange={handleInputChange('type')}
								label="Reassignment Type"
							>
								<MenuItem value={ReassignmentType.TRANSFER}>
									Transfer - Give reservation to another user
								</MenuItem>
								<MenuItem value={ReassignmentType.EXCHANGE}>
									Exchange - Swap with another user's reservation
								</MenuItem>
								<MenuItem value={ReassignmentType.RESCHEDULE}>
									Reschedule - Change time or resource
								</MenuItem>
							</Select>
						</FormControl>

						<TextField
							fullWidth
							label="Target User ID"
							value={formData.targetUserId}
							onChange={handleInputChange('targetUserId')}
							placeholder="Enter the user ID to reassign to"
							helperText="The user who will receive this reservation"
						/>

						<TextField
							fullWidth
							label="Target User Email (Optional)"
							value={formData.targetUserEmail}
							onChange={handleInputChange('targetUserEmail')}
							placeholder="user@university.edu"
							helperText="Email for notification purposes"
						/>

						<TextField
							fullWidth
							multiline
							rows={3}
							label="Reason for Reassignment"
							value={formData.reason}
							onChange={handleInputChange('reason')}
							placeholder="Please provide a reason for this reassignment request..."
							required
						/>

						{/* Time and Resource Changes (for RESCHEDULE type) */}
						{formData.type === ReassignmentType.RESCHEDULE && (
							<Stack spacing={2}>
								<Divider>
									<Chip
										label="New Schedule (Optional)"
										size="small"
									/>
								</Divider>

								<Stack
									direction="row"
									spacing={2}
								>
									<DateTimePicker
										label="New Start Time"
										value={formData.newStartTime}
										onChange={handleDateChange('newStartTime')}
										slotProps={{
											textField: { fullWidth: true }
										}}
									/>
									<DateTimePicker
										label="New End Time"
										value={formData.newEndTime}
										onChange={handleDateChange('newEndTime')}
										slotProps={{
											textField: { fullWidth: true }
										}}
									/>
								</Stack>

								<TextField
									fullWidth
									label="New Resource Name (Optional)"
									value={formData.newResourceName || ''}
									onChange={handleInputChange('newResourceName')}
									placeholder="Leave empty to keep current resource"
								/>
							</Stack>
						)}
					</Stack>

					{/* Validation Section */}
					<Stack spacing={2}>
						<Button
							variant="outlined"
							onClick={handleValidate}
							disabled={!canValidate || loading.validation}
							startIcon={loading.validation ? <CircularProgress size={20} /> : undefined}
						>
							{loading.validation ? 'Validating...' : 'Validate Reassignment'}
						</Button>

						{currentValidation && (
							<Accordion
								expanded={validationExpanded}
								onChange={(_, expanded) => setValidationExpanded(expanded)}
							>
								<AccordionSummary expandIcon={<ExpandMoreIcon />}>
									<Stack
										direction="row"
										spacing={1}
										alignItems="center"
									>
										{currentValidation.isValid ? (
											<CheckCircleIcon color="success" />
										) : (
											<ErrorIcon color="error" />
										)}
										<Typography>
											Validation {currentValidation.isValid ? 'Passed' : 'Failed'}
										</Typography>
										{currentValidation.requiredApprovals.length > 0 && (
											<Chip
												label="Requires Approval"
												color="warning"
												size="small"
											/>
										)}
									</Stack>
								</AccordionSummary>
								<AccordionDetails>
									<Stack spacing={2}>
										{/* Conflicts */}
										{currentValidation.conflicts.length > 0 && (
											<Alert severity="error">
												<Typography
													variant="subtitle2"
													gutterBottom
												>
													Conflicts Found:
												</Typography>
												<Stack spacing={1}>
													{currentValidation.conflicts.map((conflict, index) => (
														<Typography
															key={index}
															variant="body2"
														>
															• {conflict.details}
														</Typography>
													))}
												</Stack>
											</Alert>
										)}

										{/* Warnings */}
										{currentValidation.warnings.length > 0 && (
											<Alert severity="warning">
												<Typography
													variant="subtitle2"
													gutterBottom
												>
													Warnings:
												</Typography>
												<Stack spacing={1}>
													{currentValidation.warnings.map((warning, index) => (
														<Typography
															key={index}
															variant="body2"
														>
															• {warning.message}
														</Typography>
													))}
												</Stack>
											</Alert>
										)}

										{/* Success Info */}
										{currentValidation.isValid && (
											<Alert severity="success">
												<Typography variant="body2">
													✓ Reassignment is valid and can be processed
													{currentValidation.estimatedProcessingTime && (
														<>
															{' '}
															• Estimated processing time:{' '}
															{currentValidation.estimatedProcessingTime}
														</>
													)}
												</Typography>
											</Alert>
										)}

										{/* Alternative Suggestions */}
										{currentValidation.alternatives.length > 0 && (
											<Box>
												<Typography
													variant="subtitle2"
													gutterBottom
												>
													Alternative Suggestions:
												</Typography>
												<Stack spacing={1}>
													{currentValidation.alternatives.map((suggestion, index) => (
														<Card
															key={index}
															variant="outlined"
															sx={{ p: 1 }}
														>
															<Typography variant="body2">
																<strong>{suggestion.resourceName}</strong>
																<br />
																{formatDateTime(suggestion.startDate)} -{' '}
																{formatDateTime(suggestion.endDate)}
																<br />
																Reason: {suggestion.reason}
															</Typography>
														</Card>
													))}
												</Stack>
											</Box>
										)}
									</Stack>
								</AccordionDetails>
							</Accordion>
						)}
					</Stack>

					{error && <Alert severity="error">{error}</Alert>}
				</Stack>
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					variant="contained"
					onClick={handleSubmit}
					disabled={!canSubmit}
					startIcon={loading.create ? <CircularProgress size={20} /> : undefined}
				>
					{loading.create ? 'Creating...' : 'Create Reassignment Request'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
