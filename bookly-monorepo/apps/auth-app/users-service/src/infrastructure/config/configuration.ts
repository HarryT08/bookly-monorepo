export default () => ({
  app: {
    name: 'users-service',
    port: parseInt(process.env.USERS_SERVICE_PORT ?? '3001', 10),
    environment: process.env.NODE_ENV ?? 'development',
    defaultLanguage: process.env.DEFAULT_LANGUAGE ?? 'es',
  },
  database: {
    uri: process.env.MONGODB_URI ?? 'mongodb://user:pass@localhost:27017/bookly-users',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'your-access-secret-key',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION ?? '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'your-refresh-secret-key',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
  },
  services: {
    authService: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3000',
    rolesService: process.env.ROLES_SERVICE_URL ?? 'http://localhost:3002',
  },
});
