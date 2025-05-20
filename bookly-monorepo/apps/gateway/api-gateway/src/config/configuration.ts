/**
 * Configuración para el API Gateway
 */
export default () => ({
  // Servidor
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  
  // URLs de los microservicios
  services: {
    auth: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001/api',
    resources: process.env.RESOURCES_SERVICE_URL ?? 'http://localhost:3002/api',
    availability: process.env.AVAILABILITY_SERVICE_URL ?? 'http://localhost:3003/api',
    stockpile: process.env.STOCKPILE_SERVICE_URL ?? 'http://localhost:3004/api',
    reports: process.env.REPORTS_SERVICE_URL ?? 'http://localhost:3005/api',
    notifications: process.env.NOTIFICATIONS_SERVICE_URL ?? 'http://localhost:3006/api',
  },
  
  // Configuración de seguridad
  security: {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'bookly-access-secret',
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:4200').split(','),
  },
});
