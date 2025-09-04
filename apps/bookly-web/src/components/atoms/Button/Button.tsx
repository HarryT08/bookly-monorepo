import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
	loading?: boolean;
	icon?: React.ReactNode;
}

export function Button({ loading, icon, children, disabled, ...props }: ButtonProps) {
	return (
		<MuiButton
			{...props}
			disabled={disabled || loading}
			startIcon={!loading ? icon : undefined}
		>
			{children}
		</MuiButton>
	);
}

export default Button;
