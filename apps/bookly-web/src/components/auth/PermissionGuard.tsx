'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';

interface PermissionGuardProps {
	children: React.ReactNode;
	permissions: string | string[];
	resource?: string;
	action?: string;
	scope?: string;
	fallback?: React.ReactNode;
	requireAll?: boolean;
}

/**
 * PermissionGuard component that protects content based on specific permissions
 * Shows fallback content if user doesn't have required permissions
 */
export function PermissionGuard({
	children,
	permissions,
	resource,
	action,
	scope,
	fallback,
	requireAll = false
}: PermissionGuardProps) {
	const { user, hasPermission } = useAuth();

	// Convert permissions to array for consistent handling
	const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

	// Check if user has required permissions
	let hasAccess = false;

	if (resource && action) {
		// Check specific permission by resource/action/scope
		hasAccess = hasPermission(resource, action, scope);
	} else {
		// Check by permission names/IDs - check if user has any permission with matching name
		hasAccess = requireAll
			? requiredPermissions.every(
					(permissionName) =>
						user?.permissions?.some((p) => p.name === permissionName || p.id === permissionName) || false
				)
			: requiredPermissions.some(
					(permissionName) =>
						user?.permissions?.some((p) => p.name === permissionName || p.id === permissionName) || false
				);
	}

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
			<SecurityIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
			<Typography
				variant="h6"
				color="text.secondary"
				align="center"
			>
				Permisos Insuficientes
			</Typography>
			<Alert
				severity="error"
				sx={{ maxWidth: 500 }}
			>
				<Typography variant="body2">
					No tienes los permisos específicos necesarios para acceder a este contenido.
				</Typography>
				{resource && action && (
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ mt: 1, display: 'block' }}
					>
						Permiso requerido: {resource}:{action}
						{scope ? `:${scope}` : ''}
					</Typography>
				)}
				{!resource && !action && (
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ mt: 1, display: 'block' }}
					>
						Permisos requeridos: {requiredPermissions.join(', ')}
					</Typography>
				)}
			</Alert>
		</Box>
	);
}

export default PermissionGuard;
