'use client';

import NextLink from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { MRT_SortingState } from 'material-react-table';
import DataTable from '@components/molecules/DataTable/DataTable';
import type { ResourceResponseDto } from '@services/resources/types';
import { useAppSelector, useAppDispatch } from 'store';
import { fetchResourcesPaginated, setFilters } from '@store/slices/resourcesSlice';
import { useSnackbar } from 'notistack';
import { Button, Link } from '@mui/material';
import { ResourceRowActions } from '@components/molecules/resources/resource-row-actions';
import { useTranslation } from 'react-i18next';

export default function ResourcesPage() {
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();

	// Redux state
	const {
		resources,
		pagination: reduxPagination,
		filters,
		loading,
		errors
	} = useAppSelector((state) => state.resources);

	// Table state (server-side)
	const [tablePagination, setTablePagination] = useState<{ pageIndex: number; pageSize: number }>({
		pageIndex: reduxPagination.page - 1,
		pageSize: reduxPagination.limit
	});
	const [sorting, setSorting] = useState<MRT_SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>(filters.q || '');

	const { t } = useTranslation('generic');
	const { t: tResources } = useTranslation('resources');
	const { user } = useAppSelector((s) => s.auth);

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

	// Sync table pagination with Redux pagination
	useEffect(() => {
		setTablePagination({
			pageIndex: reduxPagination.page - 1,
			pageSize: reduxPagination.limit
		});
	}, [reduxPagination]);

	// Fetch resources when pagination, sorting or filters change
	useEffect(() => {
		const sortBy = sorting[0]?.id as string | undefined;
		const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
		const page = tablePagination.pageIndex + 1;
		const limit = tablePagination.pageSize;

		const params = { page, limit } as {
			page: number;
			limit: number;
			sortBy?: string;
			sortOrder?: 'asc' | 'desc';
			q?: string;
		};

		if (sortBy) {
			params.sortBy = sortBy;
			params.sortOrder = sortOrder;
		}

		if (globalFilter && globalFilter.trim()) {
			params.q = globalFilter.trim();
		}

		dispatch(fetchResourcesPaginated(params));
	}, [dispatch, tablePagination, sorting, globalFilter]);

	// Update filters in Redux when globalFilter changes
	useEffect(() => {
		dispatch(setFilters({ q: globalFilter || undefined }));
	}, [dispatch, globalFilter]);

	// Show error notifications
	useEffect(() => {
		if (errors.list) {
			enqueueSnackbar(errors.list, { variant: 'error' });
		}
	}, [errors.list, enqueueSnackbar]);

	return (
		<div className="space-y-4 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">{tResources('RESOURCES')}</h1>
				<Button
					component={NextLink}
					href="/resources/create"
					variant="contained"
					color="primary"
				>
					{tResources('RESOURCE_CREATE')}
				</Button>
			</div>

			{loading.list && <div>{t('LOADING')}</div>}
			{errors.list && <div className="text-red-600">{tResources('RESOURCE_LOAD_FAILED')}</div>}

			{!loading.list && !errors.list && (
				<DataTable<ResourceResponseDto>
					columns={[
						{
							accessorKey: 'name',
							header: tResources('NAME'),
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
						{ accessorKey: 'code', header: tResources('CODE') },
						{ accessorKey: 'type', header: tResources('TYPE') },
						{ accessorKey: 'status', header: tResources('STATUS') },
						{ accessorKey: 'capacity', header: tResources('CAPACITY') }
					]}
					data={resources}
					manualPagination
					onPaginationChange={setTablePagination}
					state={{
						isLoading: loading.list,
						pagination: tablePagination,
						globalFilter,
						sorting
					}}
					rowCount={reduxPagination.total}
					manualSorting
					onSortingChange={setSorting}
					manualFiltering
					onGlobalFilterChange={setGlobalFilter}
					enableRowActions={canManageResources}
					renderRowActions={({ row }) =>
						canManageResources ? (
							<ResourceRowActions
								resource={row.original}
								useMocks={process.env.NEXT_PUBLIC_USE_MOCKS === 'true'}
								onDeleted={() => {
									// Resource will be refetched through Redux
									dispatch(
										fetchResourcesPaginated({
											page: tablePagination.pageIndex + 1,
											limit: tablePagination.pageSize
										})
									);
								}}
								onDisabled={() => {
									// Resource will be refetched through Redux
									dispatch(
										fetchResourcesPaginated({
											page: tablePagination.pageIndex + 1,
											limit: tablePagination.pageSize
										})
									);
								}}
							/>
						) : null
					}
				/>
			)}
		</div>
	);
}
