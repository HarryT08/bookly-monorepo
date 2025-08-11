'use client';

import NextLink from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { MRT_SortingState } from 'material-react-table';
import DataTable from '@components/molecules/DataTable/DataTable';
import { listResourcesPaginated } from '@services/resources/services';
import type { ResourceResponseDto } from '@services/resources/types';
import { mockListResourcesPaginated } from '@services/resources/mocks/crud';
import { useAppSelector } from 'store';
import { useSnackbar } from 'notistack';
import { Button, Link } from '@mui/material';
import { ResourceRowActions } from '@components/molecules/resource-row-actions';

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

	const user = useAppSelector((s) => s.auth.user);

	const canManageResources = useMemo(() => {
		return true;
		//if (!user) return false;

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
	}, [useMocks, pagination, sorting, globalFilter, enqueueSnackbar, user]);

	return (
		<div className="space-y-4 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Recursos</h1>
				<Button
					component={NextLink}
					href="/resources/create"
					variant="contained"
					color="primary"
				>
					Crear recurso
				</Button>
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
									component={NextLink}
									color="primary"
									underline="hover"
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
							<ResourceRowActions
								resource={row.original}
								useMocks={useMocks}
								onDeleted={(id) => setItems((prev) => prev.filter((r) => r.id !== id))}
								onDisabled={(updated) =>
									setItems((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
								}
							/>
						) : null
					}
				/>
			)}
		</div>
	);
}
