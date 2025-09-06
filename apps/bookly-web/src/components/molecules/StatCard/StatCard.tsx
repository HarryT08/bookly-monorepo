import { Card, CardContent, Box, Typography, SvgIconProps } from '@mui/material';
import { ReactElement, JSXElementConstructor } from 'react';

export interface StatCardProps {
	title: string;
	value: string | number;
	icon?: ReactElement<SvgIconProps, string | JSXElementConstructor<any>> | any;
	iconColor?: string;
	description?: string;
	trend?: {
		value: number;
		isPositive: boolean;
	};
}

export function StatCard({ title, value, icon, iconColor = 'primary.main', description, trend }: StatCardProps) {
	return (
		<Card>
			<CardContent>
				<Box
					display="flex"
					alignItems="center"
				>
					{icon && (
						<Box
							sx={{
								fontSize: 40,
								color: iconColor,
								mr: 2
							}}
						>
							{icon}
						</Box>
					)}
					<Box>
						<Typography variant="h5">{value}</Typography>
						<Typography color="text.secondary">{title}</Typography>
						{description && (
							<Typography
								variant="caption"
								color="text.secondary"
							>
								{description}
							</Typography>
						)}
						{trend && (
							<Typography
								variant="caption"
								color={trend.isPositive ? 'success.main' : 'error.main'}
								sx={{ display: 'block' }}
							>
								{trend.isPositive ? '+' : ''}
								{trend.value}%
							</Typography>
						)}
					</Box>
				</Box>
			</CardContent>
		</Card>
	);
}

export default StatCard;
