'use client';

import { ResourceForm } from '@components/organisms/resources/resource-form';
import { Button } from '@mui/material';
import NextLink from 'next/link';
import { PageFormHeader } from '@components/molecules/page-form-header';

export default function CreateResourcePage() {
	return (
		<div className="space-y-4 p-6">
			<PageFormHeader
				title="Crear recurso"
				actions={
					<Button
						component={NextLink}
						href="/resources"
						variant="outlined"
					>
						Volver
					</Button>
				}
			/>

			<div className="rounded border p-4">
				<ResourceForm />
			</div>
		</div>
	);
}
