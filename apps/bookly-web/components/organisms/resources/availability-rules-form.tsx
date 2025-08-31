'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
	Box,
	Typography,
	TextField,
	Button,
	MenuItem,
	Switch,
	FormControlLabel,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	IconButton,
	Stack
} from '@mui/material';
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	ExpandMore as ExpandMoreIcon,
	Schedule as ScheduleIcon,
	Block as BlockIcon,
	PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface WeeklySchedule {
	dayOfWeek: number; // 1-7 (Monday-Sunday)
	startTime: string; // HH:mm
	endTime: string; // HH:mm
	isActive: boolean;
}

interface BlockedPeriod {
	startDate: string; // YYYY-MM-DD
	endDate: string; // YYYY-MM-DD
	startTime?: string; // HH:mm
	endTime?: string; // HH:mm
	reason: string;
	isRecurring: boolean;
}

interface TimeRestrictions {
	minReservationTime: number; // minutes
	maxReservationTime: number; // minutes
	preparationTime: number; // minutes between reservations
	advanceBookingMin: number; // hours
	advanceBookingMax: number; // hours
}

interface PriorityRule {
	userType: 'STUDENT' | 'TEACHER' | 'RESEARCHER' | 'ADMIN' | 'GENERAL';
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	restrictions?: string[];
}

export interface AvailabilityRulesFormData {
	weeklySchedules: WeeklySchedule[];
	blockedPeriods: BlockedPeriod[];
	timeRestrictions: TimeRestrictions;
	priorityRules: PriorityRule[];
	requiresApproval: boolean;
	allowRecurring: boolean;
	specialRequirements: string[];
}

interface AvailabilityRulesFormProps {
	value?: Partial<AvailabilityRulesFormData>;
	onChange?: (value: AvailabilityRulesFormData) => void;
	disabled?: boolean;
}

const DAYS_OF_WEEK = [
	{ value: 1, label: 'Monday' },
	{ value: 2, label: 'Tuesday' },
	{ value: 3, label: 'Wednesday' },
	{ value: 4, label: 'Thursday' },
	{ value: 5, label: 'Friday' },
	{ value: 6, label: 'Saturday' },
	{ value: 7, label: 'Sunday' }
];

const USER_TYPES = [
	{ value: 'STUDENT', label: 'Student' },
	{ value: 'TEACHER', label: 'Teacher' },
	{ value: 'RESEARCHER', label: 'Researcher' },
	{ value: 'ADMIN', label: 'Administrator' },
	{ value: 'GENERAL', label: 'General' }
];

const PRIORITY_LEVELS = [
	{ value: 'LOW', label: 'Low' },
	{ value: 'MEDIUM', label: 'Medium' },
	{ value: 'HIGH', label: 'High' },
	{ value: 'CRITICAL', label: 'Critical' }
];

export function AvailabilityRulesForm({ value, onChange, disabled = false }: AvailabilityRulesFormProps) {
	const { t } = useTranslation('resources');
	const [expandedPanels, setExpandedPanels] = useState<string[]>(['schedule']);

	const form = useForm<AvailabilityRulesFormData>({
		defaultValues: {
			weeklySchedules: value?.weeklySchedules || [
				{ dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isActive: true }
			],
			blockedPeriods: value?.blockedPeriods || [],
			timeRestrictions: value?.timeRestrictions || {
				minReservationTime: 30,
				maxReservationTime: 240,
				preparationTime: 15,
				advanceBookingMin: 2,
				advanceBookingMax: 720
			},
			priorityRules: value?.priorityRules || [],
			requiresApproval: value?.requiresApproval || false,
			allowRecurring: value?.allowRecurring || true,
			specialRequirements: value?.specialRequirements || []
		}
	});

	const { control, watch, setValue } = form;

	const {
		fields: scheduleFields,
		append: appendSchedule,
		remove: removeSchedule
	} = useFieldArray({
		control,
		name: 'weeklySchedules'
	});

	const {
		fields: blockedFields,
		append: appendBlocked,
		remove: removeBlocked
	} = useFieldArray({
		control,
		name: 'blockedPeriods'
	});

	const {
		fields: priorityFields,
		append: appendPriority,
		remove: removePriority
	} = useFieldArray({
		control,
		name: 'priorityRules'
	});

	const formValues = watch();

	// Notify parent of changes
	React.useEffect(() => {
		if (onChange) {
			onChange(formValues);
		}
	}, [formValues, onChange]);

	const handlePanelChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
		setExpandedPanels((prev) => (isExpanded ? [...prev, panel] : prev.filter((p) => p !== panel)));
	};

	return (
		<Box sx={{ width: '100%' }}>
			<Typography
				variant="h6"
				gutterBottom
			>
				{t('Availability Rules Configuration')}
			</Typography>

			{/* Weekly Schedule */}
			<Accordion
				expanded={expandedPanels.includes('schedule')}
				onChange={handlePanelChange('schedule')}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<ScheduleIcon color="primary" />
						<Typography variant="h6">{t('Weekly Schedule')}</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails>
					<Stack spacing={2}>
						{scheduleFields.map((field, index) => (
							<Stack
								direction="row"
								spacing={2}
								key={field.id}
								alignItems="center"
								flexWrap="wrap"
							>
								<Box sx={{ width: { xs: '100%', sm: '25%' }, minWidth: '200px' }}>
									<Controller
										name={`weeklySchedules.${index}.dayOfWeek`}
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label={t('Day of Week')}
												fullWidth
												size="small"
												disabled={disabled}
											>
												{DAYS_OF_WEEK.map((day) => (
													<MenuItem
														key={day.value}
														value={day.value}
													>
														{t(day.label)}
													</MenuItem>
												))}
											</TextField>
										)}
									/>
								</Box>
								<Box sx={{ width: { xs: '50%', sm: '16.66%' }, minWidth: '120px' }}>
									<Controller
										name={`weeklySchedules.${index}.startTime`}
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												type="time"
												label={t('Start Time')}
												fullWidth
												size="small"
												disabled={disabled}
												InputLabelProps={{ shrink: true }}
											/>
										)}
									/>
								</Box>
								<Box sx={{ width: { xs: '50%', sm: '16.66%' }, minWidth: '120px' }}>
									<Controller
										name={`weeklySchedules.${index}.endTime`}
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												type="time"
												label={t('End Time')}
												fullWidth
												size="small"
												disabled={disabled}
												InputLabelProps={{ shrink: true }}
											/>
										)}
									/>
								</Box>
								<Box sx={{ width: { xs: '50%', sm: '16.66%' }, minWidth: '120px' }}>
									<Controller
										name={`weeklySchedules.${index}.isActive`}
										control={control}
										render={({ field }) => (
											<FormControlLabel
												control={
													<Switch
														{...field}
														checked={field.value}
														disabled={disabled}
													/>
												}
												label={t('Active')}
											/>
										)}
									/>
								</Box>
								<Box sx={{ width: { xs: '50%', sm: '16.66%' }, minWidth: '120px' }}>
									<IconButton
										onClick={() => removeSchedule(index)}
										disabled={disabled || scheduleFields.length <= 1}
										color="error"
										size="small"
									>
										<DeleteIcon />
									</IconButton>
								</Box>
							</Stack>
						))}
						<Button
							startIcon={<AddIcon />}
							onClick={() =>
								appendSchedule({ dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isActive: true })
							}
							disabled={disabled}
							variant="outlined"
							size="small"
						>
							{t('Add Schedule')}
						</Button>
					</Stack>
				</AccordionDetails>
			</Accordion>

			{/* Time Restrictions */}
			<Accordion
				expanded={expandedPanels.includes('timeRestrictions')}
				onChange={handlePanelChange('timeRestrictions')}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<ScheduleIcon color="secondary" />
						<Typography variant="h6">{t('Time Restrictions')}</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails>
					<Stack
						direction="row"
						spacing={3}
						flexWrap="wrap"
					>
						<Box sx={{ width: { xs: '100%', sm: '50%' } }}>
							<Controller
								name="timeRestrictions.minReservationTime"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										type="number"
										label={t('Min Reservation (minutes)')}
										fullWidth
										disabled={disabled}
										inputProps={{ min: 1 }}
									/>
								)}
							/>
						</Box>
						<Box sx={{ width: { xs: '100%', sm: '50%' } }}>
							<Controller
								name="timeRestrictions.maxReservationTime"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										type="number"
										label={t('Max Reservation (minutes)')}
										fullWidth
										disabled={disabled}
										inputProps={{ min: 1 }}
									/>
								)}
							/>
						</Box>
						<Box sx={{ width: { xs: '100%', sm: '33.33%' } }}>
							<Controller
								name="timeRestrictions.preparationTime"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										type="number"
										label={t('Preparation Time (minutes)')}
										fullWidth
										disabled={disabled}
										inputProps={{ min: 0 }}
									/>
								)}
							/>
						</Box>
						<Box sx={{ width: { xs: '100%', sm: '33.33%' } }}>
							<Controller
								name="timeRestrictions.advanceBookingMin"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										type="number"
										label={t('Min Advance Booking (hours)')}
										fullWidth
										disabled={disabled}
										inputProps={{ min: 0 }}
									/>
								)}
							/>
						</Box>
						<Box sx={{ width: { xs: '100%', sm: '33.33%' } }}>
							<Controller
								name="timeRestrictions.advanceBookingMax"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										type="number"
										label={t('Max Advance Booking (hours)')}
										fullWidth
										disabled={disabled}
										inputProps={{ min: 1 }}
									/>
								)}
							/>
						</Box>
					</Stack>
				</AccordionDetails>
			</Accordion>

			{/* Blocked Periods */}
			<Accordion
				expanded={expandedPanels.includes('blockedPeriods')}
				onChange={handlePanelChange('blockedPeriods')}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<BlockIcon color="error" />
						<Typography variant="h6">{t('Blocked Periods')}</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails>
					<Stack spacing={2}>
						{blockedFields.map((field, index) => (
							<Stack
								direction="row"
								spacing={2}
								key={field.id}
								alignItems="center"
								flexWrap="wrap"
							>
								<Box sx={{ width: { xs: '100%', sm: '16.67%' } }}>
									<Controller
										name={`blockedPeriods.${index}.startDate`}
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												type="date"
												label={t('Start Date')}
												fullWidth
												size="small"
												disabled={disabled}
												InputLabelProps={{ shrink: true }}
											/>
										)}
									/>
								</Box>
								<Box sx={{ width: { xs: '100%', sm: '16.66%' }, minWidth: '120px' }}>
									<Controller
										name={`blockedPeriods.${index}.endDate`}
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												type="date"
												label={t('End Date')}
												fullWidth
												size="small"
												disabled={disabled}
												InputLabelProps={{ shrink: true }}
											/>
										)}
									/>
								</Box>
								<Box sx={{ width: { xs: '50%', sm: '12.5%' } }}>
									<Controller
										name={`blockedPeriods.${index}.startTime`}
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												type="time"
												label={t('Start Time')}
												fullWidth
												size="small"
												disabled={disabled}
												InputLabelProps={{ shrink: true }}
											/>
										)}
									/>
								</Box>
								<Box sx={{ width: { xs: '50%', sm: '12.5%' } }}>
									<Controller
										name={`blockedPeriods.${index}.endTime`}
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												type="time"
												label={t('End Time')}
												fullWidth
												size="small"
												disabled={disabled}
												InputLabelProps={{ shrink: true }}
											/>
										)}
									/>
								</Box>
								<Box sx={{ width: { xs: '100%', sm: '25%' } }}>
									<Controller
										name={`blockedPeriods.${index}.reason`}
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												label={t('Reason')}
												fullWidth
												size="small"
												disabled={disabled}
											/>
										)}
									/>
								</Box>
								<Box sx={{ width: { xs: '50%', sm: '8.33%' } }}>
									<Controller
										name={`blockedPeriods.${index}.isRecurring`}
										control={control}
										render={({ field }) => (
											<FormControlLabel
												control={
													<Switch
														{...field}
														checked={field.value}
														disabled={disabled}
													/>
												}
												label={t('Recurring')}
											/>
										)}
									/>
								</Box>
								<Box sx={{ width: { xs: '50%', sm: '8.33%' } }}>
									<IconButton
										onClick={() => removeBlocked(index)}
										disabled={disabled}
										color="error"
										size="small"
									>
										<DeleteIcon />
									</IconButton>
								</Box>
							</Stack>
						))}
						<Button
							startIcon={<AddIcon />}
							onClick={() =>
								appendBlocked({
									startDate: '',
									endDate: '',
									reason: '',
									isRecurring: false
								})
							}
							disabled={disabled}
							variant="outlined"
							size="small"
						>
							{t('Add Blocked Period')}
						</Button>
					</Stack>
				</AccordionDetails>
			</Accordion>

			{/* Priority Rules */}
			<Accordion
				expanded={expandedPanels.includes('priorityRules')}
				onChange={handlePanelChange('priorityRules')}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<PriorityIcon color="warning" />
						<Typography variant="h6">{t('Priority Rules')}</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails>
					<Stack spacing={2}>
						{priorityFields.map((field, index) => (
							<Stack
								direction="row"
								spacing={2}
								key={field.id}
								alignItems="center"
								flexWrap="wrap"
							>
								<Box sx={{ width: { xs: '100%', sm: '33.33%' } }}>
									<Controller
										name={`priorityRules.${index}.userType`}
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label={t('User Type')}
												fullWidth
												size="small"
												disabled={disabled}
											>
												{USER_TYPES.map((type) => (
													<MenuItem
														key={type.value}
														value={type.value}
													>
														{t(type.label)}
													</MenuItem>
												))}
											</TextField>
										)}
									/>
								</Box>
								<Box sx={{ width: { xs: '100%', sm: '25%' } }}>
									<Controller
										name={`priorityRules.${index}.priority`}
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label={t('Priority Level')}
												fullWidth
												size="small"
												disabled={disabled}
											>
												{PRIORITY_LEVELS.map((level) => (
													<MenuItem
														key={level.value}
														value={level.value}
													>
														{t(level.label)}
													</MenuItem>
												))}
											</TextField>
										)}
									/>
								</Box>
								<Box sx={{ width: { xs: '100%', sm: '33.33%' } }}>
									<Controller
										name={`priorityRules.${index}.restrictions`}
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												label={t('Restrictions (comma separated)')}
												fullWidth
												size="small"
												disabled={disabled}
												placeholder={t('E.g., training_required, supervisor_approval')}
												value={Array.isArray(field.value) ? field.value.join(', ') : ''}
												onChange={(e) => {
													const value = e.target.value;
													const restrictions = value
														? value.split(',').map((r) => r.trim())
														: [];
													field.onChange(restrictions);
												}}
											/>
										)}
									/>
								</Box>
								<Box sx={{ width: { xs: '100%', sm: '8.33%' } }}>
									<IconButton
										onClick={() => removePriority(index)}
										disabled={disabled}
										color="error"
										size="small"
									>
										<DeleteIcon />
									</IconButton>
								</Box>
							</Stack>
						))}
						<Button
							startIcon={<AddIcon />}
							onClick={() =>
								appendPriority({
									userType: 'STUDENT',
									priority: 'MEDIUM',
									restrictions: []
								})
							}
							disabled={disabled}
							variant="outlined"
							size="small"
						>
							{t('Add Priority Rule')}
						</Button>
					</Stack>
				</AccordionDetails>
			</Accordion>

			{/* General Settings */}
			<Accordion
				expanded={expandedPanels.includes('generalSettings')}
				onChange={handlePanelChange('generalSettings')}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography variant="h6">{t('General Settings')}</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Stack spacing={2}>
						<Controller
							name="requiresApproval"
							control={control}
							render={({ field }) => (
								<FormControlLabel
									control={
										<Switch
											{...field}
											checked={field.value}
											disabled={disabled}
										/>
									}
									label={t('Requires Approval')}
								/>
							)}
						/>
						<Controller
							name="allowRecurring"
							control={control}
							render={({ field }) => (
								<FormControlLabel
									control={
										<Switch
											{...field}
											checked={field.value}
											disabled={disabled}
										/>
									}
									label={t('Allow Recurring Reservations')}
								/>
							)}
						/>
						<Controller
							name="specialRequirements"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label={t('Special Requirements (comma separated)')}
									fullWidth
									multiline
									rows={3}
									disabled={disabled}
									placeholder={t(
										'E.g., security_clearance, special_training, equipment_certification'
									)}
									value={Array.isArray(field.value) ? field.value.join(', ') : ''}
									onChange={(e) => {
										const value = e.target.value;
										const requirements = value ? value.split(',').map((r) => r.trim()) : [];
										field.onChange(requirements);
									}}
								/>
							)}
						/>
					</Stack>
				</AccordionDetails>
			</Accordion>
		</Box>
	);
}
