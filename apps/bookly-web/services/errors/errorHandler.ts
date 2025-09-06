// Note: notistack will be imported dynamically to avoid SSR issues

export interface BooklyApiError {
	code: string;
	message: string;
	type: 'error' | 'warning' | 'info';
	exception_code: string;
	http_code: number;
	http_exception: string;
}

export interface ValidationError {
	field: string;
	message: string;
	value?: unknown;
}

export class BooklyError extends Error {
	public readonly code: string;
	public readonly statusCode: number;
	public readonly type: 'error' | 'warning' | 'info';
	public readonly details?: unknown;
	public readonly validationErrors?: ValidationError[];

	constructor(
		message: string,
		code = 'UNKNOWN_ERROR',
		statusCode = 500,
		type: 'error' | 'warning' | 'info' = 'error',
		details?: unknown,
		validationErrors?: ValidationError[]
	) {
		super(message);
		this.name = 'BooklyError';
		this.code = code;
		this.statusCode = statusCode;
		this.type = type;
		this.details = details;
		this.validationErrors = validationErrors;
	}

	static fromApiError(apiError: BooklyApiError): BooklyError {
		return new BooklyError(apiError.message, apiError.code, apiError.http_code, apiError.type, apiError);
	}

	static fromResponse(response: Response, data?: unknown): BooklyError {
		const statusCode = response.status;
		let message = `HTTP Error ${statusCode}`;
		let code = `HTTP_${statusCode}`;

		// Handle common HTTP status codes
		switch (statusCode) {
			case 400:
				message = 'Solicitud inválida';
				code = 'BAD_REQUEST';
				break;
			case 401:
				message = 'No autorizado. Por favor, inicie sesión nuevamente.';
				code = 'UNAUTHORIZED';
				break;
			case 403:
				message = 'No tiene permisos para realizar esta acción';
				code = 'FORBIDDEN';
				break;
			case 404:
				message = 'Recurso no encontrado';
				code = 'NOT_FOUND';
				break;
			case 408:
				message = 'Tiempo de espera agotado';
				code = 'REQUEST_TIMEOUT';
				break;
			case 409:
				message = 'Conflicto con el estado actual del recurso';
				code = 'CONFLICT';
				break;
			case 422:
				message = 'Error de validación';
				code = 'VALIDATION_ERROR';
				break;
			case 429:
				message = 'Demasiadas solicitudes. Intente más tarde.';
				code = 'TOO_MANY_REQUESTS';
				break;
			case 500:
				message = 'Error interno del servidor';
				code = 'INTERNAL_SERVER_ERROR';
				break;
			case 502:
				message = 'Servicio temporalmente no disponible';
				code = 'BAD_GATEWAY';
				break;
			case 503:
				message = 'Servicio no disponible';
				code = 'SERVICE_UNAVAILABLE';
				break;
		}

		// Try to extract error details from response data
		if (data && typeof data === 'object') {
			const errorData = data as any;

			if (errorData.message) {
				message = errorData.message;
			}

			if (errorData.code) {
				code = errorData.code;
			}
		}

		return new BooklyError(message, code, statusCode, 'error', data);
	}

	static networkError(): BooklyError {
		return new BooklyError('Error de conexión. Verifique su conexión a internet.', 'NETWORK_ERROR', 0, 'error');
	}

	static validationError(errors: ValidationError[]): BooklyError {
		return new BooklyError(
			'Error de validación en los datos enviados',
			'VALIDATION_ERROR',
			422,
			'error',
			undefined,
			errors
		);
	}
}

export class ErrorHandler {
	static handle(error: unknown, context?: string): BooklyError {
		console.error(`Error in ${context || 'unknown context'}:`, error);

		if (error instanceof BooklyError) {
			this.showNotification(error);
			return error;
		}

		if (error instanceof Error) {
			const booklyError = new BooklyError(error.message, 'GENERIC_ERROR', 500, 'error', error);
			this.showNotification(booklyError);
			return booklyError;
		}

		// Handle fetch/network errors
		if (typeof error === 'object' && error !== null) {
			const errorObj = error as any;

			if (errorObj.name === 'TypeError' && errorObj.message.includes('fetch')) {
				const networkError = BooklyError.networkError();
				this.showNotification(networkError);
				return networkError;
			}
		}

		const unknownError = new BooklyError('Ha ocurrido un error inesperado', 'UNKNOWN_ERROR', 500, 'error', error);
		this.showNotification(unknownError);
		return unknownError;
	}

	static async handleApiResponse(response: Response): Promise<any> {
		const contentType = response.headers.get('content-type');
		let data: any = null;

		try {
			if (contentType?.includes('application/json')) {
				data = await response.json();
			} else {
				data = await response.text();
			}
		} catch {
			// Ignore parsing errors, data will remain null
		}

		if (!response.ok) {
			// If response contains Bookly API error format
			if (data && typeof data === 'object' && data.code && data.message) {
				throw BooklyError.fromApiError(data as BooklyApiError);
			}

			// Generic HTTP error
			throw BooklyError.fromResponse(response, data);
		}

		return data;
	}

	private static showNotification(error: BooklyError): void {
		// Only show user-friendly errors in notifications
		if (error.statusCode === 500 && !error.message.includes('servidor')) {
			if (typeof window !== 'undefined') {
				import('notistack')
					.then(({ enqueueSnackbar }) => {
						enqueueSnackbar('Network error. Please check your connection.', {
							variant: 'error',
							autoHideDuration: 5000
						});
					})
					.catch(() => console.error('Network error. Please check your connection.'));
			} else {
				console.error('Network error. Please check your connection.');
			}
		} else {
			if (typeof window !== 'undefined') {
				import('notistack')
					.then(({ enqueueSnackbar }) => {
						enqueueSnackbar(error.message, {
							variant: error.type === 'warning' ? 'warning' : 'error',
							autoHideDuration: error.type === 'warning' ? 4000 : 5000
						});
					})
					.catch(() => console.error(error.message));
			} else {
				console.error(error.message);
			}
		}

		// Show validation errors if present
		if (error.validationErrors && error.validationErrors.length > 0) {
			error.validationErrors.forEach((validationError) => {
				if (typeof window !== 'undefined') {
					import('notistack')
						.then(({ enqueueSnackbar }) => {
							enqueueSnackbar(`${validationError.field}: ${validationError.message}`, {
								variant: 'warning',
								autoHideDuration: 4000
							});
						})
						.catch(() => console.error(`${validationError.field}: ${validationError.message}`));
				} else {
					console.error(`${validationError.field}: ${validationError.message}`);
				}
			});
		}
	}

	static showSuccess(message: string): void {
		if (typeof window !== 'undefined') {
			import('notistack')
				.then(({ enqueueSnackbar }) => {
					enqueueSnackbar(message, {
						variant: 'success',
						autoHideDuration: 3000
					});
				})
				.catch(() => console.log(message));
		} else {
			console.log(message);
		}
	}

	static showInfo(message: string): void {
		// Use dynamic import for notistack to avoid SSR issues
		if (typeof window !== 'undefined') {
			import('notistack')
				.then(({ enqueueSnackbar }) => {
					enqueueSnackbar(message, {
						variant: 'info',
						autoHideDuration: 5000
					});
				})
				.catch(() => console.error(message));
		} else {
			console.error(message);
		}
	}
}

export default ErrorHandler;
