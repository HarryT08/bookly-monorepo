'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';

interface RoleGuardProps {
	children: React.ReactNode;
	roles: string | string[];
	fallback?: React.ReactNode;
	requireAll?: boolean;
}

/**
 * RoleGuard component that protects content based on user roles
 * Shows fallback content if user doesn't have required roles
 */
export function RoleGuard({ children, roles, fallback, requireAll = false }: RoleGuardProps) {
	const { user, hasRole } = useAuth();

	// Convert roles to array for consistent handling
	const requiredRoles = Array.isArray(roles) ? roles : [roles];

	// Check if user has required roles
	const hasAccess = requireAll
		? requiredRoles.every((role) => hasRole(role))
		: requiredRoles.some((role) => hasRole(role));

	// If user has access, render children
	if (hasAccess) {
		return <>{children}</>;
	}

	// Show fallback or default unauthorized message
	if (fallback) {
		return <>{fallback}</>;
	}

	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			minHeight="200px"
			gap={2}
			p={3}
		>
			<LockIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
			<Typography
				variant="h6"
				color="text.secondary"
				align="center"
			>
				Acceso Restringido
			</Typography>
			<Alert
				severity="warning"
				sx={{ maxWidth: 400 }}
			>
				<Typography variant="body2">No tienes los permisos necesarios para ver este contenido.</Typography>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ mt: 1, display: 'block' }}
				>
					Roles requeridos: {requiredRoles.join(', ')}
				</Typography>
			</Alert>
		</Box>
	);
}

export default RoleGuard;
