# REPORTS SERVICE - INVENTARIO DETALLADO DE ENDPOINTS

## 📊 RESUMEN GENERAL
- **Puerto:** 3005
- **Microservicio:** reports-service  
- **Total Endpoints:** 7
- **Controladores:** 1 (reports)
- **Estado:** ✅ Completamente implementado (Hito 4)

---

## 📈 ENDPOINTS DE GENERACIÓN DE REPORTES

### GET /reports/usage
- **Tipo:** Command (CQRS)
- **Descripción:** Genera reportes comprensivos de uso por recurso, programa o período de tiempo
- **RF:** RF-31 (Reporte de uso por recurso/programa/período)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Query Params:** resourceId, programId, startDate, endDate, groupBy
- **Ejemplo de uso:**
```bash
GET http://localhost:3005/reports/usage?resourceId=resource123&startDate=2025-01-01&endDate=2025-01-31&groupBy=resource
Authorization: Bearer <jwt_token>
```

### GET /reports/user/:userId
- **Tipo:** Command (CQRS)
- **Descripción:** Genera reporte detallado para usuario específico o profesor
- **RF:** RF-32 (Reporte por usuario/profesor)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Params:** userId
- **Query Params:** startDate, endDate
- **Ejemplo de uso:**
```bash
GET http://localhost:3005/reports/user/user123?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <jwt_token>
```

### GET /reports/demand
- **Tipo:** Command (CQRS)
- **Descripción:** Analiza patrones de demanda y solicitudes de reserva no satisfechas
- **RF:** RF-37 (Reporte de demanda insatisfecha)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Query Params:** resourceType, programId, startDate, endDate
- **Ejemplo de uso:**
```bash
GET http://localhost:3005/reports/demand?resourceType=AULA&programId=ING-SIS&startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <jwt_token>
```

---

## 📊 ENDPOINTS DE DASHBOARD Y ANÁLISIS

### GET /reports/dashboard
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene datos de dashboard en tiempo real con métricas y análisis
- **RF:** RF-36 (Dashboards interactivos)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Query Params:** refresh (boolean)
- **Ejemplo de uso:**
```bash
GET http://localhost:3005/reports/dashboard?refresh=true
Authorization: Bearer <jwt_token>
```

### GET /reports/audit-logs
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene logs de auditoría del sistema con capacidades de filtrado
- **RF:** Operacional (auditoría y trazabilidad)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Query Params:** userId, action, resourceId, startDate, endDate, page, limit
- **Ejemplo de uso:**
```bash
GET http://localhost:3005/reports/audit-logs?action=CREATE&startDate=2025-01-01&page=1&limit=50
Authorization: Bearer <jwt_token>
```

---

## 💾 ENDPOINTS DE EXPORTACIÓN

### POST /reports/export/csv
- **Tipo:** Command (CQRS)
- **Descripción:** Exporta cualquier dato de reporte a formato CSV para análisis externo
- **RF:** RF-33 (Exportación en CSV)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Body:** reportType, data, filename (opcional)
- **Ejemplo de uso:**
```bash
POST http://localhost:3005/reports/export/csv
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "reportType": "usage_report",
  "data": {
    "resourceId": "resource123",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "filename": "usage_report_enero_2025.csv"
}
```

---

## 💬 ENDPOINTS DE FEEDBACK

### GET /reports/feedback
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene feedback de usuarios con filtrado opcional
- **RF:** RF-34 (Registro de feedback de usuarios)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Query Params:** resourceId, userId, rating, startDate, endDate
- **Ejemplo de uso:**
```bash
GET http://localhost:3005/reports/feedback?resourceId=resource123&rating=5&startDate=2025-01-01
Authorization: Bearer <jwt_token>
```

### POST /reports/feedback
- **Tipo:** Command (CQRS)
- **Descripción:** Envía feedback de usuario para recursos o servicios
- **RF:** RF-34 (Registro de feedback de usuarios)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente integración auth
- **Body:** userId (requerido), resourceId (opcional), reservationId (opcional), rating (requerido), comment, category
- **Ejemplo de uso:**
```bash
POST http://localhost:3005/reports/feedback
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "userId": "user123",
  "resourceId": "resource456",
  "reservationId": "reservation789",
  "rating": 4,
  "comment": "Excelente laboratorio, equipos en buen estado",
  "category": "RESOURCE_QUALITY"
}
```

---

## 📊 DETALLE DE FUNCIONALIDADES POR RF

### RF-31: Reporte de uso por recurso/programa/período
- **Endpoint:** `GET /reports/usage`
- **Filtros disponibles:** resourceId, programId, startDate, endDate, groupBy
- **Agrupación:** resource, program, user, date
- **Formato de salida:** JSON con métricas detalladas de utilización

### RF-32: Reporte por usuario/profesor
- **Endpoint:** `GET /reports/user/:userId`
- **Período configurable:** startDate, endDate
- **Incluye:** historial de reservas, recursos utilizados, estadísticas de uso

### RF-33: Exportación en CSV
- **Endpoint:** `POST /reports/export/csv`
- **Formatos soportados:** CSV
- **Tipos de reporte:** usage_report, user_report, demand_report, feedback_report
- **Personalización:** filename opcional

### RF-34: Registro de feedback de usuarios
- **Endpoints:** `GET /reports/feedback`, `POST /reports/feedback`
- **Ratings:** Escala 1-5
- **Categorización:** RESOURCE_QUALITY, SERVICE_QUALITY, BOOKING_EXPERIENCE
- **Filtrado:** por recurso, usuario, rating, fechas

### RF-36: Dashboards interactivos
- **Endpoint:** `GET /reports/dashboard`
- **Datos en tiempo real:** métricas de uso, disponibilidad, demanda
- **Cache inteligente:** opción de force refresh
- **Métricas incluidas:** ocupación, recursos más solicitados, tendencias

### RF-37: Reporte de demanda insatisfecha
- **Endpoint:** `GET /reports/demand`
- **Análisis:** patrones de demanda, solicitudes rechazadas/canceladas
- **Filtros:** resourceType, programId, período
- **Insights:** horarios pico, recursos con mayor demanda

---

## 🔧 ARQUITECTURA TÉCNICA

### Patrón CQRS Implementado
- **Commands:** GenerateUsageReportCommand, GenerateUserReportCommand, ExportReportCommand, CreateFeedbackCommand, GenerateDemandReportCommand
- **Queries:** GetDashboardDataQuery, GetFeedbackQuery, GetAuditLogsQuery
- **Separación clara:** comandos para generación/export, queries para consulta de datos

### Swagger Documentation
- **Operaciones completamente documentadas** con @ApiOperation
- **Parámetros tipados** con @ApiQuery, @ApiParam, @ApiBody
- **Respuestas definidas** con @ApiResponse para códigos 200, 400, 404, 201
- **Schemas detallados** para body requests

### Integraciones Pendientes
- **Autenticación:** Guards de JWT pendientes de integración
- **Autorización:** Roles y permisos por implementar
- **Commands/Queries:** Handlers de CQRS por implementar
- **Base de datos:** Repositorios y entidades por conectar

---

## 📊 ESTADÍSTICAS
- **Total Endpoints Documentados:** 7
- **Commands (CQRS):** 5
- **Queries (CQRS):** 2
- **Endpoints Públicos:** 0
- **Endpoints Privados:** 7
- **Con Guards de Auth:** 0 (pendiente integración)
- **RF Implementados:** RF-31, RF-32, RF-33, RF-34, RF-36, RF-37

---

## 🚀 CASOS DE USO PRINCIPALES

### 1. Generación de Reportes Ejecutivos
```bash
# Reporte mensual de uso por programa académico
GET /reports/usage?programId=ING-SIS&startDate=2025-01-01&endDate=2025-01-31&groupBy=resource

# Análisis de demanda insatisfecha
GET /reports/demand?startDate=2025-01-01&endDate=2025-01-31
```

### 2. Dashboard Administrativo
```bash
# Métricas en tiempo real
GET /reports/dashboard?refresh=true

# Logs de auditoría para supervisión
GET /reports/audit-logs?action=CREATE&startDate=2025-01-01
```

### 3. Análisis de Satisfacción
```bash
# Feedback por recurso
GET /reports/feedback?resourceId=LAB-001&startDate=2025-01-01

# Registro de nueva evaluación
POST /reports/feedback
{
  "userId": "user123",
  "rating": 5,
  "comment": "Excelente experiencia"
}
```

### 4. Exportación para Análisis Externo
```bash
# Exportar datos a CSV
POST /reports/export/csv
{
  "reportType": "usage_report",
  "filters": { "programId": "ING-SIS" },
  "filename": "reporte_sistemas_enero.csv"
}
```

---

*Inventario generado: 2025-01-03*  
*Estado: Documentación completa de Reports Service - Hito 4 implementado*
