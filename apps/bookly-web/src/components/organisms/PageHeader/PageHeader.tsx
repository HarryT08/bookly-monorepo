import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

export interface PageHeaderProps {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
	breadcrumbs?: ReactNode;
}

export function PageHeader({ title, subtitle, actions, breadcrumbs }: PageHeaderProps) {
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
					<Typography
						variant="h4"
						component="h1"
						gutterBottom={!!subtitle}
					>
						{title}
					</Typography>
					{subtitle && (
						<Typography
							variant="body1"
							color="text.secondary"
						>
							{subtitle}
						</Typography>
					)}
				</Box>
				{actions && <Box>{actions}</Box>}
			</Box>
		</Box>
	);
}

export default PageHeader;
