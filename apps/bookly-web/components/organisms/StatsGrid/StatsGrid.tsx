import { Box } from '@mui/material';
import { StatCard, StatCardProps } from '../../molecules/StatCard';

export interface StatsGridProps {
	stats: StatCardProps[];
	columns?: {
		xs?: number;
		sm?: number;
		md?: number;
		lg?: number;
	};
}

export function StatsGrid({ stats, columns = { xs: 1, sm: 2, md: 4, lg: 4 } }: StatsGridProps) {
	const getFlexBasis = (cols: number) => `calc(${100 / cols}% - 18px)`;

	return (
		<Box
			display="flex"
			flexWrap="wrap"
			gap={3}
			sx={{ mb: 3 }}
		>
			{stats.map((stat, index) => (
				<Box
					key={index}
					flex={{
						xs: `1 1 ${getFlexBasis(columns.xs || 1)}`,
						sm: `1 1 ${getFlexBasis(columns.sm || 2)}`,
						md: `1 1 ${getFlexBasis(columns.md || 4)}`,
						lg: `1 1 ${getFlexBasis(columns.lg || 4)}`
					}}
					minWidth={{
						xs: `${getFlexBasis(columns.xs || 1)}`,
						sm: `${getFlexBasis(columns.sm || 2)}`,
						md: `${getFlexBasis(columns.md || 4)}`,
						lg: `${getFlexBasis(columns.lg || 4)}`
					}}
				>
					<StatCard {...stat} />
				</Box>
			))}
		</Box>
	);
}

export default StatsGrid;
