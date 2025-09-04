import { Chip } from '../Chip';
import { ChipProps } from '../Chip/Chip';

export interface StatusChipProps extends Omit<ChipProps, 'color' | 'status'> {
	status:
		| 'active'
		| 'inactive'
		| 'pending'
		| 'approved'
		| 'rejected'
		| 'critical'
		| 'low'
		| 'medium'
		| 'high'
		| 'success'
		| 'error'
		| 'warning'
		| 'info'
		| 'default'
		| 'primary'
		| 'secondary';
	statusLabels?: Record<string, string>;
}

const defaultStatusConfig = {
	active: { color: 'success' as const, label: 'Activo' },
	inactive: { color: 'default' as const, label: 'Inactivo' },
	pending: { color: 'warning' as const, label: 'Pendiente' },
	approved: { color: 'success' as const, label: 'Aprobado' },
	rejected: { color: 'error' as const, label: 'Rechazado' },
	critical: { color: 'error' as const, label: 'Crítico', variant: 'filled' as const },
	high: { color: 'error' as const, label: 'Alto' },
	medium: { color: 'warning' as const, label: 'Medio' },
	low: { color: 'success' as const, label: 'Bajo' },
	success: { color: 'success' as const, label: 'Éxito' },
	error: { color: 'error' as const, label: 'Error' },
	warning: { color: 'warning' as const, label: 'Advertencia' },
	info: { color: 'info' as const, label: 'Información' },
	default: { color: 'default' as const, label: 'Por defecto' },
	primary: { color: 'primary' as const, label: 'Principal' },
	secondary: { color: 'secondary' as const, label: 'Secundario' }
} as const;

export function StatusChip({ status, statusLabels, variant, ...props }: StatusChipProps) {
	const config = defaultStatusConfig[status];
	const label = statusLabels?.[status] || config.label;
	const chipVariant =
		('variant' in config ? config.variant : variant) || (status === 'critical' ? 'filled' : 'outlined');

	return (
		<Chip
			size="small"
			color={config.color}
			label={label}
			variant={chipVariant}
			{...props}
		/>
	);
}

export default StatusChip;
