# Resources Service API Documentation

## Índice

- [Resources Service API Documentation](#resources-service-api-documentation)
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
  - [Gestión de Recursos](#gestión-de-recursos)
    - [GET /resources](#get-resources)
    - [GET /resources/paginated](#get-resourcespaginated)
    - [GET /resources/search](#get-resourcessearch)
    - [GET /resources/:id](#get-resourcesid)
    - [GET /resources/code/:code](#get-resourcescodecode)
    - [GET /resources/:id/availability](#get-resourcesidavailability)
    - [POST /resources](#post-resources)
    - [PUT /resources/:id](#put-resourcesid)
    - [DELETE /resources/:id](#delete-resourcesid)
  - [🏷️ Gestión de Categorías de Recursos](#️-gestión-de-categorías-de-recursos)
    - [POST /resource-categories/:resourceId/categories/:categoryId](#post-resource-categoriesresourceidcategoriescategoryid)
    - [POST /resource-categories/:resourceId/categories](#post-resource-categoriesresourceidcategories)
    - [PUT /resource-categories/:resourceId/categories](#put-resource-categoriesresourceidcategories)
    - [GET /resource-categories/:resourceId/categories](#get-resource-categoriesresourceidcategories)
    - [GET /resource-categories/categories/:categoryId/resources](#get-resource-categoriescategoriescategoryidresources)
    - [DELETE /resource-categories/:resourceId/categories/:categoryId](#delete-resource-categoriesresourceidcategoriescategoryid)
  - [📥 Importación Masiva de Recursos](#-importación-masiva-de-recursos)
    - [POST /resource-import/preview](#post-resource-importpreview)
    - [POST /resource-import/start](#post-resource-importstart)
    - [GET /resource-import/:id](#get-resource-importid)
    - [GET /resource-import/user/my-imports](#get-resource-importusermy-imports)
    - [GET /resource-import](#get-resource-import)
    - [GET /resource-import/statistics/overview](#get-resource-importstatisticsoverview)
  - [🔧 Tipos de Mantenimiento](#-tipos-de-mantenimiento)
    - [GET /maintenance-types](#get-maintenance-types)
    - [POST /maintenance-types](#post-maintenance-types)
    - [GET /maintenance-types/defaults](#get-maintenance-typesdefaults)
    - [GET /maintenance-types/:id](#get-maintenance-typesid)
    - [PUT /maintenance-types/:id](#put-maintenance-typesid)
    - [DELETE /maintenance-types/:id](#delete-maintenance-typesid)
  - [🎓 Gestión de Programas Académicos](#-gestión-de-programas-académicos)
    - [GET /programs](#get-programs)
    - [POST /programs](#post-programs)
    - [GET /programs/active](#get-programsactive)
  - [👤 Gestión de Responsables de Recursos](#-gestión-de-responsables-de-recursos)
    - [GET /resource-responsibles/:resourceId](#get-resource-responsiblesresourceid)
    - [POST /resource-responsibles/:resourceId/assign](#post-resource-responsiblesresourceidassign)
  - [Manejo de Errores](#manejo-de-errores)
    - [Códigos de Estado HTTP](#códigos-de-estado-http)
    - [Formato de Respuesta de Error](#formato-de-respuesta-de-error)
    - [Códigos de Error Específicos](#códigos-de-error-específicos)
      - [Gestión de Recursos (RSRC)](#gestión-de-recursos-rsrc)
      - [Importación Masiva (IMPT)](#importación-masiva-impt)
      - [Mantenimiento (MNTC)](#mantenimiento-mntc)
  - [Restricciones de Dominio](#restricciones-de-dominio)
    - [Reglas de Negocio Aplicadas](#reglas-de-negocio-aplicadas)
      - [Recursos](#recursos)
      - [Categorías](#categorías)
      - [Importación](#importación)
      - [Mantenimiento](#mantenimiento)
  - [Seguridad y Observabilidad](#seguridad-y-observabilidad)
    - [Logging y Auditoría](#logging-y-auditoría)
      - [INFO Level](#info-level)
      - [WARN Level](#warn-level)
      - [ERROR Level](#error-level)
    - [Métricas y Observabilidad](#métricas-y-observabilidad)
      - [OpenTelemetry Traces](#opentelemetry-traces)
      - [Sentry Error Tracking](#sentry-error-tracking)
    - [Rate Limiting Detallado](#rate-limiting-detallado)
  - [Variables de Entorno para Postman](#variables-de-entorno-para-postman)
    - [Configuración Base](#configuración-base)
    - [Variables de Testing](#variables-de-testing)
    - [Variables por Área Funcional](#variables-por-área-funcional)
      - [Recursos](#recursos-1)
      - [Importación](#importación-1)
    - [Pre-request Scripts](#pre-request-scripts)
      - [Autenticación Automática](#autenticación-automática)
      - [Generación de Datos de Prueba](#generación-de-datos-de-prueba)
    - [Tests Automáticos](#tests-automáticos)
      - [Test Base para Respuestas Exitosas](#test-base-para-respuestas-exitosas)
      - [Test para Errores](#test-para-errores)
      - [Test para Operaciones CRUD](#test-para-operaciones-crud)

---

## Información General

El **Resources Service** es el microservicio encargado de gestionar todos los recursos físicos del sistema Bookly UFPS, incluyendo aulas, laboratorios, auditorios, equipos multimedia y demás espacios institucionales. Maneja su creación, categorización, importación masiva, mantenimiento y configuración de disponibilidad.

### Características Principales

- **RF-01**: Crear, editar y eliminar recursos físicos
- **RF-02**: Asociar recursos a categorías y programas académicos
- **RF-03**: Definir atributos clave del recurso (capacidad, equipamiento, características)
- **RF-04**: Importación masiva de recursos desde archivos CSV
- **RF-05**: Configuración de reglas de disponibilidad por recurso
- **RF-06**: Gestión completa de mantenimiento de recursos

### Base URL

```
http://localhost:3003
```

### Arquitectura

El Resources Service implementa:

- **Clean Architecture**: Separación clara entre dominio, aplicación e infraestructura
- **CQRS**: Commands para modificaciones, Queries para consultas
- **Event-Driven Architecture**: Eventos distribuidos vía RabbitMQ para sincronización
- **Swagger**: Documentación automática de APIs REST
- **Observabilidad**: Integración con Winston, OpenTelemetry y Sentry

---

## Autenticación y Seguridad

### Autenticación JWT

Todos los endpoints protegidos requieren un token JWT válido en el header:

```http
Authorization: Bearer <jwt_token>
```

### Roles y Permisos

- **Administrador General**: Acceso completo a todos los recursos del sistema
- **Administrador de Programa**: Gestión de recursos asignados a su programa
- **Coordinador**: Gestión de recursos bajo su responsabilidad
- **Docente**: Consulta de recursos y reportes de mantenimiento
- **Estudiante**: Solo consulta de información pública de recursos
- **Monitor**: Reportes de incidencias en laboratorios asignados

### Rate Limiting

- **Creación/modificación de recursos**: 10 por minuto por usuario
- **Importación masiva**: 1 proceso por hora por usuario
- **Consultas de recursos**: 100 por minuto por usuario
- **Reportes de mantenimiento**: 20 por hora por usuario

### Auditoría y Logging

Todas las operaciones son registradas incluyendo:

- Creación, modificación y eliminación de recursos
- Importaciones masivas y su estado
- Cambios en categorías y disponibilidad
- Reportes de mantenimiento y resoluciones
- Accesos a recursos sensibles

### Formato de Token JWT

```json
{
  "sub": "user-id-123",
  "email": "user@ufps.edu.co",
  "roles": ["PROGRAM_ADMIN"],
  "permissions": ["manage:resources", "import:resources"],
  "program": "ING-SIS",
  "iat": 1640995200,
  "exp": 1641081600
}
```

---

## Gestión de Recursos

### GET /resources

**Descripción**: Obtiene una lista de todos los recursos disponibles con filtros opcionales.

**Restricciones de seguridad**: 

- Requiere autenticación JWT
- Accesible por todos los roles autenticados
- Rate limit: 100 req/min por usuario

**Parámetros de consulta**:

- `type` (string, opcional): Filtrar por tipo de recurso
- `status` (string, opcional): Filtrar por estado del recurso
- `categoryId` (string, opcional): Filtrar por ID de categoría
- `isActive` (boolean, opcional): Filtrar por estado activo
- `location` (string, opcional): Filtrar por ubicación (búsqueda parcial)

**Ejemplo de respuesta exitosa (200)**:
```json
[
  {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Sala de Conferencias A",
    "code": "SALA-001",
    "description": "Sala principal para conferencias con capacidad para 50 personas",
    "type": "SALA",
    "capacity": 50,
    "location": "Edificio Principal - Piso 3",
    "status": "DISPONIBLE",
    "attributes": {
      "proyector": true,
      "sonido": true,
      "climatizacion": true
    },
    "availableSchedules": [
      {
        "dayOfWeek": "MONDAY",
        "startTime": "08:00",
        "endTime": "18:00"
      }
    ],
    "categoryId": "60f7b3b3b3b3b3b3b3b3b3b4",
    "isActive": true,
    "createdAt": "2023-07-20T10:30:00Z",
    "updatedAt": "2023-07-20T10:30:00Z"
  }
]
```

---

### GET /resources/paginated

**Descripción**: Obtiene recursos con paginación y filtros opcionales.

**Restricciones de seguridad**: 

- Requiere autenticación JWT
- Accesible por todos los roles autenticados
- Rate limit: 100 req/min por usuario

**Parámetros de consulta**:

- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Elementos por página (default: 10)
- `type` (string, opcional): Filtrar por tipo de recurso
- `status` (string, opcional): Filtrar por estado del recurso
- `categoryId` (string, opcional): Filtrar por ID de categoría
- `isActive` (boolean, opcional): Filtrar por estado activo

**Ejemplo de respuesta exitosa (200)**:
```json
{
  "resources": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Laboratorio de Química",
      "code": "LAB-QUI-001",
      "type": "LABORATORIO",
      "capacity": 25,
      "location": "Edificio de Ciencias - Piso 2",
      "status": "DISPONIBLE",
      "isActive": true
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 5,
  "totalPages": 3
}
```

---

### GET /resources/search

**Descripción**: Busca recursos por nombre, descripción o código.

**Restricciones de seguridad**: 

- Requiere autenticación JWT
- Accesible por todos los roles autenticados
- Rate limit: 150 req/min por usuario

**Parámetros de consulta**:

- `q` (string, requerido): Término de búsqueda

---

### GET /resources/:id

**Descripción**: Obtiene los detalles de un recurso específico por su ID.

**Restricciones de seguridad**: 

- Requiere autenticación JWT
- Accesible por todos los roles autenticados
- Rate limit: 200 req/min por usuario

**Parámetros de ruta**:

- `id` (string, requerido): ID único del recurso

**Respuestas de error**:

- **404**: Recurso no encontrado

---

### GET /resources/code/:code

**Descripción**: Obtiene un recurso específico por su código único.

**Restricciones de seguridad**: 

- Requiere autenticación JWT
- Accesible por todos los roles autenticados
- Rate limit: 200 req/min por usuario

**Parámetros de ruta**:

- `code` (string, requerido): Código único del recurso

---

### GET /resources/:id/availability

**Descripción**: Verifica la disponibilidad de un recurso para reserva basada en reglas configuradas.

**Restricciones de seguridad**: 

- Requiere autenticación JWT
- Accesible por todos los roles autenticados
- Rate limit: 100 req/min por usuario

**Parámetros de ruta**:

- `id` (string, requerido): ID del recurso

**Parámetros de consulta**:

- `date` (string, requerido): Fecha solicitada (ISO string)
- `userType` (string, requerido): Tipo de usuario que hace la solicitud
- `duration` (number, requerido): Duración de la reserva en minutos

**Ejemplo de respuesta exitosa (200)**:
```json
{
  "available": true,
  "reason": null,
  "priority": "HIGH"
}
```

---

### POST /resources

**Descripción**: Crea un nuevo recurso físico en el sistema con código único auto-generado.

**Restricciones de seguridad**: 

- Requiere autenticación JWT
- Solo accesible por roles: `ADMIN_GENERAL`, `ADMIN_PROGRAMA`
- Rate limit: 50 req/min por usuario
- Auditoría: Se registra toda creación de recursos

**Cuerpo de la solicitud**:
```json
{
  "name": "Laboratorio de Química",
  "type": "LABORATORIO",
  "capacity": 25,
  "location": "Edificio de Ciencias - Piso 2",
  "description": "Laboratorio equipado para prácticas de química básica y avanzada",
  "attributes": {
    "campana_extraccion": true,
    "ducha_emergencia": true,
    "lavaojos": true
  },
  "availableSchedules": [
    {
      "dayOfWeek": "TUESDAY",
      "startTime": "14:00",
      "endTime": "18:00"
    }
  ],
  "categoryId": "60f7b3b3b3b3b3b3b3b3b3b5"
}
```

**Respuestas de error**:

- **400**: Datos de entrada inválidos o faltantes
- **409**: Código de recurso ya existe

---

### PUT /resources/:id

**Descripción**: Actualiza un recurso existente.

**Restricciones de seguridad**: 

- Requiere autenticación JWT
- Solo accesible por roles: `ADMIN_GENERAL`, `ADMIN_PROGRAMA`
- Rate limit: 50 req/min por usuario
- Auditoría: Se registra toda modificación de recursos

**Parámetros de ruta**:

- `id` (string, requerido): ID único del recurso

**Respuestas de error**:

- **400**: Datos de entrada inválidos
- **404**: Recurso no encontrado

---

### DELETE /resources/:id

**Descripción**: Elimina un recurso del sistema. Usa eliminación suave si tiene relaciones activas, eliminación dura si no las tiene.

**Restricciones de seguridad**: 

- Requiere autenticación JWT
- Solo accesible por roles: `ADMIN_GENERAL`, `ADMIN_PROGRAMA`
- Rate limit: 20 req/min por usuario
- Auditoría: Se registra toda eliminación de recursos

**Parámetros de ruta**:

- `id` (string, requerido): ID único del recurso

**Parámetros de consulta**:

- `force` (boolean, opcional): Forzar eliminación dura incluso con relaciones

**Respuestas**:

- **204**: Recurso eliminado exitosamente
- **400**: No se puede eliminar el recurso con relaciones activas
- **404**: Recurso no encontrado

**Response Success (200)**:

```json
{
  "id": "resource-123",
  "name": "Laboratorio de Sistemas A",
  "description": "Laboratorio con 30 computadoras para desarrollo de software",
  "code": "LAB-SIS-A",
  "categoryId": "category-lab",
  "categoryName": "Laboratorio",
  "programId": "ING-SIS",
  "programName": "Ingeniería de Sistemas",
  "capacity": 30,
  "location": "Edificio B - Piso 2",
  "equipment": ["COMPUTERS", "PROJECTOR", "AIR_CONDITIONING"],
  "specifications": {
    "computers": 30,
    "operatingSystem": "Ubuntu 20.04",
    "software": ["VS Code", "IntelliJ", "Docker"],
    "networkType": "Gigabit Ethernet"
  },
  "availability": [
    {
      "dayOfWeek": 1,
      "startTime": "08:00",
      "endTime": "18:00",
      "isActive": true
    }
  ],
  "maintenanceHistory": [
    {
      "id": "maint-456",
      "type": "PREVENTIVO",
      "description": "Limpieza y actualización de software",
      "scheduledDate": "2024-01-15T08:00:00Z",
      "status": "COMPLETED"
    }
  ],
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:22:00Z"
}
```

**Response Error (404)**:

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

---

### POST /resources

**Crear nuevo recurso (RF-01, RF-02, RF-03)**

Crea un nuevo recurso físico con sus atributos, categoría y programa académico asignado.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN
- 🛡️ PROGRAM_ADMIN solo pueden crear recursos para su programa
- 📝 Auditoría completa de creación
- 🔒 Rate limiting: 10 creaciones por minuto

**Request Body**:

```json
{
  "name": "Auditorio Central",
  "description": "Auditorio principal con capacidad para 200 personas",
  "code": "AUD-CENTRAL",
  "categoryId": "category-auditorium",
  "programId": "GENERAL",
  "capacity": 200,
  "location": "Edificio Principal - Piso 1",
  "equipment": ["PROJECTOR", "SOUND_SYSTEM", "AIR_CONDITIONING", "MICROPHONES"],
  "specifications": {
    "stage": true,
    "lighting": "Professional LED",
    "acoustics": "Optimized",
    "accessibility": "Full wheelchair access"
  },
  "availability": [
    {
      "dayOfWeek": 1,
      "startTime": "08:00",
      "endTime": "20:00"
    },
    {
      "dayOfWeek": 2,
      "startTime": "08:00",
      "endTime": "20:00"
    }
  ]
}
```

**Response Success (201)**:

```json
{
  "id": "resource-789",
  "name": "Auditorio Central",
  "description": "Auditorio principal con capacidad para 200 personas",
  "code": "AUD-CENTRAL",
  "categoryId": "category-auditorium",
  "programId": "GENERAL",
  "capacity": 200,
  "location": "Edificio Principal - Piso 1",
  "equipment": ["PROJECTOR", "SOUND_SYSTEM", "AIR_CONDITIONING", "MICROPHONES"],
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Response Error (409)**:

```json
{
  "statusCode": 409,
  "message": "Resource with code 'AUD-CENTRAL' already exists",
  "error": "Conflict"
}
```

---

### PUT /resources/:id

**Actualizar recurso existente (RF-01, RF-03)**

Actualiza información de un recurso existente preservando su historial.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN
- 🛡️ PROGRAM_ADMIN solo pueden editar recursos de su programa
- 📝 Auditoría completa de modificaciones
- 🔒 Rate limiting: 10 modificaciones por minuto

**Path Parameters**:

- `id`: ID del recurso

**Request Body**:

```json
{
  "name": "Laboratorio de Sistemas A - Renovado",
  "description": "Laboratorio renovado con equipos de última generación",
  "capacity": 35,
  "equipment": ["COMPUTERS", "PROJECTOR", "AIR_CONDITIONING", "SMART_BOARD"],
  "specifications": {
    "computers": 35,
    "operatingSystem": "Ubuntu 22.04",
    "software": ["VS Code", "IntelliJ", "Docker", "Kubernetes"],
    "networkType": "Gigabit Ethernet",
    "renovationDate": "2024-01-15"
  }
}
```

**Response Success (200)**:

```json
{
  "id": "resource-123",
  "name": "Laboratorio de Sistemas A - Renovado",
  "description": "Laboratorio renovado con equipos de última generación",
  "capacity": 35,
  "equipment": ["COMPUTERS", "PROJECTOR", "AIR_CONDITIONING", "SMART_BOARD"],
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### DELETE /resources/:id

**Eliminar o deshabilitar recurso (RF-01)**

Elimina lógicamente un recurso del sistema, preservando su historial y reservas asociadas.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN únicamente
- ⚠️ Requiere confirmación especial para recursos con reservas activas
- 📝 Auditoría crítica de eliminaciones
- 🔒 Rate limiting: 5 eliminaciones por minuto

**Path Parameters**:

- `id`: ID del recurso

**Query Parameters**:

- `force` (optional): Forzar eliminación aunque tenga reservas futuras (default: false)

**Response Success (200)**:

```json
{
  "message": "Resource deleted successfully",
  "id": "resource-123",
  "deletedAt": "2024-01-15T10:30:00Z",
  "affectedReservations": 3
}
```

**Response Error (409)**:

```json
{
  "statusCode": 409,
  "message": "Cannot delete resource with active or future reservations",
  "error": "Conflict",
  "details": {
    "activeReservations": 2,
    "futureReservations": 8,
    "suggestion": "Use force=true to override or disable resource instead"
  }
}
```

---

## Gestión de Categorías

### GET /categories

**Obtener lista de categorías de recursos (RF-02)**

Retorna categorías disponibles para clasificar recursos, incluyendo las obligatorias del sistema.

**Security Restrictions**:

- ❌ No requiere autenticación
- 📊 Endpoint público de consulta
- 📝 Logging básico sin información sensible

**Query Parameters**:

- `isDefault` (optional): Filtrar categorías por defecto (no eliminables)
- `isActive` (optional): Filtrar categorías activas

**Response Success (200)**:

```json
[
  {
    "id": "category-salon",
    "name": "Salón",
    "description": "Aulas tradicionales de clase",
    "color": "#4CAF50",
    "icon": "classroom",
    "isDefault": true,
    "isActive": true,
    "resourceCount": 45
  },
  {
    "id": "category-lab",
    "name": "Laboratorio",
    "description": "Laboratorios especializados",
    "color": "#2196F3",
    "icon": "science",
    "isDefault": true,
    "isActive": true,
    "resourceCount": 18
  }
]
```

---

### POST /categories

**Crear nueva categoría (RF-02)**

Crea una nueva categoría personalizada para clasificar recursos.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN únicamente
- 📝 Auditoría de creación de categorías
- 🔒 Rate limiting: 5 creaciones por minuto

**Request Body**:

```json
{
  "name": "Sala de Conferencias",
  "description": "Salas especializadas para videoconferencias",
  "color": "#FF9800",
  "icon": "video_call"
}
```

**Response Success (201)**:

```json
{
  "id": "category-conference",
  "name": "Sala de Conferencias",
  "description": "Salas especializadas para videoconferencias",
  "color": "#FF9800",
  "icon": "video_call",
  "isDefault": false,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### PUT /categories/:id

**Actualizar categoría (RF-02)**

Actualiza información de una categoría existente. Las categorías por defecto tienen restricciones.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN únicamente
- ⚠️ Categorías por defecto (Salón, Laboratorio, Auditorio, Equipo Multimedia) no pueden ser eliminadas
- 📝 Auditoría de modificaciones

**Path Parameters**:

- `id`: ID de la categoría

**Request Body**:

```json
{
  "name": "Sala de Videoconferencias",
  "description": "Salas equipadas para videoconferencias y reuniones virtuales",
  "color": "#FF5722"
}
```

**Response Success (200)**:

```json
{
  "id": "category-conference",
  "name": "Sala de Videoconferencias",
  "description": "Salas equipadas para videoconferencias y reuniones virtuales",
  "color": "#FF5722",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### DELETE /categories/:id

**Eliminar categoría (RF-02)**

Elimina una categoría personalizada del sistema.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN únicamente
- ⚠️ No permite eliminar categorías por defecto
- ⚠️ No permite eliminar categorías con recursos asociados
- 📝 Auditoría crítica de eliminaciones

**Path Parameters**:

- `id`: ID de la categoría

**Response Success (200)**:

```json
{
  "message": "Category deleted successfully",
  "deletedAt": "2024-01-15T10:30:00Z"
}
```

**Response Error (400)**:

```json
{
  "statusCode": 400,
  "message": "Cannot delete default category",
  "error": "Bad Request"
}
```

---

## Importación Masiva

### POST /resources/import/csv

**Importar recursos desde archivo CSV (RF-04)**

Inicia proceso de importación masiva de recursos desde archivo CSV con validación y procesamiento asíncrono.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN
- 📊 PROGRAM_ADMIN solo pueden importar para su programa
- 🔒 Rate limiting: 1 importación por hora por usuario
- 📝 Auditoría completa del proceso

**Request Body (multipart/form-data)**:

- `file`: Archivo CSV con recursos
- `programId` (optional): ID del programa académico
- `validateOnly` (optional): Solo validar sin importar (default: false)

**CSV Format Expected**:

```csv
name,description,code,category,capacity,location,equipment
"Laboratorio B","Lab de programación","LAB-B","Laboratorio",25,"Edificio C","COMPUTERS,PROJECTOR"
"Auditorio Norte","Auditorio secundario","AUD-N","Auditorio",150,"Edificio A","PROJECTOR,SOUND_SYSTEM"
```

**Response Success (202)**:

```json
{
  "jobId": "import-job-789",
  "message": "Import process started",
  "estimatedDuration": "5-10 minutes",
  "recordsToProcess": 45,
  "status": "PROCESSING",
  "startedAt": "2024-01-15T10:30:00Z"
}
```

**Response Error (400)**:

```json
{
  "statusCode": 400,
  "message": "Invalid CSV format",
  "error": "Bad Request",
  "details": [
    {
      "row": 3,
      "field": "capacity",
      "message": "Capacity must be a positive number"
    }
  ]
}
```

---

### GET /resources/import/template

**Descargar plantilla CSV para importación (RF-04)**

Descarga plantilla CSV con formato correcto y ejemplos para importación masiva.

**Security Restrictions**:

- ❌ No requiere autenticación
- 📊 Recurso público
- 📝 Logging básico de descargas

**Response Success (200)**:

- Content-Type: text/csv
- Content-Disposition: attachment; filename="resources-import-template.csv"

---

### GET /resources/import/status/:jobId

**Consultar estado de importación (RF-04)**

Consulta el progreso y resultado de un proceso de importación masiva.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👁️ Solo el usuario que inició la importación puede consultarla
- 📝 Logging de consultas de estado

**Path Parameters**:

- `jobId`: ID del trabajo de importación

**Response Success (200)**:

```json
{
  "jobId": "import-job-789",
  "status": "COMPLETED",
  "progress": 100,
  "startedAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:37:23Z",
  "summary": {
    "totalRecords": 45,
    "successful": 42,
    "failed": 3,
    "skipped": 0
  },
  "results": {
    "created": ["resource-801", "resource-802"],
    "updated": ["resource-123"],
    "errors": [
      {
        "row": 15,
        "error": "Category 'Invalid Category' not found"
      }
    ]
  }
}
```

---

## Gestión de Mantenimiento

### POST /maintenance

**Reportar mantenimiento de recurso (RF-06)**

Permite registrar reportes de mantenimiento preventivo, correctivo o incidencias en recursos.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN, COORDINATOR, MONITOR
- 🛡️ PROGRAM_ADMIN/COORDINATOR solo para recursos de su programa
- 📝 Auditoría completa de reportes de mantenimiento
- 🔒 Rate limiting: 20 reportes por hora por usuario

**Request Body**:

```json
{
  "resourceId": "resource-123",
  "type": "CORRECTIVO",
  "priority": "HIGH",
  "title": "Falla en sistema de refrigeración",
  "description": "El aire acondicionado del laboratorio no está funcionando correctamente",
  "reportedBy": "monitor-456",
  "scheduledDate": "2024-01-20T08:00:00Z",
  "estimatedDuration": 4,
  "affectsAvailability": true,
  "requiredParts": ["Filtro de aire", "Refrigerante R410A"],
  "attachments": ["photo1.jpg", "diagnostic_report.pdf"]
}
```

**Response Success (201)**:

```json
{
  "id": "maintenance-789",
  "resourceId": "resource-123",
  "type": "CORRECTIVO",
  "priority": "HIGH",
  "title": "Falla en sistema de refrigeración",
  "status": "SCHEDULED",
  "reportedBy": "monitor-456",
  "scheduledDate": "2024-01-20T08:00:00Z",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### GET /maintenance

**Obtener reportes de mantenimiento (RF-06)**

Consulta reportes de mantenimiento con filtros por estado, tipo, prioridad y recurso.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 ADMIN: Acceso completo
- 👁️ PROGRAM_ADMIN: Solo mantenimiento de recursos de su programa
- 📊 Paginación obligatoria

**Query Parameters**:

- `resourceId` (optional): ID del recurso
- `type` (optional): PREVENTIVO, CORRECTIVO, EMERGENCIA
- `status` (optional): SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- `priority` (optional): LOW, MEDIUM, HIGH, CRITICAL
- `startDate` (optional): Fecha de inicio del período
- `endDate` (optional): Fecha de fin del período
- `page` (optional): Número de página (default: 1)
- `limit` (optional): Elementos por página (default: 20)

**Response Success (200)**:

```json
{
  "data": [
    {
      "id": "maintenance-789",
      "resourceId": "resource-123",
      "resourceName": "Laboratorio de Sistemas A",
      "type": "CORRECTIVO",
      "priority": "HIGH",
      "title": "Falla en sistema de refrigeración",
      "status": "IN_PROGRESS",
      "reportedBy": "Monitor García",
      "assignedTo": "Técnico López",
      "scheduledDate": "2024-01-20T08:00:00Z",
      "startedAt": "2024-01-20T08:15:00Z",
      "progress": 60
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 34,
    "totalPages": 2
  }
}
```

---

### PUT /maintenance/:id

**Actualizar estado de mantenimiento (RF-06)**

Actualiza el progreso, estado y detalles de un reporte de mantenimiento.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, COORDINATOR, asignado al mantenimiento
- 📝 Auditoría de cambios de estado

**Path Parameters**:

- `id`: ID del reporte de mantenimiento

**Request Body**:

```json
{
  "status": "COMPLETED",
  "progress": 100,
  "completedAt": "2024-01-20T12:30:00Z",
  "resolution": "Sistema de refrigeración reparado. Se reemplazó filtro y se recargó refrigerante.",
  "actualDuration": 4.5,
  "usedParts": ["Filtro de aire", "Refrigerante R410A"],
  "costEstimate": 150000,
  "followUpRequired": false,
  "attachments": ["completed_work.jpg", "warranty_certificate.pdf"]
}
```

**Response Success (200)**:

```json
{
  "id": "maintenance-789",
  "status": "COMPLETED",
  "progress": 100,
  "completedAt": "2024-01-20T12:30:00Z",
  "resolution": "Sistema de refrigeración reparado. Se reemplazó filtro y se recargó refrigerante.",
  "actualDuration": 4.5,
  "updatedAt": "2024-01-20T12:30:00Z"
}
```

---

## Configuración de Disponibilidad

### POST /resources/:id/availability

**Configurar horarios de disponibilidad (RF-05)**

Define o actualiza los horarios en que un recurso está disponible para reservas.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN, COORDINATOR
- 🛡️ PROGRAM_ADMIN solo para recursos de su programa
- 📝 Auditoría de cambios de disponibilidad

**Path Parameters**:

- `id`: ID del recurso

**Request Body**:

```json
{
  "schedules": [
    {
      "dayOfWeek": 1,
      "startTime": "08:00",
      "endTime": "18:00",
      "isActive": true
    },
    {
      "dayOfWeek": 2,
      "startTime": "08:00", 
      "endTime": "20:00",
      "isActive": true
    }
  ],
  "exceptions": [
    {
      "date": "2024-01-25",
      "isAvailable": false,
      "reason": "Mantenimiento preventivo programado"
    }
  ],
  "restrictions": {
    "maxConsecutiveHours": 4,
    "maxDailyHours": 8,
    "requiredRoles": ["TEACHER", "ADMIN"],
    "advanceBookingRequired": 24
  }
}
```

**Response Success (201)**:

```json
{
  "id": "availability-456",
  "resourceId": "resource-123",
  "schedules": [
    {
      "dayOfWeek": 1,
      "startTime": "08:00",
      "endTime": "18:00",
      "isActive": true
    }
  ],
  "exceptions": [
    {
      "date": "2024-01-25",
      "isAvailable": false,
      "reason": "Mantenimiento preventivo programado"
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### GET /resources/:id/availability

**Consultar disponibilidad de recurso (RF-05)**

Obtiene la configuración actual de disponibilidad de un recurso específico.

**Security Restrictions**:

- ❌ No requiere autenticación para consulta básica
- 🔐 JWT requerido para detalles de restricciones
- 📝 Logging de consultas de disponibilidad

**Path Parameters**:

- `id`: ID del recurso

**Query Parameters**:

- `startDate` (optional): Fecha de inicio para consultar excepciones
- `endDate` (optional): Fecha de fin para consultar excepciones
- `includeRestrictions` (optional): Incluir restricciones detalladas

**Response Success (200)**:

```json
{
  "resourceId": "resource-123",
  "resourceName": "Laboratorio de Sistemas A",
  "schedules": [
    {
      "dayOfWeek": 1,
      "dayName": "Monday",
      "startTime": "08:00",
      "endTime": "18:00",
      "isActive": true,
      "totalHours": 10
    }
  ],
  "exceptions": [
    {
      "date": "2024-01-25",
      "isAvailable": false,
      "reason": "Mantenimiento preventivo programado"
    }
  ],
  "restrictions": {
    "maxConsecutiveHours": 4,
    "maxDailyHours": 8,
    "requiredRoles": ["TEACHER", "ADMIN"],
    "advanceBookingRequired": 24
  },
  "weeklyHours": 50,
  "lastUpdatedAt": "2024-01-15T10:30:00Z"
}
```

---

### PUT /resources/:id/availability/:availabilityId

**Actualizar configuración de disponibilidad (RF-05)**

Modifica la configuración existente de disponibilidad de un recurso.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN, COORDINATOR
- 🛡️ PROGRAM_ADMIN solo para recursos de su programa
- 📝 Auditoría completa de modificaciones

**Path Parameters**:

- `id`: ID del recurso
- `availabilityId`: ID de la configuración de disponibilidad

**Request Body**:

```json
{
  "schedules": [
    {
      "dayOfWeek": 1,
      "startTime": "07:00",
      "endTime": "19:00", 
      "isActive": true
    }
  ],
  "restrictions": {
    "maxConsecutiveHours": 6,
    "maxDailyHours": 10,
    "advanceBookingRequired": 48
  }
}
```

**Response Success (200)**:

```json
{
  "id": "availability-456",
  "resourceId": "resource-123",
  "schedules": [
    {
      "dayOfWeek": 1,
      "startTime": "07:00",
      "endTime": "19:00",
      "isActive": true
    }
  ],
  "restrictions": {
    "maxConsecutiveHours": 6,
    "maxDailyHours": 10,
    "advanceBookingRequired": 48
  },
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## Manejo de Errores

### Códigos de Estado HTTP

| Código | Descripción |
|--------|-----------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado exitosamente |
| 202 | Accepted - Proceso asíncrono iniciado (importación) |
| 204 | No Content - Operación exitosa sin contenido |
| 400 | Bad Request - Parámetros inválidos o datos incorrectos |
| 401 | Unauthorized - Token JWT inválido, expirado o faltante |
| 403 | Forbidden - Sin permisos para gestionar recursos |
| 404 | Not Found - Recurso, categoría o mantenimiento no encontrado |
| 409 | Conflict - Conflicto (código duplicado, recurso con reservas) |
| 413 | Payload Too Large - Archivo CSV demasiado grande |
| 422 | Unprocessable Entity - Errores de validación en datos |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error interno del servidor |
| 503 | Service Unavailable - Servicio temporalmente no disponible |

### Formato de Errores

```json
{
  "statusCode": 409,
  "message": "Resource with code 'LAB-SIS-A' already exists",
  "error": "Conflict",
  "details": [
    {
      "field": "code",
      "message": "Resource code must be unique across the system"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/resources"
}
```

### Errores Específicos de Resources Service

**Errores de Importación**:

```json
{
  "statusCode": 422,
  "message": "CSV import validation failed",
  "error": "Unprocessable Entity",
  "details": [
    {
      "row": 3,
      "field": "capacity",
      "message": "Capacity must be a positive integer"
    },
    {
      "row": 5,
      "field": "category",
      "message": "Category 'Unknown Category' does not exist"
    }
  ],
  "validRecords": 15,
  "invalidRecords": 3
}
```

---

## Restricciones de Dominio

### Restricciones de Recursos

- **Código único**: Cada recurso debe tener un código único en todo el sistema
- **Capacidad**: Mínimo 1, máximo 500 personas por recurso
- **Categorías obligatorias**: Salón, Laboratorio, Auditorio, Equipo Multimedia (no eliminables)
- **Asociación de programa**: Un recurso puede pertenecer a múltiples programas
- **Estado activo**: Solo recursos activos pueden recibir nuevas reservas

### Restricciones de Importación

- **Formato CSV**: Únicamente archivos CSV con encoding UTF-8
- **Tamaño máximo**: 5MB por archivo
- **Registros por lote**: Máximo 1000 recursos por importación
- **Campos obligatorios**: name, code, category, capacity
- **Validación previa**: Todos los datos se validan antes de iniciar importación
- **Proceso asíncrono**: Importaciones se ejecutan en background

### Restricciones de Mantenimiento

- **Tipos válidos**: PREVENTIVO, CORRECTIVO, EMERGENCIA
- **Prioridades**: LOW, MEDIUM, HIGH, CRITICAL
- **Programación**: No se puede programar durante reservas activas
- **Duración**: Mínimo 30 minutos, máximo 8 horas por sesión
- **Documentación**: Reportes de mantenimiento CRÍTICO requieren adjuntos

### Restricciones de Disponibilidad

- **Horarios**: Entre 06:00 y 22:00 horas
- **Días laborales**: Lunes a Sábado (Domingo requiere autorización especial)
- **Duración mínima**: Bloques de 30 minutos mínimo
- **Reserva anticipada**: Entre 1 hora y 30 días de anticipación
- **Excepciones**: Máximo 10 excepciones por recurso por mes

### Reglas de Negocio

- **Eliminación lógica**: Los recursos se desactivan, no se eliminan físicamente
- **Historial**: Se preserva historial completo de cambios y mantenimiento
- **Auditoría**: Todas las operaciones administrativas son auditadas
- **Backup**: Importaciones crean backup automático antes de ejecutar
- **Rollback**: Importaciones fallidas pueden revertirse completamente

---

## Seguridad y Observabilidad

### Eventos Auditados

Todos los siguientes eventos son registrados con nivel **INFO** o superior:

**Gestión de Recursos**:

- `RESOURCE_CREATED`: Nuevo recurso creado
- `RESOURCE_UPDATED`: Recurso modificado
- `RESOURCE_DELETED`: Recurso desactivado/eliminado
- `RESOURCE_ACCESSED`: Acceso a recurso específico

**Gestión de Categorías**:

- `CATEGORY_CREATED`: Nueva categoría creada
- `CATEGORY_UPDATED`: Categoría modificada
- `CATEGORY_DELETED`: Categoría eliminada
- `CATEGORY_PROTECTED_ACCESS`: Intento de modificar categoría por defecto

**Importación Masiva**:

- `IMPORT_STARTED`: Proceso de importación iniciado
- `IMPORT_COMPLETED`: Importación completada exitosamente
- `IMPORT_FAILED`: Importación falló
- `IMPORT_VALIDATED`: Validación de CSV completada

**Mantenimiento**:

- `MAINTENANCE_SCHEDULED`: Mantenimiento programado
- `MAINTENANCE_STARTED`: Mantenimiento iniciado
- `MAINTENANCE_COMPLETED`: Mantenimiento completado
- `MAINTENANCE_CANCELLED`: Mantenimiento cancelado

**Disponibilidad**:

- `AVAILABILITY_CONFIGURED`: Disponibilidad configurada
- `AVAILABILITY_UPDATED`: Disponibilidad modificada
- `AVAILABILITY_EXCEPTION_ADDED`: Excepción de disponibilidad agregada

### Niveles de Severidad

| Nivel | Eventos | Integración |
|-------|---------|-------------|
| **ERROR** | Fallos en importación, errores de mantenimiento crítico | Sentry + PagerDuty |
| **WARN** | Rate limits excedidos, conflictos de programación | Sentry |
| **INFO** | Operaciones normales, accesos autorizados | Winston |
| **DEBUG** | Detalles de queries, validaciones de CSV | Winston (dev only) |

### Integración OpenTelemetry

```json
{
  "spans": [
    "resource.creation.duration",
    "import.processing.time",
    "maintenance.execution.duration",
    "availability.validation.time"
  ],
  "metrics": [
    "resources.created.total",
    "imports.processed.total",
    "maintenance.completed.total",
    "availability.configurations.total"
  ],
  "traces": [
    "resource-management-pipeline",
    "csv-import-workflow",
    "maintenance-scheduling-process"
  ]
}
```

### Integración Sentry

```json
{
  "errorCategories": [
    "ResourceCreationError",
    "ImportProcessingError",
    "MaintenanceSchedulingError",
    "AvailabilityConfigError",
    "CategoryManagementError"
  ],
  "customTags": {
    "service": "resources-service",
    "resourceType": "salon|laboratorio|auditorio|equipo",
    "operationType": "create|update|delete|import",
    "userRole": "admin|program_admin|coordinator"
  }
}
```

### Alertas y Notificaciones

**Alertas Críticas** (inmediatas):

- Fallo en importación masiva con pérdida de datos
- Error en mantenimiento crítico de recursos esenciales
- Corrupción de datos de disponibilidad
- Acceso no autorizado a funciones administrativas

**Alertas de Advertencia** (diarias):

- Rate limits frecuentemente excedidos
- Conflictos recurrentes en programación de mantenimiento
- Importaciones con alta tasa de errores
- Recursos con disponibilidad inconsistente

**Métricas de Salud**:

- **Disponibilidad**: >99.8% uptime mensual
- **Tiempo de respuesta**: <1s para consultas, <5s para operaciones complejas
- **Tasa de éxito**: >99% en operaciones CRUD
- **Importaciones**: >95% de registros procesados exitosamente

---

## 🏷️ Gestión de Categorías de Recursos

Los endpoints de `/resource-categories` permiten gestionar las asociaciones entre recursos y categorías, proporcionando clasificación y organización flexible de recursos físicos.

### GET /resource-categories/:resourceId

**Obtener categorías asignadas a un recurso específico**

Retorna todas las categorías actualmente asignadas a un recurso determinado con paginación opcional.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: Todos los roles autenticados
- 🚀 Rate limiting: 100 req/min

**Parameters**:

- `resourceId` (path, required): ID del recurso
- `page` (query, optional): Número de página (default: 1)
- `limit` (query, optional): Elementos por página (default: 10, max: 100)

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "resourceId": "resource-123",
    "categories": [
      {
        "id": "category-lab",
        "name": "Laboratorio",
        "code": "LAB",
        "type": "RESOURCE_TYPE",
        "color": "#3B82F6",
        "assignedAt": "2024-01-15T10:30:00Z",
        "assignedBy": "admin-user-456"
      },
      {
        "id": "category-tech",
        "name": "Tecnología",
        "code": "TECH",
        "type": "RESOURCE_TYPE",
        "color": "#10B981",
        "assignedAt": "2024-01-16T14:20:00Z",
        "assignedBy": "admin-user-789"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 2,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### POST /resource-categories/:resourceId/assign

**Asignar categoría a un recurso (RF-02)**

Asigna una categoría específica a un recurso. Si la categoría ya está asignada, no realiza cambios.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN
- 🛡️ PROGRAM_ADMIN solo pueden gestionar recursos de su programa
- 📝 Auditoría completa de asignación
- 🔒 Rate limiting: 20 asignaciones por minuto

**Parameters**:

- `resourceId` (path, required): ID del recurso

**Request Body**:

```json
{
  "categoryId": "category-multimedia",
  "notes": "Categoría asignada por actualización de equipamiento"
}
```

**Response Success (201)**:

```json
{
  "success": true,
  "message": "Categoría asignada exitosamente al recurso",
  "data": {
    "resourceId": "resource-123",
    "categoryId": "category-multimedia",
    "categoryName": "Equipo Multimedia",
    "assignedAt": "2024-01-20T15:45:00Z",
    "assignedBy": "admin-user-456"
  }
}
```

**Response Error (409)**:

```json
{
  "statusCode": 409,
  "message": "La categoría ya está asignada a este recurso",
  "error": "Conflict"
}
```

---

### POST /resource-categories/:resourceId/assign-multiple

**Asignar múltiples categorías a un recurso**

Permite asignar varias categorías a un recurso en una sola operación. Útil para importación masiva o configuración inicial.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN
- 🛡️ PROGRAM_ADMIN solo pueden gestionar recursos de su programa
- 📝 Auditoría completa de asignaciones múltiples
- 🔒 Rate limiting: 10 operaciones por minuto

**Parameters**:

- `resourceId` (path, required): ID del recurso

**Request Body**:

```json
{
  "categoryIds": [
    "category-lab",
    "category-tech",
    "category-multimedia"
  ],
  "notes": "Asignación múltiple durante configuración inicial"
}
```

**Response Success (201)**:

```json
{
  "success": true,
  "message": "3 categorías asignadas exitosamente",
  "data": {
    "resourceId": "resource-123",
    "assignedCategories": [
      {
        "categoryId": "category-lab",
        "categoryName": "Laboratorio",
        "status": "assigned"
      },
      {
        "categoryId": "category-tech", 
        "categoryName": "Tecnología",
        "status": "assigned"
      },
      {
        "categoryId": "category-multimedia",
        "categoryName": "Equipo Multimedia", 
        "status": "already_assigned"
      }
    ],
    "totalAssigned": 2,
    "totalSkipped": 1,
    "assignedAt": "2024-01-20T16:00:00Z"
  }
}
```

---

### PUT /resource-categories/:resourceId/replace

**Reemplazar todas las categorías de un recurso**

Elimina todas las categorías actuales del recurso y asigna las nuevas categorías especificadas.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN
- 🛡️ PROGRAM_ADMIN solo pueden gestionar recursos de su programa
- 📝 Auditoría completa del reemplazo
- 🔒 Rate limiting: 5 reemplazos por minuto

**Parameters**:

- `resourceId` (path, required): ID del recurso

**Request Body**:

```json
{
  "categoryIds": [
    "category-auditorium",
    "category-multimedia"
  ],
  "notes": "Reclasificación completa del recurso"
}
```

**Response Success (200)**:

```json
{
  "success": true,
  "message": "Categorías reemplazadas exitosamente",
  "data": {
    "resourceId": "resource-123",
    "previousCategories": [
      {
        "categoryId": "category-lab",
        "categoryName": "Laboratorio"
      }
    ],
    "newCategories": [
      {
        "categoryId": "category-auditorium",
        "categoryName": "Auditorio"
      },
      {
        "categoryId": "category-multimedia",
        "categoryName": "Equipo Multimedia"
      }
    ],
    "replacedAt": "2024-01-20T16:15:00Z"
  }
}
```

---

### DELETE /resource-categories/:resourceId/:categoryId

**Remover categoría específica de un recurso**

Elimina la asociación entre un recurso y una categoría específica.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN
- 🛡️ PROGRAM_ADMIN solo pueden gestionar recursos de su programa
- 📝 Auditoría completa de remoción
- 🔒 Rate limiting: 30 remociones por minuto

**Parameters**:

- `resourceId` (path, required): ID del recurso
- `categoryId` (path, required): ID de la categoría a remover

**Response Success (200)**:

```json
{
  "success": true,
  "message": "Categoría removida exitosamente del recurso",
  "data": {
    "resourceId": "resource-123",
    "categoryId": "category-lab",
    "categoryName": "Laboratorio",
    "removedAt": "2024-01-20T16:30:00Z",
    "removedBy": "admin-user-456"
  }
}
```

**Response Error (404)**:

```json
{
  "statusCode": 404,
  "message": "Asociación recurso-categoría no encontrada",
  "error": "Not Found"
}
```

---

### GET /resource-categories/by-category/:categoryId

**Obtener recursos por categoría específica**

Retorna todos los recursos que tienen asignada una categoría determinada con opciones de paginación y filtros.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: Todos los roles autenticados
- 🚀 Rate limiting: 50 req/min

**Parameters**:

- `categoryId` (path, required): ID de la categoría
- `page` (query, optional): Número de página (default: 1)
- `limit` (query, optional): Elementos por página (default: 10, max: 50)
- `programId` (query, optional): Filtrar por programa académico
- `active` (query, optional): Filtrar por recursos activos (true/false)

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "categoryId": "category-lab",
    "categoryName": "Laboratorio",
    "resources": [
      {
        "id": "resource-123",
        "name": "Laboratorio de Sistemas A",
        "code": "LAB-SIS-A",
        "programId": "ING-SIS",
        "programName": "Ingeniería de Sistemas",
        "capacity": 30,
        "location": "Edificio B - Piso 2",
        "isActive": true,
        "assignedAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": "resource-124",
        "name": "Laboratorio de Redes",
        "code": "LAB-RED-01",
        "programId": "ING-SIS",
        "programName": "Ingeniería de Sistemas", 
        "capacity": 25,
        "location": "Edificio B - Piso 3",
        "isActive": true,
        "assignedAt": "2024-01-16T09:15:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### GET /resource-categories/statistics

**Estadísticas de categorización de recursos**

Proporciona métricas y estadísticas sobre la distribución de categorías entre recursos.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN, COORDINATOR
- 🚀 Rate limiting: 20 req/min

**Query Parameters**:

- `programId` (optional): Filtrar estadísticas por programa académico
- `period` (optional): Período de análisis (7d, 30d, 90d, 1y)

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalResources": 150,
      "categorizedResources": 145,
      "uncategorizedResources": 5,
      "categorizationRate": 96.7
    },
    "categoryDistribution": [
      {
        "categoryId": "category-lab",
        "categoryName": "Laboratorio",
        "resourceCount": 45,
        "percentage": 30.0
      },
      {
        "categoryId": "category-classroom",
        "categoryName": "Salón",
        "resourceCount": 60,
        "percentage": 40.0
      },
      {
        "categoryId": "category-auditorium",
        "categoryName": "Auditorio", 
        "resourceCount": 8,
        "percentage": 5.3
      }
    ],
    "recentActivity": {
      "assignmentsLastWeek": 12,
      "removalsLastWeek": 3,
      "replacementsLastWeek": 2
    },
    "generatedAt": "2024-01-20T17:00:00Z"
  }
}
```

---

## 📥 Importación Masiva de Recursos

Los endpoints de `/resource-import` permiten la importación masiva de recursos desde archivos CSV, proporcionando funcionalidades para previsualización, procesamiento y seguimiento del progreso de importación.

### POST /resource-import/preview

**Previsualizar importación desde CSV (RF-04)**

Permite subir un archivo CSV y obtener una vista previa de los datos que serían importados, incluyendo validaciones y posibles errores.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN
- 🛡️ PROGRAM_ADMIN solo pueden importar para su programa
- 📝 Auditoría completa de previsualización
- 🔒 Rate limiting: 5 previsualizaciones por minuto
- 📁 Tamaño máximo de archivo: 50MB
- 📊 Máximo 1000 registros por archivo

**Request Body** (multipart/form-data):

- `file` (required): Archivo CSV con estructura estándar
- `programId` (optional): ID del programa académico (solo para PROGRAM_ADMIN)
- `skipValidation` (optional): Omitir validaciones no críticas (boolean)

**Estructura CSV esperada**:
```csv
name,type,capacity,location,description,equipment,specifications
Laboratorio A,LAB,30,"Edificio B - Piso 2","Lab de sistemas","COMPUTERS,PROJECTOR","{""computers"":30}"
Auditorio Central,AUD,200,"Edificio Principal","Auditorio principal","SOUND_SYSTEM,PROJECTOR","{""stage"":true}"
```

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "previewId": "preview-12345",
    "totalRows": 150,
    "validRows": 145,
    "invalidRows": 5,
    "validationSummary": {
      "errors": [
        {
          "row": 23,
          "field": "capacity",
          "message": "La capacidad debe ser un número positivo",
          "value": "abc"
        },
        {
          "row": 87,
          "field": "name",
          "message": "El nombre del recurso ya existe",
          "value": "Laboratorio A"
        }
      ],
      "warnings": [
        {
          "row": 45,
          "field": "equipment",
          "message": "Equipo 'OLD_PROJECTOR' no reconocido, se usará 'PROJECTOR'",
          "value": "OLD_PROJECTOR"
        }
      ]
    },
    "sampleRows": [
      {
        "row": 1,
        "data": {
          "name": "Laboratorio de Sistemas B",
          "type": "LAB",
          "capacity": 25,
          "location": "Edificio B - Piso 3",
          "categoryId": "category-lab",
          "programId": "ING-SIS"
        },
        "status": "valid"
      },
      {
        "row": 2,
        "data": {
          "name": "Sala de Juntas",
          "type": "ROOM",
          "capacity": 12,
          "location": "Edificio A - Piso 1"
        },
        "status": "valid"
      }
    ],
    "estimatedProcessingTime": "2-3 minutos",
    "createdAt": "2024-01-20T18:00:00Z",
    "expiresAt": "2024-01-20T19:00:00Z"
  }
}
```

**Response Error (400)**:

```json
{
  "statusCode": 400,
  "message": "Formato de archivo inválido. Se requiere CSV con headers válidos",
  "error": "Bad Request",
  "details": {
    "expectedHeaders": ["name", "type", "capacity"],
    "foundHeaders": ["nombre", "tipo", "capacidad"],
    "missingHeaders": ["name", "type", "capacity"]
  }
}
```

---

### POST /resource-import/start

**Iniciar importación masiva de recursos**

Inicia el procesamiento de importación basado en una previsualización aprobada. El proceso es asíncrono y permite seguimiento del progreso.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN
- 🛡️ PROGRAM_ADMIN solo pueden importar para su programa
- 📝 Auditoría completa del proceso de importación
- 🔒 Rate limiting: 2 importaciones por hora
- 🚫 Solo se permite una importación activa por usuario

**Request Body**:

```json
{
  "previewId": "preview-12345",
  "importOptions": {
    "skipExisting": true,
    "updateExisting": false,
    "assignDefaultCategories": true,
    "assignDefaultAvailability": true,
    "notifyOnCompletion": true
  },
  "programId": "ING-SIS",
  "notes": "Importación masiva de laboratorios - Semestre 2024-1"
}
```

**Response Success (202)**:

```json
{
  "success": true,
  "message": "Importación iniciada exitosamente",
  "data": {
    "importId": "import-67890",
    "status": "PROCESSING", 
    "totalRows": 145,
    "processedRows": 0,
    "successfulRows": 0,
    "failedRows": 0,
    "estimatedCompletion": "2024-01-20T18:03:00Z",
    "startedAt": "2024-01-20T18:00:30Z",
    "startedBy": "admin-user-456",
    "programId": "ING-SIS"
  }
}
```

**Response Error (409)**:

```json
{
  "statusCode": 409,
  "message": "Ya existe una importación activa para este usuario",
  "error": "Conflict",
  "activeImportId": "import-54321"
}
```

---

### GET /resource-import/:importId/status

**Consultar estado de importación**

Obtiene el estado actual y progreso de una importación en proceso o completada.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: Todos los roles autenticados
- 🛡️ Solo el usuario que inició la importación puede consultarla
- 🚀 Rate limiting: 30 req/min

**Parameters**:

- `importId` (path, required): ID de la importación

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "importId": "import-67890",
    "status": "PROCESSING",
    "progress": {
      "totalRows": 145,
      "processedRows": 87,
      "successfulRows": 82,
      "failedRows": 5,
      "percentageComplete": 60.0,
      "currentRow": 88,
      "estimatedTimeRemaining": "1 minuto 30 segundos"
    },
    "statistics": {
      "resourcesCreated": 82,
      "categoriesAssigned": 164,
      "availabilitySchedulesCreated": 82,
      "maintenanceSchedulesCreated": 41
    },
    "recentErrors": [
      {
        "row": 34,
        "error": "Capacidad inválida: 'muchas personas' no es un número",
        "timestamp": "2024-01-20T18:02:15Z"
      },
      {
        "row": 56,
        "error": "Programa académico 'MEDICINA' no encontrado",
        "timestamp": "2024-01-20T18:02:45Z"
      }
    ],
    "startedAt": "2024-01-20T18:00:30Z",
    "lastUpdated": "2024-01-20T18:02:50Z"
  }
}
```

### GET /resource-import/my-imports

**Obtener mis importaciones**

Lista todas las importaciones realizadas por el usuario actual con opciones de filtrado y paginación.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN
- 🚀 Rate limiting: 20 req/min

**Query Parameters**:

- `status` (optional): Filtrar por estado (PROCESSING, COMPLETED, FAILED, CANCELLED)
- `programId` (optional): Filtrar por programa académico
- `startDate` (optional): Fecha inicio (ISO 8601)
- `endDate` (optional): Fecha fin (ISO 8601)
- `page` (optional): Número de página (default: 1)
- `limit` (optional): Elementos por página (default: 10, max: 50)

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "imports": [
      {
        "importId": "import-67890",
        "status": "COMPLETED",
        "totalRows": 145,
        "successfulRows": 140,
        "failedRows": 5,
        "programId": "ING-SIS",
        "programName": "Ingeniería de Sistemas",
        "startedAt": "2024-01-20T18:00:30Z",
        "completedAt": "2024-01-20T18:03:45Z",
        "notes": "Importación masiva de laboratorios - Semestre 2024-1"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 28,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### GET /resource-import/statistics

**Estadísticas de importación**

Proporciona métricas y estadísticas sobre las importaciones realizadas en el sistema.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN, COORDINATOR
- 🛡️ PROGRAM_ADMIN solo ven estadísticas de su programa
- 🚀 Rate limiting: 10 req/min

**Query Parameters**:

- `programId` (optional): Filtrar por programa académico
- `period` (optional): Período de análisis (7d, 30d, 90d, 1y, all)

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalImports": 156,
      "successfulImports": 142,
      "failedImports": 14,
      "successRate": 91.0,
      "totalResourcesImported": 8240,
      "averageRowsPerImport": 52.8
    },
    "timeSeriesData": [
      {
        "date": "2024-01-15",
        "imports": 12,
        "resourcesImported": 634,
        "successRate": 94.2
      }
    ],
    "topErrors": [
      {
        "error": "Capacidad debe ser número positivo",
        "occurrences": 45,
        "percentage": 23.4
      }
    ],
    "generatedAt": "2024-01-20T18:30:00Z",
    "period": "30d"
  }
}
```

---

## 🔧 Gestión de Tipos de Mantenimiento

Los endpoints de `/maintenance-types` permiten gestionar los diferentes tipos de mantenimiento que pueden aplicarse a los recursos físicos, proporcionando flexibilidad para crear tipos personalizados además de los predefinidos del sistema.

### GET /maintenance-types

**Obtener todos los tipos de mantenimiento**

Retorna una lista paginada de todos los tipos de mantenimiento disponibles, incluyendo tanto los predefinidos como los personalizados.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: Todos los roles autenticados
- 🚀 Rate limiting: 50 req/min

**Query Parameters**:

- `page` (optional): Número de página (default: 1)
- `limit` (optional): Elementos por página (default: 10, max: 100)
- `active` (optional): Filtrar por tipos activos (true/false)
- `category` (optional): Filtrar por categoría (PREVENTIVO, CORRECTIVO, EMERGENCIA, etc.)
- `search` (optional): Buscar por nombre o descripción

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "maintenanceTypes": [
      {
        "id": "mtype-001",
        "name": "Mantenimiento Preventivo",
        "code": "PREVENTIVO",
        "category": "PREVENTIVO",
        "description": "Mantenimiento programado para prevenir fallas",
        "color": "#10B981",
        "isDefault": true,
        "isActive": true,
        "estimatedDuration": 120,
        "requiredSkills": ["TECNICO_GENERAL", "LIMPIEZA"],
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      },
      {
        "id": "mtype-002", 
        "name": "Mantenimiento Correctivo",
        "code": "CORRECTIVO",
        "category": "CORRECTIVO",
        "description": "Reparación de fallas detectadas",
        "color": "#F59E0B",
        "isDefault": true,
        "isActive": true,
        "estimatedDuration": 180,
        "requiredSkills": ["TECNICO_ESPECIALIZADO", "ELECTRONICO"],
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      },
      {
        "id": "mtype-003",
        "name": "Limpieza Profunda Laboratorios",
        "code": "CLEAN_LAB_DEEP",
        "category": "LIMPIEZA",
        "description": "Limpieza especializada para equipos de laboratorio",
        "color": "#3B82F6",
        "isDefault": false,
        "isActive": true,
        "estimatedDuration": 240,
        "requiredSkills": ["LIMPIEZA_ESPECIALIZADA", "MANEJO_QUIMICOS"],
        "createdAt": "2024-01-18T14:30:00Z",
        "updatedAt": "2024-01-18T14:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 12,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### POST /maintenance-types

**Crear nuevo tipo de mantenimiento (RF-06)**

Permite crear tipos de mantenimiento personalizados para necesidades específicas de la institución.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN
- 📝 Auditoría completa de creación
- 🔒 Rate limiting: 10 creaciones por hora

**Request Body**:

```json
{
  "name": "Calibración de Equipos Médicos",
  "code": "CALIB_MED",
  "category": "CALIBRACION",
  "description": "Calibración especializada para equipos médicos y de laboratorio clínico",
  "color": "#8B5CF6",
  "estimatedDuration": 300,
  "requiredSkills": ["BIOMEDICO", "CALIBRACION_ESPECIALIZADA"],
  "instructions": "Seguir protocolo ISO 13485 para equipos médicos",
  "materials": ["Kit calibración", "Certificados trazabilidad"],
  "frequency": {
    "type": "PERIODIC",
    "intervalDays": 365
  }
}
```

**Response Success (201)**:

```json
{
  "success": true,
  "message": "Tipo de mantenimiento creado exitosamente",
  "data": {
    "id": "mtype-012",
    "name": "Calibración de Equipos Médicos",
    "code": "CALIB_MED",
    "category": "CALIBRACION",
    "description": "Calibración especializada para equipos médicos y de laboratorio clínico",
    "color": "#8B5CF6",
    "isDefault": false,
    "isActive": true,
    "estimatedDuration": 300,
    "requiredSkills": ["BIOMEDICO", "CALIBRACION_ESPECIALIZADA"],
    "instructions": "Seguir protocolo ISO 13485 para equipos médicos",
    "materials": ["Kit calibración", "Certificados trazabilidad"],
    "frequency": {
      "type": "PERIODIC",
      "intervalDays": 365
    },
    "createdAt": "2024-01-20T19:00:00Z",
    "createdBy": "admin-user-456"
  }
}
```

**Response Error (409)**:

```json
{
  "statusCode": 409,
  "message": "Ya existe un tipo de mantenimiento con el código 'CALIB_MED'",
  "error": "Conflict"
}
```

---

### GET /maintenance-types/:id

**Obtener tipo de mantenimiento específico**

Retorna los detalles completos de un tipo de mantenimiento específico.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: Todos los roles autenticados
- 🚀 Rate limiting: 100 req/min

**Parameters**:

- `id` (path, required): ID del tipo de mantenimiento

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "id": "mtype-001",
    "name": "Mantenimiento Preventivo",
    "code": "PREVENTIVO",
    "category": "PREVENTIVO",
    "description": "Mantenimiento programado para prevenir fallas",
    "color": "#10B981",
    "isDefault": true,
    "isActive": true,
    "estimatedDuration": 120,
    "requiredSkills": ["TECNICO_GENERAL", "LIMPIEZA"],
    "instructions": "Revisar todos los componentes según checklist estándar",
    "materials": ["Lubricantes", "Herramientas básicas", "Productos limpieza"],
    "frequency": {
      "type": "PERIODIC", 
      "intervalDays": 90
    },
    "usageStatistics": {
      "totalScheduled": 245,
      "completed": 231,
      "pending": 14,
      "averageDuration": 118,
      "lastUsed": "2024-01-19T16:30:00Z"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### PUT /maintenance-types/:id

**Actualizar tipo de mantenimiento**

Permite modificar los detalles de un tipo de mantenimiento existente.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN
- 🛡️ Tipos predefinidos solo pueden ser modificados por ADMIN
- 📝 Auditoría completa de modificación
- 🔒 Rate limiting: 20 actualizaciones por hora

**Parameters**:

- `id` (path, required): ID del tipo de mantenimiento

**Request Body**:

```json
{
  "name": "Mantenimiento Preventivo Mejorado",
  "description": "Mantenimiento preventivo con inspección detallada de componentes críticos",
  "color": "#059669",
  "estimatedDuration": 150,
  "requiredSkills": ["TECNICO_GENERAL", "LIMPIEZA", "INSPECCION_DETALLADA"],
  "instructions": "Revisar componentes según checklist actualizado v2.1",
  "materials": ["Lubricantes premium", "Herramientas especializadas", "Kit limpieza avanzado"]
}
```

**Response Success (200)**:

```json
{
  "success": true,
  "message": "Tipo de mantenimiento actualizado exitosamente",
  "data": {
    "id": "mtype-001",
    "name": "Mantenimiento Preventivo Mejorado",
    "code": "PREVENTIVO",
    "category": "PREVENTIVO",
    "description": "Mantenimiento preventivo con inspección detallada de componentes críticos",
    "color": "#059669",
    "isDefault": true,
    "isActive": true,
    "estimatedDuration": 150,
    "requiredSkills": ["TECNICO_GENERAL", "LIMPIEZA", "INSPECCION_DETALLADA"],
    "instructions": "Revisar componentes según checklist actualizado v2.1",
    "materials": ["Lubricantes premium", "Herramientas especializadas", "Kit limpieza avanzado"],
    "updatedAt": "2024-01-20T19:15:00Z",
    "updatedBy": "admin-user-456"
  }
}
```

---

### DELETE /maintenance-types/:id

**Desactivar tipo de mantenimiento**

Desactiva un tipo de mantenimiento (soft delete). Los tipos predefinidos no pueden ser eliminados.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN
- 📝 Auditoría completa de desactivación
- 🔒 Rate limiting: 10 desactivaciones por hora
- 🚫 No permite eliminar tipos predefinidos o con mantenimientos activos

**Parameters**:

- `id` (path, required): ID del tipo de mantenimiento

**Response Success (200)**:

```json
{
  "success": true,
  "message": "Tipo de mantenimiento desactivado exitosamente",
  "data": {
    "id": "mtype-012",
    "name": "Calibración de Equipos Médicos",
    "code": "CALIB_MED",
    "isActive": false,
    "deactivatedAt": "2024-01-20T19:30:00Z",
    "deactivatedBy": "admin-user-456"
  }
}
```

**Response Error (409)**:

```json
{
  "statusCode": 409,
  "message": "No se puede desactivar: existen 5 mantenimientos activos de este tipo",
  "error": "Conflict",
  "details": {
    "activeMaintenances": 5,
    "suggestedAction": "Complete o cancele los mantenimientos activos antes de desactivar"
  }
}
```

---

### GET /maintenance-types/defaults

**Obtener tipos de mantenimiento predefinidos**

Retorna solo los tipos de mantenimiento predefinidos del sistema que no pueden ser eliminados.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: Todos los roles autenticados
- 🚀 Rate limiting: 30 req/min

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "defaultTypes": [
      {
        "id": "mtype-001",
        "name": "Mantenimiento Preventivo",
        "code": "PREVENTIVO",
        "category": "PREVENTIVO",
        "description": "Mantenimiento programado para prevenir fallas",
        "color": "#10B981",
        "isDefault": true,
        "isActive": true
      },
      {
        "id": "mtype-002",
        "name": "Mantenimiento Correctivo", 
        "code": "CORRECTIVO",
        "category": "CORRECTIVO",
        "description": "Reparación de fallas detectadas",
        "color": "#F59E0B",
        "isDefault": true,
        "isActive": true
      },
      {
        "id": "mtype-003",
        "name": "Mantenimiento de Emergencia",
        "code": "EMERGENCIA",
        "category": "EMERGENCIA", 
        "description": "Reparación urgente de fallas críticas",
        "color": "#EF4444",
        "isDefault": true,
        "isActive": true
      },
      {
        "id": "mtype-004",
        "name": "Limpieza General",
        "code": "LIMPIEZA",
        "category": "LIMPIEZA",
        "description": "Limpieza y sanitización de recursos",
        "color": "#6366F1",
        "isDefault": true,
        "isActive": true
      }
    ],
    "totalDefaults": 4
  }
}
```

---

### POST /maintenance-types/:id/activate

**Reactivar tipo de mantenimiento desactivado**

Permite reactivar un tipo de mantenimiento que había sido desactivado previamente.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN
- 📝 Auditoría completa de reactivación
- 🔒 Rate limiting: 10 reactivaciones por hora

**Parameters**:

- `id` (path, required): ID del tipo de mantenimiento

**Response Success (200)**:

```json
{
  "success": true,
  "message": "Tipo de mantenimiento reactivado exitosamente",
  "data": {
    "id": "mtype-012",
    "name": "Calibración de Equipos Médicos",
    "code": "CALIB_MED",
    "isActive": true,
    "reactivatedAt": "2024-01-20T19:45:00Z",
    "reactivatedBy": "admin-user-456"
  }
}
```

---

### POST /maintenance-types/validate

**Validar datos de tipo de mantenimiento**

Valida los datos de un tipo de mantenimiento sin crearlo, útil para validación en formularios.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN
- 🚀 Rate limiting: 50 validaciones por minuto

**Request Body**:

```json
{
  "name": "Mantenimiento Especializado",
  "code": "MANT_ESP",
  "category": "ESPECIALIZADO",
  "estimatedDuration": 480,
  "requiredSkills": ["TECNICO_SENIOR", "CERTIFICACION_ESPECIAL"]
}
```

**Response Success (200)**:

```json
{
  "success": true,
  "message": "Datos válidos para crear tipo de mantenimiento",
  "data": {
    "isValid": true,
    "warnings": [
      {
        "field": "estimatedDuration",
        "message": "Duración de 8 horas es superior al promedio (3 horas)",
        "severity": "low"
      }
    ],
    "suggestions": {
      "color": "#9333EA",
      "frequency": {
        "type": "ON_DEMAND",
        "reason": "Categoría ESPECIALIZADO típicamente se ejecuta bajo demanda"
      }
    }
  }
}
```

**Response Error (400)**:

```json
{
  "statusCode": 400,
  "message": "Datos inválidos para tipo de mantenimiento",
  "error": "Bad Request",
  "data": {
    "isValid": false,
    "errors": [
      {
        "field": "code",
        "message": "El código 'MANT_ESP' ya está en uso",
        "severity": "high"
      },
      {
        "field": "requiredSkills",
        "message": "Skill 'CERTIFICACION_ESPECIAL' no existe en el sistema",
        "severity": "medium"
      }
    ]
  }
}
```

---

## 🎓 Gestión de Programas Académicos

Los endpoints de `/programs` permiten gestionar los programas académicos de la institución, proporcionando clasificación y organización de recursos por área de estudio.

### GET /programs

**Obtener todos los programas académicos**

Retorna una lista paginada de todos los programas académicos disponibles en la institución.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: Todos los roles autenticados
- 🚀 Rate limiting: 50 req/min

**Query Parameters**:

- `page` (optional): Número de página (default: 1)
- `limit` (optional): Elementos por página (default: 10, max: 100)
- `active` (optional): Filtrar por programas activos (true/false)
- `faculty` (optional): Filtrar por facultad
- `search` (optional): Buscar por nombre o código

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "programs": [
      {
        "id": "prog-001",
        "name": "Ingeniería de Sistemas",
        "code": "ING-SIS",
        "faculty": "Ingeniería",
        "description": "Programa de Ingeniería de Sistemas y Computación",
        "isActive": true,
        "resourceCount": 45,
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      },
      {
        "id": "prog-002", 
        "name": "Ingeniería Industrial",
        "code": "ING-IND",
        "faculty": "Ingeniería",
        "description": "Programa de Ingeniería Industrial",
        "isActive": true,
        "resourceCount": 32,
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### POST /programs

**Crear nuevo programa académico (RF-02)**

Permite crear programas académicos para organizar y clasificar recursos.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN
- 📝 Auditoría completa de creación
- 🔒 Rate limiting: 5 creaciones por hora

**Request Body**:

```json
{
  "name": "Medicina",
  "code": "MED",
  "faculty": "Ciencias de la Salud",
  "description": "Programa de Medicina General",
  "contactEmail": "medicina@ufps.edu.co",
  "coordinator": "Dr. Juan Pérez"
}
```

**Response Success (201)**:

```json
{
  "success": true,
  "message": "Programa académico creado exitosamente",
  "data": {
    "id": "prog-026",
    "name": "Medicina",
    "code": "MED",
    "faculty": "Ciencias de la Salud",
    "description": "Programa de Medicina General",
    "contactEmail": "medicina@ufps.edu.co",
    "coordinator": "Dr. Juan Pérez",
    "isActive": true,
    "resourceCount": 0,
    "createdAt": "2024-01-20T20:00:00Z",
    "createdBy": "admin-user-456"
  }
}
```

---

### GET /programs/active

**Obtener solo programas activos**

Retorna únicamente los programas académicos que están activos, útil para formularios y selecciones.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: Todos los roles autenticados
- 🚀 Rate limiting: 100 req/min

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "activePrograms": [
      {
        "id": "prog-001",
        "name": "Ingeniería de Sistemas",
        "code": "ING-SIS",
        "faculty": "Ingeniería"
      },
      {
        "id": "prog-002",
        "name": "Ingeniería Industrial",
        "code": "ING-IND",
        "faculty": "Ingeniería"
      }
    ],
    "totalActive": 24
  }
}
```

---

## 👤 Gestión de Responsables de Recursos

Los endpoints de `/resource-responsibles` permiten gestionar la asignación de usuarios responsables para recursos específicos, proporcionando control y seguimiento de la administración de recursos.

### GET /resource-responsibles/:resourceId

**Obtener responsables de un recurso**

Retorna todos los usuarios asignados como responsables de un recurso específico.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: Todos los roles autenticados
- 🚀 Rate limiting: 50 req/min

**Parameters**:

- `resourceId` (path, required): ID del recurso

**Query Parameters**:

- `active` (optional): Filtrar por responsables activos (true/false)
- `page` (optional): Número de página (default: 1)
- `limit` (optional): Elementos por página (default: 10, max: 50)

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "resourceId": "resource-123",
    "resourceName": "Laboratorio de Sistemas A",
    "responsibles": [
      {
        "id": "resp-001",
        "userId": "user-456",
        "userName": "Prof. Ana Martínez",
        "userEmail": "ana.martinez@ufps.edu.co",
        "role": "PRIMARY_RESPONSIBLE",
        "isActive": true,
        "assignedAt": "2024-01-15T10:30:00Z",
        "assignedBy": "admin-user-789",
        "responsibilities": ["MAINTENANCE_APPROVAL", "BOOKING_APPROVAL", "DAMAGE_REPORTS"]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### POST /resource-responsibles/:resourceId/assign

**Asignar responsable a un recurso (RF-06)**

Asigna un usuario como responsable de un recurso específico con roles y responsabilidades definidas.

**Security Restrictions**:

- 🔐 Requiere autenticación JWT
- 👥 Roles permitidos: ADMIN, PROGRAM_ADMIN
- 🛡️ PROGRAM_ADMIN solo pueden asignar responsables para recursos de su programa
- 📝 Auditoría completa de asignación
- 🔒 Rate limiting: 20 asignaciones por hora

**Parameters**:

- `resourceId` (path, required): ID del recurso

**Request Body**:

```json
{
  "userId": "user-789",
  "role": "PRIMARY_RESPONSIBLE",
  "responsibilities": ["MAINTENANCE_APPROVAL", "BOOKING_APPROVAL", "DAMAGE_REPORTS"],
  "notes": "Asignación como responsable principal del laboratorio"
}
```

**Response Success (201)**:

```json
{
  "success": true,
  "message": "Responsable asignado exitosamente al recurso",
  "data": {
    "id": "resp-003",
    "resourceId": "resource-123",
    "resourceName": "Laboratorio de Sistemas A",
    "userId": "user-789",
    "userName": "Prof. Luis Rodríguez",
    "userEmail": "luis.rodriguez@ufps.edu.co",
    "role": "PRIMARY_RESPONSIBLE",
    "responsibilities": ["MAINTENANCE_APPROVAL", "BOOKING_APPROVAL", "DAMAGE_REPORTS"],
    "isActive": true,
    "assignedAt": "2024-01-20T21:00:00Z",
    "assignedBy": "admin-user-456"
  }
}
```
---

## Manejo de Errores

El Resources Service maneja errores de manera consistente con códigos HTTP estándar y respuestas estructuradas en formato JSON.

### Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| **200** | OK | Operación exitosa |
| **201** | Created | Recurso creado exitosamente |
| **400** | Bad Request | Datos de entrada inválidos o malformados |
| **401** | Unauthorized | Token JWT inválido o expirado |
| **403** | Forbidden | Usuario sin permisos para la operación |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | Conflicto con el estado actual (ej: código duplicado) |
| **422** | Unprocessable Entity | Datos válidos pero lógicamente incorrectos |
| **429** | Too Many Requests | Rate limit excedido |
| **500** | Internal Server Error | Error interno del servidor |

### Formato de Respuesta de Error

```json
{
  "success": false,
  "error": {
    "code": "RSRC-0404",
    "message": "El recurso solicitado no existe o ha sido eliminado",
    "type": "error",
    "exception_code": "R-20",
    "http_code": 404,
    "http_exception": "NotFoundException",
    "timestamp": "2024-01-20T21:00:00Z",
    "path": "/resources/invalid-id",
    "details": {
      "resourceId": "invalid-id",
      "field": "id", 
      "reason": "Resource not found in database"
    }
  }
}
```

### Códigos de Error Específicos

#### Gestión de Recursos (RSRC)
- **RSRC-0400**: Datos de entrada inválidos
- **RSRC-0401**: Token JWT requerido
- **RSRC-0403**: Permisos insuficientes
- **RSRC-0404**: Recurso no encontrado
- **RSRC-0409**: Código de recurso duplicado
- **RSRC-0422**: Capacidad inválida o datos inconsistentes

#### Importación Masiva (IMPT)
- **IMPT-0400**: Archivo CSV inválido o malformado
- **IMPT-0413**: Archivo excede el tamaño máximo permitido
- **IMPT-0422**: Datos en filas específicas son inválidos
- **IMPT-0429**: Límite de importaciones por hora excedido

#### Mantenimiento (MNTC)
- **MNTC-0404**: Tipo de mantenimiento no encontrado
- **MNTC-0409**: Tipo de mantenimiento con código duplicado
- **MNTC-0422**: No se puede eliminar tipo de mantenimiento por defecto

---

## Restricciones de Dominio

### Reglas de Negocio Aplicadas

#### Recursos
- Los códigos de recursos deben ser únicos en todo el sistema
- La capacidad debe ser un número entero positivo mayor a 0
- Los recursos eliminados (soft delete) no aparecen en consultas estándar
- Solo usuarios con permisos pueden modificar recursos de otros programas

#### Categorías
- Las categorías por defecto (Salón, Laboratorio, Auditorio, Equipo Multimedia) no pueden eliminarse
- Una categoría debe tener al menos un recurso asociado para mantenerse activa
- Los códigos de categoría siguen el formato: TIPO-XXX (ej: SALA-001)

#### Importación
- Archivos CSV máximo 5MB y 1000 filas por importación
- Formato requerido: name,code,description,type,capacity,location
- Validación de duplicados antes de confirmación final
- Máximo 5 importaciones por usuario por hora

#### Mantenimiento
- Tipos de mantenimiento por defecto no pueden ser eliminados
- Solo ADMIN puede crear nuevos tipos de mantenimiento
- Códigos únicos por tipo: PREVENTIVO, CORRECTIVO, EMERGENCIA, LIMPIEZA

---

## Seguridad y Observabilidad

### Logging y Auditoría

Todas las operaciones críticas son registradas con los siguientes niveles:

#### INFO Level
- Consultas exitosas de recursos
- Importaciones completadas
- Asignaciones de responsables

#### WARN Level  
- Intentos de acceso a recursos sin permisos
- Rate limits excedidos
- Validaciones fallidas en importación

#### ERROR Level
- Errores de base de datos
- Fallos de autenticación
- Excepciones no controladas

### Métricas y Observabilidad

#### OpenTelemetry Traces
- Tiempo de respuesta por endpoint
- Latencia de consultas a base de datos
- Performance de importaciones masivas

#### Sentry Error Tracking
- Errores críticos con contexto completo
- Alertas automáticas para errores de producción
- Stack traces y datos de usuario anónimos

### Rate Limiting Detallado

| Endpoint | Límite | Ventana | Rol |
|----------|--------|---------|-----|
| GET /resources | 100 req | 1 min | Todos |
| POST /resources | 20 req | 1 min | ADMIN+ |
| PUT /resources | 20 req | 1 min | ADMIN+ |
| DELETE /resources | 10 req | 1 min | ADMIN |
| POST /resource-import | 5 req | 1 hora | ADMIN+ |
| POST /resource-categories | 30 req | 1 min | ADMIN+ |
| POST /maintenance-types | 10 req | 1 min | ADMIN |

---

## Variables de Entorno para Postman

### Configuración Base

```json
{
  "id": "bookly-resources-service-env",
  "name": "Bookly Resources Service",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3003",
      "description": "URL base del Resources Service"
    },
    {
      "key": "authToken",
      "value": "{{jwt_token}}",
      "description": "Token JWT para autenticación"
    },
    {
      "key": "apiVersion",
      "value": "v1",
      "description": "Versión de la API"
    }
  ]
}
```

### Variables de Testing

```json
{
  "testVariables": [
    {
      "key": "testResourceId",
      "value": "resource-test-001",
      "description": "ID de recurso para pruebas"
    },
    {
      "key": "testCategoryId", 
      "value": "category-test-001",
      "description": "ID de categoría para pruebas"
    },
    {
      "key": "testUserId",
      "value": "user-test-001",
      "description": "ID de usuario para pruebas"
    },
    {
      "key": "testProgramId",
      "value": "program-test-001", 
      "description": "ID de programa académico para pruebas"
    },
    {
      "key": "testMaintenanceTypeId",
      "value": "maintenance-test-001",
      "description": "ID de tipo de mantenimiento para pruebas"
    },
    {
      "key": "testDate",
      "value": "{{$timestamp}}",
      "description": "Timestamp actual para pruebas"
    }
  ]
}
```

### Variables por Área Funcional

#### Recursos
```json
{
  "resourcesVariables": [
    {
      "key": "resourceName",
      "value": "Sala de Prueba {{$randomInt}}",
      "description": "Nombre de recurso aleatorio"
    },
    {
      "key": "resourceCode", 
      "value": "TEST-{{$randomInt}}",
      "description": "Código de recurso aleatorio"
    },
    {
      "key": "resourceCapacity",
      "value": "{{$randomInt(10,100)}}",
      "description": "Capacidad aleatoria entre 10 y 100"
    }
  ]
}
```

#### Importación
```json
{
  "importVariables": [
    {
      "key": "csvFilePath",
      "value": "/path/to/test-resources.csv",
      "description": "Ruta del archivo CSV de prueba"
    },
    {
      "key": "importId",
      "value": "",
      "description": "ID de importación (se establece dinámicamente)"
    }
  ]
}
```

### Pre-request Scripts

#### Autenticación Automática
```javascript
// Pre-request script para obtener token JWT automáticamente
pm.sendRequest({
    url: pm.variables.get("authBaseUrl") + "/auth/login",
    method: 'POST',
    header: {
        'Content-Type': 'application/json',
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            email: pm.variables.get("testUserEmail"),
            password: pm.variables.get("testUserPassword")
        })
    }
}, function (err, response) {
    if (err) {
        console.log('Error al obtener token:', err);
    } else {
        const jsonData = response.json();
        if (jsonData.success && jsonData.data.token) {
            pm.variables.set("authToken", jsonData.data.token);
            console.log('Token JWT actualizado');
        }
    }
});
```

#### Generación de Datos de Prueba
```javascript
// Generar datos aleatorios para pruebas
pm.variables.set("randomResourceName", "Recurso Test " + Math.floor(Math.random() * 1000));
pm.variables.set("randomResourceCode", "TST-" + Math.floor(Math.random() * 10000));
pm.variables.set("randomCapacity", Math.floor(Math.random() * 91) + 10); // 10-100
pm.variables.set("currentTimestamp", new Date().toISOString());
```

### Tests Automáticos

#### Test Base para Respuestas Exitosas
```javascript
// Test común para respuestas exitosas
pm.test("Status code es exitoso", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Respuesta tiene estructura correcta", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData).to.have.property('data');
});

pm.test("Tiempo de respuesta es aceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});
```

#### Test para Errores
```javascript
// Test para manejo de errores 
pm.test("Error response tiene estructura correcta", function () {
    if (pm.response.code >= 400) {
        const jsonData = pm.response.json();
        pm.expect(jsonData).to.have.property('success');
        pm.expect(jsonData.success).to.be.false;
        pm.expect(jsonData).to.have.property('error');
        pm.expect(jsonData.error).to.have.property('code');
        pm.expect(jsonData.error).to.have.property('message');
        pm.expect(jsonData.error).to.have.property('http_code');
    }
});
```

#### Test para Operaciones CRUD  
```javascript
// Test específico para creación de recursos
pm.test("Recurso creado exitosamente", function () {
    if (pm.response.code === 201) {
        const jsonData = pm.response.json();
        pm.expect(jsonData.data).to.have.property('id');
        pm.expect(jsonData.data).to.have.property('name');
        pm.expect(jsonData.data).to.have.property('code');
        
        // Guardar ID para pruebas posteriores
        pm.variables.set("createdResourceId", jsonData.data.id);
    }
});
```
