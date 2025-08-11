'use client';

import Link from 'next/link';
import { use } from 'react';
import { ResourceEditForm } from '@components/organisms/resources/resource-form';
import { PageProps } from 'utils/page-props';

export default function EditResourcePage({ params }: PageProps) {
	const { id } = use(params);
	return (
		<div className="space-y-4 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Editar recurso</h1>
				<Link
					href="/resources"
					className="rounded border bg-gray-100 px-3 py-2 text-gray-800 hover:bg-gray-200"
				>
					Volver
				</Link>
			</div>

			<div className="rounded border p-4">
				<ResourceEditForm id={id} />
			</div>
		</div>
	);
}
