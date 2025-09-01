'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '@hooks/useAuth';

interface GuestGuardProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	redirectTo?: string;
}

/**
 * GuestGuard component that protects routes for unauthenticated users only
 * Redirects to dashboard if user is already authenticated
 */
export function GuestGuard({ children, fallback, redirectTo = '/dashboard' }: GuestGuardProps) {
	const { isAuthenticated, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && isAuthenticated) {
			router.push(redirectTo);
		}
	}, [isAuthenticated, loading, router, redirectTo]);

	// Show loading while checking authentication
	if (loading) {
		return (
			fallback || (
				<Box
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					minHeight="60vh"
					gap={2}
				>
					<CircularProgress />
					<Typography
						variant="body2"
						color="text.secondary"
					>
						Verificando autenticación...
					</Typography>
				</Box>
			)
		);
	}

	// Show children only if not authenticated
	return !isAuthenticated ? <>{children}</> : null;
}

export default GuestGuard;
