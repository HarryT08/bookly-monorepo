# Hito 5 - Reports Core

## 📊 Resumen

El **Hito 5 - Reports Core** implementa el sistema completo de reportes y análisis del módulo **reports-service** de Bookly. Este conjunto de pruebas valida la generación, exportación y visualización de reportes de uso, usuarios, dashboards analíticos y capacidades de exportación en múltiples formatos.

### Características Principales

- **Reportes de Uso**: Análisis de utilización de recursos por período, programa académico y tipo
- **Reportes de Usuarios**: Comportamiento individual, segmentación y feedback de usuarios
- **Dashboard Analytics**: Métricas en tiempo real y dashboards ejecutivos/operacionales
- **Exportación Avanzada**: Múltiples formatos (CSV, Excel, PDF) con reportes programados

## 🎯 Objetivos

### Objetivos Primarios
- [x] Validar generación de reportes de uso y utilización de recursos
- [x] Probar reportes por usuario y análisis de comportamiento
- [x] Verificar funcionalidad de dashboards y analytics en tiempo real
- [x] Testear capacidades de exportación en múltiples formatos

### Objetivos Secundarios
- [x] Verificar integridad de datos en reportes
- [x] Validar rendimiento de consultas analíticas
- [x] Probar configuración de reportes programados
- [x] Testear personalización de dashboards

## 🔄 Flujos de Pruebas

### 1. Usage Reports (`usage-reports.js`)
**Reportes de uso y utilización de recursos**

#### Test Cases:
- **URU-001**: Reporte de uso por recurso
- **URU-002**: Métricas de utilización general
- **URU-003**: Análisis de ocupación por períodos
- **URU-004**: Reportes basados en tiempo
- **URU-005**: Capacidades de exportación

### 2. User Reports (`user-reports.js`)
**Reportes y análisis de usuarios**

#### Test Cases:
- **URE-001**: Reporte individual de usuario
- **URE-002**: Análisis de comportamiento de usuarios
- **URE-003**: Segmentación de usuarios
- **URE-004**: Reportes de feedback y satisfacción

### 3. Dashboard Analytics (`dashboard-analytics.js`)
**Dashboards y métricas analíticas**

#### Test Cases:
- **DAN-001**: Dashboard ejecutivo
- **DAN-002**: Dashboard operacional
- **DAN-003**: Métricas en tiempo real
- **DAN-004**: Dashboards personalizados

### 4. Export Reports (`export-reports.js`)
**Exportación y generación de reportes**

#### Test Cases:
- **EXP-001**: Exportación multi-formato
- **EXP-002**: Reportes programados
- **EXP-003**: Exportación masiva
- **EXP-004**: Generación de reportes personalizados

## 🌐 Endpoints

### Reports Service - Usage Reports
```
GET    /api/v1/reports/usage/resources
GET    /api/v1/reports/usage/utilization
GET    /api/v1/reports/usage/occupancy
POST   /api/v1/reports/usage/time-based
GET    /api/v1/reports/usage/export/{format}
```

### Reports Service - User Reports
```
GET    /api/v1/reports/users/{userId}
GET    /api/v1/reports/users/behavior
GET    /api/v1/reports/users/segmentation
GET    /api/v1/reports/users/feedback
```

### Reports Service - Dashboard Analytics
```
GET    /api/v1/reports/dashboards/executive
GET    /api/v1/reports/dashboards/operational
GET    /api/v1/reports/dashboards/realtime
POST   /api/v1/reports/dashboards/custom
```

### Reports Service - Export Reports
```
POST   /api/v1/reports/export/multi-format
POST   /api/v1/reports/export/scheduled
POST   /api/v1/reports/export/bulk
POST   /api/v1/reports/export/custom
```

## 👥 Usuarios de Prueba

### Administrador General
```json
{
  "email": "admin.general@ufps.edu.co",
  "role": "ADMIN_GENERAL",
  "permissions": ["view_all_reports", "create_reports", "export_reports", "manage_dashboards"]
}
```

### Administrador de Programa
```json
{
  "email": "admin.programa@ufps.edu.co", 
  "role": "ADMIN_PROGRAMA",
  "permissions": ["view_program_reports", "create_program_reports", "export_program_reports"]
}
```

### Docente
```json
{
  "email": "docente.pruebas@ufps.edu.co",
  "role": "DOCENTE", 
  "permissions": ["view_personal_reports", "view_class_reports"]
}
```

## 📊 Datos de Prueba

### Recursos para Reportes
```javascript
const testResources = [
  {
    id: "res_audit_001",
    name: "Auditorio Principal",
    type: "AUDITORIO",
    capacity: 200,
    program: "INGENIERIA_SISTEMAS",
    utilizationRate: 85.5
  },
  {
    id: "res_lab_002", 
    name: "Laboratorio Redes",
    type: "LABORATORIO",
    capacity: 30,
    program: "INGENIERIA_SISTEMAS",
    utilizationRate: 72.3
  }
];
```

### Datos de Uso Histórico
```javascript
const usageData = {
  period: "2024-01",
  totalReservations: 1250,
  totalHours: 8760,
  utilizationRate: 78.5,
  peakHours: ["09:00", "14:00", "16:00"],
  mostUsedResources: ["res_audit_001", "res_lab_002"]
};
```

### Configuración de Reportes
```javascript
const reportConfig = {
  formats: ["CSV", "EXCEL", "PDF"],
  schedules: ["DAILY", "WEEKLY", "MONTHLY"],
  recipients: ["admin@ufps.edu.co"],
  autoExport: true
};
```

## 📈 Métricas de Validación

### Performance
- Tiempo de generación de reportes: < 5 segundos
- Tiempo de exportación: < 10 segundos  
- Tiempo de carga de dashboard: < 3 segundos
- Actualización de métricas en tiempo real: < 2 segundos

### Funcionales
- Precisión de datos: 100%
- Integridad de exportaciones: Verificada
- Disponibilidad de dashboards: 99.9%
- Completitud de reportes: Validada

## ✅ Validaciones

### Validaciones Técnicas
- [x] Estructura correcta de respuestas JSON
- [x] Códigos de estado HTTP apropiados
- [x] Validación de formatos de exportación
- [x] Integridad de datos entre reportes y fuentes

### Validaciones Funcionales  
- [x] Generación correcta de reportes de uso
- [x] Precisión en cálculos de utilización
- [x] Funcionamiento de dashboards en tiempo real
- [x] Exportación exitosa en todos los formatos

### Validaciones de Seguridad
- [x] Control de acceso por roles
- [x] Validación de permisos por programa académico
- [x] Protección de datos sensibles en exportaciones
- [x] Auditoría de acceso a reportes

## 📋 Reportes de Prueba

### Reporte de Ejecución
```
Hito 5 - Reports Core
========================
✓ Usage Reports: 5/5 tests passed
✓ User Reports: 4/4 tests passed  
✓ Dashboard Analytics: 4/4 tests passed
✓ Export Reports: 4/4 tests passed
========================
Total: 17/17 tests passed (100%)
```

### Estado de Implementación
- [x] **RF-31**: Reporte de uso por recurso/programa/período
- [x] **RF-32**: Reporte por usuario/profesor  
- [x] **RF-33**: Exportación en CSV
- [x] **RF-34**: Registro de feedback de usuarios
- [x] **RF-35**: Evaluación de usuarios por el staff
- [x] **RF-36**: Dashboards interactivos
- [x] **RF-37**: Reporte de demanda insatisfecha

## 🚀 Comandos de Ejecución

### Ejecutar Todos los Tests
```bash
make test-all
```

### Tests Individuales
```bash
make test-usage      # Reportes de uso
make test-users      # Reportes de usuarios  
make test-dashboard  # Dashboard analytics
make test-export     # Exportación de reportes
```

### Utilidades
```bash
make results         # Ver resultados
make clean           # Limpiar archivos temporales
make help            # Mostrar ayuda
```

## 📁 Estructura de Archivos

```
hito-5-reports/
├── usage-reports.js         # Reportes de uso y utilización
├── user-reports.js          # Reportes de usuarios
├── dashboard-analytics.js   # Dashboard y analytics
├── export-reports.js        # Exportación de reportes
├── Makefile                 # Comandos de ejecución
├── README.md               # Documentación (este archivo)
└── results/                # Resultados de ejecución
    ├── usage-reports.md
    ├── user-reports.md
    ├── dashboard-analytics.md
    └── export-reports.md
```

---

**Última actualización**: 2025-08-31  
**Versión**: 1.0.0  
**Responsable**: Sistema de Testing Bookly API Gateway
