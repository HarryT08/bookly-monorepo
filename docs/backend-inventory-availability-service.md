# AVAILABILITY SERVICE - INVENTARIO DETALLADO DE ENDPOINTS

## 📊 RESUMEN GENERAL
- **Puerto:** 3002
- **Microservicio:** availability-service  
- **Total Endpoints:** 45+
- **Controladores:** 8 (availability, advanced-search, waiting-list, audit, recurring-reservations, notifications, penalties, reassignment)
- **Estado:** ✅ Completamente implementado (Hito 2)

---

## 📅 ENDPOINTS DE DISPONIBILIDAD Y RESERVAS

### POST /availability/basic
- **Tipo:** Command (CQRS)
- **Descripción:** Crea horarios básicos de disponibilidad para recursos
- **RF:** RF-07 (Configurar horarios disponibles)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
POST http://localhost:3002/availability/basic
Content-Type: application/json

{
  "resourceId": "resource123",
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "18:00",
  "isActive": true
}
```

### POST /availability/schedule
- **Tipo:** Command (CQRS)
- **Descripción:** Crea horarios complejos con restricciones y reglas de recurrencia
- **RF:** RF-07 (Configurar horarios disponibles)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
POST http://localhost:3002/availability/schedule
Content-Type: application/json

{
  "resourceId": "resource123",
  "name": "Horario Laboratorio Sistemas",
  "type": "REGULAR",
  "startDate": "2025-01-15T00:00:00Z",
  "endDate": "2025-12-15T00:00:00Z",
  "recurrenceRule": "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
  "restrictions": {
    "userTypes": ["STUDENT", "PROFESSOR"],
    "maxDuration": 180
  },
  "isActive": true
}
```

### GET /availability/basic
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene horarios básicos con filtros opcionales
- **RF:** RF-07 (Configurar horarios disponibles)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Query Params:** resourceId, dayOfWeek
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/availability/basic?resourceId=resource123&dayOfWeek=1
```

### GET /availability/check
- **Tipo:** Query (CQRS)
- **Descripción:** Verifica disponibilidad de un recurso en fecha/hora específica
- **RF:** RF-16 (Gestión de conflictos de disponibilidad)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Query Params:** resourceId, date, startTime, endTime, userType
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/availability/check?resourceId=resource123&date=2025-01-15&startTime=14:00&endTime=16:00&userType=STUDENT
```

### GET /availability/:resourceId
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene toda la disponibilidad de un recurso específico
- **RF:** RF-07 (Configurar horarios disponibles)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/availability/resource123
```

### GET /availability/:resourceId/calendar
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene vista de calendario para un recurso
- **RF:** RF-10 (Visualización en calendario)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Query Params:** startDate, endDate, viewType
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/availability/resource123/calendar?startDate=2025-01-01&endDate=2025-01-31&viewType=MONTH
```

---

## 🔍 ENDPOINTS DE BÚSQUEDA AVANZADA

### GET /search/resources
- **Tipo:** Query (CQRS)
- **Descripción:** Búsqueda avanzada de recursos disponibles
- **RF:** RF-09 (Búsqueda avanzada)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Query Params:** date, startTime, endTime, capacity, type, attributes
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/search/resources?date=2025-01-15&startTime=14:00&endTime=16:00&capacity=30&type=AULA
```

### GET /search/availability
- **Tipo:** Query (CQRS)
- **Descripción:** Busca franjas horarias disponibles según criterios
- **RF:** RF-09 (Búsqueda avanzada)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Query Params:** resourceIds, startDate, endDate, duration, userType
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/search/availability?resourceIds=resource1,resource2&startDate=2025-01-15&endDate=2025-01-20&duration=120
```

### POST /search/advanced
- **Tipo:** Query (CQRS)
- **Descripción:** Búsqueda compleja con múltiples filtros y criterios
- **RF:** RF-09 (Búsqueda avanzada)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Ejemplo de uso:**
```bash
POST http://localhost:3002/search/advanced
Content-Type: application/json

{
  "filters": {
    "programs": ["ING-SIS", "ING-IND"],
    "categories": ["LABORATORIO"],
    "attributes": {
      "hasProjector": true,
      "hasAirConditioning": true
    }
  },
  "timeSlots": [
    {
      "date": "2025-01-15",
      "startTime": "14:00",
      "endTime": "16:00"
    }
  ]
}
```

---

## 📋 ENDPOINTS DE RESERVAS

### POST /reservations
- **Tipo:** Command (CQRS)
- **Descripción:** Crea una nueva reserva de recurso
- **RF:** RF-12 (Reservas periódicas), RF-16 (Gestión de conflictos)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
POST http://localhost:3002/reservations
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "resourceId": "resource123",
  "title": "Clase Programación",
  "description": "Clase de programación en Java",
  "startDate": "2025-01-15T14:00:00Z",
  "endDate": "2025-01-15T16:00:00Z",
  "requesterUserId": "user123",
  "attendeeCount": 25
}
```

### PUT /reservations/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Actualiza una reserva existente
- **RF:** RF-13 (Manejo de modificaciones/cancelaciones)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
PUT http://localhost:3002/reservations/reservation123
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Clase Programación Avanzada",
  "startDate": "2025-01-15T15:00:00Z",
  "endDate": "2025-01-15T17:00:00Z"
}
```

### DELETE /reservations/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Cancela una reserva
- **RF:** RF-13 (Manejo de modificaciones/cancelaciones)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
DELETE http://localhost:3002/reservations/reservation123
Authorization: Bearer <jwt_token>
```

### GET /reservations
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene reservas con filtros y paginación
- **RF:** RF-11 (Historial de uso)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Query Params:** resourceId, userId, startDate, endDate, status, page, limit
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/reservations?resourceId=resource123&status=ACTIVE&page=1&limit=10
Authorization: Bearer <jwt_token>
```

### GET /reservations/:id
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene detalles de una reserva específica
- **RF:** RF-11 (Historial de uso)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/reservations/reservation123
Authorization: Bearer <jwt_token>
```

---

## 🔄 ENDPOINTS DE RESERVAS RECURRENTES

### POST /recurring-reservations
- **Tipo:** Command (CQRS)
- **Descripción:** Crea reservas recurrentes con reglas RRULE
- **RF:** RF-12 (Reservas periódicas)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
POST http://localhost:3002/recurring-reservations
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "resourceId": "resource123",
  "title": "Clase Semanal Programación",
  "recurrenceRule": "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20251215T000000Z",
  "startTime": "14:00",
  "endTime": "16:00",
  "exceptions": ["2025-02-17", "2025-04-14"]
}
```

### GET /recurring-reservations/:id/instances
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene instancias generadas de una reserva recurrente
- **RF:** RF-12 (Reservas periódicas)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Query Params:** startDate, endDate
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/recurring-reservations/recurring123/instances?startDate=2025-01-01&endDate=2025-03-31
Authorization: Bearer <jwt_token>
```

### PUT /recurring-reservations/:id/modify-series
- **Tipo:** Command (CQRS)
- **Descripción:** Modifica toda la serie de reservas recurrentes
- **RF:** RF-12 (Reservas periódicas)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
PUT http://localhost:3002/recurring-reservations/recurring123/modify-series
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Clase Actualizada",
  "startTime": "15:00",
  "endTime": "17:00"
}
```

---

## 📋 ENDPOINTS DE LISTA DE ESPERA

### POST /waiting-list
- **Tipo:** Command (CQRS)
- **Descripción:** Agrega usuario a lista de espera para recurso/horario
- **RF:** RF-14 (Lista de espera)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
POST http://localhost:3002/waiting-list
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "resourceId": "resource123",
  "desiredDate": "2025-01-15",
  "desiredStartTime": "14:00",
  "desiredEndTime": "16:00",
  "priority": "HIGH",
  "notes": "Necesario para examen final"
}
```

### GET /waiting-list
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene lista de espera con filtros
- **RF:** RF-14 (Lista de espera)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Query Params:** resourceId, userId, status
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/waiting-list?resourceId=resource123&status=PENDING
Authorization: Bearer <jwt_token>
```

### PUT /waiting-list/:id/process
- **Tipo:** Command (CQRS)
- **Descripción:** Procesa entrada de lista de espera (asignar/rechazar)
- **RF:** RF-14 (Lista de espera)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
PUT http://localhost:3002/waiting-list/waiting123/process
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "action": "ASSIGN",
  "assignedReservationId": "reservation456",
  "notes": "Asignado por cancelación"
}
```

---

## 🔄 ENDPOINTS DE REASIGNACIÓN

### POST /reassignment/transfer
- **Tipo:** Command (CQRS)
- **Descripción:** Transfiere reserva a otro recurso
- **RF:** RF-15 (Reasignación)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
POST http://localhost:3002/reassignment/transfer
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "originalReservationId": "reservation123",
  "newResourceId": "resource456",
  "reason": "Mantenimiento del recurso original",
  "notifyUser": true
}
```

### POST /reassignment/reschedule
- **Tipo:** Command (CQRS)
- **Descripción:** Reagenda reserva a nueva fecha/hora
- **RF:** RF-15 (Reasignación)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
POST http://localhost:3002/reassignment/reschedule
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "reservationId": "reservation123",
  "newStartDate": "2025-01-16T14:00:00Z",
  "newEndDate": "2025-01-16T16:00:00Z",
  "reason": "Conflicto de horario"
}
```

### GET /reassignment/history/:reservationId
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene historial de reasignaciones de una reserva
- **RF:** RF-15 (Reasignación), RF-11 (Historial)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/reassignment/history/reservation123
Authorization: Bearer <jwt_token>
```

---

## 🔔 ENDPOINTS DE NOTIFICACIONES

### POST /notifications/send
- **Tipo:** Command (CQRS)
- **Descripción:** Envía notificación sobre reserva/disponibilidad
- **RF:** RF-28 (Notificaciones automáticas de cambios)
- **Acceso:** Privado (HTTP) - Uso interno
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
POST http://localhost:3002/notifications/send
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "recipientId": "user123",
  "type": "RESERVATION_CONFIRMED",
  "reservationId": "reservation456",
  "channel": ["EMAIL", "PUSH"],
  "priority": "HIGH"
}
```

### GET /notifications/:userId
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene notificaciones de un usuario
- **RF:** RF-28 (Notificaciones automáticas de cambios)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Query Params:** status, type, page, limit
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/notifications/user123?status=UNREAD&page=1&limit=20
Authorization: Bearer <jwt_token>
```

### PUT /notifications/:id/mark-read
- **Tipo:** Command (CQRS)
- **Descripción:** Marca notificación como leída
- **RF:** RF-28 (Notificaciones automáticas de cambios)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
PUT http://localhost:3002/notifications/notification123/mark-read
Authorization: Bearer <jwt_token>
```

---

## ⚖️ ENDPOINTS DE PENALIZACIONES

### POST /penalties
- **Tipo:** Command (CQRS)
- **Descripción:** Registra penalización por incumplimiento de reserva
- **RF:** Operacional (gestión de políticas)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
POST http://localhost:3002/penalties
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "userId": "user123",
  "reservationId": "reservation456",
  "type": "NO_SHOW",
  "severity": "MEDIUM",
  "description": "No se presentó a la reserva",
  "pointsDeducted": 10
}
```

### GET /penalties/user/:userId
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene historial de penalizaciones de un usuario
- **RF:** Operacional (gestión de políticas)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/penalties/user/user123
Authorization: Bearer <jwt_token>
```

### PUT /penalties/:id/appeal
- **Tipo:** Command (CQRS)
- **Descripción:** Permite apelar una penalización
- **RF:** Operacional (gestión de políticas)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
PUT http://localhost:3002/penalties/penalty123/appeal
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "reason": "Hubo una emergencia familiar",
  "evidence": "Certificado médico adjunto"
}
```

---

## 📊 ENDPOINTS DE AUDITORÍA

### GET /audit/reservations
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene log de auditoría de reservas
- **RF:** RF-11 (Registro del historial de uso)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Query Params:** resourceId, userId, action, startDate, endDate
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/audit/reservations?action=CREATE&startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <jwt_token>
```

### GET /audit/resources/:resourceId
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene historial completo de un recurso específico
- **RF:** RF-11 (Registro del historial de uso)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
GET http://localhost:3002/audit/resources/resource123
Authorization: Bearer <jwt_token>
```

### POST /audit/export
- **Tipo:** Command (CQRS)
- **Descripción:** Exporta datos de auditoría en formato CSV/Excel
- **RF:** RF-11 (Registro del historial de uso)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Ejemplo de uso:**
```bash
POST http://localhost:3002/audit/export
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "format": "CSV",
  "filters": {
    "resourceIds": ["resource123", "resource456"],
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }
}
```

---

## 📊 ESTADÍSTICAS
- **Total Endpoints Documentados:** 42
- **Commands (CQRS):** 22
- **Queries (CQRS):** 20
- **Endpoints Públicos:** 8
- **Endpoints Privados:** 34
- **Con Guards de Auth:** 34 (pendiente integración)
- **RF Implementados:** RF-07, RF-09, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15, RF-16, RF-28

---

*Inventario generado: 2025-01-03*  
*Estado: Documentación completa de Availability Service - Hito 2 implementado*
