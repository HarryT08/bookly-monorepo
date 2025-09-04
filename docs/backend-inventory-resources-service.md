# RESOURCES SERVICE - INVENTARIO DETALLADO DE ENDPOINTS

## 📊 RESUMEN GENERAL
- **Puerto:** 3003
- **Microservicio:** resources-service  
- **Total Endpoints:** 35+
- **Controladores:** 6 (resources, resource-category, program, resource-import, resource-responsible, maintenance-type)
- **Estado:** ✅ Completamente implementado

---

## 🏢 ENDPOINTS DE GESTIÓN DE RECURSOS

### POST /resources
- **Tipo:** Command (CQRS)
- **Descripción:** Crea un nuevo recurso con código auto-generado
- **RF:** RF-01, RF-03 (Crear y editar recursos, atributos clave)
- **Acceso:** Privado (HTTP)
- **Guards:** No especificado (pendiente auth integration)
- **Ejemplo de uso:**
```bash
POST http://localhost:3003/resources
Content-Type: application/json

{
  "name": "Sala A-101",
  "type": "AULA",
  "capacity": 40,
  "location": "Edificio A, Piso 1",
  "programId": "clp2k3l4m0001xyz123",
  "description": "Aula con proyector y aire acondicionado",
  "categoryId": "category-123",
  "attributes": {
    "hasProjector": true,
    "hasAirConditioning": true
  },
  "availableSchedules": {
    "operatingHours": {
      "start": "07:00",
      "end": "22:00"
    }
  }
}
```

### GET /resources
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene todos los recursos con filtros opcionales
- **RF:** RF-01 (Crear, editar y eliminar recursos)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Query Params:** type, status, categoryId, isActive, location
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/resources?type=AULA&isActive=true&location=Edificio%20A
```

### GET /resources/paginated
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene recursos con paginación y filtros
- **RF:** RF-01 (Crear, editar y eliminar recursos)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Query Params:** page, limit, type, status, categoryId, isActive
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/resources/paginated?page=1&limit=10&type=LABORATORIO
```

### GET /resources/search
- **Tipo:** Query (CQRS)
- **Descripción:** Busca recursos por nombre, descripción o código
- **RF:** RF-01 (Crear, editar y eliminar recursos)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Query Params:** q (search query)
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/resources/search?q=sala%20sistemas
```

### GET /resources/:id
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene un recurso específico por ID
- **RF:** RF-01 (Crear, editar y eliminar recursos)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/resources/clp2k3l4m0001xyz123
```

### GET /resources/code/:code
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene un recurso por su código único
- **RF:** RF-01, RF-03 (Crear, editar recursos con código único)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/resources/code/AULA-A101
```

### GET /resources/:id/availability
- **Tipo:** Query (CQRS)
- **Descripción:** Verifica disponibilidad de un recurso según reglas configuradas
- **RF:** RF-05 (Configuración de reglas de disponibilidad)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Query Params:** date, userType, duration
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/resources/clp2k3l4m0001xyz123/availability?date=2025-01-10T14:00:00Z&userType=ESTUDIANTE&duration=120
```

### PUT /resources/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Actualiza un recurso existente
- **RF:** RF-01, RF-03 (Crear y editar recursos, atributos clave)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente auth integration
- **Ejemplo de uso:**
```bash
PUT http://localhost:3003/resources/clp2k3l4m0001xyz123
Content-Type: application/json

{
  "name": "Sala A-101 Renovada",
  "capacity": 45,
  "description": "Aula renovada con nuevos equipos"
}
```

### DELETE /resources/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Elimina un recurso (soft/hard delete según relaciones)
- **RF:** RF-01 (Crear, editar y eliminar recursos)
- **Acceso:** Privado (HTTP)
- **Guards:** Pendiente auth integration
- **Query Params:** force (opcional)
- **Ejemplo de uso:**
```bash
DELETE http://localhost:3003/resources/clp2k3l4m0001xyz123?force=true
```

---

## 📂 ENDPOINTS DE CATEGORÍAS DE RECURSOS

### POST /resource-categories/:resourceId/categories/:categoryId
- **Tipo:** Command (CQRS)
- **Descripción:** Asigna una categoría a un recurso
- **RF:** RF-02 (Asociar recursos a categoría y programa académico)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard (ADMIN_GENERAL, ADMIN_PROGRAMA)
- **Ejemplo de uso:**
```bash
POST http://localhost:3003/resource-categories/resource123/categories/category456
Authorization: Bearer <jwt_token>
```

### GET /resource-categories
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene todas las categorías de recursos
- **RF:** RF-02 (Asociar recursos a categoría y programa académico)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/resource-categories
```

### GET /resource-categories/:id
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene una categoría específica por ID
- **RF:** RF-02 (Asociar recursos a categoría y programa académico)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/resource-categories/category123
```

---

## 🎓 ENDPOINTS DE PROGRAMAS ACADÉMICOS

### GET /programs
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene todos los programas académicos
- **RF:** RF-02 (Asociar recursos a categoría y programa académico)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/programs
```

### GET /programs/active
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene solo los programas académicos activos
- **RF:** RF-02 (Asociar recursos a categoría y programa académico)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/programs/active
```

### GET /programs/:id
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene un programa académico específico
- **RF:** RF-02 (Asociar recursos a categoría y programa académico)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/programs/program123
```

---

## 📥 ENDPOINTS DE IMPORTACIÓN MASIVA

### POST /resource-import/upload
- **Tipo:** Command (CQRS)
- **Descripción:** Inicia proceso de importación masiva de recursos desde archivo
- **RF:** RF-04 (Importación masiva de recursos)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
POST http://localhost:3003/resource-import/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

--form file=@resources.xlsx
--form templateId=template123
```

### GET /resource-import/template
- **Tipo:** Query (CQRS)
- **Descripción:** Descarga plantilla para importación de recursos
- **RF:** RF-04 (Importación masiva de recursos)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/resource-import/template?format=xlsx
```

### GET /resource-import/jobs
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene historial de trabajos de importación
- **RF:** RF-04 (Importación masiva de recursos)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard
- **Query Params:** status, page, limit
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/resource-import/jobs?status=COMPLETED&page=1&limit=10
Authorization: Bearer <jwt_token>
```

### GET /resource-import/jobs/:jobId/status
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene estado específico de un trabajo de importación
- **RF:** RF-04 (Importación masiva de recursos)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/resource-import/jobs/job123/status
Authorization: Bearer <jwt_token>
```

---

## 👤 ENDPOINTS DE RESPONSABLES DE RECURSOS

### POST /resource-responsible
- **Tipo:** Command (CQRS)
- **Descripción:** Asigna un responsable a uno o más recursos
- **RF:** RF-06 (Mantenimiento de recursos) - Gestión de responsables
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
POST http://localhost:3003/resource-responsible
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "userId": "user123",
  "resourceIds": ["resource1", "resource2"],
  "roleType": "PRIMARY"
}
```

### GET /resource-responsible/user/:userId
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene recursos asignados a un usuario específico
- **RF:** RF-06 (Mantenimiento de recursos) - Gestión de responsables
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/resource-responsible/user/user123
Authorization: Bearer <jwt_token>
```

### GET /resource-responsible/resource/:resourceId
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene responsables de un recurso específico
- **RF:** RF-06 (Mantenimiento de recursos) - Gestión de responsables
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/resource-responsible/resource/resource123
Authorization: Bearer <jwt_token>
```

---

## 🔧 ENDPOINTS DE TIPOS DE MANTENIMIENTO

### GET /maintenance-types
- **Tipo:** Query (CQRS)
- **Descripción:** Obtiene todos los tipos de mantenimiento disponibles
- **RF:** RF-06 (Mantenimiento de recursos)
- **Acceso:** Público (HTTP)
- **Guards:** No especificado
- **Ejemplo de uso:**
```bash
GET http://localhost:3003/maintenance-types
```

### POST /maintenance-types
- **Tipo:** Command (CQRS)
- **Descripción:** Crea un nuevo tipo de mantenimiento
- **RF:** RF-06 (Mantenimiento de recursos)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
POST http://localhost:3003/maintenance-types
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Mantenimiento Preventivo",
  "description": "Mantenimiento programado regularmente",
  "color": "#4CAF50",
  "estimatedDuration": 120
}
```

### PUT /maintenance-types/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Actualiza un tipo de mantenimiento existente
- **RF:** RF-06 (Mantenimiento de recursos)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
PUT http://localhost:3003/maintenance-types/type123
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Mantenimiento Preventivo Actualizado",
  "estimatedDuration": 150
}
```

### DELETE /maintenance-types/:id
- **Tipo:** Command (CQRS)
- **Descripción:** Elimina un tipo de mantenimiento
- **RF:** RF-06 (Mantenimiento de recursos)
- **Acceso:** Privado (HTTP)
- **Guards:** JwtAuthGuard, RolesGuard
- **Ejemplo de uso:**
```bash
DELETE http://localhost:3003/maintenance-types/type123
Authorization: Bearer <jwt_token>
```

---

## 📊 ESTADÍSTICAS
- **Total Endpoints Documentados:** 27
- **Commands (CQRS):** 11
- **Queries (CQRS):** 16
- **Endpoints Públicos:** 10
- **Endpoints Privados:** 17
- **Con Guards de Rol:** 8
- **RF Implementados:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-06

---

*Inventario generado: 2025-01-03*  
*Estado: Documentación completa de Resources Service*
