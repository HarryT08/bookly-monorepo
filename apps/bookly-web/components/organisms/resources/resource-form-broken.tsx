'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import type {
	CreateResourceDto,
	UpdateResourceDto,
	ResourceResponseDto,
	ResourceType,
	ResourceStatus
} from '../../../services/resources/types';
import { createResourceSchema } from '../../../services/resources/validation';
import { createResource, getResourceById, updateResource } from '../../../services/resources/services';
import { mockCreateResource, mockGetResourceById, mockUpdateResource } from '../../../services/resources/mocks/crud';
import { Button, TextField, MenuItem, Typography, Box, Stack } from '@mui/material';
import { getResourceI18n } from '../../helpers/resources-i18n';
import { useTranslation } from 'react-i18next';

interface ResourceFormProps {
	mode: 'create' | 'edit';
	resourceId?: string;
	onCreated?: (resource: ResourceResponseDto) => void;
	onUpdated?: (resource: ResourceResponseDto) => void;
}

const useMocks = process.env.NODE_ENV === 'development';

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
	attributes?: Record<string, unknown>;
	availabilityRules?: Record<string, unknown>;
	isActive?: boolean;
};

export function ResourceForm(props: ResourceFormProps) {
	const router = useRouter();
	const { enqueueSnackbar } = useSnackbar();
	const isEditMode = props.mode === 'edit';
	const i18nResources = getResourceI18n(useTranslation('resources').t);

	// Unified form setup
	const form = useForm<UnifiedResourceFormData>({
		resolver: zodResolver(createResourceSchema),
		defaultValues: {
			name: '',
			type: 'CLASSROOM' as ResourceType,
			location: '',
			capacity: 1,
			description: '',
			status: 'AVAILABLE' as ResourceStatus,
			categoryId: '',
			programId: '',
			attributes: {},
			availabilityRules: {},
			isActive: true
		}
	});

	const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = form;

	const [apiError, setApiError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Load resource data for edit mode
	useEffect(() => {
		if (isEditMode && props.resourceId) {
			setLoading(true);
			const loadResource = async () => {
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
					setValue('attributes', resource.attributes || {});
					setValue('availabilityRules', resource.availabilityRules || {});
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

	// Submit handlers
	const onSubmit = handleSubmit(async (values: UnifiedResourceFormData) => {
		try {
			if (isEditMode) {
				// For edit mode, use update DTO structure
				const updateData: UpdateResourceDto = {
					name: values.name,
					location: values.location,
					capacity: values.capacity,
					description: values.description,
					status: values.status,
					attributes: values.attributes,
					availabilityRules: values.availabilityRules,
					isActive: values.isActive
				};
				const updated = useMocks
					? mockUpdateResource(props.resourceId!, updateData)
					: await updateResource(props.resourceId!, updateData);
				props.onUpdated?.(updated);
				enqueueSnackbar('Resource updated successfully', { variant: 'success' });
			} else {
				// For create mode, use create DTO structure
				const createData: CreateResourceDto = {
					name: values.name,
					type: values.type!,
					location: values.location,
					capacity: values.capacity,
					description: values.description,
					categoryId: values.categoryId!,
					programId: values.programId!,
					attributes: values.attributes,
					availabilityRules: values.availabilityRules
				};
				const created = useMocks
					? mockCreateResource(createData)
					: await createResource(createData);
				props.onCreated?.(created);
				enqueueSnackbar('Resource created successfully', { variant: 'success' });
			}
			router.push('/resources');
		} catch (_error) {
			const message = isEditMode ? 'Failed to update resource' : 'Failed to create resource';
			setApiError(message);
			enqueueSnackbar(message, { variant: 'error' });
		}
	});

	if (loading) {
		return <Typography>Loading...</Typography>;
	}

	return (
		<Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
			<Typography variant="h4" gutterBottom>
				{isEditMode ? i18nResources.editResource : i18nResources.createResource}
			</Typography>

			{apiError && (
				<Typography color="error" sx={{ mb: 2 }}>
					{apiError}
				</Typography>
			)}

			<Stack spacing={3}>
				{/* Name Field */}
				<TextField
					{...register('name')}
					label={i18nResources.name}
					fullWidth
					error={!!errors.name}
					helperText={errors.name?.message}
					required
				/>

				{/* Resource Type (only for create mode) */}
				{!isEditMode && (
						<Controller
							name="type"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label={i18nResources.type}
									select
									fullWidth
									error={!!errors.location}
									helperText={errors.location?.message}
									required
								>
									<MenuItem value="CLASSROOM">{i18nResources.classroom}</MenuItem>
									<MenuItem value="AUDITORIUM">{i18nResources.auditorium}</MenuItem>
									<MenuItem value="LABORATORY">{i18nResources.laboratory}</MenuItem>
									<MenuItem value="OFFICE">{i18nResources.office}</MenuItem>
									<MenuItem value="EQUIPMENT">{i18nResources.equipment}</MenuItem>
									<MenuItem value="VEHICLE">{i18nResources.vehicle}</MenuItem>
									<MenuItem value="OTHER">{i18nResources.other}</MenuItem>
								</TextField>
							)}
						/>
				)}

				{/* Status Field (only for edit mode) */}
				{isEditMode && (
					<Controller
							name="status"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label={i18nResources.status}
									select
									fullWidth
									error={!!errors.status}
									helperText={errors.status?.message}
								>
									<MenuItem value="AVAILABLE">{i18nResources.available}</MenuItem>
									<MenuItem value="OCCUPIED">{i18nResources.occupied}</MenuItem>
									<MenuItem value="MAINTENANCE">{i18nResources.maintenance}</MenuItem>
									<MenuItem value="OUT_OF_SERVICE">{i18nResources.outOfService}</MenuItem>
									<MenuItem value="RESERVED">{i18nResources.reserved}</MenuItem>
								</TextField>
							)}
						/>
					</Grid>
				)}

				{/* Location Field */}
					<TextField
						{...register('location')}
						label={i18nResources.location}
						fullWidth
						error={!!errors.location}
						helperText={errors.location?.message}
						placeholder={i18nResources.locationExample}
					/>
				</Grid>

				{/* Capacity Field */}
					<TextField
						{...register('capacity', { valueAsNumber: true })}
						label={i18nResources.capacity}
						type="number"
						inputProps={{ min: 1 }}
						error={!!errors.capacity}
						helperText={errors.capacity?.message}
						required
					/>
				</Grid>

				{/* Category ID (only for create mode) */}
				{!isEditMode && (
					<TextField
							{...register('categoryId')}
							label={i18nResources.category}
							fullWidth
							error={!!errors.categoryId}
							helperText={errors.categoryId?.message}
							placeholder={i18nResources.categoryExample}
							required
						/>
					</Grid>
				)}

				{/* Program ID (only for create mode) */}
				{!isEditMode && (
					<TextField
							{...register('programId')}
							label={i18nResources.academicProgram}
							fullWidth
							error={!!errors.programId}
							helperText={errors.programId?.message}
							placeholder={i18nResources.academicProgramExample}
							required
						/>
					</Grid>
				)}

				{/* Description Field */}
					<TextField
						{...register('description')}
						label={i18nResources.description}
						fullWidth
						multiline
						rows={3}
						error={!!errors.description}
						helperText={errors.description?.message}
						placeholder={i18nResources.descriptionExample}
					/>
				</Grid>

				{/* Submit Button */}
					<Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
						<Button
							variant="outlined"
							onClick={() => router.back()}
						>
							{i18nResources.cancel}
						</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={isSubmitting}
						>
							{isSubmitting 
								? i18nResources.saving 
								: isEditMode 
									? i18nResources.updateResource 
									: i18nResources.createResource
							}
						</Button>
					</Box>
			</Stack>
		</Box>
	);
}
