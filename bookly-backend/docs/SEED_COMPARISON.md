# Comparación: seed.ts vs seed-simple.ts

## 📋 Resumen Ejecutivo

| Aspecto | seed.ts | seed-simple.ts |
|---------|---------|----------------|
| **Líneas de código** | 690 líneas | 479 líneas |
| **Complejidad** | Alta | Baja |
| **Funcionalidades** | Completas (9 módulos) | Esenciales (6 módulos) |
| **Estado** | ✅ Corregido | ✅ Funcional |
| **Recomendación** | Para desarrollo completo | Para inicio rápido |

## 🔍 Diferencias Principales

### **1. Funcionalidades Incluidas**

#### seed.ts (Completo)
```typescript
// 9 módulos de inicialización:
1. seedPrograms()                    // ✅ Programas académicos
2. seedRolesAndPermissions()         // ✅ Roles y permisos
3. seedUsers()                       // ✅ Usuarios de prueba
4. seedCategoriesAndMaintenanceTypes() // ✅ Categorías y tipos de mantenimiento
5. seedResources()                   // ✅ Recursos básicos
6. seedApprovalFlows()               // 🆕 Flujos de aprobación
7. seedTemplates()                   // 🆕 Plantillas de documentos y notificaciones
8. seedNotificationSystem()          // 🆕 Sistema de notificaciones
9. seedSampleData()                  // 🆕 Datos de ejemplo y disponibilidad
```

#### seed-simple.ts (Esencial)
```typescript
// 6 módulos de inicialización:
1. seedPrograms()                    // ✅ Programas académicos
2. seedRolesAndPermissions()         // ✅ Roles y permisos
3. seedUsers()                       // ✅ Usuarios de prueba
4. seedCategoriesAndMaintenanceTypes() // ✅ Categorías y tipos de mantenimiento
5. seedResources()                   // ✅ Recursos básicos
6. seedBasicAvailability()           // ✅ Disponibilidad básica
```

### **2. Datos Creados**

#### Datos Comunes (Ambos archivos)
- ✅ **4 Programas académicos**: ING-SIS, MED-GEN, DER-GEN, ADM-EMP
- ✅ **6 Roles predefinidos**: Estudiante, Docente, Admin General, Admin Programa, Vigilante, Administrativo
- ✅ **5 Usuarios de prueba**: admin, admin.sistemas, docente, estudiante, vigilante
- ✅ **6 Categorías de recursos**: Salón, Laboratorio, Auditorio, Equipo Multimedia, Biblioteca, Oficina
- ✅ **4 Tipos de mantenimiento**: PREVENTIVO, CORRECTIVO, EMERGENCIA, LIMPIEZA
- ✅ **4 Recursos de ejemplo**: Aula 101, Lab Sistemas, Auditorio Principal, Proyector Epson

#### Datos Adicionales en seed.ts
- 🆕 **Flujos de aprobación**: Configuración de niveles de aprobación por categoría
- 🆕 **Plantillas de documentos**: Cartas de aprobación en HTML
- 🆕 **Plantillas de notificaciones**: Templates para emails y notificaciones
- 🆕 **Canales de notificación**: Email y Push notifications
- 🆕 **Configuraciones de notificación**: Eventos y triggers
- 🆕 **Horarios programados**: Mantenimiento de limpieza recurrente

### **3. Arquitectura y Complejidad**

#### seed.ts
```typescript
// Arquitectura completa con modelos avanzados
- ApprovalFlow y ApprovalLevel
- DocumentTemplate y NotificationTemplate  
- NotificationChannel y NotificationConfig
- Schedule con patrones de recurrencia
- Availability con configuración detallada
```

#### seed-simple.ts
```typescript
// Arquitectura básica con modelos esenciales
- User, Role, Permission, UserRole, RolePermission
- Program, Resource, Category, MaintenanceType
- ResourceCategory, Availability
- Enfoque en funcionalidad core
```

### **4. Casos de Uso Recomendados**

#### Usar seed.ts cuando:
- ✅ Necesitas el sistema completo de aprobaciones
- ✅ Requieres plantillas de documentos y notificaciones
- ✅ Planeas usar el sistema de notificaciones avanzado
- ✅ Necesitas horarios programados y mantenimiento automático
- ✅ Desarrollo de funcionalidades avanzadas (Hitos 3-6)

#### Usar seed-simple.ts cuando:
- ✅ Inicio rápido del proyecto
- ✅ Desarrollo de funcionalidades básicas (Hitos 1-2)
- ✅ Testing y pruebas unitarias
- ✅ Entornos de desarrollo ligeros
- ✅ Demos y prototipos

### **5. Correcciones Realizadas en seed.ts**

#### Problemas Encontrados y Solucionados:
```typescript
// ❌ Problema: dayOfWeek como string
dayOfWeek: 'MONDAY'
isAvailable: true

// ✅ Solución: dayOfWeek como número
dayOfWeek: 1  // Monday
isActive: true
```

#### Cambios Específicos:
1. **Availability.dayOfWeek**: Cambiado de strings a números (1-7)
2. **Availability.isAvailable**: Cambiado a `isActive` según schema
3. **Schedule.dayOfWeek**: Cambiado de string a número
4. **recurrencePattern.daysOfWeek**: Array de números en lugar de strings

### **6. Performance y Mantenimiento**

| Aspecto | seed.ts | seed-simple.ts |
|---------|---------|----------------|
| **Tiempo de ejecución** | ~3-5 segundos | ~1-2 segundos |
| **Registros creados** | ~150+ registros | ~50+ registros |
| **Dependencias** | Modelos avanzados | Modelos básicos |
| **Mantenimiento** | Complejo | Simple |
| **Testing** | Requiere más setup | Fácil de probar |

### **7. Comandos de Ejecución**

```bash
# Para seed completo (seed.ts)
npm run prisma:db:seed:full

# Para seed básico (seed-simple.ts) - ACTUAL
npm run prisma:db:seed
```

## 🎯 Recomendaciones

### **Para Desarrollo Inicial** → Usar `seed-simple.ts`
- Inicio rápido y funcional
- Menos dependencias
- Fácil de debuggear
- Cumple requisitos básicos

### **Para Producción Completa** → Usar `seed.ts`
- Sistema completo de aprobaciones
- Plantillas y notificaciones
- Horarios programados
- Funcionalidades avanzadas

### **Migración Gradual**
1. Comenzar con `seed-simple.ts`
2. Desarrollar funcionalidades básicas
3. Migrar a `seed.ts` cuando se necesiten funcionalidades avanzadas
4. Mantener ambos archivos para diferentes entornos

## 📝 Scripts NPM Sugeridos

```json
{
  "scripts": {
    "prisma:db:seed": "ts-node prisma/seed-simple.ts",
    "prisma:db:seed:full": "ts-node prisma/seed.ts",
    "prisma:db:seed:clean": "prisma db push --force-reset && npm run prisma:db:seed",
    "prisma:db:seed:full:clean": "prisma db push --force-reset && npm run prisma:db:seed:full"
  }
}
```

## ✅ Estado Actual

- **seed-simple.ts**: ✅ Funcional y probado
- **seed.ts**: ✅ Corregido y listo para uso
- **Documentación**: ✅ Completa
- **Integración API**: ✅ Disponible en auth-service

Ambos archivos están listos para uso según las necesidades del proyecto.
