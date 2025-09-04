import { Chip as MuiChip, ChipProps as MuiChipProps } from '@mui/material';

export interface ChipProps extends MuiChipProps {
	status?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export function Chip({ status, color, ...props }: ChipProps) {
	// Map status to MUI color if status is provided
	const chipColor = status ? (status === 'default' ? 'default' : status) : color;

	return (
		<MuiChip
			color={chipColor}
			{...props}
		/>
	);
}

export default Chip;
