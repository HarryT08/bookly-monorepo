'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';

interface AdminGuardProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	level?: 'general' | 'program' | 'any';
}

/**
 * AdminGuard component specifically for administrator-only content
 * Implements RF-42 requirement for modification restrictions
 */
export function AdminGuard({ children, fallback, level = 'any' }: AdminGuardProps) {
	const { user, hasRole } = useAuth();

	// Check administrator access based on level
	let hasAdminAccess = false;

	switch (level) {
		case 'general':
			hasAdminAccess = hasRole('ADMINISTRADOR_GENERAL');
			break;
		case 'program':
			hasAdminAccess = hasRole('ADMINISTRADOR_PROGRAMA');
			break;
		case 'any':
		default:
			hasAdminAccess = hasRole('ADMINISTRADOR_GENERAL') || hasRole('ADMINISTRADOR_PROGRAMA');
			break;
	}

	// If user has admin access, render children
	if (hasAdminAccess) {
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
			<AdminIcon sx={{ fontSize: 48, color: 'error.main' }} />
			<Typography
				variant="h6"
				color="error.main"
				align="center"
			>
				Acceso Solo para Administradores
			</Typography>
			<Alert
				severity="error"
				sx={{ maxWidth: 500 }}
			>
				<Typography variant="body2">
					Esta funcionalidad está restringida únicamente a usuarios administradores.
				</Typography>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ mt: 1, display: 'block' }}
				>
					{level === 'general' && 'Se requiere rol de Administrador General'}
					{level === 'program' && 'Se requiere rol de Administrador de Programa'}
					{level === 'any' && 'Se requiere rol de Administrador (General o de Programa)'}
				</Typography>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ mt: 1, display: 'block' }}
				>
					Conforme al RF-42: Restricción de modificación de recursos
				</Typography>
			</Alert>
		</Box>
	);
}

export default AdminGuard;
