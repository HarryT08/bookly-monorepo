'use client';

import { useState, useCallback } from 'react';
import {
	Box,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Checkbox,
	FormControlLabel,
	Stack,
	Chip,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Alert
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Event as EventIcon, Clear as ClearIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export interface RecurrencePattern {
	frequency: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
	interval: number;
	daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
	dayOfMonth?: number;
	monthOfYear?: number;
	endDate?: Date;
	occurrences?: number;
	exceptions?: Date[]; // Dates to skip
}

interface RecurrenceSelectorProps {
	value: RecurrencePattern;
	onChange: (pattern: RecurrencePattern) => void;
	startDate: Date;
	disabled?: boolean;
	error?: string;
}

const FREQUENCY_OPTIONS = [
	{ value: 'NONE', label: 'No Recurrence' },
	{ value: 'DAILY', label: 'Daily' },
	{ value: 'WEEKLY', label: 'Weekly' },
	{ value: 'MONTHLY', label: 'Monthly' },
	{ value: 'YEARLY', label: 'Yearly' }
] as const;

const DAYS_OF_WEEK = [
	{ value: 0, label: 'Sun', fullLabel: 'Sunday' },
	{ value: 1, label: 'Mon', fullLabel: 'Monday' },
	{ value: 2, label: 'Tue', fullLabel: 'Tuesday' },
	{ value: 3, label: 'Wed', fullLabel: 'Wednesday' },
	{ value: 4, label: 'Thu', fullLabel: 'Thursday' },
	{ value: 5, label: 'Fri', fullLabel: 'Friday' },
	{ value: 6, label: 'Sat', fullLabel: 'Saturday' }
];

export function RecurrenceSelector({ value, onChange, startDate, disabled = false, error }: RecurrenceSelectorProps) {
	const [expanded, setExpanded] = useState(value.frequency !== 'NONE');

	const updatePattern = useCallback(
		(updates: Partial<RecurrencePattern>) => {
			const newPattern = { ...value, ...updates };

			// Reset specific fields when frequency changes
			if (updates.frequency && updates.frequency !== value.frequency) {
				if (updates.frequency === 'NONE') {
					onChange({
						frequency: 'NONE',
						interval: 1
					});
					return;
				}

				// Reset frequency-specific fields
				delete newPattern.daysOfWeek;
				delete newPattern.dayOfMonth;
				delete newPattern.monthOfYear;
			}

			onChange(newPattern);
		},
		[value, onChange]
	);

	const handleFrequencyChange = (frequency: RecurrencePattern['frequency']) => {
		updatePattern({ frequency });
		setExpanded(frequency !== 'NONE');
	};

	const toggleDayOfWeek = (day: number) => {
		const currentDays = value.daysOfWeek || [];
		const newDays = currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day].sort();

		updatePattern({ daysOfWeek: newDays });
	};

	const addException = (date: Date | null) => {
		if (!date) return;

		const exceptions = value.exceptions || [];

		if (!exceptions.some((ex) => ex.getTime() === date.getTime())) {
			updatePattern({ exceptions: [...exceptions, date] });
		}
	};

	const removeException = (dateToRemove: Date) => {
		const exceptions = value.exceptions || [];
		updatePattern({
			exceptions: exceptions.filter((ex) => ex.getTime() !== dateToRemove.getTime())
		});
	};

	const getRecurrenceSummary = () => {
		if (value.frequency === 'NONE') return 'No recurrence';

		let summary = '';
		const interval = value.interval > 1 ? `every ${value.interval}` : 'every';

		switch (value.frequency) {
			case 'DAILY':
				summary = `${interval} day${value.interval > 1 ? 's' : ''}`;
				break;
			case 'WEEKLY':
				if (value.daysOfWeek?.length) {
					const dayNames = value.daysOfWeek.map((day) => DAYS_OF_WEEK[day].label).join(', ');
					summary = `${interval} week${value.interval > 1 ? 's' : ''} on ${dayNames}`;
				} else {
					summary = `${interval} week${value.interval > 1 ? 's' : ''}`;
				}

				break;
			case 'MONTHLY':
				summary = `${interval} month${value.interval > 1 ? 's' : ''}`;

				if (value.dayOfMonth) {
					summary += ` on day ${value.dayOfMonth}`;
				}

				break;
			case 'YEARLY':
				summary = `${interval} year${value.interval > 1 ? 's' : ''}`;
				break;
		}

		if (value.endDate) {
			summary += ` until ${value.endDate.toLocaleDateString()}`;
		} else if (value.occurrences) {
			summary += ` for ${value.occurrences} occurrences`;
		}

		return summary;
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Box>
				<Accordion
					expanded={expanded}
					onChange={(_, isExpanded) => setExpanded(isExpanded)}
					disabled={disabled}
				>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<EventIcon color="primary" />
							<Box>
								<Typography variant="subtitle1">Recurrence Pattern</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
								>
									{getRecurrenceSummary()}
								</Typography>
							</Box>
						</Box>
					</AccordionSummary>

					<AccordionDetails>
						<Stack spacing={3}>
							{error && <Alert severity="error">{error}</Alert>}

							{/* Frequency Selection */}
							<FormControl fullWidth>
								<InputLabel>Frequency</InputLabel>
								<Select
									value={value.frequency}
									label="Frequency"
									onChange={(e) =>
										handleFrequencyChange(e.target.value as RecurrencePattern['frequency'])
									}
								>
									{FREQUENCY_OPTIONS.map((option) => (
										<MenuItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							{value.frequency !== 'NONE' && (
								<>
									{/* Interval */}
									<TextField
										label="Repeat every"
										type="number"
										value={value.interval}
										onChange={(e) =>
											updatePattern({ interval: Math.max(1, parseInt(e.target.value) || 1) })
										}
										InputProps={{
											endAdornment: (
												<Typography
													variant="body2"
													color="text.secondary"
												>
													{value.frequency.toLowerCase().slice(0, -2)}
													{value.interval > 1 ? 's' : ''}
												</Typography>
											)
										}}
										inputProps={{ min: 1, max: 99 }}
										fullWidth
									/>

									{/* Weekly: Days of Week */}
									{value.frequency === 'WEEKLY' && (
										<Box>
											<Typography
												variant="subtitle2"
												gutterBottom
											>
												Repeat on days
											</Typography>
											<Stack
												direction="row"
												spacing={1}
												flexWrap="wrap"
											>
												{DAYS_OF_WEEK.map((day) => (
													<FormControlLabel
														key={day.value}
														control={
															<Checkbox
																checked={value.daysOfWeek?.includes(day.value) || false}
																onChange={() => toggleDayOfWeek(day.value)}
																size="small"
															/>
														}
														label={day.label}
													/>
												))}
											</Stack>
										</Box>
									)}

									{/* Monthly: Day of Month */}
									{value.frequency === 'MONTHLY' && (
										<TextField
											label="Day of month"
											type="number"
											value={value.dayOfMonth || ''}
											onChange={(e) =>
												updatePattern({ dayOfMonth: parseInt(e.target.value) || undefined })
											}
											inputProps={{ min: 1, max: 31 }}
											placeholder="Use start date's day"
											fullWidth
										/>
									)}

									{/* End Condition */}
									<Box>
										<Typography
											variant="subtitle2"
											gutterBottom
										>
											End condition
										</Typography>
										<Stack spacing={2}>
											<FormControlLabel
												control={
													<Checkbox
														checked={!value.endDate && !value.occurrences}
														onChange={(e) => {
															if (e.target.checked) {
																updatePattern({
																	endDate: undefined,
																	occurrences: undefined
																});
															}
														}}
													/>
												}
												label="Never ends"
											/>

											<Stack
												direction="row"
												spacing={2}
												alignItems="center"
											>
												<FormControlLabel
													control={
														<Checkbox
															checked={!!value.endDate}
															onChange={(e) => {
																if (e.target.checked) {
																	updatePattern({
																		endDate: new Date(
																			startDate.getTime() +
																				30 * 24 * 60 * 60 * 1000
																		),
																		occurrences: undefined
																	});
																} else {
																	updatePattern({ endDate: undefined });
																}
															}}
														/>
													}
													label="Ends on"
												/>

												{value.endDate && (
													<DatePicker
														value={value.endDate}
														onChange={(date) =>
															updatePattern({ endDate: date || undefined })
														}
														minDate={startDate}
														slotProps={{
															textField: { size: 'small', sx: { minWidth: 150 } }
														}}
													/>
												)}
											</Stack>

											<Stack
												direction="row"
												spacing={2}
												alignItems="center"
											>
												<FormControlLabel
													control={
														<Checkbox
															checked={!!value.occurrences}
															onChange={(e) => {
																if (e.target.checked) {
																	updatePattern({
																		occurrences: 10,
																		endDate: undefined
																	});
																} else {
																	updatePattern({ occurrences: undefined });
																}
															}}
														/>
													}
													label="Ends after"
												/>

												{value.occurrences && (
													<TextField
														type="number"
														value={value.occurrences}
														onChange={(e) =>
															updatePattern({
																occurrences: parseInt(e.target.value) || undefined
															})
														}
														size="small"
														inputProps={{ min: 1, max: 999 }}
														sx={{ width: 100 }}
													/>
												)}

												{value.occurrences && (
													<Typography
														variant="body2"
														color="text.secondary"
													>
														occurrences
													</Typography>
												)}
											</Stack>
										</Stack>
									</Box>

									{/* Exceptions */}
									<Box>
										<Typography
											variant="subtitle2"
											gutterBottom
										>
											Skip dates (exceptions)
										</Typography>

										<Stack spacing={2}>
											<DatePicker
												value={null}
												onChange={addException}
												minDate={startDate}
												slotProps={{
													textField: {
														placeholder: 'Add exception date',
														size: 'small',
														fullWidth: true
													}
												}}
											/>

											{value.exceptions && value.exceptions.length > 0 && (
												<Stack
													direction="row"
													spacing={1}
													flexWrap="wrap"
												>
													{value.exceptions.map((exception, index) => (
														<Chip
															key={index}
															label={exception.toLocaleDateString()}
															onDelete={() => removeException(exception)}
															deleteIcon={<ClearIcon />}
															size="small"
															variant="outlined"
														/>
													))}
												</Stack>
											)}
										</Stack>
									</Box>
								</>
							)}
						</Stack>
					</AccordionDetails>
				</Accordion>
			</Box>
		</LocalizationProvider>
	);
}
