import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';

export interface TextFieldProps extends Omit<MuiTextFieldProps, 'variant'> {
	variant?: 'outlined' | 'filled' | 'standard';
}

export function TextField({ variant = 'outlined', ...props }: TextFieldProps) {
	return (
		<MuiTextField
			variant={variant}
			{...props}
		/>
	);
}

export default TextField;
