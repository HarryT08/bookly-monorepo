'use client';

import { use } from 'react';
import { ResourceForm } from '@components/organisms/resources/resource-form';
import { PageProps } from 'utils/page-props';
import { PageFormHeader } from '@components/molecules/page-form-header';
import { Button } from '@mui/material';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';

export default function EditResourcePage({ params }: PageProps) {
	const { t } = useTranslation('generic');
	const { t: tResources } = useTranslation('resources');
	const { id } = use(params);
	return (
		<div className="space-y-4 p-6">
			<PageFormHeader
				title={tResources('RESOURCE_EDIT')}
				actions={
					<Button
						component={NextLink}
						href="/resources"
						variant="outlined"
					>
						{t('BACK_TO_LIST')}
					</Button>
				}
			/>

			<div className="rounded border p-4">
				<ResourceForm
					mode="edit"
					resourceId={id}
				/>
			</div>
		</div>
	);
}
