import { Box, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { FilterList as FilterListIcon } from '@mui/icons-material';
import { SearchBar } from '../SearchBar';

export interface FilterOption {
	value: string;
	label: string;
}

export interface FilterBarProps {
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	searchPlaceholder?: string;
	filters?: {
		label: string;
		value: string;
		options: FilterOption[];
		onChange: (value: string) => void;
	}[];
	onClearFilters?: () => void;
	showClearButton?: boolean;
}

export function FilterBar({
	searchValue = '',
	onSearchChange,
	searchPlaceholder,
	filters = [],
	onClearFilters,
	showClearButton = true
}: FilterBarProps) {
	return (
		<Box
			display="flex"
			flexWrap="wrap"
			gap={2}
			alignItems="center"
			p={2}
		>
			{onSearchChange && (
				<Box
					flex={{ xs: '1 1 100%', md: '1 1 40%' }}
					minWidth={{ xs: '100%', md: '200px' }}
				>
					<SearchBar
						value={searchValue}
						onChange={onSearchChange}
						placeholder={searchPlaceholder}
					/>
				</Box>
			)}

			{filters.map((filter, index) => (
				<Box
					key={index}
					flex={{ xs: '1 1 100%', md: '1 1 25%' }}
					minWidth={{ xs: '100%', md: '150px' }}
				>
					<FormControl fullWidth>
						<InputLabel>{filter.label}</InputLabel>
						<Select
							value={filter.value}
							label={filter.label}
							onChange={(e) => filter.onChange(e.target.value)}
						>
							{filter.options.map((option) => (
								<MenuItem
									key={option.value}
									value={option.value}
								>
									{option.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>
			))}

			{showClearButton && onClearFilters && (
				<Box
					flex={{ xs: '1 1 100%', md: '1 1 auto' }}
					minWidth={{ xs: '100%', md: '120px' }}
				>
					<Button
						fullWidth
						variant="outlined"
						startIcon={<FilterListIcon />}
						onClick={onClearFilters}
					>
						Limpiar
					</Button>
				</Box>
			)}
		</Box>
	);
}

export default FilterBar;
