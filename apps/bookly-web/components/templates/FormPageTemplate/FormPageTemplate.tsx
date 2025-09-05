import { Box, Paper } from '@mui/material';
import { ReactNode } from 'react';
import { PageHeader } from '../../organisms/PageHeader';
import { ErrorMessage } from '../../atoms/ErrorMessage';

export interface FormPageTemplateProps {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
	breadcrumbs?: ReactNode;
	children: ReactNode;
	error?: string | null;
	maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
	paperProps?: object;
}

export function FormPageTemplate({
	title,
	subtitle,
	actions,
	breadcrumbs,
	children,
	error,
	maxWidth = 'md',
	paperProps = {}
}: FormPageTemplateProps) {
	return (
		<Box sx={{ p: 3 }}>
			<PageHeader
				title={title}
				subtitle={subtitle}
				actions={actions}
				breadcrumbs={breadcrumbs}
			/>

			{error && (
				<ErrorMessage
					message={error}
					sx={{ mb: 2 }}
				/>
			)}

			<Box
				sx={{
					maxWidth: maxWidth ? `${maxWidth}.breakpoint` : 'none',
					mx: 'auto'
				}}
			>
				<Paper
					sx={{ p: 3 }}
					{...paperProps}
				>
					{children}
				</Paper>
			</Box>
		</Box>
	);
}

export default FormPageTemplate;
