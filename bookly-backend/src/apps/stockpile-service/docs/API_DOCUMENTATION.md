# Stockpile Service API Documentation

## Índice

- [Stockpile Service API Documentation](#stockpile-service-api-documentation)
  - [Índice](#índice)
  - [Información General](#información-general)
    - [Características Principales](#características-principales)
    - [Base URL](#base-url)
    - [Arquitectura](#arquitectura)
  - [Autenticación y Seguridad](#autenticación-y-seguridad)
    - [Autenticación JWT](#autenticación-jwt)
    - [Roles y Permisos](#roles-y-permisos)
    - [Rate Limiting](#rate-limiting)
    - [Auditoría y Logging](#auditoría-y-logging)
    - [Formato de Token JWT](#formato-de-token-jwt)
  - [🔄 Gestión de Flujos de Aprobación](#-gestión-de-flujos-de-aprobación)
    - [POST /approval-flows](#post-approval-flows)
    - [PUT /approval-flows/:id](#put-approval-flowsid)
    - [GET /approval-flows](#get-approval-flows)
    - [GET /approval-flows/:id](#get-approval-flowsid)
  - [📄 Gestión de Plantillas de Documentos](#-gestión-de-plantillas-de-documentos)
    - [POST /document-templates](#post-document-templates)
    - [PUT /document-templates/:id](#put-document-templatesid)
    - [GET /document-templates](#get-document-templates)
    - [GET /document-templates/:id](#get-document-templatesid)
    - [POST /document-templates/:id/upload](#post-document-templatesidupload)
    - [POST /document-templates/:id/generate](#post-document-templatesidgenerate)
    - [GET /document-templates/:id/download](#get-document-templatesiddownload)
  - [📧 Gestión de Plantillas de Notificaciones](#-gestión-de-plantillas-de-notificaciones)
    - [POST /notification-templates/channels](#post-notification-templateschannels)
    - [GET /notification-templates/channels](#get-notification-templateschannels)
    - [POST /notification-templates](#post-notification-templates)
    - [PUT /notification-templates/:id](#put-notification-templatesid)
    - [GET /notification-templates](#get-notification-templates)
    - [GET /notification-templates/:id](#get-notification-templatesid)
    - [POST /notification-templates/config](#post-notification-templatesconfig)
    - [POST /notification-templates/send](#post-notification-templatessend)
    - [GET /notification-templates/history](#get-notification-templateshistory)
  - [🎯 Gestión de Aprobaciones y Validaciones](#-gestión-de-aprobaciones-y-validaciones)
    - [GET /stockpile/approvals](#get-stockpileapprovals)
    - [GET /stockpile/approvals/:id](#get-stockpileapprovalsid)
    - [POST /stockpile/approvals/:id/approve](#post-stockpileapprovalsidapprove)
    - [POST /stockpile/approvals/:id/reject](#post-stockpileapprovalsidreject)
    - [POST /stockpile/approvals/:id/document](#post-stockpileapprovalsiddocument)
    - [POST /stockpile/notifications](#post-stockpilenotifications)
    - [POST /stockpile/check-in/:reservationId](#post-stockpilecheck-inreservationid)
    - [POST /stockpile/check-out/:reservationId](#post-stockpilecheck-outreservationid)
  - [Manejo de Errores](#manejo-de-errores)
    - [Códigos de Estado HTTP](#códigos-de-estado-http)
    - [Formato de Respuesta de Error](#formato-de-respuesta-de-error)
    - [Códigos de Error Específicos](#códigos-de-error-específicos)
      - [Flujos de Aprobación (STPL-01XX)](#flujos-de-aprobación-stpl-01xx)
      - [Plantillas de Documentos (STPL-02XX)](#plantillas-de-documentos-stpl-02xx)
      - [Aprobaciones (STPL-03XX)](#aprobaciones-stpl-03xx)
      - [Notificaciones (STPL-04XX)](#notificaciones-stpl-04xx)
      - [Check-in/Check-out (STPL-05XX)](#check-incheck-out-stpl-05xx)
    - [Ejemplos de Respuestas de Error](#ejemplos-de-respuestas-de-error)
  - [Variables de Entorno para Postman](#variables-de-entorno-para-postman)
    - [Variables Base](#variables-base)
    - [Variables de Testing](#variables-de-testing)
    - [Variables por Área Funcional](#variables-por-área-funcional)
      - [Flujos de Aprobación](#flujos-de-aprobación)
      - [Plantillas de Documentos](#plantillas-de-documentos)
      - [Notificaciones](#notificaciones)
    - [Scripts Pre-request para Auto-login](#scripts-pre-request-para-auto-login)
    - [Tests Automáticos para Respuestas Exitosas](#tests-automáticos-para-respuestas-exitosas)
    - [Tests para Manejo de Errores](#tests-para-manejo-de-errores)
  - [Restricciones de Dominio](#restricciones-de-dominio)
    - [Flujos de Aprobación](#flujos-de-aprobación-1)
      - [Restricciones de Configuración](#restricciones-de-configuración)
      - [Restricciones de Modificación](#restricciones-de-modificación)
    - [Plantillas de Documentos](#plantillas-de-documentos-1)
      - [Restricciones de Formato](#restricciones-de-formato)
      - [Restricciones de Generación](#restricciones-de-generación)
    - [Notificaciones](#notificaciones-1)
      - [Restricciones de Canales](#restricciones-de-canales)
      - [Restricciones de Contenido](#restricciones-de-contenido)
    - [Aprobaciones y Validaciones](#aprobaciones-y-validaciones)
      - [Restricciones de Procesamiento](#restricciones-de-procesamiento)
      - [Restricciones de Conflictos](#restricciones-de-conflictos)
    - [Check-in/Check-out Digital](#check-incheck-out-digital)
      - [Restricciones Temporales](#restricciones-temporales)
      - [Restricciones de Ubicación](#restricciones-de-ubicación)
    - [Restricciones de Roles y Permisos](#restricciones-de-roles-y-permisos)
      - [COORDINATOR](#coordinator)
      - [MONITOR](#monitor)
      - [ADMIN](#admin)
  - [Seguridad y Observabilidad](#seguridad-y-observabilidad)
    - [Seguridad](#seguridad)
      - [Autenticación y Autorización](#autenticación-y-autorización)
      - [Rate Limiting y Protección](#rate-limiting-y-protección)
      - [Validación y Sanitización](#validación-y-sanitización)
    - [Logging y Auditoría](#logging-y-auditoría)
      - [Niveles de Logging](#niveles-de-logging)
    - [Monitoreo y Observabilidad](#monitoreo-y-observabilidad)
      - [Métricas con OpenTelemetry](#métricas-con-opentelemetry)
      - [Trazabilidad Distribuida](#trazabilidad-distribuida)
      - [Alertas y Notificaciones con Sentry](#alertas-y-notificaciones-con-sentry)
    - [Configuración de Seguridad](#configuración-de-seguridad)
      - [Variables de Entorno de Seguridad](#variables-de-entorno-de-seguridad)
      - [Health Checks de Seguridad](#health-checks-de-seguridad)

---

## Información General

El **Stockpile Service** es el microservicio encargado de gestionar todos los flujos de aprobación y validaciones del sistema Bookly UFPS. Maneja la configuración de workflows de aprobación, generación automática de documentos, sistema de notificaciones y procesos de check-in/check-out digital.

### Características Principales

- **RF-20**: Validar solicitudes de reserva por parte de un responsable
- **RF-21**: Generación automática de documentos de aprobación o rechazo
- **RF-22**: Notificación automática al solicitante con el estado de la solicitud
- **RF-23**: Pantalla de control para el personal de vigilancia
- **RF-24**: Configuración de flujos de aprobación diferenciados
- **RF-25**: Registro y trazabilidad de todas las aprobaciones
- **RF-26**: Check-in/check-out digital (opcional)
- **RF-27**: Integración con sistemas de mensajería (correo, WhatsApp)
- **RF-28**: Notificaciones automáticas de cambios en reservas

### Base URL

```
http://localhost:3004
```

### Arquitectura

El Stockpile Service implementa:

- **Clean Architecture**: Separación clara entre dominio, aplicación e infraestructura
- **CQRS**: Commands para modificaciones, Queries para consultas
- **Event-Driven Architecture**: Eventos distribuidos vía RabbitMQ para sincronización
- **Swagger**: Documentación automática de APIs REST
- **Observabilidad**: Integración con Winston, OpenTelemetry y Sentry

---

## Autenticación y Seguridad

### Autenticación JWT

Todos los endpoints requieren autenticación JWT vía header:

```http
Authorization: Bearer <jwt_token>
```

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **STUDENT** | Consultar estado de sus solicitudes |
| **TEACHER** | Consultar y solicitar aprobaciones básicas |
| **MONITOR** | Gestión básica de aprobaciones de nivel bajo |
| **COORDINATOR** | Configurar flujos de aprobación, gestionar plantillas |
| **PROGRAM_ADMIN** | Gestión completa de flujos de su programa |
| **ADMIN** | Gestión completa de todos los flujos del sistema |

### Rate Limiting

- **Consultas**: 50 req/min por usuario
- **Creación de flujos**: 10 req/min por usuario
- **Procesamiento de aprobaciones**: 30 req/min por usuario
- **Generación de documentos**: 20 req/min por usuario
- **Envío de notificaciones**: 100 req/min por usuario

### Auditoría y Logging

Todas las operaciones críticas son auditadas:

- **Creación/Modificación de flujos**: Registro completo con usuario y timestamp
- **Procesamiento de aprobaciones**: Log completo de decisiones
- **Generación de documentos**: Trazabilidad de documentos generados
- **Notificaciones**: Registro de envíos y fallos

### Formato de Token JWT

```json
{
  "sub": "user-uuid-123",
  "email": "usuario@ufps.edu.co",
  "roles": ["COORDINATOR", "PROGRAM_ADMIN"],
  "programs": ["ING-SIS", "ING-IND"],
  "iat": 1640995200,
  "exp": 1640998800
}
```

---

## 🔄 Gestión de Flujos de Aprobación

Los endpoints de `/approval-flows` permiten configurar y gestionar workflows de aprobación personalizados por programa académico, tipo de recurso y categoría.

### POST /approval-flows

**Crear un nuevo flujo de aprobación (RF-24)**

Permite configurar workflows personalizados con múltiples niveles de aprobación.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: COORDINATOR, ADMIN
- 🛡️ COORDINATOR solo puede crear flujos para su programa
- 📝 Auditoría completa de creación
- 🔒 Rate limiting: 10 creaciones por hora

**Request Body**:

```json
{
  "name": "Flujo Laboratorio Sistemas",
  "description": "Flujo específico para reservas de laboratorio de sistemas",
  "programId": "program-123",
  "resourceType": "LABORATORY",
  "categoryId": "category-456",
  "isDefault": false,
  "requiresAllLevels": true,
  "timeoutHours": 48,
  "levels": [
    {
      "level": 1,
      "name": "Aprobación Técnica",
      "approverRoles": ["MONITOR", "TEACHER"],
      "requiredApprovers": 1,
      "timeoutHours": 24,
      "canDelegate": true,
      "isOptional": false
    }
  ]
}
```

**Response Success (201)**:

```json
{
  "success": true,
  "message": "Flujo de aprobación creado exitosamente",
  "data": {
    "id": "flow-789",
    "name": "Flujo Laboratorio Sistemas",
    "description": "Flujo específico para reservas de laboratorio de sistemas",
    "programId": "program-123",
    "resourceType": "LABORATORY",
    "categoryId": "category-456",
    "isDefault": false,
    "isActive": true,
    "requiresAllLevels": true,
    "timeoutHours": 48,
    "createdBy": "user-456",
    "createdAt": "2024-01-20T21:00:00Z"
  }
}
```

### PUT /approval-flows/:id

**Actualizar un flujo de aprobación existente**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: COORDINATOR, ADMIN
- 🛡️ COORDINATOR solo puede actualizar flujos de su programa
- 📝 Auditoría completa de modificación
- 🔒 Rate limiting: 10 modificaciones por hora

**Request Body**:
```json
{
  "name": "Flujo Laboratorio Sistemas Actualizado",
  "description": "Descripción actualizada",
  "timeoutHours": 72,
  "isActive": true
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Flujo de aprobación actualizado exitosamente",
  "data": {
    "id": "flow-789",
    "name": "Flujo Laboratorio Sistemas Actualizado",
    "updatedAt": "2024-01-20T22:00:00Z"
  }
}
```

### GET /approval-flows

**Obtener lista de flujos de aprobación**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Acceso para todos los roles autenticados
- 🛡️ Filtrado automático por programa si no es ADMIN
- 🔒 Rate limiting: 50 consultas por minuto

**Query Parameters**:
- `programId` (string, opcional): ID del programa académico
- `resourceType` (string, opcional): Tipo de recurso
- `categoryId` (string, opcional): ID de categoría
- `isActive` (boolean, opcional): Estado activo
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Elementos por página (default: 10, max: 100)

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "flow-789",
      "name": "Flujo Laboratorio Sistemas",
      "programId": "program-123",
      "resourceType": "LABORATORY",
      "isDefault": false,
      "isActive": true,
      "levels": [
        {
          "level": 1,
          "name": "Aprobación Técnica",
          "approverRoles": ["MONITOR", "TEACHER"]
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

### GET /approval-flows/:id

**Obtener detalles de un flujo específico**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Acceso para todos los roles autenticados
- 🛡️ Verificación de acceso por programa
- 🔒 Rate limiting: 100 consultas por minuto

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "id": "flow-789",
    "name": "Flujo Laboratorio Sistemas",
    "description": "Flujo específico para reservas de laboratorio de sistemas",
    "programId": "program-123",
    "resourceType": "LABORATORY",
    "categoryId": "category-456",
    "isDefault": false,
    "isActive": true,
    "requiresAllLevels": true,
    "timeoutHours": 48,
    "levels": [
      {
        "id": "level-123",
        "level": 1,
        "name": "Aprobación Técnica",
        "approverRoles": ["MONITOR", "TEACHER"],
        "requiredApprovers": 1,
        "timeoutHours": 24,
        "canDelegate": true,
        "isOptional": false
      }
    ],
    "createdBy": "user-456",
    "createdAt": "2024-01-20T21:00:00Z",
    "updatedAt": "2024-01-20T21:00:00Z"
  }
}
```

---

## 📄 Gestión de Plantillas de Documentos

Los endpoints de `/document-templates` permiten gestionar plantillas para la generación automática de documentos de aprobación y rechazo (RF-21).

### POST /document-templates

**Crear una nueva plantilla de documento**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: COORDINATOR, ADMIN
- 📝 Auditoría completa de creación
- 🔒 Rate limiting: 10 creaciones por hora

**Request Body**:
```json
{
  "name": "Carta Aprobación Laboratorio",
  "description": "Plantilla para cartas de aprobación de laboratorios",
  "type": "APPROVAL",
  "programId": "program-123",
  "resourceType": "LABORATORY",
  "templateContent": "<html>Estimado {{userName}}, su solicitud para {{resourceName}} ha sido {{status}}</html>",
  "variables": [
    {
      "name": "userName",
      "description": "Nombre del usuario solicitante",
      "type": "string",
      "required": true
    },
    {
      "name": "resourceName", 
      "description": "Nombre del recurso solicitado",
      "type": "string",
      "required": true
    },
    {
      "name": "status",
      "description": "Estado de la solicitud",
      "type": "string",
      "required": true
    }
  ],
  "isActive": true
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Plantilla de documento creada exitosamente",
  "data": {
    "id": "template-456",
    "name": "Carta Aprobación Laboratorio",
    "type": "APPROVAL",
    "programId": "program-123",
    "resourceType": "LABORATORY",
    "isActive": true,
    "createdAt": "2024-01-20T21:00:00Z"
  }
}
```

### PUT /document-templates/:id

**Actualizar una plantilla de documento existente**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: COORDINATOR, ADMIN
- 🛡️ COORDINATOR solo puede actualizar plantillas de su programa
- 📝 Auditoría completa de modificación
- 🔒 Rate limiting: 10 modificaciones por hora

**Request Body**:
```json
{
  "name": "Carta Aprobación Laboratorio Actualizada",
  "description": "Descripción actualizada",
  "templateContent": "<html>Contenido actualizado {{userName}}</html>",
  "isActive": true
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Plantilla actualizada exitosamente",
  "data": {
    "id": "template-456",
    "name": "Carta Aprobación Laboratorio Actualizada",
    "updatedAt": "2024-01-20T22:00:00Z"
  }
}
```

### GET /document-templates

**Obtener lista de plantillas de documentos**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Acceso para todos los roles autenticados
- 🛡️ Filtrado automático por programa si no es ADMIN
- 🔒 Rate limiting: 50 consultas por minuto

**Query Parameters**:
- `programId` (string, opcional): ID del programa académico
- `type` (string, opcional): Tipo de plantilla (APPROVAL, REJECTION)
- `resourceType` (string, opcional): Tipo de recurso
- `isActive` (boolean, opcional): Estado activo
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Elementos por página (default: 10, max: 100)

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "template-456",
      "name": "Carta Aprobación Laboratorio",
      "type": "APPROVAL",
      "programId": "program-123",
      "resourceType": "LABORATORY",
      "isActive": true,
      "createdAt": "2024-01-20T21:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "totalPages": 1
  }
}
```

### GET /document-templates/:id

**Obtener detalles de una plantilla específica**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Acceso para todos los roles autenticados
- 🛡️ Verificación de acceso por programa
- 🔒 Rate limiting: 100 consultas por minuto

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "id": "template-456",
    "name": "Carta Aprobación Laboratorio",
    "description": "Plantilla para cartas de aprobación de laboratorios",
    "type": "APPROVAL",
    "programId": "program-123",
    "resourceType": "LABORATORY",
    "templateContent": "<html>Estimado {{userName}}, su solicitud para {{resourceName}} ha sido {{status}}</html>",
    "variables": [
      {
        "name": "userName",
        "description": "Nombre del usuario solicitante",
        "type": "string",
        "required": true
      }
    ],
    "isActive": true,
    "createdBy": "user-456",
    "createdAt": "2024-01-20T21:00:00Z",
    "updatedAt": "2024-01-20T21:00:00Z"
  }
}
```

### POST /document-templates/:id/upload

**Subir archivo de plantilla (PDF, DOCX)**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: COORDINATOR, ADMIN
- 🛡️ Validación de tipo de archivo (PDF, DOCX)
- 📁 Límite de tamaño: 5MB
- 🔒 Rate limiting: 10 subidas por hora

**Request**: Multipart form-data
- `file` (File): Archivo de plantilla

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Archivo de plantilla subido exitosamente",
  "data": {
    "templateId": "template-456",
    "fileName": "plantilla-aprobacion.docx",
    "fileSize": 1024576,
    "uploadedAt": "2024-01-20T21:00:00Z"
  }
}
```

### POST /document-templates/:id/generate

**Generar documento usando plantilla (RF-21)**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: MONITOR, COORDINATOR, ADMIN
- 📝 Auditoría de generación de documentos
- 🔒 Rate limiting: 20 generaciones por minuto

**Request Body**:
```json
{
  "reservationId": "reservation-789",
  "variables": {
    "userName": "Juan Pérez",
    "resourceName": "Laboratorio de Sistemas",
    "status": "APROBADA",
    "approvalDate": "2024-01-21",
    "comments": "Aprobación otorgada por coordinador"
  },
  "outputFormat": "PDF"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Documento generado exitosamente",
  "data": {
    "documentId": "doc-123",
    "fileName": "aprobacion-reservation-789.pdf",
    "downloadUrl": "/document-templates/doc-123/download",
    "generatedAt": "2024-01-20T21:00:00Z",
    "expiresAt": "2024-01-27T21:00:00Z"
  }
}
```

### GET /document-templates/:id/download

**Descargar documento generado**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Acceso para todos los roles autenticados
- 🛡️ Verificación de acceso al documento
- ⏰ Enlaces de descarga con expiración (7 días)
- 🔒 Rate limiting: 50 descargas por minuto

**Response**: Archivo binario (PDF/DOCX)

---

## 📧 Gestión de Plantillas de Notificaciones

Los endpoints de `/notification-templates` permiten configurar y gestionar el sistema de notificaciones automáticas (RF-22, RF-27, RF-28).

### POST /notification-templates/channels

**Crear un nuevo canal de notificación**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN
- 📝 Auditoría completa de creación
- 🔒 Rate limiting: 5 creaciones por hora

**Request Body**:
```json
{
  "name": "WhatsApp UFPS",
  "type": "WHATSAPP",
  "description": "Canal WhatsApp oficial UFPS",
  "config": {
    "apiKey": "whatsapp-api-key",
    "phoneNumber": "+573001234567",
    "webhookUrl": "https://api.ufps.edu.co/webhook/whatsapp"
  },
  "isActive": true
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Canal de notificación creado exitosamente",
  "data": {
    "id": "channel-123",
    "name": "WhatsApp UFPS",
    "type": "WHATSAPP",
    "isActive": true,
    "createdAt": "2024-01-20T21:00:00Z"
  }
}
```

### GET /notification-templates/channels

**Obtener lista de canales de notificación**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Acceso para COORDINATOR, ADMIN
- 🔒 Rate limiting: 50 consultas por minuto

**Query Parameters**:
- `type` (string, opcional): Tipo de canal (EMAIL, SMS, WHATSAPP, PUSH)
- `isActive` (boolean, opcional): Estado activo

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "channel-123",
      "name": "WhatsApp UFPS",
      "type": "WHATSAPP",
      "isActive": true,
      "createdAt": "2024-01-20T21:00:00Z"
    },
    {
      "id": "channel-456",
      "name": "Email Institucional",
      "type": "EMAIL",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /notification-templates

**Crear una nueva plantilla de notificación**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: COORDINATOR, ADMIN
- 📝 Auditoría completa de creación
- 🔒 Rate limiting: 10 creaciones por hora

**Request Body**:
```json
{
  "name": "Aprobación Laboratorio",
  "description": "Notificación de aprobación de reserva de laboratorio",
  "type": "APPROVAL_NOTIFICATION",
  "channelIds": ["channel-123", "channel-456"],
  "programId": "program-123",
  "resourceType": "LABORATORY",
  "subject": "✅ Reserva Aprobada - {{resourceName}}",
  "content": "Estimado {{userName}}, su reserva para {{resourceName}} ha sido APROBADA. Fecha: {{reservationDate}}. Hora: {{reservationTime}}.",
  "variables": [
    {
      "name": "userName",
      "description": "Nombre del usuario",
      "type": "string",
      "required": true
    },
    {
      "name": "resourceName",
      "description": "Nombre del recurso",
      "type": "string",
      "required": true
    },
    {
      "name": "reservationDate",
      "description": "Fecha de la reserva",
      "type": "date",
      "required": true
    },
    {
      "name": "reservationTime",
      "description": "Hora de la reserva",
      "type": "time",
      "required": true
    }
  ],
  "triggerEvents": ["RESERVATION_APPROVED"],
  "isActive": true
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Plantilla de notificación creada exitosamente",
  "data": {
    "id": "template-789",
    "name": "Aprobación Laboratorio",
    "type": "APPROVAL_NOTIFICATION",
    "channelIds": ["channel-123", "channel-456"],
    "isActive": true,
    "createdAt": "2024-01-20T21:00:00Z"
  }
}
```

### PUT /notification-templates/:id

**Actualizar plantilla de notificación existente**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: COORDINATOR, ADMIN
- 🛡️ COORDINATOR solo puede actualizar plantillas de su programa
- 📝 Auditoría completa de modificación
- 🔒 Rate limiting: 10 modificaciones por hora

**Request Body**:
```json
{
  "name": "Aprobación Laboratorio Actualizada",
  "subject": "✅ Reserva Aprobada - {{resourceName}} [ACTUALIZADA]",
  "content": "Contenido actualizado de la notificación",
  "isActive": true
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Plantilla actualizada exitosamente",
  "data": {
    "id": "template-789",
    "name": "Aprobación Laboratorio Actualizada",
    "updatedAt": "2024-01-20T22:00:00Z"
  }
}
```

### GET /notification-templates

**Obtener lista de plantillas de notificación**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Acceso para todos los roles autenticados
- 🛡️ Filtrado automático por programa si no es ADMIN
- 🔒 Rate limiting: 50 consultas por minuto

**Query Parameters**:
- `programId` (string, opcional): ID del programa académico
- `type` (string, opcional): Tipo de plantilla
- `resourceType` (string, opcional): Tipo de recurso
- `isActive` (boolean, opcional): Estado activo
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Elementos por página (default: 10, max: 100)

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "template-789",
      "name": "Aprobación Laboratorio",
      "type": "APPROVAL_NOTIFICATION",
      "programId": "program-123",
      "resourceType": "LABORATORY",
      "channels": [
        {
          "id": "channel-123",
          "name": "WhatsApp UFPS",
          "type": "WHATSAPP"
        }
      ],
      "isActive": true,
      "createdAt": "2024-01-20T21:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}
```

### GET /notification-templates/:id

**Obtener detalles de una plantilla específica**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Acceso para todos los roles autenticados
- 🛡️ Verificación de acceso por programa
- 🔒 Rate limiting: 100 consultas por minuto

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "id": "template-789",
    "name": "Aprobación Laboratorio",
    "description": "Notificación de aprobación de reserva de laboratorio",
    "type": "APPROVAL_NOTIFICATION",
    "programId": "program-123",
    "resourceType": "LABORATORY",
    "subject": "✅ Reserva Aprobada - {{resourceName}}",
    "content": "Estimado {{userName}}, su reserva para {{resourceName}} ha sido APROBADA",
    "variables": [
      {
        "name": "userName",
        "description": "Nombre del usuario",
        "type": "string",
        "required": true
      }
    ],
    "channels": [
      {
        "id": "channel-123",
        "name": "WhatsApp UFPS",
        "type": "WHATSAPP",
        "isActive": true
      }
    ],
    "triggerEvents": ["RESERVATION_APPROVED"],
    "isActive": true,
    "createdBy": "user-456",
    "createdAt": "2024-01-20T21:00:00Z",
    "updatedAt": "2024-01-20T21:00:00Z"
  }
}
```

### POST /notification-templates/config

**Configurar parámetros globales de notificaciones**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN
- 📝 Auditoría completa de configuración
- 🔒 Rate limiting: 5 configuraciones por hora

**Request Body**:
```json
{
  "retryAttempts": 3,
  "retryDelay": 300,
  "batchSize": 50,
  "enableScheduledNotifications": true,
  "enableImmediateNotifications": true,
  "defaultChannelIds": ["channel-456"],
  "blackoutHours": {
    "start": "22:00",
    "end": "06:00"
  }
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Configuración actualizada exitosamente",
  "data": {
    "retryAttempts": 3,
    "retryDelay": 300,
    "batchSize": 50,
    "updatedAt": "2024-01-20T21:00:00Z"
  }
}
```

### POST /notification-templates/send

**Enviar notificación manual (RF-22, RF-27)**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: MONITOR, COORDINATOR, ADMIN
- 📝 Auditoría completa de envíos
- 🔒 Rate limiting: 100 envíos por minuto

**Request Body**:
```json
{
  "templateId": "template-789",
  "recipients": [
    {
      "userId": "user-123",
      "email": "usuario@ufps.edu.co",
      "phone": "+573001234567"
    }
  ],
  "variables": {
    "userName": "Juan Pérez",
    "resourceName": "Laboratorio de Sistemas",
    "reservationDate": "2024-01-21",
    "reservationTime": "10:00-12:00"
  },
  "channels": ["channel-123", "channel-456"],
  "priority": "HIGH",
  "scheduleAt": "2024-01-20T22:00:00Z"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Notificación enviada exitosamente",
  "data": {
    "notificationId": "notification-456",
    "recipients": 1,
    "channels": 2,
    "status": "SENT",
    "sentAt": "2024-01-20T21:00:00Z"
  }
}
```

### GET /notification-templates/history

**Obtener historial de notificaciones enviadas**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Acceso para todos los roles autenticados
- 🛡️ Filtrado automático por programa si no es ADMIN
- 🔒 Rate limiting: 50 consultas por minuto

**Query Parameters**:
- `userId` (string, opcional): ID del usuario destinatario
- `templateId` (string, opcional): ID de la plantilla
- `status` (string, opcional): Estado (PENDING, SENT, FAILED, DELIVERED)
- `channelType` (string, opcional): Tipo de canal
- `dateFrom` (string, opcional): Fecha desde (ISO 8601)
- `dateTo` (string, opcional): Fecha hasta (ISO 8601)
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Elementos por página (default: 10, max: 100)

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "notification-456",
      "templateId": "template-789",
      "templateName": "Aprobación Laboratorio",
      "recipient": {
        "userId": "user-123",
        "email": "usuario@ufps.edu.co",
        "phone": "+573001234567"
      },
      "channels": [
        {
          "type": "EMAIL",
          "status": "DELIVERED",
          "sentAt": "2024-01-20T21:00:00Z",
          "deliveredAt": "2024-01-20T21:00:15Z"
        },
        {
          "type": "WHATSAPP",
          "status": "SENT",
          "sentAt": "2024-01-20T21:00:05Z"
        }
      ],
      "status": "DELIVERED",
      "createdAt": "2024-01-20T21:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 145,
    "totalPages": 15
  }
}
```

---

## 🎯 Gestión de Aprobaciones y Validaciones

Los endpoints de `/stockpile` permiten gestionar el proceso de aprobación de solicitudes de reserva y validaciones del sistema (RF-20, RF-25).

### GET /stockpile/approvals

**Obtener lista de solicitudes pendientes de aprobación**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: MONITOR, COORDINATOR, ADMIN
- 🛡️ Filtrado automático por programa y permisos
- 🔒 Rate limiting: 50 consultas por minuto

**Query Parameters**:
- `status` (string, opcional): Estado (PENDING, IN_REVIEW, APPROVED, REJECTED)
- `programId` (string, opcional): ID del programa académico
- `resourceType` (string, opcional): Tipo de recurso
- `priority` (string, opcional): Prioridad (LOW, MEDIUM, HIGH, URGENT)
- `assignedTo` (string, opcional): ID del usuario asignado
- `dateFrom` (string, opcional): Fecha desde (ISO 8601)
- `dateTo` (string, opcional): Fecha hasta (ISO 8601)
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Elementos por página (default: 10, max: 100)

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "approval-123",
      "reservationId": "reservation-789",
      "user": {
        "id": "user-123",
        "name": "Juan Pérez",
        "email": "juan.perez@ufps.edu.co",
        "program": "ING-SIS"
      },
      "resource": {
        "id": "resource-456",
        "name": "Laboratorio de Sistemas",
        "type": "LABORATORY",
        "location": "Edificio A - Piso 3"
      },
      "requestedDate": "2024-01-21",
      "requestedTime": "10:00-12:00",
      "purpose": "Práctica de base de datos",
      "status": "PENDING",
      "priority": "MEDIUM",
      "currentLevel": 1,
      "totalLevels": 2,
      "approvalFlow": {
        "id": "flow-789",
        "name": "Flujo Laboratorio Sistemas"
      },
      "assignedTo": {
        "id": "user-456",
        "name": "María García",
        "role": "MONITOR"
      },
      "createdAt": "2024-01-20T15:00:00Z",
      "deadline": "2024-01-21T15:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "summary": {
    "pending": 15,
    "inReview": 5,
    "approved": 3,
    "rejected": 2
  }
}
```

### GET /stockpile/approvals/:id

**Obtener detalles de una solicitud específica**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: MONITOR, COORDINATOR, ADMIN
- 🛡️ Verificación de acceso por programa
- 🔒 Rate limiting: 100 consultas por minuto

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "id": "approval-123",
    "reservationId": "reservation-789",
    "user": {
      "id": "user-123",
      "name": "Juan Pérez",
      "email": "juan.perez@ufps.edu.co",
      "phone": "+573001234567",
      "program": "ING-SIS",
      "semester": 8
    },
    "resource": {
      "id": "resource-456",
      "name": "Laboratorio de Sistemas",
      "type": "LABORATORY",
      "location": "Edificio A - Piso 3",
      "capacity": 30,
      "equipment": ["30 Computadores", "Proyector", "Aire acondicionado"]
    },
    "requestedDate": "2024-01-21",
    "requestedTime": "10:00-12:00",
    "purpose": "Práctica de base de datos para la asignatura de Bases de Datos II",
    "participants": 25,
    "additionalEquipment": ["Marcadores", "Borrador"],
    "status": "PENDING",
    "priority": "MEDIUM",
    "currentLevel": 1,
    "totalLevels": 2,
    "approvalFlow": {
      "id": "flow-789",
      "name": "Flujo Laboratorio Sistemas",
      "levels": [
        {
          "level": 1,
          "name": "Aprobación Técnica",
          "status": "PENDING",
          "assignedTo": {
            "id": "user-456",
            "name": "María García",
            "role": "MONITOR"
          }
        },
        {
          "level": 2,
          "name": "Aprobación Coordinación",
          "status": "WAITING",
          "assignedTo": {
            "id": "user-789",
            "name": "Carlos López",
            "role": "COORDINATOR"
          }
        }
      ]
    },
    "history": [
      {
        "action": "REQUEST_CREATED",
        "user": {
          "id": "user-123",
          "name": "Juan Pérez"
        },
        "timestamp": "2024-01-20T15:00:00Z",
        "details": "Solicitud creada"
      },
      {
        "action": "ASSIGNED_TO_APPROVER",
        "user": {
          "id": "system",
          "name": "Sistema"
        },
        "timestamp": "2024-01-20T15:00:05Z",
        "details": "Asignada a María García para aprobación nivel 1"
      }
    ],
    "attachments": [
      {
        "id": "file-123",
        "name": "lista-estudiantes.pdf",
        "size": 1024576,
        "uploadedAt": "2024-01-20T15:00:00Z"
      }
    ],
    "createdAt": "2024-01-20T15:00:00Z",
    "deadline": "2024-01-21T15:00:00Z",
    "estimatedProcessingTime": "24 horas"
  }
}
```

### POST /stockpile/approvals/:id/approve

**Aprobar una solicitud de reserva (RF-20, RF-25)**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: MONITOR, COORDINATOR, ADMIN
- 🛡️ Verificación de permisos por programa y nivel de aprobación
- 📝 Auditoría completa de aprobación
- 🔒 Rate limiting: 30 aprobaciones por minuto

**Request Body**:
```json
{
  "approverId": "user-456",
  "comments": "Aprobado. El laboratorio está disponible y cumple con los requerimientos",
  "conditions": [
    "Debe traer lista de estudiantes",
    "Responsable del equipo durante la práctica"
  ],
  "notifyUser": true,
  "generateDocument": true,
  "documentTemplateId": "template-456"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Solicitud aprobada exitosamente",
  "data": {
    "approvalId": "approval-123",
    "status": "APPROVED",
    "level": 1,
    "approver": {
      "id": "user-456",
      "name": "María García",
      "role": "MONITOR"
    },
    "approvedAt": "2024-01-20T21:30:00Z",
    "nextLevel": {
      "level": 2,
      "name": "Aprobación Coordinación",
      "assignedTo": {
        "id": "user-789",
        "name": "Carlos López"
      },
      "deadline": "2024-01-22T21:30:00Z"
    },
    "notifications": [
      {
        "type": "EMAIL",
        "recipient": "juan.perez@ufps.edu.co",
        "status": "SENT"
      },
      {
        "type": "WHATSAPP",
        "recipient": "+573001234567",
        "status": "SENT"
      }
    ],
    "document": {
      "id": "doc-123",
      "fileName": "aprobacion-nivel-1.pdf",
      "downloadUrl": "/document-templates/doc-123/download"
    }
  }
}
```

### POST /stockpile/approvals/:id/reject

**Rechazar una solicitud de reserva (RF-20, RF-25)**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: MONITOR, COORDINATOR, ADMIN
- 🛡️ Verificación de permisos por programa y nivel de aprobación
- 📝 Auditoría completa de rechazo
- 🔒 Rate limiting: 30 rechazos por minuto

**Request Body**:
```json
{
  "approverId": "user-456",
  "reason": "RESOURCE_NOT_AVAILABLE",
  "comments": "El laboratorio no está disponible en el horario solicitado debido a mantenimiento programado",
  "suggestedAlternatives": [
    {
      "date": "2024-01-22",
      "time": "10:00-12:00",
      "resourceId": "resource-456"
    },
    {
      "date": "2024-01-21",
      "time": "14:00-16:00",
      "resourceId": "resource-789"
    }
  ],
  "notifyUser": true,
  "generateDocument": true,
  "documentTemplateId": "template-789"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Solicitud rechazada exitosamente",
  "data": {
    "approvalId": "approval-123",
    "status": "REJECTED",
    "level": 1,
    "approver": {
      "id": "user-456",
      "name": "María García",
      "role": "MONITOR"
    },
    "rejectedAt": "2024-01-20T21:30:00Z",
    "reason": "RESOURCE_NOT_AVAILABLE",
    "suggestedAlternatives": [
      {
        "date": "2024-01-22",
        "time": "10:00-12:00",
        "resource": {
          "id": "resource-456",
          "name": "Laboratorio de Sistemas"
        }
      }
    ],
    "notifications": [
      {
        "type": "EMAIL",
        "recipient": "juan.perez@ufps.edu.co",
        "status": "SENT"
      }
    ],
    "document": {
      "id": "doc-456",
      "fileName": "rechazo-solicitud.pdf",
      "downloadUrl": "/document-templates/doc-456/download"
    }
  }
}
```

### POST /stockpile/approvals/:id/document

**Generar documento de aprobación/rechazo (RF-21)**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: MONITOR, COORDINATOR, ADMIN
- 📝 Auditoría de generación de documentos
- 🔒 Rate limiting: 20 generaciones por minuto

**Request Body**:
```json
{
  "templateId": "template-456",
  "outputFormat": "PDF",
  "variables": {
    "approverName": "María García",
    "approverRole": "Monitor de Laboratorio",
    "approvalDate": "2024-01-20",
    "additionalComments": "Documento generado automáticamente"
  }
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Documento generado exitosamente",
  "data": {
    "documentId": "doc-789",
    "fileName": "carta-aprobacion-approval-123.pdf",
    "downloadUrl": "/document-templates/doc-789/download",
    "generatedAt": "2024-01-20T21:30:00Z",
    "expiresAt": "2024-01-27T21:30:00Z",
    "templateUsed": {
      "id": "template-456",
      "name": "Carta Aprobación Laboratorio"
    }
  }
}
```

### POST /stockpile/notifications

**Enviar notificación manual sobre solicitud (RF-22, RF-28)**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: MONITOR, COORDINATOR, ADMIN
- 📝 Auditoría de notificaciones manuales
- 🔒 Rate limiting: 100 notificaciones por minuto

**Request Body**:
```json
{
  "approvalId": "approval-123",
  "templateId": "template-789",
  "recipients": [
    {
      "userId": "user-123",
      "email": "juan.perez@ufps.edu.co",
      "phone": "+573001234567"
    }
  ],
  "channels": ["EMAIL", "WHATSAPP"],
  "variables": {
    "userName": "Juan Pérez",
    "resourceName": "Laboratorio de Sistemas",
    "status": "EN REVISIÓN",
    "comments": "Su solicitud está siendo revisada por el coordinador"
  },
  "priority": "MEDIUM",
  "scheduleAt": "2024-01-20T22:00:00Z"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Notificación enviada exitosamente",
  "data": {
    "notificationId": "notification-789",
    "approvalId": "approval-123",
    "recipients": 1,
    "channels": [
      {
        "type": "EMAIL",
        "status": "SENT",
        "sentAt": "2024-01-20T22:00:00Z"
      },
      {
        "type": "WHATSAPP",
        "status": "PENDING",
        "scheduledAt": "2024-01-20T22:00:00Z"
      }
    ]
  }
}
```

### POST /stockpile/check-in/:reservationId

**Registrar check-in de reserva (RF-26)**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: STUDENT, TEACHER, MONITOR, ADMIN
- 🛡️ Verificación de reserva activa y permisos
- 📝 Auditoría completa de check-in
- 🔒 Rate limiting: 50 check-ins por minuto

**Request Body**:
```json
{
  "userId": "user-123",
  "location": {
    "latitude": 7.8939,
    "longitude": -72.5078
  },
  "deviceInfo": {
    "deviceId": "device-456",
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.100"
  },
  "participants": 25,
  "comments": "Check-in realizado. Todos los estudiantes presentes"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Check-in registrado exitosamente",
  "data": {
    "checkInId": "checkin-123",
    "reservationId": "reservation-789",
    "user": {
      "id": "user-123",
      "name": "Juan Pérez"
    },
    "resource": {
      "id": "resource-456",
      "name": "Laboratorio de Sistemas",
      "location": "Edificio A - Piso 3"
    },
    "checkInTime": "2024-01-21T10:00:00Z",
    "scheduledStartTime": "2024-01-21T10:00:00Z",
    "status": "ON_TIME",
    "participants": 25,
    "location": {
      "latitude": 7.8939,
      "longitude": -72.5078,
      "accuracy": "5m"
    },
    "qrCode": {
      "token": "checkin-token-789",
      "expiresAt": "2024-01-21T12:00:00Z"
    }
  }
}
```

### POST /stockpile/check-out/:reservationId

**Registrar check-out de reserva (RF-26)**

**Security Restrictions**:
- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: STUDENT, TEACHER, MONITOR, ADMIN
- 🛡️ Verificación de check-in previo y permisos
- 📝 Auditoría completa de check-out
- 🔒 Rate limiting: 50 check-outs por minuto

**Request Body**:
```json
{
  "userId": "user-123",
  "checkInId": "checkin-123",
  "resourceCondition": "GOOD",
  "incidences": [],
  "comments": "Laboratorio entregado en perfectas condiciones. Práctica completada exitosamente",
  "equipmentReturned": [
    {
      "itemId": "item-123",
      "name": "Marcadores",
      "quantity": 3,
      "condition": "GOOD"
    }
  ]
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Check-out registrado exitosamente",
  "data": {
    "checkOutId": "checkout-456",
    "checkInId": "checkin-123",
    "reservationId": "reservation-789",
    "user": {
      "id": "user-123",
      "name": "Juan Pérez"
    },
    "resource": {
      "id": "resource-456",
      "name": "Laboratorio de Sistemas"
    },
    "checkInTime": "2024-01-21T10:00:00Z",
    "checkOutTime": "2024-01-21T12:00:00Z",
    "scheduledEndTime": "2024-01-21T12:00:00Z",
    "totalDuration": "2 horas",
    "status": "ON_TIME",
    "resourceCondition": "GOOD",
    "incidences": [],
    "equipmentReturned": [
      {
        "itemId": "item-123",
        "name": "Marcadores",
        "quantity": 3,
        "condition": "GOOD",
        "returnedAt": "2024-01-21T12:00:00Z"
      }
    ],
    "summary": {
      "reservationCompleted": true,
      "incidencesReported": 0,
      "equipmentReturned": true,
      "finalStatus": "COMPLETED"
    }
  }
}
```

---

## Manejo de Errores

El Stockpile Service utiliza códigos de estado HTTP estándar y devuelve respuestas de error estructuradas en formato JSON.

### Códigos de Estado HTTP

| Código | Significado | Uso |
|---------|-------------|-----|
| **200** | OK | Operación exitosa |
| **201** | Created | Recurso creado exitosamente |
| **400** | Bad Request | Datos de entrada inválidos |
| **401** | Unauthorized | Token JWT faltante o inválido |
| **403** | Forbidden | Sin permisos para realizar la operación |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | Conflicto con el estado actual del recurso |
| **422** | Unprocessable Entity | Error de validación de datos |
| **429** | Too Many Requests | Límite de rate limiting excedido |
| **500** | Internal Server Error | Error interno del servidor |
| **503** | Service Unavailable | Servicio temporalmente no disponible |

### Formato de Respuesta de Error

```json
{
  "success": false,
  "error": {
    "code": "STPL-0301",
    "message": "La solicitud de aprobación no existe o ha sido eliminada",
    "type": "error",
    "details": {
      "approvalId": "approval-123",
      "resource": "approvals",
      "action": "approve"
    },
    "timestamp": "2024-01-20T21:00:00Z",
    "path": "/stockpile/approvals/approval-123/approve",
    "requestId": "req-789"
  }
}
```

### Códigos de Error Específicos

#### Flujos de Aprobación (STPL-01XX)

- **STPL-0101**: Flujo de aprobación no encontrado
- **STPL-0102**: Flujo de aprobación inactivo
- **STPL-0103**: Usuario sin permisos para modificar flujo
- **STPL-0104**: Nivel de aprobación inválido
- **STPL-0105**: Configuración de flujo inválida

#### Plantillas de Documentos (STPL-02XX)

- **STPL-0201**: Plantilla de documento no encontrada
- **STPL-0202**: Formato de plantilla no soportado
- **STPL-0203**: Variable requerida faltante en plantilla
- **STPL-0204**: Error en generación de documento
- **STPL-0205**: Archivo de plantilla corrupto o inválido

#### Aprobaciones (STPL-03XX)

- **STPL-0301**: Solicitud de aprobación no encontrada
- **STPL-0302**: Solicitud ya procesada
- **STPL-0303**: Usuario no autorizado para aprobar
- **STPL-0304**: Nivel de aprobación incorrecto
- **STPL-0305**: Solicitud expirada
- **STPL-0306**: Conflicto con reserva existente

#### Notificaciones (STPL-04XX)

- **STPL-0401**: Plantilla de notificación no encontrada
- **STPL-0402**: Canal de notificación no disponible
- **STPL-0403**: Error en envío de notificación
- **STPL-0404**: Configuración de canal inválida
- **STPL-0405**: Límite de notificaciones excedido

#### Check-in/Check-out (STPL-05XX)

- **STPL-0501**: Reserva no encontrada para check-in
- **STPL-0502**: Check-in fuera del horario permitido
- **STPL-0503**: Check-out sin check-in previo
- **STPL-0504**: Ubicación de check-in inválida
- **STPL-0505**: Reserva ya completada

### Ejemplos de Respuestas de Error

**Error de Autenticación (401)**:
```json
{
  "success": false,
  "error": {
    "code": "STPL-0001",
    "message": "Token JWT inválido o expirado",
    "type": "authentication_error",
    "timestamp": "2024-01-20T21:00:00Z"
  }
}
```

**Error de Validación (422)**:
```json
{
  "success": false,
  "error": {
    "code": "STPL-0105",
    "message": "Configuración de flujo inválida",
    "type": "validation_error",
    "details": {
      "field": "levels",
      "message": "Debe tener al menos un nivel de aprobación",
      "value": []
    },
    "timestamp": "2024-01-20T21:00:00Z"
  }
}
```

**Error de Rate Limiting (429)**:
```json
{
  "success": false,
  "error": {
    "code": "STPL-0429",
    "message": "Límite de peticiones excedido",
    "type": "rate_limit_error",
    "details": {
      "limit": 50,
      "window": "1 minuto",
      "retryAfter": 45
    },
    "timestamp": "2024-01-20T21:00:00Z"
  }
}
```

---

## Variables de Entorno para Postman

Las siguientes variables facilitan las pruebas de la API en Postman.

### Variables Base

```json
{
  "stockpile_base_url": "http://localhost:3004",
  "auth_token": "",
  "user_id": "",
  "approval_id": "",
  "template_id": "",
  "flow_id": "",
  "reservation_id": "",
  "notification_id": ""
}
```

### Variables de Testing

```json
{
  "test_program_id": "program-test-123",
  "test_resource_type": "LABORATORY",
  "test_category_id": "category-lab-456",
  "test_user_email": "test.user@ufps.edu.co",
  "test_phone": "+573001234567",
  "test_coordinates": {
    "latitude": 7.8939,
    "longitude": -72.5078
  }
}
```

### Variables por Área Funcional

#### Flujos de Aprobación
```json
{
  "flow_name": "Flujo Test Laboratorio",
  "flow_timeout_hours": 48,
  "level_name": "Aprobación Técnica",
  "approver_roles": ["MONITOR", "TEACHER"]
}
```

#### Plantillas de Documentos
```json
{
  "doc_template_name": "Carta Aprobación Test",
  "doc_template_type": "APPROVAL",
  "doc_output_format": "PDF"
}
```

#### Notificaciones
```json
{
  "notification_channel_type": "EMAIL",
  "notification_priority": "MEDIUM",
  "notification_subject": "✅ Reserva Aprobada - {{resourceName}}"
}
```

### Scripts Pre-request para Auto-login

```javascript
// Auto-login si no hay token válido
if (!pm.environment.get("auth_token")) {
    const loginRequest = {
        url: pm.environment.get("stockpile_base_url") + "/auth/login",
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: "admin@ufps.edu.co",
                password: "admin123"
            })
        }
    };
    
    pm.sendRequest(loginRequest, function (err, response) {
        if (!err && response.code === 200) {
            const jsonData = response.json();
            pm.environment.set("auth_token", jsonData.data.accessToken);
            pm.environment.set("user_id", jsonData.data.user.id);
            console.log("Auto-login exitoso para usuario:", jsonData.data.user.email);
        } else {
            console.error("Error en auto-login:", err);
        }
    });
}

// Extraer IDs de la URL para endpoints dinámicos
const url = pm.request.url.toString();
if (url.includes('/approvals/')) {
    const approvalId = url.split('/approvals/')[1].split('/')[0];
    pm.environment.set("approval_id", approvalId);
}
```

### Tests Automáticos para Respuestas Exitosas

```javascript
// Test de respuesta exitosa
pm.test("Status code es 200 o 201", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Respuesta tiene estructura correcta", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("success", true);
    pm.expect(jsonData).to.have.property("data");
});

pm.test("Tiempo de respuesta menor a 2s", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// Guardar IDs automáticamente para siguientes requests
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    
    if (jsonData.data.id) {
        if (pm.request.url.path.includes('approval-flows')) {
            pm.environment.set("flow_id", jsonData.data.id);
        } else if (pm.request.url.path.includes('document-templates')) {
            pm.environment.set("template_id", jsonData.data.id);
        } else if (pm.request.url.path.includes('approvals')) {
            pm.environment.set("approval_id", jsonData.data.id);
        }
    }
    
    // Guardar tokens de documentos generados
    if (jsonData.data.downloadUrl) {
        pm.environment.set("download_url", jsonData.data.downloadUrl);
    }
}
```

### Tests para Manejo de Errores

```javascript
// Tests para errores de validación
if (pm.response.code === 422) {
    pm.test("Error de validación tiene formato correcto", function () {
        const jsonData = pm.response.json();
        pm.expect(jsonData).to.have.property("success", false);
        pm.expect(jsonData.error).to.have.property("code");
        pm.expect(jsonData.error.code).to.match(/^STPL-\d{4}$/);
    });
}

// Tests para errores de autenticación
if (pm.response.code === 401) {
    pm.test("Error de autenticación detectado", function () {
        const jsonData = pm.response.json();
        pm.expect(jsonData.error.type).to.eql("authentication_error");
    });
    
    // Auto-reintento con refresh token
    pm.environment.unset("auth_token");
}

// Tests para rate limiting
if (pm.response.code === 429) {
    pm.test("Rate limiting tiene detalles de retry", function () {
        const jsonData = pm.response.json();
        pm.expect(jsonData.error.details).to.have.property("retryAfter");
        pm.expect(jsonData.error.details).to.have.property("limit");
    });
}
```

---

## Restricciones de Dominio

El Stockpile Service aplica las siguientes reglas de negocio y restricciones de dominio.

### Flujos de Aprobación

#### Restricciones de Configuración
- **Niveles mínimos**: Todo flujo debe tener al menos 1 nivel de aprobación
- **Niveles máximos**: Máximo 5 niveles de aprobación por flujo
- **Timeout mínimo**: 1 hora por nivel de aprobación
- **Timeout máximo**: 168 horas (7 días) por flujo completo
- **Roles por nivel**: Mínimo 1 rol aprobador por nivel
- **Aprobadores requeridos**: Mínimo 1, máximo 5 por nivel

#### Restricciones de Modificación
- **Flujos activos**: No se pueden eliminar si tienen solicitudes pendientes
- **Modificaciones estructurales**: Requieren aprobación de ADMIN si afectan solicitudes en curso
- **Flujos por defecto**: Cada programa debe tener al menos un flujo por defecto por tipo de recurso
- **Unicidad**: No pueden existir flujos duplicados para el mismo programa + tipo de recurso

### Plantillas de Documentos

#### Restricciones de Formato
- **Tipos soportados**: PDF, DOCX, HTML
- **Tamaño máximo**: 5MB por plantilla
- **Variables requeridas**: userName, resourceName, status son obligatorias
- **Variables máximas**: Máximo 20 variables por plantilla
- **Nombre único**: Por programa y tipo de plantilla

#### Restricciones de Generación
- **Documentos por día**: Máximo 100 documentos por usuario
- **Tiempo de expiración**: Documentos generados expiran en 7 días
- **Almacenamiento**: Máximo 50MB de documentos generados por programa

### Notificaciones

#### Restricciones de Canales
- **Canales por plantilla**: Máximo 3 canales por plantilla
- **Envíos por usuario**: Máximo 50 notificaciones por día
- **Horario de envío**: No envíos entre 22:00 y 06:00 (configurable)
- **Reintentos**: Máximo 3 reintentos por notificación fallida

#### Restricciones de Contenido
- **Longitud de asunto**: Máximo 100 caracteres
- **Longitud de contenido**: Máximo 1000 caracteres
- **Variables por plantilla**: Máximo 15 variables
- **Canales WhatsApp**: Solo números con formato internacional

### Aprobaciones y Validaciones

#### Restricciones de Procesamiento
- **Aprobaciones simultáneas**: Un aprobador puede procesar máximo 5 solicitudes simultáneamente
- **Tiempo de decisión**: Máximo 7 días calendario desde asignación
- **Modificación de decisiones**: Solo posible dentro de 24 horas
- **Delegación**: Máximo 2 niveles de delegación

#### Restricciones de Conflictos
- **Reservas solapadas**: No se pueden aprobar reservas que se solapen en tiempo y recurso
- **Mantenimiento**: No aprobaciones durante ventanas de mantenimiento programado
- **Capacidad**: No exceder capacidad máxima del recurso
- **Horarios**: Respetar horarios de disponibilidad del recurso

### Check-in/Check-out Digital

#### Restricciones Temporales
- **Ventana de check-in**: 15 minutos antes hasta 30 minutos después del inicio
- **Check-out obligatorio**: Máximo 30 minutos después del fin programado
- **Check-in tardío**: Requiere justificación si es más de 15 minutos tarde
- **Duración máxima**: Máximo 8 horas de uso continuo

#### Restricciones de Ubicación
- **Precisión GPS**: Máximo 50 metros de distancia del recurso
- **Check-in móvil**: Solo desde dispositivos autorizados
- **Geofencing**: Verificación automática de ubicación si está habilitada

### Restricciones de Roles y Permisos

#### COORDINATOR
- Solo puede gestionar flujos de su programa académico
- No puede modificar flujos con aprobaciones pendientes de otros programas
- Máximo 10 flujos activos simultáneamente

#### MONITOR
- Solo puede aprobar solicitudes de nivel 1
- Máximo 20 aprobaciones por día
- No puede modificar flujos o plantillas

#### ADMIN
- Acceso completo pero con auditoría obligatoria
- Modificaciones críticas requieren confirmación doble
- Todas las acciones son registradas y notificadas

---

## Seguridad y Observabilidad

El Stockpile Service implementa múltiples capas de seguridad y observabilidad para garantizar operación segura y monitoreable.

### Seguridad

#### Autenticación y Autorización
- **JWT Tokens**: Tokens firmados con RS256, expiración de 1 hora
- **Refresh Tokens**: Rotación automática cada 24 horas
- **Role-Based Access Control (RBAC)**: 6 roles predefinidos con permisos granulares
- **Program-Based Filtering**: Acceso automático filtrado por programa académico
- **Multi-Factor Authentication**: Soporte para 2FA en operaciones críticas

#### Rate Limiting y Protección
- **Rate Limiting por Endpoint**: Límites diferenciados según operación
- **IP-Based Throttling**: Protección contra ataques de fuerza bruta
- **Request Size Limiting**: Máximo 10MB por request
- **CORS Configurado**: Solo dominios autorizados de UFPS
- **Headers de Seguridad**: Helmet.js con configuración completa

#### Validación y Sanitización
- **Input Validation**: Validación estricta con class-validator
- **SQL Injection Prevention**: Prisma ORM con prepared statements
- **XSS Protection**: Sanitización de inputs HTML
- **File Upload Security**: Validación de tipos MIME y escaneo de malware
- **Data Encryption**: Datos sensibles encriptados en repos

### Logging y Auditoría

#### Niveles de Logging

**ERROR Level**:
- Fallos críticos del sistema
- Errores de autenticación/autorización
- Fallos en generación de documentos
- Errores de conexión a servicios externos
- Excepciones no manejadas

```json
{
  "level": "error",
  "timestamp": "2024-01-20T21:00:00Z",
  "service": "stockpile-service",
  "traceId": "trace-123",
  "userId": "user-456",
  "action": "approve_request",
  "error": {
    "code": "STPL-0303",
    "message": "Usuario no autorizado para aprobar",
    "stack": "Error stack trace..."
  },
  "context": {
    "approvalId": "approval-123",
    "requestedRole": "STUDENT",
    "requiredRoles": ["MONITOR", "COORDINATOR"]
  }
}
```

**WARN Level**:
- Intentos de acceso no autorizados
- Rate limiting activado
- Timeouts de aprobaciones
- Configuraciones suboptimas
- Degradación de servicios

**INFO Level**:
- Creación/modificación de flujos
- Procesamiento de aprobaciones
- Generación de documentos
- Envío de notificaciones
- Check-in/check-out exitosos

**DEBUG Level**:
- Detalles de validación
- Parámetros de requests
- Estados intermedios de procesamiento
- Debugging de workflows

### Monitoreo y Observabilidad

#### Métricas con OpenTelemetry

**Métricas de Negocio**:
- `stockpile.approvals.created`: Número de solicitudes creadas
- `stockpile.approvals.processed`: Aprobaciones procesadas por resultado
- `stockpile.documents.generated`: Documentos generados por tipo
- `stockpile.notifications.sent`: Notificaciones enviadas por canal
- `stockpile.checkins.completed`: Check-ins completados exitosamente

**Métricas Técnicas**:
- `http.requests.duration`: Tiempo de respuesta por endpoint
- `http.requests.errors`: Errores HTTP por código de estado
- `database.query.duration`: Tiempo de consultas a base de datos
- `cache.hits.ratio`: Ratio de hits en Redis cache
- `queue.processing.time`: Tiempo de procesamiento de colas RabbitMQ

#### Trazabilidad Distribuida

**Trace Context**:
```javascript
// Cada request genera un trace único
const traceId = generateTraceId();
const spanId = generateSpanId();

// Propagación entre servicios
headers['X-Trace-Id'] = traceId;
headers['X-Span-Id'] = spanId;
headers['X-Parent-Span-Id'] = parentSpanId;
```

**Spans Principales**:
- `stockpile.approval.create`: Creación de solicitud de aprobación
- `stockpile.approval.process`: Procesamiento de aprobación
- `stockpile.document.generate`: Generación de documento
- `stockpile.notification.send`: Envío de notificación
- `stockpile.checkin.validate`: Validación de check-in

#### Alertas y Notificaciones con Sentry

**Alertas Críticas**:
- Fallos de autenticación masivos (>10 en 1 min)
- Errores de base de datos (>5% error rate)
- Timeouts de servicios externos (>30s)
- Memoria/CPU por encima de 90%
- Cola RabbitMQ con >1000 mensajes pendientes

**Configuración de Alertas**:
```javascript
// Configuración Sentry para Stockpile Service
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION,
  beforeSend(event) {
    // Filtrar datos sensibles
    if (event.user) {
      delete event.user.email;
      delete event.user.phone;
    }
    return event;
  },
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
  tracesSampleRate: 0.1, // 10% de traces en producción
});
```

### Configuración de Seguridad

#### Variables de Entorno de Seguridad

```bash
# JWT Configuration
JWT_SECRET=super-secret-key-256-bits
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=false

# CORS Configuration
CORS_ORIGIN=https://bookly.ufps.edu.co,https://admin.bookly.ufps.edu.co
CORS_CREDENTIALS=true

# File Upload Limits
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=pdf,docx,jpg,png

# Encryption
ENCRYPTION_KEY=encryption-key-32-characters
ENCRYPTION_ALGORITHM=aes-256-gcm

# Security Headers
HELMET_HSTS_MAX_AGE=31536000
HELMET_CSP_ENABLED=true
```

#### Health Checks de Seguridad

```typescript
// Health check que incluye validaciones de seguridad
@Get('health/security')
async getSecurityHealth() {
  return {
    timestamp: new Date().toISOString(),
    checks: {
      jwtConfig: this.validateJWTConfig(),
      rateLimiting: this.validateRateLimiting(),
      corsConfig: this.validateCORSConfig(),
      encryptionKeys: this.validateEncryptionKeys(),
      tlsCertificates: this.validateTLSCertificates()
    }
  };
}
```
