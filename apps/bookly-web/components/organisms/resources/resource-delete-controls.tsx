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
	const { t } = useTranslation('resources');
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirming, setConfirming] = useState(false);
	const [forceDelete, setForceDelete] = useState(false);

	const labelDelete =
		ariaLabelDelete ??
		t('actions.delete.aria', {
			defaultValue: 'Eliminar recurso {{name}}',
			name: resource.name
		});
	const labelDisable =
		ariaLabelDisable ??
		t('actions.disable.aria', {
			defaultValue: 'Deshabilitar recurso {{name}}',
			name: resource.name
		});

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
					enqueueSnackbar(
						t('messages.deleted', {
							defaultValue: 'Recurso eliminado correctamente. Auditoría registrada.'
						}),
						{ variant: 'success' }
					);
					onDeleted?.(resource.id);
				} else if (res) {
					enqueueSnackbar(
						t('messages.disabled', {
							defaultValue: 'Recurso deshabilitado correctamente. Auditoría registrada.'
						}),
						{ variant: 'success' }
					);
					onDisabled?.(res as ResourceResponseDto);
				}
			} else {
				const res = await deleteResource(resource.id, forceDelete);

				if ('success' in res && res.success) {
					enqueueSnackbar(
						t('messages.deleted', {
							defaultValue: 'Recurso eliminado correctamente. Auditoría registrada.'
						}),
						{ variant: 'success' }
					);
					onDeleted?.(resource.id);
				} else {
					const updated = res as ResourceResponseDto;
					enqueueSnackbar(
						t('messages.disabled', {
							defaultValue: 'Recurso deshabilitado correctamente. Auditoría registrada.'
						}),
						{ variant: 'success' }
					);
					onDisabled?.(updated);
				}
			}
		} catch (e) {
			const msg =
				e instanceof Error
					? e.message
					: t('errors.delete_or_disable_failed', {
							defaultValue: 'No fue posible eliminar/deshabilitar el recurso'
						});
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
						{t('actions.delete.label', { defaultValue: 'Eliminar' })}
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
						{t('actions.disable.label', { defaultValue: 'Deshabilitar' })}
					</Button>
				)}
			</div>
			<ConfirmDialog
				open={confirmOpen}
				title={
					forceDelete
						? t('dialogs.delete.title', { defaultValue: 'Eliminar recurso' })
						: t('dialogs.disable.title', {
								defaultValue: 'Deshabilitar recurso'
							})
				}
				description={
					<p>
						{forceDelete
							? t('dialogs.delete.description', {
									defaultValue:
										'Esta acción eliminará permanentemente el recurso. Escribe políticas de seguridad antes de exponer en producción.'
								})
							: t('dialogs.disable.description', {
									defaultValue:
										'Esta acción deshabilitará el recurso sin eliminarlo, para preservar su historial.'
								})}
						<br />
						<span className="font-medium">{resource.name}</span>
					</p>
				}
				confirmText={
					forceDelete
						? t('dialogs.delete.confirm', { defaultValue: 'Eliminar' })
						: t('dialogs.disable.confirm', { defaultValue: 'Deshabilitar' })
				}
				cancelText={t('common.cancel', { defaultValue: 'Cancelar' })}
				confirming={confirming}
				onConfirm={handleConfirm}
				onCancel={() => setConfirmOpen(false)}
			/>
		</div>
	);
}
