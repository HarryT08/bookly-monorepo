import { Box, Typography, Button } from '@mui/material';
import { ReactNode } from 'react';

export interface PageHeaderProps {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
	breadcrumbs?: ReactNode;
	actionButton?: {
		label: string;
		onClick: () => void;
		icon?: string;
		variant?: 'contained' | 'outlined' | 'text';
	};
}

export function PageHeader({ title, subtitle, actions, breadcrumbs, actionButton }: PageHeaderProps) {
	return (
		<Box sx={{ mb: 3 }}>
			{breadcrumbs && <Box sx={{ mb: 1 }}>{breadcrumbs}</Box>}
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				flexWrap="wrap"
				gap={2}
			>
				<Box>
					<Box>
						<Typography
							variant="h4"
							fontWeight="bold"
						>
							{title}
						</Typography>
						{subtitle && (
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ mt: 0.5 }}
							>
								{subtitle}
							</Typography>
						)}
					</Box>
					<Box
						display="flex"
						gap={1}
					>
						{actionButton && (
							<Button
								variant={actionButton.variant || 'contained'}
								onClick={actionButton.onClick}
							>
								{actionButton.label}
							</Button>
						)}
						{actions && <Box>{actions}</Box>}
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

export default PageHeader;
