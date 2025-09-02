import ky from 'ky';

/**
 * Service URLs from environment variables
 */
const getServiceURL = (service: string): string => {
	const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

	switch (service) {
		case 'auth':
			return process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001/api';
		case 'resources':
			return process.env.NEXT_PUBLIC_RESOURCES_SERVICE_URL || 'http://localhost:3003/api';
		case 'availability':
			return process.env.NEXT_PUBLIC_AVAILABILITY_SERVICE_URL || 'http://localhost:3002/api';
		case 'stockpile':
			return process.env.NEXT_PUBLIC_STOCKPILE_SERVICE_URL || 'http://localhost:3004/api';
		case 'reports':
			return process.env.NEXT_PUBLIC_REPORTS_SERVICE_URL || 'http://localhost:3005/api';
		default:
			return baseURL;
	}
};

/**
 * Create HTTP client for specific microservice
 */
const createServiceClient = (service: string) => {
	return ky.create({
		prefixUrl: getServiceURL(service),
		timeout: 30000,
		headers: {
			'Content-Type': 'application/json'
		},
		hooks: {
			beforeRequest: [
				(request) => {
					// Add auth token if available
					const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

					if (token) {
						request.headers.set('Authorization', `Bearer ${token}`);
					}
				}
			],
			afterResponse: [
				async (request, options, response) => {
					// Handle auth errors
					if (response.status === 401) {
						if (typeof window !== 'undefined') {
							localStorage.removeItem('auth_token');
							// Dispatch logout action if using Redux
							window.location.href = '/sign-in';
						}
					}

					return response;
				}
			],
			beforeError: [
				(error) => {
					// Log errors for monitoring
					console.error(`HTTP Error in ${service} service:`, error);
					return error;
				}
			]
		}
	});
};

/**
 * Microservice clients
 */
export const authClient = createServiceClient('auth');
export const resourcesClient = createServiceClient('resources');
export const availabilityClient = createServiceClient('availability');
export const stockpileClient = createServiceClient('stockpile');
export const reportsClient = createServiceClient('reports');

/**
 * Default client (API Gateway)
 */
export const httpClient = createServiceClient('gateway');

export default httpClient;
