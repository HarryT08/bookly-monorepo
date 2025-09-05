import { Box, CircularProgress, Typography } from '@mui/material';

export interface LoadingSpinnerProps {
	size?: number | string;
	message?: string;
	color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
	centered?: boolean;
	fullHeight?: boolean;
}

export function LoadingSpinner({
	size = 40,
	message,
	color = 'primary',
	centered = true,
	fullHeight = false
}: LoadingSpinnerProps) {
	const content = (
		<>
			<CircularProgress
				size={size}
				color={color}
			/>
			{message && (
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ mt: 2 }}
				>
					{message}
				</Typography>
			)}
		</>
	);

	if (centered) {
		return (
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				minHeight={fullHeight ? '400px' : 'auto'}
				p={2}
			>
				{content}
			</Box>
		);
	}

	return content;
}

export default LoadingSpinner;
