'use client';

import { useEffect } from 'react';
import { Box, Button, Card, CardContent, Container, Typography, CircularProgress, Alert, Divider } from '@mui/material';
import { Google as GoogleIcon, School as SchoolIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@hooks/useAuth';

export default function SSOPage() {
	const { isAuthenticated, loading, ssoGoogleLogin } = useAuth();
	const router = useRouter();

	// Redirect if already authenticated
	useEffect(() => {
		if (!loading && isAuthenticated) {
			router.push('/dashboard');
		}
	}, [isAuthenticated, loading, router]);

	const handleGoogleSSO = async () => {
		try {
			ssoGoogleLogin();
		} catch (error) {
			console.error('SSO login failed:', error);
		}
	};

	const handleBackToLogin = () => {
		router.push('/auth/login');
	};

	if (loading) {
		return (
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				minHeight="100vh"
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
		);
	}

	return (
		<Container
			maxWidth="sm"
			sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
		>
			<Card sx={{ width: '100%', p: 2 }}>
				<CardContent>
					{/* Header */}
					<Box sx={{ mb: 4, textAlign: 'center' }}>
						<SchoolIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
						<Typography
							variant="h4"
							component="h1"
							gutterBottom
						>
							Bookly UFPS
						</Typography>
						<Typography
							variant="subtitle1"
							color="text.secondary"
						>
							Inicio de Sesión Institucional
						</Typography>
					</Box>

					{/* SSO Information */}
					<Alert
						severity="info"
						sx={{ mb: 4 }}
					>
						<Typography
							variant="body2"
							sx={{ mb: 1 }}
						>
							<strong>Acceso con credenciales universitarias</strong>
						</Typography>
						<Typography variant="body2">
							Utiliza tu cuenta institucional @ufps.edu.co para acceder al sistema de reservas.
						</Typography>
					</Alert>

					{/* SSO Button */}
					<Box sx={{ mb: 4 }}>
						<Button
							fullWidth
							variant="contained"
							size="large"
							startIcon={<GoogleIcon />}
							onClick={handleGoogleSSO}
							sx={{
								py: 2,
								fontSize: '1.1rem',
								background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
								'&:hover': {
									background: 'linear-gradient(135deg, #3367d6 0%, #2e8b47 100%)'
								}
							}}
						>
							Continuar con Google Workspace
						</Button>
					</Box>

					{/* Benefits */}
					<Box sx={{ mb: 4 }}>
						<Typography
							variant="h6"
							gutterBottom
							align="center"
						>
							Beneficios del acceso SSO
						</Typography>
						<Box
							component="ul"
							sx={{ pl: 2 }}
						>
							<Box
								component="li"
								sx={{ mb: 1 }}
							>
								<Typography variant="body2">✅ Sin contraseñas adicionales que recordar</Typography>
							</Box>
							<Box
								component="li"
								sx={{ mb: 1 }}
							>
								<Typography variant="body2">
									✅ Acceso seguro con credenciales institucionales
								</Typography>
							</Box>
							<Box
								component="li"
								sx={{ mb: 1 }}
							>
								<Typography variant="body2">
									✅ Asignación automática de permisos por dominio
								</Typography>
							</Box>
							<Box
								component="li"
								sx={{ mb: 1 }}
							>
								<Typography variant="body2">✅ Integración con Google Calendar</Typography>
							</Box>
						</Box>
					</Box>

					<Divider sx={{ mb: 3 }} />

					{/* Alternative Login */}
					<Box sx={{ textAlign: 'center' }}>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 2 }}
						>
							¿Problemas con el acceso SSO?
						</Typography>
						<Button
							variant="outlined"
							startIcon={<BackIcon />}
							onClick={handleBackToLogin}
						>
							Usar inicio de sesión tradicional
						</Button>
					</Box>

					{/* Support Information */}
					<Alert
						severity="warning"
						sx={{ mt: 3 }}
					>
						<Typography variant="body2">
							<strong>Importante:</strong> Solo usuarios con cuentas @ufps.edu.co pueden acceder mediante
							SSO. Para otros casos, utiliza el sistema de inicio de sesión tradicional.
						</Typography>
					</Alert>
				</CardContent>
			</Card>
		</Container>
	);
}
