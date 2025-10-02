# Bookly Availability Service - Documentación Técnica

## 📅 Overview

El **Availability Service** es el microservicio central del sistema Bookly que gestiona la disponibilidad de recursos, reservas, horarios y eventos relacionados. Implementa arquitectura hexagonal con CQRS y Event-Driven Architecture para garantizar escalabilidad y mantenibilidad.

### 🎯 Características Principales

- **RF-07**: Configuración de horarios disponibles para recursos
- **RF-08**: Integración bidireccional con calendarios externos (Google Calendar, Outlook)
- **RF-09**: Búsqueda avanzada de recursos con filtros múltiples y scoring
- **RF-10**: Visualización interactiva en formato calendario con navegación temporal
- **RF-11**: Registro completo del historial de uso con métricas detalladas
- **RF-12**: Reservas periódicas y recurrentes con patrones flexibles
- **RF-13**: Gestión inteligente de modificaciones y cancelaciones
- **RF-14**: Sistema automático de lista de espera con priorización
- **RF-15**: Reasignación inteligente de recursos basada en disponibilidad
- **RF-16**: Detección y resolución automática de conflictos de disponibilidad
- **RF-17**: Gestión de disponibilidad diferenciada por perfil de usuario
- **RF-18**: Compatibilidad con eventos institucionales y bloqueos programados
- **RF-19**: Interfaz de consulta accesible y responsive con soporte móvil

### Información de Servicio

- **Puerto**: `3003` (desarrollo) / `3000` (producción vía API Gateway)
- **Health Check**: `GET /api/v1/availability/health`
- **Documentación Swagger**: `GET /api/v1/availability/docs`
- **Métricas Prometheus**: `GET /api/v1/availability/metrics`
- **WebSocket**: `ws://localhost:3003/availability-events`

### 🏗️ Arquitectura

Implementa **Clean Architecture** con separación de responsabilidades siguiendo patrones hexagonales:

```
src/apps/availability-service/
├── domain/
│   ├── entities/           # Reservation, TimeSlot, WaitingListEntry
│   ├── value-objects/      # DateRange, RecurrencePattern
│   ├── events/            # ReservationCreated, SlotBecameAvailable
│   ├── interfaces/        # Repositorios y servicios de dominio
│   └── exceptions/        # Excepciones específicas del dominio
├── application/
│   ├── commands/          # CreateReservation, CancelReservation
│   ├── queries/           # GetAvailability, FindByDateRange
│   ├── handlers/          # Command/Query handlers CQRS
│   ├── use-cases/         # Lógica de aplicación
│   └── dto/              # Data Transfer Objects
├── infrastructure/
│   ├── controllers/       # REST endpoints y WebSocket
│   ├── repositories/      # Implementaciones Prisma
│   ├── external/         # Google Calendar, Microsoft Graph
│   ├── messaging/        # RabbitMQ publishers/subscribers
│   ├── cache/           # Redis cache para disponibilidad
│   └── config/          # Configuración de módulo
├── config/               # Variables de entorno
└── test/                # Pruebas BDD con Jasmine
```

---

## 🚀 Stack Tecnológico

### Backend Core

- **NestJS**: Framework principal con decoradores y DI
- **Prisma**: ORM sobre MongoDB con type safety
- **MongoDB**: Base de datos NoSQL
- **TypeScript**: Tipado estático

### Integraciones

- **Google Calendar API**: Sincronización bidireccional
- **Microsoft Graph API**: Integración Outlook
- **WebSocket**: Eventos en tiempo real
- **RabbitMQ**: Eventos asíncronos distribuidos
- **Redis**: Cache de disponibilidad

### Observabilidad

- **Winston**: Logging estructurado
- **OpenTelemetry**: Trazabilidad distribuida
- **Sentry**: Captura de errores
- **Swagger**: Documentación automática

---

## 🌐 Requerimientos Funcionales Detallados

### RF-07: Configuración de Horarios Disponibles

- Definir horarios específicos por recurso y día de la semana
- Configuración de excepciones y bloqueos temporales
- Gestión de horarios especiales para eventos institucionales
- Validación automática de solapamientos y conflictos

### RF-08: Integración con Calendarios Externos

- Sincronización bidireccional con Google Calendar y Outlook
- Detección automática de eventos y ocupaciones externas
- Gestión de credenciales OAuth2 seguras
- Resolución de conflictos entre calendarios múltiples

### RF-09: Búsqueda Avanzada de Recursos

- Filtros por capacidad, equipamiento, ubicación y disponibilidad
- Sistema de scoring para resultados óptimos
- Búsqueda semántica por características técnicas
- Sugerencias alternativas inteligentes

### RF-10: Visualización en Calendario Interactivo

- Vista mensual, semanal y diaria con navegación fluida
- Representación visual de disponibilidad en tiempo real
- Drag & drop para modificación rápida de reservas
- Integración responsive para dispositivos móviles

### RF-11: Historial de Uso Detallado

- Registro completo de todas las reservas y modificaciones
- Métricas de utilización por recurso y período
- Análisis de patrones de uso para optimización
- Exportación de datos históricos en múltiples formatos

### RF-12: Reservas Periódicas y Recurrentes

- Patrones de recurrencia flexibles (diario, semanal, mensual)
- Gestión de excepciones en series recurrentes
- Modificación en lote de reservas relacionadas
- Validación de disponibilidad para toda la serie

---

## 🚀 Stack Tecnológico

### Backend Core

- **NestJS 10.x**: Framework principal con arquitectura modular
- **Prisma 5.x**: ORM con generación de tipos automática
- **MongoDB 7.x**: Base de datos NoSQL con replica set
- **TypeScript 5.x**: Tipado estático y desarrollo moderno

### Integraciones Externas

- **Google Calendar API v3**: Sincronización bidireccional de eventos
- **Microsoft Graph API**: Integración con Outlook y Office 365
- **Redis 7.x**: Cache distribuido para consultas de disponibilidad
- **RabbitMQ 3.x**: Mensajería asíncrona y eventos distribuidos

### Observabilidad y Monitoreo

- **Winston 3.x**: Logging estructurado con rotación automática
- **OpenTelemetry**: Trazas distribuidas y métricas de rendimiento
- **Sentry**: Captura y análisis de errores en producción
- **Swagger/OpenAPI**: Documentación automática de APIs

---

## 🌐 API REST Endpoints

### Gestión de Reservas

#### `POST /api/v1/reservations`
**Crear nueva reserva**

```json
// Request Body
{
  "resourceId": "resource-uuid",
  "userId": "user-uuid",
  "startDate": "2025-01-15T09:00:00Z",
  "endDate": "2025-01-15T11:00:00Z",
  "purpose": "Clase de Programación Avanzada",
  "attendeesCount": 25,
  "specialRequirements": ["projector", "microphone"]
}

// Response
{
  "success": true,
  "data": {
    "id": "reservation-uuid",
    "status": "pending_approval",
    "confirmationCode": "BKL-789456",
    "createdAt": "2025-01-10T14:30:00Z",
    "estimatedApprovalTime": "2-4 hours"
  },
  "message": "Reserva creada exitosamente"
}
```

#### `GET /api/v1/availability/check`
**Verificar disponibilidad de recursos**

```json
// Query Parameters
// ?resourceId=uuid&startDate=2025-01-15T09:00:00Z&endDate=2025-01-15T11:00:00Z&includeAlternatives=true

// Response
{
  "success": true,
  "data": {
    "available": true,
    "resourceId": "resource-uuid",
    "requestedSlot": {
      "startDate": "2025-01-15T09:00:00Z",
      "endDate": "2025-01-15T11:00:00Z"
    },
    "conflicts": [],
    "alternativeSlots": [
      {
        "startDate": "2025-01-15T13:00:00Z",
        "endDate": "2025-01-15T15:00:00Z",
        "score": 95
      }
    ],
    "resourceUtilization": 0.75
  }
}
```

### Reservas Recurrentes

#### `POST /api/v1/reservations/recurring`
**Crear serie de reservas recurrentes**

```json
// Request Body
{
  "resourceId": "resource-uuid",
  "userId": "user-uuid",
  "startDate": "2025-01-15T09:00:00Z",
  "endDate": "2025-01-15T11:00:00Z",
  "purpose": "Clase semanal de Base de Datos",
  "recurrencePattern": {
    "frequency": "weekly",
    "daysOfWeek": ["monday", "wednesday"],
    "interval": 1,
    "endDate": "2025-05-15T23:59:59Z",
    "exceptions": ["2025-03-15T09:00:00Z"]
  }
}

// Response
{
  "success": true,
  "data": {
    "seriesId": "series-uuid",
    "totalReservations": 24,
    "confirmedReservations": 22,
    "conflictingDates": ["2025-02-17T09:00:00Z"],
    "alternativesOffered": 2
  }
}
```

### Lista de Espera

#### `POST /api/v1/waiting-list`
**Unirse a lista de espera**

```json
// Request Body
{
  "resourceId": "resource-uuid",
  "userId": "user-uuid",
  "preferredStartDate": "2025-01-15T09:00:00Z",
  "preferredEndDate": "2025-01-15T11:00:00Z",
  "priority": "high",
  "flexibilityHours": 2,
  "alternativeDays": ["tuesday", "thursday"]
}

// Response
{
  "success": true,
  "data": {
    "id": "waiting-list-entry-uuid",
    "position": 3,
    "estimatedWaitTime": "2-3 days",
    "notificationPreferences": {
      "email": true,
      "sms": false,
      "whatsapp": true
    }
  }
}
```

### Integración de Calendarios

#### `POST /api/v1/calendar/integrations`
**Crear integración con calendario externo**

```json
// Request Body
{
  "userId": "user-uuid",
  "calendarType": "google",
  "credentials": {
    "accessToken": "google-access-token",
    "refreshToken": "google-refresh-token"
  },
  "syncPreferences": {
    "bidirectional": true,
    "autoSync": true,
    "conflictResolution": "bookly_priority",
    "syncFrequency": "hourly"
  }
}

// Response
{
  "success": true,
  "data": {
    "integrationId": "integration-uuid",
    "status": "active",
    "lastSync": "2025-01-15T10:30:00Z",
    "syncedEvents": 15
  }
}
```

### Búsqueda Avanzada

#### `GET /api/v1/resources/search`
**Búsqueda inteligente de recursos**

```json
// Query Parameters
// ?startDate=2025-01-15T09:00:00Z&endDate=2025-01-15T11:00:00Z&capacity=25&equipment=projector&location=building-a&sortBy=score

// Response
{
  "success": true,
  "data": {
    "results": [
      {
        "resourceId": "resource-uuid",
        "resourceName": "Aula 201",
        "capacity": 30,
        "equipment": ["projector", "microphone", "speakers"],
        "location": {
          "building": "Edificio A",
          "floor": 2,
          "room": "201"
        },
        "availability": {
          "status": "available",
          "nextOccupied": "2025-01-15T14:00:00Z"
        },
        "score": 95,
        "matchReasons": ["exact_capacity_match", "equipment_available"]
      }
    ],
    "totalResults": 8,
    "searchCriteria": {
      "appliedFilters": 4,
      "searchTime": "45ms"
    }
  }
}
```

---

## 📡 Event-Driven Architecture

### Eventos Publicados

```typescript
// Eventos que publica este servicio
export class ReservationCreatedEvent {
  constructor(
    public readonly reservationId: string,
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}

export class AvailabilityChangedEvent {
  constructor(
    public readonly resourceId: string,
    public readonly availableSlots: TimeSlot[],
    public readonly changedBy: string
  ) {}
}

export class WaitingListPromotedEvent {
  constructor(
    public readonly entryId: string,
    public readonly userId: string,
    public readonly resourceId: string,
    public readonly newSlot: TimeSlot
  ) {}
}
```

### Eventos Consumidos

```typescript
// Eventos de otros servicios que este servicio consume
@EventsHandler(ResourceUpdatedEvent)
export class ResourceUpdatedHandler implements IEventHandler<ResourceUpdatedEvent> {
  async handle(event: ResourceUpdatedEvent) {
    // Actualizar información de disponibilidad cuando el recurso cambie
    await this.availabilityService.updateResourceInfo(event.resourceId, event.updates);
  }
}

@EventsHandler(ReservationApprovedEvent)
export class ReservationApprovedHandler implements IEventHandler<ReservationApprovedEvent> {
  async handle(event: ReservationApprovedEvent) {
    // Confirmar reserva y actualizar disponibilidad
    await this.availabilityService.confirmReservation(event.reservationId);
  }
}
```

### WebSocket en Tiempo Real

```typescript
// Eventos disponibles para clientes WebSocket
const WEBSOCKET_EVENTS = {
  RESERVATION_CREATED: 'reservation-created',
  RESERVATION_UPDATED: 'reservation-updated', 
  SLOT_BECAME_AVAILABLE: 'slot-became-available',
  WAITING_LIST_POSITION_CHANGED: 'waiting-list-position-changed',
  RESOURCE_AVAILABILITY_CHANGED: 'resource-availability-changed'
};

// Suscripción del cliente
socket.on('reservation-created', (data) => {
  console.log('Nueva reserva:', data.reservationId);
  updateCalendarView(data);
});

socket.on('slot-became-available', (data) => {
  console.log('Slot disponible:', data.resourceName);
  showAvailabilityNotification(data);
});

// Suscribirse a recursos específicos
socket.emit('join-resource-room', { resourceIds: ['resource-uuid-1', 'resource-uuid-2'] });
```

---

## 🗄️ Modelo de Base de Datos

### Esquemas Prisma Principales

```typescript
model Reservation {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  resourceId        String   @db.ObjectId
  userId            String   @db.ObjectId
  startDate         DateTime
  endDate           DateTime
  status            ReservationStatus @default(PENDING)
  purpose           String
  attendeesCount    Int?
  specialRequirements String[]
  confirmationCode  String   @unique
  recurrenceSeriesId String? @db.ObjectId
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  resource         Resource @relation(fields: [resourceId], references: [id])
  user            User     @relation(fields: [userId], references: [id])
  recurrenceSeries RecurrenceSeries? @relation(fields: [recurrenceSeriesId], references: [id])
  
  @@map("reservations")
}

model WaitingListEntry {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  resourceId        String   @db.ObjectId
  userId            String   @db.ObjectId
  preferredStartDate DateTime
  preferredEndDate   DateTime
  priority          WaitingListPriority @default(NORMAL)
  position          Int
  flexibilityHours  Int      @default(0)
  alternativeDays   String[]
  status            WaitingListStatus @default(ACTIVE)
  createdAt         DateTime @default(now())
  
  // Relations
  resource         Resource @relation(fields: [resourceId], references: [id])
  user            User     @relation(fields: [userId], references: [id])
  
  @@map("waiting_list_entries")
}

model CalendarIntegration {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  userId            String   @db.ObjectId
  calendarType      CalendarType
  accessToken       String
  refreshToken      String?
  syncPreferences   Json
  status            IntegrationStatus @default(ACTIVE)
  lastSync          DateTime?
  createdAt         DateTime @default(now())
  
  // Relations
  user             User     @relation(fields: [userId], references: [id])
  
  @@map("calendar_integrations")
}

enum ReservationStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
  COMPLETED
}

enum WaitingListPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum CalendarType {
  GOOGLE
  OUTLOOK
  APPLE
}
```

---

## 🔐 Autenticación y Autorización

### Roles y Permisos

```typescript
// Permisos específicos del Availability Service
export const AVAILABILITY_PERMISSIONS = {
  // Reservas
  CREATE_RESERVATION: 'availability:reservations:create',
  VIEW_OWN_RESERVATIONS: 'availability:reservations:view:own',
  VIEW_ALL_RESERVATIONS: 'availability:reservations:view:all',
  MODIFY_OWN_RESERVATION: 'availability:reservations:modify:own',
  MODIFY_ALL_RESERVATIONS: 'availability:reservations:modify:all',
  CANCEL_OWN_RESERVATION: 'availability:reservations:cancel:own',
  CANCEL_ALL_RESERVATIONS: 'availability:reservations:cancel:all',
  
  // Disponibilidad
  VIEW_AVAILABILITY: 'availability:view',
  CONFIGURE_AVAILABILITY: 'availability:configure',
  OVERRIDE_AVAILABILITY: 'availability:override',
  
  // Búsqueda
  SEARCH_RESOURCES: 'availability:search:basic',
  ADVANCED_SEARCH: 'availability:search:advanced',
  
  // Lista de espera
  JOIN_WAITING_LIST: 'availability:waiting-list:join',
  MANAGE_WAITING_LIST: 'availability:waiting-list:manage',
  
  // Integraciones
  SETUP_CALENDAR_INTEGRATION: 'availability:calendar:setup',
  MANAGE_INTEGRATIONS: 'availability:calendar:manage'
} as const;

// Configuración de roles por defecto
export const ROLE_PERMISSIONS = {
  STUDENT: [
    AVAILABILITY_PERMISSIONS.CREATE_RESERVATION,
    AVAILABILITY_PERMISSIONS.VIEW_OWN_RESERVATIONS,
    AVAILABILITY_PERMISSIONS.MODIFY_OWN_RESERVATION,
    AVAILABILITY_PERMISSIONS.CANCEL_OWN_RESERVATION,
    AVAILABILITY_PERMISSIONS.VIEW_AVAILABILITY,
    AVAILABILITY_PERMISSIONS.SEARCH_RESOURCES,
    AVAILABILITY_PERMISSIONS.JOIN_WAITING_LIST,
    AVAILABILITY_PERMISSIONS.SETUP_CALENDAR_INTEGRATION
  ],
  TEACHER: [
    ...ROLE_PERMISSIONS.STUDENT,
    AVAILABILITY_PERMISSIONS.ADVANCED_SEARCH,
    AVAILABILITY_PERMISSIONS.OVERRIDE_AVAILABILITY
  ],
  ADMIN: [
    ...AVAILABILITY_PERMISSIONS,
    AVAILABILITY_PERMISSIONS.VIEW_ALL_RESERVATIONS,
    AVAILABILITY_PERMISSIONS.MODIFY_ALL_RESERVATIONS,
    AVAILABILITY_PERMISSIONS.CANCEL_ALL_RESERVATIONS,
    AVAILABILITY_PERMISSIONS.CONFIGURE_AVAILABILITY,
    AVAILABILITY_PERMISSIONS.MANAGE_WAITING_LIST,
    AVAILABILITY_PERMISSIONS.MANAGE_INTEGRATIONS
  ]
};
```

---

## 🔧 Variables de Entorno

```bash
# Configuración del Servicio
PORT=3003
NODE_ENV=production
SERVICE_NAME="availability-service"

# Base de Datos
DATABASE_URL="mongodb://bookly:bookly123@mongodb-primary:27017,mongodb-secondary1:27017,mongodb-secondary2:27017/bookly?replicaSet=bookly-rs&authSource=admin"

# Cache Redis
REDIS_URL="redis://redis:6379"
REDIS_TTL_AVAILABILITY=300
REDIS_TTL_SEARCH_RESULTS=60

# Mensajería RabbitMQ
RABBITMQ_URL="amqp://bookly:bookly123@rabbitmq:5672"
RABBITMQ_EXCHANGE_AVAILABILITY="availability.events"
RABBITMQ_QUEUE_AVAILABILITY="availability.queue"

# APIs Externas
# Google Calendar API
GOOGLE_CALENDAR_CLIENT_ID="your-google-client-id"
GOOGLE_CALENDAR_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALENDAR_REDIRECT_URI="http://localhost:3003/auth/google/callback"

# Microsoft Graph API
MICROSOFT_GRAPH_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_GRAPH_CLIENT_SECRET="your-microsoft-client-secret"
MICROSOFT_GRAPH_REDIRECT_URI="http://localhost:3003/auth/microsoft/callback"

# Autenticación
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="24h"

# Observabilidad
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"
OTEL_EXPORTER_OTLP_ENDPOINT="http://otel-collector:4317"
LOG_LEVEL="info"
METRICS_PORT=9090

# Configuraciones específicas
MAX_RESERVATION_DURATION_HOURS=8
MAX_ADVANCE_BOOKING_DAYS=30
WAITING_LIST_MAX_SIZE=50
CALENDAR_SYNC_INTERVAL_MINUTES=15
AUTO_CANCEL_UNCONFIRMED_MINUTES=120
```

---

## 📊 Observabilidad y Monitoreo

### Logging Estructurado

```typescript
@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);
  
  async createReservation(command: CreateReservationCommand) {
    this.logger.log('Reservation creation started', {
      resourceId: command.resourceId,
      userId: command.userId,
      startDate: command.startDate.toISOString(),
      correlationId: command.correlationId
    });
    
    try {
      // Validar disponibilidad
      const isAvailable = await this.checkAvailability(command);
      if (!isAvailable) {
        throw new ResourceNotAvailableException(command.resourceId);
      }
      
      const reservation = await this.processReservation(command);
      
      this.logger.log('Reservation created successfully', {
        reservationId: reservation.id,
        confirmationCode: reservation.confirmationCode,
        duration: Date.now() - command.timestamp
      });
      
      return reservation;
    } catch (error) {
      this.logger.error('Reservation creation failed', {
        error: error.message,
        resourceId: command.resourceId,
        stackTrace: error.stack
      });
      throw error;
    }
  }
}
```

### Métricas Personalizadas

```typescript
// Métricas específicas del servicio
export const AVAILABILITY_METRICS = {
  RESERVATIONS_CREATED: 'bookly_availability_reservations_created_total',
  RESERVATIONS_CANCELLED: 'bookly_availability_reservations_cancelled_total',
  AVAILABILITY_CHECKS: 'bookly_availability_checks_total',
  SEARCH_QUERIES: 'bookly_availability_search_queries_total',
  WAITING_LIST_JOINS: 'bookly_availability_waiting_list_joins_total',
  CALENDAR_SYNCS: 'bookly_availability_calendar_syncs_total',
  RESOURCE_UTILIZATION: 'bookly_availability_resource_utilization_ratio'
};

@Injectable()
export class AvailabilityMetricsService {
  constructor(
    @Inject('PROMETHEUS_REGISTRY') private readonly registry: Registry
  ) {
    this.initializeMetrics();
  }
  
  private initializeMetrics() {
    // Contador de reservas creadas
    new Counter({
      name: AVAILABILITY_METRICS.RESERVATIONS_CREATED,
      help: 'Total number of reservations created',
      labelNames: ['resource_type', 'user_role', 'status'],
      registers: [this.registry]
    });
    
    // Histograma de tiempo de respuesta de búsquedas
    new Histogram({
      name: 'bookly_availability_search_duration_seconds',
      help: 'Duration of search operations',
      labelNames: ['search_type', 'result_count_range'],
      registers: [this.registry]
    });
  }
}
```

### Códigos de Error Estandarizados

```typescript
export const AVAILABILITY_ERROR_CODES = {
  // Reservas
  RESOURCE_NOT_AVAILABLE: 'AVAIL-0001',
  CONFLICT_DETECTED: 'AVAIL-0002',
  RESERVATION_NOT_FOUND: 'AVAIL-0003',
  INVALID_TIME_SLOT: 'AVAIL-0004',
  MAX_DURATION_EXCEEDED: 'AVAIL-0005',
  
  // Lista de espera
  WAITING_LIST_FULL: 'AVAIL-0010',
  WAITING_LIST_ENTRY_NOT_FOUND: 'AVAIL-0011',
  ALREADY_IN_WAITING_LIST: 'AVAIL-0012',
  
  // Calendarios
  CALENDAR_SYNC_FAILED: 'AVAIL-0020',
  CALENDAR_AUTH_EXPIRED: 'AVAIL-0021',
  CALENDAR_INTEGRATION_NOT_FOUND: 'AVAIL-0022',
  
  // Búsqueda
  SEARCH_CRITERIA_INVALID: 'AVAIL-0030',
  SEARCH_TIMEOUT: 'AVAIL-0031'
} as const;

// Estructura estándar de respuesta de error
export interface AvailabilityErrorResponse {
  code: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  details?: any;
  suggestions?: Array<{
    action: string;
    description: string;
  }>;
  http_code: number;
}

// Ejemplo de respuesta de error
{
  "code": "AVAIL-0002",
  "message": "Se detectó un conflicto con otra reserva existente",
  "type": "error",
  "details": {
    "conflictingReservations": [
      {
        "id": "reservation-uuid",
        "startDate": "2025-01-15T09:00:00Z",
        "endDate": "2025-01-15T11:00:00Z",
        "user": "John Doe"
      }
    ]
  },
  "suggestions": [
    {
      "action": "join_waiting_list",
      "description": "Unirse a la lista de espera para este horario"
    },
    {
      "action": "select_alternative",
      "description": "Seleccionar uno de los horarios alternativos sugeridos"
    }
  ],
  "http_code": 409
}
```


---

## 🧪 Testing

### Estructura de Pruebas BDD con Jasmine

```typescript
// test/integration/reservation-creation.spec.ts
describe('Feature: Reservation Creation', () => {
  describe('Scenario: Create reservation for available resource', () => {
    describe('Given a valid time slot and available resource', () => {
      beforeEach(async () => {
        // Setup test data
        await testSetup.seedAvailableResource();
        await testSetup.clearExistingReservations();
      });
      
      it('When user creates reservation, Then should return confirmation', async () => {
        // Arrange
        const command = new CreateReservationCommand({
          resourceId: 'test-resource-uuid',
          userId: 'test-user-uuid',
          startDate: new Date('2025-01-15T09:00:00Z'),
          endDate: new Date('2025-01-15T11:00:00Z'),
          purpose: 'Test reservation'
        });
      
        
        // Act
        const result = await reservationService.create(command);
        
        // Assert
        expect(result).toHaveProperty('confirmationCode');
        expect(result.status).toBe('pending_approval');
        expect(result.id).toBeDefined();
        expect(result.createdAt).toBeInstanceOf(Date);
      });
    });
    
    describe('Given conflicting reservation exists', () => {
      it('When user attempts reservation, Then should return conflict error', async () => {
        // Arrange
        await testSetup.createConflictingReservation();
        
        // Act & Assert
        await expect(
          reservationService.create(conflictingCommand)
        ).rejects.toThrow('AVAIL-0002');
      });
    });
  });
  
  describe('Scenario: Join waiting list when resource unavailable', () => {
    it('When resource is booked, Then user can join waiting list', async () => {
      // BDD test implementation
    });
  });
});
```

### Comandos de Testing

```bash
# Ejecutar todas las pruebas
npm run test

# Ejecutar pruebas con cobertura
npm run test:cov

# Ejecutar pruebas BDD específicas
npm run test:bdd

# Ejecutar pruebas de integración
npm run test:integration

# Ejecutar pruebas end-to-end
npm run test:e2e

# Modo watch para desarrollo
npm run test:watch
```

---

## 🚀 Deployment

### Docker

```dockerfile
# Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
COPY prisma/ ./prisma/
RUN npm ci --only=production && npm cache clean --force

# Generar cliente Prisma
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Etapa de producción
FROM node:22-alpine AS production

WORKDIR /app

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copiar archivos necesarios
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs

EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/infrastructure/health/health-check.js

CMD ["node", "dist/main.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  availability-service:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - RABBITMQ_URL=${RABBITMQ_URL}
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - bookly-network
    restart: unless-stopped
    
    # Resource limits
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: availability-service
  namespace: bookly
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: availability-service
  template:
    metadata:
      labels:
        app: availability-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
    spec:
      containers:
      - name: availability-service
        image: bookly/availability-service:latest
        ports:
        - containerPort: 3003
          name: http
        - containerPort: 9090
          name: metrics
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: bookly-secrets
              key: database-url
        livenessProbe:
          httpGet:
            path: /api/v1/availability/health
            port: 3003
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/availability/ready
            port: 3003
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: availability-service
  namespace: bookly
spec:
  selector:
    app: availability-service
  ports:
  - name: http
    port: 80
    targetPort: 3003
  - name: metrics
    port: 9090
    targetPort: 9090
```

---

## 📚 Referencias y Enlaces Útiles

### Documentación Técnica

- **[NestJS Documentation](https://docs.nestjs.com/)** - Framework principal
- **[Prisma Documentation](https://www.prisma.io/docs/)** - ORM y base de datos
- **[MongoDB Documentation](https://docs.mongodb.com/)** - Base de datos NoSQL
- **[Redis Documentation](https://redis.io/documentation)** - Cache en memoria
- **[RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)** - Mensajería asíncrona

### APIs Externas

- **[Google Calendar API](https://developers.google.com/calendar/api)** - Integración de calendarios
- **[Microsoft Graph API](https://docs.microsoft.com/en-us/graph/)** - Integración Office 365
- **[OpenTelemetry](https://opentelemetry.io/docs/)** - Observabilidad distribuida
- **[Sentry Documentation](https://docs.sentry.io/)** - Monitoreo de errores

### Arquitectura y Patrones

- **[Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)** - Principios arquitectónicos
- **[CQRS Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)** - Command Query Responsibility Segregation
- **[Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)** - Arquitectura orientada a eventos
- **[Hexagonal Architecture](https://netflixtechblog.com/ready-for-changes-with-hexagonal-architecture-b315ec967749)** - Puertos y adaptadores

### Testing y Calidad

- **[Jasmine Documentation](https://jasmine.github.io/)** - Framework de testing BDD
- **[Jest Documentation](https://jestjs.io/docs/getting-started)** - Testing framework
- **[SonarQube](https://docs.sonarqube.org/)** - Análisis de calidad de código

---

**Documento**: README.md - Availability Service  
**Última actualización**: 31 de Agosto, 2025  
**Versión**: 2.0.0  
**Autor**: Equipo de Desarrollo Bookly  
**Revisor**: Arquitecto de Sistemas  
**Estado**: ✅ Documentación Completa y Validada

*Universidad Francisco de Paula Santander - Sistema Bookly de Reservas Institucionales*
