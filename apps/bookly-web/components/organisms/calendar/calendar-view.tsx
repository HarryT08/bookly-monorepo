'use client';

import React from 'react';
import {
	Box,
	Card,
	CardContent,
	Typography,
	Stack,
	Paper,
	Chip,
	alpha,
} from '@mui/material';

import { CalendarEventDisplay, CalendarViewType, EventType, AvailabilitySlot } from '@services/availability/types';

interface CalendarViewProps {
	events: CalendarEventDisplay[];
	availabilitySlots?: AvailabilitySlot[];
	viewType: CalendarViewType;
	currentDate: Date;
	onDateChange: (date: Date) => void;
	onEventClick?: (event: CalendarEventDisplay) => void;
	onDateClick?: (date: Date) => void;
	onViewTypeChange?: (viewType: CalendarViewType) => void;
	loading?: boolean;
}

const EVENT_TYPE_COLORS = {
	RESERVATION: '#1976d2',
	SCHEDULE: '#388e3c',
	AVAILABILITY: '#f57c00',
	EXTERNAL: '#7b1fa2',
	BLOCKED: '#d32f2f'
} as const;

export function CalendarView({
	events,
	availabilitySlots = [],
	viewType,
	currentDate,
	onDateChange,
	onEventClick,
	onDateClick,
	loading = false
}: CalendarViewProps) {
	const getDaysInMonth = (date: Date): Date[] => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);

		// Start from Sunday of the week containing first day
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - startDate.getDay());

		// End at Saturday of the week containing last day
		const endDate = new Date(lastDay);
		endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

		const days = [];
		for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
			days.push(new Date(d));
		}

		return days;
	};

	const getWeekDays = (date: Date): Date[] => {
		const startOfWeek = new Date(date);
		startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

		const days = [];
		for (let i = 0; i < 7; i++) {
			const day = new Date(startOfWeek);
			day.setDate(day.getDate() + i);
			days.push(day);
		}

		return days;
	};

	const getEventsForDate = (date: Date): CalendarEventDisplay[] => {
		return events.filter((event) => {
			const eventStart = new Date(event.start);
			const eventEnd = new Date(event.end);
			const checkDate = new Date(date);
			checkDate.setHours(0, 0, 0, 0);

			// Check if event spans this date
			return (
				eventStart.toDateString() === checkDate.toDateString() ||
				(eventStart <= checkDate && eventEnd >= checkDate)
			);
		});
	};

	const getAvailabilitySlotsForDate = (date: Date): AvailabilitySlot[] => {
		return availabilitySlots.filter((slot) => {
			const slotStart = new Date(slot.start);
			return slotStart.toDateString() === date.toDateString();
		});
	};

	const handleEventClick = (event: CalendarEventDisplay, e: React.MouseEvent) => {
		e.stopPropagation();
		onEventClick?.(event);
	};

	const handleDateClick = (date: Date) => {
		onDateClick?.(date);
	};

	const renderDayCell = (date: Date, isCurrentMonth: boolean = true) => {
		const dayEvents = getEventsForDate(date);
		const daySlots = getAvailabilitySlotsForDate(date);
		const isToday = date.toDateString() === new Date().toDateString();
		const isWeekend = date.getDay() === 0 || date.getDay() === 6;

		return (
			<Paper
				elevation={isToday ? 2 : 1}
				sx={{
					minHeight: viewType === CalendarViewType.MONTH ? 120 : 80,
					p: 1,
					cursor: 'pointer',
					bgcolor: isToday ? alpha('#1976d2', 0.1) : 'background.paper',
					border: isToday ? '2px solid #1976d2' : '1px solid',
					borderColor: isToday ? '#1976d2' : 'divider',
					opacity: isCurrentMonth ? 1 : 0.6,
					'&:hover': {
						bgcolor: alpha('#1976d2', 0.05),
						elevation: 3
					}
				}}
				onClick={() => handleDateClick(date)}
			>
				<Stack
					spacing={0.5}
					sx={{ height: '100%' }}
				>
					{/* Date header */}
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<Typography
							variant="body2"
							sx={{
								fontWeight: isToday ? 'bold' : 'normal',
								color: isWeekend ? 'text.secondary' : 'text.primary'
							}}
						>
							{date.getDate()}
						</Typography>

						{/* Availability indicator */}
						{daySlots.length > 0 && (
							<Box
								sx={{
									width: 8,
									height: 8,
									borderRadius: '50%',
									bgcolor: daySlots.some((slot) => slot.isAvailable) ? 'success.main' : 'warning.main'
								}}
							/>
						)}
					</Box>

					{/* Events */}
					<Stack
						spacing={0.25}
						sx={{ flexGrow: 1, overflow: 'hidden' }}
					>
						{dayEvents.slice(0, viewType === CalendarViewType.MONTH ? 3 : 5).map((event, index) => (
							<Chip
								key={`${event.id}-${index}`}
								label={event.title}
								size="small"
								sx={{
									height: 18,
									fontSize: '0.7rem',
									bgcolor: event.color || EVENT_TYPE_COLORS[event.type],
									color: 'white',
									'& .MuiChip-label': {
										px: 1,
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap'
									},
									'&:hover': {
										bgcolor: alpha(event.color || EVENT_TYPE_COLORS[event.type], 0.8)
									}
								}}
								onClick={(e) => handleEventClick(event, e)}
							/>
						))}

						{dayEvents.length > (viewType === CalendarViewType.MONTH ? 3 : 5) && (
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ pl: 1, fontSize: '0.65rem' }}
							>
								+{dayEvents.length - (viewType === CalendarViewType.MONTH ? 3 : 5)} more
							</Typography>
						)}
					</Stack>
				</Stack>
			</Paper>
		);
	};

	const renderMonthView = () => {
		const days = getDaysInMonth(currentDate);
		const weeks = [];

		for (let i = 0; i < days.length; i += 7) {
			const week = days.slice(i, i + 7);
			weeks.push(week);
		}

		return (
			<Stack spacing={1}>
				{/* Day headers */}
				<Box sx={{ display: 'flex', gap: 1 }}>
					{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
						<Box key={day} sx={{ flex: 1 }}>
							<Typography
								variant="subtitle2"
								align="center"
								sx={{
									p: 1,
									fontWeight: 'bold',
									color: 'text.secondary'
								}}
							>
								{day}
							</Typography>
						</Box>
					))}
				</Box>

				{/* Calendar grid */}
				{weeks.map((week, weekIndex) => (
					<Box key={weekIndex} sx={{ display: 'flex', gap: 1 }}>
						{week.map((date, dayIndex) => {
							const isCurrentMonth = date.getMonth() === currentDate.getMonth();
							return (
								<Box key={dayIndex} sx={{ flex: 1 }}>
									{renderDayCell(date, isCurrentMonth)}
								</Box>
							);
						})}
					</Box>
				))}
			</Stack>
		);
	};

	const renderWeekView = () => {
		const days = getWeekDays(currentDate);

		return (
			<Stack spacing={1}>
				{/* Day headers */}
				<Box sx={{ display: 'flex', gap: 1 }}>
					{days.map((date, index) => (
						<Box key={index} sx={{ flex: 1 }}>
							<Typography
								variant="subtitle2"
								align="center"
								sx={{ p: 1, fontWeight: 'bold' }}
							>
								{date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
							</Typography>
						</Box>
					))}
				</Box>

				{/* Week grid */}
				<Box sx={{ display: 'flex', gap: 1 }}>
					{days.map((date, index) => (
						<Box key={index} sx={{ flex: 1 }}>
							{renderDayCell(date, true)}
						</Box>
					))}
				</Box>
			</Stack>
		);
	};

	const renderDayView = () => {
		const dayEvents = getEventsForDate(currentDate).sort(
			(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
		);

		return (
			<Stack spacing={2}>
				<Typography
					variant="h6"
					align="center"
				>
					{currentDate.toLocaleDateString('en-US', {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</Typography>

				<Stack spacing={1}>
					{dayEvents.length === 0 ? (
						<Typography
							variant="body2"
							color="text.secondary"
							align="center"
							sx={{ py: 4 }}
						>
							No events scheduled for this day
						</Typography>
					) : (
						dayEvents.map((event, index) => (
							<Card
								key={`${event.id}-${index}`}
								elevation={1}
								sx={{
									cursor: 'pointer',
									'&:hover': { elevation: 2 }
								}}
								onClick={() => handleEventClick(event, {} as React.MouseEvent)}
							>
								<CardContent sx={{ py: 2 }}>
									<Stack
										direction="row"
										spacing={2}
										alignItems="center"
									>
										<Box
											sx={{
												width: 12,
												height: 12,
												borderRadius: 1,
												bgcolor: event.color || EVENT_TYPE_COLORS[event.type]
											}}
										/>
										<Box sx={{ flexGrow: 1 }}>
											<Typography variant="subtitle1">{event.title}</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												{new Date(event.start).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit'
												})}{' '}
												-
												{new Date(event.end).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit'
												})}
											</Typography>
											{event.resourceName && (
												<Typography
													variant="caption"
													color="text.secondary"
												>
													{event.resourceName}
												</Typography>
											)}
										</Box>
										<Chip
											label={event.type}
											size="small"
											color={event.status === 'CONFIRMED' ? 'success' : 'default'}
										/>
									</Stack>
								</CardContent>
							</Card>
						))
					)}
				</Stack>
			</Stack>
		);
	};

	const renderAgendaView = () => {
		const upcomingEvents = events
			.filter((event) => new Date(event.start) >= new Date())
			.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
			.slice(0, 50); // Limit to next 50 events

		return (
			<Stack spacing={2}>
				<Typography variant="h6">Upcoming Events</Typography>

				{upcomingEvents.length === 0 ? (
					<Typography
						variant="body2"
						color="text.secondary"
						align="center"
						sx={{ py: 4 }}
					>
						No upcoming events
					</Typography>
				) : (
					upcomingEvents.map((event, index) => (
						<Card
							key={`${event.id}-${index}`}
							elevation={1}
							sx={{
								cursor: 'pointer',
								'&:hover': { elevation: 2 }
							}}
							onClick={() => handleEventClick(event, {} as React.MouseEvent)}
						>
							<CardContent sx={{ py: 2 }}>
								<Stack
									direction="row"
									spacing={2}
									alignItems="center"
								>
									<Stack
										spacing={0.5}
										alignItems="center"
										sx={{ minWidth: 60 }}
									>
										<Typography
											variant="caption"
											color="text.secondary"
										>
											{new Date(event.start).toLocaleDateString('en-US', { month: 'short' })}
										</Typography>
										<Typography variant="h6">{new Date(event.start).getDate()}</Typography>
									</Stack>

									<Box
										sx={{
											width: 4,
											height: 40,
											bgcolor: event.color || EVENT_TYPE_COLORS[event.type],
											borderRadius: 1
										}}
									/>

									<Box sx={{ flexGrow: 1 }}>
										<Typography variant="subtitle1">{event.title}</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
										>
											{new Date(event.start).toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit'
											})}{' '}
											-
											{new Date(event.end).toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit'
											})}
										</Typography>
										{event.resourceName && (
											<Typography
												variant="caption"
												color="text.secondary"
											>
												Resource: {event.resourceName}
											</Typography>
										)}
									</Box>

									<Stack
										spacing={0.5}
										alignItems="center"
									>
										<Chip
											label={event.type}
											size="small"
											sx={{ bgcolor: alpha(EVENT_TYPE_COLORS[event.type], 0.1) }}
										/>
										<Chip
											label={event.status}
											size="small"
											color={event.status === 'CONFIRMED' ? 'success' : 'default'}
										/>
									</Stack>
								</Stack>
							</CardContent>
						</Card>
					))
				)}
			</Stack>
		);
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
				<Typography
					variant="h6"
					color="text.secondary"
				>
					Loading calendar...
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ width: '100%' }}>
			{viewType === CalendarViewType.MONTH && renderMonthView()}
			{viewType === CalendarViewType.WEEK && renderWeekView()}
			{viewType === CalendarViewType.DAY && renderDayView()}
			{viewType === CalendarViewType.AGENDA && renderAgendaView()}
		</Box>
	);
}
