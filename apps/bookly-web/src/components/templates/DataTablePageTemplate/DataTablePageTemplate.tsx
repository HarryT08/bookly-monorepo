import { Box, Paper } from '@mui/material';
import { ReactNode } from 'react';
import { PageHeader } from '../../organisms/PageHeader';
import { StatsGrid } from '../../organisms/StatsGrid';
import { FilterBar, FilterBarProps } from '../../molecules/FilterBar';
import { DataTable, DataTableProps } from '../../organisms/DataTable';
import { ErrorMessage } from '../../atoms/ErrorMessage';
import { StatCardProps } from '../../molecules/StatCard';

export interface DataTablePageTemplateProps {
	pageHeader?: {
		title: string;
		subtitle?: string;
		actions?: ReactNode;
		breadcrumbs?: ReactNode;
	};
	statsData?: StatCardProps[];
	searchPlaceholder?: string;
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	filterOptions?: any[];
	filterValues?: any;
	onFilterChange?: (filters: any) => void;
	columns: any[];
	data: any[];
	loading?: boolean;
	error?: string | null;
	emptyMessage?: string;
	onRowClick?: (row: any) => void;
	additionalContent?: ReactNode;
}

export function DataTablePageTemplate({
	pageHeader,
	statsData,
	searchPlaceholder,
	searchValue,
	onSearchChange,
	filterOptions,
	filterValues,
	onFilterChange,
	columns,
	data,
	loading,
	error,
	emptyMessage,
	onRowClick,
	additionalContent
}: DataTablePageTemplateProps) {
	const filterBarProps: FilterBarProps = {
		searchPlaceholder,
		searchValue,
		onSearchChange,
		filterOptions,
		filterValues,
		onFilterChange
	};

	const tableProps: DataTableProps = {
		columns,
		data,
		loading,
		emptyMessage,
		onRowClick
	};

	return (
		<Box sx={{ p: 3 }}>
			{pageHeader && (
				<PageHeader
					title={pageHeader.title}
					subtitle={pageHeader.subtitle}
					actions={pageHeader.actions}
					breadcrumbs={pageHeader.breadcrumbs}
				/>
			)}

			{error && (
				<ErrorMessage
					message={error}
					sx={{ mb: 2 }}
				/>
			)}

			{statsData && statsData.length > 0 && <StatsGrid stats={statsData} />}

			{(searchPlaceholder || filterOptions) && (
				<Paper sx={{ mb: 2 }}>
					<FilterBar {...filterBarProps} />
				</Paper>
			)}

			<DataTable {...tableProps} />

			{additionalContent}
		</Box>
	);
}

export default DataTablePageTemplate;
