# Bookly Reports Service - Documentación Técnica

## 📋 Índice

- [Overview](#-overview)
- [Arquitectura](#-arquitectura)
- [Requerimientos Funcionales Detallados](#-requerimientos-funcionales-detallados)
- [Stack Tecnológico](#-stack-tecnológico)
- [API REST Endpoints](#-api-rest-endpoints)
- [Event-Driven Architecture](#-event-driven-architecture)
- [Modelo de Base de Datos](#-modelo-de-base-de-datos)
- [Autenticación y Autorización](#-autenticación-y-autorización)
- [Variables de Entorno](#-variables-de-entorno)
- [Observabilidad y Monitoreo](#-observabilidad-y-monitoreo)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Referencias y Enlaces Útiles](#-referencias-y-enlaces-útiles)

## 💻 Overview

El **Reports Service** es un microservicio especializado en Business Intelligence y Analytics para el ecosistema Bookly. Implementa los requerimientos funcionales RF-31 al RF-37, proporcionando capacidades avanzadas de generación, análisis, exportación y visualización de reportes para optimizar la gestión de reservas institucionales en la Universidad Francisco de Paula Santander (UFPS).

### 🎯 Características Principales

- **RF-31**: Reportes de uso detallados por recurso/programa/período con métricas avanzadas y tendencias
- **RF-32**: Reportes personalizados por usuario/profesor con análisis de patrones de comportamiento
- **RF-33**: Exportación masiva en múltiples formatos con procesamiento asíncrono (CSV, Excel, PDF)
- **RF-34**: Sistema integral de feedback y evaluación de usuarios con análisis de sentimientos
- **RF-35**: Evaluación bidireccional staff-usuarios con métricas de satisfacción y KPIs
- **RF-36**: Dashboards interactivos con visualizaciones en tiempo real y alertas automatizadas
- **RF-37**: Análisis predictivo de demanda insatisfecha con recomendaciones de optimización

### Información de Servicio

- **Puerto**: `3005` (desarrollo) / `3000` (producción vía API Gateway)
- **Health Check**: `GET /api/v1/reports/health`
- **Documentación Swagger**: `GET /api/v1/reports/docs`
- **Métricas Prometheus**: `GET /api/v1/reports/metrics`
- **WebSocket**: `ws://localhost:3005/reports-events`
- **Dashboard**: `GET /api/v1/reports/dashboard`

## 🏗️ Arquitectura

Implementa **Clean Architecture** con separación de responsabilidades siguiendo patrones hexagonales y CQRS para optimizar consultas complejas de reportes:

```
src/apps/reports-service/
├── domain/
│   ├── entities/           # Report, Dashboard, Feedback, ExportJob
│   ├── value-objects/      # ReportFilters, MetricData, ChartConfiguration
│   ├── events/            # ReportGenerated, ExportCompleted, DashboardUpdated
│   ├── interfaces/        # Repositorios y servicios de dominio
│   └── exceptions/        # Excepciones específicas del dominio
├── application/
│   ├── commands/          # GenerateReport, ExportReport, CreateFeedback
│   ├── queries/           # GetUsageReport, GetUserStats, GetDashboardData
│   ├── handlers/          # Command/Query handlers especializados en BI
│   ├── use-cases/         # Lógica compleja de generación de reportes
│   └── dto/              # Data Transfer Objects para reportes
├── infrastructure/
│   ├── controllers/       # REST endpoints y WebSocket para dashboards
│   ├── repositories/      # Implementaciones MongoDB optimizadas
│   ├── analytics/         # Motores de cálculo y agregación
│   ├── export/           # Generadores de CSV, Excel, PDF
│   ├── messaging/        # RabbitMQ publishers/subscribers
│   ├── cache/           # Redis para optimización de consultas pesadas
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

### Business Intelligence Stack
```typescript
// Data Processing
lodash: "^4.17.21"               // Utilidades para manipulación de datos
moment: "^2.29.4"                // Manipulación de fechas para reportes

// Export Formats
exceljs: "^4.4.0"                // Generación de archivos Excel
csv-writer: "^1.6.0"             // Generación de archivos CSV
puppeteer: "^21.6.1"             // Generación de PDFs

// Chart Generation
chartjs-node-canvas: "^4.1.6"    // Generación de gráficos server-side
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


### RF-31: Reportes de Uso

```typescript
interface UsageReportFilters {
  programId?: string;           // Filtro por programa académico
  resourceType?: ResourceType;  // Tipo de recurso (SALON, LABORATORIO, etc.)
  startDate: Date;             // Fecha inicio del período
  endDate: Date;               // Fecha fin del período
  buildingId?: string;         // Filtro por edificio
  floorNumber?: number;        // Filtro por piso
  includeMetrics?: boolean;    // Incluir métricas avanzadas
}

interface UsageReport {
  id: string;
  filters: UsageReportFilters;
  metrics: {
    totalReservations: number;
    totalHours: number;
    occupancyRate: number;
    peakHours: string[];
    mostUsedResources: Resource[];
  };
  data: UsageReportItem[];
  generatedAt: Date;
  generatedBy: string;
}
```

### RF-32: Reportes de Usuario

```typescript
interface UserReport {
  id: string;
  userId: string;
  period: { startDate: Date; endDate: Date };
  statistics: {
    totalReservations: number;
    totalHours: number;
    cancelationRate: number;
    favoriteResources: Resource[];
    usagePatterns: UsagePattern[];
  };
  reservationHistory: Reservation[];
  feedbackGiven: Feedback[];
}
```

### RF-33: Exportación de Reportes

```typescript
interface ExportRequest {
  reportType: 'usage' | 'user' | 'dashboard' | 'feedback';
  format: 'csv' | 'excel' | 'pdf';
  filters: Record<string, any>;
  includeCharts?: boolean;
  locale?: string;
}

interface ExportResponse {
  exportId: string;
  status: 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt: Date;
}
```

### RF-36: Dashboard Interactivo

```typescript
interface DashboardData {
  overview: {
    totalReservations: number;
    activeUsers: number;
    resourceUtilization: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
  charts: {
    reservationTrends: ChartData[];
    resourcePopularity: ChartData[];
    userActivity: ChartData[];
    occupancyHeatmap: HeatmapData[];
  };
  realTimeMetrics: {
    currentReservations: number;
    waitingListSize: number;
    systemLoad: number;
  };
}
```

### RF-37: Análisis de Demanda Insatisfecha

```typescript
interface UnsatisfiedDemandReport {
  period: { startDate: Date; endDate: Date };
  totalDemand: number;
  satisfiedDemand: number;
  unsatisfiedDemand: number;
  demandByResource: {
    resourceId: string;
    resourceName: string;
    requestedTimes: number;
    satisfiedTimes: number;
    satisfactionRate: number;
  }[];
  recommendations: {
    suggestedActions: string[];
    resourceNeeds: ResourceNeed[];
    timeSlotOptimizations: TimeSlotSuggestion[];
  };
}
```

## 🔌 API REST Endpoints

### Reportes de Uso (RF-31)

```http
GET /api/v1/reports/usage
GET /api/v1/reports/usage/summary
GET /api/v1/reports/usage/{reportId}
POST /api/v1/reports/usage/generate
```

### Reportes de Usuario (RF-32)

```http
GET /api/v1/reports/users/{userId}
GET /api/v1/reports/users/{userId}/summary
GET /api/v1/reports/users/me
POST /api/v1/reports/users/{userId}/generate
```

### Exportación (RF-33)

```http
POST /api/v1/reports/export
GET /api/v1/reports/export/{exportId}/status
GET /api/v1/reports/export/{exportId}/download
DELETE /api/v1/reports/export/{exportId}
```

### Dashboard (RF-36)

```http
GET /api/v1/reports/dashboard
GET /api/v1/reports/dashboard/overview
GET /api/v1/reports/dashboard/charts
GET /api/v1/reports/dashboard/realtime
```

### Feedback (RF-34/RF-35)

```http
GET /api/v1/reports/feedback
POST /api/v1/reports/feedback
GET /api/v1/reports/feedback/{feedbackId}
PUT /api/v1/reports/feedback/{feedbackId}
DELETE /api/v1/reports/feedback/{feedbackId}
```

### Análisis de Demanda (RF-37)

```http
GET /api/v1/reports/demand-analysis
POST /api/v1/reports/demand-analysis/generate
GET /api/v1/reports/demand-analysis/{analysisId}
```

## 📡 Event-Driven Architecture

### Eventos Publicados

```yaml
# reports.usage.generated
ReportGenerated:
  reportId: string
  reportType: 'usage' | 'user' | 'dashboard' | 'demand'
  generatedBy: string
  filters: object
  recordCount: number
  generatedAt: string

# reports.export.completed  
ExportCompleted:
  exportId: string
  reportId: string
  format: string
  filePath: string
  fileSize: number
  completedAt: string

# reports.dashboard.updated
DashboardUpdated:
  dashboardId: string
  updatedSections: string[]
  lastUpdate: string
  metrics: object
```

### Eventos Suscritos

```yaml
# reservation.created (desde availability-service)
ReservationCreated:
  reservationId: string
  resourceId: string
  userId: string
  startDate: string
  endDate: string

# user.activity.logged (desde auth-service)
UserActivityLogged:
  userId: string
  activity: string
  timestamp: string
  metadata: object
```

## 💾 Base de Datos

### Modelos de Datos Principales

```prisma
model UsageReport {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  reportType  String
  filters     Json
  data        Json
  metrics     Json
  generatedBy String
  generatedAt DateTime @default(now())
  expiresAt   DateTime?
  
  @@map("usage_reports")
}

model UserReport {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  userId        String
  period        Json
  statistics    Json
  reservations  Json[]
  feedback      Json[]
  generatedAt   DateTime @default(now())
  
  @@map("user_reports")
}

model ExportJob {
  id           String      @id @default(auto()) @map("_id") @db.ObjectId
  reportId     String
  format       String
  status       ExportStatus
  filePath     String?
  fileSize     Int?
  requestedBy  String
  requestedAt  DateTime    @default(now())
  completedAt  DateTime?
  expiresAt    DateTime
  
  @@map("export_jobs")
}

model Feedback {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String
  resourceId  String?
  rating      Int      @db.Int
  comment     String?
  category    String
  isAnonymous Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  @@map("feedback")
}
```

## 🔐 Autenticación y Autorización

### Roles y Permisos

```typescript
enum UserRole {
  ADMIN = 'ADMIN',                    // Acceso completo a todos los reportes
  PROGRAM_ADMIN = 'PROGRAM_ADMIN',    // Reportes de su programa académico
  ADMINISTRATIVE = 'ADMINISTRATIVE',   // Reportes operacionales
  TEACHER = 'TEACHER',                // Sus propios reportes + estudiantes
  STUDENT = 'STUDENT'                 // Solo sus propios reportes
}

const PERMISSIONS = {
  'reports:usage:read': ['ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE'],
  'reports:usage:generate': ['ADMIN', 'PROGRAM_ADMIN'],
  'reports:user:read_own': ['TEACHER', 'STUDENT'],
  'reports:user:read_all': ['ADMIN', 'PROGRAM_ADMIN'],
  'reports:export:create': ['ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE'],
  'reports:dashboard:read': ['ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE'],
  'reports:feedback:create': ['TEACHER', 'STUDENT'],
  'reports:feedback:read_all': ['ADMIN', 'ADMINISTRATIVE']
};
```

### JWT Token Structure

```typescript
interface ReportsJwtPayload {
  sub: string;                    // User ID
  email: string;
  role: UserRole;
  programId?: string;            // Para PROGRAM_ADMIN
  permissions: string[];
  iat: number;
  exp: number;
}
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# ===========================================
# CONFIGURACIÓN DEL SERVICIO
# ===========================================
REPORTS_SERVICE_PORT=3005
REPORTS_SERVICE_HOST=localhost
NODE_ENV=development
API_VERSION=v1
API_PREFIX=api/v1/reports

# ===========================================
# BASE DE DATOS
# ===========================================
DATABASE_URL="mongodb://bookly:bookly123@localhost:27017/bookly?replicaSet=bookly-rs&authSource=admin"
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000

# ===========================================
# REDIS CACHE
# ===========================================
REDIS_URL="redis://localhost:6379"
REDIS_TTL=3600
REDIS_KEY_PREFIX="reports:"
REDIS_CLUSTER_MODE=false

# ===========================================
# RABBITMQ - MESSAGE BROKER
# ===========================================
RABBITMQ_URL="amqp://bookly:bookly123@localhost:5672"
REPORTS_EXCHANGE="bookly.reports"
REPORTS_QUEUE="reports.service"
DEAD_LETTER_EXCHANGE="bookly.reports.dlx"
RECONNECT_ATTEMPTS=5
RECONNECT_DELAY=5000

# ===========================================
# AUTENTICACIÓN JWT
# ===========================================
JWT_SECRET="reports-service-jwt-secret-key-2024"
JWT_EXPIRES_IN="24h"
JWT_ISSUER="bookly-reports-service"
JWT_AUDIENCE="bookly-system"

# ===========================================
# SERVICIOS EXTERNOS
# ===========================================
AUTH_SERVICE_URL="http://localhost:3001"
AVAILABILITY_SERVICE_URL="http://localhost:3002"
RESOURCES_SERVICE_URL="http://localhost:3003"
STOCKPILE_SERVICE_URL="http://localhost:3004"
API_GATEWAY_URL="http://localhost:3000"

# ===========================================
# EXPORTACIÓN Y ARCHIVOS
# ===========================================
EXPORT_STORAGE_PATH="./storage/exports"
TEMP_STORAGE_PATH="./storage/temp"
MAX_EXPORT_SIZE_MB=500
EXPORT_TTL_HOURS=72
MAX_CONCURRENT_EXPORTS=5
FILE_UPLOAD_MAX_SIZE=10485760

# ===========================================
# BUSINESS INTELLIGENCE
# ===========================================
CHART_GENERATION_TIMEOUT=30000
DATA_AGGREGATION_TIMEOUT=60000
REPORT_CACHE_TTL=1800
MAX_REPORT_RECORDS=100000
ANALYTICS_BATCH_SIZE=1000

# ===========================================
# OBSERVABILIDAD
# ===========================================
LOG_LEVEL="info"
LOG_FORMAT="json"
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"
SENTRY_ENVIRONMENT="development"
OPENTELEMETRY_ENDPOINT="http://localhost:4317"
METRICS_ENABLED=true
METRICS_PORT=9090
HEALTH_CHECK_ENABLED=true

# ===========================================
# CORS Y SEGURIDAD
# ===========================================
CORS_ENABLED=true
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
CORS_CREDENTIALS=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# ===========================================
# DOCUMENTACIÓN SWAGGER
# ===========================================
SWAGGER_ENABLED=true
SWAGGER_PATH="/docs"
SWAGGER_TITLE="Bookly Reports Service API"
SWAGGER_VERSION="1.0.0"
SWAGGER_DESCRIPTION="API de Business Intelligence y Analytics para Bookly"
```

## 📊 Observabilidad y Monitoreo

### Logging Estructurado

```typescript
// Configuración de Winston
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'reports-service',
    version: process.env.npm_package_version
  },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/reports-error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/reports-combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### Métricas Prometheus

```typescript
// Métricas personalizadas para reportes
const reportsMetrics = {
  // Contador de reportes generados
  reportsGenerated: new Counter({
    name: 'bookly_reports_generated_total',
    help: 'Total de reportes generados',
    labelNames: ['type', 'format', 'user_role']
  }),
  
  // Duración de generación de reportes
  reportGenerationDuration: new Histogram({
    name: 'bookly_report_generation_duration_seconds',
    help: 'Tiempo de generación de reportes',
    labelNames: ['type', 'complexity'],
    buckets: [0.1, 0.5, 1, 5, 10, 30, 60]
  }),
  
  // Trabajos de exportación
  exportJobsActive: new Gauge({
    name: 'bookly_export_jobs_active',
    help: 'Trabajos de exportación activos'
  }),
  
  // Feedback recibido
  feedbackReceived: new Counter({
    name: 'bookly_feedback_received_total',
    help: 'Total de feedback recibido',
    labelNames: ['resource_type', 'rating']
  }),
  
  // Cache hits/misses
  cacheHits: new Counter({
    name: 'bookly_reports_cache_hits_total',
    help: 'Cache hits en reportes'
  }),
  
  cacheMisses: new Counter({
    name: 'bookly_reports_cache_misses_total', 
    help: 'Cache misses en reportes'
  })
};
```

### Códigos de Error Estandarizados

```typescript
export const REPORTS_ERROR_CODES = {
  // Reportes generales (RPT-01xx)
  'RPT-0101': 'El tipo de reporte especificado no es válido',
  'RPT-0102': 'Los filtros de fecha son obligatorios',
  'RPT-0103': 'El rango de fechas no puede exceder 1 año',
  'RPT-0104': 'No se encontraron datos para los filtros especificados',
  'RPT-0105': 'Error al generar el reporte solicitado',
  
  // Exportación (RPT-02xx)
  'RPT-0201': 'Formato de exportación no soportado',
  'RPT-0202': 'El trabajo de exportación ha excedido el tamaño máximo permitido',
  'RPT-0203': 'El trabajo de exportación ha fallado',
  'RPT-0204': 'El archivo de exportación ha expirado',
  'RPT-0205': 'Demasiados trabajos de exportación concurrentes',
  
  // Feedback (RPT-03xx)
  'RPT-0301': 'La calificación debe estar entre 1 y 5',
  'RPT-0302': 'El feedback para esta reserva ya existe',
  'RPT-0303': 'Solo se puede dar feedback dentro de 7 días después de la reserva',
  
  // Dashboards (RPT-04xx)
  'RPT-0401': 'Configuración de dashboard inválida',
  'RPT-0402': 'El widget especificado no existe',
  'RPT-0403': 'Error al actualizar los datos del dashboard',
  
  // Analytics (RPT-05xx)
  'RPT-0501': 'Insuficientes datos históricos para análisis predictivo',
  'RPT-0502': 'Error en el cálculo de métricas de demanda'
} as const;
```

## 🧪 Testing

### Estructura de Pruebas BDD

```
test/
├── unit/
│   ├── domain/
│   │   ├── entities/          # Pruebas de entidades de dominio
│   │   └── value-objects/     # Pruebas de value objects
│   ├── application/
│   │   ├── handlers/          # Pruebas de command/query handlers
│   │   └── use-cases/         # Pruebas de casos de uso
│   └── infrastructure/
│       ├── controllers/       # Pruebas de controladores
│       └── repositories/      # Pruebas de repositorios
├── integration/
│   ├── api/                  # Pruebas de endpoints REST
│   ├── events/               # Pruebas de eventos
│   └── database/             # Pruebas de persistencia
├── e2e/
│   ├── reports-generation/   # Flujos completos de generación
│   ├── export-workflows/     # Flujos de exportación
│   └── dashboard-updates/    # Actualizaciones en tiempo real
└── fixtures/
    ├── data/                # Datos de prueba
    └── mocks/               # Mocks de servicios externos
```

### Ejemplos de Pruebas BDD

```typescript
// test/integration/api/usage-reports.spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Usage Reports API', () => {
  let app: INestApplication;
  
  beforeAll(async () => {
    // Setup de la aplicación de pruebas
  });
  
  describe('Given I want to generate a usage report', () => {
    describe('When I provide valid filters', () => {
      it('Then it should generate the report successfully', async () => {
        // Given
        const filters = {
          programId: 'ING-SIS',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-12-31T23:59:59Z',
          resourceType: 'LABORATORIO'
        };
        
        // When
        const response = await request(app.getHttpServer())
          .post('/api/v1/reports/usage')
          .set('Authorization', `Bearer ${validToken}`)
          .send(filters)
          .expect(201);
        
        // Then
        expect(response.body).toHaveProperty('reportId');
        expect(response.body.data.summary).toHaveProperty('totalReservations');
        expect(response.body.data.summary.totalReservations).toBeGreaterThanOrEqual(0);
      });
    });
    
    describe('When I provide invalid date range', () => {
      it('Then it should return validation error', async () => {
        // Given
        const invalidFilters = {
          startDate: '2024-12-31T00:00:00Z',
          endDate: '2024-01-01T23:59:59Z' // Fecha fin menor que inicio
        };
        
        // When & Then
        const response = await request(app.getHttpServer())
          .post('/api/v1/reports/usage')
          .set('Authorization', `Bearer ${validToken}`)
          .send(invalidFilters)
          .expect(400);
        
        expect(response.body.code).toBe('RPT-0103');
      });
    });
  });
});
```

### Comandos de Pruebas

```bash
# Ejecutar todas las pruebas
npm run test

# Pruebas unitarias
npm run test:unit

# Pruebas de integración
npm run test:integration

# Pruebas E2E
npm run test:e2e

# Cobertura de código
npm run test:cov

# Pruebas en modo watch
npm run test:watch

# Pruebas específicas de reportes
npm run test -- --testPathPattern=reports
```

## 🚀 Deployment

### Dockerfile Optimizado

```dockerfile
# Multi-stage build para optimizar tamaño
FROM node:22-alpine AS builder

# Instalar dependencias del sistema para compilación
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma/ ./prisma/

# Instalar dependencias y generar cliente Prisma
RUN npm ci --only=production && \
    npx prisma generate

# Copiar código fuente y compilar
COPY src/ ./src/
COPY tsconfig*.json ./
RUN npm run build

# Etapa de producción
FROM node:22-alpine AS production

# Instalar dependencias de runtime
RUN apk add --no-cache cairo pango ttf-dejavu && \
    addgroup -g 1001 -S bookly && \
    adduser -S bookly -u 1001

WORKDIR /app

# Copiar archivos necesarios desde builder
COPY --from=builder --chown=bookly:bookly /app/node_modules ./node_modules
COPY --from=builder --chown=bookly:bookly /app/dist ./dist
COPY --from=builder --chown=bookly:bookly /app/prisma ./prisma
COPY --chown=bookly:bookly package*.json ./

# Crear directorios de storage
RUN mkdir -p storage/exports storage/temp logs && \
    chown -R bookly:bookly storage logs

USER bookly

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3005/api/v1/reports/health || exit 1

EXPOSE 3005

CMD ["node", "dist/main.js"]
```

### Kubernetes Manifests

```yaml
# k8s/reports-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: reports-service
  labels:
    app: reports-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: reports-service
  template:
    metadata:
      labels:
        app: reports-service
    spec:
      containers:
      - name: reports-service
        image: bookly/reports-service:latest
        ports:
        - containerPort: 3005
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: bookly-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: bookly-secrets
              key: redis-url
        - name: RABBITMQ_URL
          valueFrom:
            secretKeyRef:
              name: bookly-secrets
              key: rabbitmq-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/v1/reports/health
            port: 3005
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/v1/reports/health
            port: 3005
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: reports-service-svc
spec:
  selector:
    app: reports-service
  ports:
  - port: 3005
    targetPort: 3005
  type: ClusterIP
```

## 📚 Referencias y Enlaces Útiles

### Framework y Dependencias

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma ORM](https://www.prisma.io/docs/)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [RabbitMQ](https://www.rabbitmq.com/documentation.html)
- [Redis](https://redis.io/documentation)

### Business Intelligence Tools

- [Chart.js](https://www.chartjs.org/docs/)
- [ExcelJS](https://github.com/exceljs/exceljs)
- [Puppeteer](https://pptr.dev/)
- [CSV Writer](https://www.npmjs.com/package/csv-writer)

### Observability

- [Winston Logger](https://github.com/winstonjs/winston)
- [OpenTelemetry](https://opentelemetry.io/docs/)
- [Sentry](https://docs.sentry.io/platforms/node/)
- [Prometheus](https://prometheus.io/docs/)

### Testing

- [Jest](https://jestjs.io/docs/getting-started)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

### Architecture Patterns

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Event-Driven Architecture](https://microservices.io/patterns/data/event-driven-architecture.html)

---

**Documento**: README.md - Reports Service  
**Última actualización**: 31 de Agosto, 2025  
**Versión**: 2.0.0  
**Autor**: Equipo de Desarrollo Bookly  
**Revisor**: Arquitecto de Sistemas  
**Estado**: ✅ Documentación Completa y Validada

*Universidad Francisco de Paula Santander - Sistema Bookly de Reservas Institucionales*
