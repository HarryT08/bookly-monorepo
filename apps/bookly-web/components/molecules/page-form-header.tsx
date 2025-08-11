'use client';

import type { ReactNode } from 'react';

export interface PageHeaderProps {
	title: string;
	actions?: ReactNode;
	className?: string;
}

export function PageFormHeader({ title, actions, className }: PageHeaderProps) {
	return (
		<div className={`flex items-center justify-between ${className ?? ''}`}>
			<h1 className="text-2xl font-semibold">{title}</h1>
			{actions ? <div className="flex gap-2">{actions}</div> : null}
		</div>
	);
}
