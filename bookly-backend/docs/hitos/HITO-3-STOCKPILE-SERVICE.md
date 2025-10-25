# HITO 3 - STOCKPILE SERVICE

## Aprobaciones y Validaciones Core

**Versión:** 1.0.0  
**Fecha:** 2025-09-01  
**Puerto:** 3004  
**Documentación API:** http://localhost:3004/api/docs

---

## 📋 Resumen Ejecutivo

El Stockpile Service implementa el sistema completo de aprobaciones y validaciones (RF-20 a RF-28) con flujos de trabajo configurables, generación automática de documentos, notificaciones multicanal y control de acceso para personal de vigilancia. Incluye check-in/check-out digital y integración con WhatsApp/Email.

## 🏗️ Arquitectura

### Estructura de Directorio

```
src/apps/stockpile-service/
├── domain/
│   ├── entities/
│   │   ├── approval-flow.entity.ts        # Entidad flujos de aprobación
│   │   ├── document-template.entity.ts    # Entidad plantillas de documentos
│   │   ├── notification-template.entity.ts # Entidad plantillas de notificación
│   │   └── approval-request.entity.ts     # Entidad solicitudes de aprobación
│   ├── repositories/
│   │   ├── approval-flow.repository.ts    # Interface repositorio flujos
│   │   ├── document-template.repository.ts # Interface plantillas docs
│   │   └── notification-template.repository.ts
│   ├── services/
│   │   ├── approval-workflow.service.ts   # Lógica de workflows
│   │   └── document-generation.service.ts # Generación de documentos
│   └── events/
│       ├── approval.events.ts             # Eventos de aprobación
│       └── notification.events.ts         # Eventos de notificación
├── application/
│   ├── commands/
│   │   ├── submit-approval-request.command.ts   # Enviar solicitud
│   │   ├── approve-request.command.ts           # Aprobar solicitud
│   │   ├── reject-request.command.ts            # Rechazar solicitud
│   │   └── generate-document.command.ts         # Generar documento
│   ├── queries/
│   │   ├── get-pending-approvals.query.ts      # Consultar pendientes
│   │   ├── get-approval-history.query.ts       # Historial aprobaciones
│   │   └── get-security-dashboard.query.ts     # Dashboard vigilancia
│   ├── handlers/
│   │   ├── approval-request.handlers.ts         # Handlers solicitudes
│   │   ├── document.handlers.ts                # Handlers documentos
│   │   └── notification.handlers.ts            # Handlers notificaciones
│   ├── services/
│   │   ├── approval-flow.service.ts             # Servicio flujos
│   │   ├── document-template.service.ts         # Servicio plantillas
│   │   └── notification-template.service.ts    # Servicio notificaciones
│   └── dto/
│       ├── approval-request.dto.ts              # DTOs solicitudes
│       ├── document-generation.dto.ts           # DTOs documentos
│       └── notification.dto.ts                 # DTOs notificaciones
└── infrastructure/
    ├── controllers/
    │   ├── approval-flow.controller.ts          # Controlador flujos
    │   ├── document-template.controller.ts      # Controlador plantillas
    │   └── security-dashboard.controller.ts     # Controlador vigilancia
    ├── repositories/
    │   ├── prisma-approval-flow.repository.ts   # Implementación Prisma
    │   ├── prisma-document-template.repository.ts
    │   └── prisma-notification-template.repository.ts
    ├── services/
    │   ├── pdf-generation.service.ts            # Generación PDF
    │   ├── email.service.ts                     # Envío de emails
    │   ├── whatsapp.service.ts                  # Integración WhatsApp
    │   └── sms.service.ts                       # Envío SMS
    └── modules/
        ├── document-generation.module.ts        # Módulo generación docs
        └── notification.module.ts               # Módulo notificaciones
```

### Patrones Arquitectónicos

#### Clean Architecture + CQRS

- **Domain Layer**: Lógica de workflows, aprobaciones y documentos
- **Application Layer**: Casos de uso CQRS para aprobaciones y notificaciones
- **Infrastructure Layer**: Generación PDF, integración WhatsApp/Email

#### Event-Driven Architecture

- **Approval Events**: `RequestSubmitted`, `RequestApproved`, `RequestRejected`
- **Document Events**: `DocumentGenerated`, `DocumentSent`
- **Notification Events**: `NotificationSent`, `DeliveryConfirmed`

## 🚀 Funcionalidades Implementadas

### RF-20: Validar solicitudes de reserva

- ✅ **Flujos Configurables**: Workflows personalizables por tipo de recurso
- ✅ **Validación Automática**: Reglas de negocio automatizadas
- ✅ **Escalamiento**: Aprobación automática a niveles superiores
- ✅ **SLA**: Tiempos límite para aprobación

```typescript
// Ejemplo de flujo de aprobación
{
  "id": "uuid-flujo",
  "name": "Aprobación Auditorio",
  "resourceTypes": ["auditorium"],
  "steps": [
    {
      "stepNumber": 1,
      "name": "Validación Automática",
      "type": "AUTOMATIC",
      "rules": [
        {
          "condition": "capacity <= 50",
          "action": "AUTO_APPROVE"
        },
        {
          "condition": "advance_hours < 24",
          "action": "REQUIRE_SUPERVISOR"
        }
      ]
    },
    {
      "stepNumber": 2,
      "name": "Aprobación Supervisor",
      "type": "MANUAL",
      "approverRoles": ["PROGRAM_ADMIN"],
      "timeout": 24, // horas
      "escalationTo": ["GENERAL_ADMIN"]
    }
  ]
}
```

### RF-21: Generación automática de documentos

- ✅ **Plantillas Configurables**: Templates personalizables por tipo
- ✅ **Generación PDF**: Documentos oficiales con firma digital
- ✅ **Variables Dinámicas**: Inserción automática de datos
- ✅ **Múltiples Formatos**: PDF, DOC, HTML

```typescript
// Plantilla de documento
{
  "id": "uuid-plantilla",
  "name": "Carta de Aprobación Auditorio",
  "type": "APPROVAL_LETTER",
  "format": "PDF",
  "template": `
    <html>
      <body>
        <h1>UNIVERSIDAD FRANCISCO DE PAULA SANTANDER</h1>
        <h2>CARTA DE APROBACIÓN DE RESERVA</h2>

        <p>Fecha: {{currentDate}}</p>
        <p>Señor(a): {{user.fullName}}</p>
        <p>Programa: {{user.academicProgram}}</p>

        <p>Por medio de la presente se APRUEBA la reserva del recurso:</p>

        <ul>
          <li><strong>Recurso:</strong> {{resource.name}}</li>
          <li><strong>Fecha:</strong> {{reservation.startDate | date}}</li>
          <li><strong>Hora:</strong> {{reservation.startTime}} - {{reservation.endTime}}</li>
          <li><strong>Propósito:</strong> {{reservation.purpose}}</li>
        </ul>

        <p>Aprobado por: {{approver.fullName}}</p>
        <p>Cargo: {{approver.role}}</p>

        <div class="qr-code">{{qrCode}}</div>
      </body>
    </html>
  `,
  "variables": [
    "currentDate", "user", "resource", "reservation", "approver", "qrCode"
  ]
}
```

### RF-22: Notificación automática al solicitante

- ✅ **Email**: Notificaciones por correo electrónico
- ✅ **WhatsApp**: Integración con WhatsApp Business API
- ✅ **SMS**: Mensajes de texto para notificaciones urgentes
- ✅ **Push**: Notificaciones in-app en tiempo real

### RF-23: Pantalla de control para vigilancia

- ✅ **Dashboard en Tiempo Real**: Estado actual de reservas
- ✅ **Check-in/Check-out**: Validación de acceso con QR
- ✅ **Lista de Accesos**: Reservas activas del día
- ✅ **Alertas**: Notificaciones de situaciones anómalas

```typescript
// Dashboard de vigilancia
{
  "currentReservations": [
    {
      "id": "uuid-reserva",
      "resourceName": "Auditorio Principal",
      "userInfo": {
        "name": "Juan Pérez",
        "id": "1234567890",
        "program": "Ingeniería de Sistemas"
      },
      "timeSlot": "08:00 - 10:00",
      "status": "CHECKED_IN",
      "checkedInAt": "2025-09-02T08:05:00Z",
      "qrCode": "data:image/png;base64,..."
    }
  ],
  "pendingCheckIns": [
    {
      "resourceName": "Lab 201",
      "userInfo": "María García",
      "expectedTime": "10:00",
      "tolerance": "15 min"
    }
  ],
  "alerts": [
    {
      "type": "LATE_ARRIVAL",
      "message": "Usuario no se presentó a reserva de 14:00",
      "resourceName": "Sala 105",
      "severity": "WARNING"
    }
  ]
}
```

### RF-24: Configuración de flujos diferenciados

- ✅ **Por Tipo de Recurso**: Workflows específicos por categoría
- ✅ **Por Rol de Usuario**: Diferentes niveles de aprobación
- ✅ **Por Horario**: Flujos especiales para horarios no académicos
- ✅ **Por Capacidad**: Validaciones según aforo del evento

### RF-25: Registro y trazabilidad

- ✅ **Auditoría Completa**: Historial detallado de cada decisión
- ✅ **Timestamps**: Registro preciso de fechas y horas
- ✅ **Usuarios**: Identificación de responsables
- ✅ **Justificaciones**: Motivos de aprobación/rechazo

### RF-26: Check-in/check-out digital

- ✅ **Códigos QR**: Generación automática por reserva
- ✅ **Validación Móvil**: App para personal de vigilancia
- ✅ **Geolocalización**: Verificación de ubicación
- ✅ **Tolerancia**: Configuración de márgenes de tiempo

### RF-27: Integración con mensajería

- ✅ **WhatsApp Business API**: Mensajes oficiales automatizados
- ✅ **SMTP Seguro**: Envío de emails con autenticación
- ✅ **Plantillas Multicanal**: Misma plantilla para múltiples canales
- ✅ **Confirmación de Entrega**: Tracking de notificaciones

### RF-28: Notificaciones automáticas de cambios

- ✅ **Cambios en Tiempo Real**: Notificación inmediata
- ✅ **Escalamiento**: Notificación a supervisores
- ✅ **Recordatorios**: Avisos preventivos
- ✅ **Resúmenes**: Reportes periódicos

## 📊 Modelo de Datos

### Entidad ApprovalFlow

```typescript
export class ApprovalFlowEntity {
  id: string;
  name: string;
  description?: string;
  resourceTypes: string[]; // Tipos de recurso aplicables
  isActive: boolean;

  // Configuración del flujo
  steps: ApprovalStep[];
  defaultTimeout: number; // horas
  escalationEnabled: boolean;

  // Condiciones de activación
  conditions: FlowCondition[];

  // Metadatos
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface ApprovalStep {
  stepNumber: number;
  name: string;
  type: StepType; // AUTOMATIC, MANUAL, CONDITIONAL
  rules?: ValidationRule[]; // Para steps automáticos
  approverRoles?: string[]; // Para steps manuales
  requiredApprovals?: number; // Número mínimo de aprobaciones
  timeout?: number; // horas
  escalationTo?: string[]; // roles de escalamiento
  notificationTemplates?: string[];
}
```

### Entidad DocumentTemplate

```typescript
export class DocumentTemplateEntity {
  id: string;
  name: string;
  description?: string;
  type: DocumentType; // APPROVAL_LETTER, REJECTION_LETTER, QR_PASS
  format: DocumentFormat; // PDF, HTML, DOC

  // Plantilla
  template: string; // HTML/Markdown template
  variables: string[]; // Variables disponibles
  styles?: string; // CSS personalizado

  // Configuración
  resourceTypes?: string[]; // Tipos de recurso aplicables
  approvalSteps?: number[]; // Pasos donde se usa

  // Firma digital
  requiresSignature: boolean;
  signatureTemplate?: string;

  isActive: boolean;
  version: number;
}
```

### Entidad NotificationTemplate

```typescript
export class NotificationTemplateEntity {
  id: string;
  name: string;
  description?: string;

  // Configuración de canales
  channels: NotificationChannel[];

  // Plantillas por canal
  emailTemplate?: EmailTemplate;
  whatsappTemplate?: WhatsAppTemplate;
  smsTemplate?: SmsTemplate;
  pushTemplate?: PushTemplate;

  // Triggers
  triggers: NotificationTrigger[];

  // Configuración de envío
  priority: NotificationPriority;
  retryPolicy: RetryPolicy;

  isActive: boolean;
}
```

### Entidad ApprovalRequest

```typescript
export class ApprovalRequestEntity {
  id: string;
  reservationId: string;
  flowId: string;

  // Estado actual
  status: ApprovalStatus; // PENDING, APPROVED, REJECTED, ESCALATED
  currentStep: number;

  // Historial de pasos
  stepHistory: ApprovalStepHistory[];

  // Información de la solicitud
  requestData: ReservationRequest;
  submittedAt: Date;
  submittedBy: string;

  // Documentos generados
  generatedDocuments: GeneratedDocument[];

  // Notificaciones enviadas
  notificationLog: NotificationLog[];

  // SLA
  slaDeadline?: Date;
  escalatedAt?: Date;
  completedAt?: Date;
}
```

## 🌐 API Endpoints

### Flujos de Aprobación - `/approval-flows`

#### GET /approval-flows

Listar flujos de aprobación configurados

#### POST /approval-flows

Crear nuevo flujo de aprobación

**Request Body:**

```json
{
  "name": "Aprobación Laboratorios",
  "description": "Flujo para reservas de laboratorios especializados",
  "resourceTypes": ["laboratory", "computer_lab"],
  "steps": [
    {
      "stepNumber": 1,
      "name": "Validación Automática",
      "type": "AUTOMATIC",
      "rules": [
        {
          "field": "advance_hours",
          "operator": ">=",
          "value": 48,
          "action": "CONTINUE"
        },
        {
          "field": "user.role",
          "operator": "in",
          "value": ["STUDENT"],
          "action": "REQUIRE_APPROVAL"
        }
      ]
    },
    {
      "stepNumber": 2,
      "name": "Aprobación Coordinador",
      "type": "MANUAL",
      "approverRoles": ["PROGRAM_ADMIN"],
      "timeout": 24,
      "escalationTo": ["GENERAL_ADMIN"],
      "notificationTemplates": ["approval-request-email"]
    }
  ],
  "defaultTimeout": 72,
  "escalationEnabled": true
}
```

#### PUT /approval-flows/:id

Actualizar flujo existente

### Solicitudes de Aprobación - `/approval-requests`

#### POST /approval-requests

Enviar nueva solicitud de aprobación

**Request Body:**

```json
{
  "reservationId": "uuid-reserva",
  "requestType": "RESERVATION_APPROVAL",
  "urgency": "NORMAL",
  "justification": "Necesario para práctica de laboratorio",
  "additionalData": {
    "equipment": ["microscopios", "reactivos"],
    "attendees": 25,
    "supervisor": "Dr. Juan Pérez"
  }
}
```

#### GET /approval-requests/pending

Obtener solicitudes pendientes de aprobación

#### POST /approval-requests/:id/approve

Aprobar solicitud

**Request Body:**

```json
{
  "comments": "Aprobado para uso académico",
  "conditions": [
    "Uso exclusivo con supervisor",
    "Devolución antes de las 18:00"
  ],
  "generateDocument": true,
  "documentTemplate": "approval-letter-lab"
}
```

#### POST /approval-requests/:id/reject

Rechazar solicitud

#### GET /approval-requests/:id/history

Obtener historial de una solicitud

### Plantillas de Documento - `/document-templates`

#### GET /document-templates

Listar plantillas disponibles

#### POST /document-templates

Crear nueva plantilla

#### POST /document-templates/:id/generate

Generar documento desde plantilla

**Request Body:**

```json
{
  "approvalRequestId": "uuid-solicitud",
  "variables": {
    "customMessage": "Felicitaciones por la aprobación",
    "additionalInstructions": "Presentarse 15 minutos antes"
  },
  "format": "PDF",
  "watermark": true
}
```

### Dashboard de Vigilancia - `/security`

#### GET /security/dashboard

Obtener vista del dashboard de vigilancia

**Response (200):**

```json
{
  "success": true,
  "data": {
    "currentReservations": [
      {
        "id": "uuid-reserva",
        "resourceName": "Auditorio Principal",
        "resourceLocation": "Edificio A - Piso 1",
        "userInfo": {
          "name": "Juan Pérez",
          "id": "1234567890",
          "photo": "base64-photo",
          "program": "Ingeniería de Sistemas"
        },
        "timeSlot": {
          "start": "08:00",
          "end": "10:00",
          "remaining": "45 min"
        },
        "status": "CHECKED_IN",
        "checkedInAt": "08:05",
        "qrCode": "data:image/png;base64,..."
      }
    ],
    "upcomingReservations": [...],
    "overdueCheckouts": [...],
    "alerts": [...]
  }
}
```

#### POST /security/checkin

Realizar check-in de reserva

**Request Body:**

```json
{
  "qrCode": "encoded-qr-data",
  "location": {
    "latitude": 7.8939,
    "longitude": -72.5078
  },
  "securityOfficer": "uuid-vigilante"
}
```

#### POST /security/checkout

Realizar check-out de reserva

### Notificaciones - `/notifications`

#### GET /notifications/templates

Listar plantillas de notificación

#### POST /notifications/send

Enviar notificación manual

**Request Body:**

```json
{
  "recipientId": "uuid-usuario",
  "templateId": "uuid-template",
  "channels": ["email", "whatsapp"],
  "variables": {
    "userName": "Juan Pérez",
    "reservationId": "uuid-reserva",
    "customMessage": "Su reserva ha sido aprobada"
  },
  "priority": "HIGH",
  "scheduleFor": "2025-09-02T08:00:00Z"
}
```

## 🔄 Eventos de Dominio

### RequestSubmitted

```json
{
  "eventType": "RequestSubmitted",
  "aggregateId": "uuid-solicitud",
  "version": 1,
  "data": {
    "id": "uuid-solicitud",
    "reservationId": "uuid-reserva",
    "flowId": "uuid-flujo",
    "submittedBy": "uuid-usuario",
    "urgency": "NORMAL"
  },
  "metadata": {
    "timestamp": "2025-09-01T23:45:00Z",
    "correlationId": "uuid-correlation"
  }
}
```

### RequestApproved

```json
{
  "eventType": "RequestApproved",
  "aggregateId": "uuid-solicitud",
  "data": {
    "id": "uuid-solicitud",
    "approvedBy": "uuid-aprobador",
    "step": 2,
    "comments": "Aprobado para uso académico",
    "conditions": ["Uso con supervisor"],
    "documentsToGenerate": ["approval-letter"]
  }
}
```

### DocumentGenerated

```json
{
  "eventType": "DocumentGenerated",
  "aggregateId": "uuid-documento",
  "data": {
    "id": "uuid-documento",
    "approvalRequestId": "uuid-solicitud",
    "templateId": "uuid-plantilla",
    "format": "PDF",
    "fileUrl": "https://storage.booklyapp.com/docs/uuid-documento.pdf",
    "qrCode": "embedded-qr-data"
  }
}
```

### NotificationSent

```json
{
  "eventType": "NotificationSent",
  "aggregateId": "uuid-notificacion",
  "data": {
    "id": "uuid-notificacion",
    "recipientId": "uuid-usuario",
    "channel": "whatsapp",
    "templateId": "uuid-template",
    "status": "SENT",
    "messageId": "external-message-id",
    "deliveryStatus": "PENDING"
  }
}
```

## 🔒 Seguridad y Permisos

### Roles y Permisos de Aprobación

- **Administrador General**: Aprobar cualquier solicitud, configurar flujos
- **Administrador de Programa**: Aprobar solicitudes de su programa
- **Coordinador**: Aprobar solicitudes de recursos básicos
- **Personal de Vigilancia**: Check-in/check-out, dashboard de seguridad

### Validaciones de Seguridad

- **Firma Digital**: Documentos oficiales con firma criptográfica
- **QR Temporal**: Códigos con expiración automática
- **Geolocalización**: Validación de ubicación para check-in
- **Auditoría Completa**: Registro de todas las acciones

## 📊 Integración con Servicios Externos

### WhatsApp Business API

```typescript
{
  "provider": "WhatsApp Business",
  "apiVersion": "v17.0",
  "features": [
    "Mensajes de texto",
    "Documentos adjuntos",
    "Confirmación de lectura",
    "Plantillas preaprobadas"
  ],
  "limits": {
    "messagesPerMinute": 80,
    "templatesPerDay": 1000
  }
}
```

### Generación de PDF

```typescript
{
  "engine": "Puppeteer + HTML/CSS",
  "features": [
    "Firma digital",
    "Códigos QR",
    "Watermarks",
    "Múltiples páginas",
    "Estilos personalizados"
  ]
}
```

### Email SMTP

```typescript
{
  "provider": "SMTP Seguro",
  "security": "TLS/SSL",
  "features": [
    "Autenticación OAuth2",
    "Archivos adjuntos",
    "HTML templates",
    "Confirmación de entrega"
  ]
}
```

## 🧪 Testing

### Pruebas de Flujos de Aprobación

```bash
npm run test:approval:flows
npm run test:approval:escalation
npm run test:approval:timeout
```

### Pruebas de Generación de Documentos

```bash
npm run test:documents:pdf
npm run test:documents:templates
npm run test:documents:qr
```

### Pruebas de Notificaciones

```bash
npm run test:notifications:email
npm run test:notifications:whatsapp
npm run test:notifications:delivery
```

## 📊 Métricas y KPIs

### Métricas de Aprobación

- **Tiempo Promedio de Aprobación**: < 4 horas laborales
- **Tasa de Aprobación**: 85%
- **Escalamientos**: < 10% de solicitudes
- **SLA Cumplimiento**: > 95%

### Métricas de Documentos

- **Tiempo de Generación**: < 5 segundos
- **Tasa de Error**: < 1%
- **Formatos Soportados**: PDF, HTML, DOC

### Métricas de Notificaciones

- **Tasa de Entrega**: > 98%
- **Tiempo de Envío**: < 30 segundos
- **Canales Activos**: Email, WhatsApp, SMS, Push

## 🚀 Estado del Servicio

✅ **Funcional y operativo**  
✅ **Flujos de aprobación configurables**  
✅ **Generación de documentos PDF**  
✅ **Integración WhatsApp/Email funcionando**  
✅ **Dashboard de vigilancia activo**  
✅ **Check-in/check-out con QR operativo**  
✅ **Sistema de notificaciones completo**  
✅ **Auditoría y trazabilidad completas**

---

**Próximos pasos**: Integración con auth-service para control de permisos granular (Hito 4).
