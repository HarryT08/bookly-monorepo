'use client';

import { use, useEffect, useState } from 'react';
import NextLink from 'next/link';
import type { ResourceResponseDto } from '@services/resources/types';
import { getResourceById } from '@services/resources/services';
import { mockGetResourceById } from '@services/resources/mocks/crud';
import { PageProps } from 'utils/page-props';
import { Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ResourceDeleteControls } from '@components/organisms/resources/resource-delete-controls';
import { PageFormHeader } from '@components/molecules/page-form-header';
import { useTranslation } from 'react-i18next';

export default function ResourceDetailPage({ params }: PageProps) {
	// Next.js (App Router) passes params as a Promise; unwrap with React.use()
	const { id } = use(params);
	const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

	const [data, setData] = useState<ResourceResponseDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { t } = useTranslation('generic');
	const { t: tResources } = useTranslation('resources');

	const { enqueueSnackbar } = useSnackbar();

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				setLoading(true);
				const res = useMocks ? mockGetResourceById(id) : await getResourceById(id);

				if (!mounted) return;

				setData(res);
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
	}, [useMocks, id, enqueueSnackbar]);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const res = useMocks ? mockGetResourceById(id) : await getResourceById(id);

				if (!res) {
					setError('Recurso no encontrado');
					return;
				}

				setData(res);
			} catch (_e) {
				setError('No fue posible cargar el recurso.');
			} finally {
				setLoading(false);
			}
		})();
	}, [id, useMocks]);

	if (loading) return <div className="p-6">Cargando...</div>;

	if (error)
		return (
			<div className="space-y-4 p-6">
				<div className="text-red-600">{error}</div>
				<Button
					component={NextLink}
					href="/resources"
					className="rounded border bg-gray-100 px-3 py-2 text-gray-800 hover:bg-gray-200"
				>
					{t('BACK_TO_LIST')}
				</Button>
			</div>
		);

	if (!data) return null;

	return (
		<div className="space-y-4 p-6">
			<PageFormHeader
				title={tResources('RESOURCE_DETAILS')}
				actions={
					<div className="flex gap-2">
						<Button
							component={NextLink}
							href={`/resources/${id}/edit`}
							variant="outlined"
							color="primary"
						>
							{tResources('RESOURCE_EDIT')}
						</Button>
						<Button
							component={NextLink}
							href="/resources"
							color="secondary"
							variant="contained"
						>
							{t('BACK_TO_LIST')}
						</Button>
					</div>
				}
			/>
			<div className="space-y-2 rounded border p-4">
				<div>
					<span className="font-medium">{tResources('NAME')}:</span> {data.name}
				</div>
				<div>
					<span className="font-medium">{tResources('CODE')}:</span> {data.code}
				</div>
				<div>
					<span className="font-medium">{tResources('TYPE')}:</span> {data.type}
				</div>
				<div>
					<span className="font-medium">{tResources('CAPACITY')}:</span> {data.capacity}
				</div>
				<div>
					<span className="font-medium">{tResources('LOCATION')}:</span> {data.location ?? '-'}{' '}
				</div>
				<div>
					<span className="font-medium">{tResources('STATUS')}:</span> {data.status}
				</div>
				<div>
					<span className="font-medium">{tResources('ACTIVE')}:</span> {data.isActive ? 'Sí' : 'No'}
				</div>
				<div>
					<span className="font-medium">{tResources('CATEGORY')}:</span> {data.categoryId ?? '-'}
				</div>
				{data.description && (
					<div>
						<span className="font-medium">{tResources('DESCRIPTION')}:</span> {data.description}
					</div>
				)}
			</div>
			{data && (
				<ResourceDeleteControls
					resource={data}
					useMocks={useMocks}
					size="small"
					className="flex w-full gap-2"
					onDeleted={() => {
						setData(null);
						enqueueSnackbar(tResources('RESOURCE_MESSAGES_DELETED'), {
							variant: 'success'
						});
					}}
					onDisabled={(updated) => {
						setData(updated);
						enqueueSnackbar(tResources('RESOURCE_MESSAGES_DISABLED'), {
							variant: 'success'
						});
					}}
				/>
			)}
		</div>
	);
}
