# Bookly Auth Service - API Documentation

## Overview

El **Auth Service** es el microservicio de autenticación y autorización del sistema Bookly UFPS. Implementa un sistema completo de gestión de usuarios, roles y permisos con soporte para autenticación tradicional y SSO (Single Sign-On) con Google Workspace.

### Características Principales

- **RF-41**: Gestión diferenciada de roles y permisos granulares
- **RF-42**: Restricción de modificación de recursos solo para administradores  
- **RF-43**: Autenticación mediante credenciales universitarias y SSO
- **RF-44**: Auditoría completa de accesos y modificaciones
- **RF-45**: Doble factor de autenticación (2FA)

### Base URL

```
http://localhost:3001
```

### Arquitectura

- **Clean Architecture** + **CQRS** + **Event-Driven**
- **NestJS** + **Prisma** + **MongoDB**
- **JWT** con roles y permisos incluidos
- **Winston logging** + **OpenTelemetry** + **Sentry**

---

## 🔐 Authentication Endpoints

### POST /auth/login
**Autenticación tradicional con email y contraseña**

**Descripción**: Autentica usuarios mediante credenciales universitarias (email/password) con validación de email institucional (@ufps.edu.co).

**Security Restrictions**:
- ❌ No requiere autenticación
- 🔒 Rate limiting: 5 intentos por minuto por IP
- 🛡️ Bloqueo automático tras múltiples fallos
- 📝 Logging completo de intentos de acceso

**Request Body**:
```json
{
  "email": "usuario@ufps.edu.co",
  "password": "password123"
}
```

**Response Success (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "usuario@ufps.edu.co",
    "username": "usuario",
    "firstName": "Juan",
    "lastName": "Pérez",
    "roles": ["Estudiante"],
    "permissions": ["read:reservations", "create:reservations"]
  },
  "expires_in": 3600
}
```

**Response Error (401)**:
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

**Características de Seguridad**:
- Rate limiting aplicado
- Logging de intentos fallidos
- Bloqueo temporal tras múltiples fallos
- Auditoría completa de accesos

---

### POST /auth/register

**Registro de nuevos usuarios**

**Descripción**: Registra nuevos usuarios en el sistema con validación de email institucional.

**Security Restrictions**:

- ❌ No requiere autenticación
- 🔒 Rate limiting: 3 registros por hora por IP
- 📧 Validación de email institucional (@ufps.edu.co)
- 🛡️ Validaciones de contraseña segura

**Request Body**:

```json
{
  "email": "nuevo.usuario@ufps.edu.co",
  "username": "nuevousuario",
  "password": "Password123!",
  "firstName": "María",
  "lastName": "García"
}
```

**Response Success (201)**:
```json
{
  "id": "user-456",
  "email": "nuevo.usuario@ufps.edu.co",
  "username": "nuevousuario",
  "firstName": "María",
  "lastName": "García",
  "isActive": true,
  "isVerified": false,
  "createdAt": "2024-08-24T14:39:27.000Z"
}
```

**Response Error (409)**:
```json
{
  "statusCode": 409,
  "message": "User already exists",
  "error": "Conflict"
}
```

---

### POST /auth/profile
**Obtener perfil del usuario actual**

**Descripción**: Retorna la información del perfil del usuario autenticado.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response Success (200)**:
```json
{
  "id": "user-123",
  "email": "usuario@ufps.edu.co",
  "username": "usuario",
  "firstName": "Juan",
  "lastName": "Pérez",
  "roles": ["Estudiante"],
  "permissions": ["read:reservations", "create:reservations"],
  "lastLogin": "2024-08-24T14:30:00.000Z"
}
```

---

### POST /auth/logout
**Cerrar sesión del usuario**

**Descripción**: Invalida el token JWT del usuario actual.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response Success (200)**:
```json
{
  "message": "Logout successful"
}
```

---

## 🌐 OAuth2 Endpoints

### GET /oauth/google
**Iniciar autenticación con Google OAuth2**

**Descripción**: Redirige al usuario a la pantalla de consentimiento de Google OAuth2.

**Response**: Redirección HTTP 302 a Google OAuth2

---

### GET /oauth/google/callback
**Callback de Google OAuth2**

**Descripción**: Maneja la respuesta de Google OAuth2 y autentica al usuario.

**Query Parameters**:
- `code`: Código de autorización de Google
- `state`: Estado de seguridad

**Response**: Redirección a frontend con token o error

**Success Redirect**:
```
http://localhost:3001/auth/callback?token=<jwt_token>&user=<user_data>
```

**Error Redirect**:
```
http://localhost:3001/auth/callback?error=<error_message>
```

---

### GET /oauth/google/logout
**Logout de Google OAuth2**

**Descripción**: Cierra sesión en Google y redirige al frontend.

**Response**: Redirección a Google logout

---

## 👥 User Management Endpoints

### GET /users
**Obtener lista de usuarios**

**Descripción**: Retorna lista paginada de usuarios con filtros opcionales.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `page` (optional): Número de página (default: 1)
- `limit` (optional): Elementos por página (default: 10)
- `search` (optional): Término de búsqueda

**Response Success (200)**:
```json
{
  "users": [
    {
      "id": "user-123",
      "email": "usuario@ufps.edu.co",
      "username": "usuario",
      "firstName": "Juan",
      "lastName": "Pérez",
      "isActive": true,
      "roles": ["Estudiante"]
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10
}
```

---

### GET /users/:id
**Obtener usuario por ID**

**Descripción**: Retorna información detallada de un usuario específico.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: ID del usuario

**Response Success (200)**:
```json
{
  "id": "user-123",
  "email": "usuario@ufps.edu.co",
  "username": "usuario",
  "firstName": "Juan",
  "lastName": "Pérez",
  "isActive": true,
  "isVerified": true,
  "roles": ["Estudiante"],
  "permissions": ["read:reservations", "create:reservations"],
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-08-24T14:39:27.000Z"
}
```

**Response Error (404)**:
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

---

### PUT /users/:id
**Actualizar usuario**

**Descripción**: Actualiza información de un usuario existente.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: ID del usuario

**Request Body**:
```json
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez Rodríguez",
  "username": "juancarlos"
}
```

**Response Success (200)**:
```json
{
  "id": "user-123",
  "email": "usuario@ufps.edu.co",
  "username": "juancarlos",
  "firstName": "Juan Carlos",
  "lastName": "Pérez Rodríguez",
  "updatedAt": "2024-08-24T14:39:27.000Z"
}
```

---

### DELETE /users/:id
**Eliminar usuario**

**Descripción**: Elimina (soft delete) un usuario del sistema.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: ID del usuario

**Response Success (200)**:
```json
{
  "message": "User deleted successfully",
  "deletedAt": "2024-08-24T14:39:27.000Z"
}
```

---

### PUT /users/:userId/roles/:roleId
**Asignar rol a usuario**

**Descripción**: Asigna un rol específico a un usuario.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `userId`: ID del usuario
- `roleId`: ID del rol

**Response Success (200)**:
```json
{
  "message": "Role assigned successfully",
  "user": {
    "id": "user-123",
    "roles": ["Estudiante", "Monitor"]
  }
}
```

---

### DELETE /users/:userId/roles/:roleId
**Remover rol de usuario**

**Descripción**: Remueve un rol específico de un usuario.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `userId`: ID del usuario
- `roleId`: ID del rol

**Response Success (200)**:
```json
{
  "message": "Role removed successfully",
  "user": {
    "id": "user-123",
    "roles": ["Estudiante"]
  }
}
```

---

## 🎭 Role Management Endpoints

### GET /roles
**Obtener lista de roles**

**Descripción**: Retorna lista paginada de roles con filtros opcionales.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `page` (optional): Número de página
- `limit` (optional): Elementos por página
- `search` (optional): Término de búsqueda

**Response Success (200)**:
```json
{
  "roles": [
    {
      "id": "role-123",
      "name": "Estudiante",
      "description": "Rol básico para estudiantes",
      "isActive": true,
      "isPredefined": true,
      "permissions": ["read:reservations", "create:reservations"]
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

---

### GET /roles/active
**Obtener roles activos**

**Descripción**: Retorna todos los roles activos del sistema.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response Success (200)**:
```json
[
  {
    "id": "role-123",
    "name": "Estudiante",
    "description": "Rol básico para estudiantes",
    "isActive": true,
    "isPredefined": true
  },
  {
    "id": "role-456",
    "name": "Docente",
    "description": "Rol para docentes universitarios",
    "isActive": true,
    "isPredefined": true
  }
]
```

---

### GET /roles/:id
**Obtener rol por ID**

**Descripción**: Retorna información detallada de un rol específico.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: ID del rol

**Response Success (200)**:
```json
{
  "id": "role-123",
  "name": "Estudiante",
  "description": "Rol básico para estudiantes",
  "isActive": true,
  "isPredefined": true,
  "permissions": [
    {
      "id": "perm-123",
      "name": "read:reservations",
      "resource": "reservations",
      "action": "read",
      "scope": "own"
    }
  ],
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-08-24T14:39:27.000Z"
}
```

---

### POST /roles
**Crear nuevo rol**

**Descripción**: Crea un nuevo rol personalizado en el sistema.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "name": "Monitor de Laboratorio",
  "description": "Rol para monitores de laboratorios de informática",
  "permissions": ["perm-123", "perm-456"]
}
```

**Response Success (201)**:
```json
{
  "id": "role-789",
  "name": "Monitor de Laboratorio",
  "description": "Rol para monitores de laboratorios de informática",
  "isActive": true,
  "isPredefined": false,
  "createdAt": "2024-08-24T14:39:27.000Z"
}
```

---

### PUT /roles/:id
**Actualizar rol**

**Descripción**: Actualiza información de un rol existente.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: ID del rol

**Request Body**:
```json
{
  "name": "Monitor de Laboratorio Avanzado",
  "description": "Rol para monitores senior de laboratorios",
  "permissions": ["perm-123", "perm-456", "perm-789"]
}
```

**Response Success (200)**:
```json
{
  "id": "role-789",
  "name": "Monitor de Laboratorio Avanzado",
  "description": "Rol para monitores senior de laboratorios",
  "updatedAt": "2024-08-24T14:39:27.000Z"
}
```

---

### DELETE /roles/:id
**Eliminar rol**

**Descripción**: Elimina (soft delete) un rol del sistema.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: ID del rol

**Response Success (200)**:
```json
{
  "message": "Role deleted successfully",
  "deletedAt": "2024-08-24T14:39:27.000Z"
}
```

---

## 🔑 Permission Management Endpoints

### POST /permissions
**Crear nuevo permiso**

**Descripción**: Crea un nuevo permiso granular en el sistema. Solo disponible para Administrador General.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "name": "manage:lab-equipment",
  "resource": "equipment",
  "action": "manage",
  "scope": "laboratory",
  "conditions": {
    "department": "informatics",
    "timeRestriction": "business_hours"
  },
  "description": "Permite gestionar equipos de laboratorio de informática"
}
```

**Response Success (201)**:
```json
{
  "id": "perm-789",
  "name": "manage:lab-equipment",
  "resource": "equipment",
  "action": "manage",
  "scope": "laboratory",
  "conditions": {
    "department": "informatics",
    "timeRestriction": "business_hours"
  },
  "description": "Permite gestionar equipos de laboratorio de informática",
  "isActive": true,
  "createdAt": "2024-08-24T14:39:27.000Z"
}
```

**Response Error (403)**:
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

---

### GET /permissions
**Obtener lista de permisos**

**Descripción**: Retorna lista de permisos con filtros opcionales.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Query Parameters**:
- `resource` (optional): Filtrar por recurso
- `action` (optional): Filtrar por acción
- `scope` (optional): Filtrar por alcance
- `isActive` (optional): Filtrar por estado activo

**Response Success (200)**:
```json
[
  {
    "id": "perm-123",
    "name": "read:reservations",
    "resource": "reservations",
    "action": "read",
    "scope": "own",
    "conditions": {},
    "description": "Permite leer reservaciones propias",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

---

### GET /permissions/active
**Obtener permisos activos**

**Descripción**: Retorna todos los permisos activos del sistema.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Response Success (200)**:
```json
[
  {
    "id": "perm-123",
    "name": "read:reservations",
    "resource": "reservations",
    "action": "read",
    "scope": "own",
    "isActive": true
  }
]
```

---

### GET /permissions/resource/:resource
**Obtener permisos por recurso**

**Descripción**: Retorna permisos filtrados por recurso específico.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `resource`: Nombre del recurso

**Query Parameters**:
- `action` (optional): Filtrar por acción
- `scope` (optional): Filtrar por alcance

**Response Success (200)**:
```json
[
  {
    "id": "perm-123",
    "name": "read:reservations",
    "resource": "reservations",
    "action": "read",
    "scope": "own"
  },
  {
    "id": "perm-124",
    "name": "create:reservations",
    "resource": "reservations",
    "action": "create",
    "scope": "own"
  }
]
```

---

### GET /permissions/:id
**Obtener permiso por ID**

**Descripción**: Retorna información detallada de un permiso específico.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `id`: ID del permiso

**Response Success (200)**:
```json
{
  "id": "perm-123",
  "name": "read:reservations",
  "resource": "reservations",
  "action": "read",
  "scope": "own",
  "conditions": {
    "timeRestriction": "business_hours"
  },
  "description": "Permite leer reservaciones propias durante horario laboral",
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-08-24T14:39:27.000Z"
}
```

---

### PUT /permissions/:id
**Actualizar permiso**

**Descripción**: Actualiza información de un permiso existente.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `id`: ID del permiso

**Request Body**:
```json
{
  "name": "read:reservations-extended",
  "description": "Permite leer reservaciones propias sin restricción horaria",
  "conditions": {}
}
```

**Response Success (200)**:
```json
{
  "id": "perm-123",
  "name": "read:reservations-extended",
  "description": "Permite leer reservaciones propias sin restricción horaria",
  "conditions": {},
  "updatedAt": "2024-08-24T14:39:27.000Z"
}
```

---

### PUT /permissions/:id/activate
**Activar permiso**

**Descripción**: Activa un permiso previamente desactivado.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `id`: ID del permiso

**Response Success (200)**:
```json
{
  "id": "perm-123",
  "name": "read:reservations",
  "isActive": true,
  "updatedAt": "2024-08-24T14:39:27.000Z"
}
```

---

### PUT /permissions/:id/deactivate
**Desactivar permiso**

**Descripción**: Desactiva un permiso sin eliminarlo del sistema.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `id`: ID del permiso

**Response Success (200)**:
```json
{
  "id": "perm-123",
  "name": "read:reservations",
  "isActive": false,
  "updatedAt": "2024-08-24T14:39:27.000Z"
}
```

---

### DELETE /permissions/:id
**Eliminar permiso**

**Descripción**: Elimina permanentemente un permiso del sistema.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `id`: ID del permiso

**Response Success (204)**: No Content

---

### POST /permissions/seed/defaults
**Crear permisos por defecto**

**Descripción**: Crea los permisos predefinidos del sistema.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Response Success (201)**:
```json
[
  {
    "id": "perm-default-1",
    "name": "read:reservations",
    "resource": "reservations",
    "action": "read",
    "scope": "own",
    "isActive": true
  }
]
```

---

## 📋 Category Management Endpoints

Las categorías permiten organizar roles y recursos de manera jerárquica para facilitar la gestión de permisos.

### GET /auth/categories

**Obtener lista de categorías**

**Security Restrictions**:

- ❌ No requiere autenticación
- 📝 Logging de consultas

**Query Parameters**:

- `page` (optional): Número de página (default: 1)
- `limit` (optional): Elementos por página (default: 10)  
- `search` (optional): Término de búsqueda

**Response Success (200)**:

```json
{
  "data": [
    {
      "id": "cat-123",
      "name": "Académico",
      "description": "Categoría para roles académicos",
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### GET /auth/categories/defaults

**Obtener categorías por defecto**

**Security Restrictions**:

- ❌ No requiere autenticación
- 📝 Logging de consultas

**Response Success (200)**:

```json
[
  {
    "id": "cat-default-1",
    "name": "Académico",
    "description": "Categoría predefinida para roles académicos",
    "isDefault": true
  }
]
```

---

## 🌱 Seed Endpoints

Los endpoints de seed permiten inicializar datos predeterminados del sistema.

### GET /seed/status

**Verificar estado de inicialización**

**Security Restrictions**:

- ❌ No requiere autenticación
- 📊 Endpoint de monitoreo

**Response Success (200)**:

```json
{
  "needsSeeding": true,
  "message": "Database is empty and needs seeding"
}
```

### POST /seed/run

**Ejecutar inicialización de datos**

**Security Restrictions**:

- ❌ No requiere autenticación
- ⚠️ Solo ejecuta si la base de datos está vacía
- 📝 Logging completo de operaciones

**Response Success (200)**:

```json
{
  "success": true,
  "message": "Database seeded successfully",
  "summary": {
    "programs": 5,
    "roles": 8,
    "users": 12,
    "categories": 4,
    "maintenanceTypes": 3,
    "resources": 25
  }
}
```

### POST /seed/run-full

**Ejecutar inicialización completa (modo forzado)**

**Security Restrictions**:

- ❌ No requiere autenticación
- ⚠️ **PELIGROSO**: Elimina todos los datos existentes
- 📝 Logging completo de operaciones destructivas

**Response Success (200)**:

```json
{
  "success": true,
  "message": "Full database seeding completed successfully",
  "summary": {
    "programs": 5,
    "roles": 8,
    "users": 12,
    "categories": 4,
    "maintenanceTypes": 3,
    "resources": 25
  }
}
```

---

## 🔒 Security & Error Handling

### Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado exitosamente |
| 204 | No Content - Operación exitosa sin contenido |
| 400 | Bad Request - Datos de entrada inválidos |
| 401 | Unauthorized - Token JWT inválido o expirado |
| 403 | Forbidden - Sin permisos suficientes |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto con el estado actual |
| 422 | Unprocessable Entity - Errores de validación |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error interno del servidor |

### Estructura de Errores

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

### Rate Limiting

- **Login**: 5 intentos por minuto por IP
- **Register**: 3 registros por hora por IP
- **Password Reset**: 3 intentos por hora por email
- **General API**: 100 requests por minuto por usuario autenticado

### Formato de Token JWT

```json
{
  "sub": "user-id-123",
  "email": "user@ufps.edu.co",
  "roles": ["STUDENT"],
  "permissions": ["read:reservations"],
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Auditoría y Logging

Todas las operaciones críticas son registradas incluyendo:

- Intentos de login (exitosos y fallidos)
- Creación, modificación y eliminación de usuarios
- Cambios en roles y permisos
- Accesos a endpoints protegidos
- Errores de autenticación y autorización

Los logs incluyen: timestamp, IP, user-agent, usuario (si está autenticado), acción realizada y resultado.

---

## 🔧 Postman Environment Variables

Para facilitar el testing de la API, configure las siguientes variables de entorno en Postman:

### Variables Base

```json
{
  "baseUrl": "http://localhost:3000",
  "authToken": "{{jwt_token_from_login}}",
  "adminToken": "{{admin_jwt_token}}",
  "coordinatorToken": "{{coordinator_jwt_token}}"
}
```

### Variables de Testing

```json
{
  "testUserId": "user-test-123",
  "testRoleId": "role-test-456", 
  "testPermissionId": "perm-test-789",
  "testCategoryId": "cat-test-101",
  "testEmail": "test@ufps.edu.co",
  "testUsername": "testuser"
}
```

### Variables OAuth2

```json
{
  "googleClientId": "your-google-client-id.apps.googleusercontent.com",
  "googleClientSecret": "your-google-client-secret",
  "frontendUrl": "http://localhost:3001",
  "oauthRedirectUri": "http://localhost:3000/auth/oauth/google/callback"
}
```

### Scripts de Pre-request

Para automatizar la obtención de tokens JWT, agregue este script en la pestaña "Pre-request Script" de su colección:

```javascript
// Auto-login para obtener token JWT
if (!pm.environment.get("authToken")) {
    pm.sendRequest({
        url: pm.environment.get("baseUrl") + "/auth/login",
        method: "POST",
        header: {
            "Content-Type": "application/json"
        },
        body: {
            mode: "raw",
            raw: JSON.stringify({
                email: "admin@ufps.edu.co",
                password: "123456"
            })
        }
    }, function (err, response) {
        if (!err && response.code === 200) {
            const jsonData = response.json();
            pm.environment.set("authToken", jsonData.access_token);
        }
    });
}
```

### Tests Automatizados

Agregue estos tests en la pestaña "Tests" para validación automática:

```javascript
// Validar código de respuesta exitoso
pm.test("Status code is successful", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

// Validar estructura de respuesta
pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("id");
});

// Guardar IDs para uso posterior
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    if (jsonData.id) {
        pm.environment.set("lastCreatedId", jsonData.id);
    }
}
```

---

## 📋 Restricciones de Dominio

Solo se aceptan emails con dominio `@ufps.edu.co` para garantizar que solo personal y estudiantes de la universidad puedan registrarse.

### Roles Predefinidos

- **Administrador General**: Acceso completo al sistema
- **Administrador de Programa**: Gestión dentro de su programa
- **Coordinador**: Gestión de recursos y reservas
- **Docente**: Creación y gestión de reservas
- **Estudiante**: Creación de reservas básicas
- **Monitor**: Asistencia en laboratorios

### Permisos Granulares

Los permisos siguen el patrón `action:resource:scope` con condiciones adicionales:

- **action**: create, read, update, delete, manage
- **resource**: reservations, users, roles, permissions, equipment
- **scope**: own, program, department, all
- **conditions**: Restricciones adicionales (horarios, ubicación, etc.)
