# HITO 2 - AVAILABILITY SERVICE
## Disponibilidad y Reservas Core

**Versión:** 1.0.0  
**Fecha:** 2025-09-01  
**Puerto:** 3002  
**Documentación API:** http://localhost:3002/api/docs  

---

## 📋 Resumen Ejecutivo

El Availability Service implementa la gestión completa de disponibilidad y reservas (RF-07 a RF-19) con integración de calendarios externos, búsqueda avanzada y manejo de conflictos. Incluye funcionalidades para horarios complejos, reservas periódicas, listas de espera y reasignación automática.

## 🏗️ Arquitectura

### Estructura de Directorio
```
src/apps/availability-service/
├── domain/
│   ├── entities/
│   │   ├── reservation.entity.ts           # Entidad principal de reservas
│   │   ├── schedule.entity.ts              # Entidad de horarios
│   │   ├── calendar-integration.entity.ts  # Integración calendarios
│   │   └── reservation-history.entity.ts   # Historial de reservas
│   ├── repositories/
│   │   ├── reservation.repository.ts       # Interface repositorio reservas
│   │   ├── schedule.repository.ts          # Interface repositorio horarios
│   │   └── calendar-integration.repository.ts
│   ├── services/
│   │   └── advanced-search-domain.service.ts # Lógica de búsqueda avanzada
│   └── events/
│       ├── reservation.events.ts           # Eventos de reservas
│       └── advanced-search.events.ts       # Eventos de búsqueda
├── application/
│   ├── commands/
│   │   ├── create-reservation.command.ts   # Comando crear reserva
│   │   ├── cancel-reservation.command.ts   # Comando cancelar reserva
│   │   ├── sync-calendar.command.ts        # Comando sincronizar calendario
│   │   └── create-calendar-integration.command.ts
│   ├── queries/
│   │   ├── get-availability.query.ts       # Query disponibilidad
│   │   ├── get-calendar-view.query.ts      # Query vista calendario
│   │   └── advanced-search.queries.ts      # Queries búsqueda avanzada
│   ├── handlers/
│   │   ├── reservation.handlers.ts         # Handlers de reservas
│   │   ├── calendar.handlers.ts            # Handlers de calendario
│   │   └── advanced-search.query-handlers.ts # Handlers búsqueda
│   ├── services/
│   │   ├── availability.service.ts         # Servicio principal
│   │   ├── calendar-integration.service.ts # Servicio calendarios
│   │   └── advanced-search.service.ts      # Servicio búsqueda avanzada
│   └── dto/
│       ├── reservation.dto.ts              # DTOs de reservas
│       ├── availability.dto.ts             # DTOs de disponibilidad
│       └── advanced-search.dto.ts          # DTOs de búsqueda
└── infrastructure/
    ├── controllers/
    │   ├── availability.controller.ts      # Controlador disponibilidad
    │   └── advanced-search.controller.ts   # Controlador búsqueda
    ├── repositories/
    │   ├── prisma-reservation.repository.ts # Implementación Prisma
    │   ├── prisma-schedule.repository.ts    # Implementación horarios
    │   └── prisma-calendar-integration.repository.ts
    ├── services/
    │   ├── google-calendar.service.ts      # Integración Google Calendar
    │   ├── outlook-calendar.service.ts     # Integración Outlook
    │   ├── ical.service.ts                 # Integración iCal
    │   └── internal-calendar.service.ts    # Calendario interno
    └── modules/
        ├── notification.module.ts          # Módulo notificaciones
        └── audit.module.ts                 # Módulo auditoría
```

### Patrones Arquitectónicos

#### Clean Architecture + CQRS
- **Domain Layer**: Lógica de negocio para reservas, disponibilidad y calendarios
- **Application Layer**: Casos de uso CQRS para reservas y búsquedas
- **Infrastructure Layer**: Integraciones con calendarios externos

#### Event-Driven Architecture
- **Reservation Events**: `ReservationCreated`, `ReservationCancelled`, `ConflictDetected`
- **Calendar Events**: `CalendarSynced`, `ExternalEventImported`
- **Search Events**: `SearchExecuted`, `PopularResourcesUpdated`

## 🚀 Funcionalidades Implementadas

### RF-07: Configurar horarios disponibles
- ✅ **Horarios Regulares**: Lunes a sábado con franjas horarias
- ✅ **Excepciones**: Días festivos, mantenimiento, eventos especiales
- ✅ **Recurrencia**: Patrones semanales, mensuales, personalizados
- ✅ **Restricciones**: Por tipo de usuario, rol, programa académico

```typescript
// Ejemplo de configuración de horario
{
  "resourceId": "uuid-aula-101",
  "scheduleType": "REGULAR",
  "recurrencePattern": "WEEKLY",
  "weekdays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  "timeSlots": [
    {
      "startTime": "06:00",
      "endTime": "22:00",
      "restrictions": ["ACADEMIC_USE_ONLY"]
    }
  ],
  "exceptions": [
    {
      "date": "2025-12-25",
      "type": "HOLIDAY",
      "description": "Navidad"
    }
  ]
}
```

### RF-08: Integración con calendarios
- ✅ **Google Calendar**: OAuth2 + Calendar API v3
- ✅ **Microsoft Outlook**: Graph API + Exchange
- ✅ **iCal/CalDAV**: Estándar RFC 5545
- ✅ **Calendario Interno**: Sistema nativo Bookly

```typescript
// Configuración de integración
{
  "id": "uuid-integration",
  "type": "GOOGLE_CALENDAR",
  "resourceId": "uuid-recurso",
  "externalCalendarId": "calendar@gmail.com",
  "syncDirection": "BIDIRECTIONAL",
  "credentials": {
    "accessToken": "encrypted-token",
    "refreshToken": "encrypted-refresh",
    "expiresAt": "2025-09-01T23:45:00Z"
  },
  "syncSettings": {
    "autoSync": true,
    "syncInterval": 300, // 5 minutos
    "conflictResolution": "EXTERNAL_PRIORITY"
  }
}
```

### RF-09: Búsqueda avanzada
- ✅ **Filtros Múltiples**: Tipo, ubicación, capacidad, características
- ✅ **Disponibilidad Tiempo Real**: Verificación automática de conflictos
- ✅ **Búsqueda Inteligente**: Sugerencias basadas en historial
- ✅ **Autocomplete**: Búsqueda rápida con resultados inmediatos

### RF-10: Visualización en calendario
- ✅ **Vista Mensual**: Calendario completo con eventos
- ✅ **Vista Semanal**: Detalle por semana con franjas horarias
- ✅ **Vista Diaria**: Detalle completo del día
- ✅ **Filtros Visuales**: Por recurso, usuario, estado

### RF-11: Historial de uso
- ✅ **Auditoría Completa**: Todos los cambios registrados
- ✅ **Métricas de Uso**: Estadísticas por recurso y usuario
- ✅ **Trazabilidad**: Historial completo de modificaciones
- ✅ **Reportes**: Análisis de patrones de uso

### RF-12: Reservas periódicas
- ✅ **Recurrencia Semanal**: Mismo día y hora cada semana
- ✅ **Recurrencia Mensual**: Misma fecha cada mes
- ✅ **Recurrencia Personalizada**: Patrones complejos
- ✅ **Gestión de Serie**: Modificar/cancelar toda la serie

### RF-13: Manejo de modificaciones/cancelaciones
- ✅ **Modificación Parcial**: Cambio de horario manteniendo recurso
- ✅ **Modificación Completa**: Cambio de recurso y horario
- ✅ **Cancelación Simple**: Cancelación de reserva individual
- ✅ **Cancelación en Serie**: Cancelación de reservas periódicas

### RF-14: Lista de espera
- ✅ **Cola FIFO**: Primer solicitante, primera asignación
- ✅ **Notificación Automática**: Aviso cuando recurso esté disponible
- ✅ **Expiración**: Tiempo límite para responder
- ✅ **Priorización**: Por rol académico o urgencia

### RF-15: Reasignación automática
- ✅ **Detección de Conflictos**: Identificación automática
- ✅ **Sugerencias Alternativas**: Recursos similares disponibles
- ✅ **Reasignación Inteligente**: Basada en preferencias del usuario
- ✅ **Notificación**: Aviso inmediato de cambios

## 📊 Modelo de Datos

### Entidad Reservation
```typescript
export class ReservationEntity {
  id: string;
  resourceId: string;
  userId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: ReservationStatus; // PENDING, CONFIRMED, CANCELLED, COMPLETED
  
  // Reservas periódicas
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: Date;
  parentReservationId?: string; // Para series
  
  // Integración calendarios
  externalEventId?: string;
  calendarIntegrationId?: string;
  
  // Metadatos
  purpose: string;              // Propósito de la reserva
  expectedAttendees?: number;
  specialRequirements?: string[];
  
  // Lista de espera
  waitlistPosition?: number;
  waitlistExpiresAt?: Date;
  
  // Auditoría
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}
```

### Entidad Schedule
```typescript
export class ScheduleEntity {
  id: string;
  resourceId: string;
  name: string;
  description?: string;
  scheduleType: ScheduleType; // REGULAR, EXCEPTION, MAINTENANCE
  
  // Recurrencia
  recurrencePattern: RecurrencePattern;
  weekdays: Weekday[];
  startDate: Date;
  endDate?: Date;
  
  // Franjas horarias
  timeSlots: TimeSlot[];
  
  // Restricciones
  userRestrictions: UserRestriction[];
  capacityLimit?: number;
  minimumAdvanceBooking?: number; // horas
  maximumAdvanceBooking?: number; // días
  
  isActive: boolean;
}
```

### Entidad CalendarIntegration
```typescript
export class CalendarIntegrationEntity {
  id: string;
  resourceId: string;
  type: CalendarType; // GOOGLE, OUTLOOK, ICAL, INTERNAL
  name: string;
  externalCalendarId: string;
  
  // Configuración de sincronización
  syncDirection: SyncDirection; // IMPORT, EXPORT, BIDIRECTIONAL
  autoSync: boolean;
  syncInterval: number; // minutos
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  
  // Credenciales (encriptadas)
  credentials: CalendarCredentials;
  
  // Configuración de conflictos
  conflictResolution: ConflictResolution;
  
  isActive: boolean;
}
```

## 🌐 API Endpoints

### Disponibilidad - `/availability`

#### GET /availability/check
Verificar disponibilidad de recursos

**Query Parameters:**
- `resourceIds`: Lista de IDs de recursos (comma-separated)
- `startDate`: Fecha/hora inicio (ISO 8601)
- `endDate`: Fecha/hora fin (ISO 8601)
- `includeConflicts`: Incluir información de conflictos (boolean)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "available": [
      {
        "resourceId": "uuid-aula-101",
        "timeSlots": [
          {
            "start": "2025-09-02T08:00:00Z",
            "end": "2025-09-02T10:00:00Z",
            "status": "AVAILABLE"
          }
        ]
      }
    ],
    "unavailable": [
      {
        "resourceId": "uuid-lab-201",
        "conflicts": [
          {
            "start": "2025-09-02T08:00:00Z",
            "end": "2025-09-02T12:00:00Z",
            "reason": "EXISTING_RESERVATION",
            "reservationId": "uuid-reserva"
          }
        ]
      }
    ]
  }
}
```

#### POST /availability/reserve
Crear nueva reserva

**Request Body:**
```json
{
  "resourceId": "uuid-aula-101",
  "title": "Clase de Programación",
  "description": "Clase regular de programación orientada a objetos",
  "startDate": "2025-09-02T08:00:00Z",
  "endDate": "2025-09-02T10:00:00Z",
  "purpose": "ACADEMIC_CLASS",
  "expectedAttendees": 35,
  "recurrence": {
    "pattern": "WEEKLY",
    "endDate": "2025-12-15T10:00:00Z",
    "weekdays": ["MONDAY", "WEDNESDAY", "FRIDAY"]
  }
}
```

#### PUT /availability/reservations/:id
Modificar reserva existente

#### DELETE /availability/reservations/:id
Cancelar reserva

### Búsqueda Avanzada - `/search`

#### POST /search/advanced
Búsqueda avanzada de recursos

**Request Body:**
```json
{
  "searchTerm": "aula sistemas",
  "resourceTypes": ["classroom", "lab"],
  "locations": ["Edificio A", "Edificio B"],
  "capacityMin": 30,
  "capacityMax": 50,
  "features": ["proyector", "aire_acondicionado"],
  "academicPrograms": ["uuid-sistemas"],
  "availabilityWindow": {
    "start": "2025-09-02T08:00:00Z",
    "end": "2025-09-02T10:00:00Z"
  },
  "page": 1,
  "limit": 20,
  "sortBy": "popularity",
  "sortOrder": "desc"
}
```

#### GET /search/quick?q=:searchTerm
Búsqueda rápida (autocomplete)

#### GET /search/popular
Recursos más populares

### Calendarios - `/calendars`

#### GET /calendars/integrations
Listar integraciones de calendario

#### POST /calendars/integrations
Crear nueva integración

#### POST /calendars/sync/:id
Sincronizar calendario específico

#### GET /calendars/view
Vista de calendario

**Query Parameters:**
- `view`: Tipo de vista (`month`, `week`, `day`)
- `date`: Fecha base para la vista
- `resourceIds`: Filtrar por recursos
- `userIds`: Filtrar por usuarios

## 🔄 Eventos de Dominio

### ReservationCreated
```json
{
  "eventType": "ReservationCreated",
  "aggregateId": "uuid-reserva",
  "version": 1,
  "data": {
    "id": "uuid-reserva",
    "resourceId": "uuid-recurso",
    "userId": "uuid-usuario",
    "startDate": "2025-09-02T08:00:00Z",
    "endDate": "2025-09-02T10:00:00Z",
    "status": "PENDING",
    "isRecurring": true
  },
  "metadata": {
    "timestamp": "2025-09-01T23:45:00Z",
    "correlationId": "uuid-correlation",
    "causationId": "uuid-causation"
  }
}
```

### ConflictDetected
```json
{
  "eventType": "ConflictDetected",
  "aggregateId": "uuid-reserva",
  "data": {
    "reservationId": "uuid-reserva",
    "resourceId": "uuid-recurso",
    "conflictType": "DOUBLE_BOOKING",
    "conflictingReservationId": "uuid-otra-reserva",
    "suggestedAlternatives": ["uuid-recurso-alt1", "uuid-recurso-alt2"]
  }
}
```

### CalendarSynced
```json
{
  "eventType": "CalendarSynced",
  "aggregateId": "uuid-integration",
  "data": {
    "integrationId": "uuid-integration",
    "resourceId": "uuid-recurso",
    "syncType": "BIDIRECTIONAL",
    "eventsImported": 5,
    "eventsExported": 3,
    "conflicts": 1
  }
}
```

## 🔒 Seguridad y Permisos

### Roles y Permisos
- **Administrador General**: Gestión completa de disponibilidad y calendarios
- **Administrador de Programa**: Gestión de recursos de su programa
- **Docente**: Crear/modificar reservas propias, ver disponibilidad
- **Estudiante**: Crear reservas básicas, consultar disponibilidad

### Validaciones de Seguridad
- **Restricciones de Horario**: Validación de horarios permitidos por rol
- **Límites de Anticipación**: Control de reservas con mucha anticipación
- **Verificación de Conflictos**: Prevención automática de doble reserva
- **Auditoría de Cambios**: Registro completo de modificaciones

## 📊 Integración con Calendarios Externos

### Google Calendar
```typescript
// Configuración OAuth2
{
  "clientId": "google-client-id",
  "clientSecret": "encrypted-secret",
  "scopes": ["https://www.googleapis.com/auth/calendar"],
  "redirectUri": "http://localhost:3002/auth/google/callback"
}

// Sincronización automática cada 5 minutos
// Mapeo de eventos bidireccional
// Resolución de conflictos configurable
```

### Microsoft Outlook
```typescript
// Configuración Graph API
{
  "clientId": "microsoft-client-id",
  "clientSecret": "encrypted-secret",
  "scopes": ["https://graph.microsoft.com/calendars.readwrite"],
  "redirectUri": "http://localhost:3002/auth/microsoft/callback"
}
```

### iCal/CalDAV
```typescript
// Soporte para calendarios estándar
{
  "calendarUrl": "https://calendar.server.com/user/calendar.ics",
  "username": "usuario",
  "password": "encrypted-password",
  "syncInterval": 300
}
```

## 🧪 Testing

### Pruebas de Integración de Calendario
```bash
# Pruebas con calendarios mock
npm run test:calendar:google
npm run test:calendar:outlook
npm run test:calendar:ical
```

### Pruebas de Disponibilidad
```bash
# Pruebas de lógica de reservas
npm run test:availability:conflicts
npm run test:availability:recurrence
npm run test:availability:waitlist
```

### Pruebas de Búsqueda Avanzada
```bash
# Pruebas de búsqueda y filtros
npm run test:search:advanced
npm run test:search:performance
```

## 📊 Métricas y Monitoreo

### KPIs del Servicio
- **Tasa de Conflictos**: < 1% de reservas con conflictos
- **Tiempo de Sincronización**: < 30 segundos por calendario
- **Disponibilidad del Servicio**: 99.9%
- **Tiempo de Respuesta Búsqueda**: < 500ms

### Alertas Configuradas
- **Conflictos de Reserva**: Notificación inmediata
- **Fallas de Sincronización**: Después de 3 intentos fallidos
- **Uso de Memoria**: Cuando excede 1.5GB
- **Errores de API**: Rate > 5% en 5 minutos

## 🚀 Estado del Servicio

✅ **Funcional y operativo**  
✅ **Integración con resources-service exitosa**  
✅ **Calendarios externos funcionando**  
✅ **Búsqueda avanzada implementada**  
✅ **Sistema de reservas operativo**  
✅ **Event-driven architecture activa**  
✅ **Logging y métricas completos**

---

**Próximos pasos**: Integración con stockpile-service para flujos de aprobación (Hito 3).
