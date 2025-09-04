import { Box, Paper } from '@mui/material';
import { ReactNode } from 'react';
import { PageHeader } from '../../organisms/PageHeader';
import { StatsGrid } from '../../organisms/StatsGrid';
import { FilterBar, FilterBarProps } from '../../molecules/FilterBar';
import { DataTable, DataTableProps } from '../../organisms/DataTable';
import { ErrorMessage } from '../../atoms/ErrorMessage';
import { StatCardProps } from '../../molecules/StatCard';

export interface DataTablePageTemplateProps {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
	breadcrumbs?: ReactNode;
	stats?: StatCardProps[];
	filterBar?: FilterBarProps;
	table: DataTableProps;
	error?: string | null;
	additionalContent?: ReactNode;
}

export function DataTablePageTemplate({
	title,
	subtitle,
	actions,
	breadcrumbs,
	stats,
	filterBar,
	table,
	error,
	additionalContent
}: DataTablePageTemplateProps) {
	return (
		<Box sx={{ p: 3 }}>
			<PageHeader
				title={title}
				subtitle={subtitle}
				actions={actions}
				breadcrumbs={breadcrumbs}
			/>

			{error && (
				<ErrorMessage
					message={error}
					sx={{ mb: 2 }}
				/>
			)}

			{stats && stats.length > 0 && <StatsGrid stats={stats} />}

			{filterBar && (
				<Paper sx={{ mb: 2 }}>
					<FilterBar {...filterBar} />
				</Paper>
			)}

			<DataTable {...table} />

			{additionalContent}
		</Box>
	);
}

export default DataTablePageTemplate;
