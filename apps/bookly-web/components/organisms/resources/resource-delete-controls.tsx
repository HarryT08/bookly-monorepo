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
import { getResourceI18n } from '@components/helpers/resources-i18n';
import { getGenericI18n } from '@components/helpers/generic-i18n';

export interface ResourceDeleteControlsProps {
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
		onlyIcon = false,
		size = 'small',
		variantDisable = 'outlined',
		variantDelete = 'outlined',
		className,
		onDeleted,
		onDisabled
	} = props;

	const { enqueueSnackbar } = useSnackbar();
	const i18nGeneric = getGenericI18n(useTranslation('generic').t);
	const i18nResources = getResourceI18n(useTranslation('resources').t);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirming, setConfirming] = useState(false);
	const [forceDelete, setForceDelete] = useState(false);

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
					if (forceDelete) {
						enqueueSnackbar(i18nResources.resourceMessagesDeleted, { variant: 'success' });
						onDeleted?.(resource.id);
					} else {
						enqueueSnackbar(i18nResources.resourceMessagesDisabled, { variant: 'success' });
						onDisabled?.(res as unknown as ResourceResponseDto);
					}
				}
			} else {
				const res = await deleteResource(resource.id, forceDelete);

				if ('success' in res && res.success) {
					if (forceDelete) {
						enqueueSnackbar(i18nResources.resourceMessagesDeleted, { variant: 'success' });
						onDeleted?.(resource.id);
					} else {
						enqueueSnackbar(i18nResources.resourceMessagesDisabled, { variant: 'success' });
						onDisabled?.(res as unknown as ResourceResponseDto);
					}
				}
			}
		} catch (e) {
			const msg = e instanceof Error ? e.message : i18nResources.resourceMessagesDeleteFailed;
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
					<Tooltip title={i18nGeneric.delete}>
						<IconButton
							aria-label={i18nGeneric.delete}
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
						aria-label={i18nGeneric.delete}
						color="error"
						size={size}
						variant={variantDelete}
						onClick={() => open(true)}
					>
						{i18nGeneric.delete}
					</Button>
				)}
				{onlyIcon ? (
					<Tooltip title={i18nGeneric.disable}>
						<IconButton
							aria-label={i18nGeneric.disable}
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
						aria-label={i18nGeneric.disable}
						color="warning"
						size={size}
						variant={variantDisable}
						onClick={() => open(false)}
					>
						{i18nGeneric.disable}
					</Button>
				)}
			</div>
			<ConfirmDialog
				open={confirmOpen}
				title={forceDelete ? i18nResources.dialogsDeleteTitle : i18nResources.dialogsDisableTitle}
				description={
					<p>
						{forceDelete ? i18nResources.dialogsDeleteDescription : i18nResources.dialogsDisableDescription}
					</p>
				}
				confirmText={forceDelete ? i18nResources.dialogsDeleteConfirm : i18nResources.dialogsDisableConfirm}
				cancelText={forceDelete ? i18nResources.dialogsDeleteCancel : i18nResources.dialogsDisableCancel}
				processingText={i18nGeneric.processing}
				confirming={confirming}
				onConfirm={handleConfirm}
				onCancel={() => setConfirmOpen(false)}
			/>
		</div>
	);
}
