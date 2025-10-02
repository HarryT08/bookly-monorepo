# Hito 6 - Extensiones al Diagrama de Clases Base

## Nuevos Modelos Agregados

### 1. Program (Programa Académico)
```typescript
model Program {
  id: String @id @default(auto()) @map("_id") @db.ObjectId
  name: String @unique
  code: String @unique // Código único del programa (ej: "ING-SIS", "MED-GEN")
  description: String?
  facultyName: String // Facultad a la que pertenece
  isActive: Boolean @default(true)
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  
  // Relations
  resources: Resource[] // Recursos asignados a este programa
  userRoles: UserRole[] // Roles de usuarios en este programa
  approvalFlows: ApprovalFlow[] // Flujos de aprobación específicos
}
```

### 2. ResourceProgram (Tabla de unión para múltiples categorías)
```typescript
model ResourceCategory {
  id: String @id @default(auto()) @map("_id") @db.ObjectId
  resourceId: String @db.ObjectId
  categoryId: String @db.ObjectId
  assignedAt: DateTime @default(now())
  assignedBy: String @db.ObjectId // Usuario que asignó la categoría
  
  // Relations
  resource: Resource @relation(fields: [resourceId], references: [id])
  category: Category @relation(fields: [categoryId], references: [id])
  
  @@unique([resourceId, categoryId])
}
```

### 3. MaintenanceType (Tipos de Mantenimiento Dinámicos)
```typescript
model MaintenanceType {
  id: String @id @default(auto()) @map("_id") @db.ObjectId
  name: String @unique // PREVENTIVO, CORRECTIVO, EMERGENCIA, etc.
  description: String?
  color: String? // Para UI
  priority: Int @default(0) // Prioridad del tipo de mantenimiento
  isDefault: Boolean @default(false) // Los tipos mínimos no se pueden eliminar
  isActive: Boolean @default(true)
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  
  // Relations
  maintenances: Maintenance[]
}
```

### 4. ResourceImport (Registro de Importaciones)
```typescript
model ResourceImport {
  id: String @id @default(auto()) @map("_id") @db.ObjectId
  filename: String
  originalFilename: String
  totalRows: Int
  successfulRows: Int
  failedRows: Int
  status: String // PROCESSING, COMPLETED, FAILED, CANCELLED
  errors: Json? // Detalles de errores por fila
  summary: Json? // Resumen de la importación
  
  // Metadata
  importedBy: String @db.ObjectId
  importedAt: DateTime @default(now())
  completedAt: DateTime?
  
  // Relations
  user: User @relation(fields: [importedBy], references: [id])
}
```

### 5. ResourceResponsible (Responsables de Recursos)
```typescript
model ResourceResponsible {
  id: String @id @default(auto()) @map("_id") @db.ObjectId
  resourceId: String @db.ObjectId
  userId: String @db.ObjectId
  assignedBy: String @db.ObjectId // Administrador que asignó
  assignedAt: DateTime @default(now())
  isActive: Boolean @default(true)
  
  // Relations
  resource: Resource @relation(fields: [resourceId], references: [id])
  user: User @relation(fields: [userId], references: [id])
  assignedByUser: User @relation("AssignedResponsible", fields: [assignedBy], references: [id])
  
  @@unique([resourceId, userId])
}
```

## Modelos Extendidos

### Resource (Extendido)
```typescript
// Campos agregados:
programId: String @db.ObjectId // Programa académico único
code: String @unique // Código único del recurso
defaultSchedule: Json? // Horario por defecto (6am-10pm, lun-sab)
defaultMaintenance: Json? // Mantenimiento por defecto (aseo cada 2 días)

// Relaciones agregadas:
program: Program @relation(fields: [programId], references: [id])
resourceCategories: ResourceCategory[] // Múltiples categorías
responsibles: ResourceResponsible[] // Responsables asignados
imports: ResourceImport[] // Importaciones relacionadas
```

### Category (Extendido)
```typescript
// Campos agregados:
isDefault: Boolean @default(false) // Categorías mínimas no eliminables
priority: Int @default(0) // Orden de visualización

// Relaciones agregadas:
resourceCategories: ResourceCategory[] // Relación con recursos
```

### Maintenance (Extendido)
```typescript
// Campos agregados:
maintenanceTypeId: String @db.ObjectId
reportedBy: String? @db.ObjectId // Usuario que reportó (puede ser estudiante)
severity: String @default("MEDIUM") // LOW, MEDIUM, HIGH, CRITICAL
evidence: Json? // Fotos, documentos adjuntos
estimatedDuration: Int? // Duración estimada en minutos
actualDuration: Int? // Duración real en minutos

// Relaciones agregadas:
maintenanceType: MaintenanceType @relation(fields: [maintenanceTypeId], references: [id])
reporter: User? @relation("ReportedMaintenance", fields: [reportedBy], references: [id])
```

## Nuevas Relaciones

1. **Program 1:N Resource** - Un programa puede tener muchos recursos
2. **Resource N:M Category** - Un recurso puede tener múltiples categorías
3. **Resource 1:N ResourceResponsible** - Un recurso puede tener múltiples responsables
4. **MaintenanceType 1:N Maintenance** - Un tipo puede tener múltiples mantenimientos
5. **User 1:N ResourceImport** - Un usuario puede realizar múltiples importaciones
6. **User 1:N ResourceResponsible** - Un usuario puede ser responsable de múltiples recursos

## Índices Recomendados

```sql
-- Para búsquedas por programa
CREATE INDEX idx_resource_program ON resources(programId);

-- Para búsquedas por código
CREATE INDEX idx_resource_code ON resources(code);
CREATE INDEX idx_program_code ON programs(code);

-- Para importaciones
CREATE INDEX idx_import_status ON resource_imports(status, importedAt);

-- Para mantenimientos
CREATE INDEX idx_maintenance_type ON maintenances(maintenanceTypeId, status);
CREATE INDEX idx_maintenance_resource ON maintenances(resourceId, scheduledDate);
```

## Eventos de Dominio Nuevos

1. **ResourceAssignedToProgram** - Cuando se asigna un recurso a un programa
2. **ResourceCategoryAdded/Removed** - Cuando se agregan/quitan categorías
3. **ResourceImportStarted/Completed/Failed** - Estados de importación
4. **ResourceResponsibleAssigned/Removed** - Asignación de responsables
5. **MaintenanceReported** - Cuando se reporta un daño/incidente
6. **MaintenanceTypeCreated** - Cuando se crea un nuevo tipo de mantenimiento
