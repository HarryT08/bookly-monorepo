# Resources Service - Hito 1 Architecture Documentation

## Extensiones al Diagrama de Clases

### Modelo Resource Extendido

El modelo `Resource` ha sido extendido con los siguientes campos para cumplir con los requerimientos del Hito 1:

```typescript
interface Resource {
  // Campos base del diagrama original
  id: string
  name: string
  description?: string
  type: string
  capacity?: number
  location?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  
  // EXTENSIONES PARA HITO 1:
  
  // RF-03: Atributos esenciales
  code: string                    // Código único autogenerado (formato: TYPE-YYYYMMDD-HHMMSS-XXX)
  status: string                  // Estado del recurso: AVAILABLE, MAINTENANCE, OUT_OF_SERVICE, RESERVED
  
  // RF-05: Reglas de disponibilidad
  availableSchedules?: {
    operatingHours: {
      dayOfWeek: number           // 0-6 (Domingo a Sábado)
      startTime: string           // Formato HH:mm
      endTime: string             // Formato HH:mm
    }[]
    restrictions: {
      userTypes?: string[]        // Tipos de usuario permitidos
      maxReservationDuration?: number  // Duración máxima en minutos
      minReservationDuration?: number  // Duración mínima en minutos
      maxAdvanceReservation?: number   // Días máximos de anticipación
      minAdvanceReservation?: number   // Horas mínimas de anticipación
    }
    priorities: {
      userType: string            // Tipo de usuario
      priority: number            // Prioridad (mayor número = mayor prioridad)
    }[]
  }
  
  // Atributos flexibles para diferentes tipos de recursos
  attributes?: {
    [key: string]: any
    // Ejemplos comunes:
    hasProjector?: boolean
    hasWhiteboard?: boolean
    hasComputers?: boolean
    computerCount?: number
    hasAirConditioning?: boolean
    hasAudioSystem?: boolean
    floor?: string
    building?: string
    room?: string
  }
}
```

### Nuevas Entidades y Componentes

#### 1. ResourceEntity (Domain)
- **Propósito**: Entidad de dominio que encapsula la lógica de negocio
- **Responsabilidades**:
  - Validación de datos del recurso
  - Generación automática de códigos únicos
  - Lógica de disponibilidad y reglas de reserva
  - Operaciones de soft/hard delete

#### 2. ResourceRepository (Domain Interface)
- **Propósito**: Contrato para persistencia de recursos
- **Métodos principales**:
  - CRUD operations
  - Búsqueda y filtrado
  - Verificación de relaciones activas
  - Paginación

#### 3. PrismaResourceRepository (Infrastructure)
- **Propósito**: Implementación concreta del repositorio usando Prisma
- **Características**:
  - Mapeo entre entidades de dominio y modelos de Prisma
  - Consultas optimizadas
  - Manejo de transacciones

#### 4. CQRS Commands y Queries
**Commands (Escritura):**
- `CreateResourceCommand`: Crear nuevo recurso
- `UpdateResourceCommand`: Actualizar recurso existente
- `DeleteResourceCommand`: Eliminar recurso (soft/hard)

**Queries (Lectura):**
- `GetResourceQuery`: Obtener recurso por ID
- `GetResourceByCodeQuery`: Obtener recurso por código
- `GetResourcesQuery`: Listar recursos con filtros
- `GetResourcesWithPaginationQuery`: Listar con paginación
- `SearchResourcesQuery`: Búsqueda por texto
- `CheckResourceAvailabilityQuery`: Verificar disponibilidad

#### 5. Command y Query Handlers
- Implementan la lógica de aplicación
- Integran logging estructurado
- Publican eventos de dominio
- Manejan errores y validaciones

#### 6. ResourcesController (Infrastructure)
- **Endpoints RESTful**:
  - `POST /resources` - Crear recurso
  - `GET /resources` - Listar recursos con filtros
  - `GET /resources/paginated` - Listar con paginación
  - `GET /resources/search` - Búsqueda
  - `GET /resources/:id` - Obtener por ID
  - `GET /resources/code/:code` - Obtener por código
  - `GET /resources/:id/availability` - Verificar disponibilidad
  - `PUT /resources/:id` - Actualizar recurso
  - `DELETE /resources/:id` - Eliminar recurso

### Patrones Arquitectónicos Implementados

#### 1. Arquitectura Hexagonal (Ports & Adapters)
```
Domain (Core)
├── Entities: ResourceEntity
├── Repositories: ResourceRepository (interface)
└── Value Objects: AvailableSchedule, ResourceAttributes

Application (Use Cases)
├── Commands: CreateResource, UpdateResource, DeleteResource
├── Queries: GetResource, GetResources, SearchResources, CheckAvailability
└── Handlers: Command/Query handlers

Infrastructure (Adapters)
├── Controllers: ResourcesController (REST API)
├── Repositories: PrismaResourceRepository (Database)
└── Events: Domain event publishing
```

#### 2. CQRS (Command Query Responsibility Segregation)
- **Separación clara** entre operaciones de escritura (Commands) y lectura (Queries)
- **Commands**: Modifican estado, publican eventos
- **Queries**: Solo lectura, optimizadas para consultas específicas

#### 3. Event-Driven Architecture
- **Eventos de dominio** publicados en operaciones críticas:
  - `ResourceCreated`
  - `ResourceUpdated`
  - `ResourceSoftDeleted`
  - `ResourceHardDeleted`

### Validaciones Implementadas

#### 1. Validaciones de Dominio (ResourceEntity)
- Campos obligatorios: name, type
- Tipos válidos: ROOM, EQUIPMENT, AUDITORIUM, LABORATORY, COMPUTER
- Estados válidos: AVAILABLE, MAINTENANCE, OUT_OF_SERVICE, RESERVED
- Capacidad no negativa

#### 2. Validaciones de DTO (Class-validator)
- Validación de entrada en endpoints REST
- Tipos de datos correctos
- Rangos válidos para horarios y duraciones

#### 3. Validaciones de Negocio
- Código único autogenerado
- Reglas de disponibilidad coherentes
- Verificación de relaciones antes de eliminación

### Cumplimiento de Requerimientos Funcionales

#### RF-01: Crear, editar y eliminar recursos ✅
- **Crear**: `CreateResourceCommand` + `CreateResourceHandler`
- **Editar**: `UpdateResourceCommand` + `UpdateResourceHandler`
- **Eliminar**: `DeleteResourceCommand` + `DeleteResourceHandler`
  - Soft delete cuando hay relaciones activas
  - Hard delete cuando no hay relaciones

#### RF-03: Definir atributos clave del recurso ✅
- **Atributos esenciales**: name, code, type, capacity, location, status
- **Código único**: Autogenerado con formato TYPE-YYYYMMDD-HHMMSS-XXX
- **Atributos flexibles**: Objeto JSON para propiedades específicas por tipo

#### RF-05: Configuración de reglas de disponibilidad ✅
- **Horarios de funcionamiento**: Por día de la semana
- **Restricciones**: Tipos de usuario, duración min/max, anticipación
- **Prioridades**: Por tipo de usuario
- **Validación**: Método `isAvailableForReservation()` en ResourceEntity

### Observabilidad y Logging

#### Logging Estructurado
- **Contexto**: Cada handler tiene su contexto específico
- **Metadatos**: IDs de recursos, operaciones, errores
- **Niveles**: Info para operaciones exitosas, Error para fallos

#### Eventos de Dominio
- **Trazabilidad**: Cada operación crítica publica eventos
- **Integración**: Preparado para consumo por otros servicios
- **Auditoría**: Registro completo de cambios

### Testing Strategy

#### 1. Pruebas E2E (BDD)
- **Given-When-Then**: Patrón BDD con Jasmine
- **Escenarios completos**: Desde HTTP request hasta base de datos
- **Cobertura**: Todos los requerimientos RF-01, RF-03, RF-05

#### 2. Casos de Prueba Principales
- Creación de recursos con datos válidos/inválidos
- Actualización de recursos existentes/inexistentes
- Eliminación con/sin relaciones activas
- Consulta por ID y código
- Verificación de reglas de disponibilidad
- Filtrado y búsqueda
- Paginación

### Extensibilidad

#### 1. Nuevos Tipos de Recursos
- Agregar al enum de tipos válidos
- Extender atributos específicos en `attributes`
- Mantener compatibilidad con lógica existente

#### 2. Nuevas Reglas de Disponibilidad
- Extender interfaz `AvailableSchedule`
- Agregar lógica en `isAvailableForReservation()`
- Mantener retrocompatibilidad

#### 3. Integración con Otros Servicios
- Eventos de dominio listos para consumo
- Interfaces bien definidas
- Separación clara de responsabilidades

Esta arquitectura cumple completamente con los requerimientos del Hito 1 y establece una base sólida para futuras extensiones del sistema Bookly.
