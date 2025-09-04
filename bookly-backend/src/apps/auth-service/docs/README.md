# Auth Service - Documentación Técnica

## 📋 Índice

- [Información General](#información-general)
- [Arquitectura](#arquitectura)
- [Requerimientos Funcionales](#requerimientos-funcionales)
- [API REST Endpoints](#api-rest-endpoints)
- [Event-Driven Architecture](#event-driven-architecture)
- [Base de Datos](#base-de-datos)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [Configuración](#configuración)
- [Observabilidad](#observabilidad)
- [Testing](#testing)
- [Deployment](#deployment)

## 🏢 Información General

El **Auth Service** es el microservicio central de autenticación, autorización y control de accesos del sistema Bookly UFPS. Implementa una arquitectura hexagonal con CQRS y Event-Driven Architecture para proporcionar un sistema seguro, escalable y auditable de gestión de usuarios, roles y permisos.

### Características Principales

- **RF-41**: Gestión diferenciada de roles y permisos granulares
- **RF-42**: Restricción de modificación de recursos solo para administradores  
- **RF-43**: Autenticación mediante credenciales universitarias y SSO (Google Workspace)
- **RF-44**: Auditoría completa de accesos y modificaciones
- **RF-45**: Doble factor de autenticación (2FA)

### Información de Servicio

- **Puerto**: `3001` (desarrollo) / `3000` (producción vía API Gateway)
- **Health Check**: `GET /api/v1/auth/health`
- **Documentación**: `GET /api/v1/auth/docs`
- **Métricas**: `GET /api/v1/auth/metrics`

### Stack Tecnológico

```typescript
// Core Framework
- NestJS 10.x (Framework modular con CQRS)
- TypeScript 5.x (Tipado estático)

// Database & ORM
- Prisma 5.x (Type-safe database client)
- MongoDB Atlas (Base de datos NoSQL distribuida)

// Authentication & Security
- Passport.js (Estrategias de autenticación)
- JWT (JSON Web Tokens)
- bcrypt (Hashing de contraseñas)
- Google OAuth2 (SSO integration)

// Event-Driven Architecture
- RabbitMQ (Message broker para eventos distribuidos)
- Redis (Cache de alta velocidad)

// Observability Stack
- Winston (Structured logging)
- OpenTelemetry (Distributed tracing)
- Sentry (Error tracking)
```

## 🏗️ Arquitectura

### Clean Architecture + Hexagonal

```
src/apps/auth-service/
├── domain/                    # Lógica de negocio pura
│   ├── entities/              # Entidades de dominio
│   │   ├── user.entity.ts
│   │   ├── role.entity.ts
│   │   └── permission.entity.ts
│   ├── events/                # Eventos de dominio
│   │   ├── user.events.ts
│   │   ├── role.events.ts
│   │   └── auth.events.ts
│   └── repositories/          # Interfaces de repositorios
│       ├── user.repository.ts
│       ├── role.repository.ts
│       └── permission.repository.ts
│
├── application/               # Casos de uso y comandos/queries
│   ├── commands/              # Command handlers (CQRS)
│   │   ├── auth/
│   │   ├── user/
│   │   └── role/
│   ├── queries/               # Query handlers (CQRS)
│   │   ├── auth/
│   │   ├── user/
│   │   └── role/
│   ├── handlers/              # Event handlers
│   │   ├── auth.handlers.ts
│   │   ├── user.handlers.ts
│   │   └── role.handlers.ts
│   └── services/              # Servicios de aplicación
│       ├── auth.service.ts
│       ├── user.service.ts
│       └── role.service.ts
│
└── infrastructure/            # Adaptadores externos
    ├── controllers/           # HTTP controllers
    │   ├── auth.controller.ts
    │   ├── user.controller.ts
    │   ├── role.controller.ts
    │   └── oauth.controller.ts
    ├── repositories/          # Implementaciones Prisma
    │   ├── prisma-user.repository.ts
    │   ├── prisma-role.repository.ts
    │   └── prisma-permission.repository.ts
    ├── guards/                # Security guards
    │   ├── jwt-auth.guard.ts
    │   ├── roles.guard.ts
    │   └── permissions.guard.ts
    ├── strategies/            # Authentication strategies
    │   ├── jwt.strategy.ts
    │   ├── local.strategy.ts
    │   └── google.strategy.ts
    └── config/                # Configuración del servicio
        ├── auth.config.ts
        └── oauth.config.ts
```

### CQRS Pattern

El servicio implementa **Command Query Responsibility Segregation**:

- **Commands**: Modifican estado (login, register, assign roles, update permissions)
- **Queries**: Solo leen datos (get users, get roles, validate tokens)
- **Events**: Comunican cambios entre bounded contexts

## 📋 Requerimientos Funcionales

### RF-41: Gestión de Roles y Permisos Granulares

**Descripción**: Sistema diferenciado de roles y permisos según perfil de usuario con granularidad máxima.

**Roles Predefinidos**:
- **Estudiante**: Reservar, cancelar, consultar, evaluar
- **Docente**: Reservar, aprobar solicitudes estudiantes, gestionar horarios
- **Administrador General**: Control total del sistema
- **Administrador de Programa**: Control específico por programa académico  
- **Vigilante**: Consultar reservas, check-in/out, evaluar asistencia
- **Administrativo General**: Reportes, validar solicitudes, ajustar disponibilidad

**Endpoints**:
- `POST /auth/roles` - Crear rol personalizado
- `GET /auth/roles` - Listar roles disponibles
- `PUT /auth/roles/:id` - Actualizar rol
- `POST /auth/users/:id/assign-role` - Asignar rol a usuario

### RF-42: Restricción de Modificación de Recursos

**Descripción**: Solo administradores pueden modificar recursos físicos del sistema.

**Características**:
- Guards automáticos en endpoints de modificación
- Auditoría completa de intentos de acceso
- Doble confirmación para eliminaciones
- Logging estructurado de todas las acciones

### RF-43: Autenticación y SSO

**Descripción**: Autenticación mediante credenciales UFPS y Google Workspace SSO.

**Métodos Soportados**:
- Credenciales tradicionales (email/password)
- Google Workspace OAuth2
- JWT tokens con refresh
- 2FA opcional (TOTP)

**Endpoints**:
- `POST /auth/login` - Login tradicional
- `POST /auth/register` - Registro de usuario
- `GET /auth/oauth/google` - Inicio SSO Google
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Cerrar sesión

### RF-44: Auditoría Completa

**Descripción**: Registro detallado de todos los accesos y modificaciones del sistema.

**Información Auditada**:
- Intentos de login (exitosos/fallidos)
- Cambios de roles y permisos
- Modificaciones de recursos
- Accesos a información sensible
- Actividad administrativa

### RF-45: Doble Factor de Autenticación

**Descripción**: Sistema 2FA opcional para aumentar seguridad.

**Métodos Soportados**:
- TOTP (Time-based One-Time Password)
- Códigos por email
- SMS (futuro)

## 🔌 API REST Endpoints

### Autenticación

```http
# Login tradicional
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@ufps.edu.co",
  "password": "password123",
  "remember": true
}

# Response
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "usuario@ufps.edu.co", 
      "fullName": "Juan Pérez",
      "roles": ["STUDENT"]
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}

# Registro de usuario
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "nuevo@ufps.edu.co",
  "password": "password123",
  "fullName": "Nuevo Usuario",
  "program": "ING-SIS",
  "studentId": "1151234"
}

# SSO Google
GET /api/v1/auth/oauth/google
# Redirecciona a Google OAuth

# Callback SSO
GET /api/v1/auth/oauth/google/callback?code=...
# Procesa respuesta de Google
```

### Gestión de Usuarios

```http
# Listar usuarios
GET /api/v1/users?page=1&limit=10&role=STUDENT&program=ING-SIS

# Obtener perfil propio
GET /api/v1/users/me

# Actualizar perfil
PUT /api/v1/users/me
Content-Type: application/json

{
  "fullName": "Juan Pérez González",
  "phone": "+573001234567",
  "preferences": {
    "emailNotifications": true,
    "smsNotifications": false
  }
}

# Asignar rol (solo administradores)
POST /api/v1/users/{userId}/assign-role
Content-Type: application/json

{
  "roleId": "role_456",
  "program": "ING-SIS",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

### Gestión de Roles y Permisos

```http
# Crear rol personalizado
POST /api/v1/auth/roles
Content-Type: application/json

{
  "name": "Coordinador Lab Redes",
  "description": "Coordinador específico del laboratorio de redes",
  "permissions": [
    "resources:view",
    "resources:approve",
    "reservations:manage"
  ],
  "scope": {
    "programs": ["ING-SIS"],
    "resources": ["laboratory"]
  }
}

# Listar permisos disponibles
GET /api/v1/auth/permissions?category=resources

# Validar permisos de usuario
POST /api/v1/auth/validate-permission
Content-Type: application/json

{
  "userId": "user_123",
  "permission": "resources:modify",
  "resourceId": "resource_456"
}
```

## 🔄 Event-Driven Architecture

### Eventos Publicados

```typescript
// Cuando usuario inicia sesión exitosamente
export interface UserLoggedInEvent {
  userId: string;
  email: string;
  loginMethod: 'CREDENTIALS' | 'GOOGLE_SSO';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

// Cuando se cambian roles de usuario
export interface UserRoleChangedEvent {
  userId: string;
  previousRoles: string[];
  newRoles: string[];
  changedBy: string;
  changedAt: Date;
  program?: string;
}

// Cuando falla autenticación
export interface AuthenticationFailedEvent {
  email: string;
  reason: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'INVALID_2FA';
  timestamp: Date;
  ipAddress: string;
  attemptCount: number;
}

// Cuando usuario es bloqueado
export interface UserBlockedEvent {
  userId: string;
  email: string;
  reason: 'TOO_MANY_ATTEMPTS' | 'ADMIN_ACTION';
  blockedBy: string;
  blockedAt: Date;
  unblockAt?: Date;
}
```

### Eventos Consumidos

```typescript
// Del resources-service
export interface ResourceModifiedEvent {
  resourceId: string;
  modifiedBy: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  timestamp: Date;
  changes: Record<string, any>;
}

// Del stockpile-service  
export interface ApprovalRequestCreatedEvent {
  approvalId: string;
  requesterId: string;
  resourceId: string;
  assignedApprovers: string[];
  requiresElevatedPermissions: boolean;
}
```

## 🗄️ Base de Datos

### Esquema de Entidades Principales

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  password        String?  // Null para usuarios SSO
  fullName        String
  firstName       String?
  lastName        String?
  
  // Información académica
  studentId       String?  @unique
  employeeId      String?  @unique
  program         String?  // Código del programa académico
  
  // Configuración de cuenta
  isActive        Boolean  @default(true)
  isVerified      Boolean  @default(false)
  lastLoginAt     DateTime?
  failedAttempts  Int      @default(0)
  blockedUntil    DateTime?
  
  // 2FA
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret String?
  
  // SSO
  googleId        String?  @unique
  ssoProvider     String?
  ssoData         Json?
  
  // Auditoría
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?
  
  // Relaciones
  userRoles       UserRole[]
  refreshTokens   RefreshToken[]
  auditLogs       AuditLog[]
  
  @@map("users")
}

model Role {
  id              String   @id @default(cuid())
  name            String   @unique
  description     String?
  categoryCode    String   // Código de categoría del modelo unificado
  
  // Configuración
  isActive        Boolean  @default(true)
  isPredefined    Boolean  @default(false) // Los predefinidos no se pueden modificar
  
  // Scope de aplicación
  scope           Json?    // Programas, recursos, etc. donde aplica
  
  // Auditoría
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String
  
  // Relaciones
  userRoles       UserRole[]
  rolePermissions RolePermission[]
  
  @@map("roles")
}

model Permission {
  id              String   @id @default(cuid())
  name            String   @unique
  description     String?
  
  // Configuración de permiso
  resource        String   // Recurso sobre el que actúa
  action          String   // Acción permitida (view, create, edit, delete)
  scope           String   // Alcance (personal, program, global)
  conditions      Json?    // Condiciones adicionales
  
  // Estado
  isActive        Boolean  @default(true)
  
  // Auditoría
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relaciones
  rolePermissions RolePermission[]
  
  @@map("permissions")
}

model UserRole {
  id          String    @id @default(cuid())
  userId      String
  roleId      String
  program     String?   // Programa académico específico
  assignedBy  String
  assignedAt  DateTime  @default(now())
  expiresAt   DateTime?
  isActive    Boolean   @default(true)
  
  // Relaciones
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  role        Role      @relation(fields: [roleId], references: [id])
  
  @@unique([userId, roleId, program])
  @@map("user_roles")
}
```

## 🔐 Autenticación y Autorización

### Estrategias de Autenticación

```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

// Google OAuth Strategy
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const user = await this.userService.findOrCreateGoogleUser(profile);
    return user;
  }
}
```

### Guards de Autorización

```typescript
// Roles Guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// Permissions Guard
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    const userPermissions = await this.userService.getUserPermissions(user.id);
    
    return requiredPermissions.every(permission => 
      userPermissions.some(up => up.name === permission && up.isActive)
    );
  }
}
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# Configuración del servicio
AUTH_SERVICE_PORT=3001
AUTH_SERVICE_NAME="Bookly Auth Service"

# Base de datos
DATABASE_URL="mongodb://username:password@cluster.mongodb.net/bookly"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Google OAuth2
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/oauth/google/callback"

# Security
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30

# Event Bus
RABBITMQ_URL="amqp://localhost:5672"
REDIS_URL="redis://localhost:6379"

# Observabilidad
SENTRY_DSN=***
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
LOG_LEVEL=info
```

## 📊 Observabilidad

### Logging con Winston

```typescript
// Estructura de logs específica
const authLogger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'auth-service' },
  transports: [
    new transports.File({ filename: 'logs/auth-error.log', level: 'error' }),
    new transports.File({ filename: 'logs/auth-combined.log' }),
    new transports.Console({ format: combine(colorize(), simple()) })
  ]
});

// Eventos importantes a loggear
- UserLoginAttempt
- UserLoginSuccess
- UserLoginFailed
- RoleAssigned
- PermissionChanged
- SecurityViolation
- TokenExpired
```

### Métricas con OpenTelemetry

- **Logins exitosos vs fallidos por hora**
- **Tiempo promedio de autenticación**
- **Usuarios activos concurrentes**
- **Intentos de acceso no autorizados**
- **Roles más asignados**
- **Errores de validación de permisos**

## 🧪 Testing

### Estructura de Pruebas

```
test/
├── unit/                      # Pruebas unitarias
│   ├── domain/
│   ├── application/
│   └── infrastructure/
├── integration/               # Pruebas de integración
│   ├── controllers/
│   ├── repositories/
│   └── auth-flows/
├── e2e/                      # Pruebas end-to-end
│   ├── auth.e2e.spec.ts
│   ├── roles.e2e.spec.ts
│   └── sso.e2e.spec.ts
└── fixtures/                 # Datos de prueba
    ├── users.json
    ├── roles.json
    └── permissions.json
```

### Comandos de Testing

```bash
# Pruebas unitarias
npm run test:unit

# Pruebas de integración  
npm run test:integration

# Pruebas end-to-end
npm run test:e2e

# Cobertura de pruebas
npm run test:coverage

# Pruebas en modo watch
npm run test:watch
```

## 🚀 Deployment

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs dist/apps/auth-service ./
USER nestjs
EXPOSE 3001
CMD ["node", "main.js"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: bookly
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: bookly/auth-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: auth-secret
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Backend Core

- **NestJS**: Framework principal con decoradores y DI
- **Prisma**: ORM sobre MongoDB con type safety
- **MongoDB**: Base de datos NoSQL para flexibilidad de esquemas
- **TypeScript**: Tipado estático y desarrollo robusto

### Autenticación & Seguridad

- **JWT**: Tokens firmados con roles y permisos incluidos
- **Passport.js**: Estrategias locales y OAuth2
- **Google OAuth2**: SSO con Google Workspace (@ufps.edu.co)
- **bcrypt**: Hashing seguro de contraseñas
- **Rate Limiting**: Protección contra ataques de fuerza bruta

### Observabilidad & Monitoreo

- **Winston**: Logging estructurado en JSON
- **OpenTelemetry**: Trazabilidad distribuida
- **Sentry**: Captura y notificación de errores
- **Swagger**: Documentación automática de API

### Comunicación

- **RabbitMQ**: Eventos asíncronos (user-created, role-assigned, etc.)
- **Redis**: Cache de sesiones y rate limiting
- **HTTP REST**: API principal de autenticación

---

## 🏛️ Arquitectura Hexagonal

### Ports (Interfaces)

```typescript
// Domain Layer
interface UserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  assignRole(userId: string, roleId: string): Promise<void>;
}

interface AuthService {
  login(email: string, password: string): Promise<LoginResult>;
  loginSSO(profile: GoogleProfile): Promise<LoginResult>;
  validateToken(token: string): Promise<User>;
}
```

### Adapters (Implementaciones)

```typescript
// Infrastructure Layer
@Injectable()
export class PrismaUserRepository implements UserRepository {
  // Implementación específica de Prisma
}

@Injectable() 
export class JwtAuthService implements AuthService {
  // Implementación específica de JWT
}
```

---

## 📊 CQRS Implementation

### Commands (Escritura)

```typescript
// Comandos para modificar estado
export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}

export class RegisterCommand {
  constructor(
    public readonly email: string,
    public readonly username: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {}
}
```

### Queries (Lectura)

```typescript
// Consultas optimizadas para lectura
export class GetUserQuery {
  constructor(public readonly id: string) {}
}

export class GetUsersQuery {
  constructor(
    public readonly page?: number,
    public readonly limit?: number,
    public readonly search?: string,
  ) {}
}
```

### Event Handlers

```typescript
@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  async handle(event: UserCreatedEvent) {
    // Emitir evento a RabbitMQ
    await this.eventBus.publish('user-created', event.payload);
    
    // Logging y auditoría
    this.logger.info('User created', { userId: event.userId });
  }
}
```

---

## 🔐 Sistema de Roles y Permisos

### Roles Predefinidos (Inmutables)

```typescript
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin', 
  COORDINATOR: 'coordinator',
  TEACHER: 'teacher',
  STUDENT: 'student',
  GUEST: 'guest'
} as const;
```

### Permisos Granulares

```typescript
export const PERMISSIONS = {
  // Recursos
  RESOURCE_CREATE: 'resource:create',
  RESOURCE_READ: 'resource:read',
  RESOURCE_UPDATE: 'resource:update',
  RESOURCE_DELETE: 'resource:delete',
  
  // Reservas
  RESERVATION_CREATE: 'reservation:create',
  RESERVATION_APPROVE: 'reservation:approve',
  RESERVATION_CANCEL: 'reservation:cancel',
  
  // Usuarios
  USER_READ: 'user:read',
  USER_MANAGE: 'user:manage',
  
  // Reportes
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export'
} as const;
```

### Guards de Seguridad

```typescript
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermissions('resource:delete')
@Delete('/resources/:id')
async deleteResource(@Param('id') id: string) {
  // Solo usuarios con permiso específico pueden acceder
}
```

---

## 🌐 Endpoints HTTP

### Base URL

```
http://localhost:3000/api/v1/auth
```

### Authentication Endpoints

#### `POST /auth/login`

**Autenticación tradicional con email universitario**

```typescript
// Request
{
  "email": "juan.perez@ufps.edu.co",
  "password": "securePassword123"
}

// Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "user-uuid",
    "email": "juan.perez@ufps.edu.co",
    "firstName": "Juan",
    "lastName": "Pérez",
    "roles": ["teacher"],
    "permissions": ["reservation:create", "resource:read"]
  }
}
```

#### `POST /auth/register`

**Registro de nuevo usuario**

```typescript
// Request
{
  "email": "maria.garcia@ufps.edu.co",
  "username": "maria.garcia",
  "password": "securePassword123",
  "firstName": "María",
  "lastName": "García"
}

// Response
{
  "id": "user-uuid",
  "email": "maria.garcia@ufps.edu.co",
  "username": "maria.garcia",
  "status": "pending_verification",
  "message": "Usuario creado. Verifique su email."
}
```

### OAuth2/SSO Endpoints

#### `GET /auth/oauth/google`

**Iniciar autenticación con Google**

- Redirige a Google OAuth2 consent screen
- Scope: `profile email`
- Restricción: Solo emails `@ufps.edu.co`

#### `GET /auth/oauth/google/callback`

**Callback de Google OAuth2**

- Procesa respuesta de Google
- Crea/actualiza usuario automáticamente
- Redirige al frontend con token JWT

### User Management Endpoints

#### `GET /users`

**Listar usuarios paginados**

```typescript
// Query Parameters
?page=1&limit=10&search=juan

// Response
{
  "data": [
    {
      "id": "user-uuid",
      "email": "juan.perez@ufps.edu.co",
      "firstName": "Juan",
      "lastName": "Pérez",
      "roles": ["teacher"],
      "isActive": true,
      "lastLogin": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### `PUT /users/:id/roles/assign`

**Asignar rol a usuario**

```typescript
// Request
{
  "roleId": "coordinator-role-uuid"
}

// Response
{
  "id": "user-uuid",
  "roles": ["teacher", "coordinator"],
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

---

## 🔒 Seguridad y Autenticación

### JWT Token Structure

```typescript
{
  "sub": "user-uuid",                    // User ID
  "email": "juan.perez@ufps.edu.co",     // User email
  "roles": ["teacher"],                  // User roles
  "permissions": [                       // Computed permissions
    "reservation:create",
    "resource:read"
  ],
  "iat": 1642248600,                     // Issued at
  "exp": 1642252200,                     // Expires at
  "iss": "bookly-auth-service"           // Issuer
}
```

### Guards Implementation

#### JWT Guard

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean {
    // Validar token JWT y extraer usuario
    return super.canActivate(context);
  }
}
```

#### Permission Guard

```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    
    const user = context.switchToHttp().getRequest().user;
    
    return requiredPermissions.every(permission => 
      user.permissions.includes(permission)
    );
  }
}
```

### Rate Limiting

```typescript
@Controller('auth')
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 intentos por minuto
export class AuthController {
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Implementación con protección contra fuerza bruta
  }
}
```

---

## 📡 WebSocket Integration

### Authentication over WebSocket

```typescript
// Client-side authentication
const socket = io('ws://localhost:3000/auth', {
  auth: {
    token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});

// Server-side validation
@WebSocketGateway(3000, { 
  namespace: '/auth',
  cors: { origin: '*' }
})
export class AuthGateway {
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('user-status-update')
  async handleUserStatusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any
  ) {
    // Actualizar estado del usuario en tiempo real
  }
}
```

### Real-time Events

```typescript
// Eventos emitidos por Auth Service
const AUTH_EVENTS = {
  USER_LOGGED_IN: 'user-logged-in',
  USER_LOGGED_OUT: 'user-logged-out', 
  ROLE_ASSIGNED: 'role-assigned',
  PERMISSION_CHANGED: 'permission-changed',
  SUSPICIOUS_ACTIVITY: 'suspicious-activity'
};

// Ejemplo de emisión
this.eventBus.publish('user-logged-in', {
  userId: user.id,
  email: user.email,
  loginTime: new Date(),
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});
```

---

## 📊 Eventos y Mensajería

### Event-Driven Architecture

```typescript
// Eventos de dominio
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly roles: string[],
    public readonly timestamp: Date = new Date()
  ) {}
}

// Publisher
@Injectable()
export class AuthEventPublisher {
  constructor(private readonly eventBus: EventBus) {}
  
  async publishUserCreated(user: User) {
    const event = new UserCreatedEvent(user.id, user.email, user.roles);
    await this.eventBus.publish(event);
  }
}
```

### RabbitMQ Integration

```typescript
// Configuración de RabbitMQ
@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'auth-events',
          type: 'topic',
        },
      ],
      uri: process.env.RABBITMQ_URL,
    }),
  ],
})
export class AuthModule {}

// Consumer en otros servicios
@RabbitSubscribe({
  exchange: 'auth-events',
  routingKey: 'user.created',
  queue: 'resource-service-user-created',
})
async handleUserCreated(data: UserCreatedEvent) {
  // Crear perfil de usuario en resource service
  await this.userProfileService.createFromAuth(data);
}
```

---

## 📈 Observabilidad

### Logging Estructurado

```typescript
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  async login(email: string, password: string) {
    this.logger.log('Login attempt started', {
      email,
      timestamp: new Date().toISOString(),
      source: 'traditional-auth'
    });
    
    try {
      const user = await this.validateUser(email, password);
      
      this.logger.log('Login successful', {
        userId: user.id,
        email,
        roles: user.roles,
        loginTime: new Date().toISOString()
      });
      
      return this.generateTokens(user);
    } catch (error) {
      this.logger.error('Login failed', {
        email,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }
}
```

### OpenTelemetry Tracing

```typescript
@Injectable()
export class AuthService {
  @Trace('auth-service.login')
  async login(email: string, password: string) {
    const span = trace.getActiveSpan();
    span?.setAttributes({
      'auth.method': 'traditional',
      'user.email': email
    });
    
    // Lógica de autenticación
  }
}
```

### Error Handling

```typescript
// Códigos de error estandarizados
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'AUTH-0001',
  USER_NOT_FOUND: 'AUTH-0002',
  TOKEN_EXPIRED: 'AUTH-0003',
  PERMISSION_DENIED: 'AUTH-0004',
  RATE_LIMIT_EXCEEDED: 'AUTH-0005'
} as const;

// Response estándar
{
  "code": "AUTH-0001",
  "message": "Credenciales inválidas",
  "type": "error",
  "exception_code": "AUTH-01",
  "http_code": 401,
  "http_exception": "UnauthorizedException"
}
```

---

## 🧪 Testing

### BDD con Jasmine

```typescript
// Given-When-Then structure
describe('User Authentication', () => {
  describe('Given a valid university email and password', () => {
    it('When user attempts login, Then should return JWT token', async () => {
      // Arrange
      const loginDto = {
        email: 'test@ufps.edu.co',
        password: 'validPassword123'
      };
      
      // Act
      const result = await authService.login(loginDto.email, loginDto.password);
      
      // Assert
      expect(result).toHaveProperty('access_token');
      expect(result.user.email).toBe(loginDto.email);
    });
  });
});
```

### Cobertura de Pruebas

```bash
# Ejecutar todas las pruebas
npm run test

# Cobertura de código
npm run test:cov

# Pruebas E2E
npm run test:e2e
```

---

## 🚀 Deployment

### Variables de Entorno

```bash
# Database
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/bookly-auth"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1h"

# Google OAuth2
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/v1/auth/oauth/google/callback"

# Redis (Sessions & Cache)
REDIS_URL="redis://localhost:6379"

# RabbitMQ (Events)
RABBITMQ_URL="amqp://localhost:5672"

# Frontend
FRONTEND_URL="http://localhost:3000"

# Monitoring
SENTRY_DSN="https://your-sentry-dsn"
```

### Docker Compose

```yaml
version: '3.8'
services:
  auth-service:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - redis
      - mongodb
      
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
      
  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: bookly/auth-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: database-url
```

---

## 🔧 Desarrollo

### Comandos Útiles

```bash
# Instalar dependencias
npm install

# Desarrollo con hot-reload
npm run start:dev

# Compilar para producción
npm run build

# Ejecutar migraciones
npx prisma migrate deploy

# Generar documentación
npm run doc:generate

# Análisis de código
npm run lint
npm run format
```

### Scripts de Base de Datos

```bash
# Seed inicial con roles y permisos
npx prisma db seed

# Reset completo de BD
npx prisma migrate reset

# Generación de cliente Prisma
npx prisma generate
```

---

## 📚 Referencias

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Google OAuth2 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Documento**: README.md - Auth Service  
**Última actualización**: 31 de Agosto, 2025  
**Versión**: 2.0.0  
**Autor**: Equipo de Desarrollo Bookly  
**Revisor**: Arquitecto de Sistemas  
**Estado**: ✅ Documentación Completa y Validada

*Universidad Francisco de Paula Santander - Sistema Bookly de Reservas Institucionales*
