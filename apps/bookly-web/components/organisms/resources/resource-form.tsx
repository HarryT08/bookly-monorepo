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

interface ResourceFormProps {
	onCreated?: (resource: ResourceResponseDto) => void;
}

export function ResourceForm({ onCreated }: ResourceFormProps) {
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
			onCreated?.(created);
			enqueueSnackbar('Recurso creado correctamente. Auditoría registrada.', { variant: 'success' });
			router.push('/resources');
		} catch (_err) {
			setApiError('No fue posible crear el recurso. Intenta nuevamente.');
			enqueueSnackbar('No fue posible crear el recurso. Revisa los datos e inténtalo de nuevo.', {
				variant: 'error'
			});
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
					label="Nombre"
					fullWidth
					placeholder="Laboratorio de Cómputo"
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
							label="Tipo"
							select
							fullWidth
							value={field.value}
							onChange={field.onChange}
							onBlur={field.onBlur}
							helperText={errors.type?.message as string}
							error={!!errors.type}
						>
							<MenuItem value="ROOM">Sala</MenuItem>
							<MenuItem value="LABORATORY">Laboratorio</MenuItem>
							<MenuItem value="AUDITORIUM">Auditorio</MenuItem>
							<MenuItem value="EQUIPMENT">Equipo</MenuItem>
						</TextField>
					)}
				/>
			</div>

			<div>
				<TextField
					label="Ubicación"
					fullWidth
					placeholder="Bloque A, Piso 2, A-201"
					{...register('location.description')}
					error={!!errors.location?.description}
					helperText={errors.location?.description?.message as string}
				/>
			</div>

			<div>
				<TextField
					label="Capacidad"
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
					{isSubmitting ? 'Guardando...' : 'Guardar'}
				</Button>
				<Button
					type="button"
					onClick={() => router.push('/resources')}
					variant="outlined"
					color="secondary"
				>
					Cancelar
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
					setApiError('Recurso no encontrado');
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
				setApiError('No fue posible cargar el recurso.');
			} finally {
				setLoading(false);
			}
		})();
	}, [id, reset, useMocks]);

	async function onSubmit(values: UpdateResourceFormValues) {
		setApiError(null);
		try {
			const updated = useMocks
				? mockUpdateResource(id, values as unknown as UpdateResourceDto)!
				: await updateResource(id, values as unknown as UpdateResourceDto);
			onUpdated?.(updated);
			enqueueSnackbar('Recurso actualizado correctamente. Auditoría registrada.', { variant: 'success' });
			router.push('/resources');
		} catch (_e) {
			setApiError('No fue posible actualizar el recurso. Intenta nuevamente.');
			enqueueSnackbar('No fue posible actualizar el recurso. Revisa los datos e inténtalo de nuevo.', {
				variant: 'error'
			});
		}
	}

	if (loading) return <div>Cargando...</div>;

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-4"
		>
			{apiError && <div className="text-sm text-red-600">{apiError}</div>}

			<div>
				<TextField
					label="Nombre"
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
							label="Tipo"
							select
							fullWidth
							value={field.value}
							onChange={field.onChange}
							onBlur={field.onBlur}
							helperText={errors.type?.message as string}
							error={!!errors.type}
						>
							<MenuItem value="ROOM">Sala</MenuItem>
							<MenuItem value="LABORATORY">Laboratorio</MenuItem>
							<MenuItem value="AUDITORIUM">Auditorio</MenuItem>
							<MenuItem value="EQUIPMENT">Equipo</MenuItem>
						</TextField>
					)}
				/>
			</div>

			<div>
				<TextField
					label="Ubicación"
					fullWidth
					{...register('location.description')}
					error={!!errors.location?.description}
					helperText={errors.location?.description?.message as string}
				/>
			</div>

			<div>
				<TextField
					label="Capacidad"
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
					{isSubmitting ? 'Guardando...' : 'Guardar'}
				</Button>
				<Button
					type="button"
					onClick={() => router.push('/resources')}
					variant="outlined"
					color="secondary"
				>
					Cancelar
				</Button>
			</div>
		</form>
	);
}

export default ResourceForm;
