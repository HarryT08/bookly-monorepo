/**
 * API Gateway - Event Map
 * Centralized mapping for all events used in the API gateway
 */

export const API_GATEWAY_EVENTS = {
  // Request Events
  REQUEST_RECEIVED: 'gateway.request.received',
  REQUEST_ROUTED: 'gateway.request.routed',
  REQUEST_COMPLETED: 'gateway.request.completed',
  REQUEST_FAILED: 'gateway.request.failed',
  REQUEST_TIMEOUT: 'gateway.request.timeout',
  REQUEST_RATE_LIMITED: 'gateway.request.rate_limited',
  
  // Circuit Breaker Events
  CIRCUIT_BREAKER_OPENED: 'gateway.circuit_breaker.opened',
  CIRCUIT_BREAKER_CLOSED: 'gateway.circuit_breaker.closed',
  CIRCUIT_BREAKER_HALF_OPEN: 'gateway.circuit_breaker.half_open',
  CIRCUIT_BREAKER_FAILURE_THRESHOLD_REACHED: 'gateway.circuit_breaker.failure_threshold_reached',
  
  // Load Balancing Events
  SERVICE_INSTANCE_ADDED: 'gateway.service.instance.added',
  SERVICE_INSTANCE_REMOVED: 'gateway.service.instance.removed',
  SERVICE_INSTANCE_HEALTH_CHECK_FAILED: 'gateway.service.instance.health_check_failed',
  SERVICE_INSTANCE_HEALTH_CHECK_PASSED: 'gateway.service.instance.health_check_passed',
  LOAD_BALANCER_STRATEGY_CHANGED: 'gateway.load_balancer.strategy_changed',
  
  // Authentication Events
  AUTH_TOKEN_VALIDATED: 'gateway.auth.token.validated',
  AUTH_TOKEN_INVALID: 'gateway.auth.token.invalid',
  AUTH_TOKEN_EXPIRED: 'gateway.auth.token.expired',
  AUTH_REQUIRED: 'gateway.auth.required',
  AUTH_BYPASSED: 'gateway.auth.bypassed',
  
  // Security Events
  CORS_VIOLATION: 'gateway.security.cors.violation',
  SUSPICIOUS_REQUEST: 'gateway.security.suspicious.request',
  IP_BLOCKED: 'gateway.security.ip.blocked',
  DDOS_ATTACK_DETECTED: 'gateway.security.ddos.detected',
  
  // Caching Events
  CACHE_HIT: 'gateway.cache.hit',
  CACHE_MISS: 'gateway.cache.miss',
  CACHE_INVALIDATED: 'gateway.cache.invalidated',
  CACHE_UPDATED: 'gateway.cache.updated',
  
  // Monitoring Events
  SERVICE_HEALTH_CHECK: 'gateway.service.health_check',
  METRICS_COLLECTED: 'gateway.metrics.collected',
  ALERT_TRIGGERED: 'gateway.alert.triggered',
  
  // Configuration Events
  ROUTE_ADDED: 'gateway.route.added',
  ROUTE_UPDATED: 'gateway.route.updated',
  ROUTE_REMOVED: 'gateway.route.removed',
  MIDDLEWARE_ADDED: 'gateway.middleware.added',
  MIDDLEWARE_REMOVED: 'gateway.middleware.removed',
  
  // System Events
  GATEWAY_STARTED: 'gateway.system.started',
  GATEWAY_STOPPED: 'gateway.system.stopped',
  GATEWAY_RELOADED: 'gateway.system.reloaded',
  CONFIGURATION_UPDATED: 'gateway.configuration.updated'
} as const;

export type ApiGatewayEventType = typeof API_GATEWAY_EVENTS[keyof typeof API_GATEWAY_EVENTS];
