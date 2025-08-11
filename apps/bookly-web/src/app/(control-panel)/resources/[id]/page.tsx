'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import type { ResourceResponseDto } from '@services/resources/types';
import { getResourceById } from '@services/resources/services';
import { mockGetResourceById } from '@services/resources/mocks/crud';
import { PageProps } from 'utils/page-props';

export default function ResourceDetailPage({ params }: PageProps) {
	// Next.js (App Router) passes params as a Promise; unwrap with React.use()
	const { id } = use(params);
	const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

	const [data, setData] = useState<ResourceResponseDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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
				<Link
					href="/resources"
					className="rounded border bg-gray-100 px-3 py-2 text-gray-800 hover:bg-gray-200"
				>
					Volver
				</Link>
			</div>
		);

	if (!data) return null;

	return (
		<div className="space-y-4 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Detalle del recurso</h1>
				<div className="flex gap-2">
					<Link
						href={`/resources/${id}/edit`}
						className="rounded border bg-gray-100 px-3 py-2 text-gray-800 hover:bg-gray-200"
					>
						Editar
					</Link>
					<Link
						href="/resources"
						className="rounded border bg-gray-100 px-3 py-2 text-gray-800 hover:bg-gray-200"
					>
						Volver
					</Link>
				</div>
			</div>

			<div className="space-y-2 rounded border p-4">
				<div>
					<span className="font-medium">Nombre:</span> {data.name}
				</div>
				<div>
					<span className="font-medium">Código:</span> {data.code}
				</div>
				<div>
					<span className="font-medium">Tipo:</span> {data.type}
				</div>
				<div>
					<span className="font-medium">Capacidad:</span> {data.capacity}
				</div>
				<div>
					<span className="font-medium">Ubicación:</span> {data.location?.description ?? '-'}{' '}
				</div>
				<div>
					<span className="font-medium">Estado:</span> {data.status}
				</div>
				<div>
					<span className="font-medium">Activo:</span> {data.isActive ? 'Sí' : 'No'}
				</div>
				<div>
					<span className="font-medium">Categoría:</span> {data.categoryId ?? '-'}
				</div>
				{data.description && (
					<div>
						<span className="font-medium">Descripción:</span> {data.description}
					</div>
				)}
			</div>
		</div>
	);
}
