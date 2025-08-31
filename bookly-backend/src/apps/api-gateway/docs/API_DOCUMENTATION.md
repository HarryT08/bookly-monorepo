# API Gateway - Documentación de API

**Versión**: 1.0.0  
**Fecha de Actualización**: 2025-08-31  
**Base URL**: `http://localhost:3000`  
**Puerto del Servicio**: 3000

---

## 📋 Descripción General

El **API Gateway** es el punto de entrada unificado para todo el ecosistema Bookly. Actúa como proxy inteligente que enruta todas las solicitudes hacia los microservicios correspondientes, proporcionando funcionalidades transversales como autenticación, autorización, rate limiting, circuit breaking, observabilidad y agregación de respuestas.

### 🏗️ Arquitectura y Stack

- **Arquitectura**: Gateway Pattern con middleware centralizado
- **Framework**: NestJS con Express
- **Patrón de Diseño**: Clean Architecture + Middleware Pipeline
- **Observabilidad**: Winston + OpenTelemetry + Sentry
- **Cache**: Redis para rate limiting y respuestas
- **Documentación**: Swagger/OpenAPI centralizado

---

## 📑 Índice (Tabla de Contenidos)

- [Información General](#información-general)
- [Autenticación y Seguridad](#autenticación-y-seguridad)
- [Endpoints - Proxy Universal](#endpoints---proxy-universal)
- [Endpoints - Gestión del Gateway](#endpoints---gestión-del-gateway)
- [Endpoints - Monitoreo y Métricas](#endpoints---monitoreo-y-métricas)
- [Endpoints - Circuit Breaker](#endpoints---circuit-breaker)
- [Endpoints - Rate Limiting](#endpoints---rate-limiting)
- [Manejo de Errores](#manejo-de-errores)
- [Variables de Entorno para Postman](#variables-de-entorno-para-postman)
- [Restricciones del Gateway](#restricciones-del-gateway)
- [Notas de Seguridad y Observabilidad](#notas-de-seguridad-y-observabilidad)

---

## 🎯 Información General

### Características Principales

**Requerimientos Funcionales Soportados:**

- **RF-46**: Enrutamiento y proxy de solicitudes hacia microservicios
- **RF-47**: Balanceador de carga con alta disponibilidad
- **RF-48**: Circuit breaker y manejo de fallos
- **RF-49**: Rate limiting y throttling granular
- **RF-50**: Autenticación y autorización centralizada
- **RF-51**: Agregación de respuestas de múltiples servicios
- **RF-52**: Documentación API centralizada (Swagger)
- **RF-53**: Transformación de protocolos y formatos

### Base URL

```http
http://localhost:3000
```

### Arquitectura

- **Clean Architecture**: Separación entre infraestructura, aplicación y dominio
- **Middleware Pipeline**: Procesamiento secuencial de requests
- **Gateway Pattern**: Punto de entrada único con enrutamiento inteligente
- **Swagger Integration**: Documentación automática centralizada
- **Observabilidad**: Logging estructurado, tracing distribuido, métricas

---

## 🔐 Autenticación y Seguridad

### Autenticación JWT

**Formato de Header:**

```http
Authorization: Bearer <jwt_token>
```

**Formato de Token JWT (Payload):**

```json
{
  "sub": "user_id_123",
  "email": "usuario@ufps.edu.co",
  "roles": ["ESTUDIANTE", "DOCENTE"],
  "permissions": [
    "RESOURCE_VIEW",
    "RESERVATION_CREATE",
    "RESERVATION_VIEW_OWN"
  ],
  "programId": "ING-SIS",
  "isActive": true,
  "iat": 1692123456,
  "exp": 1692209856
}
```

### Roles y Permisos

| Rol | Descripción | Permisos Típicos |
|-----|-------------|------------------|
| `ESTUDIANTE` | Estudiante universitario | `RESOURCE_VIEW`, `RESERVATION_CREATE`, `RESERVATION_VIEW_OWN` |
| `DOCENTE` | Profesor universitario | `RESOURCE_VIEW`, `RESERVATION_CREATE`, `RESERVATION_MANAGE_PROGRAM` |
| `ADMIN_PROGRAMA` | Administrador de programa | `RESOURCE_MANAGE_PROGRAM`, `APPROVAL_MANAGE`, `USER_MANAGE_PROGRAM` |
| `ADMIN_GENERAL` | Administrador general | `RESOURCE_MANAGE_ALL`, `USER_MANAGE_ALL`, `SYSTEM_CONFIG` |
| `VIGILANTE` | Personal de vigilancia | `RESERVATION_VIEW_ALL`, `ACCESS_CONTROL` |

### Rate Limiting

| Tipo de Usuario | Límite Global | Límite por Endpoint | Ventana de Tiempo |
|----------------|---------------|-------------------|------------------|
| `ESTUDIANTE` | 100 req/min | 30 req/min | 60 segundos |
| `DOCENTE` | 200 req/min | 60 req/min | 60 segundos |
| `ADMIN_PROGRAMA` | 500 req/min | 150 req/min | 60 segundos |
| `ADMIN_GENERAL` | 1000 req/min | 300 req/min | 60 segundos |
| `No autenticado` | 20 req/min | 10 req/min | 60 segundos |

### Auditoría y Logging

**Eventos Auditados:**

- Todas las requests de autenticación (login, logout, token refresh)
- Violaciones de rate limiting (IP, usuario, endpoint)
- Errores de circuit breaker (estado, servicios afectados)
- Cambios en configuración del gateway
- Accesos a endpoints de gestión administrativa

---

## 🌐 Endpoints - Proxy Universal

### Universal Proxy Endpoint

#### `ALL /*` - Proxy Universal

- **Descripción**: Endpoint universal que proxea todas las solicitudes hacia los microservicios correspondientes
- **Security Restrictions**:
  - JWT: Opcional (depende del endpoint de destino)
  - Roles: Según endpoint de destino
  - Rate Limit: Según configuración por usuario
  - Auditoría: Todas las requests son loggeadas

**Rutas Ejemplo Soportadas:**

```http
GET    /auth/profile           → auth-service
POST   /auth/login             → auth-service
GET    /resources              → resources-service
POST   /reservations           → availability-service
GET    /reports/usage          → reports-service
POST   /approval-flows         → stockpile-service
```

**Response Success:**

```json
{
  "data": "Response from target microservice",
  "headers": {},
  "statusCode": 200
}
```

**Response Error:**

```json
{
  "code": "GATEWAY_ERROR",
  "message": "Service unavailable",
  "type": "error",
  "statusCode": 502,
  "timestamp": "2025-08-24T19:35:31.000Z",
  "traceId": "trace_xyz789"
}
```

---

## ⚙️ Endpoints - Gestión del Gateway

### Health Check

#### `GET /_gateway/health` - Estado del Gateway

- **Descripción**: Verificar el estado de salud del gateway y todos sus servicios
- **Security Restrictions**:
  - JWT: No requerido
  - Roles: Público
  - Rate Limit: 60 req/min
  - Auditoría: No auditado

**Response Success (200):**

```json
{
  "status": "healthy",
  "timestamp": "2025-08-24T19:35:31.000Z",
  "version": "1.0.0",
  "services": {
    "routing": "operational",
    "loadBalancer": "operational",
    "circuitBreaker": "operational",
    "rateLimit": "operational",
    "observability": "operational",
    "aggregation": "operational",
    "protocolTranslation": "operational"
  }
}
```

### Configuración de Rutas

#### `GET /_gateway/routes` - Obtener Rutas Configuradas

- **Descripción**: Listar todas las rutas configuradas en el gateway
- **Security Restrictions**:
  - JWT: Requerido
  - Roles: `ADMIN_GENERAL`, `ADMIN_PROGRAMA`
  - Rate Limit: 30 req/min
  - Auditoría: Acceso registrado

**Response Success (200):**

```json
{
  "total": 15,
  "routes": [
    {
      "method": "GET",
      "path": "/auth/profile",
      "service": "auth-service",
      "auth": true,
      "cache": false,
      "rateLimit": true,
      "timeout": 5000,
      "retries": 3
    }
  ]
}
```

---

## 📊 Endpoints - Monitoreo y Métricas

### Estado de Servicios

#### `GET /_gateway/services` - Estado de Microservicios

- **Descripción**: Obtener el estado de todos los microservicios registrados
- **Security Restrictions**:
  - JWT: Requerido
  - Roles: `ADMIN_GENERAL`, `ADMIN_PROGRAMA`
  - Rate Limit: 20 req/min
  - Auditoría: Acceso registrado

**Response Success (200):**

```json
{
  "auth-service": {
    "instances": [
      {
        "id": "auth-001",
        "url": "http://auth-service:3001",
        "healthy": true,
        "weight": 1,
        "activeConnections": 5,
        "responseTime": 45,
        "lastHealthCheck": "2025-08-24T19:35:31.000Z"
      }
    ],
    "circuitBreaker": {
      "state": "CLOSED",
      "failureCount": 0,
      "successCount": 150,
      "failureRate": 0,
      "nextAttemptTime": null
    },
    "healthyInstances": 1,
    "totalInstances": 1,
    "availability": 99.9
  }
}
```

### Métricas del Gateway

#### `GET /_gateway/metrics` - Métricas Generales

- **Descripción**: Obtener métricas de performance y uso del gateway
- **Security Restrictions**:
  - JWT: Requerido
  - Roles: `ADMIN_GENERAL`, `ADMIN_PROGRAMA`
  - Rate Limit: 10 req/min
  - Auditoría: Acceso registrado

**Response Success (200):**

```json
{
  "requests": {
    "total": 15420,
    "perSecond": 25.3,
    "perMinute": 1518,
    "perHour": 91080
  },
  "responses": {
    "2xx": 14890,
    "4xx": 430,
    "5xx": 100
  },
  "latency": {
    "p50": 12,
    "p95": 45,
    "p99": 89,
    "average": 18.5
  }
}
```

---

## ⚡ Endpoints - Circuit Breaker

### Reset Circuit Breaker

#### `POST /_gateway/circuit-breaker/{service}/reset` - Reset Circuit Breaker

- **Descripción**: Resetear el circuit breaker de un servicio específico
- **Security Restrictions**:
  - JWT: Requerido
  - Roles: `ADMIN_GENERAL`
  - Rate Limit: 5 req/min
  - Auditoría: Acción crítica registrada
- **Path Params**:
  - `service` (string, required): Nombre del servicio

**Response Success (200):**

```json
{
  "success": true,
  "message": "Circuit breaker reset for service: auth-service",
  "timestamp": "2025-08-24T19:35:31.000Z"
}
```

### Force Circuit Breaker Open

#### `POST /_gateway/circuit-breaker/{service}/force-open` - Forzar Apertura

- **Descripción**: Forzar la apertura del circuit breaker para un servicio
- **Security Restrictions**:
  - JWT: Requerido
  - Roles: `ADMIN_GENERAL`
  - Rate Limit: 3 req/min
  - Auditoría: Acción crítica registrada

---

## 🚦 Endpoints - Rate Limiting

### Estadísticas de Rate Limiting

#### `GET /_gateway/rate-limits` - Estadísticas de Rate Limiting

- **Descripción**: Obtener estadísticas y configuración de rate limiting
- **Security Restrictions**:
  - JWT: Requerido
  - Roles: `ADMIN_GENERAL`, `ADMIN_PROGRAMA`
  - Rate Limit: 20 req/min
  - Auditoría: Acceso registrado

**Response Success (200):**

```json
{
  "stats": {
    "user:123": {
      "requests": 45,
      "limit": 100,
      "remaining": 55,
      "resetTime": "2025-08-24T19:36:00.000Z"
    }
  },
  "configs": {
    "/auth/login": {
      "limit": 10,
      "windowMs": 900000,
      "message": "Too many login attempts"
    }
  },
  "activeKeys": 2
}
```

---

## ❌ Manejo de Errores

### Códigos de Estado HTTP

| Código | Descripción | Contexto Gateway |
|--------|-------------|------------------|
| `200` | OK | Operación exitosa |
| `401` | Unauthorized | Token JWT inválido o expirado |
| `403` | Forbidden | Permisos insuficientes |
| `404` | Not Found | Servicio o ruta no encontrada |
| `429` | Too Many Requests | Rate limit excedido |
| `502` | Bad Gateway | Servicio de destino no disponible |
| `503` | Service Unavailable | Circuit breaker abierto |
| `504` | Gateway Timeout | Timeout en comunicación con servicio |

### Formato de Errores

```json
{
  "code": "GATEWAY_ERROR_CODE",
  "message": "Descripción legible del error",
  "type": "error",
  "statusCode": 500,
  "timestamp": "2025-08-24T19:35:31.000Z",
  "traceId": "trace_xyz789",
  "details": [
    {
      "field": "service",
      "message": "Service auth-service is currently unavailable",
      "code": "SERVICE_UNAVAILABLE"
    }
  ]
}
```

---

## 🧪 Variables de Entorno para Postman

### Variables Base

```json
{
  "baseUrl": "http://localhost:3000",
  "authToken": "{{bearerToken}}",
  "contentType": "application/json"
}
```

### Variables de Testing

```json
{
  "testService": "auth-service",
  "testInstanceId": "test-instance-001",
  "testRateLimitKey": "user:test_123"
}
```

### Scripts de Pre-request

```javascript
// Auto-login Script
if (!pm.environment.get("bearerToken")) {
    pm.sendRequest({
        url: pm.environment.get("baseUrl") + "/auth/login",
        method: 'POST',
        header: {'Content-Type': 'application/json'},
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: "admin@ufps.edu.co",
                password: "123456"
            })
        }
    }, function (err, response) {
        if (!err && response.json().access_token) {
            pm.environment.set("bearerToken", response.json().access_token);
        }
    });
}
```

### Tests Automatizados

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});
```

---

## 🚧 Restricciones del Gateway

### Reglas de Enrutamiento

1. **Rutas Reservadas**: Todas las rutas que comienzan con `/_gateway/` están reservadas para gestión interna
2. **Timeout por Defecto**: 30 segundos para requests hacia microservicios  
3. **Límite de Payload**: Máximo 10MB por request
4. **Conexiones Concurrentes**: Máximo 1000 conexiones simultáneas por instancia

### Limitaciones de Agregación

1. **Máximo 5 servicios** por agregación simultánea
2. **Timeout de agregación**: 15 segundos máximo
3. **Fallback obligatorio** para servicios críticos en agregaciones

---

## 🔒 Notas de Seguridad y Observabilidad

### Eventos Auditados

**Nivel Crítico:**

- Cambios en configuración del gateway
- Reset de circuit breakers
- Modificación de instancias de servicios

**Nivel Información:**

- Requests de autenticación exitosas
- Activación/desactivación de circuit breakers
- Violations de rate limiting

**Nivel Advertencia:**

- Intentos de acceso no autorizados
- Timeouts de servicios
- Errores de conectividad

### Integración con Observabilidad

- **Winston**: Logging estructurado con contexto completo
- **OpenTelemetry**: Tracing distribuido con spans detallados
- **Sentry**: Captura de errores críticos y alertas automáticas
- **Prometheus**: Métricas de performance y disponibilidad

---

## 📋 Notas Específicas por Área Funcional

### Enrutamiento y Proxy

- Soporte para headers personalizados
- Preservación de contexto de usuario
- Transformación automática de errores

### Circuit Breaker

- Estados: CLOSED, OPEN, HALF_OPEN
- Configuración por servicio
- Fallback responses automáticas

### Rate Limiting General

- Límites por usuario, IP, y endpoint
- Storage distribuido con Redis
- Configuración granular por rol

### Observabilidad

- Métricas en tiempo real
- Alertas automáticas
- Dashboard de monitoreo

---

**Validado por**: Sistema de QA Automatizado  
**Fecha**: 2025-08-24  
**Próxima revisión**: 2025-09-24
