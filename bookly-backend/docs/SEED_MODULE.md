# Módulo de Semillas (Seeds) - Bookly Backend

El módulo de semillas permite inicializar la base de datos con datos básicos necesarios para el funcionamiento del sistema Bookly.

## 🌱 Características

- **Verificación automática**: Solo ejecuta si la base de datos está vacía
- **Datos esenciales**: Incluye programas, roles, permisos, usuarios, categorías, tipos de mantenimiento y recursos
- **Arquitectura limpia**: Sigue los principios de Clean Architecture y CQRS
- **API REST**: Disponible vía endpoints HTTP
- **Script CLI**: Ejecutable desde línea de comandos

## 📊 Datos Creados

### 1. Programas Académicos
- Ingeniería de Sistemas (ING-SIS)
- Medicina (MED-GEN)
- Derecho (DER-GEN)
- Administración de Empresas (ADM-EMP)

### 2. Roles y Permisos
- **Estudiante**: Permisos básicos de reserva
- **Docente**: Permisos de reserva + reportes
- **Administrador General**: Todos los permisos
- **Administrador de Programa**: Permisos de gestión por programa
- **Vigilante**: Solo lectura de reservas y recursos
- **Administrativo General**: Permisos administrativos básicos

### 3. Usuarios de Prueba
| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| admin | admin@ufps.edu.co | 123456 | Administrador General |
| admin.sistemas | admin.sistemas@ufps.edu.co | 123456 | Administrador de Programa |
| docente | docente@ufps.edu.co | 123456 | Docente |
| estudiante | estudiante@ufps.edu.co | 123456 | Estudiante |
| vigilante | vigilante@ufps.edu.co | 123456 | Vigilante |

### 4. Categorías de Recursos
- **Salón** (por defecto, no eliminable)
- **Laboratorio** (por defecto, no eliminable)
- **Auditorio** (por defecto, no eliminable)
- **Equipo Multimedia** (por defecto, no eliminable)
- Biblioteca
- Oficina

### 5. Tipos de Mantenimiento
- **PREVENTIVO** (por defecto, no eliminable)
- **CORRECTIVO** (por defecto, no eliminable)
- **EMERGENCIA** (por defecto, no eliminable)
- **LIMPIEZA** (por defecto, no eliminable)

### 6. Recursos de Ejemplo
- Aula 101 (Salón, ING-SIS)
- Laboratorio de Sistemas (Laboratorio, ING-SIS)
- Auditorio Principal (Auditorio, global)
- Proyector Epson (Equipo Multimedia, global)

### 7. Disponibilidad Básica
- Lunes a Viernes: 6:00 AM - 10:00 PM
- Sábados: 6:00 AM - 6:00 PM
- Domingos: No disponible

## 🚀 Uso

### Opción 1: Script CLI
```bash
# Ejecutar semillas desde línea de comandos
npm run prisma:db:seed
```

### Opción 2: API REST

#### Verificar estado de la base de datos
```http
GET /seed/status
```

**Respuesta:**
```json
{
  "needsSeeding": true,
  "message": "Database is empty and needs seeding"
}
```

#### Ejecutar semillas
```http
POST /seed/run
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Database seeding completed successfully!",
  "summary": {
    "programs": 4,
    "roles": 6,
    "users": 5,
    "categories": 6,
    "maintenanceTypes": 4,
    "resources": 4
  }
}
```

**Respuesta si ya hay datos:**
```json
{
  "success": true,
  "message": "Database already contains data. Skipping seeding."
}
```

## 🔧 Configuración Técnica

### Archivos Principales
- `prisma/seed-simple.ts`: Script principal de semillas
- `src/libs/common/services/seed.service.ts`: Servicio de semillas
- `src/apps/auth-service/infrastructure/controllers/seed.controller.ts`: Controlador REST

### Dependencias
- `@prisma/client`: Cliente de base de datos
- `bcrypt`: Hash de contraseñas
- `@nestjs/common`: Framework base

### Scripts de Package.json
```json
{
  "scripts": {
    "prisma:db:seed": "ts-node prisma/seed-simple.ts"
  }
}
```

## 🛡️ Seguridad

- Las contraseñas se almacenan hasheadas con bcrypt
- Solo se ejecuta si la base de datos está vacía
- Logging detallado de todas las operaciones
- Validación de datos antes de inserción

## 📝 Logs

El módulo genera logs detallados:
```
🌱 Starting database seeding...
📚 Seeding Programs...
👥 Seeding Roles and Permissions...
👤 Seeding Users...
🏷️ Seeding Categories and Maintenance Types...
🏢 Seeding Resources...
📅 Seeding Basic Availability...
✅ Database seeding completed successfully!
```

## 🔄 Extensión

Para agregar más datos iniciales:

1. **Editar el SeedService**: Agregar nuevos métodos privados
2. **Actualizar el método principal**: Llamar los nuevos métodos
3. **Mantener idempotencia**: Verificar que no se dupliquen datos

### Ejemplo de extensión:
```typescript
private async seedNotificationChannels() {
  this.logger.log('📢 Seeding Notification Channels...');
  
  const channelsData = [
    {
      name: 'Email',
      type: 'EMAIL',
      displayName: 'Correo Electrónico',
      description: 'Notificaciones por email',
      isActive: true
    }
  ];

  // ... lógica de inserción
}
```

## 🧪 Testing

Para probar el módulo:

1. **Limpiar base de datos**: Eliminar todos los registros
2. **Ejecutar semillas**: `npm run prisma:db:seed`
3. **Verificar datos**: Revisar que se crearon correctamente
4. **Probar idempotencia**: Ejecutar nuevamente y verificar que no se dupliquen

## 📋 Cumplimiento con Arquitectura Bookly

El módulo sigue los principios establecidos:
- ✅ **Clean Architecture**: Separación de responsabilidades
- ✅ **CQRS**: Comandos y consultas separados
- ✅ **Event-Driven**: Preparado para eventos futuros
- ✅ **Logging estructurado**: Winston para trazabilidad
- ✅ **Validación de datos**: DTOs y validaciones
- ✅ **Documentación Swagger**: Endpoints documentados

## 🔗 Referencias

- [Documentación Prisma Seeds](https://www.prisma.io/docs/guides/database/seed-database)
- [NestJS Modules](https://docs.nestjs.com/modules)
- [Bookly Architecture](./bookly-base.md)
