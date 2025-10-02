/**
 * API Gateway - URL Map
 * Centralized mapping for all URLs and endpoints used in the API gateway
 */

export const API_GATEWAY_URLS = {
  // Base paths
  BASE: '/api',
  API_VERSION: '/v1',
  
  // Service routing paths
  AUTH_SERVICE: '/auth',
  AVAILABILITY_SERVICE: '/availability',
  RESOURCES_SERVICE: '/resources',
  STOCKPILE_SERVICE: '/stockpile',
  REPORTS_SERVICE: '/reports',
  
  // Gateway management endpoints
  HEALTH: '/health',
  HEALTH_DETAILED: '/health/detailed',
  METRICS: '/metrics',
  STATUS: '/status',
  
  // Configuration endpoints
  ROUTES: '/gateway/routes',
  ROUTE_CREATE: '/gateway/routes/create',
  ROUTE_UPDATE: '/gateway/routes/:id',
  ROUTE_DELETE: '/gateway/routes/:id',
  
  // Load balancer endpoints
  LOAD_BALANCER: '/gateway/load-balancer',
  SERVICE_INSTANCES: '/gateway/services/:serviceId/instances',
  INSTANCE_HEALTH: '/gateway/services/:serviceId/instances/:instanceId/health',
  
  // Circuit breaker endpoints
  CIRCUIT_BREAKERS: '/gateway/circuit-breakers',
  CIRCUIT_BREAKER_STATUS: '/gateway/circuit-breakers/:serviceId/status',
  CIRCUIT_BREAKER_RESET: '/gateway/circuit-breakers/:serviceId/reset',
  
  // Rate limiting endpoints
  RATE_LIMITS: '/gateway/rate-limits',
  RATE_LIMIT_STATUS: '/gateway/rate-limits/:clientId/status',
  RATE_LIMIT_RESET: '/gateway/rate-limits/:clientId/reset',
  
  // Security endpoints
  BLOCKED_IPS: '/gateway/security/blocked-ips',
  CORS_CONFIG: '/gateway/security/cors',
  SECURITY_POLICIES: '/gateway/security/policies',
  
  // Cache management
  CACHE: '/gateway/cache',
  CACHE_INVALIDATE: '/gateway/cache/invalidate',
  CACHE_STATS: '/gateway/cache/stats',
  CACHE_CLEAR: '/gateway/cache/clear',
  
  // Monitoring and analytics
  REQUEST_LOGS: '/gateway/logs/requests',
  ERROR_LOGS: '/gateway/logs/errors',
  ANALYTICS: '/gateway/analytics',
  PERFORMANCE_METRICS: '/gateway/analytics/performance',
  
  // Documentation
  API_DOCS: '/docs',
  SWAGGER_UI: '/docs/swagger',
  OPENAPI_SPEC: '/docs/openapi.json',
  
  // WebSocket endpoints
  WEBSOCKET: '/ws',
  NOTIFICATIONS_WS: '/ws/notifications',
  
  // File upload/download
  UPLOAD: '/upload',
  DOWNLOAD: '/download/:fileId'
} as const;

export const getGatewayUrl = (endpoint: keyof typeof API_GATEWAY_URLS, params?: Record<string, string>): string => {
  let url = API_GATEWAY_URLS.BASE + API_GATEWAY_URLS.API_VERSION + API_GATEWAY_URLS[endpoint];
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  
  return url;
};

export const getServiceUrl = (service: string, endpoint: string): string => {
  return API_GATEWAY_URLS.BASE + API_GATEWAY_URLS.API_VERSION + `/${service}${endpoint}`;
};

export type ApiGatewayUrlType = typeof API_GATEWAY_URLS[keyof typeof API_GATEWAY_URLS];
