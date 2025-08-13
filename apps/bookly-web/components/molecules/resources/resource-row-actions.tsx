'use client';

import NextLink from 'next/link';
import { IconButton, Tooltip } from '@mui/material';
import { Edit } from '@mui/icons-material';
import type { ResourceResponseDto } from '@services/resources/types';
import { ResourceDeleteControls } from '@components/organisms/resources/resource-delete-controls';
import { useTranslation } from 'react-i18next';
import { getGenericI18n } from '@components/helpers/generic-i18n';

export interface ResourceRowActionsProps {
	resource: ResourceResponseDto;
	useMocks: boolean;
	className?: string;
	onDeleted?: (id: string) => void;
	onDisabled?: (updated: ResourceResponseDto) => void;
}

export function ResourceRowActions({ resource, useMocks, className, onDeleted, onDisabled }: ResourceRowActionsProps) {
	const i18nGeneric = getGenericI18n(useTranslation('generic').t);

	return (
		<div className={className ?? 'flex items-center gap-2'}>
			<Tooltip title={i18nGeneric.edit}>
				<IconButton
					component={NextLink}
					href={`/resources/${resource.id}/edit`}
					color="primary"
					size="small"
					aria-label={i18nGeneric.edit}
				>
					<Edit />
				</IconButton>
			</Tooltip>
			<ResourceDeleteControls
				onlyIcon={true}
				resource={resource}
				useMocks={useMocks}
				size="small"
				className="flex items-center gap-2"
				onDeleted={onDeleted}
				onDisabled={onDisabled}
			/>
		</div>
	);
}
