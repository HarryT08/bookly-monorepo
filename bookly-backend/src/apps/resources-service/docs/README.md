# Bookly Resources Service - Documentación Técnica

## 📋 Índice

- [Bookly Resources Service - Documentación Técnica](#bookly-resources-service---documentación-técnica)
  - [📋 Índice](#-índice)
  - [💻 Overview](#-overview)
    - [🎯 Características Principales](#-características-principales)
    - [Información de Servicio](#información-de-servicio)
  - [🏗️ Arquitectura](#️-arquitectura)
  - [🛠️ Stack Tecnológico](#️-stack-tecnológico)
    - [Core Framework](#core-framework)
    - [Base de Datos y ORM](#base-de-datos-y-orm)
    - [Event-Driven Architecture](#event-driven-architecture)
    - [Observability Stack](#observability-stack)
  - [📋 Requerimientos Funcionales Detallados](#-requerimientos-funcionales-detallados)
    - [RF-01: CRUD Completo de Recursos](#rf-01-crud-completo-de-recursos)
    - [RF-02: Sistema de Categorización](#rf-02-sistema-de-categorización)
    - [RF-04: Importación Masiva](#rf-04-importación-masiva)
    - [RF-06: Gestión de Mantenimiento](#rf-06-gestión-de-mantenimiento)
  - [🔌 API REST Endpoints](#-api-rest-endpoints)
    - [Gestión de Recursos (RF-01)](#gestión-de-recursos-rf-01)
    - [Gestión de Categorías y Programas (RF-02)](#gestión-de-categorías-y-programas-rf-02)
    - [Importación Masiva (RF-04)](#importación-masiva-rf-04)
    - [Gestión de Mantenimiento (RF-06)](#gestión-de-mantenimiento-rf-06)
  - [📡 Event-Driven Architecture](#-event-driven-architecture)
    - [Eventos Publicados por Resources Service](#eventos-publicados-por-resources-service)
    - [Eventos Consumidos](#eventos-consumidos)
    - [Configuración de RabbitMQ](#configuración-de-rabbitmq)
    - [WebSocket Events (Real-time)](#websocket-events-real-time)
  - [🗃️ Modelo de Base de Datos](#️-modelo-de-base-de-datos)
    - [Esquemas Prisma](#esquemas-prisma)
  - [🔐 Autenticación y Autorización](#-autenticación-y-autorización)
    - [Roles y Permisos por Endpoint](#roles-y-permisos-por-endpoint)
    - [Restricciones por Programa Académico](#restricciones-por-programa-académico)
  - [⚙️ Variables de Entorno](#️-variables-de-entorno)
  - [📊 Observabilidad y Monitoreo](#-observabilidad-y-monitoreo)
    - [Logging Estructurado con Winston](#logging-estructurado-con-winston)
    - [Métricas Prometheus](#métricas-prometheus)
    - [Códigos de Error Estándar](#códigos-de-error-estándar)
  - [🧪 Testing](#-testing)
    - [Estructura de Pruebas BDD con Jasmine](#estructura-de-pruebas-bdd-con-jasmine)
    - [Comandos de Testing](#comandos-de-testing)
  - [🚀 Deployment](#-deployment)
    - [Dockerfile Optimizado](#dockerfile-optimizado)
    - [Kubernetes Manifests](#kubernetes-manifests)
  - [🔗 Referencias y Enlaces Útiles](#-referencias-y-enlaces-útiles)
    - [Documentación Framework](#documentación-framework)
    - [APIs y Herramientas](#apis-y-herramientas)
    - [Patrones de Arquitectura](#patrones-de-arquitectura)
    - [Testing y Calidad](#testing-y-calidad)

## 💻 Overview

El **Resources Service** es el microservicio central para la gestión integral de recursos físicos en el ecosistema Bookly. Maneja la creación, actualización, categorización, importación masiva y mantenimiento de todos los recursos disponibles para reserva en la Universidad Francisco de Paula Santander (UFPS). Implementa arquitectura hexagonal con CQRS y Event-Driven Architecture para garantizar escalabilidad y mantenibilidad.

### 🎯 Características Principales

- **RF-01**: CRUD completo de recursos con validaciones avanzadas y auditoría
- **RF-02**: Sistema de categorización jerárquica y asociación a programas académicos
- **RF-03**: Definición de atributos clave personalizables y extensibles por tipo
- **RF-04**: Importación masiva con procesamiento asíncrono y validación avanzada
- **RF-05**: Configuración granular de reglas de disponibilidad y restricciones temporales
- **RF-06**: Sistema integral de mantenimiento con alertas automatizadas y programación

### Información de Servicio

- **Puerto**: `3002` (desarrollo) / `3000` (producción vía API Gateway)
- **Health Check**: `GET /api/v1/resources/health`
- **Documentación Swagger**: `GET /api/v1/resources/docs`
- **Métricas Prometheus**: `GET /api/v1/resources/metrics`
- **WebSocket**: `ws://localhost:3002/resources-events`

## 🏗️ Arquitectura

Implementa **Clean Architecture** con separación de responsabilidades siguiendo patrones hexagonales:

```
src/apps/resources-service/
├── domain/
│   ├── entities/           # Resource, Category, MaintenanceSchedule
│   ├── value-objects/      # ResourceCode, Location, Equipment
│   ├── events/            # ResourceCreated, MaintenanceScheduled
│   ├── interfaces/        # Repositorios y servicios de dominio
│   └── exceptions/        # Excepciones específicas del dominio
├── application/
│   ├── commands/          # CreateResource, ScheduleMaintenance
│   ├── queries/           # FindResources, GetMaintenanceSchedule
│   ├── handlers/          # Command/Query handlers CQRS
│   ├── use-cases/         # Lógica de aplicación y orchestración
│   └── dto/              # Data Transfer Objects
├── infrastructure/
│   ├── controllers/       # REST endpoints y WebSocket
│   ├── repositories/      # Implementaciones Prisma
│   ├── import/           # Procesamiento de archivos CSV/Excel
│   ├── messaging/        # RabbitMQ publishers/subscribers
│   ├── cache/           # Redis cache para consultas frecuentes
│   └── config/          # Configuración de módulo
├── config/               # Variables de entorno
└── test/                # Pruebas BDD con Jasmine
```

## 🛠️ Stack Tecnológico

### Core Framework
```typescript
// Framework Principal
NestJS: "^10.3.2"           // Framework modular con decoradores y DI
TypeScript: "^5.3.3"        // Tipado estático y herramientas avanzadas
Reflect-metadata: "^0.2.1"  // Metadatos para decoradores

// Validation & Transformation
class-validator: "^0.14.1"   // Validaciones de DTOs y entidades
class-transformer: "^0.5.1"  // Transformación de objetos
```

### Base de Datos y ORM
```typescript
// Database Client
Prisma: "^5.9.1"             // ORM type-safe con generación automática
@prisma/client: "^5.9.1"     // Cliente generado para acceso a DB

// Database
MongoDB Atlas                 // Base de datos NoSQL distribuida
```

### Event-Driven Architecture
```typescript
// Message Broker
@nestjs/microservices: "^10.3.2"  // Abstracciones para microservicios
rabbitmq: "^0.10.0"              // Integración con RabbitMQ

// Cache
Redis: "^7.2.4"                   // Cache de alta velocidad
ioredis: "^5.3.2"                 // Cliente Redis para Node.js
```

### Observability Stack
```typescript
// Logging
Winston: "^3.11.0"               // Logging estructurado
nestjs-pino: "^4.0.0"            // Logger optimizado para producción

// Tracing & Monitoring
@opentelemetry/auto-instrumentations  // Instrumentación automática
@sentry/node: "^7.99.0"              // Error tracking y performance
```

## 📋 Requerimientos Funcionales Detallados

### RF-01: CRUD Completo de Recursos

```typescript
interface Resource {
  id: string;
  code: string;                    // Código único autogenerado
  name: string;                    // Nombre descriptivo del recurso
  type: ResourceType;              // ROOM, LABORATORY, AUDITORIUM, EQUIPMENT
  capacity?: number;               // Capacidad máxima de personas
  location: Location;              // Ubicación física detallada
  categoryIds: string[];           // Múltiples categorías asignadas
  academicProgramId: string;       // Programa académico único asociado
  attributes: ResourceAttribute[]; // Atributos extensibles por tipo
  availability: AvailabilityRule[]; // Reglas granulares de disponibilidad
  maintenanceSchedule?: MaintenanceSchedule[];
  status: ResourceStatus;          // ACTIVE, INACTIVE, MAINTENANCE, DELETED
  createdBy: string;               // Usuario que creó el recurso
  updatedBy: string;               // Último usuario que modificó
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;                // Soft delete timestamp
  metadata: ResourceMetadata;      // Metadatos adicionales
}
```

### RF-02: Sistema de Categorización

```typescript
interface ResourceCategory {
  id: string;
  name: string;
  description?: string;
  color: string;              // Para UI visual
  icon: string;               // Icono identificativo
  parentId?: string;          // Categorías jerárquicas
  isActive: boolean;
  createdAt: Date;
}
```

### RF-04: Importación Masiva

```typescript
interface ImportJob {
  id: string;
  fileName: string;
  fileSize: number;
  status: ImportStatus;
  progress: number;            // 0-100
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: ImportError[];
  userId: string;
  createdAt: Date;
  completedAt?: Date;
}
```

### RF-06: Gestión de Mantenimiento

```typescript
interface MaintenanceSchedule {
  id: string;
  resourceId: string;
  maintenanceType: MaintenanceType;
  title: string;
  scheduledDate: Date;
  estimatedDuration: number;   // minutes
  status: MaintenanceStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedTo?: string;
  notes?: string;
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
}
```

## 🔌 API REST Endpoints

### Gestión de Recursos (RF-01)

**Crear Recurso**:
```http
POST /api/v1/resources
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "name": "Laboratorio de Redes Avanzado",
  "type": "LABORATORY",
  "capacity": 25,
  "location": {
    "building": "Bloque A",
    "floor": 3,
    "room": "A-301",
    "coordinates": { "lat": 7.8939, "lng": -72.5078 }
  },
  "academicProgramId": "prog_ing_sistemas",
  "categoryIds": ["cat_laboratorio", "cat_computo"],
  "attributes": [
    { "key": "computers", "value": 20, "type": "NUMBER", "required": true },
    { "key": "projector", "value": true, "type": "BOOLEAN", "required": false },
    { "key": "software", "value": "Cisco Packet Tracer, Wireshark", "type": "STRING" }
  ],
  "availability": {
    "weeklySchedule": [
      {
        "dayOfWeek": "MONDAY",
        "timeSlots": [{
          "startTime": "06:00",
          "endTime": "22:00",
          "isAvailable": true,
          "maxReservationHours": 4
        }]
      }
    ]
  }
}

# Respuesta
{
  "success": true,
  "data": {
    "id": "res_67890",
    "code": "LAB-A301",
    "name": "Laboratorio de Redes Avanzado",
    "type": "LABORATORY",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Listar Recursos con Filtros**:
```http
GET /api/v1/resources?type=LABORATORY&academicProgram=ING-SIS&capacity[min]=20&status=ACTIVE&page=1&limit=10

# Respuesta
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "res_67890",
        "code": "LAB-A301",
        "name": "Laboratorio de Redes Avanzado",
        "type": "LABORATORY",
        "capacity": 25,
        "status": "ACTIVE",
        "location": { "building": "Bloque A", "floor": 3, "room": "A-301" },
        "categories": ["Laboratorio", "Cómputo"],
        "academicProgram": "Ingeniería de Sistemas"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

### Gestión de Categorías y Programas (RF-02)

**Listar Categorías con Jerarquía**:
```http
GET /api/v1/categories?includeHierarchy=true&type=RESOURCE

# Respuesta
{
  "success": true,
  "data": [
    {
      "id": "cat_laboratorio",
      "code": "LABORATORIO",
      "name": "Laboratorio",
      "color": "#2196F3",
      "icon": "lab",
      "isDeletable": false,
      "resourceCount": 12,
      "children": [
        {
          "id": "cat_lab_computo",
          "name": "Laboratorio de Cómputo",
          "resourceCount": 8
        }
      ]
    }
  ]
}
```

### Importación Masiva (RF-04)

**Validar Archivo de Importación**:
```http
POST /api/v1/import/validate
Content-Type: multipart/form-data

file: resources.csv
options: {"createMissingCategories": false, "skipDuplicates": true}

# Respuesta
{
  "success": true,
  "data": {
    "isValid": true,
    "totalRows": 50,
    "validRows": 48,
    "errors": [
      {
        "row": 5,
        "column": "capacity",
        "value": "invalid",
        "message": "Capacity must be a number",
        "severity": "ERROR"
      }
    ],
    "preview": [...],
    "estimatedDuration": 120
  }
}
```

**Iniciar Importación Asíncrona**:
```http
POST /api/v1/import/start
{
  "fileId": "upload_123",
  "options": {
    "skipDuplicates": true,
    "createMissingCategories": false,
    "notifyOnComplete": true
  }
}

# Respuesta
{
  "success": true,
  "data": {
    "jobId": "job_456",
    "status": "PENDING",
    "estimatedDuration": 120,
    "message": "Import job queued successfully"
  }
}
```

### Gestión de Mantenimiento (RF-06)

**Programar Mantenimiento Preventivo**:
```http
POST /api/v1/maintenance
{
  "resourceId": "res_67890",
  "type": "PREVENTIVO",
  "title": "Mantenimiento mensual - Laboratorio A301",
  "description": "Limpieza de equipos y verificación de software",
  "scheduledDate": "2024-02-15T14:00:00Z",
  "estimatedDuration": 120,
  "priority": "MEDIUM",
  "recurrenceRule": {
    "frequency": "MONTHLY",
    "interval": 1,
    "dayOfMonth": 15
  }
}

# Respuesta
{
  "success": true,
  "data": {
    "id": "maint_789",
    "status": "SCHEDULED",
    "nextOccurrence": "2024-03-15T14:00:00Z",
    "resourceBlocked": true
  }
}
```

**Reportar Incidencia**:
```http
POST /api/v1/incidents
{
  "resourceId": "res_67890",
  "title": "Proyector no funciona",
  "description": "El proyector del laboratorio A301 no se enciende",
  "priority": "HIGH",
  "category": "MALFUNCTION",
  "photos": ["photo1.jpg", "photo2.jpg"]
}

# Respuesta
{
  "success": true,
  "data": {
    "id": "inc_321",
    "ticketNumber": "INC-2024-0015",
    "status": "OPEN",
    "estimatedResolution": "2024-01-17T16:00:00Z"
  }
}
```

## 📡 Event-Driven Architecture

### Eventos Publicados por Resources Service

```typescript
// Gestión de Recursos
class ResourceCreatedEvent {
  resourceId: string;
  code: string;
  name: string;
  type: ResourceType;
  academicProgramId: string;
  categoryIds: string[];
  createdBy: string;
  timestamp: Date;
}

class ResourceUpdatedEvent {
  resourceId: string;
  changes: Record<string, any>;
  previousState: Partial<Resource>;
  updatedBy: string;
  timestamp: Date;
}

class ResourceDeletedEvent {
  resourceId: string;
  deletedBy: string;
  reason?: string;
  timestamp: Date;
}

// Disponibilidad
class ResourceAvailabilityChangedEvent {
  resourceId: string;
  previousAvailability: AvailabilityConfiguration;
  newAvailability: AvailabilityConfiguration;
  effectiveFrom: Date;
  changedBy: string;
}

// Mantenimiento
class MaintenanceScheduledEvent {
  maint;
}

class MaintenanceCompletedEvent {
  maintenanceId: string;
  resourceId: string;
  completedAt: Date;
  actualDuration: number;
  workPerformed: string;
  nextMaintenanceDate?: Date;
  completedBy: string;
}

// Importación
class BulkImportCompletedEvent {
  importJobId: string;
  totalResources: number;
  successfulImports: number;
  failedImports: number;
  importedBy: string;
  completedAt: Date;
}
```

### Eventos Consumidos

```typescript
// Desde Auth Service
class UserCreatedEvent {
  userId: string;
  email: string;
  roles: string[];
  academicPrograms: string[];
}

// Desde Availability Service
class ReservationCreatedEvent {
  reservationId: string;
  resourceId: string;
  startDate: Date;
  endDate: Date;
  userId: string;
}

class ReservationCancelledEvent {
  reservationId: string;
  resourceId: string;
  cancelledBy: string;
  reason?: string;
}
```

### Configuración de RabbitMQ

```yaml
Exchanges:
  - name: bookly.resources
    type: topic
    durable: true

Queues:
  - name: resources.availability.update
    exchange: bookly.resources
    routing_key: 'resources.availability.*'
  - name: resources.maintenance.notifications
    exchange: bookly.resources
    routing_key: 'resources.maintenance.*'

Routing Keys:
  - resources.created
  - resources.updated
  - resources.deleted
  - resources.availability.changed
  - resources.maintenance.scheduled
  - resources.maintenance.completed
  - resources.import.completed
```

### WebSocket Events (Real-time)

```typescript
// Namespace: /resources-events

// Para administradores
interface ResourceStatusUpdate {
  event: 'resource:status:changed';
  data: {
    resourceId: string;
    previousStatus: ResourceStatus;
    newStatus: ResourceStatus;
    reason?: string;
  };
}

// Para importaciones masivas
interface ImportProgressUpdate {
  event: 'import:progress';
  data: {
    jobId: string;
    progress: number; // 0-100
    processedRows: number;
    totalRows: number;
    status: ImportStatus;
  };
}

// Para mantenimiento
interface MaintenanceAlert {
  event: 'maintenance:alert';
  data: {
    type: 'overdue' | 'upcoming' | 'urgent';
    maintenanceId: string;
    resourceId: string;
    message: string;
    priority: MaintenancePriority;
  };
}
```

## 🗃️ Modelo de Base de Datos

### Esquemas Prisma

```prisma
model Resource {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  code              String    @unique // Autogenerado: LAB-001, AUD-002
  name              String
  type              ResourceType
  capacity          Int?
  location          Location
  academicProgramId String    @db.ObjectId
  academicProgram   AcademicProgram @relation(fields: [academicProgramId], references: [id])
  categoryIds       String[]  @db.ObjectId
  categories        Category[] @relation(fields: [categoryIds], references: [id])
  attributes        ResourceAttribute[]
  availability      AvailabilityConfiguration[]
  maintenanceSchedule MaintenanceSchedule[]
  status            ResourceStatus @default(ACTIVE)
  createdBy         String    @db.ObjectId
  updatedBy         String    @db.ObjectId
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime?
  metadata          Json?
}

model Category {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  code          String    @unique
  name          String
  description   String?
  color         String    // Hex color for UI
  icon          String?
  type          CategoryType
  isDeletable   Boolean   @default(true)
  isActive      Boolean   @default(true)
  parentCategoryId String? @db.ObjectId
  parentCategory   Category? @relation("CategoryHierarchy", fields: [parentCategoryId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  childCategories  Category[] @relation("CategoryHierarchy")
  resources     Resource[] @relation(fields: [id], references: [categoryIds])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model MaintenanceSchedule {
  id                String      @id @default(auto()) @map("_id") @db.ObjectId
  resourceId        String      @db.ObjectId
  resource          Resource    @relation(fields: [resourceId], references: [id])
  type              MaintenanceType
  title             String
  description       String?
  scheduledDate     DateTime
  estimatedDuration Int         // minutes
  recurrenceRule    RecurrenceRule?
  status            MaintenanceStatus @default(SCHEDULED)
  priority          MaintenancePriority
  assignedTo        String?     @db.ObjectId
  assignedTeam      String?
  estimatedCost     Float?
  actualCost        Float?
  supplierId        String?
  completedAt       DateTime?
  actualDuration    Int?
  workPerformed     String?
  partsUsed         MaintenancePart[]
  nextMaintenanceDate DateTime?
  incidentReports   String[]    @db.ObjectId
  createdBy         String      @db.ObjectId
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model ImportJob {
  id              String      @id @default(auto()) @map("_id") @db.ObjectId
  filename        String
  fileSize        Int
  mimeType        String
  status          ImportStatus @default(PENDING)
  progress        Int         @default(0)
  totalRows       Int
  processedRows   Int         @default(0)
  successCount    Int         @default(0)
  errorCount      Int         @default(0)
  warningCount    Int         @default(0)
  errors          ImportError[]
  warnings        ImportWarning[]
  createdResources String[]   @db.ObjectId
  startedAt       DateTime?
  completedAt     DateTime?
  userId          String      @db.ObjectId
  rollbackAvailable Boolean   @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

enum ResourceType {
  ROOM
  LABORATORY
  AUDITORIUM
  EQUIPMENT
}

enum ResourceStatus {
  ACTIVE
  INACTIVE
  MAINTENANCE
  DELETED
}

enum MaintenanceType {
  PREVENTIVO
  CORRECTIVO
  EMERGENCIA
  LIMPIEZA
}

enum MaintenancePriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

## 🔐 Autenticación y Autorización

### Roles y Permisos por Endpoint

```typescript
const PERMISSIONS = {
  // Gestión de Recursos (RF-01)
  'resources:create': {
    roles: ['ADMIN', 'PROGRAM_ADMIN'],
    description: 'Crear nuevos recursos físicos'
  },
  'resources:read': {
    roles: ['ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE', 'TEACHER', 'STUDENT'],
    description: 'Consultar recursos existentes'
  },
  'resources:update': {
    roles: ['ADMIN', 'PROGRAM_ADMIN'],
    description: 'Modificar información de recursos'
  },
  'resources:delete': {
    roles: ['ADMIN'],
    description: 'Eliminar recursos del sistema'
  },
  
  // Gestión de Categorías (RF-02)
  'categories:manage': {
    roles: ['ADMIN'],
    description: 'Crear, editar y eliminar categorías'
  },
  'categories:read': {
    roles: ['ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE', 'TEACHER'],
    description: 'Consultar categorías disponibles'
  },
  
  // Importación Masiva (RF-04)
  'import:create': {
    roles: ['ADMIN', 'PROGRAM_ADMIN'],
    description: 'Iniciar procesos de importación masiva'
  },
  'import:monitor': {
    roles: ['ADMIN', 'PROGRAM_ADMIN'],
    description: 'Monitorear progreso de importaciones'
  },
  
  // Mantenimiento (RF-06)
  'maintenance:schedule': {
    roles: ['ADMIN', 'ADMINISTRATIVE'],
    description: 'Programar mantenimientos preventivos'
  },
  'maintenance:report': {
    roles: ['ADMIN', 'ADMINISTRATIVE', 'TEACHER', 'STUDENT'],
    description: 'Reportar incidencias y problemas'
  },
  'maintenance:manage': {
    roles: ['ADMIN', 'ADMINISTRATIVE'],
    description: 'Gestionar solicitudes de mantenimiento'
  }
};
```

### Restricciones por Programa Académico

```typescript
// Los PROGRAM_ADMIN solo pueden gestionar recursos de sus programas asignados
interface ProgramRestriction {
  userId: string;
  allowedPrograms: string[];
  canCreateResources: boolean;
  canModifyExisting: boolean;
}
```

## ⚙️ Variables de Entorno

```bash
# ===================================
# CONFIGURACIÓN DEL SERVICIO
# ===================================
RESOURCES_SERVICE_PORT=3002
NODE_ENV=development
SERVICE_NAME=resources-service
SERVICE_VERSION=2.0.0

# ===================================
# BASE DE DATOS
# ===================================
DATABASE_URL="mongodb://bookly:bookly123@localhost:27017/bookly?authSource=admin"
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT_MS=30000

# ===================================
# CACHE REDIS
# ===================================
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""
REDIS_DB=2
REDIS_TTL_SECONDS=3600
REDIS_MAX_CONNECTIONS=50

# ===================================
# MESSAGE BROKER (RabbitMQ)
# ===================================
RABBITMQ_URL="amqp://bookly:bookly123@localhost:5672"
RABBITMQ_EXCHANGE=bookly.resources
RABBITMQ_QUEUE_PREFIX=resources
RABBITMQ_RETRY_ATTEMPTS=3
RABBITMQ_RETRY_DELAY_MS=5000

# ===================================
# SUBIDA E IMPORTACIÓN DE ARCHIVOS
# ===================================
UPLOAD_PATH="/tmp/uploads"
MAX_FILE_SIZE_MB=50
ALLOWED_IMPORT_FORMATS="csv,xlsx,xls"
IMPORT_BATCH_SIZE=100
IMPORT_TIMEOUT_MINUTES=30
CLEAN_UPLOADS_AFTER_HOURS=24

# ===================================
# INTEGRACIÓN CON GOOGLE WORKSPACE
# ===================================
GOOGLE_WORKSPACE_ENABLED=false
GOOGLE_SHEETS_API_KEY=""
GOOGLE_SHEETS_CLIENT_ID=""
GOOGLE_SHEETS_CLIENT_SECRET=""

# ===================================
# OBSERVABILIDAD
# ===================================
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_STRUCTURED_LOGGING=true

# Sentry Error Tracking
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
SENTRY_ENVIRONMENT=development
SENTRY_RELEASE=resources-service@2.0.0

# OpenTelemetry Tracing
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4317"
OTEL_SERVICE_NAME=bookly-resources-service
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1

# Prometheus Metrics
PROMETHEUS_ENABLED=true
METRICS_PORT=9090
METRICS_PATH=/metrics

# ===================================
# SEGURIDAD
# ===================================
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
CORS_CREDENTIALS=true

# ===================================
# DOCUMENTACIÓN
# ===================================
SWAGGER_ENABLED=true
SWAGGER_PATH=docs
SWAGGER_TITLE="Bookly Resources Service"
SWAGGER_VERSION=2.0.0
SWAGGER_DESCRIPTION="API for managing institutional resources"
```

## 📊 Observabilidad y Monitoreo

### Logging Estructurado con Winston

```typescript
interface ResourceLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  service: 'resources-service';
  traceId?: string;
  userId?: string;
  action: ResourceAction;
  resourceId?: string;
  resourceType?: ResourceType;
  details: Record<string, any>;
  duration?: number;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
}

// Eventos clave registrados:
- 'resource.created' - Creación de recursos
- 'resource.updated' - Modificación de recursos
- 'resource.deleted' - Eliminación de recursos
- 'import.started' - Inicio de importación masiva
- 'import.progress' - Progreso de importación
- 'import.completed' - Finalización de importación
- 'maintenance.scheduled' - Programación de mantenimiento
- 'maintenance.completed' - Finalización de mantenimiento
- 'incident.reported' - Reporte de incidencias
- 'availability.changed' - Cambios en disponibilidad
```

### Métricas Prometheus

```typescript
// Métricas personalizadas:
resources_total{type, status, program} - Total de recursos por tipo y estado
resources_created_total{type, program} - Contador de recursos creados
resources_updated_total{type} - Contador de actualizaciones
resources_deleted_total{type} - Contador de eliminaciones

import_jobs_total{status} - Total de trabajos de importación
import_duration_seconds - Duración de importaciones
import_records_processed_total - Registros procesados en importaciones

maintenance_schedules_total{type, status} - Mantenimientos programados
maintenance_duration_seconds - Duración real de mantenimientos
maintenance_cost_total{type} - Costo acumulado de mantenimientos

incidents_reported_total{severity, category} - Incidencias reportadas
incidents_resolution_time_seconds - Tiempo de resolución de incidencias

availability_changes_total{resource_type} - Cambios de disponibilidad
api_requests_total{endpoint, method, status} - Requests HTTP
api_request_duration_seconds{endpoint} - Duración de requests
```

### Códigos de Error Estándar

```typescript
const ERROR_CODES = {
  // Recursos (RSRC-XX)
  'RSRC-001': 'Resource not found',
  'RSRC-002': 'Resource code already exists',
  'RSRC-003': 'Invalid resource type',
  'RSRC-004': 'Resource is currently in use',
  'RSRC-005': 'Insufficient permissions for resource',
  
  // Categorías (CAT-XX)
  'CAT-001': 'Category not found',
  'CAT-002': 'Cannot delete non-deletable category',
  'CAT-003': 'Category has associated resources',
  
  // Importación (IMP-XX)
  'IMP-001': 'Invalid file format',
  'IMP-002': 'File size exceeds limit',
  'IMP-003': 'Import job not found',
  'IMP-004': 'Validation failed for import data',
  
  // Mantenimiento (MAINT-XX)
  'MAINT-001': 'Maintenance schedule conflict',
  'MAINT-002': 'Invalid maintenance type',
  'MAINT-003': 'Cannot schedule past maintenance'
};
```

## 🧪 Testing

### Estructura de Pruebas BDD con Jasmine

```typescript
// test/resources.spec.ts
describe('Resources Service - RF-01: CRUD de Recursos', () => {
  describe('Crear Recurso', () => {
    describe('Dado un administrador autenticado', () => {
      describe('Cuando crea un laboratorio válido', () => {
        it('Entonces debe generar código único y guardar', async () => {
          // Given
          const adminUser = { id: 'admin1', roles: ['ADMIN'] };
          const resourceData = {
            name: 'Laboratorio de Sistemas',
            type: 'LABORATORY',
            capacity: 30,
            location: { building: 'A', floor: 2, room: '201' }
          };
          
          // When
          const result = await resourceService.create(resourceData, adminUser);
          
          // Then
          expect(result.success).toBe(true);
          expect(result.data.code).toMatch(/LAB-\d{3}/);
          expect(result.data.status).toBe('ACTIVE');
        });
      });
    });
  });
});

// test/import.spec.ts  
describe('Resources Service - RF-04: Importación Masiva', () => {
  describe('Importar desde CSV', () => {
    describe('Dado un archivo CSV válido', () => {
      describe('Cuando se procesa la importación', () => {
        it('Entonces debe crear recursos y reportar progreso', async () => {
          // Test implementation
        });
      });
    });
  });
});
```

### Comandos de Testing

```bash
# Ejecutar todas las pruebas
npm run test

# Pruebas con cobertura
npm run test:cov

# Pruebas en modo watch
npm run test:watch

# Pruebas BDD específicas
npm run test -- --grep "RF-01"

# Pruebas de integración
npm run test:integration

# Pruebas E2E
npm run test:e2e
```

## 🚀 Deployment

### Dockerfile Optimizado

```dockerfile
# Multi-stage build para optimización
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm run prisma:generate

# Runtime stage
FROM node:22-alpine AS runtime
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3002/api/v1/resources/health || exit 1

USER nestjs
EXPOSE 3002
CMD ["node", "dist/main.js"]
```

### Kubernetes Manifests

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: resources-service
  namespace: bookly
  labels:
    app: resources-service
    version: v2.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: resources-service
  template:
    metadata:
      labels:
        app: resources-service
    spec:
      containers:
      - name: resources-service
        image: bookly/resources-service:2.0.0
        ports:
        - containerPort: 3002
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
              key: mongodb-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: bookly-secrets
              key: redis-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1/resources/health
            port: 3002
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/resources/health
            port: 3002
          initialDelaySeconds: 10
          periodSeconds: 5
```

## 🔗 Referencias y Enlaces Útiles

### Documentación Framework

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [RabbitMQ Management](https://www.rabbitmq.com/management.html)
- [Redis Commands](https://redis.io/commands/)

### APIs y Herramientas

- [Google Sheets API](https://developers.google.com/sheets/api)
- [Swagger/OpenAPI](https://swagger.io/docs/)
- [OpenTelemetry Node.js](https://opentelemetry.io/docs/instrumentation/js/)
- [Sentry Node.js](https://docs.sentry.io/platforms/node/)

### Patrones de Arquitectura

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

### Testing y Calidad

- [Jasmine BDD Framework](https://jasmine.github.io/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Supertest HTTP Testing](https://github.com/visionmedia/supertest)

---

**Documento**: README.md - Resources Service  
**Última actualización**: 31 de Agosto, 2025  
**Versión**: 2.0.0  
**Autor**: Equipo de Desarrollo Bookly  
**Revisor**: Arquitecto de Sistemas  
**Estado**: ✅ Documentación Completa y Validada

*Universidad Francisco de Paula Santander - Sistema Bookly de Reservas Institucionales*
