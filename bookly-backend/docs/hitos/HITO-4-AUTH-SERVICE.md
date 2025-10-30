# HITO 4 - AUTH SERVICE
## Seguridad y Control de Accesos Core + SSO

**Versión:** 1.0.0  
**Fecha:** 2025-09-01  
**Puerto:** 3001  
**Documentación API:** http://localhost:3001/api/docs  

---

## 📋 Resumen Ejecutivo

El Auth Service implementa el sistema completo de autenticación, autorización y control de accesos (RF-41 a RF-45) con integración SSO Google Workspace, gestión granular de roles y permisos, auditoría completa y doble factor de autenticación. Incluye guards especializados para restricción de modificación de recursos y sistema de bloqueo de cuentas.

## 🏗️ Arquitectura

### Estructura de Directorio
```
src/apps/auth-service/
├── domain/
│   ├── entities/
│   │   ├── user.entity.ts              # Entidad principal de usuarios
│   │   ├── role.entity.ts              # Entidad de roles
│   │   ├── permission.entity.ts        # Entidad de permisos granulares
│   │   ├── user-role.entity.ts         # Relación usuario-rol
│   │   └── audit-log.entity.ts         # Entidad de auditoría
│   ├── repositories/
│   │   ├── user.repository.ts          # Interface repositorio usuarios
│   │   ├── role.repository.ts          # Interface repositorio roles
│   │   ├── permission.repository.ts    # Interface repositorio permisos
│   │   └── audit-log.repository.ts     # Interface repositorio auditoría
│   └── events/
│       ├── auth.events.ts              # Eventos de autenticación
│       ├── user.events.ts              # Eventos de usuarios
│       └── permission.events.ts       # Eventos de permisos
├── application/
│   ├── commands/
│   │   ├── login.command.ts            # Comando iniciar sesión
│   │   ├── register.command.ts         # Comando registrar usuario
│   │   ├── assign-role.command.ts      # Comando asignar rol
│   │   └── grant-permission.command.ts # Comando otorgar permiso
│   ├── queries/
│   │   ├── get-user.query.ts           # Query obtener usuario
│   │   ├── get-permissions.query.ts    # Query obtener permisos
│   │   └── get-audit-logs.query.ts     # Query obtener auditoría
│   ├── handlers/
│   │   ├── auth.handlers.ts            # Handlers autenticación
│   │   ├── user.handlers.ts            # Handlers usuarios
│   │   ├── role.handlers.ts            # Handlers roles
│   │   └── permission.handlers.ts      # Handlers permisos
│   ├── services/
│   │   ├── auth.service.ts             # Servicio principal autenticación
│   │   ├── user.service.ts             # Servicio gestión usuarios
│   │   ├── role.service.ts             # Servicio gestión roles
│   │   ├── permission.service.ts       # Servicio gestión permisos
│   │   └── audit.service.ts            # Servicio auditoría
│   └── dto/
│       ├── auth.dto.ts                 # DTOs autenticación
│       ├── user.dto.ts                 # DTOs usuarios
│       ├── role.dto.ts                 # DTOs roles
│       └── permission.dto.ts           # DTOs permisos
└── infrastructure/
    ├── controllers/
    │   ├── auth.controller.ts          # Controlador autenticación
    │   ├── oauth.controller.ts         # Controlador SSO
    │   ├── user.controller.ts          # Controlador usuarios
    │   ├── role.controller.ts          # Controlador roles
    │   └── seed.controller.ts          # Controlador semillas
    ├── repositories/
    │   ├── prisma-user.repository.ts   # Implementación Prisma usuarios
    │   ├── prisma-role.repository.ts   # Implementación Prisma roles
    │   └── prisma-permission.repository.ts # Implementación Prisma permisos
    ├── strategies/
    │   ├── local.strategy.ts           # Estrategia autenticación local
    │   ├── jwt.strategy.ts             # Estrategia JWT
    │   └── google.strategy.ts          # Estrategia Google OAuth2
    ├── guards/
    │   ├── jwt-auth.guard.ts           # Guard JWT
    │   ├── roles.guard.ts              # Guard roles
    │   ├── permissions.guard.ts        # Guard permisos granulares
    │   ├── resource-modification.guard.ts # Guard RF-42
    │   ├── double-confirmation.guard.ts    # Guard confirmación doble
    │   └── sso-config.guard.ts         # Guard configuración SSO
    ├── decorators/
    │   ├── roles.decorator.ts          # Decorator roles
    │   ├── permissions.decorator.ts    # Decorator permisos
    │   ├── require-resource-admin.decorator.ts # Decorator RF-42
    │   └── require-double-confirmation.decorator.ts
    └── middleware/
        ├── rate-limiting.middleware.ts # Middleware rate limiting
        ├── resource-audit.middleware.ts # Middleware auditoría RF-42
        └── logging.middleware.ts       # Middleware logging
```

### Patrones Arquitectónicos

#### Clean Architecture + CQRS
- **Domain Layer**: Entidades de usuario, rol, permiso con lógica de negocio
- **Application Layer**: Casos de uso CQRS para autenticación y autorización
- **Infrastructure Layer**: Estrategias Passport, guards NestJS, repositorios Prisma

#### Event-Driven Architecture
- **Auth Events**: `UserLoggedIn`, `LoginFailed`, `AccountLocked`
- **User Events**: `UserCreated`, `UserUpdated`, `UserDeactivated`
- **Permission Events**: `RoleAssigned`, `PermissionGranted`, `AccessDenied`

## 🚀 Funcionalidades Implementadas

### RF-41: Gestión de roles y permisos
- ✅ **6 Roles Predefinidos Inmutables**:
  - `STUDENT` (Estudiante)
  - `TEACHER` (Docente) 
  - `GENERAL_ADMIN` (Administrador General)
  - `PROGRAM_ADMIN` (Administrador de Programa)
  - `SECURITY` (Vigilante)
  - `GENERAL_STAFF` (Administrativo General)

- ✅ **Sistema de Permisos Granulares**:
```typescript
// Estructura de permiso granular
{
  "id": "uuid-permiso",
  "resource": "resources",     // Recurso sobre el que aplica
  "action": "update",          // Acción permitida (create, read, update, delete)
  "scope": "own_program",      // Alcance (all, own_program, own, none)
  "conditions": {              // Condiciones adicionales
    "time_restrictions": ["06:00-22:00"],
    "capacity_limit": 50,
    "advance_booking": 24
  },
  "isActive": true
}
```

- ✅ **Roles Personalizados**:
```typescript
// Ejemplo de rol personalizado
{
  "id": "uuid-rol",
  "name": "Coordinador de Laboratorios",
  "code": "LAB_COORDINATOR", 
  "categoryCode": "OPERATIONAL",
  "isCustom": true,
  "isImmutable": false,
  "permissions": [
    {
      "resource": "resources",
      "action": "read",
      "scope": "all"
    },
    {
      "resource": "resources", 
      "action": "update",
      "scope": "laboratory_only",
      "conditions": {
        "resource_types": ["laboratory", "computer_lab"]
      }
    }
  ]
}
```

### RF-42: Restricción de modificación de recursos
- ✅ **ResourceModificationGuard**: Valida permisos de administrador
- ✅ **DoubleConfirmationGuard**: Requiere confirmación 'DELETE' para eliminaciones
- ✅ **Decorators Especializados**:
  - `@RequireResourceAdmin()`: Solo administradores pueden modificar
  - `@RequireDoubleConfirmation()`: Confirmación doble para eliminaciones

```typescript
// Uso en controladores
@Controller('resources')
export class ResourcesController {
  
  @Put(':id')
  @RequireResourceAdmin()
  @UseGuards(ResourceModificationGuard)
  async updateResource(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
    // Solo administradores pueden ejecutar esta acción
  }
  
  @Delete(':id')
  @RequireDoubleConfirmation()
  @UseGuards(DoubleConfirmationGuard)
  async deleteResource(@Param('id') id: string, @Body() confirmation: DeleteConfirmationDto) {
    // Requiere confirmation.deleteConfirmation === 'DELETE'
  }
}
```

- ✅ **Auditoría Completa**:
```typescript
// Log de intento de modificación
{
  "timestamp": "2025-09-01T23:45:00Z",
  "level": "warn",
  "service": "auth-service",
  "action": "resource_modification_denied",
  "userId": "uuid-usuario",
  "resourceId": "uuid-recurso",
  "resourceType": "classroom",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "reason": "INSUFFICIENT_PERMISSIONS",
  "requiredRole": "ADMIN",
  "userRole": "TEACHER"
}
```

### RF-43: Autenticación segura y SSO
- ✅ **Autenticación Tradicional Mejorada**:
  - Validación de email obligatoria
  - Sistema de bloqueo tras 5 intentos fallidos
  - Logging detallado con IP tracking
  - Refresh tokens con rotación automática

- ✅ **Google Workspace SSO (OAuth2)**:
```typescript
// Configuración Google OAuth2
{
  "clientId": "google-workspace-client-id",
  "clientSecret": "encrypted-secret",
  "domain": "ufps.edu.co",
  "scopes": [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ],
  "roleMapping": {
    "student": "STUDENT",
    "faculty": "TEACHER", 
    "admin": "GENERAL_ADMIN"
  }
}
```

- ✅ **Flujo SSO Completo**:
```typescript
// Endpoint SSO
GET /auth/oauth/google
// Redirige a Google para autenticación

GET /auth/oauth/google/callback?code=...
// Procesa respuesta de Google y crea/actualiza usuario

// Respuesta exitosa
{
  "success": true,
  "user": {
    "id": "uuid-usuario",
    "email": "usuario@ufps.edu.co",
    "fullName": "Juan Pérez",
    "role": "TEACHER",
    "isSSO": true
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "expiresIn": 3600
  }
}
```

### RF-44: Auditoría completa
- ✅ **Registro Estructurado**:
  - Todos los intentos de autenticación
  - Cambios en roles y permisos
  - Accesos a recursos protegidos
  - Modificaciones de datos críticos

- ✅ **Metadatos de Auditoría**:
```typescript
interface AuditLog {
  id: string;
  userId?: string;
  action: string;              // LOGIN, LOGOUT, ROLE_CHANGE, RESOURCE_ACCESS
  resource?: string;           // Recurso afectado
  resourceId?: string;
  oldValue?: any;              // Valor anterior
  newValue?: any;              // Valor nuevo
  ip: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
  sessionId?: string;
  correlationId: string;
}
```

### RF-45: Doble factor de autenticación (2FA)
- ✅ **TOTP (Time-based One-Time Password)**:
  - Integración con Google Authenticator
  - Códigos de respaldo para recuperación
  - Configuración opcional por usuario

- ✅ **SMS como segunda opción**:
  - Integración con servicio SMS
  - Códigos de 6 dígitos con expiración
  - Rate limiting anti-spam

```typescript
// Activación 2FA
POST /auth/2fa/enable
{
  "method": "TOTP", // o "SMS"
  "phoneNumber": "+573123456789" // solo para SMS
}

// Respuesta con QR para TOTP
{
  "success": true,
  "qrCode": "data:image/png;base64,...",
  "backupCodes": [
    "12345678", "87654321", "11223344"
  ],
  "secret": "JBSWY3DPEHPK3PXP" // para configuración manual
}

// Verificación 2FA en login
POST /auth/login/verify-2fa
{
  "token": "123456",
  "sessionId": "temp-session-id"
}
```

## 📊 Modelo de Datos

### Entidad User
```typescript
export class UserEntity {
  id: string;
  email: string;
  password?: string;           // null para usuarios SSO
  fullName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  
  // SSO Information
  isSSO: boolean;
  ssoProvider?: 'GOOGLE' | 'MICROSOFT';
  ssoId?: string;
  lastSSOSync?: Date;
  
  // Security
  failedLoginAttempts: number;
  lockedUntil?: Date;
  lastLogin?: Date;
  lastPasswordChange?: Date;
  
  // 2FA
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'TOTP' | 'SMS';
  twoFactorSecret?: string;    // Encriptado
  twoFactorBackupCodes?: string[]; // Encriptados
  phoneNumber?: string;
  
  // Profile
  academicProgramId?: string;
  employeeId?: string;
  studentId?: string;
  department?: string;
  position?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  
  // Relations
  roles: UserRoleEntity[];
  auditLogs: AuditLogEntity[];
}
```

### Entidad Role
```typescript
export class RoleEntity {
  id: string;
  name: string;
  code: string;                // Código único del rol
  categoryCode: string;        // Código de categoría (del modelo unificado)
  description?: string;
  
  // Configuration
  isImmutable: boolean;        // Los 6 roles predefinidos
  isCustom: boolean;           // Roles personalizados
  isActive: boolean;
  
  // Hierarchy
  level: number;               // Nivel jerárquico (1=más alto)
  parentRoleId?: string;       // Rol padre en jerarquía
  
  // Permissions
  permissions: PermissionEntity[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  
  // Relations
  userRoles: UserRoleEntity[];
  category: CategoryEntity;
}
```

### Entidad Permission
```typescript
export class PermissionEntity {
  id: string;
  resource: string;            // Recurso (resources, users, reservations)
  action: string;              // Acción (create, read, update, delete)
  scope: string;               // Alcance (all, own_program, own, none)
  
  // Conditions (JSON)
  conditions?: {
    timeRestrictions?: string[];     // ["06:00-22:00"]
    resourceTypes?: string[];        // ["classroom", "laboratory"]
    capacityLimit?: number;          // Límite de capacidad
    advanceBooking?: number;         // Horas de anticipación
    daysOfWeek?: string[];          // ["MONDAY", "TUESDAY"]
    locationRestrictions?: string[]; // ["Building A", "Building B"]
  };
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Entidad UserRole
```typescript
export class UserRoleEntity {
  id: string;
  userId: string;
  roleId: string;
  
  // Scope restrictions
  academicProgramId?: string;  // Para roles limitados a programa
  departmentId?: string;       // Para roles limitados a departamento
  
  // Validity
  validFrom: Date;
  validUntil?: Date;
  isActive: boolean;
  
  // Assignment metadata
  assignedBy: string;
  assignedAt: Date;
  revokedBy?: string;
  revokedAt?: Date;
  reason?: string;
  
  // Relations
  user: UserEntity;
  role: RoleEntity;
}
```

## 🌐 API Endpoints

### Autenticación - `/auth`

#### POST /auth/login
Iniciar sesión tradicional

**Request Body:**
```json
{
  "email": "usuario@ufps.edu.co",
  "password": "password123",
  "rememberMe": true
}
```

**Response (200):**
```json
{
  "success": true,
  "requiresTwoFactor": false,
  "user": {
    "id": "uuid-usuario",
    "email": "usuario@ufps.edu.co",
    "fullName": "Juan Pérez",
    "roles": ["TEACHER"],
    "permissions": [
      {
        "resource": "resources",
        "action": "read",
        "scope": "own_program"
      }
    ]
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "expiresIn": 3600
  }
}
```

#### POST /auth/register
Registrar nuevo usuario

#### POST /auth/logout
Cerrar sesión

#### POST /auth/refresh
Renovar tokens de acceso

#### POST /auth/forgot-password
Solicitar recuperación de contraseña

#### POST /auth/reset-password
Restablecer contraseña

### SSO - `/auth/oauth`

#### GET /auth/oauth/google
Iniciar flujo SSO con Google

#### GET /auth/oauth/google/callback
Callback de Google OAuth2

### Usuarios - `/users`

#### GET /users
Listar usuarios con filtros

**Query Parameters:**
- `page`: Número de página
- `limit`: Elementos por página
- `role`: Filtrar por rol
- `active`: Filtrar por estado activo
- `sso`: Filtrar por usuarios SSO

#### GET /users/:id
Obtener usuario por ID

#### POST /users
Crear nuevo usuario

#### PUT /users/:id
Actualizar usuario

#### POST /users/:id/roles
Asignar rol a usuario

**Request Body:**
```json
{
  "roleId": "uuid-rol",
  "academicProgramId": "uuid-programa", // Opcional para roles con scope
  "validUntil": "2025-12-31T23:59:59Z", // Opcional
  "reason": "Asignación temporal para coordinación"
}
```

#### DELETE /users/:id/roles/:roleId
Revocar rol de usuario

### Roles - `/roles`

#### GET /roles
Listar roles disponibles

#### GET /roles/predefined
Obtener roles predefinidos (inmutables)

#### POST /roles
Crear rol personalizado

**Request Body:**
```json
{
  "name": "Coordinador de Laboratorios",
  "code": "LAB_COORDINATOR",
  "categoryCode": "OPERATIONAL",
  "description": "Coordinador especializado en laboratorios",
  "permissions": [
    {
      "resource": "resources",
      "action": "read",
      "scope": "all"
    },
    {
      "resource": "resources",
      "action": "update", 
      "scope": "filtered",
      "conditions": {
        "resourceTypes": ["laboratory", "computer_lab"]
      }
    }
  ]
}
```

#### PUT /roles/:id
Actualizar rol personalizado

#### DELETE /roles/:id
Eliminar rol personalizado

### Permisos - `/permissions`

#### GET /permissions
Listar permisos disponibles

#### GET /permissions/resources
Obtener recursos disponibles para permisos

#### GET /permissions/user/:userId
Obtener permisos efectivos de un usuario

### 2FA - `/auth/2fa`

#### POST /auth/2fa/enable
Activar autenticación de dos factores

#### POST /auth/2fa/disable
Desactivar autenticación de dos factores

#### POST /auth/2fa/verify
Verificar código 2FA

#### POST /auth/2fa/backup-codes/regenerate
Regenerar códigos de respaldo

### Auditoría - `/audit`

#### GET /audit/logs
Obtener logs de auditoría

**Query Parameters:**
- `userId`: Filtrar por usuario
- `action`: Filtrar por acción
- `resource`: Filtrar por recurso
- `startDate`: Fecha inicio
- `endDate`: Fecha fin
- `success`: Filtrar por éxito/fallo

#### GET /audit/summary
Obtener resumen de auditoría

### Semillas - `/seed`

#### GET /seed/status
Verificar si la BD necesita semillas

#### POST /seed/run
Ejecutar proceso de semillas

## 🔄 Eventos de Dominio

### UserLoggedIn
```json
{
  "eventType": "UserLoggedIn",
  "aggregateId": "uuid-usuario",
  "version": 1,
  "data": {
    "userId": "uuid-usuario",
    "email": "usuario@ufps.edu.co",
    "loginMethod": "SSO_GOOGLE",
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "sessionId": "uuid-session",
    "twoFactorUsed": false
  },
  "metadata": {
    "timestamp": "2025-09-01T23:45:00Z",
    "correlationId": "uuid-correlation"
  }
}
```

### LoginFailed
```json
{
  "eventType": "LoginFailed",
  "aggregateId": "uuid-usuario",
  "data": {
    "email": "usuario@ufps.edu.co", 
    "reason": "INVALID_PASSWORD",
    "attemptNumber": 3,
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "willLockAccount": false
  }
}
```

### RoleAssigned
```json
{
  "eventType": "RoleAssigned",
  "aggregateId": "uuid-usuario",
  "data": {
    "userId": "uuid-usuario",
    "roleId": "uuid-rol",
    "roleName": "PROGRAM_ADMIN",
    "assignedBy": "uuid-admin",
    "academicProgramId": "uuid-programa",
    "validUntil": "2025-12-31T23:59:59Z"
  }
}
```

### AccessDenied
```json
{
  "eventType": "AccessDenied",
  "aggregateId": "uuid-usuario",
  "data": {
    "userId": "uuid-usuario",
    "resource": "resources",
    "action": "update",
    "resourceId": "uuid-recurso",
    "reason": "INSUFFICIENT_PERMISSIONS",
    "requiredPermission": "ADMIN_LEVEL",
    "userPermissions": ["READ_ONLY"]
  }
}
```

## 🔒 Seguridad Avanzada

### Rate Limiting
```typescript
// Configuración de límites
{
  "login": {
    "attempts": 5,
    "windowMs": 300000,      // 5 minutos
    "blockDurationMs": 1800000 // 30 minutos
  },
  "registration": {
    "attempts": 3,
    "windowMs": 3600000      // 1 hora
  },
  "passwordReset": {
    "attempts": 3,
    "windowMs": 3600000      // 1 hora
  }
}
```

### Encriptación
- **Contraseñas**: bcrypt con salt rounds 12
- **Tokens 2FA**: AES-256-GCM
- **Datos SSO**: Cifrado en base de datos
- **Sesiones**: JWT con RS256 + rotación

### Validaciones de Seguridad
- **Fortaleza de contraseña**: Mínimo 8 caracteres, mayúsculas, números, símbolos
- **Dominios permitidos**: Solo emails @ufps.edu.co para SSO
- **Geolocalización**: Detección de logins desde ubicaciones inusuales
- **Device fingerprinting**: Identificación de dispositivos conocidos

## 🧪 Testing

### Pruebas de Autenticación
```bash
npm run test:auth:login
npm run test:auth:sso
npm run test:auth:2fa
npm run test:auth:security
```

### Pruebas de Autorización
```bash
npm run test:auth:roles
npm run test:auth:permissions
npm run test:auth:guards
```

### Pruebas de Seguridad
```bash
npm run test:security:rate-limiting
npm run test:security:encryption
npm run test:security:audit
```

## 📊 Métricas y KPIs

### Métricas de Autenticación
- **Tasa de login exitoso**: > 95%
- **Tiempo promedio de autenticación**: < 500ms
- **Adopción SSO**: 80% de usuarios
- **Activación 2FA**: 60% de usuarios

### Métricas de Seguridad
- **Intentos de fuerza bruta bloqueados**: Tracking en tiempo real
- **Cuentas comprometidas**: 0 tolerancia
- **Accesos no autorizados**: < 0.1%

### Métricas de Roles
- **Roles activos**: 6 predefinidos + N personalizados
- **Permisos granulares**: > 50 combinaciones
- **Tiempo de asignación de rol**: < 2 minutos

## 🚀 Estado del Servicio

✅ **Funcional y operativo**  
✅ **SSO Google Workspace integrado**  
✅ **Sistema de roles granulares completo**  
✅ **Guards RF-42 implementados**  
✅ **2FA TOTP y SMS funcionando**  
✅ **Auditoría completa activa**  
✅ **Rate limiting y seguridad configurados**  
✅ **Semillas con usuarios de prueba**

---

**Próximos pasos**: Integración con reports-service para análisis de seguridad (Hito 5).
