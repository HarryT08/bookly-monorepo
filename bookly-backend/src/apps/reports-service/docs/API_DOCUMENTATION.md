# Reports Service API Documentation

## Índice

- [Reports Service API Documentation](#reports-service-api-documentation)
  - [Índice](#índice)
  - [Información General](#información-general)
    - [Características Principales](#características-principales)
    - [Base URL](#base-url)
    - [Arquitectura](#arquitectura)
  - [Autenticación y Seguridad](#autenticación-y-seguridad)
    - [Autenticación JWT](#autenticación-jwt)
    - [Roles y Permisos](#roles-y-permisos)
      - [ADMIN](#admin)
      - [PROGRAM\_ADMIN](#program_admin)
      - [ADMINISTRATIVE](#administrative)
      - [TEACHER/STUDENT](#teacherstudent)
    - [Rate Limiting](#rate-limiting)
    - [Auditoría y Logging](#auditoría-y-logging)
    - [Formato de Token JWT](#formato-de-token-jwt)
  - [Reportes de Uso (RF-31)](#reportes-de-uso-rf-31)
    - [Generar Reporte de Uso](#generar-reporte-de-uso)
    - [Obtener Resumen de Uso](#obtener-resumen-de-uso)
    - [Opciones de Filtros](#opciones-de-filtros)
  - [Reportes de Usuario (RF-32)](#reportes-de-usuario-rf-32)
    - [Generar Reporte de Usuario](#generar-reporte-de-usuario)
    - [Resumen de Reporte de Usuario](#resumen-de-reporte-de-usuario)
    - [Historial de Reportes](#historial-de-reportes)
    - [Mis Estadísticas](#mis-estadísticas)
  - [Exportación de Reportes (RF-33)](#exportación-de-reportes-rf-33)
    - [Exportar a CSV](#exportar-a-csv)
    - [Descargar Archivo Exportado](#descargar-archivo-exportado)
    - [Historial de Exportaciones](#historial-de-exportaciones)
  - [Reportes Básicos y Dashboard](#reportes-básicos-y-dashboard)
    - [Dashboard General](#dashboard-general)
    - [Reporte de Demanda](#reporte-de-demanda)
    - [Feedback de Usuarios](#feedback-de-usuarios)
  - [Manejo de Errores](#manejo-de-errores)
    - [Códigos de Estado HTTP](#códigos-de-estado-http)
    - [Formato de Errores](#formato-de-errores)
  - [Restricciones de Dominio](#restricciones-de-dominio)
    - [Restricciones de Reportes](#restricciones-de-reportes)
    - [Restricciones de Exportación](#restricciones-de-exportación)
    - [Restricciones de Acceso](#restricciones-de-acceso)
  - [Seguridad y Observabilidad](#seguridad-y-observabilidad)
    - [Eventos Auditados](#eventos-auditados)
    - [Integración Winston](#integración-winston)
    - [Integración OpenTelemetry](#integración-opentelemetry)
    - [Integración Sentry](#integración-sentry)
  - [Variables de Entorno para Postman](#variables-de-entorno-para-postman)
    - [Variables Base](#variables-base)
    - [Scripts Pre-request](#scripts-pre-request)
    - [Tests Automáticos](#tests-automáticos)

---

## Información General

El **Reports Service** es el microservicio encargado de generar reportes, análisis estadísticos, dashboards interactivos y gestionar el feedback de usuarios en el sistema Bookly UFPS.

### Características Principales

- **RF-31**: Reporte de uso por recurso/programa/período
- **RF-32**: Reporte por usuario/profesor con métricas detalladas
- **RF-33**: Exportación en múltiples formatos (CSV, Excel, PDF)
- **RF-34**: Registro y gestión de feedback de usuarios
- **RF-35**: Evaluación de usuarios por el staff administrativo
- **RF-36**: Dashboards interactivos en tiempo real
- **RF-37**: Análisis de demanda insatisfecha y optimización de recursos

### Base URL

```
http://localhost:3005/api/v1
```

**Puerto del servicio**: 3005  
**Documentación Swagger**: http://localhost:3005/api/docs

### Arquitectura

El Reports Service implementa:

- **Clean Architecture**: Separación clara entre domain, application e infrastructure
- **CQRS**: Queries especializados para reportes
- **Event-Driven Architecture**: Integración con otros servicios mediante eventos
- **Swagger Documentation**: Documentación automática de APIs
- **Observabilidad**: Winston logging, OpenTelemetry tracing, Sentry error tracking

---

## Autenticación y Seguridad

### Autenticación JWT

Todos los endpoints requieren autenticación mediante JWT Bearer token:

```http
Authorization: Bearer <jwt_token>
```

### Roles y Permisos

#### ADMIN
- Acceso completo a todos los reportes
- Puede generar reportes de cualquier programa
- Acceso a datos sensibles de auditoría

#### PROGRAM_ADMIN  
- Reportes limitados a su programa académico
- Estadísticas de su programa
- Exportación limitada a datos de su programa

#### ADMINISTRATIVE
- Reportes operativos
- Estadísticas generales
- Sin acceso a datos personales detallados

#### TEACHER/STUDENT
- Solo sus propias estadísticas
- Reportes de sus reservas
- Historial personal limitado

### Rate Limiting

- **Reportes básicos**: 30 requests/minuto
- **Exportación**: 5 exports/minuto  
- **Dashboard**: 60 requests/minuto
- **Estadísticas personales**: 20 requests/minuto

### Auditoría y Logging

Se audita:
- Generación de reportes (qué, cuándo, quién)
- Exportaciones realizadas 
- Acceso a datos sensibles
- Errores de autorización

### Formato de Token JWT

```json
{
  "sub": "user123",
  "email": "user@ufps.edu.co",
  "roles": ["ADMIN", "PROGRAM_ADMIN"],
  "program": "programa-ingenieria-sistemas", 
  "permissions": ["reports:read", "reports:export", "dashboard:view"]
}
```

---

## Reportes de Uso (RF-31)

### Generar Reporte de Uso

**GET** `/reports/usage`

Genera reportes detallados de utilización de recursos filtrados por programa, período y tipo de recurso.

**Security Restrictions**: JWT + Roles: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`  
**Rate Limit**: 30 requests/minuto  
**Auditoría**: Se registra la generación con filtros aplicados

**Query Parameters**:
```json
{
  "programId": "string (optional)",
  "resourceType": "string (optional) - LABORATORY|CLASSROOM|AUDITORIUM", 
  "categoryIds": "string[] (optional)",
  "startDate": "string (ISO date)",
  "endDate": "string (ISO date)",
  "includeDetails": "boolean (default: false)",
  "groupBy": "string (optional) - resource|program|category|date",
  "page": "number (default: 1)",
  "limit": "number (default: 20, max: 100)"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "resourceId": "resource-123",
      "resourceName": "Laboratorio de Sistemas 1",
      "resourceType": "LABORATORY",
      "programName": "Ingeniería de Sistemas",
      "categoryName": "Laboratorio Especializado",
      "totalReservations": 45,
      "completedReservations": 42,
      "cancelledReservations": 3,
      "utilizationRate": 93.33,
      "totalHours": 180,
      "averageUsagePerDay": 4.5,
      "peakUsageHours": ["08:00-10:00", "14:00-16:00"],
      "mostActiveUser": "profesor.sistemas@ufps.edu.co"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### Obtener Resumen de Uso

**GET** `/reports/usage/summary`

Estadísticas resumidas del reporte de uso con métricas clave.

**Security Restrictions**: JWT + Roles: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`  
**Rate Limit**: 40 requests/minuto

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "totalResources": 15,
    "totalReservations": 450,
    "averageUtilization": 75.5,
    "mostUsedResource": "Aula Magna",
    "leastUsedResource": "Laboratorio 3"
  }
}
```

### Opciones de Filtros

**GET** `/reports/usage/filter-options/{filterType}`

Obtiene opciones disponibles para filtros de reportes.

**Security Restrictions**: JWT + Roles: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`, `TEACHER`, `STUDENT`  
**Rate Limit**: 60 requests/minuto

**Path Parameters**:
- `filterType`: `programs` | `resourceTypes` | `categories` | `users`

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "programa-sistemas",
      "name": "Ingeniería de Sistemas",
      "code": "SIS",
      "count": 125
    }
  ]
}
```

---

## Reportes de Usuario (RF-32)

### Generar Reporte de Usuario

**GET** `/reports/users`

Genera reportes sobre reservas realizadas por usuarios específicos o profesores.

**Security Restrictions**: JWT + Roles: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`  
**Rate Limit**: 25 requests/minuto  
**Auditoría**: Se registra acceso a datos personales

**Query Parameters**:
```json
{
  "userIds": "string[] (optional)",
  "userTypes": "string[] (optional) - TEACHER|STUDENT|ADMINISTRATIVE",
  "programIds": "string[] (optional)",
  "startDate": "string (ISO date)", 
  "endDate": "string (ISO date)",
  "includeDetails": "boolean (default: false)",
  "page": "number (default: 1)",
  "limit": "number (default: 20, max: 50)"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "userId": "user-123",
      "userName": "Dr. Juan Pérez",
      "userEmail": "juan.perez@ufps.edu.co", 
      "userType": "TEACHER",
      "program": "Ingeniería de Sistemas",
      "totalReservations": 28,
      "confirmedReservations": 25,
      "cancelledReservations": 3,
      "utilizationRate": 89.3,
      "totalHours": 84,
      "frequentResources": [
        {
          "resourceName": "Lab Sistemas 1",
          "count": 12
        }
      ]
    }
  ]
}
```

### Resumen de Reporte de Usuario

**GET** `/reports/users/summary`

**Security Restrictions**: JWT + Roles: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`  
**Rate Limit**: 30 requests/minuto

### Historial de Reportes  

**GET** `/reports/users/history`

**Security Restrictions**: JWT + Roles: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`, `TEACHER`, `STUDENT`  
**Rate Limit**: 20 requests/minuto

### Mis Estadísticas

**GET** `/reports/users/my-stats`

Estadísticas de reservas del usuario actual.

**Security Restrictions**: JWT + cualquier rol  
**Rate Limit**: 30 requests/minuto

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "totalReservations": 12,
    "confirmedReservations": 11,
    "cancelledReservations": 1,
    "utilizationRate": 91.7,
    "totalHours": 36,
    "frequentResources": [
      {
        "resourceName": "Aula 201",
        "count": 8
      }
    ]
  }
}
```

---

## Exportación de Reportes (RF-33)

### Exportar a CSV

**POST** `/reports/export/csv`

Exporta reportes a formato CSV con opciones personalizables.

**Security Restrictions**: JWT + Roles: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`  
**Rate Limit**: 5 exports/minuto  
**Auditoría**: Se registra cada exportación

**Request Body**:
```json
{
  "reportType": "USAGE_REPORT | USER_REPORT",
  "format": "CSV",
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "programIds": ["programa-sistemas"]
  },
  "columns": [
    "resourceName",
    "totalReservations", 
    "utilizationRate"
  ],
  "filename": "reporte_uso_enero_2024.csv"
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "data": {
    "exportId": "exp_1642678900123",
    "filename": "reporte_uso_enero_2024.csv",
    "status": "PROCESSING",
    "downloadUrl": "/reports/export/download/exp_1642678900123"
  }
}
```

### Descargar Archivo Exportado

**GET** `/reports/export/download/{exportId}`

**Security Restrictions**: JWT + acceso al export original  
**Rate Limit**: 10 downloads/minuto

### Historial de Exportaciones

**GET** `/reports/export/history`

**Security Restrictions**: JWT + cualquier rol  
**Rate Limit**: 20 requests/minuto

---

## Reportes Básicos y Dashboard

### Dashboard General

**GET** `/reports/dashboard`

Datos para dashboard principal con métricas en tiempo real.

**Security Restrictions**: JWT + cualquier rol  
**Rate Limit**: 60 requests/minuto

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "totalReservationsToday": 45,
    "activeReservationsNow": 12,
    "utilizationRateToday": 78.5,
    "topResourcesToday": [
      {
        "name": "Aula Magna",
        "reservations": 8
      }
    ]
  }
}
```

### Reporte de Demanda

**GET** `/reports/demand`

Análisis de demanda insatisfecha y oportunidades de optimización.

**Security Restrictions**: JWT + Roles: `ADMIN`, `PROGRAM_ADMIN`, `ADMINISTRATIVE`  
**Rate Limit**: 20 requests/minuto

### Feedback de Usuarios

**GET** `/reports/feedback`

Obtiene feedback de usuarios.

**POST** `/reports/feedback`

Crea nuevo feedback.

**Request Body**:
```json
{
  "resourceId": "resource-123",
  "reservationId": "reservation-456", 
  "rating": 4,
  "comment": "Excelente laboratorio"
}
```

---

## Manejo de Errores

### Códigos de Estado HTTP

| Código | Descripción | Uso |
|--------|-------------|-----|
| 200 | OK | Reporte generado exitosamente |
| 201 | Created | Export iniciado exitosamente |
| 400 | Bad Request | Filtros inválidos |
| 401 | Unauthorized | Token JWT faltante |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Export no encontrado |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error interno |

### Formato de Errores

```json
{
  "success": false,
  "error": {
    "code": "RPT-XXXX",
    "message": "Descripción del error",
    "type": "validation_error",
    "details": [],
    "timestamp": "2024-01-20T14:30:00Z"
  }
}
```

---

## Restricciones de Dominio

### Restricciones de Reportes
- **Período máximo**: 1 año por consulta
- **Registros por página**: Máximo 100
- **Tiempo de ejecución**: Máximo 30 segundos
- **Acceso a datos**: Filtrado por programa académico según rol

### Restricciones de Exportación
- **Tamaño máximo**: 50MB por export
- **Tiempo de vida**: 7 días
- **Formatos soportados**: CSV, Excel, PDF
- **Exports simultáneos**: Máximo 3 por usuario

### Restricciones de Acceso
- **PROGRAM_ADMIN**: Solo datos de su programa
- **STUDENT/TEACHER**: Solo datos propios
- **Datos sensibles**: Solo ADMIN tiene acceso completo

---

## Seguridad y Observabilidad

### Eventos Auditados
- Generación de reportes con filtros
- Exportaciones realizadas
- Acceso a datos personales
- Errores de autorización

### Integración Winston
- Logs estructurados en JSON
- Níveis: ERROR, WARN, INFO, DEBUG
- Contexto completo de requests

### Integración OpenTelemetry
- Trazas de generación de reportes
- Métricas de rendimiento
- Spans por operación

### Integración Sentry
- Captura de errores críticos
- Alertas automáticas
- Context de usuario y request

---

## Variables de Entorno para Postman

### Variables Base

```json
{
  "reports_base_url": "http://localhost:3005/api/v1",
  "auth_token": "",
  "user_id": "",
  "export_id": "",
  "report_id": ""
}
```

### Scripts Pre-request

```javascript
// Auto-login si no hay token válido
if (!pm.environment.get("auth_token")) {
    const loginRequest = {
        url: "http://localhost:3000/api/v1/auth/login",
        method: 'POST',
        header: {'Content-Type': 'application/json'},
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
        }
    });
}
```

### Tests Automáticos

```javascript
pm.test("Status code es 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Respuesta tiene estructura correcta", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("success", true);
    pm.expect(jsonData).to.have.property("data");
});
```
