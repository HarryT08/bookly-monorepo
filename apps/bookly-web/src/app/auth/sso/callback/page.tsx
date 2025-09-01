'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, CircularProgress, Alert, Button, Card, CardContent } from '@mui/material';
import { CheckCircle as SuccessIcon, Error as ErrorIcon, Home as HomeIcon } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@hooks/useAuth';

type CallbackState = 'loading' | 'success' | 'error';

export default function SSOCallbackPage() {
	const [state, setState] = useState<CallbackState>('loading');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const router = useRouter();
	const searchParams = useSearchParams();
	const { handleSSOCallback } = useAuth();

	useEffect(() => {
		const processCallback = async () => {
			try {
				// Get URL parameters
				const code = searchParams.get('code');
				const state = searchParams.get('state');
				const error = searchParams.get('error');
				const errorDescription = searchParams.get('error_description');

				// Handle OAuth errors
				if (error) {
					setErrorMessage(errorDescription || `Error de OAuth: ${error}`);
					setState('error');
					return;
				}

				// Validate required parameters
				if (!code) {
					setErrorMessage('Código de autorización no recibido');
					setState('error');
					return;
				}

				// Process the callback
				await handleSSOCallback(code, state);
				setState('success');

				// Redirect to dashboard after success
				setTimeout(() => {
					router.push('/dashboard');
				}, 2000);
			} catch (error) {
				console.error('SSO callback error:', error);
				setErrorMessage(error instanceof Error ? error.message : 'Error procesando el inicio de sesión SSO');
				setState('error');
			}
		};

		processCallback();
	}, [searchParams, handleSSOCallback, router]);

	const handleRetry = () => {
		router.push('/auth/sso');
	};

	const handleGoHome = () => {
		router.push('/');
	};

	return (
		<Container
			maxWidth="sm"
			sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
		>
			<Card sx={{ width: '100%', p: 2 }}>
				<CardContent>
					<Box sx={{ textAlign: 'center' }}>
						{state === 'loading' && (
							<>
								<CircularProgress
									sx={{ mb: 3 }}
									size={64}
								/>
								<Typography
									variant="h5"
									gutterBottom
								>
									Procesando inicio de sesión...
								</Typography>
								<Typography
									variant="body1"
									color="text.secondary"
								>
									Por favor espera mientras verificamos tu autenticación SSO
								</Typography>
							</>
						)}

						{state === 'success' && (
							<>
								<SuccessIcon sx={{ fontSize: 64, color: 'success.main', mb: 3 }} />
								<Typography
									variant="h5"
									gutterBottom
									color="success.main"
								>
									¡Inicio de sesión exitoso!
								</Typography>
								<Typography
									variant="body1"
									color="text.secondary"
									sx={{ mb: 3 }}
								>
									Has iniciado sesión correctamente con tu cuenta institucional.
								</Typography>
								<Alert
									severity="success"
									sx={{ mb: 3 }}
								>
									Serás redirigido al panel de control automáticamente...
								</Alert>
								<Button
									variant="contained"
									startIcon={<HomeIcon />}
									onClick={handleGoHome}
								>
									Ir al Panel de Control
								</Button>
							</>
						)}

						{state === 'error' && (
							<>
								<ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 3 }} />
								<Typography
									variant="h5"
									gutterBottom
									color="error.main"
								>
									Error en el inicio de sesión
								</Typography>
								<Typography
									variant="body1"
									color="text.secondary"
									sx={{ mb: 3 }}
								>
									No se pudo completar el proceso de autenticación SSO.
								</Typography>

								<Alert
									severity="error"
									sx={{ mb: 3, textAlign: 'left' }}
								>
									<Typography variant="body2">
										<strong>Detalles del error:</strong>
									</Typography>
									<Typography variant="body2">{errorMessage}</Typography>
								</Alert>

								<Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
									<Button
										variant="contained"
										onClick={handleRetry}
									>
										Reintentar SSO
									</Button>
									<Button
										variant="outlined"
										onClick={() => router.push('/auth/login')}
									>
										Inicio de Sesión Tradicional
									</Button>
								</Box>

								{/* Troubleshooting tips */}
								<Box sx={{ mt: 4, textAlign: 'left' }}>
									<Typography
										variant="h6"
										gutterBottom
									>
										Posibles soluciones:
									</Typography>
									<Box
										component="ul"
										sx={{ pl: 2 }}
									>
										<Box
											component="li"
											sx={{ mb: 1 }}
										>
											<Typography variant="body2">
												Verifica que estés usando una cuenta @ufps.edu.co
											</Typography>
										</Box>
										<Box
											component="li"
											sx={{ mb: 1 }}
										>
											<Typography variant="body2">
												Asegúrate de que el navegador permita ventanas emergentes
											</Typography>
										</Box>
										<Box
											component="li"
											sx={{ mb: 1 }}
										>
											<Typography variant="body2">
												Limpia la caché y cookies del navegador
											</Typography>
										</Box>
										<Box
											component="li"
											sx={{ mb: 1 }}
										>
											<Typography variant="body2">Intenta con un navegador diferente</Typography>
										</Box>
									</Box>
								</Box>
							</>
						)}
					</Box>
				</CardContent>
			</Card>
		</Container>
	);
}
