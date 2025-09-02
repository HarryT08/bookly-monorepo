'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '@hooks/useAuth';

interface AuthGuardProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	redirectTo?: string;
}

/**
 * AuthGuard component that protects routes requiring authentication
 * Redirects to login if user is not authenticated
 */
export function AuthGuard({ children, fallback, redirectTo = '/auth/login' }: AuthGuardProps) {
	const { isAuthenticated, loading, user: _user } = useAuth();
	const [checking, setChecking] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			if (!loading) {
				if (!isAuthenticated) {
					router.push(redirectTo);
					return;
				}

				setChecking(false);
			}
		};

		checkAuth();
	}, [isAuthenticated, loading, router, redirectTo]);

	// Show loading while checking authentication
	if (loading || checking) {
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

	// Show children only if authenticated
	return isAuthenticated ? <>{children}</> : null;
}

export default AuthGuard;
