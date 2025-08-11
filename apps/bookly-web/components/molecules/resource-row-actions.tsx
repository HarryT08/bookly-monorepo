'use client';

import NextLink from 'next/link';
import { IconButton, Tooltip } from '@mui/material';
import { Edit } from '@mui/icons-material';
import type { ResourceResponseDto } from '@services/resources/types';
import { ResourceDeleteControls } from '@components/organisms/resources/resource-delete-controls';
import { useTranslation } from 'react-i18next';

export interface ResourceRowActionsProps {
	resource: ResourceResponseDto;
	useMocks: boolean;
	className?: string;
	onDeleted?: (id: string) => void;
	onDisabled?: (updated: ResourceResponseDto) => void;
}

export function ResourceRowActions({ resource, useMocks, className, onDeleted, onDisabled }: ResourceRowActionsProps) {
	const { t } = useTranslation('resources');
	const editLabel = t('actions.edit.label', { defaultValue: 'Editar' });
	const editAria = t('actions.edit.aria', { defaultValue: 'Editar recurso {{name}}', name: resource.name });

	return (
		<div className={className ?? 'flex items-center gap-2'}>
			<Tooltip title={editLabel}>
				<IconButton
					component={NextLink}
					href={`/resources/${resource.id}/edit`}
					color="primary"
					size="small"
					aria-label={editAria}
				>
					<Edit />
				</IconButton>
			</Tooltip>
			<ResourceDeleteControls
				ariaLabelDelete={t('actions.delete.label', { defaultValue: 'Eliminar' })}
				ariaLabelDisable={t('actions.disable.label', { defaultValue: 'Deshabilitar' })}
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
