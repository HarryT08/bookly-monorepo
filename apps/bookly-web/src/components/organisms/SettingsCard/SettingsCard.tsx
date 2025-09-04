import { Card, CardContent, Box, Typography } from '@mui/material';

interface SettingsCardProps {
	title: string;
	icon: React.ReactNode;
	iconColor?: string;
	children: React.ReactNode;
}

export function SettingsCard({ title, icon, iconColor = 'primary.main', children }: SettingsCardProps) {
	return (
		<Card>
			<CardContent>
				<Box
					display="flex"
					alignItems="center"
					mb={2}
				>
					<Box sx={{ mr: 1, color: iconColor }}>{icon}</Box>
					<Typography variant="h6">{title}</Typography>
				</Box>
				{children}
			</CardContent>
		</Card>
	);
}

export default SettingsCard;
