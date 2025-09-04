# STOCKPILE SERVICE - INVENTARIO DETALLADO DE ENDPOINTS

## 📊 RESUMEN GENERAL
- **Puerto:** 3004
- **Microservicio:** stockpile-service  
- **Total Endpoints:** 35+
- **Controladores:** 4 (approval-flow, document-template, notification-template, stockpile)
- **Estado:** ✅ Completamente implementado

---

## 🔄 ENDPOINTS DE FLUJOS DE APROBACIÓN

### POST /approval-flows
- **Tipo:** Command (CQRS)
- **Descripción:** Crea un nuevo flujo de aprobación para recursos
- **RF:** RF-24 (Configuración de flujos de aprobación diferenciados)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (COORDINATOR, ADMIN)
- **Ejemplo de uso:**
```bash
POST http://localhost:3004/approval-flows
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Flujo Laboratorios Ingeniería",
  "description": "Aprobación para laboratorios de ingeniería",
  "programId": "program123",
  "resourceType": "LABORATORIO",
  "categoryId": "category456",
  "isDefault": true,
  "requiredApprovals": 2
}
```

### PUT /approval-flows/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Actualiza un flujo de aprobación existente
- **RF:** RF-24 (Configuración de flujos de aprobación diferenciados)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (COORDINATOR, ADMIN)
- **Ejemplo de uso:**
```bash
PUT http://localhost:3004/approval-flows/flow123
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Flujo Actualizado",
  "requiredApprovals": 3
}
```

### GET /approval-flows
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene flujos de aprobación con filtros opcionales
- **RF:** RF-24 (Configuración de flujos de aprobación diferenciados)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Query Params:** programId, resourceType, categoryId, isActive
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/approval-flows?programId=program123&resourceType=LABORATORIO
Authorization: Bearer <jwt_token>
```

### GET /approval-flows/:id
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene un flujo de aprobación específico por ID
- **RF:** RF-24 (Configuración de flujos de aprobación diferenciados)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/approval-flows/flow123
Authorization: Bearer <jwt_token>
```

### GET /approval-flows/default/search
- **Tipo:** Query (CQRS)
- **Descripción:** Busca el flujo de aprobación predeterminado para un contexto
- **RF:** RF-24 (Configuración de flujos de aprobación diferenciados)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Query Params:** programId, resourceType, categoryId
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/approval-flows/default/search?programId=program123&resourceType=AULA
Authorization: Bearer <jwt_token>
```

### POST /approval-flows/:id/levels
- **Tipo:** Command (CQRS)
- **Descripción:** Crea un nivel de aprobación dentro de un flujo
- **RF:** RF-24 (Configuración de flujos de aprobación diferenciados)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (COORDINATOR, ADMIN)
- **Ejemplo de uso:**
```bash
POST http://localhost:3004/approval-flows/flow123/levels
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "levelNumber": 1,
  "name": "Aprobación Coordinador",
  "requiredApproverId": "user123",
  "isRequired": true,
  "timeoutHours": 48
}
```

### GET /approval-flows/:id/levels
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene los niveles de un flujo de aprobación
- **RF:** RF-24 (Configuración de flujos de aprobación diferenciados)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/approval-flows/flow123/levels
Authorization: Bearer <jwt_token>
```

---

## 📋 ENDPOINTS DE SOLICITUDES DE APROBACIÓN

### POST /approval-flows/reservations/:reservationId/submit
- **Tipo:** Command (CQRS)
- **Descripción:** Envía una reserva al proceso de aprobación
- **RF:** RF-20 (Validar solicitudes de reserva)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
POST http://localhost:3004/approval-flows/reservations/reservation123/submit
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "resourceId": "resource456",
  "resourceType": "LABORATORIO",
  "categoryId": "category789",
  "programId": "program123"
}
```

### GET /approval-flows/requests/pending
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene solicitudes de aprobación pendientes con paginación
- **RF:** RF-20 (Validar solicitudes de reserva)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Query Params:** approverId, programId, resourceType, categoryId, page, limit
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/approval-flows/requests/pending?approverId=user123&page=1&limit=10
Authorization: Bearer <jwt_token>
```

### POST /approval-flows/requests/:requestId/process
- **Tipo:** Command (CQRS)
- **Descripción:** Procesa una solicitud de aprobación (aprobar/rechazar)
- **RF:** RF-18, RF-19 (Aprobar/rechazar reserva)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (APPROVER, COORDINATOR, ADMIN)
- **Ejemplo de uso:**
```bash
POST http://localhost:3004/approval-flows/requests/request123/process
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "action": "APPROVED",
  "comment": "Solicitud aprobada según criterios establecidos",
  "priority": "NORMAL"
}
```

### GET /approval-flows/reservations/:reservationId/requests
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene todas las solicitudes de aprobación de una reserva
- **RF:** RF-25 (Registro y trazabilidad de aprobaciones)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/approval-flows/reservations/reservation123/requests
Authorization: Bearer <jwt_token>
```

### GET /approval-flows/reservations/:reservationId/status
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene el estado actual de aprobación de una reserva
- **RF:** RF-25 (Registro y trazabilidad de aprobaciones)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/approval-flows/reservations/reservation123/status
Authorization: Bearer <jwt_token>
```

### POST /approval-flows/reservations/:reservationId/cancel
- **Tipo:** Command (CQRS)
- **Descripción:** Cancela una reserva y su proceso de aprobación
- **RF:** RF-25 (Registro y trazabilidad de aprobaciones)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
POST http://localhost:3004/approval-flows/reservations/reservation123/cancel
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "reason": "El usuario canceló la solicitud"
}
```

---

## 📄 ENDPOINTS DE PLANTILLAS DE DOCUMENTOS

### POST /document-templates
- **Tipo:** Command (CQRS)
- **Descripción:** Crea una nueva plantilla de documento para aprobaciones
- **RF:** RF-21 (Generación automática de documentos)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (COORDINATOR, ADMIN)
- **Ejemplo de uso:**
```bash
POST http://localhost:3004/document-templates
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Carta de Aprobación Laboratorio",
  "type": "APPROVAL_LETTER",
  "eventType": "RESERVATION_APPROVED",
  "templateContent": "<html>Estimado {{user.name}}, su reserva {{reservation.title}} ha sido aprobada...</html>",
  "isActive": true
}
```

### GET /document-templates
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene plantillas de documentos con filtros
- **RF:** RF-21 (Generación automática de documentos)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Query Params:** type, eventType, isActive
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/document-templates?type=APPROVAL_LETTER&isActive=true
Authorization: Bearer <jwt_token>
```

### GET /document-templates/:id
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene una plantilla de documento específica
- **RF:** RF-21 (Generación automática de documentos)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/document-templates/template123
Authorization: Bearer <jwt_token>
```

### PUT /document-templates/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Actualiza una plantilla de documento existente
- **RF:** RF-21 (Generación automática de documentos)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (COORDINATOR, ADMIN)
- **Ejemplo de uso:**
```bash
PUT http://localhost:3004/document-templates/template123
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Carta de Aprobación Actualizada",
  "templateContent": "<html>Nueva plantilla actualizada...</html>"
}
```

### DELETE /document-templates/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Elimina una plantilla de documento
- **RF:** RF-21 (Generación automática de documentos)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (COORDINATOR, ADMIN)
- **Ejemplo de uso:**
```bash
DELETE http://localhost:3004/document-templates/template123
Authorization: Bearer <jwt_token>
```

### POST /document-templates/:id/upload
- **Tipo:** Command (CQRS)
- **Descripción:** Carga archivo de plantilla (Word, PDF, etc.)
- **RF:** RF-21 (Generación automática de documentos)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (COORDINATOR, ADMIN)
- **Ejemplo de uso:**
```bash
POST http://localhost:3004/document-templates/template123/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

--form file=@plantilla.docx
```

### POST /document-templates/generate
- **Tipo:** Command (CQRS)
- **Descripción:** Genera un documento basado en plantilla y datos
- **RF:** RF-21 (Generación automática de documentos)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
POST http://localhost:3004/document-templates/generate
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "templateId": "template123",
  "reservationId": "reservation456",
  "format": "PDF",
  "deliveryMethod": "EMAIL"
}
```

### GET /document-templates/generated/:documentId/download
- **Tipo:** Query (CQRS)
- **Descripción:** Descarga un documento generado
- **RF:** RF-21 (Generación automática de documentos)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/document-templates/generated/doc123/download
Authorization: Bearer <jwt_token>
```

---

## 📬 ENDPOINTS DE PLANTILLAS DE NOTIFICACIONES

### POST /notification-templates
- **Tipo:** Command (CQRS)
- **Descripción:** Crea plantilla de notificación (email, WhatsApp, SMS)
- **RF:** RF-22, RF-27 (Notificación automática, integración mensajería)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (COORDINATOR, ADMIN)
- **Ejemplo de uso:**
```bash
POST http://localhost:3004/notification-templates
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Notificación Aprobación WhatsApp",
  "channel": "WHATSAPP",
  "eventType": "RESERVATION_APPROVED",
  "subject": "Reserva Aprobada",
  "templateContent": "Hola {{user.name}}, tu reserva {{reservation.title}} ha sido aprobada ✅",
  "isActive": true
}
```

### GET /notification-templates
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene plantillas de notificación con filtros
- **RF:** RF-22, RF-27 (Notificación automática, integración mensajería)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Query Params:** channel, eventType, isActive
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/notification-templates?channel=WHATSAPP&eventType=RESERVATION_APPROVED
Authorization: Bearer <jwt_token>
```

### GET /notification-templates/:id
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene una plantilla de notificación específica
- **RF:** RF-22, RF-27 (Notificación automática, integración mensajería)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/notification-templates/template123
Authorization: Bearer <jwt_token>
```

### PUT /notification-templates/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Actualiza una plantilla de notificación
- **RF:** RF-22, RF-27 (Notificación automática, integración mensajería)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (COORDINATOR, ADMIN)
- **Ejemplo de uso:**
```bash
PUT http://localhost:3004/notification-templates/template123
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "templateContent": "Mensaje actualizado: Tu reserva {{reservation.title}} está aprobada 🎉"
}
```

### DELETE /notification-templates/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Elimina una plantilla de notificación
- **RF:** RF-22, RF-27 (Notificación automática, integración mensajería)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (COORDINATOR, ADMIN)
- **Ejemplo de uso:**
```bash
DELETE http://localhost:3004/notification-templates/template123
Authorization: Bearer <jwt_token>
```

### POST /notification-templates/send
- **Tipo:** Command (CQRS)
- **Descripción:** Envía notificación usando plantilla específica
- **RF:** RF-22, RF-27, RF-28 (Notificaciones automáticas)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
POST http://localhost:3004/notification-templates/send
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "templateId": "template123",
  "recipientId": "user456",
  "reservationId": "reservation789",
  "channel": "WHATSAPP",
  "priority": "HIGH"
}
```

### GET /notification-templates/history
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene historial de notificaciones enviadas
- **RF:** RF-25 (Registro y trazabilidad)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Query Params:** recipientId, channel, status, page, limit
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/notification-templates/history?recipientId=user123&channel=EMAIL&page=1&limit=20
Authorization: Bearer <jwt_token>
```

---

## 🔍 ENDPOINTS GENERALES DE STOCKPILE

### GET /stockpile/health
- **Tipo:** Query (RESTful)
- **Descripción:** Verifica estado de salud del servicio
- **RF:** Operacional (monitoreo)
- **Acceso:** Público (HTTP)
- **Guards:** Ninguno
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/stockpile/health
```

### GET /stockpile/metrics
- **Tipo:** Query (RESTful)
- **Descripción:** Obtiene métricas del servicio de aprobaciones
- **RF:** Operacional (monitoreo)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (ADMIN)
- **Ejemplo de uso:**
```bash
GET http://localhost:3004/stockpile/metrics
Authorization: Bearer <jwt_token>
```

---

## 📊 ESTADÍSTICAS
- **Total Endpoints Documentados:** 31
- **Commands (CQRS):** 18
- **Queries (CQRS):** 13
- **Endpoints Públicos:** 1
- **Endpoints Privados:** 30
- **Con Guards de Rol:** 25
- **RF Implementados:** RF-20, RF-21, RF-22, RF-24, RF-25, RF-27, RF-28

---

*Inventario generado: 2025-01-03*  
*Estado: Documentación completa de Stockpile Service*
