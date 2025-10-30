# Bookly Resources Service - Postman Collections

Este directorio contiene las colecciones de Postman para el microservicio **Resources Service** de Bookly. Las colecciones están divididas en múltiples archivos para mejor organización y facilidad de importación.

## 📋 Archivos de Colecciones

### 1. `bookly-resources-service.postman_collection.json`
**Colección Principal - Core Resources & Categories**
- **Health Check**: Verificación del estado del servicio
- **Resources**: CRUD completo de recursos (RF-01, RF-03, RF-05)
  - Crear, actualizar, eliminar recursos
  - Búsqueda y filtrado avanzado
  - Paginación y verificación de disponibilidad
- **Categories**: Gestión de categorías de recursos (RF-02)
  - CRUD de categorías (unified Category model)
  - Categorías activas, por defecto y personalizadas

### 2. `bookly-resources-service-extended.postman_collection.json`
**Colección Extendida - Programs & Maintenance Types**
- **Programs**: Gestión de programas académicos (RF-02)
  - CRUD de programas académicos
  - Vinculación de recursos con programas
- **Maintenance Types**: Tipos de mantenimiento (RF-06)
  - CRUD de tipos de mantenimiento
  - Tipos por defecto y personalizados
  - Validación de tipos activos

### 3. `bookly-resources-service-import-responsible.postman_collection.json`
**Colección Especializada - Import & Responsibilities**
- **Resource Import**: Importación masiva de recursos (RF-04)
  - Preview y validación de archivos CSV
  - Proceso de importación con seguimiento
  - Estadísticas y historial de importaciones
- **Resource Responsible**: Gestión de responsabilidades (RF-01)
  - Asignación individual y masiva de responsables
  - Transferencia de responsabilidades
  - Consulta de responsabilidades por usuario/recurso

## 🔧 Configuración

### Variables de Entorno
Todas las colecciones incluyen las siguientes variables:

```json
{
  "baseUrl": "http://localhost:3003",
  "apiPrefix": "/api/v1",
  "authToken": "your-jwt-token-here"
}
```

### Autenticación
- **Tipo**: Bearer Token
- **Token**: `{{authToken}}`
- **Configuración**: A nivel de colección (heredado por todas las requests)

## 🚀 Importación en Postman

### Opción 1: Importación Individual
1. Abrir Postman
2. Clic en **Import** 
3. Seleccionar uno de los archivos `.json`
4. Configurar las variables de entorno

### Opción 2: Importación Completa
1. Importar los 3 archivos secuencialmente
2. Organizar en un Workspace dedicado
3. Configurar variables globales

## 🛠️ Configuración del Entorno

### Prerequisites
```bash
# 1. Asegurar que el resources-service esté ejecutándose
cd bookly-backend
npm run start:resources

# 2. Verificar que la base de datos esté sembrada
npm run prisma:db:seed
```

### Obtener Token de Autenticación
```bash
# Usar el auth-service para obtener un token JWT
POST http://localhost:3001/api/v1/auth/login
{
  "email": "admin@ufps.edu.co",
  "password": "123456"
}
```

## 📚 Arquitectura de Endpoints

### Estructura de URLs
```
Base: http://localhost:3003/api/v1

Health:
├── GET    /health

Resources:
├── POST   /resources
├── GET    /resources
├── GET    /resources/paginated
├── GET    /resources/search
├── GET    /resources/:id
├── GET    /resources/code/:code
├── GET    /resources/:id/availability
├── PUT    /resources/:id
└── DELETE /resources/:id

Categories:
├── POST   /categories
├── GET    /categories
├── GET    /categories/active
├── GET    /categories/defaults
├── GET    /categories/:id
├── PUT    /categories/:id
├── DELETE /categories/:id
└── PUT    /categories/:id/reactivate

Programs:
├── POST   /programs
├── GET    /programs
├── GET    /programs/active
├── GET    /programs/:id
├── GET    /programs/code/:code
├── PUT    /programs/:id
├── DELETE /programs/:id
└── PUT    /programs/:id/reactivate

Maintenance Types:
├── POST   /maintenance-types
├── GET    /maintenance-types/active
├── GET    /maintenance-types/all
├── GET    /maintenance-types/defaults
├── GET    /maintenance-types/custom
├── GET    /maintenance-types/:id
├── GET    /maintenance-types/name/:name
├── PUT    /maintenance-types/:id
├── DELETE /maintenance-types/:id
├── PUT    /maintenance-types/:id/reactivate
└── GET    /maintenance-types/:id/validate

Resource Import:
├── POST   /import/preview
├── POST   /import/start
├── GET    /import/:id
├── GET    /import/history
├── GET    /import/paginated
├── GET    /import/statistics/overview
└── GET    /import/statistics/my-stats

Resource Responsible:
├── POST   /resource-responsibles/:resourceId/users/:userId
├── POST   /resource-responsibles/:resourceId/users
├── PUT    /resource-responsibles/:resourceId/users
├── GET    /resource-responsibles/:resourceId/users
├── GET    /resource-responsibles/users/:userId/resources
├── GET    /resource-responsibles/my-resources
├── GET    /resource-responsibles/:resourceId/users/:userId/exists
├── DELETE /resource-responsibles/:resourceId/users/:userId
├── DELETE /resource-responsibles/:resourceId/users
├── GET    /resource-responsibles
├── POST   /resource-responsibles/users/:userId/resources
├── POST   /resource-responsibles/transfer
└── POST   /resource-responsibles/validate
```

## 🔍 Funcionalidades Cubiertas

### Requerimientos Funcionales (RF)
- **RF-01**: CRUD completo de recursos ✅
- **RF-02**: Asociación recursos-categorías y recursos-programas ✅
- **RF-03**: Atributos clave de recursos ✅
- **RF-04**: Importación masiva de recursos ✅
- **RF-05**: Configuración de reglas de disponibilidad ✅
- **RF-06**: Gestión de mantenimiento de recursos ✅

### Casos de Uso (CU)
- **CU-008**: Registrar un nuevo recurso ✅
- **CU-009**: Modificar información de un recurso ✅
- **CU-010**: Eliminar o deshabilitar un recurso ✅

### Arquitectura
- **CQRS**: Todos los endpoints siguen Command Query Responsibility Segregation
- **Clean Architecture**: Separación clara entre Controllers, Handlers y Services
- **Event-Driven**: Eventos distribuidos con RabbitMQ
- **Swagger**: Documentación automática de APIs
- **Seguridad**: Autenticación JWT y control de roles

## 📖 Documentación Adicional

- **Swagger UI**: `http://localhost:3003/api/docs`
- **Health Check**: `http://localhost:3003/api/v1/health`
- **API Documentation**: Ver archivos en `/docs/` del proyecto

## 🧪 Testing

### Flujo de Pruebas Recomendado
1. **Health Check**: Verificar estado del servicio
2. **Categories**: Crear categorías de prueba
3. **Programs**: Crear programas académicos
4. **Resources**: Crear recursos básicos
5. **Import**: Probar importación masiva
6. **Responsible**: Asignar responsables
7. **Availability**: Verificar disponibilidad

### Datos de Prueba
Las colecciones incluyen ejemplos de payloads JSON con datos realistas para cada endpoint, facilitando las pruebas inmediatas.

---

**Nota**: Estas colecciones están sincronizadas con la implementación actual del Resources Service y se actualizan automáticamente con cada cambio en los controllers.
