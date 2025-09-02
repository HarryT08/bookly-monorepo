# Bookly Auth Service - Documentación Técnica Completa

## 🔐 Overview

El **Auth Service** es el microservicio central de autenticación, autorización y control de accesos del sistema Bookly UFPS. Implementa una arquitectura hexagonal con CQRS y Event-Driven Architecture para proporcionar un sistema seguro, escalable y auditable de gestión de usuarios, roles y permisos.

### 🎯 Características Principales

- **RF-41**: Gestión diferenciada de roles y permisos granulares
- **RF-42**: Restricción de modificación de recursos solo para administradores  
- **RF-43**: Autenticación mediante credenciales universitarias y SSO (Google Workspace)
- **RF-44**: Auditoría completa de accesos y modificaciones
- **RF-45**: Doble factor de autenticación (2FA)

### 🏗️ Arquitectura

```
auth-service/
├── application/                     # Capa de aplicación (CQRS)
│   ├── commands/                   # Comandos (escritura)
│   ├── handlers/                   # Manejadores de comandos/queries
│   ├── queries/                    # Consultas (lectura)
│   └── services/                   # Servicios de aplicación
├── domain/                         # Lógica de dominio
│   ├── entities/                   # Entidades principales
│   ├── events/                     # Eventos de dominio
│   └── repositories/               # Interfaces de repositorios
├── infrastructure/                 # Adaptadores e implementaciones
│   ├── controllers/                # Controladores HTTP
│   ├── decorators/                 # Decoradores personalizados
│   ├── guards/                     # Guards de seguridad
│   ├── middleware/                 # Middleware de autenticación
│   ├── repositories/               # Implementaciones de repositorios
│   └── strategies/                 # Estrategias de autenticación
├── config/                         # Configuración del servicio
├── utils/                          # Utilidades y mapas
└── test/                          # Pruebas BDD con Jasmine
```

---

## 🚀 Stack Tecnológico

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
http://localhost:3001/auth
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
      "lastLogin": "2024-01-15T10:30:00Z"
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
  "updatedAt": "2024-01-15T10:30:00Z"
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
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/oauth/google/callback"

# Redis (Sessions & Cache)
REDIS_URL="redis://localhost:6379"

# RabbitMQ (Events)
RABBITMQ_URL="amqp://localhost:5672"

# Frontend
FRONTEND_URL="http://localhost:3001"

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
      - "3000:3000"
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
        - containerPort: 3000
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

## 📞 Soporte

Para soporte técnico o consultas sobre la implementación del Auth Service:

- **Email**: soporte-bookly@ufps.edu.co
- **Documentación**: `http://localhost:3001/auth/docs`
- **Health Check**: `http://localhost:3001/auth/health`
- **Métricas**: `http://localhost:3001/auth/metrics`
