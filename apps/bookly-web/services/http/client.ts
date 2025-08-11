import ky from 'ky';

/**
 * Base HTTP client configuration for Bookly API
 */
const baseURL = (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000') + '/api/v1';

export const httpClient = ky.create({
	prefixUrl: baseURL,
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
						// Redirect to login or dispatch logout action
					}
				}
				return response;
			}
		],
		beforeError: [
			(error) => {
				// Log errors for monitoring
				console.error('HTTP Error:', error);
				return error;
			}
		]
	}
});

export default httpClient;
