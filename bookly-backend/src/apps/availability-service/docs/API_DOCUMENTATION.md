# 📅 Availability Service API Documentation

## 📋 Índice

- [📅 Availability Service API Documentation](#-availability-service-api-documentation)
  - [📋 Índice](#-índice)
  - [📖 Información General](#-información-general)
    - [Características Principales](#características-principales)
    - [Base URL](#base-url)
    - [Arquitectura](#arquitectura)
  - [🔐 Autenticación y Seguridad](#-autenticación-y-seguridad)
    - [Autenticación JWT](#autenticación-jwt)
    - [Roles y Permisos](#roles-y-permisos)
    - [Rate Limiting](#rate-limiting)
  - [📊 Gestión de Disponibilidad](#-gestión-de-disponibilidad)
    - [POST /availability/basic](#post-availabilitybasic)
    - [GET /availability/basic](#get-availabilitybasic)
  - [⏰ Gestión de Horarios](#-gestión-de-horarios)
    - [POST /availability/schedule](#post-availabilityschedule)
  - [🎯 Gestión de Reservas](#-gestión-de-reservas)
    - [POST /availability/reservations](#post-availabilityreservations)
    - [POST /availability/check](#post-availabilitycheck)
  - [📅 Visualización de Calendarios](#-visualización-de-calendarios)
    - [GET /availability/calendar/:resourceId](#get-availabilitycalendarresourceid)
    - [GET /availability/calendar-view](#get-availabilitycalendar-view)
  - [📊 Historial de Reservas](#-historial-de-reservas)
    - [GET /availability/history](#get-availabilityhistory)
    - [GET /availability/reservation-history/export](#get-availabilityreservation-historyexport)
  - [📋 Auditoría y Logs](#-auditoría-y-logs)
    - [GET /audit/entries](#get-auditentries)
    - [POST /audit/export](#post-auditexport)
  - [🔧 Variables de Entorno Postman](#-variables-de-entorno-postman)
    - [Variables Base](#variables-base)
    - [Variables de Testing](#variables-de-testing)
    - [Variables de Calendario](#variables-de-calendario)
    - [Variables de Notificaciones](#variables-de-notificaciones)
    - [Scripts de Pre-request](#scripts-de-pre-request)
    - [Tests Automatizados](#tests-automatizados)
  - [❌ Manejo de Errores](#-manejo-de-errores)
    - [Códigos de Estado HTTP](#códigos-de-estado-http)
    - [Formato de Errores](#formato-de-errores)

---

## 📖 Información General

El **Availability Service** es el microservicio encargado de gestionar la disponibilidad de recursos, horarios, reservas y toda la lógica relacionada con la programación y uso de espacios institucionales en Bookly.

### Características Principales

- **RF-07**: Gestión completa de disponibilidad y horarios
- **RF-08**: Integración con calendarios externos (Google, Outlook, iCal)
- **RF-09**: Búsqueda avanzada de disponibilidad
- **RF-10**: Visualización en formato calendario
- **RF-11**: Historial completo de reservas y auditoría
- **RF-12**: Reservas periódicas y recurrentes
- **RF-13**: Modificaciones y cancelaciones
- **RF-14**: Lista de espera automática
- **RF-15**: Reasignación de reservas
- **RF-16**: Gestión de conflictos

### Base URL

```
http://localhost:3002
```

### Arquitectura

- **CQRS**: Separación de comandos y consultas
- **Event-Driven**: Comunicación asíncrona entre servicios
- **Clean Architecture**: Separación de responsabilidades
- **Swagger**: Documentación automática de API

---

## 🔐 Autenticación y Seguridad

### Autenticación JWT

Todos los endpoints protegidos requieren un token JWT válido en el header:

```http
Authorization: Bearer <jwt_token>
```

### Roles y Permisos

- **Administrador General**: Acceso completo a todos los endpoints
- **Administrador de Programa**: Gestión dentro de su programa
- **Coordinador**: Gestión de recursos y reservas
- **Docente**: Creación y gestión de reservas propias
- **Estudiante**: Creación de reservas básicas
- **Monitor**: Asistencia en laboratorios

### Rate Limiting

- **Creación de reservas**: 10 por minuto por usuario
- **Consultas de disponibilidad**: 100 por minuto por usuario
- **Sincronización de calendarios**: 5 por minuto por integración

---

## 📊 Gestión de Disponibilidad

### POST /availability/basic

**Crear disponibilidad básica (RF-07)**

Crea horarios básicos de disponibilidad para un recurso en días específicos de la semana.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, COORDINATOR
- 📝 Auditoría completa de operaciones
- ⚠️ Validación automática de conflictos de horarios

**Request Body**:

```json
{
  "resourceId": "507f1f77bcf86cd799439011",
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "18:00",
  "isActive": true
}
```

**Response Success (201)**:

```json
{
  "id": "availability-456",
  "resourceId": "507f1f77bcf86cd799439011",
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "18:00",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Response Error (409)**:

```json
{
  "statusCode": 409,
  "message": "Time slot conflicts with existing availability",
  "error": "Conflict"
}
```

---

### GET /availability/basic

**Obtener disponibilidad básica (RF-07)**

**Security Restrictions**:

- ❌ No requiere autenticación
- 📊 Endpoint público de consulta
- 📝 Logging de consultas

**Query Parameters**:

- `resourceId` (optional): ID del recurso
- `dayOfWeek` (optional): Día de la semana (0-6)

**Response Success (200)**:

```json
[
  {
    "id": "availability-456",
    "resourceId": "resource-123",
    "dayOfWeek": 1,
    "startTime": "08:00",
    "endTime": "18:00",
    "isActive": true
  }
]
```

---

## ⏰ Gestión de Horarios

### POST /availability/schedule

**Crear horario complejo con restricciones (RF-07)**

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, COORDINATOR
- 🛡️ Validación de conflictos automática
- 📝 Auditoría completa

**Request Body**:

```json
{
  "resourceId": "resource-123",
  "name": "Horario Académico Semestre 2024-1",
  "type": "ACADEMIC",
  "startDate": "2024-01-15",
  "endDate": "2024-05-30",
  "recurrenceRule": {
    "frequency": "WEEKLY",
    "interval": 1,
    "daysOfWeek": [1, 2, 3, 4, 5],
    "startTime": "08:00",
    "endTime": "18:00"
  },
  "restrictions": {
    "maxConsecutiveHours": 4,
    "minBreakBetweenReservations": 30,
    "allowedUserTypes": ["DOCENTE", "ESTUDIANTE"]
  },
  "isActive": true
}
```

**Response Success (201)**:

```json
{
  "id": "schedule-789",
  "resourceId": "resource-123",
  "name": "Horario Académico Semestre 2024-1",
  "type": "ACADEMIC",
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-05-30T23:59:59Z",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## 🎯 Gestión de Reservas

### POST /availability/reservations

**Crear nueva reserva**

Crea una nueva reserva de recurso con validación automática de conflictos.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: STUDENT, TEACHER, PROGRAM_ADMIN, GENERAL_ADMIN
- ⚠️ Validación automática de conflictos
- 📝 Auditoría completa de reservas
- 🔒 Rate limiting: 10 reservas por hora por usuario

**Request Body**:

```json
{
  "title": "Clase de Programación Web",
  "description": "Sesión práctica de desarrollo frontend",
  "startDate": "2024-01-15T14:00:00Z",
  "endDate": "2024-01-15T16:00:00Z",
  "resourceId": "507f1f77bcf86cd799439011",
  "userId": "prof-martinez-123",
  "isRecurring": false,
  "recurrence": null
}
```

**Response Success (201)**:

```json
{
  "id": "reservation-101",
  "title": "Clase de Programación Web",
  "description": "Sesión práctica de desarrollo frontend",
  "startDate": "2024-01-15T14:00:00Z",
  "endDate": "2024-01-15T16:00:00Z",
  "resourceId": "507f1f77bcf86cd799439011",
  "userId": "prof-martinez-123",
  "status": "CONFIRMED",
  "isRecurring": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Response Error (409)**:

```json
{
  "statusCode": 409,
  "message": "Resource is not available for the requested time slot",
  "error": "Conflict",
  "conflictingReservations": ["reservation-100"]
}
```

---

### POST /availability/check

**Verificar disponibilidad para franja horaria específica (RF-10)**

Verifica si un recurso está disponible para una franja horaria específica.

**Security Restrictions**:

- ❌ No requiere autenticación
- 📊 Endpoint público de consulta
- 🔍 Rate limiting: 100 consultas/minuto por IP
- 📝 Logging básico sin información sensible

**Request Body**:

```json
{
  "resourceId": "507f1f77bcf86cd799439011",
  "startDate": "2024-01-15T14:00:00Z",
  "endDate": "2024-01-15T16:00:00Z"
}
```

**Response Success (200)**:

```json
{
  "available": true,
  "resourceId": "507f1f77bcf86cd799439011",
  "requestedSlot": {
    "startDate": "2024-01-15T14:00:00Z",
    "endDate": "2024-01-15T16:00:00Z"
  },
  "conflicts": [],
  "restrictions": [],
  "alternativeSlots": [
    {
      "startDate": "2024-01-15T16:00:00Z",
      "endDate": "2024-01-15T18:00:00Z"
    }
  ]
}
```

**Response Error (400)**:

```json
{
  "statusCode": 400,
  "message": "Invalid time slot: end date must be after start date",
  "error": "Bad Request"
}
```

---

## 📅 Visualización de Calendarios

### GET /availability/calendar/:resourceId

**Obtener disponibilidad de recurso para visualización de calendario (RF-10)**

**Security Restrictions**:

- ❌ No requiere autenticación
- 📊 Endpoint público de consulta
- 📝 Información completa para calendarios

**Path Parameters**:

- `resourceId`: ID del recurso

**Query Parameters**:

- `startDate` (required): Fecha de inicio (ISO format)
- `endDate` (required): Fecha de fin (ISO format)
- `includeReservations` (optional): Incluir reservas existentes (default: true)
- `includeScheduleRestrictions` (optional): Incluir restricciones de horario (default: true)

**Response Success (200)**:

```json
{
  "resourceId": "resource-123",
  "period": {
    "startDate": "2024-01-15T00:00:00Z",
    "endDate": "2024-01-15T23:59:59Z"
  },
  "availability": [
    {
      "startTime": "08:00",
      "endTime": "18:00",
      "dayOfWeek": 1,
      "available": true
    }
  ],
  "reservations": [
    {
      "id": "reservation-101",
      "title": "Clase de Programación",
      "startDate": "2024-01-15T14:00:00Z",
      "endDate": "2024-01-15T16:00:00Z"
    }
  ],
  "restrictions": []
}
```

---

### GET /availability/calendar-view

**Obtener vista de calendario con eventos (RF-10)**

**Security Restrictions**:

- ❌ No requiere autenticación
- 📊 Vista completa de calendario
- 🔍 Filtros avanzados disponibles

**Query Parameters**:

- `resourceId` (optional): ID del recurso
- `startDate` (required): Fecha de inicio (ISO format)
- `endDate` (required): Fecha de fin (ISO format)
- `viewType` (optional): Tipo de vista (MONTH, WEEK, DAY)
- `includeAvailability` (optional): Incluir slots de disponibilidad (default: true)
- `includeExternalEvents` (optional): Incluir eventos de calendarios externos (default: true)
- `userId` (optional): ID de usuario para vista personalizada

**Response Success (200)**:

```json
{
  "viewType": "MONTH",
  "period": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  },
  "events": [
    {
      "id": "reservation-101",
      "type": "RESERVATION",
      "title": "Clase de Programación",
      "startDate": "2024-01-15T14:00:00Z",
      "endDate": "2024-01-15T16:00:00Z",
      "resourceId": "resource-123"
    }
  ],
  "availability": [
    {
      "resourceId": "resource-123",
      "dayOfWeek": 1,
      "startTime": "08:00",
      "endTime": "18:00"
    }
  ]
}
```

---

## 📊 Historial de Reservas

### GET /availability/history

**Obtener historial de reservas (RF-11)**

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👁️ Los usuarios ven solo su historial (excepto ADMIN/COORDINATOR)
- 📊 Paginación obligatoria

**Query Parameters**:

- `reservationId` (optional): ID de reserva
- `userId` (optional): ID de usuario
- `resourceId` (optional): ID de recurso
- `action` (optional): Tipo de acción
- `startDate` (optional): Fecha de inicio del filtro
- `endDate` (optional): Fecha de fin del filtro
- `page` (optional): Número de página (default: 1)
- `limit` (optional): Elementos por página (default: 20)

**Response Success (200)**:

```json
{
  "data": [
    {
      "id": "history-123",
      "reservationId": "reservation-101",
      "userId": "user-456",
      "action": "CREATED",
      "timestamp": "2024-01-15T10:30:00Z",
      "details": "Reserva creada exitosamente"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### GET /availability/reservation-history/export

**Exportar historial de reservas a CSV (RF-11)**

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, COORDINATOR
- 📊 Exportación completa con filtros

**Query Parameters**:

- `reservationId` (optional): ID de reserva
- `userId` (optional): ID de usuario
- `resourceId` (optional): ID de recurso
- `startDate` (optional): Fecha de inicio del filtro
- `endDate` (optional): Fecha de fin del filtro

**Response Success (200)**:

- Content-Type: text/csv
- Content-Disposition: attachment; filename="reservation-history-2024-01-15.csv"

---

## 📋 Auditoría y Logs

### GET /audit/entries

**Obtener entradas de auditoría**

Recupera entradas de auditoría con filtros avanzados y paginación.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: GENERAL_ADMIN, PROGRAM_ADMIN únicamente
- 📊 Paginación obligatoria (máximo 50 por página)
- 🔍 Filtros por rol aplicados automáticamente

**Query Parameters**:

- `eventType` (optional): Tipo de evento de auditoría
- `category` (optional): Categoría del evento
- `resource` (optional): Tipo de recurso
- `resourceId` (optional): ID específico del recurso
- `userId` (optional): ID del usuario
- `userRole` (optional): Rol del usuario
- `status` (optional): Estado del evento
- `severity` (optional): Severidad del evento
- `dateFrom` (optional): Fecha de inicio (ISO string)
- `dateTo` (optional): Fecha de fin (ISO string)
- `correlationId` (optional): ID de correlación
- `page` (optional): Número de página (default: 1)
- `limit` (optional): Elementos por página (default: 50, max: 50)
- `sortBy` (optional): Campo de ordenamiento
- `sortOrder` (optional): Orden (asc, desc)

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "audit-entry-123",
        "eventType": "RESERVATION_CREATED",
        "category": "RESERVATION",
        "action": "CREATE",
        "resource": "RESERVATION",
        "resourceId": "reservation-101",
        "userId": "user-456",
        "userRole": "TEACHER",
        "timestamp": "2024-01-15T10:30:00Z",
        "details": "Reserva creada exitosamente",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "correlationId": "req-789",
        "severity": "INFO",
        "status": "SUCCESS"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  }
}
```

---

### POST /audit/export

**Exportar entradas de auditoría**

Exporta entradas de auditoría en formato JSON con filtros opcionales.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: GENERAL_ADMIN, PROGRAM_ADMIN únicamente
- 📦 Límite máximo de exportación: 10,000 entradas
- 📝 Operación auditada automáticamente

**Request Body**:

```json
{
  "eventType": "RESERVATION_CREATED",
  "category": "RESERVATION",
  "resource": "RESERVATION",
  "userId": "user-456",
  "dateFrom": "2024-01-01T00:00:00Z",
  "dateTo": "2024-01-31T23:59:59Z",
  "limit": 1000
}
```

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "exportData": "{\"entries\":[...],\"count\":150}",
    "filename": "audit_export_2024-01-15.json",
    "count": 150
  }
}
```

---

## 🔧 Variables de Entorno Postman

Para facilitar el testing de la API, configure las siguientes variables de entorno en Postman:

### Variables Base

```json
{
  "baseUrl": "http://localhost:3002",
  "authToken": "{{jwt_token_from_login}}",
  "adminToken": "{{admin_jwt_token}}",
  "coordinatorToken": "{{coordinator_jwt_token}}",
  "studentToken": "{{student_jwt_token}}",
  "teacherToken": "{{teacher_jwt_token}}"
}
```

### Variables de Testing

```json
{
  "testResourceId": "507f1f77bcf86cd799439011",
  "testUserId": "prof-martinez-123",
  "testStudentId": "student-456",
  "testReservationId": "reservation-test-789",
  "testScheduleId": "schedule-test-101",
  "testWaitingListId": "waiting-list-303",
  "testReassignmentId": "reassignment-404",
  "testPenaltyId": "penalty-505",
  "testNotificationId": "notification-606",
  "testStartDate": "2024-01-15T08:00:00.000Z",
  "testEndDate": "2024-01-15T18:00:00.000Z",
  "testCalendarIntegrationId": "calendar-integration-707",
  "testRecurringReservationId": "recurring-reservation-202"
}
```

### Variables de Calendario

```json
{
  "googleClientId": "your-google-client-id",
  "googleClientSecret": "your-google-client-secret",
  "outlookClientId": "your-outlook-client-id",
  "outlookClientSecret": "your-outlook-client-secret",
  "testCalendarId": "primary",
  "testEventId": "event-808"
}
```

### Variables de Notificaciones

```json
{
  "testEmail": "test@ufps.edu.co",
  "testPhoneNumber": "+573001234567",
  "testTemplateId": "template-909",
  "testNotificationChannels": ["EMAIL", "SMS", "PUSH"]
}
```

### Scripts de Pre-request

```javascript
// Auto-login para obtener token JWT
if (!pm.environment.get("authToken")) {
    pm.sendRequest({
        url: "http://localhost:3000/auth/login",
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
```

---

## ❌ Manejo de Errores

### Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos de entrada inválidos |
| 401 | Unauthorized - Token JWT inválido o expirado |
| 403 | Forbidden - Sin permisos suficientes |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto con reservas existentes |
| 422 | Unprocessable Entity - Errores de validación |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error interno del servidor |

### Formato de Errores

```json
{
  "statusCode": 409,
  "message": "Reservation conflicts with existing reservations",
  "error": "Conflict",
  "details": [
    {
      "field": "timeSlot",
      "message": "Time slot overlaps with existing reservation"
    }
  ]
}
```
