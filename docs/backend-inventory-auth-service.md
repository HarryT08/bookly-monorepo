# AUTH SERVICE - INVENTARIO DETALLADO DE ENDPOINTS

## 📊 RESUMEN GENERAL
- **Puerto:** 3001
- **Microservicio:** auth-service  
- **Total Endpoints:** 25+
- **Controladores:** 7 (auth, role, permission, user, oauth, category, seed)
- **Estado:** ✅ Parcialmente implementado

---

## 🔐 ENDPOINTS DE AUTENTICACIÓN

### POST /auth/login
- **Tipo:** Command (CQRS)
- **Descripción:** Autentica usuario con email y contraseña, retorna JWT token
- **RF:** RF-43 (Autenticación y SSO)
- **Acceso:** Público (HTTP)
- **Guards:** No requiere autenticación
- **Ejemplo de uso:**
```bash
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "admin@ufps.edu.co",
  "password": "123456"
}
```

### POST /auth/register
- **Tipo:** Command (CQRS)
- **Descripción:** Registra nuevo usuario en el sistema
- **RF:** RF-43 (Autenticación y SSO)
- **Acceso:** Público (HTTP)
- **Guards:** No requiere autenticación
- **Ejemplo de uso:**
```bash
POST http://localhost:3001/auth/register
Content-Type: application/json

{
  "email": "nuevo@ufps.edu.co",
  "username": "nuevouser",
  "password": "password123",
  "firstName": "Nombre",
  "lastName": "Apellido"
}
```

### POST /auth/profile
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene perfil del usuario autenticado
- **RF:** RF-43 (Autenticación y SSO)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard
- **Ejemplo de uso:**
```bash
POST http://localhost:3001/auth/profile
Authorization: Bearer <jwt_token>
```

### POST /auth/logout
- **Tipo:** Command (CQRS)
- **Descripción:** Cierra sesión del usuario (invalida token)
- **RF:** RF-43 (Autenticación y SSO)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard
- **Ejemplo de uso:**
```bash
POST http://localhost:3001/auth/logout
Authorization: Bearer <jwt_token>
```

---

## 👥 ENDPOINTS DE GESTIÓN DE ROLES

### GET /roles
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene lista de todos los roles con paginación y búsqueda
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard
- **Query Params:** page, limit, search
- **Ejemplo de uso:**
```bash
GET http://localhost:3001/roles?page=1&limit=10&search=admin
Authorization: Bearer <jwt_token>
```

### GET /roles/active
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene solo los roles activos del sistema
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard
- **Ejemplo de uso:**
```bash
GET http://localhost:3001/roles/active
Authorization: Bearer <jwt_token>
```

### GET /roles/:id
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene un rol específico por su ID
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard
- **Ejemplo de uso:**
```bash
GET http://localhost:3001/roles/clp2k3l4m0001xyz123
Authorization: Bearer <jwt_token>
```

### POST /roles
- **Tipo:** Command (CQRS)
- **Descripción:** Crea un nuevo rol en el sistema
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard
- **Ejemplo de uso:**
```bash
POST http://localhost:3001/roles
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Nuevo Rol",
  "description": "Descripción del rol",
  "categoryCode": "ADMIN"
}
```

### PUT /roles/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Actualiza un rol existente
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard
- **Ejemplo de uso:**
```bash
PUT http://localhost:3001/roles/clp2k3l4m0001xyz123
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Rol Actualizado",
  "description": "Nueva descripción"
}
```

### DELETE /roles/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Elimina un rol del sistema
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard
- **Ejemplo de uso:**
```bash
DELETE http://localhost:3001/roles/clp2k3l4m0001xyz123
Authorization: Bearer <jwt_token>
```

---

## 🔑 ENDPOINTS DE GESTIÓN DE PERMISOS

### POST /permissions
- **Tipo:** Command (CQRS)
- **Descripción:** Crea un nuevo permiso en el sistema
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (Solo Administrador General)
- **Ejemplo de uso:**
```bash
POST http://localhost:3001/permissions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "crear_recurso",
  "resource": "resources",
  "action": "create",
  "scope": "program",
  "description": "Permite crear recursos"
}
```

### GET /permissions
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene lista de permisos con filtros opcionales
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Query Params:** resource, action, scope, isActive
- **Ejemplo de uso:**
```bash
GET http://localhost:3001/permissions?resource=resources&action=create
Authorization: Bearer <jwt_token>
```

### GET /permissions/active
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene solo los permisos activos
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
GET http://localhost:3001/permissions/active
Authorization: Bearer <jwt_token>
```

### GET /permissions/resource/:resource
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene permisos filtrados por recurso específico
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Query Params:** action, scope
- **Ejemplo de uso:**
```bash
GET http://localhost:3001/permissions/resource/resources?action=create
Authorization: Bearer <jwt_token>
```

### GET /permissions/:id
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene un permiso específico por ID
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
GET http://localhost:3001/permissions/clp2k3l4m0001xyz123
Authorization: Bearer <jwt_token>
```

### PUT /permissions/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Actualiza un permiso existente
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (Solo Administrador General)
- **Ejemplo de uso:**
```bash
PUT http://localhost:3001/permissions/clp2k3l4m0001xyz123
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "permiso_actualizado",
  "description": "Nueva descripción"
}
```

### PUT /permissions/:id/activate
- **Tipo:** Command (CQRS)
- **Descripción:** Activa un permiso desactivado
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (Solo Administrador General)
- **Ejemplo de uso:**
```bash
PUT http://localhost:3001/permissions/clp2k3l4m0001xyz123/activate
Authorization: Bearer <jwt_token>
```

### PUT /permissions/:id/deactivate
- **Tipo:** Command (CQRS)
- **Descripción:** Desactiva un permiso activo
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (Solo Administrador General)
- **Ejemplo de uso:**
```bash
PUT http://localhost:3001/permissions/clp2k3l4m0001xyz123/deactivate
Authorization: Bearer <jwt_token>
```

### DELETE /permissions/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Elimina un permiso del sistema
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (Solo Administrador General)
- **Ejemplo de uso:**
```bash
DELETE http://localhost:3001/permissions/clp2k3l4m0001xyz123
Authorization: Bearer <jwt_token>
```

### POST /permissions/seed/defaults
- **Tipo:** Command (CQRS)
- **Descripción:** Crea los permisos predeterminados del sistema
- **RF:** RF-41 (Gestión de roles)
- **Acceso:** Privado (HTTP) - Uso interno
- **Guards:** JwtAuthGuard, RolesGuard (Solo Administrador General)
- **Ejemplo de uso:**
```bash
POST http://localhost:3001/permissions/seed/defaults
Authorization: Bearer <jwt_token>
```

---

## 📊 ESTADÍSTICAS
- **Total Endpoints Documentados:** 21
- **Commands (CQRS):** 12
- **Queries (CQRS):** 9
- **Endpoints Públicos:** 2
- **Endpoints Privados:** 19
- **Con Guards de Rol:** 15

---

*Inventario generado: 2025-01-03*  
*Estado: Documentación completa de Auth Service*
