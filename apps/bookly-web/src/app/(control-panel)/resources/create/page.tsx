'use client';

import Link from 'next/link';
import { ResourceForm } from '@components/organisms/resources/resource-form';

export default function CreateResourcePage() {
	return (
		<div className="space-y-4 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Crear recurso</h1>
				<Link
					href="/resources"
					className="rounded border px-3 py-2"
				>
					Volver
				</Link>
			</div>

			<div className="rounded border p-4">
				<ResourceForm />
			</div>
		</div>
	);
}
