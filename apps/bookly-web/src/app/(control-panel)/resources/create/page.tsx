'use client';

import { ResourceForm } from '@components/organisms/resources/resource-form';
import { Button } from '@mui/material';
import NextLink from 'next/link';
import { PageFormHeader } from '@components/molecules/page-form-header';
import { useTranslation } from 'react-i18next';

export default function CreateResourcePage() {
	const { t } = useTranslation('generic');
	const { t: tResources } = useTranslation('resources', { nsMode: 'fallback' });
	return (
		<div className="space-y-4 p-6">
			<PageFormHeader
				title={tResources('RESOURCE_CREATE')}
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
				<ResourceForm mode="create" />
			</div>
		</div>
	);
}
