/**
 * HTTP services barrel exports
 */

export {
	default as httpClient,
	authClient,
	resourcesClient,
	availabilityClient,
	stockpileClient,
	reportsClient
} from './client';
export type { ApiResponse, ApiError, PaginatedResponse, QueryParams } from './types';

// Re-export ky for direct usage when needed
export { default as ky } from 'ky';
