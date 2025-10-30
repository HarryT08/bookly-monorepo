# BOOKLY API GATEWAY - TESTING ENDPOINTS

Sistema completo de testing para todos los endpoints del API Gateway de Bookly organizados por hitos y flujos de negocio.

## 🏗️ Estructura del Proyecto

```
test-endpoints-api-gateway/
├── hito-1-resources/          # Gestión de Recursos (RF-01 a RF-06)
├── hito-2-availability/       # Disponibilidad y Reservas (RF-07 a RF-19)
├── hito-3-stockpile/         # Aprobaciones y Validaciones (RF-20 a RF-28)
├── hito-4-auth/              # Autenticación y SSO (RF-41 a RF-45)
├── hito-5-reports/           # Reportes y Análisis (RF-31 a RF-37)
├── hito-6-resources-advanced/ # Mejoras Avanzadas de Resources
├── hito-7-notifications/      # Notificaciones Avanzadas
├── hito-8-analytics/         # Analytics Avanzados
├── hito-9-integrations/      # Integraciones Externas
├── hito-10-performance/      # Optimización y Performance
├── shared/                   # Utilidades compartidas
├── Makefile                  # Comandos para ejecutar tests
└── README.md                 # Este archivo
```

## 🎯 Objetivos

- **Probar todos los endpoints** de todos los microservicios
- **Identificar endpoints funcionales** vs pendientes de implementación
- **Detectar discrepancias** entre frontend y backend
- **Validar flujos completos** de negocio
- **Generar reportes** de cobertura y estado

## 🚀 Uso Rápido

```bash
# Ejecutar todos los tests
make test-all

# Ejecutar tests por hito
make test-hito-1     # Resources
make test-hito-2     # Availability
make test-hito-3     # Stockpile
make test-hito-4     # Auth
make test-hito-5     # Reports
make test-hito-6     # Resources Advanced
make test-hito-7     # Notifications
make test-hito-8     # Analytics
make test-hito-9     # Integrations
make test-hito-10    # Performance

# Ejecutar flujo específico
make test-resources-crud
make test-auth-login
make test-reservations-basic

# Ver resultados
make results         # Mostrar todos los resultados
make results-hito-1  # Resultados específicos de un hito
```

## 📊 Estado Actual del Backend

### Microservicios Implementados

- **Auth Service (3001):** 85% funcional - 39 endpoints
- **Resources Service (3003):** 95% funcional - 37 endpoints  
- **Availability Service (3002):** 95% funcional - 42 endpoints
- **Stockpile Service (3004):** 90% funcional - 35 endpoints
- **Reports Service (3005):** 75% funcional - 7 endpoints funcionales

### Usuarios de Prueba

- `admin@ufps.edu.co` / `123456` (Administrador General)
- `admin.sistemas@ufps.edu.co` / `123456` (Administrador de Programa)
- `docente@ufps.edu.co` / `123456` (Docente)
- `estudiante@ufps.edu.co` / `123456` (Estudiante)
- `vigilante@ufps.edu.co` / `123456` (Vigilante)

## 📋 Flujos de Testing por Hito

### Hito 1 - Resources Core

- `crud-resources.js` - Crear, leer, actualizar, eliminar recursos
- `manage-categories.js` - Gestión de categorías de recursos
- `manage-programs.js` - Gestión de programas académicos
- `import-export.js` - Importación/exportación masiva
- `maintenance.js` - Gestión de mantenimiento

### Hito 2 - Availability Core

- `basic-availability.js` - Configuración básica de disponibilidad
- `schedule-management.js` - Gestión de horarios complejos
- `reservations-crud.js` - CRUD de reservas
- `search-availability.js` - Búsqueda de disponibilidad
- `calendar-integration.js` - Integración con calendarios

### Hito 3 - Stockpile Core

- `approval-flows.js` - Flujos de aprobación
- `document-templates.js` - Plantillas de documentos
- `notification-system.js` - Sistema de notificaciones
- `batch-operations.js` - Operaciones masivas

### Hito 4 - Auth Core + SSO

- `basic-auth.js` - Registro, login, logout básico
- `roles-permissions.js` - Gestión de roles y permisos
- `oauth-google.js` - Integración Google Workspace SSO
- `security-features.js` - 2FA, auditoría, bloqueos

### Hito 5 - Reports Core

- `usage-reports.js` - Reportes de uso por recurso/programa
- `user-reports.js` - Reportes por usuario/profesor
- `dashboard-analytics.js` - Dashboards y análisis
- `export-reports.js` - Exportación en múltiples formatos

### Hito 6 - Resources Advanced

- `advanced-search.js` - Búsqueda avanzada de recursos con filtros complejos
- `resource-equivalences.js` - Gestión de equivalencias entre recursos
- `dynamic-pricing.js` - Sistema de precios dinámicos por recurso
- `resource-optimization.js` - Optimización de asignación de recursos
- `maintenance-advanced.js` - Mantenimiento predictivo y automatizado

### Hito 7 - Notifications Advanced

- `real-time-notifications.js` - Sistema de notificaciones en tiempo real
- `email-templates.js` - Plantillas de email personalizables
- `whatsapp-integration.js` - Integración con WhatsApp Business
- `notification-preferences.js` - Preferencias de notificación por usuario
- `escalation-workflows.js` - Flujos de escalamiento automático

### Hito 8 - Analytics Advanced

- `predictive-analytics.js` - Análisis predictivo de demanda
- `business-intelligence.js` - Dashboards de inteligencia de negocio
- `data-visualization.js` - Visualización avanzada de datos
- `kpi-monitoring.js` - Monitoreo de KPIs en tiempo real
- `anomaly-detection.js` - Detección de anomalías en uso

### Hito 9 - External Integrations

- `external-calendars.js` - Integración con Google Calendar y Outlook
- `sso-systems.js` - SSO con LDAP/Active Directory y Google Workspace
- `academic-systems.js` - Integración con SIA y LMS (Moodle/Canvas)
- `payment-gateways.js` - Integración con pasarelas de pago
- `api-external.js` - APIs externas y webhooks

### Hito 10 - Performance & Optimization

- `load-testing.js` - Pruebas de carga y estrés del sistema
- `caching-optimization.js` - Optimización de cache distribuido
- `database-optimization.js` - Optimización de base de datos y queries
- `cdn-integration.js` - Integración con CDN para assets estáticos
- `monitoring-apm.js` - Monitoreo de rendimiento de aplicaciones

## 🔧 Configuración

### Variables de Entorno

```bash
# API Gateway
API_GATEWAY_URL=http://localhost:3000

# Microservicios
AUTH_SERVICE_URL=http://localhost:3001
RESOURCES_SERVICE_URL=http://localhost:3003
AVAILABILITY_SERVICE_URL=http://localhost:3002
STOCKPILE_SERVICE_URL=http://localhost:3004
REPORTS_SERVICE_URL=http://localhost:3005

# Base de datos de testing
TEST_DATABASE_URL=mongodb://localhost:27017/bookly_test

# Variables para Hito 8 - Analytics
CLICKHOUSE_URL=http://localhost:8123
GRAFANA_URL=http://localhost:3030
ANALYTICS_API_KEY=your_analytics_key

# Variables para Hito 9 - Integraciones Externas
GOOGLE_CALENDAR_CLIENT_ID=your_google_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_google_client_secret
LDAP_URL=ldap://localhost:389
LDAP_BIND_DN=cn=admin,dc=ufps,dc=edu,dc=co
SIA_API_URL=https://sia.ufps.edu.co/api
LMS_API_URL=https://lms.ufps.edu.co/api

# Variables para Hito 10 - Performance
REDIS_CLUSTER_URL=redis://localhost:6379
CDN_URL=https://cdn.bookly.ufps.edu.co
LOAD_TEST_USERS=100
PERFORMANCE_THRESHOLD_MS=500
```

### Prerrequisitos

**Básicos:**

1. Docker stack corriendo (`make dev-start` en bookly-backend/infrastructure)
2. Semillas ejecutadas (`make seed` en bookly-backend)
3. Node.js 22+ instalado
4. Dependencias instaladas (`npm install`)

**Para Hitos Avanzados:**
5. ClickHouse configurado (Hito 8 - Analytics)
6. Redis Cluster configurado (Hito 10 - Performance)
7. Credenciales OAuth configuradas (Hito 9 - Integraciones)
8. Certificados SSL válidos (Hito 7, 9 - Notificaciones/SSO)
9. Variables de entorno específicas por hito configuradas

## 📈 Interpretación de Resultados

### Estados de Endpoints

- ✅ **PASS** - Endpoint funcional, respuesta esperada
- ❌ **FAIL** - Endpoint con errores o respuesta inesperada
- ⚠️ **WARN** - Endpoint funcional con advertencias menores
- 🚫 **NOT_IMPLEMENTED** - Endpoint no implementado aún
- ⏸️ **SKIP** - Test omitido por dependencias

### Métricas

- **Coverage** - % de endpoints probados vs total esperado
- **Success Rate** - % de tests exitosos vs total ejecutado
- **Performance** - Tiempo promedio de respuesta por endpoint
- **Reliability** - Consistencia de respuestas entre ejecuciones

## 🎯 Ejemplos de Ejecución

### Flujo Completo de Testing

```bash
# 1. Ejecutar tests básicos (Hitos 1-5)
make test-implemented

# 2. Ejecutar tests avanzados específicos
make test-hito-8-predictive    # Analytics predictivos
make test-hito-9-calendars     # Integración calendarios
make test-hito-10-load         # Pruebas de carga

# 3. Verificar resultados
make results
```

### Testing por Módulos

```bash
# Testing de funcionalidades core
make test-resources-crud test-availability-basic test-stockpile-approval

# Testing de integraciones avanzadas
make test-sso-google test-calendar-sync test-whatsapp

# Testing de rendimiento
make test-load test-cache test-database-optimization
```

## 📊 Roadmap de Implementación

### Fase 1: Core Funcional (Hitos 1-5) ✅

- **Completado:** Recursos, Disponibilidad, Aprobaciones, Auth, Reportes
- **Estado:** Implementado y funcional

### Fase 2: Funcionalidades Avanzadas (Hitos 6-8) 🚧

- **Hito 6:** Mejoras avanzadas de recursos y equivalencias
- **Hito 7:** Sistema de notificaciones en tiempo real
- **Hito 8:** Analytics predictivos y dashboards avanzados

### Fase 3: Integraciones Externas (Hito 9) 📋

- **Calendarios:** Google Calendar, Outlook, sincronización
- **SSO:** LDAP/AD, Google Workspace, multi-tenant
- **Académico:** SIA, LMS, horarios, evaluaciones

### Fase 4: Optimización y Escalabilidad (Hito 10) ⚡

- **Performance:** Pruebas de carga, optimización de cache
- **Base de datos:** Índices, agregaciones, sharding
- **Monitoreo:** APM, métricas, alertas

## 📝 Contribución

### Estructura de Tests

1. **Crear archivo de test:** `hito-X-module/test-name.js`
2. **Seguir patrón estándar:** setup → execution → validation → cleanup
3. **Incluir datos de prueba:** usuarios, recursos, configuraciones
4. **Generar reportes:** resultados en `results/hito-X/`
5. **Actualizar documentación:** README del hito y comandos Makefile

### Estándares de Calidad

- ✅ **Cobertura:** >80% de endpoints por hito
- ✅ **Validación:** Respuestas, códigos HTTP, estructura JSON  
- ✅ **Performance:** Tiempos de respuesta <500ms promedio
- ✅ **Documentación:** README completo por hito
- ✅ **Automatización:** Comandos Makefile estandarizados

---

*Bookly API Gateway Testing Suite - Sistema Completo de Testing para Reservas Institucionales*
