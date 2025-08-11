'use client';

import { useState } from 'react';
import { Button, IconButton } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ConfirmDialog } from '@components/molecules/confirm-dialog';
import { deleteResource } from '@services/resources/services';
import { mockDeleteResource } from '@services/resources/mocks/crud';
import type { ResourceResponseDto } from '@services/resources/types';
import { DeleteForeverOutlined, LockOutline } from '@mui/icons-material';

export interface ResourceDeleteControlsProps {
	ariaLabel?: string;
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
		ariaLabel,
		onlyIcon = false,
		size = 'small',
		variantDisable = 'outlined',
		variantDelete = 'outlined',
		className,
		onDeleted,
		onDisabled
	} = props;

	const { enqueueSnackbar } = useSnackbar();
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
					enqueueSnackbar('Recurso eliminado correctamente. Auditoría registrada.', {
						variant: 'success'
					});
					onDeleted?.(resource.id);
				} else if (res) {
					enqueueSnackbar('Recurso deshabilitado correctamente. Auditoría registrada.', {
						variant: 'success'
					});
					onDisabled?.(res as ResourceResponseDto);
				}
			} else {
				const res = await deleteResource(resource.id, forceDelete);

				if ('success' in res && res.success) {
					enqueueSnackbar('Recurso eliminado correctamente. Auditoría registrada.', {
						variant: 'success'
					});
					onDeleted?.(resource.id);
				} else {
					const updated = res as ResourceResponseDto;
					enqueueSnackbar('Recurso deshabilitado correctamente. Auditoría registrada.', {
						variant: 'success'
					});
					onDisabled?.(updated);
				}
			}
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'No fue posible eliminar/deshabilitar el recurso';
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
					<IconButton
						aria-label="Eliminar"
						color="error"
						size={size}
						onClick={() => open(true)}
					>
						<DeleteForeverOutlined />
					</IconButton>
				) : <Button
						startIcon={<DeleteForeverOutlined />}
						aria-label="Eliminar"
						color="error"
						size={size}
						variant={variantDelete}
						onClick={() => open(true)}
					>
						Eliminar
					</Button>}
				{onlyIcon ? (
					<IconButton
						aria-label="Deshabilitar"
						color="warning"
						size={size}
						onClick={() => open(false)}
					>
						<LockOutline />
					</IconButton>
				) : <Button
						startIcon={<LockOutline />}
						aria-label="Deshabilitar"
						color="warning"
						size={size}
						variant={variantDisable}
						onClick={() => open(false)}
					>
						Deshabilitar
					</Button>}
			</div>
			<ConfirmDialog
				open={confirmOpen}
				title={forceDelete ? 'Eliminar recurso' : 'Deshabilitar recurso'}
				description={
					<p>
						{forceDelete
							? 'Esta acción eliminará permanentemente el recurso. Escribe políticas de seguridad antes de exponer en producción.'
							: 'Esta acción deshabilitará el recurso sin eliminarlo, para preservar su historial.'}
						<br />
						<span className="font-medium">{resource.name}</span>
					</p>
				}
				confirmText={forceDelete ? 'Eliminar' : 'Deshabilitar'}
				cancelText="Cancelar"
				confirming={confirming}
				onConfirm={handleConfirm}
				onCancel={() => setConfirmOpen(false)}
			/>
		</div>
	);
}
