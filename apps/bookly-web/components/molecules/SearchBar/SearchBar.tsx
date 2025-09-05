import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

export interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	fullWidth?: boolean;
	variant?: 'outlined' | 'filled' | 'standard';
}

export function SearchBar({ 
	value, 
	onChange, 
	placeholder = "Buscar...", 
	fullWidth = true,
	variant = "outlined" 
}: SearchBarProps) {
	return (
		<TextField
			fullWidth={fullWidth}
			variant={variant}
			placeholder={placeholder}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			InputProps={{
				startAdornment: (
					<InputAdornment position="start">
						<SearchIcon />
					</InputAdornment>
				)
			}}
		/>
	);
}

export default SearchBar;
