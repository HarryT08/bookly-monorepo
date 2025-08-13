'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import type {
	CreateResourceDto,
	ResourceLocation,
	ResourceResponseDto,
	ResourceType,
	UpdateResourceDto
} from '@services/resources/types';
import {
	createResourceSchema,
	updateResourceSchema,
	CreateResourceFormValues,
	UpdateResourceFormValues
} from '@services/resources/validation';
import { createResource, getResourceById, updateResource } from '@services/resources/services';
import { mockCreateResource, mockGetResourceById, mockUpdateResource } from '@services/resources/mocks/crud';
import { Button, TextField, MenuItem } from '@mui/material';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface ResourceFormProps {
	onCreated?: (resource: ResourceResponseDto) => void;
}

export function ResourceForm(props: ResourceFormProps) {
	const { t } = useTranslation('generic');
	const { t: tResources } = useTranslation('resources');
	const router = useRouter();
	const { enqueueSnackbar } = useSnackbar();
	const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting }
	} = useForm<CreateResourceFormValues>({
		resolver: zodResolver(createResourceSchema),
		defaultValues: {
			name: '',
			type: 'ROOM' as ResourceType,
			location: {} as ResourceLocation,
			capacity: 1,
			description: ''
		}
	});

	const [apiError, setApiError] = useState<string | null>(null);

	async function onSubmit(values: CreateResourceFormValues) {
		setApiError(null);
		try {
			const created = useMocks
				? mockCreateResource(values as unknown as CreateResourceDto)
				: await createResource(values as unknown as CreateResourceDto);
			props.onCreated?.(created);
			enqueueSnackbar(tResources('RESOURCE_CREATE_SUCCESS'), { variant: 'success' });
			router.push('/resources');
		} catch (_err) {
			setApiError(tResources('RESOURCE_CREATE_FAILED'));
			enqueueSnackbar(tResources('RESOURCE_CREATE_FAILED_DETAIL'), { variant: 'error' });
		}
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-4"
		>
			{apiError && <div className="text-sm text-red-600">{apiError}</div>}

			<div>
				<TextField
					label={tResources('NAME')}
					fullWidth
					placeholder={tResources('RESOURCE_NAME_EXAMPLE')}
					{...register('name')}
					error={!!errors.name}
					helperText={errors.name?.message}
				/>
			</div>

			<div>
				<Controller
					name="type"
					control={control}
					render={({ field }) => (
						<TextField
							label={tResources('TYPE')}
							select
							fullWidth
							value={field.value}
							onChange={field.onChange}
							onBlur={field.onBlur}
							helperText={errors.type?.message as string}
							error={!!errors.type}
						>
							<MenuItem value="ROOM">{tResources('ROOM')}</MenuItem>
							<MenuItem value="LABORATORY">{tResources('LABORATORY')}</MenuItem>
							<MenuItem value="AUDITORIUM">{tResources('AUDITORIUM')}</MenuItem>
							<MenuItem value="EQUIPMENT">{tResources('EQUIPMENT')}</MenuItem>
						</TextField>
					)}
				/>
			</div>

			<div>
				<TextField
					label={tResources('LOCATION')}
					fullWidth
					placeholder={tResources('LOCATION_EXAMPLE')}
					{...register('location.description')}
					error={!!errors.location?.description}
					helperText={errors.location?.description?.message as string}
				/>
			</div>

			<div>
				<TextField
					label={tResources('CAPACITY')}
					type="number"
					fullWidth
					inputProps={{ min: 1 }}
					{...register('capacity', { valueAsNumber: true })}
					error={!!errors.capacity}
					helperText={errors.capacity?.message as string}
				/>
			</div>

			<div className="flex gap-3">
				<Button
					type="submit"
					disabled={isSubmitting}
					variant="contained"
					color="primary"
				>
					{isSubmitting ? t('SAVING') : t('SAVE')}
				</Button>
				<Button
					type="button"
					onClick={() => router.push('/resources')}
					variant="outlined"
					color="secondary"
				>
					{t('CANCEL')}
				</Button>
			</div>
		</form>
	);
}

interface ResourceEditFormProps {
	id: string;
	onUpdated?: (resource: ResourceResponseDto) => void;
}

export function ResourceEditForm({ id, onUpdated }: ResourceEditFormProps) {
	const { t } = useTranslation('generic');
	const { t: tResources } = useTranslation('resources');
	const router = useRouter();
	const { enqueueSnackbar } = useSnackbar();
	const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
	const [loading, setLoading] = useState(true);
	const [apiError, setApiError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<UpdateResourceFormValues>({
		resolver: zodResolver(updateResourceSchema)
	});

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const res = useMocks ? mockGetResourceById(id) : await getResourceById(id);

				if (!res) {
					setApiError(tResources('RESOURCE_NOT_FOUND'));
					return;
				}

				// Map response to UpdateResourceDto defaults
				const defaults: UpdateResourceDto = {
					name: res.name,
					type: res.type as ResourceType,
					location: (res.location || {}) as ResourceLocation,
					capacity: res.capacity,
					description: res.description,
					status: res.status,
					isActive: res.isActive,
					categoryId: res.categoryId,
					availableSchedules: res.availableSchedules,
					attributes: res.attributes
				} as UpdateResourceDto;
				reset(defaults);
			} catch (_e) {
				setApiError(tResources('RESOURCE_LOAD_FAILED'));
			} finally {
				setLoading(false);
			}
		})();
	}, [id, reset, useMocks, tResources]);

	async function onSubmit(values: UpdateResourceFormValues) {
		setApiError(null);
		try {
			const updated = useMocks
				? mockUpdateResource(id, values as unknown as UpdateResourceDto)!
				: await updateResource(id, values as unknown as UpdateResourceDto);
			onUpdated?.(updated);
			enqueueSnackbar(tResources('RESOURCE_UPDATE_SUCCESS'), { variant: 'success' });
			router.push('/resources');
		} catch (_e) {
			setApiError(tResources('RESOURCE_UPDATE_FAILED'));
			enqueueSnackbar(tResources('RESOURCE_UPDATE_FAILED_DETAIL'), { variant: 'error' });
		}
	}

	if (loading) return <div>{t('LOADING')}</div>;

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-4"
		>
			{apiError && <div className="text-sm text-red-600">{apiError}</div>}

			<div>
				<TextField
					label={tResources('NAME')}
					fullWidth
					{...register('name')}
					error={!!errors.name}
					helperText={errors.name?.message}
				/>
			</div>

			<div>
				<Controller
					name="type"
					control={control}
					render={({ field }) => (
						<TextField
							label={tResources('TYPE')}
							select
							fullWidth
							value={field.value}
							onChange={field.onChange}
							onBlur={field.onBlur}
							helperText={errors.type?.message as string}
							error={!!errors.type}
						>
							<MenuItem value="ROOM">{tResources('ROOM')}</MenuItem>
							<MenuItem value="LABORATORY">{tResources('LABORATORY')}</MenuItem>
							<MenuItem value="AUDITORIUM">{tResources('AUDITORIUM')}</MenuItem>
							<MenuItem value="EQUIPMENT">{tResources('EQUIPMENT')}</MenuItem>
						</TextField>
					)}
				/>
			</div>

			<div>
				<TextField
					label={tResources('LOCATION')}
					fullWidth
					{...register('location.description')}
					error={!!errors.location?.description}
					helperText={errors.location?.description?.message as string}
				/>
			</div>

			<div>
				<TextField
					label={tResources('CAPACITY')}
					type="number"
					fullWidth
					inputProps={{ min: 1 }}
					{...register('capacity', { valueAsNumber: true })}
					error={!!errors.capacity}
					helperText={errors.capacity?.message as string}
				/>
			</div>

			<div className="flex gap-3">
				<Button
					type="submit"
					disabled={isSubmitting}
					variant="contained"
					color="primary"
				>
					{isSubmitting ? t('SAVING') : t('SAVE')}
				</Button>
				<Button
					type="button"
					onClick={() => router.push('/resources')}
					variant="outlined"
					color="secondary"
				>
					{t('CANCEL')}
				</Button>
			</div>
		</form>
	);
}
