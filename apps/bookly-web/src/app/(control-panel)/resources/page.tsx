'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { MRT_SortingState } from 'material-react-table';
import DataTable from '@components/molecules/DataTable/DataTable';
import { deleteResource, listResourcesPaginated } from '@services/resources/services';
import type { ResourceResponseDto } from '@services/resources/types';
import { mockDeleteResource, mockListResourcesPaginated } from '@services/resources/mocks/crud';
import { useAppSelector } from 'store';
import { ConfirmDialog } from '@components/molecules/confirm-dialog';
import { useSnackbar } from 'notistack';

export default function ResourcesPage() {
	const { enqueueSnackbar } = useSnackbar();
	const [items, setItems] = useState<ResourceResponseDto[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
	// Table state (server-side)
	const [pagination, setPagination] = useState<{ pageIndex: number; pageSize: number }>({
		pageIndex: 0,
		pageSize: 10
	});
	const [rowCount, setRowCount] = useState<number>(0);
	const [sorting, setSorting] = useState<MRT_SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');

	// Confirm dialog state
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirming, setConfirming] = useState(false);
	const [target, setTarget] = useState<ResourceResponseDto | null>(null);
	const [forceDelete, setForceDelete] = useState(false);
	const user = useAppSelector((s) => s.auth.user);

	const canManageResources = useMemo(() => {
		if (!user) return false;

		// Permission-based check first
		const hasPerm = user.permissions?.some(
			(p) =>
				['resource', 'resources'].includes(p.resource.toLowerCase()) &&
				['update', 'delete'].includes(p.action.toLowerCase())
		);

		if (hasPerm) return true;

		// Fallback role-based check
		return user.roles?.some((r) => /administrador/i.test(r.name));
	}, [user]);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				setLoading(true);
				const sortBy = sorting[0]?.id as string | undefined;
				const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
				const page = pagination.pageIndex + 1;
				const limit = pagination.pageSize;
				const baseParams = { page, limit } as {
					page: number;
					limit: number;
					sortBy?: string;
					sortOrder?: 'asc' | 'desc';
					q?: string;
				};

				if (sortBy) {
					baseParams.sortBy = sortBy;
					baseParams.sortOrder = sortOrder;
				}

				if (globalFilter && globalFilter.trim()) {
					baseParams.q = globalFilter.trim();
				}

				const res = useMocks
					? mockListResourcesPaginated(baseParams)
					: await listResourcesPaginated(baseParams);

				if (!mounted) return;

				setItems(res.data);
				setRowCount(res.pagination.total);
			} catch (_e) {
				setError('No fue posible cargar los recursos');
				enqueueSnackbar('No fue posible cargar los recursos.', { variant: 'error' });
			} finally {
				setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [useMocks, pagination, sorting, globalFilter, enqueueSnackbar]);

	function openDeleteDialog(resource: ResourceResponseDto, force = false) {
		setTarget(resource);
		setForceDelete(force);
		setConfirmOpen(true);
	}

	async function handleConfirmDelete() {
		if (!target) return;

		setConfirming(true);
		try {
			if (useMocks) {
				const res = mockDeleteResource(target.id, forceDelete);

				if (res && 'success' in res && res.success) {
					setItems((prev) => prev.filter((r) => r.id !== target.id));
					enqueueSnackbar('Recurso eliminado correctamente. Auditoría registrada.', { variant: 'success' });
				} else if (res) {
					setItems((prev) => prev.map((r) => (r.id === target.id ? (res as ResourceResponseDto) : r)));
					enqueueSnackbar('Recurso deshabilitado correctamente. Auditoría registrada.', {
						variant: 'success'
					});
				}
			} else {
				const res = await deleteResource(target.id, forceDelete);

				if ('success' in res && res.success) {
					setItems((prev) => prev.filter((r) => r.id !== target.id));
					enqueueSnackbar('Recurso eliminado correctamente. Auditoría registrada.', { variant: 'success' });
				} else {
					const updated = res as ResourceResponseDto;
					setItems((prev) => prev.map((r) => (r.id === target.id ? updated : r)));
					enqueueSnackbar('Recurso deshabilitado correctamente. Auditoría registrada.', {
						variant: 'success'
					});
				}
			}
		} catch (_e) {
			// Surface specific error message if available
			const msg = _e instanceof Error ? _e.message : null;
			setError(msg ?? 'No fue posible eliminar/deshabilitar el recurso');
			enqueueSnackbar(msg ?? 'No fue posible eliminar/deshabilitar el recurso.', { variant: 'error' });
		} finally {
			setConfirming(false);
			setConfirmOpen(false);
			setTarget(null);
			setForceDelete(false);
		}
	}

	return (
		<div className="space-y-4 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Recursos</h1>
				<Link
					href="/resources/create"
					className="bg-primary-600 rounded px-3 py-2 text-white"
				>
					Crear recurso
				</Link>
			</div>

			{loading && <div>Cargando...</div>}
			{error && <div className="text-red-600">{error}</div>}

			{!loading && !error && (
				<DataTable<ResourceResponseDto>
					columns={[
						{
							accessorKey: 'name',
							header: 'Nombre',
							Cell: ({ row }) => (
								<Link
									className="text-primary-600 underline"
									href={`/resources/${row.original.id}`}
								>
									{row.original.name}
								</Link>
							)
						},
						{ accessorKey: 'code', header: 'Código' },
						{ accessorKey: 'type', header: 'Tipo' },
						{ accessorKey: 'status', header: 'Estado' },
						{ accessorKey: 'capacity', header: 'Capacidad' }
					]}
					data={items}
					manualPagination
					onPaginationChange={setPagination}
					state={{
						isLoading: loading,
						pagination,
						globalFilter,
						sorting
					}}
					rowCount={rowCount}
					manualSorting
					onSortingChange={setSorting}
					manualFiltering
					onGlobalFilterChange={setGlobalFilter}
					enableRowActions={canManageResources}
					renderRowActions={({ row }) =>
						canManageResources ? (
							<div className="flex items-center gap-2">
								<Link
									href={`/resources/${row.original.id}/edit`}
									className="rounded border px-2 py-1"
								>
									Editar
								</Link>
								<button
									type="button"
									className="rounded border px-2 py-1 text-red-700"
									onClick={() => openDeleteDialog(row.original, false)}
								>
									Deshabilitar
								</button>
								<button
									type="button"
									className="rounded border px-2 py-1 text-red-700"
									onClick={() => openDeleteDialog(row.original, true)}
								>
									Eliminar
								</button>
							</div>
						) : null
					}
				/>
			)}

			<ConfirmDialog
				open={confirmOpen}
				title={forceDelete ? 'Eliminar recurso' : 'Deshabilitar recurso'}
				description={
					target ? (
						<p>
							{forceDelete
								? 'Esta acción eliminará permanentemente el recurso. Escribe políticas de seguridad antes de exponer en producción.'
								: 'Esta acción deshabilitará el recurso sin eliminarlo, para preservar su historial.'}
							<br />
							<span className="font-medium">{target.name}</span>
						</p>
					) : null
				}
				confirmText={forceDelete ? 'Eliminar' : 'Deshabilitar'}
				cancelText="Cancelar"
				confirming={confirming}
				onConfirm={handleConfirmDelete}
				onCancel={() => setConfirmOpen(false)}
			/>
		</div>
	);
}
