'use client';

import { useState, useEffect, useCallback } from 'react';
import {
	Box,
	Typography,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	IconButton,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Stack
} from '@mui/material';
import {
	ChevronLeft as ChevronLeftIcon,
	ChevronRight as ChevronRightIcon,
	Today as TodayIcon,
	ViewWeek as ViewWeekIcon,
	ViewDay as ViewDayIcon,
	ViewModule as ViewModuleIcon,
	Add as AddIcon,
	Refresh as RefreshIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

import { PageTitle } from '@components/atoms';
import { CalendarView } from '@components/organisms/calendar/calendar-view';
import { useCalendarView, useReservation } from '@hooks/useAvailability';
import { useAuth } from '@hooks/useAuth';
import {
	CalendarViewType,
	CalendarEventDisplay,
	EventType,
	CreateReservationRequest
} from '@services/availability/types';

interface CalendarState {
	currentDate: Date;
	viewType: CalendarViewType;
	selectedResourceId: string;
	showOnlyMyReservations: boolean;
}

const VIEW_TYPE_ICONS = {
	MONTH: ViewModuleIcon,
	WEEK: ViewWeekIcon,
	DAY: ViewDayIcon,
	AGENDA: ViewWeekIcon
} as const;

export default function CalendarPage() {
	const router = useRouter();

	// State management
	const [calendarState, setCalendarState] = useState<CalendarState>({
		currentDate: new Date(),
		viewType: CalendarViewType.MONTH,
		selectedResourceId: '',
		showOnlyMyReservations: false
	});

	const [selectedEvent, setSelectedEvent] = useState<CalendarEventDisplay | null>(null);
	const [showEventDialog, setShowEventDialog] = useState(false);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [selectedDateForCreate, setSelectedDateForCreate] = useState<Date | null>(null);

	// Hooks
	const { user } = useAuth();
	const { loading, error, calendarData, getCalendarView } = useCalendarView();
	const { createReservation } = useReservation();

	// Load calendar data
	const loadCalendarData = useCallback(async () => {
		const startDate = getViewStartDate(calendarState.currentDate, calendarState.viewType);
		const endDate = getViewEndDate(calendarState.currentDate, calendarState.viewType);

		const query = {
			startDate,
			endDate,
			viewType: calendarState.viewType,
			...(calendarState.selectedResourceId && { resourceId: calendarState.selectedResourceId }),
			eventTypes: [
				EventType.RESERVATION,
				EventType.SCHEDULE,
				EventType.AVAILABILITY,
				EventType.EXTERNAL,
				EventType.BLOCKED
			],
			includeAvailability: true,
			includeExternalEvents: true,
			...(calendarState.showOnlyMyReservations && { userId: user?.id })
		};

		await getCalendarView(query);
	}, [calendarState, getCalendarView, user?.id]);

	useEffect(() => {
		loadCalendarData();
	}, [loadCalendarData]);

	// Helper functions
	const getViewStartDate = (date: Date, viewType: CalendarViewType): Date => {
		const start = new Date(date);
		switch (viewType) {
			case CalendarViewType.MONTH:
				start.setDate(1);
				start.setDate(start.getDate() - start.getDay()); // Start from Sunday of first week
				break;
			case CalendarViewType.WEEK:
				start.setDate(start.getDate() - start.getDay()); // Start from Sunday
				break;
			case CalendarViewType.DAY:
			case CalendarViewType.AGENDA:
				// Keep the same date
				break;
		}
		start.setHours(0, 0, 0, 0);
		return start;
	};

	const getViewEndDate = (date: Date, viewType: CalendarViewType): Date => {
		const end = new Date(date);
		switch (viewType) {
			case CalendarViewType.MONTH:
				end.setMonth(end.getMonth() + 1, 0); // Last day of month
				end.setDate(end.getDate() + (6 - end.getDay())); // End at Saturday of last week
				break;
			case CalendarViewType.WEEK:
				end.setDate(end.getDate() + (6 - end.getDay())); // End at Saturday
				break;
			case CalendarViewType.DAY:
			case CalendarViewType.AGENDA:
				// Keep the same date
				break;
		}
		end.setHours(23, 59, 59, 999);
		return end;
	};

	// Event handlers
	const handleViewChange = (newViewType: CalendarViewType) => {
		setCalendarState((prev) => ({ ...prev, viewType: newViewType }));
	};

	const handleDateNavigation = (direction: 'prev' | 'next' | 'today') => {
		setCalendarState((prev) => {
			let newDate = new Date(prev.currentDate);

			switch (direction) {
				case 'prev':
					switch (prev.viewType) {
						case CalendarViewType.MONTH:
							newDate.setMonth(newDate.getMonth() - 1);
							break;
						case CalendarViewType.WEEK:
							newDate.setDate(newDate.getDate() - 7);
							break;
						case CalendarViewType.DAY:
							newDate.setDate(newDate.getDate() - 1);
							break;
					}
					break;
				case 'next':
					switch (prev.viewType) {
						case CalendarViewType.MONTH:
							newDate.setMonth(newDate.getMonth() + 1);
							break;
						case CalendarViewType.WEEK:
							newDate.setDate(newDate.getDate() + 7);
							break;
						case CalendarViewType.DAY:
							newDate.setDate(newDate.getDate() + 1);
							break;
					}
					break;
				case 'today':
					newDate = new Date();
					break;
			}

			return { ...prev, currentDate: newDate };
		});
	};

	const handleEventClick = (event: CalendarEventDisplay) => {
		setSelectedEvent(event);
		setShowEventDialog(true);
	};

	const handleDateClick = (date: Date) => {
		setSelectedDateForCreate(date);
		setShowCreateDialog(true);
	};

	const handleCreateReservation = async (reservationData: CreateReservationRequest) => {
		const success = await createReservation({
			...reservationData,
			startDate: selectedDateForCreate || new Date(),
			endDate: new Date((selectedDateForCreate || new Date()).getTime() + 60 * 60 * 1000) // 1 hour later
		});

		if (success) {
			setShowCreateDialog(false);
			setSelectedDateForCreate(null);
			loadCalendarData();
		}
	};

	const formatDateRange = (date: Date, viewType: CalendarViewType): string => {
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long'
		};

		switch (viewType) {
			case CalendarViewType.MONTH:
				return date.toLocaleDateString('en-US', options);
			case CalendarViewType.WEEK: {
				const startOfWeek = getViewStartDate(date, viewType);
				const endOfWeek = getViewEndDate(date, viewType);
				return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
			}
			case CalendarViewType.DAY:
				return date.toLocaleDateString('en-US', { ...options, day: 'numeric', weekday: 'long' });
			default:
				return date.toLocaleDateString('en-US', options);
		}
	};

	const renderCalendarGrid = () => {
		if (!calendarData) return null;

		const { events, availabilitySlots } = calendarData;

		return (
			<CalendarView
				events={events}
				availabilitySlots={availabilitySlots}
				viewType={calendarState.viewType}
				currentDate={calendarState.currentDate}
				onDateChange={(date: Date) => setCalendarState((prev) => ({ ...prev, currentDate: date }))}
				onEventClick={handleEventClick}
				onDateClick={handleDateClick}
				loading={loading}
			/>
		);
	};

	return (
		<Box sx={{ p: 3 }}>
			{/* Header */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<PageTitle
					title="Calendar"
					subtitle="Resource availability and reservation calendar"
				/>

				<Stack
					direction="row"
					spacing={2}
					alignItems="center"
				>
					<Button
						variant="outlined"
						startIcon={<AddIcon />}
						onClick={() => setShowCreateDialog(true)}
					>
						New Reservation
					</Button>

					<IconButton onClick={() => loadCalendarData()}>
						<RefreshIcon />
					</IconButton>
				</Stack>
			</Box>

			{/* Calendar Controls */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Stack
					direction="row"
					spacing={1}
					alignItems="center"
				>
					<IconButton onClick={() => handleDateNavigation('prev')}>
						<ChevronLeftIcon />
					</IconButton>

					<Button
						variant="outlined"
						startIcon={<TodayIcon />}
						onClick={() => handleDateNavigation('today')}
					>
						Today
					</Button>

					<IconButton onClick={() => handleDateNavigation('next')}>
						<ChevronRightIcon />
					</IconButton>

					<Typography
						variant="h6"
						sx={{ ml: 2 }}
					>
						{formatDateRange(calendarState.currentDate, calendarState.viewType)}
					</Typography>
				</Stack>

				<Stack
					direction="row"
					spacing={1}
				>
					{Object.entries(VIEW_TYPE_ICONS).map(([viewType, IconComponent]) => (
						<Tooltip
							key={viewType}
							title={`${viewType} View`}
						>
							<IconButton
								color={calendarState.viewType === viewType ? 'primary' : 'default'}
								onClick={() => handleViewChange(viewType as CalendarViewType)}
							>
								<IconComponent />
							</IconButton>
						</Tooltip>
					))}
				</Stack>
			</Box>

			{/* Filters */}
			<Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
				<FormControl
					size="small"
					sx={{ minWidth: 200 }}
				>
					<InputLabel>Resource</InputLabel>
					<Select
						value={calendarState.selectedResourceId}
						label="Resource"
						onChange={(e) =>
							setCalendarState((prev) => ({
								...prev,
								selectedResourceId: e.target.value
							}))
						}
					>
						<MenuItem value="">All Resources</MenuItem>
						{/* TODO: Add actual resources from API */}
						<MenuItem value="resource-1">Conference Room A</MenuItem>
						<MenuItem value="resource-2">Laboratory B</MenuItem>
						<MenuItem value="resource-3">Auditorium C</MenuItem>
					</Select>
				</FormControl>
			</Box>

			{/* Calendar Grid */}
			<Box sx={{ minHeight: 600 }}>
				{loading ? (
					<Typography
						align="center"
						sx={{ py: 4 }}
					>
						Loading calendar...
					</Typography>
				) : error ? (
					<Typography
						color="error"
						align="center"
						sx={{ py: 4 }}
					>
						Error loading calendar: {error}
					</Typography>
				) : (
					renderCalendarGrid()
				)}
			</Box>

			{/* Event Details Dialog */}
			<Dialog
				open={showEventDialog}
				onClose={() => setShowEventDialog(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>Event Details</DialogTitle>
				<DialogContent>
					{selectedEvent && (
						<Stack spacing={2}>
							<TextField
								label="Title"
								value={selectedEvent.title}
								InputProps={{ readOnly: true }}
								fullWidth
							/>
							<Stack
								direction="row"
								spacing={2}
							>
								<TextField
									label="Start"
									value={new Date(selectedEvent.start).toLocaleString()}
									InputProps={{ readOnly: true }}
									fullWidth
								/>
								<TextField
									label="End"
									value={new Date(selectedEvent.end).toLocaleString()}
									InputProps={{ readOnly: true }}
									fullWidth
								/>
							</Stack>
							<TextField
								label="Type"
								value={selectedEvent.type}
								InputProps={{ readOnly: true }}
								fullWidth
							/>
							<TextField
								label="Status"
								value={selectedEvent.status}
								InputProps={{ readOnly: true }}
								fullWidth
							/>
							{selectedEvent.resourceName && (
								<TextField
									label="Resource"
									value={selectedEvent.resourceName}
									InputProps={{ readOnly: true }}
									fullWidth
								/>
							)}
						</Stack>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowEventDialog(false)}>Close</Button>
					{selectedEvent?.isEditable && (
						<Button
							variant="contained"
							onClick={() => {
								// TODO: Navigate to edit page
								router.push(`/reservations/${selectedEvent.id}/edit`);
							}}
						>
							Edit
						</Button>
					)}
				</DialogActions>
			</Dialog>

			{/* Create Reservation Dialog */}
			<Dialog
				open={showCreateDialog}
				onClose={() => setShowCreateDialog(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Create New Reservation</DialogTitle>
				<DialogContent>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ mb: 2 }}
					>
						Quick reservation creation. For advanced options, use the full reservation form.
					</Typography>
					{selectedDateForCreate && (
						<Typography
							variant="body2"
							sx={{ mb: 2 }}
						>
							Selected Date: {selectedDateForCreate.toLocaleDateString()}
						</Typography>
					)}
					<TextField
						autoFocus
						margin="dense"
						label="Reservation Title"
						fullWidth
						placeholder="Enter reservation title..."
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
					<Button
						onClick={() => router.push('/reservations/create')}
						variant="outlined"
					>
						Full Form
					</Button>
					<Button
						onClick={() =>
							user?.id &&
							handleCreateReservation({
								title: 'Nueva Reserva',
								startDate: selectedDateForCreate || new Date(),
								endDate: selectedDateForCreate || new Date(),
								resourceId: '',
								userId: user.id
							})
						}
						variant="contained"
					>
						Quick Create
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
