'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import type {
	CreateResourceDto,
	UpdateResourceDto,
	ResourceResponseDto,
	ResourceType,
	ResourceStatus,
	CategoryDto,
	ProgramDto
} from '../../../services/resources/types';
import {
	createResource,
	getResourceById,
	updateResource,
	listCategories,
	listActivePrograms
} from '../../../services/resources/services';
import { mockCreateResource, mockGetResourceById } from '../../../services/resources/mocks/crud';
import {
	Autocomplete,
	Box,
	Button,
	Chip,
	Divider,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Switch,
	TextField,
	Typography
} from '@mui/material';
import { getResourceI18n } from '../../helpers/resources-i18n';
import { useTranslation } from 'react-i18next';
import { AvailabilityRulesForm, type AvailabilityRulesFormData } from './availability-rules-form';

interface ResourceFormProps {
	mode?: 'create' | 'edit';
	resourceId?: string;
	onCreated?: (resource: ResourceResponseDto) => void;
	onUpdated?: (resource: ResourceResponseDto) => void;
}

const useMocks = process.env.NODE_ENV === 'development';

// Equipment options for resources
const EQUIPMENT_OPTIONS = [
	'Projector',
	'Whiteboard',
	'Interactive Whiteboard',
	'Computer',
	'Audio System',
	'Video Conference',
	'Air Conditioning',
	'WiFi',
	'Microphone',
	'Camera',
	'Speakers',
	'Laptop Connections',
	'Power Outlets',
	'Laboratory Equipment',
	'Medical Equipment',
	'Research Tools',
	'Printing Equipment'
];

const ACCESSIBILITY_OPTIONS = [
	'Wheelchair Accessible',
	'Hearing Loop',
	'Visual Aids Support',
	'Adjustable Tables',
	'Accessible Parking',
	'Elevator Access'
];

const SPECIAL_CONDITIONS = [
	'Climate Controlled',
	'Soundproof',
	'Natural Light',
	'Blackout Capability',
	'High Security',
	'Food Allowed',
	'Chemical Storage',
	'Biohazard Protocols'
];

// Unified form data type that works for both create and edit
type UnifiedResourceFormData = {
	name?: string;
	type?: ResourceType;
	location?: string;
	capacity?: number;
	description?: string;
	status?: ResourceStatus;
	categoryId?: string;
	programId?: string;
	attributes?: {
		equipment?: string[];
		accessibility?: string[];
		specialConditions?: string[];
		technicalSpecs?: Record<string, unknown>;
	};
	availabilityRules?: AvailabilityRulesFormData;
	isActive?: boolean;
};

export function ResourceForm(props: ResourceFormProps) {
	const router = useRouter();
	const { enqueueSnackbar } = useSnackbar();
	const isEditMode = props.mode === 'edit';
	const i18nResources = getResourceI18n(useTranslation('resources').t);

	// State for dropdowns
	const [categories, setCategories] = useState<CategoryDto[]>([]);
	const [programs, setPrograms] = useState<ProgramDto[]>([]);
	const [loadingCategories, setLoadingCategories] = useState(false);
	const [loadingPrograms, setLoadingPrograms] = useState(false);

	// Unified form setup
	const form = useForm<UnifiedResourceFormData>({
		defaultValues: {
			name: '',
			type: 'CLASSROOM' as ResourceType,
			location: '',
			capacity: 1,
			description: '',
			status: 'AVAILABLE' as ResourceStatus,
			categoryId: '',
			programId: '',
			attributes: { 
				equipment: [],
				accessibility: [],
				specialConditions: [],
				technicalSpecs: {}
			},
			availabilityRules: {
				weeklySchedules: [
					{ dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isActive: true }
				],
				blockedPeriods: [],
				timeRestrictions: {
					minReservationTime: 30,
					maxReservationTime: 240,
					preparationTime: 15,
					advanceBookingMin: 2,
					advanceBookingMax: 720
				},
				priorityRules: [],
				requiresApproval: false,
				allowRecurring: true,
				specialRequirements: []
			},
			isActive: true
		}
	});

	const {
		handleSubmit,
		control,
		setValue,
		formState: { errors, isSubmitting }
	} = form;

	const [apiError, setApiError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Watch form values for real-time updates

	// Load categories and programs
	useEffect(() => {
		const loadData = async () => {
			try {
				// Load categories
				setLoadingCategories(true);
				const categoriesData = await listCategories({ isActive: true });
				setCategories(categoriesData);

				// Load programs
				setLoadingPrograms(true);
				const programsData = await listActivePrograms();
				setPrograms(programsData);
			} catch (error) {
				console.error('Error loading dropdown data:', error);
				enqueueSnackbar('Failed to load form data', { variant: 'error' });
			} finally {
				setLoadingCategories(false);
				setLoadingPrograms(false);
			}
		};

		loadData();
	}, [enqueueSnackbar]);

	// Load resource data for edit mode
	useEffect(() => {
		if (isEditMode && props.resourceId) {
			const loadResource = async () => {
				setLoading(true);
				try {
					const resource = useMocks
						? mockGetResourceById(props.resourceId!)
						: await getResourceById(props.resourceId!);

					// Reset form with resource data
					setValue('name', resource.name);
					setValue('description', resource.description || '');
					setValue('location', resource.location || '');
					setValue('capacity', resource.capacity || 1);
					setValue('status', resource.status || 'AVAILABLE');
					setValue('categoryId', resource.categoryId || '');
					setValue('programId', resource.programId || '');
					setValue('attributes', resource.attributes || { 
						equipment: [],
						accessibility: [],
						specialConditions: [],
						technicalSpecs: {}
					});
					setValue('availabilityRules', (resource.availabilityRules as unknown as AvailabilityRulesFormData) || {
						weeklySchedules: [
							{ dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isActive: true }
						],
						blockedPeriods: [],
						timeRestrictions: {
							minReservationTime: 30,
							maxReservationTime: 240,
							preparationTime: 15,
							advanceBookingMin: 2,
							advanceBookingMax: 30
						},
						priorityRules: [],
						requiresApproval: false,
						allowRecurring: true,
						specialRequirements: []
					});
					setValue('isActive', resource.isActive ?? true);
				} catch (_error) {
					setApiError('Failed to load resource');
					enqueueSnackbar('Failed to load resource', { variant: 'error' });
				} finally {
					setLoading(false);
				}
			};
			loadResource();
		}
	}, [isEditMode, props.resourceId, setValue, enqueueSnackbar]);

	const onSubmit = handleSubmit(async (values: UnifiedResourceFormData) => {
		try {
			setApiError(null);
			
			if (isEditMode && props.resourceId) {
				const updateData: UpdateResourceDto = {
					name: values.name,
					location: values.location,
					capacity: values.capacity,
					description: values.description,
					attributes: values.attributes,
					availabilityRules: values.availabilityRules as unknown as Record<string, unknown>,
					isActive: values.isActive
				};
				
				const result = useMocks 
					? await mockCreateResource(updateData as CreateResourceDto)
					: await updateResource(props.resourceId, updateData);
				
				enqueueSnackbar('Resource updated successfully', { variant: 'success' });
				props.onUpdated?.(result);
			} else {
				// Create mode - all required fields should be present
				if (!values.name || !values.type || !values.location || !values.capacity || 
					!values.categoryId || !values.programId) {
					throw new Error('Please fill all required fields');
				}

				const createData: CreateResourceDto = {
					name: values.name,
					type: values.type,
					location: values.location,
					capacity: values.capacity,
					description: values.description || '',
					categoryId: values.categoryId,
					programId: values.programId,
					attributes: values.attributes || {},
					availabilityRules: (values.availabilityRules as unknown as Record<string, unknown>) || {}
				};
				
				const result = useMocks 
					? await mockCreateResource(createData)
					: await createResource(createData);
				
				enqueueSnackbar('Resource created successfully', { variant: 'success' });
				props.onCreated?.(result);
				
				// Navigate to resources list after creation
				router.push('/resources');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'An error occurred';
			setApiError(errorMessage);
			enqueueSnackbar(errorMessage, { variant: 'error' });
		}
	});

	if (loading) return <Typography>Loading...</Typography>;

	return (
		<Box
			component="form"
			onSubmit={onSubmit}
			sx={{ maxWidth: 800, mx: 'auto', p: 3 }}
		>
			<Typography
				variant="h4"
				gutterBottom
			>
				{isEditMode ? 'Edit Resource' : 'Create New Resource'}
			</Typography>
			{apiError && (
				<Typography
					color="error"
					sx={{ mb: 2 }}
				>
					{apiError}
				</Typography>
			)}

			<Stack spacing={3}>
				<Typography variant="h5" gutterBottom>
					{isEditMode ? 'Edit Resource' : 'Create New Resource'}
				</Typography>

				<Controller
					name="name"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="Resource Name"
							required
							fullWidth
							error={!!errors.name}
							helperText={errors.name?.message}
						/>
					)}
				/>

				<Controller
					name="type"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							select
							label="Resource Type"
							required
							fullWidth
							error={!!errors.type}
							helperText={errors.type?.message}
						>
							{Object.entries(i18nResources.type || {}).map(([key, label]) => (
								<MenuItem key={key} value={key}>
									{label}
								</MenuItem>
							))}
						</TextField>
					)}
				/>

				<Controller
					name="location"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="Location"
							required
							fullWidth
							error={!!errors.location}
							helperText={errors.location?.message}
						/>
					)}
				/>

				<Controller
					name="capacity"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="Capacity"
							type="number"
							required
							fullWidth
							inputProps={{ min: 1 }}
							error={!!errors.capacity}
							helperText={errors.capacity?.message}
						/>
					)}
				/>

				<Controller
					name="description"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="Description"
							multiline
							rows={3}
							fullWidth
							error={!!errors.description}
							helperText={errors.description?.message}
						/>
					)}
				/>

				<FormControl fullWidth required error={!!errors.categoryId}>
					<InputLabel>Category</InputLabel>
					<Controller
						name="categoryId"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								label="Category"
								disabled={loadingCategories}
							>
								{categories.map((category) => (
									<MenuItem key={category.id} value={category.id}>
										{category.name}
									</MenuItem>
								))}
							</Select>
						)}
					/>
				</FormControl>

				<FormControl fullWidth required error={!!errors.programId}>
					<InputLabel>Academic Program</InputLabel>
					<Controller
						name="programId"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								label="Academic Program"
								disabled={loadingPrograms}
							>
								{programs.map((program) => (
									<MenuItem key={program.id} value={program.id}>
										{program.name}
									</MenuItem>
								))}
							</Select>
						)}
					/>
				</FormControl>

				<Controller
					name="status"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							select
							label="Status"
							fullWidth
							error={!!errors.status}
							helperText={errors.status?.message}
						>
							{Object.entries(i18nResources.status || {}).map(([key, label]) => (
								<MenuItem key={key} value={key}>
									{label}
								</MenuItem>
							))}
						</TextField>
					)}
				/>

				<Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
					Technical Attributes
				</Typography>

				<Controller
					name="attributes.equipment"
					control={control}
					render={({ field }) => (
						<Autocomplete
							{...field}
							multiple
							options={EQUIPMENT_OPTIONS}
							value={field.value || []}
							onChange={(_, newValue) => field.onChange(newValue)}
							renderTags={(value, getTagProps) =>
								value.map((option, index) => (
									<Chip
										variant="outlined"
										label={option}
										{...getTagProps({ index })}
										key={option}
									/>
								))
							}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Equipment"
									placeholder="Select available equipment"
								/>
							)}
						/>
					)}
				/>

				<Controller
					name="attributes.accessibility"
					control={control}
					render={({ field }) => (
						<Autocomplete
							{...field}
							multiple
							options={ACCESSIBILITY_OPTIONS}
							value={field.value || []}
							onChange={(_, newValue) => field.onChange(newValue)}
							renderTags={(value, getTagProps) =>
								value.map((option, index) => (
									<Chip
										variant="outlined"
										label={option}
										{...getTagProps({ index })}
										key={option}
									/>
								))
							}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Accessibility Features"
									placeholder="Select accessibility features"
								/>
							)}
						/>
					)}
				/>

				<Controller
					name="attributes.specialConditions"
					control={control}
					render={({ field }) => (
						<Autocomplete
							{...field}
							multiple
							options={SPECIAL_CONDITIONS}
							value={field.value || []}
							onChange={(_, newValue) => field.onChange(newValue)}
							renderTags={(value, getTagProps) =>
								value.map((option, index) => (
									<Chip
										variant="outlined"
										label={option}
										{...getTagProps({ index })}
										key={option}
									/>
								))
							}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Special Conditions"
									placeholder="Select special conditions"
								/>
							)}
						/>
					)}
				/>

				<Box>
					<Typography variant="h6" gutterBottom>
						Availability Rules
					</Typography>
					<Controller
						name="availabilityRules"
						control={control}
						render={({ field }) => (
							<AvailabilityRulesForm
								value={field.value}
								onChange={field.onChange}
							/>
						)}
					/>
				</Box>

				{isEditMode && (
					<FormControlLabel
						control={
							<Controller
								name="isActive"
								control={control}
								render={({ field }) => (
									<Switch
										{...field}
										checked={field.value}
									/>
								)}
							/>
						}
						label="Active"
					/>
				)}
			</Stack>

			<Divider sx={{ my: 3 }} />

			<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
				<Button onClick={() => router.push('/resources')}>Cancel</Button>
				<Button
					type="submit"
					variant="contained"
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
				</Button>
			</Box>
		</Box>
	);
}
