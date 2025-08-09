# Bookly - Sistema de Roles Estandarizado

## Resumen

Este documento describe el sistema de roles estandarizado de Bookly, que proporciona control de acceso granular y consistente a través de todos los servicios y endpoints del sistema.

## Arquitectura del Sistema de Roles

### Roles Predefinidos

El sistema define 6 roles predefinidos que mapean constantes en inglés a nombres en español para la base de datos:

```typescript
export enum UserRole {
  STUDENT = 'Estudiante',
  TEACHER = 'Docente', 
  GENERAL_ADMIN = 'Administrador General',
  PROGRAM_ADMIN = 'Administrador de Programa',
  SECURITY = 'Vigilante',
  GENERAL_STAFF = 'Administrativo General'
}
```

### Categorías de Roles

Los roles se agrupan en categorías para facilitar la gestión:

- **ACADEMIC**: `STUDENT`, `TEACHER`
- **ADMINISTRATIVE**: `GENERAL_ADMIN`, `PROGRAM_ADMIN`, `GENERAL_STAFF`
- **SECURITY**: `SECURITY`

### Jerarquía de Roles

El sistema implementa una jerarquía numérica para control de acceso:

1. **STUDENT** (Nivel 1): Permisos básicos
2. **TEACHER** (Nivel 2): Permisos académicos
3. **GENERAL_STAFF**, **SECURITY** (Nivel 3): Permisos operativos
4. **PROGRAM_ADMIN** (Nivel 4): Administración de programa
5. **GENERAL_ADMIN** (Nivel 5): Administración completa

## Sistema de Permisos

### Formato de Permisos

Los permisos siguen el formato: `recurso:acción:alcance`

**Recursos disponibles:**
- `users`, `roles`, `permissions`, `resources`, `reservations`, `reports`, `approval-flows`, `notifications`, `calendar`, `audit`

**Acciones disponibles:**
- `create`, `read`, `update`, `delete`, `approve`, `reject`, `export`, `import`

**Alcances disponibles:**
- `global`: Acceso completo
- `program`: Limitado al programa académico
- `own`: Limitado a recursos propios

### Permisos por Rol

#### STUDENT (Estudiante)
```
reservations:create:own
reservations:read:own
reservations:update:own
reservations:delete:own
resources:read:global
reports:read:own
calendar:read:global
```

#### TEACHER (Docente)
```
reservations:create:own
reservations:read:own
reservations:update:own
reservations:delete:own
reservations:approve:program
resources:read:global
reports:read:program
users:read:program
calendar:read:global
calendar:update:program
```

#### GENERAL_ADMIN (Administrador General)
**Acceso completo a todos los recursos con permisos globales**

#### PROGRAM_ADMIN (Administrador de Programa)
**Permisos administrativos limitados al programa académico**

#### SECURITY (Vigilante)
```
reservations:read:global
users:read:global
resources:read:global
calendar:read:global
audit:read:global
```

#### GENERAL_STAFF (Administrativo General)
```
reservations:read:global
reservations:update:global
resources:read:global
resources:update:global
reports:read:global
reports:create:global
calendar:read:global
calendar:update:global
notifications:read:global
notifications:create:global
```

## Uso en Controladores

### Decorador @Roles

```typescript
import { UserRole } from '@libs/common';

@Roles(UserRole.STUDENT, UserRole.TEACHER)
@Get('/my-reservations')
async getMyReservations() {
  // Solo estudiantes y docentes pueden acceder
}

@Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
@Post('/resources')
async createResource() {
  // Solo administradores pueden crear recursos
}
```

### Filtrado de Datos por Rol

```typescript
import { RoleUtils } from '@libs/common';

// Filtrar consultas basado en el rol del usuario
const filteredQuery = RoleUtils.filterUserQuery(
  user.role, 
  user.id, 
  originalQuery
);
```

## Utilidades del Sistema

### RoleUtils

Clase con métodos estáticos para gestión de roles:

```typescript
// Verificar si un usuario tiene un rol específico
RoleUtils.hasRole(userRoles, UserRole.TEACHER)

// Verificar si un rol tiene un permiso específico
RoleUtils.hasPermission(UserRole.TEACHER, 'reservations', 'approve', 'program')

// Obtener roles por categoría
RoleUtils.getRolesByCategory(RoleCategory.ADMINISTRATIVE)

// Verificar si un rol puede modificar recursos
RoleUtils.canModifyResources(UserRole.PROGRAM_ADMIN)
```

### PermissionBuilder

Utilidad para construir y validar cadenas de permisos:

```typescript
// Construir permiso
const permission = PermissionBuilder.build('reservations', 'create', 'own');
// Resultado: "reservations:create:own"

// Parsear permiso
const parsed = PermissionBuilder.parse('reservations:create:own');
// Resultado: { resource: 'reservations', action: 'create', scope: 'own' }
```

## Mapeo de Endpoints por Rol

### Estudiante
- `GET /reservations/my` - Ver mis reservas
- `POST /reservations` - Crear reserva
- `PUT /reservations/:id` - Modificar mi reserva
- `DELETE /reservations/:id` - Cancelar mi reserva
- `GET /resources` - Ver recursos disponibles
- `GET /reports/my` - Ver mis reportes

### Docente
- Todos los endpoints de Estudiante +
- `POST /reservations/:id/approve` - Aprobar reservas del programa
- `GET /reports/program` - Ver reportes del programa
- `GET /users/program` - Ver usuarios del programa

### Administrador General
- Acceso completo a todos los endpoints del sistema

### Administrador de Programa
- `GET /users/program` - Gestionar usuarios del programa
- `GET /resources/program` - Gestionar recursos del programa
- `POST /resources` - Crear recursos para el programa
- `POST /reservations/:id/approve` - Aprobar reservas
- `GET /reports/program` - Generar reportes del programa

### Vigilante
- `GET /reservations` - Ver todas las reservas (solo lectura)
- `GET /users` - Ver información de usuarios
- `GET /resources` - Ver información de recursos
- `GET /audit` - Ver logs de auditoría

### Administrativo General
- `GET /reservations` - Ver y modificar reservas
- `GET /resources` - Ver y modificar recursos
- `GET /reports` - Generar reportes operativos

## Validación de Asignación de Roles

El sistema incluye validaciones para la asignación de roles:

```typescript
// Solo administradores generales pueden asignar cualquier rol
// Administradores de programa solo pueden asignar roles de menor jerarquía
const canAssign = RoleUtils.validateRoleAssignment(
  assignerRole,
  targetRole,
  programContext
);
```

## Migración y Compatibilidad

### Re-exportación para Compatibilidad

El enum `UserRole` se re-exporta desde `@apps/auth-service/domain/entities/user.entity.ts` para mantener compatibilidad con controladores existentes:

```typescript
// Importación desde auth service (compatibilidad)
import { UserRole } from '@apps/auth-service/domain/entities/user.entity';

// Importación desde librería común (recomendado)
import { UserRole } from '@libs/common';
```

### Actualización de Controladores

Para actualizar controladores existentes:

1. Cambiar imports a `@libs/common`
2. Usar constantes del enum `UserRole`
3. Aplicar decorador `@Roles()` con roles apropiados
4. Implementar filtrado de datos basado en roles

## Ejemplos de Implementación

### Guard de Roles Personalizado

```typescript
@Injectable()
export class CustomRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Verificar si el usuario puede modificar recursos
    return RoleUtils.canModifyResources(user.role);
  }
}
```

### Servicio con Control de Acceso

```typescript
@Injectable()
export class ReservationService {
  async getReservations(user: any, filters: any) {
    // Filtrar consulta basado en el rol
    const filteredQuery = RoleUtils.filterUserQuery(
      user.role,
      user.id,
      filters
    );
    
    return this.repository.findMany(filteredQuery);
  }
}
```

## Consideraciones de Seguridad

1. **Principio de Menor Privilegio**: Cada rol tiene solo los permisos mínimos necesarios
2. **Validación en Múltiples Capas**: Guards, servicios y repositorios validan permisos
3. **Auditoría Completa**: Todas las acciones se registran con contexto de usuario y rol
4. **Separación de Responsabilidades**: Roles académicos vs administrativos vs seguridad

## Pruebas

### Pruebas de Roles

```typescript
describe('RoleUtils', () => {
  it('should validate teacher permissions', () => {
    expect(RoleUtils.hasPermission(
      UserRole.TEACHER, 
      'reservations', 
      'approve', 
      'program'
    )).toBe(true);
  });
  
  it('should restrict student access', () => {
    expect(RoleUtils.hasPermission(
      UserRole.STUDENT, 
      'users', 
      'read', 
      'global'
    )).toBe(false);
  });
});
```

Este sistema de roles estandarizado garantiza un control de acceso consistente, seguro y escalable en toda la aplicación Bookly.
