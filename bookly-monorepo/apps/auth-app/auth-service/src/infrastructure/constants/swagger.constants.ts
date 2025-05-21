/**
 * Constantes para la configuraciu00f3n de Swagger
 * Este archivo contiene constantes relacionadas con la configuraciu00f3n de Swagger para la documentaciu00f3n de la API
 */

export const SWAGGER_CONSTANTS = {
  // Informaciu00f3n general de la API
  TITLE: 'Bookly Auth API',
  DESCRIPTION: 'API para el servicio de autenticaciu00f3n de Bookly',
  VERSION: '1.0',
  
  // Configuraciu00f3n de la ruta para la documentaciu00f3n
  DOCS_ROUTE: 'docs',
  
  // Tags para agrupar endpoints
  TAGS: {
    AUTH: 'Autenticaciu00f3n',
    USERS: 'Usuarios',
    ROLES: 'Roles',
    PERMISSIONS: 'Permisos',
  },
  
  // Descripciones de esquemas
  SCHEMAS: {
    AUTH_RESPONSE: 'Respuesta de autenticaciu00f3n',
    USER: 'Informaciu00f3n de usuario',
    ROLE: 'Rol de usuario',
    PERMISSION: 'Permiso de sistema',
  },
};
