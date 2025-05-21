export default () => ({
  app: {
    name: 'auth-app',
    port: parseInt(process.env.AUTH_APP_PORT ?? '3333', 10),
    environment: process.env.NODE_ENV ?? 'development',
    autoloadServices: process.env.AUTOLOAD_SERVICES !== 'false', // Por defecto true
  },
  services: {
    authService: {
      name: 'auth-service',
      port: parseInt(process.env.AUTH_SERVICE_PORT ?? '3000', 10),
      url: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3000',
    },
    usersService: {
      name: 'users-service',
      port: parseInt(process.env.USERS_SERVICE_PORT ?? '3001', 10),
      url: process.env.USERS_SERVICE_URL ?? 'http://localhost:3001',
    },
    rolesService: {
      name: 'roles-service',
      port: parseInt(process.env.ROLES_SERVICE_PORT ?? '3002', 10),
      url: process.env.ROLES_SERVICE_URL ?? 'http://localhost:3002',
    },
  },
});
