# Stockpile Service - Documentación Técnica

## 📋 Índice

- [Información General](#información-general)
- [Arquitectura](#arquitectura)
- [Requerimientos Funcionales](#requerimientos-funcionales)
- [API REST Endpoints](#api-rest-endpoints)
- [Event-Driven Architecture](#event-driven-architecture)
- [Base de Datos](#base-de-datos)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [Configuración](#configuración)
- [Observabilidad](#observabilidad)
- [Testing](#testing)
- [Deployment](#deployment)

## 🏢 Información General

El **Stockpile Service** es el microservicio encargado de gestionar los flujos de aprobación y validación de reservas en el ecosistema Bookly. Maneja todo el proceso desde la validación inicial de solicitudes hasta la generación de documentos oficiales, notificaciones automáticas y control de acceso mediante check-in/check-out digital.

### Características Principales

- **RF-20**: Validación de solicitudes de reserva por responsables autorizados
- **RF-21**: Generación automática de documentos PDF de aprobación/rechazo
- **RF-22**: Notificación automática al solicitante con documentos adjuntos
- **RF-23**: Pantalla de control para personal de vigilancia
- **RF-24**: Configuración de flujos de aprobación diferenciados por tipo de usuario
- **RF-25**: Registro y trazabilidad auditable de todas las aprobaciones
- **RF-26**: Sistema de check-in/check-out digital (opcional)
- **RF-27**: Integración con sistemas de mensajería (email, WhatsApp)
- **RF-28**: Notificaciones automáticas de cambios en reservas

### Información de Servicio

- **Puerto**: `3004` (desarrollo) / `3000` (producción vía API Gateway)
- **Health Check**: `GET /api/v1/stockpile/health`
- **Documentación**: `GET /api/v1/stockpile/docs`
- **Métricas**: `GET /api/v1/stockpile/metrics`
- **WebSocket**: `ws://localhost:3004/stockpile/notifications` (desarrollo)

### Stack Tecnológico

```typescript
// Core Framework
- NestJS 10.x (Framework modular con CQRS)
- TypeScript 5.x (Tipado estático)

// Database & ORM
- Prisma 5.x (Type-safe database client)
- MongoDB Atlas (Base de datos NoSQL distribuida)

// Event-Driven Architecture
- RabbitMQ (Message broker para eventos distribuidos)
- Redis (Cache de alta velocidad)

// Document Generation
- PDFKit (Generación de documentos PDF)
- Handlebars (Templates para documentos)

// Notifications
- Nodemailer (Envío de emails)
- WhatsApp Business API (Mensajería WhatsApp)
- Socket.io (WebSockets para tiempo real)

// Observability Stack
- Winston (Structured logging)
- OpenTelemetry (Distributed tracing)
- Sentry (Error tracking)
```

## 🏗️ Arquitectura

### Clean Architecture + Hexagonal

```
src/apps/stockpile-service/
├── domain/                    # Lógica de negocio pura
│   ├── entities/              # Entidades de dominio
│   │   ├── approval-flow.entity.ts
│   │   ├── document-template.entity.ts
│   │   └── notification-template.entity.ts
│   ├── events/                # Eventos de dominio
│   │   ├── approval.events.ts
│   │   ├── document.events.ts
│   │   └── notification.events.ts
│   └── repositories/          # Interfaces de repositorios
│       ├── approval-flow.repository.ts
│       ├── document-template.repository.ts
│       └── notification-template.repository.ts
│
├── application/               # Casos de uso y comandos/queries
│   ├── commands/              # Command handlers (CQRS)
│   │   ├── approval-flow/
│   │   ├── document-template/
│   │   └── notification-template/
│   ├── queries/               # Query handlers (CQRS)
│   │   ├── approval-flow/
│   │   ├── document-template/
│   │   └── notification-template/
│   ├── events/                # Event handlers
│   │   ├── approval.handlers.ts
│   │   ├── document.handlers.ts
│   │   └── notification.handlers.ts
│   └── services/              # Servicios de aplicación
│       ├── approval-flow.service.ts
│       ├── document-template.service.ts
│       ├── notification-template.service.ts
│       ├── stockpile-approval.service.ts
│       └── websocket.service.ts
│
└── infrastructure/            # Adaptadores externos
    ├── controllers/           # HTTP controllers
    │   ├── approval-flow.controller.ts
    │   ├── document-template.controller.ts
    │   ├── notification-template.controller.ts
    │   └── stockpile-approval.controller.ts
    ├── repositories/          # Implementaciones Prisma
    │   ├── prisma-approval-flow.repository.ts
    │   ├── prisma-document-template.repository.ts
    │   └── prisma-notification-template.repository.ts
    ├── gateways/              # WebSocket gateways
    │   └── stockpile-notifications.gateway.ts
    └── config/                # Configuración del servicio
        ├── stockpile.config.ts
        └── websocket.config.ts
```

### CQRS Pattern

El servicio implementa **Command Query Responsibility Segregation**:

- **Commands**: Modifican estado (aprobar/rechazar, generar documentos, enviar notificaciones)
- **Queries**: Solo leen datos (listar solicitudes, obtener documentos, historial)
- **Events**: Comunican cambios entre bounded contexts

## 📋 Requerimientos Funcionales

### RF-20: Validación de Solicitudes de Reserva

**Descripción**: Permite que las solicitudes de reserva sean validadas por responsables autorizados antes de su confirmación.

**Actores**: Director, Ingeniero de Soporte, Secretaria, Administrador de Programa

**Flujo**:

1. Usuario envía solicitud de reserva
2. Sistema determina si requiere validación según configuración
3. Asigna solicitud a responsable autorizado
4. Responsable recibe notificación automática
5. Responsable aprueba, rechaza o solicita modificaciones
6. Sistema notifica al usuario y actualiza estado de reserva

**Endpoints**:

- `GET /stockpile/approvals` - Listar solicitudes pendientes
- `GET /stockpile/approvals/:id` - Obtener detalles de solicitud
- `POST /stockpile/approvals/:id/approve` - Aprobar solicitud
- `POST /stockpile/approvals/:id/reject` - Rechazar solicitud

### RF-21: Generación Automática de Documentos

**Descripción**: Genera automáticamente documentos PDF oficiales de aprobación o rechazo con información completa y firmas digitales.

**Características**:

- Plantillas personalizables por institución
- Firma digital del responsable
- Logotipos institucionales
- Información detallada de reserva y decisión

**Endpoints**:

- `POST /document-templates` - Crear plantilla de documento
- `GET /document-templates` - Listar plantillas disponibles
- `POST /document-templates/:id/generate` - Generar documento desde plantilla
- `GET /document-templates/:id/download` - Descargar documento generado

### RF-22: Notificación Automática al Solicitante

**Descripción**: Envía automáticamente carta de aceptación/rechazo al solicitante por email con documento PDF adjunto.

**Canales Soportados**:

- Email (prioritario)
- WhatsApp Business (opcional)
- Notificaciones push web
- Portal web interno

### RF-23: Pantalla de Control para Vigilancia

**Descripción**: Proporciona pantalla en tiempo real para personal de vigilancia con lista de reservas aprobadas para verificación de acceso.

**WebSocket Events**:

```typescript
// Cliente se conecta al namespace de vigilancia
io.connect('/stockpile/security')

// Eventos en tiempo real
- reservation_approved    // Nueva reserva aprobada
- reservation_cancelled   // Reserva cancelada
- check_in_required      // Usuario debe hacer check-in
- access_granted         // Acceso autorizado
- incident_reported      // Incidencia registrada
```

## 🔌 API REST Endpoints

### Gestión de Aprobaciones y Validaciones

```http
# Listar solicitudes pendientes de aprobación
GET /api/v1/stockpile/approvals?status=PENDING&assignedTo=me&page=1&limit=10

# Obtener detalles de solicitud
GET /api/v1/stockpile/approvals/{approvalId}

# Aprobar solicitud
POST /api/v1/stockpile/approvals/{approvalId}/approve
Content-Type: application/json

{
  "comments": "Reserva aprobada. Recurso disponible para la fecha solicitada.",
  "conditions": [
    "Debe presentar carnet estudiantil al momento del ingreso",
    "Uso exclusivo para actividades académicas"
  ],
  "generateDocument": true,
  "sendNotification": true
}

# Rechazar solicitud
POST /api/v1/stockpile/approvals/{approvalId}/reject
Content-Type: application/json

{
  "reason": "RESOURCE_NOT_AVAILABLE",
  "comments": "El laboratorio estará en mantenimiento en la fecha solicitada.",
  "suggestions": [
    {
      "date": "2025-09-17",
      "time": "14:00-16:00",
      "resource": "Laboratorio de Redes - Sala 2"
    }
  ],
  "generateDocument": true,
  "sendNotification": true
}
```

### Check-in/Check-out Digital

```http
# Registrar entrada (check-in)
POST /api/v1/stockpile/check-in/{reservationId}
Content-Type: application/json

{
  "securityOfficer": "vigilante_001",
  "verificationMethod": "ID_CARD",
  "identificationNumber": "12345678",
  "additionalNotes": "Usuario llegó 5 minutos antes de la hora programada",
  "location": "Entrada Principal Bloque A"
}

# Registrar salida (check-out)  
POST /api/v1/stockpile/check-out/{reservationId}
Content-Type: application/json

{
  "securityOfficer": "vigilante_001",
  "verificationMethod": "QR_CODE",
  "resourceCondition": "GOOD",
  "incidentsReported": false,
  "additionalNotes": "Usuario devolvió equipo en buen estado",
  "location": "Entrada Principal Bloque A"
}
```

## 🔐 Autenticación y Autorización

### Roles y Permisos

```typescript
// Roles específicos del Stockpile Service
enum StockpileRoles {
  APPROVAL_COORDINATOR = 'APPROVAL_COORDINATOR',  // Coordinador de aprobaciones
  SECURITY_OFFICER = 'SECURITY_OFFICER',          // Personal de vigilancia
  DOCUMENT_ADMIN = 'DOCUMENT_ADMIN',              // Administrador de documentos
  NOTIFICATION_ADMIN = 'NOTIFICATION_ADMIN'       // Administrador de notificaciones
}

// Permisos granulares
const STOCKPILE_PERMISSIONS = {
  // Aprobaciones
  'approvals:list': ['APPROVAL_COORDINATOR', 'PROGRAM_ADMIN', 'GENERAL_ADMIN'],
  'approvals:approve': ['APPROVAL_COORDINATOR', 'PROGRAM_ADMIN', 'GENERAL_ADMIN'],
  'approvals:reject': ['APPROVAL_COORDINATOR', 'PROGRAM_ADMIN', 'GENERAL_ADMIN'],
  
  // Control de acceso
  'access:checkin': ['SECURITY_OFFICER', 'GENERAL_ADMIN'],
  'access:checkout': ['SECURITY_OFFICER', 'GENERAL_ADMIN'],
  'access:view': ['SECURITY_OFFICER', 'GENERAL_ADMIN'],
  
  // Documentos
  'documents:generate': ['DOCUMENT_ADMIN', 'APPROVAL_COORDINATOR'],
  'documents:download': ['DOCUMENT_ADMIN', 'APPROVAL_COORDINATOR', 'SECURITY_OFFICER'],
  
  // Notificaciones
  'notifications:send': ['NOTIFICATION_ADMIN', 'APPROVAL_COORDINATOR'],
  'notifications:configure': ['NOTIFICATION_ADMIN', 'GENERAL_ADMIN']
};
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# Configuración del servicio
STOCKPILE_SERVICE_PORT=3004
STOCKPILE_SERVICE_NAME="Bookly Stockpile Service"

# Base de datos
DATABASE_URL="mongodb://username:password@cluster.mongodb.net/bookly"

# Event Bus
RABBITMQ_URL="amqp://localhost:5672"
REDIS_URL="redis://localhost:6379"

# Configuración de Email
SMTP_HOST=smtp.ufps.edu.co
SMTP_PORT=587
SMTP_USER=bookly@ufps.edu.co
SMTP_PASS=***
SMTP_FROM="Sistema Bookly UFPS <bookly@ufps.edu.co>"

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=***
WHATSAPP_ACCESS_TOKEN=***
WHATSAPP_WEBHOOK_VERIFY_TOKEN=***

# Almacenamiento de documentos
DOCUMENTS_STORAGE_PATH=/app/storage/documents
DOCUMENTS_MAX_SIZE=50MB
DOCUMENTS_ALLOWED_TYPES=pdf,doc,docx

# WebSocket
WEBSOCKET_PORT=3004
WEBSOCKET_CORS_ORIGIN=http://localhost:3000,https://bookly.ufps.edu.co

# Observabilidad
SENTRY_DSN=***
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
LOG_LEVEL=info
```

## 📊 Observabilidad

### Logging con Winston

```typescript
// Estructuras de logs específicas
const stockpileLogger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'stockpile-service' },
  transports: [
    new transports.File({ filename: 'logs/stockpile-error.log', level: 'error' }),
    new transports.File({ filename: 'logs/stockpile-combined.log' }),
    new transports.Console({ format: combine(colorize(), simple()) })
  ]
});

// Eventos importantes a loggear
- ApprovalRequestReceived
- ApprovalDecisionMade
- DocumentGenerated
- NotificationSent
- SecurityCheckCompleted
- ErrorsInApprovalFlow
```

### Métricas con OpenTelemetry

- **Aprobaciones procesadas por hora**
- **Tiempo promedio de aprobación**
- **Documentos generados exitosamente**
- **Notificaciones enviadas vs fallidas**
- **Check-ins/check-outs por día**
- **Errores en flujos de aprobación**

## 🧪 Testing

### Estructura de Pruebas

```
test/
├── unit/                      # Pruebas unitarias
│   ├── domain/
│   ├── application/
│   └── infrastructure/
├── integration/               # Pruebas de integración
│   ├── controllers/
│   ├── repositories/
│   └── events/
├── e2e/                      # Pruebas end-to-end
│   ├── approval-flow.e2e.spec.ts
│   ├── document-generation.e2e.spec.ts
│   └── notifications.e2e.spec.ts
└── fixtures/                 # Datos de prueba
    ├── approval-requests.json
    ├── document-templates.json
    └── notification-templates.json
```

### Comandos de Testing

```bash
# Pruebas unitarias
npm run test:unit

# Pruebas de integración
npm run test:integration

# Pruebas end-to-end
npm run test:e2e

# Cobertura de pruebas
npm run test:coverage

# Pruebas en modo watch
npm run test:watch
```

## 🚀 Deployment

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs dist/apps/stockpile-service ./
USER nestjs
EXPOSE 3004
CMD ["node", "main.js"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stockpile-service
  namespace: bookly
spec:
  replicas: 2
  selector:
    matchLabels:
      app: stockpile-service
  template:
    metadata:
      labels:
        app: stockpile-service
    spec:
      containers:
      - name: stockpile-service
        image: bookly/stockpile-service:latest
        ports:
        - containerPort: 3004
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

**Documento**: README.md - Stockpile Service  
**Última actualización**: 31 de Agosto, 2025  
**Versión**: 2.0.0  
**Autor**: Equipo de Desarrollo Bookly  
**Revisor**: Arquitecto de Sistemas  
**Estado**: ✅ Documentación Completa y Validada

*Universidad Francisco de Paula Santander - Sistema Bookly de Reservas Institucionales*
