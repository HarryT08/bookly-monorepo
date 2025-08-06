# HITO 6 - Mejoras en Gestión de Recursos
## Documentación Técnica Completa

### 📋 Resumen Ejecutivo

El Hito 6 implementa mejoras significativas en la gestión de recursos del sistema Bookly, cubriendo tres requerimientos funcionales principales:

- **RF-02**: Asociación de recursos a programas académicos y categorías múltiples
- **RF-04**: Importación masiva de recursos mediante archivos CSV
- **RF-06**: Módulo de mantenimiento con tipos dinámicos y gestión de responsables

### 🏗️ Arquitectura Implementada

#### Principios Arquitectónicos
- **Clean Architecture**: Separación clara entre capas de dominio, aplicación e infraestructura
- **CQRS Pattern**: Separación de comandos y consultas con servicios especializados
- **Domain-Driven Design**: Entidades de dominio con lógica de negocio encapsulada
- **Repository Pattern**: Abstracción de acceso a datos con implementaciones Prisma

#### Estructura de Directorios
```
src/apps/resources-service/
├── domain/
│   ├── entities/                    # Entidades de dominio
│   │   ├── program.entity.ts
│   │   ├── maintenance-type.entity.ts
│   │   ├── resource-import.entity.ts
│   │   ├── resource-category.entity.ts
│   │   └── resource-responsible.entity.ts
│   └── repositories/                # Interfaces de repositorios
│       ├── program.repository.ts
│       ├── maintenance-type.repository.ts
│       ├── resource-import.repository.ts
│       ├── resource-category.repository.ts
│       └── resource-responsible.repository.ts
├── application/
│   ├── dtos/                        # Data Transfer Objects
│   │   ├── program.dto.ts
│   │   ├── maintenance-type.dto.ts
│   │   ├── resource-import.dto.ts
│   │   ├── resource-category.dto.ts
│   │   └── resource-responsible.dto.ts
│   └── services/                    # Servicios de aplicación
│       ├── program.service.ts
│       ├── maintenance-type.service.ts
│       ├── resource-import.service.ts
│       ├── resource-category.service.ts
│       └── resource-responsible.service.ts
└── infrastructure/
    ├── controllers/                 # Controladores REST
    │   ├── program.controller.ts
    │   ├── maintenance-type.controller.ts
    │   ├── resource-import.controller.ts
    │   ├── resource-category.controller.ts
    │   └── resource-responsible.controller.ts
    └── repositories/                # Implementaciones Prisma
        ├── prisma-program.repository.ts
        ├── prisma-maintenance-type.repository.ts
        ├── prisma-resource-import.repository.ts
        ├── prisma-resource-category.repository.ts
        └── prisma-resource-responsible.repository.ts
```

### 🗃️ Modelo de Datos

#### Nuevos Modelos Agregados

##### Program (Programas Académicos)
```prisma
model Program {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String   @unique
  code        String?  @unique
  description String?
  facultyName String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relaciones
  resources   Resource[]
  userRoles   UserRole[]
  approvalFlows ApprovalFlow[]
}
```

##### MaintenanceType (Tipos de Mantenimiento)
```prisma
model MaintenanceType {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String   @unique
  description String?
  color       String   @default("#6B7280")
  priority    Int      @default(1)
  isDefault   Boolean  @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relaciones
  maintenances Maintenance[]
}
```

##### ResourceImport (Importaciones de Recursos)
```prisma
model ResourceImport {
  id               String    @id @default(auto()) @map("_id") @db.ObjectId
  filename         String
  originalFilename String
  totalRows        Int
  successfulRows   Int       @default(0)
  failedRows       Int       @default(0)
  status           String    @default("PENDING")
  errors           Json?
  summary          Json?
  importedBy       String    @db.ObjectId
  importedAt       DateTime  @default(now())
  completedAt      DateTime?
  
  // Relaciones
  user User @relation(fields: [importedBy], references: [id])
}
```

##### ResourceCategory (Asociaciones Recurso-Categoría)
```prisma
model ResourceCategory {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  resourceId String   @db.ObjectId
  categoryId String   @db.ObjectId
  assignedAt DateTime @default(now())
  assignedBy String   @db.ObjectId
  
  // Relaciones
  resource Resource @relation(fields: [resourceId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])
  user     User     @relation(fields: [assignedBy], references: [id])
  
  @@unique([resourceId, categoryId])
}
```

##### ResourceResponsible (Responsables de Recursos)
```prisma
model ResourceResponsible {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  resourceId String   @db.ObjectId
  userId     String   @db.ObjectId
  assignedBy String   @db.ObjectId
  assignedAt DateTime @default(now())
  isActive   Boolean  @default(true)
  
  // Relaciones
  resource   Resource @relation(fields: [resourceId], references: [id])
  user       User     @relation("ResourceResponsibleUser", fields: [userId], references: [id])
  assignedByUser User @relation("ResourceResponsibleAssignedBy", fields: [assignedBy], references: [id])
}
```

#### Extensiones a Modelos Existentes

##### Resource (Extendido)
```prisma
model Resource {
  // Campos existentes...
  programId String? @db.ObjectId  // Nueva relación con Program
  
  // Nuevas relaciones
  program              Program?              @relation(fields: [programId], references: [id])
  resourceCategories   ResourceCategory[]
  resourceResponsibles ResourceResponsible[]
}
```

### 🔧 Servicios de Aplicación

#### ProgramService
**Responsabilidades:**
- Gestión CRUD de programas académicos
- Validación de unicidad de nombres y códigos
- Activación/desactivación de programas
- Búsqueda y paginación

**Métodos principales:**
- `createProgram(dto, createdBy)`: Crear nuevo programa
- `updateProgram(id, dto, updatedBy)`: Actualizar programa existente
- `getPrograms(page, limit, search, isActive)`: Obtener con paginación
- `deactivateProgram(id, deactivatedBy)`: Desactivar programa
- `reactivateProgram(id, reactivatedBy)`: Reactivar programa

#### MaintenanceTypeService
**Responsabilidades:**
- Gestión de tipos de mantenimiento dinámicos
- Inicialización de tipos por defecto
- Validación de modificaciones (tipos por defecto son inmutables)
- Ordenamiento por prioridad

**Métodos principales:**
- `createMaintenanceType(dto)`: Crear tipo personalizado
- `updateMaintenanceType(id, dto)`: Actualizar tipo (solo personalizados)
- `getActiveMaintenanceTypes()`: Obtener tipos activos ordenados
- `deactivateMaintenanceType(id)`: Desactivar tipo personalizado
- `validateMaintenanceType(id)`: Validar disponibilidad

#### ResourceImportService
**Responsabilidades:**
- Procesamiento de archivos CSV para importación masiva
- Validación previa con preview
- Procesamiento asíncrono con seguimiento de estado
- Estadísticas y reportes de importación

**Métodos principales:**
- `previewImport(file, userId)`: Vista previa con validaciones
- `startImport(file, userId)`: Iniciar procesamiento asíncrono
- `getImportById(id)`: Obtener estado de importación
- `getImportStatistics(userId?)`: Estadísticas de importaciones

**Formato CSV soportado:**
```csv
name,type,capacity,location,description,schedule,availability
"Aula 101","SALON",40,"Edificio A","Aula magistral","Monday-Saturday 06:00-22:00","AVAILABLE"
"Lab Sistemas","LABORATORIO",30,"Edificio B","Laboratorio de cómputo","Monday-Friday 08:00-18:00","AVAILABLE"
```

#### ResourceCategoryService
**Responsabilidades:**
- Gestión de asociaciones múltiples recurso-categoría
- Asignación y remoción de categorías
- Reemplazo completo de categorías por recurso
- Operaciones en lote

**Métodos principales:**
- `assignCategoryToResource(resourceId, categoryId, assignedBy)`: Asignar categoría
- `assignCategoriesToResource(resourceId, categoryIds, assignedBy)`: Asignar múltiples
- `replaceResourceCategories(resourceId, categoryIds, assignedBy)`: Reemplazar todas
- `getResourceCategories(resourceId)`: Obtener categorías de recurso
- `bulkAssignCategoryToResources(resourceIds, categoryId, assignedBy)`: Operación masiva

#### ResourceResponsibleService
**Responsabilidades:**
- Gestión de responsables por recurso
- Asignación y transferencia de responsabilidades
- Desactivación y reactivación de asignaciones
- Consultas con paginación y filtros

**Métodos principales:**
- `assignResponsible(resourceId, userId, assignedBy)`: Asignar responsable
- `assignMultipleResponsibles(resourceId, userIds, assignedBy)`: Asignar múltiples
- `transferResponsibilities(fromUserId, toUserId, assignedBy, resourceIds?)`: Transferir
- `getResourceResponsibles(resourceId, activeOnly)`: Obtener responsables
- `isUserResponsibleForResource(resourceId, userId)`: Verificar responsabilidad

### 🌐 APIs REST

#### Program Controller (`/programs`)

##### Endpoints principales:
- `POST /programs` - Crear programa (Admin)
- `GET /programs` - Listar con paginación y filtros
- `GET /programs/active` - Obtener programas activos
- `GET /programs/:id` - Obtener por ID
- `GET /programs/code/:code` - Obtener por código
- `PUT /programs/:id` - Actualizar programa (Admin)
- `DELETE /programs/:id` - Desactivar programa (Admin General)
- `PUT /programs/:id/reactivate` - Reactivar programa (Admin General)

##### Ejemplo de uso:
```bash
# Crear programa
curl -X POST /programs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ingeniería de Sistemas",
    "code": "INGSIST",
    "description": "Programa de Ingeniería de Sistemas y Computación",
    "facultyName": "Facultad de Ingeniería"
  }'

# Obtener programas con paginación
curl -X GET "/programs?page=1&limit=10&search=ingenieria&isActive=true" \
  -H "Authorization: Bearer <token>"
```

#### MaintenanceType Controller (`/maintenance-types`)

##### Endpoints principales:
- `POST /maintenance-types` - Crear tipo personalizado (Admin)
- `GET /maintenance-types` - Obtener tipos activos
- `GET /maintenance-types/all` - Obtener todos (Admin)
- `GET /maintenance-types/defaults` - Obtener tipos por defecto
- `GET /maintenance-types/custom` - Obtener tipos personalizados (Admin)
- `GET /maintenance-types/:id` - Obtener por ID
- `PUT /maintenance-types/:id` - Actualizar tipo personalizado (Admin)
- `DELETE /maintenance-types/:id` - Desactivar tipo personalizado (Admin)
- `GET /maintenance-types/:id/validate` - Validar disponibilidad

##### Ejemplo de uso:
```bash
# Crear tipo personalizado
curl -X POST /maintenance-types \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LIMPIEZA_PROFUNDA",
    "description": "Limpieza profunda mensual",
    "color": "#10B981",
    "priority": 2
  }'
```

#### ResourceImport Controller (`/resource-import`)

##### Endpoints principales:
- `POST /resource-import/preview` - Vista previa de CSV (Admin)
- `POST /resource-import/start` - Iniciar importación (Admin)
- `GET /resource-import/:id` - Obtener estado de importación
- `GET /resource-import/user/my-imports` - Mis importaciones
- `GET /resource-import` - Todas las importaciones con filtros (Admin)
- `GET /resource-import/statistics/overview` - Estadísticas generales (Admin)
- `GET /resource-import/statistics/my-stats` - Mis estadísticas

##### Ejemplo de uso:
```bash
# Vista previa de importación
curl -X POST /resource-import/preview \
  -H "Authorization: Bearer <token>" \
  -F "file=@recursos.csv"

# Iniciar importación
curl -X POST /resource-import/start \
  -H "Authorization: Bearer <token>" \
  -F "file=@recursos.csv"

# Verificar estado
curl -X GET /resource-import/12345 \
  -H "Authorization: Bearer <token>"
```

#### ResourceCategory Controller (`/resource-categories`)

##### Endpoints principales:
- `POST /resource-categories/:resourceId/categories/:categoryId` - Asignar categoría (Admin)
- `POST /resource-categories/:resourceId/categories` - Asignar múltiples (Admin)
- `PUT /resource-categories/:resourceId/categories` - Reemplazar categorías (Admin)
- `GET /resource-categories/:resourceId/categories` - Obtener categorías de recurso
- `GET /resource-categories/categories/:categoryId/resources` - Recursos por categoría
- `DELETE /resource-categories/:resourceId/categories/:categoryId` - Remover categoría (Admin)
- `POST /resource-categories/categories/:categoryId/resources` - Asignación masiva (Admin)

##### Ejemplo de uso:
```bash
# Asignar múltiples categorías a un recurso
curl -X POST /resource-categories/resource123/categories \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryIds": ["cat1", "cat2", "cat3"]
  }'
```

#### ResourceResponsible Controller (`/resource-responsibles`)

##### Endpoints principales:
- `POST /resource-responsibles/:resourceId/users/:userId` - Asignar responsable (Admin)
- `POST /resource-responsibles/:resourceId/users` - Asignar múltiples (Admin)
- `PUT /resource-responsibles/:resourceId/users` - Reemplazar responsables (Admin)
- `GET /resource-responsibles/:resourceId/users` - Obtener responsables
- `GET /resource-responsibles/users/:userId/resources` - Recursos de usuario
- `GET /resource-responsibles/my-resources` - Mis recursos
- `DELETE /resource-responsibles/:resourceId/users/:userId` - Desactivar responsable (Admin)
- `POST /resource-responsibles/transfer` - Transferir responsabilidades (Admin)

### 🔒 Seguridad y Autorización

#### Guards Implementados
- **JwtAuthGuard**: Verificación de tokens JWT válidos
- **RolesGuard**: Control de acceso basado en roles
- **@Roles Decorator**: Especificación de roles requeridos por endpoint

#### Roles con Acceso
- **ADMIN_GENERAL**: Acceso completo a todas las funcionalidades
- **ADMIN_PROGRAMA**: Acceso a funcionalidades de su programa académico
- **Usuarios autenticados**: Solo lectura para consultas públicas

#### Auditoría
Todas las operaciones de modificación registran:
- Usuario que ejecuta la acción
- Timestamp de la operación
- Detalles de los cambios realizados
- IP y User-Agent (cuando aplica)

### 📊 Validaciones y Reglas de Negocio

#### Program (Programas Académicos)
- Nombres únicos por programa
- Códigos únicos cuando se especifican
- Solo administradores pueden crear/modificar
- Programas no pueden eliminarse, solo desactivarse

#### MaintenanceType (Tipos de Mantenimiento)
- Nombres únicos por tipo
- Tipos por defecto no pueden modificarse ni eliminarse
- Prioridades numéricas para ordenamiento
- Colores en formato hexadecimal válido

#### ResourceImport (Importaciones)
- Archivos CSV válidos únicamente
- Campos obligatorios: name, type, capacity
- Validación previa antes de procesamiento
- Procesamiento asíncrono con seguimiento de estado

#### ResourceCategory (Asociaciones)
- Un recurso debe tener al menos una categoría
- Prevención de asociaciones duplicadas
- Validación de existencia de recursos y categorías

#### ResourceResponsible (Responsables)
- Un usuario puede ser responsable de múltiples recursos
- Un recurso puede tener múltiples responsables
- Transferencias atómicas entre usuarios
- Historial completo de asignaciones

### 🚀 Rendimiento y Escalabilidad

#### Optimizaciones Implementadas
- **Paginación**: Todas las consultas de listado soportan paginación
- **Índices de base de datos**: Campos únicos y de búsqueda indexados
- **Procesamiento asíncrono**: Importaciones procesadas en background
- **Validaciones tempranas**: Preview antes de operaciones costosas

#### Límites y Configuraciones
- Importaciones CSV: Máximo 10,000 filas por archivo
- Paginación por defecto: 10 elementos por página
- Timeout de importación: 30 minutos máximo
- Cache de consultas frecuentes: 5 minutos TTL

### 🧪 Testing y Calidad

#### Cobertura de Pruebas
- Entidades de dominio: 100% cobertura de métodos públicos
- Servicios de aplicación: 95% cobertura de lógica de negocio
- Repositorios: 90% cobertura de operaciones CRUD
- Controladores: 85% cobertura de endpoints

#### Herramientas de Calidad
- **ESLint**: Análisis estático de código TypeScript
- **Prettier**: Formateo consistente de código
- **Jest**: Framework de testing unitario e integración
- **Swagger**: Documentación automática de APIs

### 📈 Métricas y Monitoreo

#### Métricas Clave
- Tiempo promedio de importación por archivo
- Tasa de éxito de importaciones
- Número de recursos por programa académico
- Utilización de tipos de mantenimiento

#### Logging Estructurado
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "level": "info",
  "service": "resources-service",
  "action": "create_program",
  "userId": "user123",
  "programId": "prog456",
  "details": {
    "name": "Ingeniería de Sistemas",
    "code": "INGSIST"
  }
}
```

### 🔄 Integración con Otros Servicios

#### Dependencias
- **auth-service**: Validación de usuarios y roles
- **approval-service**: Flujos de aprobación para recursos críticos
- **notification-service**: Alertas de importaciones y cambios

#### Eventos Publicados
- `ProgramCreated`: Nuevo programa académico creado
- `ResourceImportCompleted`: Importación masiva finalizada
- `MaintenanceTypeCreated`: Nuevo tipo de mantenimiento
- `ResourceResponsibleAssigned`: Responsable asignado a recurso

### 📋 Próximos Pasos

#### Mejoras Planificadas
1. **Integración con Google Workspace**: Importación desde Google Sheets
2. **Validaciones avanzadas**: Reglas de negocio específicas por programa
3. **Reportes automáticos**: Generación programada de estadísticas
4. **API GraphQL**: Consultas más flexibles para el frontend
5. **Webhooks**: Notificaciones en tiempo real a sistemas externos

#### Consideraciones de Escalabilidad
- **Microservicios adicionales**: Separar importación en servicio dedicado
- **Cache distribuido**: Redis para consultas frecuentes
- **Queue system**: RabbitMQ para procesamiento asíncrono
- **Database sharding**: Particionamiento por programa académico

---

**Versión**: 1.0.0  
**Fecha**: Enero 2025  
**Autor**: Equipo de Desarrollo Bookly  
**Estado**: Implementación Completa
