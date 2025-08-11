'use client';

import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface ConfirmDialogProps {
	open: boolean;
	title?: string;
	description?: ReactNode;
	confirmText?: string;
	cancelText?: string;
	confirming?: boolean;
	onConfirm: () => void | Promise<void>;
	onCancel: () => void;
}

export function ConfirmDialog({
	open,
	title = 'Confirmación',
	description,
	confirmText = 'Confirmar',
	cancelText = 'Cancelar',
	confirming = false,
	onConfirm,
	onCancel
}: ConfirmDialogProps) {
	if (!open) return null;

	return createPortal(
		<div
			role="dialog"
			aria-modal="true"
			className="fixed inset-0 z-[1400] flex items-center justify-center"
		>
			<div
				aria-hidden
				className="absolute inset-0 z-[1399] bg-black/40"
				onClick={onCancel}
			/>
			<div className="relative z-[1400] w-full max-w-md rounded bg-white p-6 shadow-lg">
				<h2 className="mb-2 text-lg font-semibold">{title}</h2>
				{description && <div className="mb-4 text-sm text-gray-700">{description}</div>}
				<div className="flex items-center justify-end gap-2">
					<button
						type="button"
						className="rounded border px-3 py-2 text-sm"
						onClick={onCancel}
						disabled={confirming}
					>
						{cancelText}
					</button>
					<button
						type="button"
						className="rounded bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-60"
						onClick={onConfirm}
						disabled={confirming}
					>
						{confirming ? 'Procesando…' : confirmText}
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}
