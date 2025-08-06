# Reports Service API Documentation

## Overview

El Reports Service implementa los requerimientos funcionales RF-31, RF-32 y RF-33 del Hito 5 - Reportes Básicos de Bookly. Proporciona endpoints para generar reportes de uso de recursos, reportes de usuarios, y exportación en formato CSV.

## Arquitectura

- **Patrón CQRS**: Separación entre comandos y consultas
- **Event-Driven Architecture**: Eventos asincrónicos para auditoría
- **Clean Architecture**: Separación de responsabilidades (domain, application, infrastructure)
- **Cache Redis**: Optimización de consultas con expiración de 30 minutos
- **Auditoría completa**: Logging estructurado de todas las operaciones

## Autenticación y Autorización

Todos los endpoints requieren:
- **JWT Token**: Header `Authorization: Bearer <token>`
- **Roles específicos**: Validados mediante guards de NestJS

### Roles Soportados
- `ADMIN`: Acceso completo a todos los reportes
- `PROGRAM_ADMIN`: Acceso a reportes de su programa académico
- `ADMINISTRATIVE`: Acceso a reportes administrativos
- `TEACHER`: Acceso limitado a sus propios datos
- `STUDENT`: Acceso limitado a sus propios datos

## Endpoints

### 1. Usage Reports (RF-31)

#### GET /reports/usage
Genera reporte de uso de recursos filtrado por programa, período y tipo de recurso.

**Autorización**: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`

**Query Parameters**:
```typescript
{
  programIds?: string[];           // IDs de programas académicos
  resourceTypes?: string[];        // Tipos de recursos (CLASSROOM, LAB, AUDITORIUM, etc.)
  categories?: string[];           // Categorías de recursos
  startDate?: string;              // Fecha inicio (ISO 8601)
  endDate?: string;                // Fecha fin (ISO 8601)
  groupBy?: string[];              // Agrupación (program, resourceType, category, period)
  aggregations?: string[];         // Agregaciones (sum, avg, count, min, max)
  includeDetails?: boolean;        // Incluir detalles de reservas
  page?: number;                   // Página (default: 1)
  limit?: number;                  // Límite por página (default: 50, max: 200)
  sortBy?: string;                 // Campo de ordenamiento
  sortOrder?: 'ASC' | 'DESC';      // Orden (default: DESC)
}
```

**Response**:
```typescript
{
  metadata: {
    generatedAt: string;           // ISO timestamp
    generatedBy: string;           // User ID
    reportType: 'USAGE_REPORT';
    filters: object;               // Filtros aplicados
    totalRecords: number;
    executionTime: number;         // Milisegundos
  },
  data: Array<{
    resourceId: string;
    resourceName: string;
    resourceType: string;
    category: string;
    totalReservations: number;
    totalHours: number;
    utilizationRate: number;       // Porcentaje 0-100
    program: string;
    period: string;
    details?: Array<{              // Si includeDetails = true
      reservationId: string;
      startTime: string;
      endTime: string;
      duration: number;
      status: string;
    }>;
  }>,
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  },
  summary: {
    totalResources: number;
    totalReservations: number;
    averageUtilization: number;
    mostUsedResource: string;
    leastUsedResource: string;
  }
}
```

**Ejemplo**:
```bash
GET /reports/usage?programIds=prog-1&resourceTypes=CLASSROOM&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=50
```

#### GET /reports/usage/summary
Obtiene resumen estadístico del reporte de uso con filtros dados.

**Autorización**: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`

**Query Parameters**: Mismos que `/reports/usage`

**Response**:
```typescript
{
  totalResources: number;
  totalReservations: number;
  averageUtilization: number;
  mostUsedResource: string;
  leastUsedResource: string;
  utilizationByType: Array<{
    resourceType: string;
    utilization: number;
  }>;
  utilizationByProgram: Array<{
    program: string;
    utilization: number;
  }>;
}
```

#### GET /reports/usage/filter-options/{filterType}
Obtiene opciones disponibles para filtros de reportes.

**Autorización**: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`, `TEACHER`, `STUDENT`

**Path Parameters**:
- `filterType`: `programs` | `resourceTypes` | `categories` | `users`

**Query Parameters**:
- `userType?: string` - Filtrar usuarios por tipo (solo para filterType=users)

**Response**:
```typescript
Array<{
  id: string;
  name: string;
  code?: string;
  count?: number;              // Número de registros disponibles
}>
```

### 2. User Reports (RF-32)

#### GET /reports/users
Genera reporte de reservas realizadas por usuarios/profesores.

**Autorización**: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`

**Query Parameters**:
```typescript
{
  userIds?: string[];              // IDs específicos de usuarios
  userTypes?: string[];            // Tipos de usuario (TEACHER, STUDENT, ADMIN, etc.)
  programIds?: string[];           // Filtrar por programas académicos
  startDate?: string;              // Fecha inicio
  endDate?: string;                // Fecha fin
  reservationStatuses?: string[];  // Estados de reserva (CONFIRMED, CANCELLED, etc.)
  includeDetails?: boolean;        // Incluir detalles de reservas
  includeStats?: boolean;          // Incluir estadísticas por usuario
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
```

**Response**:
```typescript
{
  metadata: {
    generatedAt: string;
    generatedBy: string;
    reportType: 'USER_REPORT';
    filters: object;
    totalRecords: number;
    executionTime: number;
  },
  data: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    userType: string;
    program: string;
    totalReservations: number;
    confirmedReservations: number;
    cancelledReservations: number;
    noShowReservations: number;
    totalHours: number;
    utilizationRate: number;
    cancellationRate: number;
    averageAdvanceBooking: number;    // Días promedio de anticipación
    frequentResources: Array<{
      resourceName: string;
      count: number;
    }>;
    details?: Array<{                 // Si includeDetails = true
      reservationId: string;
      resourceName: string;
      startTime: string;
      endTime: string;
      status: string;
      createdAt: string;
    }>;
  }>,
  pagination: object,
  summary: {
    totalUsers: number;
    totalReservations: number;
    averageReservationsPerUser: number;
    topUser: string;
    averageUtilization: number;
  }
}
```

#### GET /reports/users/summary
Resumen estadístico del reporte de usuarios.

#### GET /reports/users/history
Historial de reportes generados por el usuario actual.

**Autorización**: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`, `TEACHER`, `STUDENT`

**Query Parameters**:
- `reportType?: string` - Filtrar por tipo de reporte
- `limit?: number` - Límite de resultados (default: 20)

#### GET /reports/users/my-stats
Estadísticas personales del usuario actual.

**Autorización**: `TEACHER`, `STUDENT`, `ADMINISTRATIVE`, `ADMIN`, `PROGRAM_ADMIN`

**Response**:
```typescript
{
  totalReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  noShowReservations: number;
  utilizationRate: number;
  cancellationRate: number;
  totalHours: number;
  frequentResources: Array<{
    resourceName: string;
    count: number;
  }>;
}
```

### 3. Export Reports (RF-33)

#### POST /reports/export/csv
Exporta reportes en formato CSV con columnas personalizables.

**Autorización**: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`

**Request Body**:
```typescript
{
  reportType: 'usage' | 'user';
  format: 'csv';                   // Futuro soporte para Excel, PDF
  filename?: string;               // Nombre personalizado (sin extensión)
  columns?: string[];              // Columnas específicas a incluir
  filters: object;                 // Filtros del reporte (según reportType)
  includeHeaders?: boolean;        // Incluir encabezados (default: true)
  delimiter?: string;              // Delimitador CSV (default: ',')
  encoding?: string;               // Codificación (default: 'utf8')
  sendEmail?: boolean;             // Enviar por email (futuro)
  emailTo?: string[];              // Destinatarios email (futuro)
}
```

**Response**:
```typescript
{
  id: string;                      // ID único del export
  filename: string;                // Nombre final del archivo
  format: string;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  fileSize: number;                // Bytes
  recordCount: number;
  createdAt: string;
  expiresAt: string;               // 7 días por defecto
  downloadUrl: string;             // URL para descarga
  isAvailable: boolean;
}
```

#### GET /reports/export/download/{exportId}
Descarga archivo exportado previamente.

**Autorización**: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`, `TEACHER`, `STUDENT`

**Path Parameters**:
- `exportId`: ID del export a descargar

**Response**: Stream del archivo (application/octet-stream)

**Headers**:
- `Content-Type`: Tipo MIME del archivo
- `Content-Disposition`: attachment; filename="..."
- `Content-Length`: Tamaño del archivo

#### GET /reports/export/history
Historial de exportaciones del usuario actual.

**Query Parameters**:
- `limit?: number` - Límite de resultados
- `reportType?: string` - Filtrar por tipo de reporte

#### GET /reports/export/status/{exportId}
Estado actual de una operación de exportación.

**Response**:
```typescript
{
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  progress: number;                // 0-100
  message: string;
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
  isAvailable: boolean;
  downloadUrl?: string;
}
```

#### GET /reports/export/cached/{reportId}
Obtiene datos de reporte cacheado para re-exportación rápida.

**Autorización**: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`

## Códigos de Error

### 400 Bad Request
- Filtros inválidos o malformados
- Parámetros de paginación fuera de rango
- Formato de fecha inválido

### 401 Unauthorized
- Token JWT faltante o inválido
- Token expirado

### 403 Forbidden
- Permisos insuficientes para el endpoint
- Acceso denegado a datos de otros usuarios/programas

### 404 Not Found
- Reporte no encontrado
- Export no encontrado o expirado
- Recurso no existe

### 429 Too Many Requests
- Límite de rate limiting excedido
- Máximo de reportes concurrentes alcanzado

### 500 Internal Server Error
- Error de base de datos
- Error de sistema de archivos
- Error de cache Redis

## Límites y Restricciones

### Rate Limiting
- **Generación de reportes**: 10 por minuto por usuario
- **Exportaciones**: 5 por minuto por usuario
- **Descargas**: 20 por minuto por usuario

### Tamaños Máximos
- **Registros por reporte**: 10,000
- **Tamaño de export**: 50 MB
- **Tiempo de ejecución**: 30 segundos timeout

### Cache y Expiración
- **Cache Redis**: 30 minutos
- **Reportes persistentes**: 24 horas
- **Archivos exportados**: 7 días

## Auditoría y Logging

Todas las operaciones son auditadas con:
- **Generación de reportes**: Usuario, filtros, tiempo de ejecución, cache hit/miss
- **Exportaciones**: Usuario, tipo, tamaño, tiempo de procesamiento
- **Descargas**: Usuario, archivo, timestamp
- **Accesos no autorizados**: IP, User-Agent, razón del rechazo
- **Errores**: Stack trace, contexto, parámetros

## Ejemplos de Uso

### Generar reporte de uso mensual
```bash
curl -X GET "https://api.bookly.ufps.edu.co/reports/usage" \
  -H "Authorization: Bearer <token>" \
  -G \
  -d "programIds=ing-sistemas" \
  -d "startDate=2024-01-01" \
  -d "endDate=2024-01-31" \
  -d "groupBy=program,resourceType" \
  -d "includeDetails=true"
```

### Exportar reporte de usuarios a CSV
```bash
curl -X POST "https://api.bookly.ufps.edu.co/reports/export/csv" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "user",
    "filename": "profesores-enero-2024",
    "columns": ["userName", "totalReservations", "utilizationRate"],
    "filters": {
      "userTypes": ["TEACHER"],
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  }'
```

### Descargar archivo exportado
```bash
curl -X GET "https://api.bookly.ufps.edu.co/reports/export/download/export-123" \
  -H "Authorization: Bearer <token>" \
  -o "reporte.csv"
```

## Monitoreo y Métricas

### Métricas Disponibles
- Tiempo promedio de generación de reportes
- Tasa de cache hit/miss
- Número de exportaciones por día/semana
- Errores por tipo y frecuencia
- Usuarios más activos en reportes

### Alertas Configuradas
- Tiempo de respuesta > 2 segundos
- Tasa de errores > 5%
- Uso de disco para exports > 80%
- Cache Redis no disponible

## Versionado

- **Versión actual**: v1.0
- **Compatibilidad**: Backward compatible
- **Deprecación**: Notificación 3 meses antes
- **Breaking changes**: Solo en versiones mayores
