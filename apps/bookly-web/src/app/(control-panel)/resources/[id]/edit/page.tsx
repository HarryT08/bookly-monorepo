'use client';

import { use } from 'react';
import { ResourceEditForm } from '@components/organisms/resources/resource-form';
import { PageProps } from 'utils/page-props';
import { PageFormHeader } from '@components/molecules/page-form-header';
import { Button } from '@mui/material';
import NextLink from 'next/link';

export default function EditResourcePage({ params }: PageProps) {
	const { id } = use(params);
	return (
		<div className="space-y-4 p-6">
			<PageFormHeader
				title="Editar recurso"
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
				<ResourceEditForm id={id} />
			</div>
		</div>
	);
}
