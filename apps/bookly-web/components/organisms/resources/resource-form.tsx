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
				<label className="block text-sm font-medium">Nombre</label>
				<input
					type="text"
					{...register('name')}
					className="mt-1 w-full rounded border p-2"
					placeholder="Laboratorio de Cómputo"
				/>
				{errors.name?.message && <p className="text-xs text-red-600">{errors.name.message}</p>}
			</div>

			<div>
				<label className="block text-sm font-medium">Tipo</label>
				<select
					{...register('type')}
					className="mt-1 w-full rounded border p-2"
				>
					<option value="ROOM">Sala</option>
					<option value="LABORATORY">Laboratorio</option>
					<option value="AUDITORIUM">Auditorio</option>
					<option value="EQUIPMENT">Equipo</option>
				</select>
				{errors.type?.message && <p className="text-xs text-red-600">{String(errors.type.message)}</p>}
			</div>

			<div>
				<label className="block text-sm font-medium">Ubicación</label>
				<input
					type="text"
					{...register('location.description')}
					className="mt-1 w-full rounded border p-2"
					placeholder="Bloque A, Piso 2, A-201"
				/>
				{errors.location?.description?.message && (
					<p className="text-xs text-red-600">{String(errors.location.description.message)}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium">Capacidad</label>
				<input
					type="number"
					min={1}
					{...register('capacity', { valueAsNumber: true })}
					className="mt-1 w-full rounded border p-2"
				/>
				{errors.capacity?.message && (
					<p className="text-xs text-red-600">{errors.capacity.message as string}</p>
				)}
			</div>

			<div className="flex gap-3">
				<button
					type="submit"
					disabled={isSubmitting}
					className="bg-primary-600 hover:bg-primary-700 rounded px-4 py-2 text-white disabled:opacity-50"
				>
					{isSubmitting ? 'Guardando...' : 'Guardar'}
				</button>
				<button
					type="button"
					onClick={() => router.push('/resources')}
					className="rounded border px-4 py-2"
				>
					Cancelar
				</button>
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
				<label className="block text-sm font-medium">Nombre</label>
				<input
					type="text"
					{...register('name')}
					className="mt-1 w-full rounded border p-2"
				/>
				{errors.name?.message && <p className="text-xs text-red-600">{errors.name.message}</p>}
			</div>

			<div>
				<label className="block text-sm font-medium">Tipo</label>
				<select
					{...register('type')}
					className="mt-1 w-full rounded border p-2"
				>
					<option value="ROOM">Sala</option>
					<option value="LABORATORY">Laboratorio</option>
					<option value="AUDITORIUM">Auditorio</option>
					<option value="EQUIPMENT">Equipo</option>
				</select>
				{errors.type?.message && <p className="text-xs text-red-600">{String(errors.type.message)}</p>}
			</div>

			<div>
				<label className="block text-sm font-medium">Ubicación</label>
				<input
					type="text"
					{...register('location.description')}
					className="mt-1 w-full rounded border p-2"
				/>
				{errors.location?.description?.message && (
					<p className="text-xs text-red-600">{String(errors.location.description.message)}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium">Capacidad</label>
				<input
					type="number"
					min={1}
					{...register('capacity', { valueAsNumber: true })}
					className="mt-1 w-full rounded border p-2"
				/>
				{errors.capacity?.message && (
					<p className="text-xs text-red-600">{errors.capacity.message as string}</p>
				)}
			</div>

			<div className="flex gap-3">
				<button
					type="submit"
					disabled={isSubmitting}
					className="bg-primary-600 hover:bg-primary-700 rounded px-4 py-2 text-white disabled:opacity-50"
				>
					{isSubmitting ? 'Guardando...' : 'Guardar'}
				</button>
				<button
					type="button"
					onClick={() => router.push('/resources')}
					className="rounded border px-4 py-2"
				>
					Cancelar
				</button>
			</div>
		</form>
	);
}

export default ResourceForm;
