import { Alert, AlertProps } from '@mui/material';

export interface ErrorMessageProps extends Omit<AlertProps, 'severity'> {
	message: string;
	variant?: 'filled' | 'outlined' | 'standard';
}

export function ErrorMessage({ message, variant = 'standard', ...props }: ErrorMessageProps) {
	return (
		<Alert
			severity="error"
			variant={variant}
			{...props}
		>
			{message}
		</Alert>
	);
}

export default ErrorMessage;
