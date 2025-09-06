import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	Paper,
	Box,
	Typography
} from '@mui/material';
import { ReactNode } from 'react';
import { LoadingSpinner } from '../../atoms/LoadingSpinner';
import { ErrorMessage } from '../../atoms/ErrorMessage';

export interface DataTableColumn<T = any> {
	id: string;
	key?: string;
	accessorKey?: string;
	label: string;
	header?: string;
	align?: 'left' | 'center' | 'right';
	minWidth?: number;
	size?: number;
	format?: (value: any) => ReactNode;
	render?: (value: any, row: T) => ReactNode;
	Cell?: (props: { cell: { getValue: () => any } }) => ReactNode;
}

export interface DataTableProps<T = any> {
	columns: DataTableColumn<T>[];
	data: T[];
	loading?: boolean;
	error?: string | null;
	page?: number;
	rowsPerPage?: number;
	totalRows?: number;
	onPageChange?: (page: number) => void;
	onRowsPerPageChange?: (rowsPerPage: number) => void;
	rowsPerPageOptions?: number[];
	getRowId?: (row: T, index: number) => string;
	onRowClick?: (row: T) => void;
	emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
	columns,
	data,
	loading = false,
	error = null,
	page = 0,
	rowsPerPage = 10,
	totalRows,
	onPageChange,
	onRowsPerPageChange,
	rowsPerPageOptions = [5, 10, 25],
	getRowId = (row: T, index: number) => row.id || index.toString(),
	onRowClick,
	emptyMessage = 'No hay datos disponibles'
}: DataTableProps<T>) {
	if (loading) {
		return (
			<LoadingSpinner
				fullHeight
				message="Cargando datos..."
			/>
		);
	}

	if (error) {
		return <ErrorMessage message={error} />;
	}

	const handleChangePage = (_: unknown, newPage: number) => {
		onPageChange?.(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newRowsPerPage = parseInt(event.target.value, 10);
		onRowsPerPageChange?.(newRowsPerPage);
		onPageChange?.(0);
	};

	return (
		<TableContainer component={Paper}>
			<Table>
				<TableHead>
					<TableRow>
						{columns.map((column) => (
							<TableCell
								key={column.id}
								align={column.align}
								style={{ minWidth: column.minWidth }}
							>
								{column.label}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{data.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								align="center"
							>
								<Box p={3}>
									<Typography color="text.secondary">{emptyMessage}</Typography>
								</Box>
							</TableCell>
						</TableRow>
					) : (
						data.map((row, index) => (
							<TableRow
								key={getRowId(row, index)}
								hover={!!onRowClick}
								onClick={() => onRowClick?.(row)}
								sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
							>
								{columns.map((column) => {
									const value = row[column.id];
									return (
										<TableCell
											key={column.id}
											align={column.align}
										>
											{column.format ? column.format(value) : value}
										</TableCell>
									);
								})}
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
			{(onPageChange || onRowsPerPageChange) && (
				<TablePagination
					rowsPerPageOptions={rowsPerPageOptions}
					component="div"
					count={totalRows || data.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			)}
		</TableContainer>
	);
}

export default DataTable;
