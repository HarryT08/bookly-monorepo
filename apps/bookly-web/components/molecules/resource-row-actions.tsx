'use client';

import NextLink from 'next/link';
import { IconButton, Tooltip } from '@mui/material';
import { Edit } from '@mui/icons-material';
import type { ResourceResponseDto } from '@services/resources/types';
import { ResourceDeleteControls } from '@components/organisms/resources/resource-delete-controls';
import { useTranslation } from 'react-i18next';
import { getResourceI18n } from '@components/helpers/resources-i18n';

export interface ResourceRowActionsProps {
	resource: ResourceResponseDto;
	useMocks: boolean;
	className?: string;
	onDeleted?: (id: string) => void;
	onDisabled?: (updated: ResourceResponseDto) => void;
}

export function ResourceRowActions({ resource, useMocks, className, onDeleted, onDisabled }: ResourceRowActionsProps) {
	const { t } = useTranslation('resources');
	const i18n = getResourceI18n(t);

	return (
		<div className={className ?? 'flex items-center gap-2'}>
			<Tooltip title={i18n.editLabel}>
				<IconButton
					component={NextLink}
					href={`/resources/${resource.id}/edit`}
					color="primary"
					size="small"
					aria-label={i18n.editAria}
				>
					<Edit />
				</IconButton>
			</Tooltip>
			<ResourceDeleteControls
				ariaLabelDelete={i18n.deleteAria}
				ariaLabelDisable={i18n.disableAria}
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
