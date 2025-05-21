export default () => ({
  app: {
    name: 'roles-service',
    port: parseInt(process.env.ROLES_SERVICE_PORT ?? '3002', 10),
    environment: process.env.NODE_ENV ?? 'development',
    defaultLanguage: process.env.DEFAULT_LANGUAGE ?? 'es',
  },
  database: {
    uri: process.env.MONGODB_URI ?? 'mongodb://user:pass@localhost:27017/bookly-roles',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'your-access-secret-key',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION ?? '1h',
  },
  services: {
    authService: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3000',
    usersService: process.env.USERS_SERVICE_URL ?? 'http://localhost:3001',
  },
});
