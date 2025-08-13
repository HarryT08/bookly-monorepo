'use client';

import { useState } from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ConfirmDialog } from '@components/molecules/confirm-dialog';
import { deleteResource } from '@services/resources/services';
import { mockDeleteResource } from '@services/resources/mocks/crud';
import type { ResourceResponseDto } from '@services/resources/types';
import { DeleteForeverOutlined, LockOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export interface ResourceDeleteControlsProps {
	ariaLabelDelete?: string;
	ariaLabelDisable?: string;
	onlyIcon?: boolean;
	resource: ResourceResponseDto;
	useMocks: boolean;
	size?: 'small' | 'medium' | 'large';
	variantDisable?: 'outlined' | 'contained' | 'text';
	variantDelete?: 'outlined' | 'contained' | 'text';
	className?: string;
	onDeleted?: (id: string) => void;
	onDisabled?: (updated: ResourceResponseDto) => void;
}

export function ResourceDeleteControls(props: ResourceDeleteControlsProps) {
	const {
		resource,
		useMocks,
		ariaLabelDelete,
		ariaLabelDisable,
		onlyIcon = false,
		size = 'small',
		variantDisable = 'outlined',
		variantDelete = 'outlined',
		className,
		onDeleted,
		onDisabled
	} = props;

	const { enqueueSnackbar } = useSnackbar();
	const { t } = useTranslation('generic');
	const { t: tResources } = useTranslation('resources');
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirming, setConfirming] = useState(false);
	const [forceDelete, setForceDelete] = useState(false);

	const labelDelete = ariaLabelDelete ?? tResources('ACTIONS_DELETE_LABEL');
	const labelDisable = ariaLabelDisable ?? tResources('ACTIONS_DISABLE_LABEL');

	function open(force = false) {
		setForceDelete(force);
		setConfirmOpen(true);
	}

	async function handleConfirm() {
		setConfirming(true);
		try {
			if (useMocks) {
				const res = mockDeleteResource(resource.id, forceDelete);

				if (res && 'success' in res && res.success) {
					enqueueSnackbar(tResources('RESOURCE_MESSAGES_DELETED'), { variant: 'success' });
					onDeleted?.(resource.id);
				} else if (res) {
					enqueueSnackbar(tResources('RESOURCE_MESSAGES_DISABLED'), { variant: 'success' });
					onDisabled?.(res as ResourceResponseDto);
				}
			} else {
				const res = await deleteResource(resource.id, forceDelete);

				if ('success' in res && res.success) {
					enqueueSnackbar(tResources('RESOURCE_MESSAGES_DELETED'), { variant: 'success' });
					onDeleted?.(resource.id);
				} else {
					const updated = res as ResourceResponseDto;
					enqueueSnackbar(tResources('RESOURCE_MESSAGES_DISABLED'), { variant: 'success' });
					onDisabled?.(updated);
				}
			}
		} catch (e) {
			const msg = e instanceof Error ? e.message : tResources('RESOURCE_MESSAGES_DELETE_FAILED');
			enqueueSnackbar(msg, { variant: 'error' });
		} finally {
			setConfirming(false);
			setConfirmOpen(false);
			setForceDelete(false);
		}
	}

	return (
		<div className={className}>
			<div className="flex w-full justify-between gap-2">
				{onlyIcon ? (
					<Tooltip title={labelDelete}>
						<IconButton
							aria-label={labelDelete}
							color="error"
							size={size}
							onClick={() => open(true)}
						>
							<DeleteForeverOutlined />
						</IconButton>
					</Tooltip>
				) : (
					<Button
						startIcon={<DeleteForeverOutlined />}
						aria-label={labelDelete}
						color="error"
						size={size}
						variant={variantDelete}
						onClick={() => open(true)}
					>
						{t('DELETE')}
					</Button>
				)}
				{onlyIcon ? (
					<Tooltip title={labelDisable}>
						<IconButton
							aria-label={labelDisable}
							color="warning"
							size={size}
							onClick={() => open(false)}
						>
							<LockOutline />
						</IconButton>
					</Tooltip>
				) : (
					<Button
						startIcon={<LockOutline />}
						aria-label={labelDisable}
						color="warning"
						size={size}
						variant={variantDisable}
						onClick={() => open(false)}
					>
						{t('DISABLE')}
					</Button>
				)}
			</div>
			<ConfirmDialog
				open={confirmOpen}
				title={forceDelete ? tResources('DIALOGS_DELETE_TITLE') : tResources('DIALOGS_DISABLE_TITLE')}
				description={<p>{forceDelete ? tResources('DIALOGS_DELETE_DESCRIPTION') : tResources('DIALOGS_DISABLE_DESCRIPTION')}</p>}
				confirmText={forceDelete ? tResources('DIALOGS_DELETE_CONFIRM') : tResources('DIALOGS_DISABLE_CONFIRM')}
				cancelText={forceDelete ? tResources('DIALOGS_DELETE_CANCEL') : tResources('DIALOGS_DISABLE_CANCEL')}
				processingText={tResources('PROCESSING', { defaultValue: 'Procesando…' })}
				confirming={confirming}
				onConfirm={handleConfirm}
				onCancel={() => setConfirmOpen(false)}
			/>
		</div>
	);
}
