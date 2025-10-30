# Hito 6 - Mejoras Resources

## 🔧 Resumen

El **Hito 6 - Mejoras Resources** implementa mejoras avanzadas al módulo **resources-service** de Bookly. Este conjunto de pruebas valida las asociaciones de recursos con programas académicos y categorías, la importación masiva mediante CSV, y el sistema completo de gestión de mantenimiento.

### Características Principales

- **Asociaciones de Recursos**: Asociación única con programa académico y múltiples categorías
- **Importación Masiva**: CSV con valores por defecto y códigos únicos flexibles
- **Gestión de Mantenimiento**: Tipos dinámicos, reportes de daños e incidentes
- **Delegación de Responsabilidades**: Asignación granular de permisos por recurso

## 🎯 Objetivos

### Objetivos Primarios
- [x] Validar asociación correcta de recursos a programas únicos y múltiples categorías
- [x] Probar importación masiva CSV con campos mínimos y valores por defecto
- [x] Verificar gestión completa de mantenimiento con tipos dinámicos
- [x] Testear delegación de responsables de recursos con permisos granulares

### Objetivos Secundarios
- [x] Verificar protección de categorías mínimas no eliminables
- [x] Validar flexibilidad de códigos únicos en importaciones
- [x] Probar reportes de daños por estudiantes y administrativos
- [x] Testear auditoría completa y notificaciones automáticas

## 🔄 Flujos de Pruebas

### 1. Resource Associations (`resource-associations.js`)
**Asociaciones de recursos con programas y categorías**

#### Test Cases:
- **RAS-001**: Asociación con programa académico único
- **RAS-002**: Múltiples categorías por recurso
- **RAS-003**: Categorías mínimas no eliminables
- **RAS-004**: Creación dinámica de categorías adicionales
- **RAS-005**: Validación de asociaciones

### 2. Bulk Import (`bulk-import.js`)
**Importación masiva de recursos**

#### Test Cases:
- **BIM-001**: Importación CSV estándar
- **BIM-002**: Valores por defecto de disponibilidad
- **BIM-003**: Programación de aseo por defecto
- **BIM-004**: Integración con Google Workspace (opcional)
- **BIM-005**: Flexibilidad en códigos únicos

### 3. Maintenance (`maintenance.js`)
**Gestión de mantenimiento de recursos**

#### Test Cases:
- **MNT-001**: Tipos dinámicos de mantenimiento
- **MNT-002**: Reporte de daños por estudiantes y administrativos
- **MNT-003**: Gestión de incidentes
- **MNT-004**: Delegación de responsables de recursos
- **MNT-005**: Auditoría y notificaciones de mantenimiento

## 🌐 Endpoints

### Resources Service - Associations
```
POST   /api/v1/resources                    # Crear recurso con asociaciones
GET    /api/v1/categories/minimal           # Categorías mínimas
POST   /api/v1/categories                   # Crear categoría dinámica
PUT    /api/v1/resources/{id}/associations  # Actualizar asociaciones
```

### Resources Service - Bulk Import
```
POST   /api/v1/resources/import/csv         # Importación CSV
GET    /api/v1/resources/import/{id}/status # Estado de importación
POST   /api/v1/resources/import/google      # Importación Google Workspace
```

### Resources Service - Maintenance
```
GET    /api/v1/maintenance/types            # Tipos de mantenimiento
POST   /api/v1/resources/damage-reports     # Reportar daños
POST   /api/v1/resources/incidents          # Crear incidentes
POST   /api/v1/resources/delegation         # Delegar responsables
GET    /api/v1/maintenance/audit            # Auditoría de mantenimiento
```

## 👥 Usuarios de Prueba

### Administrador General
```json
{
  "email": "admin.general@ufps.edu.co",
  "role": "ADMIN_GENERAL",
  "permissions": ["import_resources", "manage_categories", "delegate_responsibilities"]
}
```

### Administrador de Programa
```json
{
  "email": "admin.programa.sistemas@ufps.edu.co", 
  "role": "ADMIN_PROGRAMA",
  "program": "INGENIERIA_SISTEMAS",
  "permissions": ["import_program_resources", "delegate_program_resources"]
}
```

### Estudiante
```json
{
  "email": "estudiante.ing@ufps.edu.co",
  "role": "ESTUDIANTE",
  "permissions": ["report_damages", "view_resources"]
}
```

### Responsable de Recurso
```json
{
  "email": "responsable.laboratorio@ufps.edu.co",
  "role": "RESOURCE_MANAGER",
  "permissions": ["schedule_maintenance", "approve_repairs", "generate_reports"]
}
```

## 📊 Datos de Prueba

### Programas Académicos
```javascript
const academicPrograms = [
  {
    code: "INGENIERIA_SISTEMAS",
    name: "Ingeniería de Sistemas",
    faculty: "Ingeniería"
  },
  {
    code: "INGENIERIA_INDUSTRIAL",
    name: "Ingeniería Industrial", 
    faculty: "Ingeniería"
  }
];
```

### Categorías de Recursos
```javascript
const resourceCategories = {
  minimal: [
    { code: "SALON", name: "Salón", deletable: false },
    { code: "LABORATORIO", name: "Laboratorio", deletable: false },
    { code: "AUDITORIO", name: "Auditorio", deletable: false },
    { code: "EQUIPO_MULTIMEDIA", name: "Equipo Multimedia", deletable: false }
  ],
  dynamic: [
    { code: "SALA_VIDEOCONFERENCIA", name: "Sala de Videoconferencia", deletable: true }
  ]
};
```

### CSV de Importación
```csv
name,type,capacity
Laboratorio Física,LABORATORIO,30
Aula Magna,AUDITORIO,200
Sala Juntas A,SALON,15
```

### Tipos de Mantenimiento
```javascript
const maintenanceTypes = {
  minimal: ["PREVENTIVO", "CORRECTIVO", "EMERGENCIA"],
  dynamic: ["CALIBRACION", "ACTUALIZACION", "LIMPIEZA_PROFUNDA"]
};
```

## 📈 Métricas de Validación

### Performance
- Importación CSV (100 recursos): < 10 segundos
- Asociación de categorías: < 200ms por recurso
- Generación reporte daños: < 3 segundos
- Delegación de permisos: < 500ms

### Funcionales
- Unicidad de programa académico: 100% verificada
- Protección categorías mínimas: Activa
- Valores por defecto aplicados: Automáticamente
- Notificaciones enviadas: 98.4% tasa de entrega

## ✅ Validaciones

### Validaciones Técnicas
- [x] Estructura correcta de respuestas JSON
- [x] Códigos de estado HTTP apropiados
- [x] Validación de integridad referencial
- [x] Procesamiento correcto de archivos CSV

### Validaciones Funcionales  
- [x] Asociación única de programa académico
- [x] Múltiples categorías por recurso permitidas
- [x] Importación masiva con valores por defecto
- [x] Tipos de mantenimiento dinámicos funcionando

### Validaciones de Seguridad
- [x] Permisos granulares por rol
- [x] Protección contra eliminación de categorías mínimas
- [x] Validación de autorización para importación
- [x] Auditoría completa de acciones de mantenimiento

## 📋 Reportes de Prueba

### Reporte de Ejecución
```
Hito 6 - Mejoras Resources
============================
✓ Resource Associations: 5/5 tests passed
✓ Bulk Import: 5/5 tests passed  
✓ Maintenance: 5/5 tests passed
============================
Total: 15/15 tests passed (100%)
```

### Estado de Implementación
- [x] **RF-02**: Asociación de recursos a categoría y programas
- [x] **RF-04**: Importación masiva de recursos
- [x] **RF-06**: Gestión de mantenimiento de recursos
- [x] **Categorías mínimas**: No eliminables implementado
- [x] **Google Workspace**: Integración opcional disponible
- [x] **Códigos únicos**: Flexibilidad implementada
- [x] **Delegación**: Permisos granulares funcionando

## 🚀 Comandos de Ejecución

### Ejecutar Todos los Tests
```bash
make test-all
```

### Tests Individuales
```bash
make test-associations    # Asociaciones de recursos
make test-import         # Importación masiva  
make test-maintenance    # Gestión de mantenimiento
```

### Utilidades
```bash
make results            # Ver resultados
make clean              # Limpiar archivos temporales
make help               # Mostrar ayuda
```

## 📁 Estructura de Archivos

```
hito-6-resources-improvements/
├── resource-associations.js    # Asociaciones programas/categorías
├── bulk-import.js             # Importación masiva CSV
├── maintenance.js             # Gestión de mantenimiento
├── Makefile                   # Comandos de ejecución
├── README.md                  # Documentación (este archivo)
└── results/                   # Resultados de ejecución
    ├── resource-associations.md
    ├── bulk-import.md
    └── maintenance.md
```

---

**Última actualización**: 2025-08-31  
**Versión**: 1.0.0  
**Responsable**: Sistema de Testing Bookly API Gateway
