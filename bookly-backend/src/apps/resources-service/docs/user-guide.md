# Bookly Resources Service - Guía de Usuario

## Índice

- [🚀 Introducción](#-introducción)
- [🔐 Acceso al Sistema](#-acceso-al-sistema)
- [🏢 Gestión de Recursos](#-gestión-de-recursos)
- [🏷️ Sistema de Categorías](#-sistema-de-categorías)
- [📥 Importación Masiva](#-importación-masiva)
- [🔧 Gestión de Mantenimiento](#-gestión-de-mantenimiento)
- [🎓 Programas Académicos](#-programas-académicos)
- [🔧 Resolución de Problemas](#-resolución-de-problemas)
- [❓ Preguntas Frecuentes](#-preguntas-frecuentes)
- [🚀 Funciones Avanzadas](#-funciones-avanzadas)
- [📞 Contacto y Soporte](#-contacto-y-soporte)

---

## 🚀 Introducción

El **Resources Service** de Bookly es el microservicio central para la gestión de todos los recursos físicos de la Universidad Francisco de Paula Santander (UFPS). Este servicio implementa los requerimientos funcionales RF-01 a RF-06, proporcionando funcionalidades completas para:

- **Gestión integral de recursos** (salones, laboratorios, auditorios, equipos)
- **Sistema de categorías dinámico** con clasificación por tipo y programa
- **Importación masiva** desde archivos CSV/Excel con validación automática
- **Mantenimiento programado** preventivo, correctivo y de emergencia
- **Control de acceso por programas** académicos con niveles de restricción
- **Auditoría completa** de modificaciones y operaciones

### URLs de Acceso

- **Producción**: `https://bookly.ufps.edu.co/resources`
- **Desarrollo**: `https://ufps.booklyapp.com/resources`
- **API Base**: `https://api.bookly.ufps.edu.co/resources`
- **Documentación API**: `https://api.bookly.ufps.edu.co/resources/docs`

### Roles de Usuario

| Rol | Permisos | Descripción |
|-----|----------|-------------|
| **Administrador General** | Gestión completa | Control total del sistema de recursos |
| **Administrador de Programa** | Recursos del programa | Gestión de recursos asignados a su programa académico |
| **Administrativo General** | Operaciones administrativas | Consulta y operaciones de mantenimiento |
| **Personal de Mantenimiento** | Mantenimiento técnico | Ejecución y seguimiento de mantenimientos |
| **Docente** | Consulta y uso | Visualización de recursos y solicitud de uso |
| **Estudiante** | Solo consulta | Información básica de recursos disponibles |
| **Vigilante** | Validación física | Verificación de acceso y estado de recursos |

---

## 🔐 Acceso al Sistema

### Autenticación

1. **Inicia sesión** en el sistema Bookly con tus credenciales UFPS
2. **Navega** al módulo de "Gestión de Recursos"
3. **Verifica** que tienes los permisos necesarios según tu rol

## 🌐 URLs de Acceso

| Entorno | URL Base | Descripción |
|---------|----------|-------------|
| **Producción** | `https://bookly.ufps.edu.co/resources` | Aplicación web principal |
| **Staging** | `https://ufps.booklyapp.com/resources` | Entorno de desarrollo |
| **Desarrollo** | `http://localhost:3100/resources` | Entorno de desarrollo |
| **API Base** | `https://ufps.booklyapp.com/api/v1/resources` | Endpoints REST del servicio |
| **API Docs** | `https://ufps.booklyapp.com/api/v1/resources/docs` | Documentación Swagger/OpenAPI |

## 🏢 Gestión de Recursos

### Crear Nuevo Recurso (RF-01)

**URL**: `/resources/new` | `/resources/new`

**Proceso**:

1. **Haz clic** en "Crear Recurso"
2. **Completa información básica**:

   ```
   📝 Nombre: Salón 201-A
   📋 Descripción: Salón de clases con capacidad para 30 estudiantes
   🏷️ Tipo: Salón de Clase
   👥 Capacidad: 30 personas
   ```

3. **Configura ubicación**:

   ```
   🏢 Edificio: Ingeniería de Sistemas
   📊 Piso: 2
   🚪 Salón: 201-A
   📍 Referencia: Frente a laboratorios
   ```

4. **Define atributos específicos**:

   ```
   Para SALONES:
   ✅ Proyector: Sí
   ❄️ Aire Acondicionado: Sí
   📺 Tipo de Tablero: Inteligente
   💡 Iluminación: LED
   🔊 Sistema de Sonido: No
   
   Para LABORATORIOS:
   🔬 Especialidad: Redes y Comunicaciones
   📋 Lista de Equipos: 20 PCs, 2 Switches, Router
   🛡️ Nivel de Seguridad: 3 (de 5)
   🌪️ Ventilación: Mecánica
   ```

5. **Selecciona equipamiento**:

   ```
   📺 Proyector Epson
   🖥️ PC Lenovo (25 unidades)
   🌐 Router Cisco
   🔌 Extensiones eléctricas (10)
   ```

6. **Haz clic** en "Crear Recurso"
7. **El sistema genera automáticamente** el código único (ej: REC-SYS-201A-2025)

**Código de Ejemplo**:

```json
{
  "name": "Salón 201-A",
  "description": "Salón de clases con capacidad para 30 estudiantes",
  "type": "SALON",
  "capacity": 30,
  "location": {
    "building": "Ingeniería de Sistemas",
    "floor": 2,
    "room": "201-A"
  },
  "attributes": {
    "hasProjector": true,
    "hasAirConditioning": true,
    "boardType": "smartboard",
    "lightingType": "led"
  },
  "equipment": [
    {"name": "Proyector Epson", "quantity": 1},
    {"name": "PC Lenovo", "quantity": 25}
  ]
}
```

### Consultar Recursos

**URL**: `/resources`

**Filtros Disponibles**:

```
🏷️ Tipo de Recurso: Todos, Salón, Laboratorio, Auditorio
📊 Estado: Activo, Inactivo, Mantenimiento
🏢 Edificio: Sistemas, Medicina, Ingeniería Civil
📊 Piso: 1, 2, 3, 4
👥 Capacidad: Mín 10 - Máx 100 personas
🏷️ Categoría: Académico, Investigación, Administrativo
```

**Vista de Lista**:

```
┌─────────────────────────────────────────────────────────────┐
│ CÓDIGO        │ NOMBRE        │ TIPO      │ CAPACIDAD │ ESTADO │
├─────────────────────────────────────────────────────────────┤
│ REC-SYS-201A  │ Salón 201-A   │ SALON     │ 30        │ ✅ ACTIVO│
│ REC-LAB-301B  │ Lab Redes     │ LAB       │ 25        │ 🔧 MANT. │
│ REC-AUD-MAIN  │ Auditorio     │ AUDIT     │ 200       │ ✅ ACTIVO│
└─────────────────────────────────────────────────────────────┘
```

**Vista de Tarjetas**:

```
┌─────────────────────────────────────┐
│ 🏢 SALÓN 201-A                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 📍 Edificio Sistemas, Piso 2       │
│ 👥 Capacidad: 30 personas          │
│ 📺 Proyector ✅ A/C ✅ WiFi ✅      │
│ 🟢 Estado: Disponible              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ [Ver Detalles] [Editar] [Reservar] │
└─────────────────────────────────────┘
```

### Editar Recurso

**Proceso**:

1. **Busca** el recurso en la lista
2. **Haz clic** en "Editar" o en el ícono ✏️
3. **Modifica** los campos necesarios
4. **Revisa** que los cambios no afecten reservas activas
5. **Guarda** los cambios

**Validaciones del Sistema**:

- ⚠️ Si hay reservas activas, algunos cambios están restringidos
- ✅ Cambios menores (descripción, equipamiento) son permitidos
- 🛑 Cambios de capacidad o tipo requieren confirmación adicional

## 🏷️ Sistema de Categorías (RF-02)

### Crear Categorías

**URL**: `/categories/new`

**Categorías Predefinidas**:

```
📚 ACADÉMICO
├── Salones de Clase
├── Laboratorios de Enseñanza
└── Salas de Estudio

🔬 INVESTIGACIÓN
├── Laboratorios Especializados
├── Salas de Proyectos
└── Centros de Innovación

🏛️ ADMINISTRATIVO
├── Salas de Juntas
├── Oficinas
└── Espacios de Reunión

🎭 CULTURAL Y DEPORTIVO
├── Auditorios
├── Canchas Deportivas
└── Espacios Artísticos
```

**Crear Nueva Categoría**:

1. **Completa información**:

   ```
   📝 Nombre: Laboratorios de Biotecnología
   📋 Descripción: Espacios especializados para investigación en biotecnología
   🎨 Color: #28A745 (Verde)
   🔍 Icono: microscope
   📁 Categoría Padre: INVESTIGACIÓN
   ```

2. **Haz clic** en "Crear Categoría"

### Asignar Recursos a Categorías

**Proceso**:

1. **Selecciona** el recurso a categorizar
2. **Ve** a la pestaña "Categorías"
3. **Marca** las categorías aplicables:

   ```
   ✅ Académico > Laboratorios de Enseñanza
   ✅ Investigación > Laboratorios Especializados
   ❌ Administrativo
   ```

4. **Guarda** la asignación

## 📥 Importación Masiva (RF-04)

### Preparar Archivo de Importación

**Formatos Soportados**: CSV, Excel (.xlsx, .xls)

**Plantilla de Ejemplo**:

```csv
name,type,capacity,building,floor,room,description,hasProjector,hasAC
Salón 101-A,SALON,25,Sistemas,1,101-A,Salón básico de clases,true,false
Salón 102-A,SALON,30,Sistemas,1,102-A,Salón con equipamiento multimedia,true,true
Lab Redes,LABORATORIO,20,Sistemas,3,301-B,Laboratorio de redes y telecomunicaciones,true,true
```

**Campos Obligatorios**:

- `name`: Nombre del recurso
- `type`: Tipo (SALON, LABORATORIO, AUDITORIO, EQUIPO)
- `capacity`: Capacidad numérica
- `building`: Nombre del edificio
- `floor`: Número del piso

**Campos Opcionales**:

- `description`: Descripción del recurso
- `room`: Identificador del salón/espacio
- Atributos específicos según el tipo

### Proceso de Importación

**URL**: `/resources/import`

#### Paso 1: Subir Archivo

1. **Haz clic** en "Importar Recursos"
2. **Selecciona** tu archivo CSV/Excel
3. **El sistema muestra**:

   ```
   📄 Archivo: recursos_sistemas_2025.csv
   📊 Tamaño: 245 KB
   📋 Registros detectados: 127
   ✅ Formato: Válido
   ```

#### Paso 2: Previsualización

**El sistema muestra**:

```
┌─────────────────────────────────────────────────────────────┐
│ PREVISUALIZACIÓN (Primeros 5 registros)                     │
├─────────────────────────────────────────────────────────────┤
│ ✅ Salón 101-A    │ SALON     │ 25  │ Sistemas │ 1         │
│ ✅ Salón 102-A    │ SALON     │ 30  │ Sistemas │ 1         │
│ ⚠️ Lab Redes      │ LAB       │ 20  │ Sistemas │ 3         │
│ ❌ Auditorio      │ INVALID   │ 0   │ -        │ -         │
│ ✅ Sala Juntas    │ ADMIN     │ 15  │ Sistemas │ 2         │
└─────────────────────────────────────────────────────────────┘

📊 RESUMEN DE VALIDACIÓN:
✅ Registros Válidos: 124
⚠️ Registros con Advertencias: 2
❌ Registros con Errores: 1

⚠️ ADVERTENCIAS:
• Fila 3: "Lab Redes" - Tipo 'LAB' será convertido a 'LABORATORIO'
• Fila 25: Capacidad muy alta (500) - Revisar si es correcta

❌ ERRORES:
• Fila 4: "Auditorio" - Tipo 'INVALID' no es válido
```

#### Paso 3: Configurar Opciones

```
⚙️ OPCIONES DE IMPORTACIÓN:
☑️ Generar códigos únicos automáticamente
☑️ Notificar por email cuando termine
☑️ Crear categorías faltantes automáticamente
☐ Sobrescribir recursos existentes
☑️ Activar recursos importados por defecto

🏷️ CATEGORÍA POR DEFECTO: Recursos Importados
👤 RESPONSABLE: Tu nombre (usuario actual)
```

#### Paso 4: Iniciar Importación

1. **Revisa** la configuración
2. **Haz clic** en "Iniciar Importación"
3. **El sistema muestra** progreso en tiempo real:

```
🚀 IMPORTACIÓN EN PROGRESO...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 75% (95/127)

📊 Estado Actual:
✅ Procesados: 95
✅ Exitosos: 92
⚠️ Con Advertencias: 2
❌ Fallidos: 1
⏱️ Tiempo Estimado Restante: 2 minutos

Procesando: "Lab Microbiología - Piso 4"...
```

#### Paso 5: Revisión de Resultados

**Al completarse**:

```
🎉 IMPORTACIÓN COMPLETADA

📊 RESULTADOS FINALES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Recursos creados: 124
⚠️ Con advertencias: 2  
❌ Fallidos: 1
⏱️ Tiempo total: 3 minutos 42 segundos

📧 Reporte detallado enviado a: tu-email@ufps.edu.co
```

### Gestión de Importaciones

**Ver Historial**:

```
┌────────────────────────────────────────────────────────────┐
│ HISTORIAL DE IMPORTACIONES                                 │
├────────────────────────────────────────────────────────────┤
│ 2025-09-15 │ recursos_sistemas.csv     │ 127/127 ✅ │ COMPLETADO │
│ 2025-09-10 │ equipos_laboratorio.xlsx  │ 45/47 ⚠️   │ COMPLETADO │
│ 2025-09-08 │ salones_medicina.csv      │ 0/89 ❌    │ FALLIDO    │
└────────────────────────────────────────────────────────────┘
```

## 🔧 Gestión de Mantenimiento (RF-06)

### Programar Mantenimiento

**URL**: `/maintenance/new`

#### Tipos de Mantenimiento

```
🔄 PREVENTIVO:
- Limpieza general
- Calibración de equipos
- Inspección de seguridad
- Actualización de software

🛠️ CORRECTIVO:
- Reparación de daños
- Reemplazo de componentes
- Solución de problemas reportados

🚨 EMERGENCIA:
- Fallas críticas de seguridad
- Daños que impiden el uso
- Situaciones que requieren atención inmediata
```

#### Crear Programa de Mantenimiento

1. **Selecciona** el recurso a mantener
2. **Completa información**:

   ```
   🏷️ Título: Mantenimiento Mensual - Lab Redes
   📝 Descripción: Limpieza, calibración y actualización de equipos
   🔧 Tipo: Preventivo
   📅 Fecha Programada: 2025-09-15 08:00
   ⏱️ Duración Estimada: 4 horas
   🎯 Prioridad: Media
   👤 Asignado a: Carlos Martínez (Técnico)
   ```

3. **Configurar recurrencia** (opcional):

   ```
   🔄 Repetir cada: 1 mes
   📅 Hasta: 2025-09-30
   📋 Excepciones: Semana Santa, Vacaciones de mitad de año
   ```

### Seguimiento de Mantenimiento

**Dashboard de Mantenimiento**:

```
📊 ESTADO GENERAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Programados esta semana: 8
🔧 En progreso: 3
✅ Completados este mes: 24
⚠️ Vencidos: 1
🚨 Urgentes: 0

🔧 MANTENIMIENTOS ACTIVOS:
┌──────────────────────────────────────────────────────────┐
│ Lab Química - Limpieza      │ Carlos M. │ 50% │ 2h restantes │
│ Salón 201 - Reparación AC   │ Ana L.    │ 80% │ 30m restantes│
│ Auditorio - Calibración     │ Luis R.   │ 25% │ 3h restantes │
└──────────────────────────────────────────────────────────┘
```

### Ejecutar Mantenimiento

**Para Personal Técnico**:

1. **Ve** a "Mis Asignaciones"
2. **Selecciona** el mantenimiento a ejecutar
3. **Marca** inicio:

   ```
   🚀 INICIAR MANTENIMIENTO
   📍 Recurso: Lab de Redes (REC-LAB-301B)
   ⏰ Hora de Inicio: 08:30
   📋 Actividades Programadas:
   ☐ Limpieza de equipos
   ☐ Verificación de conexiones
   ☐ Actualización de software
   ☐ Pruebas de funcionamiento
   ```

4. **Registra** progreso:

   ```
   ✅ Limpieza completada - 9:15 AM
   ⏳ Verificando conexiones... - 9:30 AM
   ⚠️ Encontrado cable dañado - requiere reemplazo
   ```

5. **Finaliza** y reporta:

   ```
   ✅ MANTENIMIENTO COMPLETADO
   ⏰ Duración real: 3.5 horas
   💰 Costo: $150,000 (cable de red)
   📝 Observaciones: Todo funcionando correctamente
   🔄 Próximo mantenimiento: 2025-09-15
   ```

## 🎓 Programas Académicos (RF-02)

### Asociar Recursos a Programas

**URL**: `/resources/{id}/programs`

#### Niveles de Acceso

```
🟢 COMPLETO: Uso libre del recurso
🟡 RESTRINGIDO: Requiere aprobación previa
🔴 SUPERVISADO: Requiere presencia de responsable
```

#### Proceso de Asociación

1. **Selecciona** el recurso
2. **Ve** a "Programas Asociados"
3. **Agrega** programas:

   ```
   ✅ Ingeniería de Sistemas - COMPLETO
   ✅ Ingeniería de Telecomunicaciones - COMPLETO
   ⚠️ Ingeniería Civil - RESTRINGIDO
   🔴 Medicina - SUPERVISADO
   ```

4. **Configura restricciones** (si aplica):

   ```
   Para Ingeniería Civil (RESTRINGIDO):
   - Solo horarios académicos (7AM - 6PM)
   - Máximo 2 horas por reserva
   - Aprobación del coordinador requerida
   
   Para Medicina (SUPERVISADO):
   - Solo con profesor presente
   - Actividades específicas autorizadas
   - Registro de actividades obligatorio
   ```

### Consultar Recursos por Programa

**Filtro por Programa**:

```
🏛️ Programa: Ingeniería de Sistemas
📊 Recursos disponibles: 45
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 Salones: 15
🔬 Laboratorios: 12
🎭 Auditorios: 3
💻 Equipos: 15
```

## 🔧 Resolución de Problemas

### Problemas Comunes

#### 1. "No puedo crear recursos"

**Causa**: Permisos insuficientes  
**Solución**:

- Verifica que tienes rol ADMIN o PROGRAM_ADMIN
- Contacta al administrador del sistema
- Revisa que tu cuenta esté activa

#### 2. "La importación falla constantemente"

**Causa**: Formato de archivo incorrecto  
**Solución**:

- Usa la plantilla oficial proporcionada
- Verifica que todos los campos obligatorios estén completos
- Revisa que los tipos de recurso sean válidos
- Elimina caracteres especiales de los nombres

#### 3. "El mantenimiento no se puede programar"

**Causa**: Conflicto con reservas existentes  
**Solución**:

- Verifica disponibilidad del recurso en la fecha
- Contacta usuarios con reservas para reprogramar
- Programa fuera de horarios académicos
- Usa prioridad ALTA para mantenimientos urgentes

#### 4. "Los códigos de recursos se duplican"

**Causa**: Error en el sistema de generación  
**Solución**:

- El sistema debería prevenir esto automáticamente
- Si ocurre, contacta soporte técnico inmediatamente
- Proporciona los códigos duplicados

### Códigos de Error Comunes

| Código | Descripción | Solución |
|--------|-------------|----------|
| **RSRC-001** | Código de recurso duplicado | Sistema genera automáticamente - contacta soporte |
| **RSRC-002** | Tipo de recurso inválido | Usa: SALON, LABORATORIO, AUDITORIO, EQUIPO |
| **RSRC-003** | Capacidad inválida | Debe ser número positivo mayor a 0 |
| **IMPT-001** | Formato de archivo no soportado | Usa CSV, XLSX o XLS únicamente |
| **IMPT-002** | Archivo demasiado grande | Máximo 50MB por archivo |
| **MNTC-001** | Fecha de mantenimiento en el pasado | Selecciona fecha futura |

## ❓ Preguntas Frecuentes

### Generales

**P: ¿Cuántos recursos puedo crear?**  
R: No hay límite específico. El sistema está optimizado para manejar miles de recursos.

**P: ¿Se pueden modificar recursos con reservas activas?**  
R: Cambios menores sí (descripción, equipamiento). Cambios estructurales requieren que no haya reservas activas.

**P: ¿Los códigos de recursos se pueden personalizar?**  
R: Los códigos se generan automáticamente siguiendo el patrón REC-[BUILDING]-[ROOM]-[YEAR]. No se pueden personalizar manualmente.

### Importación

**P: ¿Qué pasa si mi archivo tiene errores?**  
R: El sistema mostrará una previsualización con errores señalados. Solo se importarán registros válidos.

**P: ¿Puedo importar el mismo archivo varias veces?**  
R: Sí, pero evita duplicados. El sistema puede detectar recursos existentes por nombre y ubicación.

**P: ¿Hay límite en el tamaño del archivo?**  
R: El límite es 50MB por archivo. Para archivos mayores, divide en múltiples importaciones.

### Mantenimiento

**P: ¿Puedo cancelar un mantenimiento programado?**  
R: Sí, siempre que no haya iniciado. Una vez iniciado, debe completarse o postponerse.

**P: ¿Qué pasa si el mantenimiento toma más tiempo?**  
R: El técnico puede extender el tiempo registrando la justificación en el sistema.

**P: ¿Se notifica automáticamente a los usuarios sobre mantenimientos?**  
R: Sí, el sistema envía notificaciones con 48 horas de anticipación a usuarios con reservas.

### Categorías y Programas

**P: ¿Un recurso puede pertenecer a múltiples categorías?**  
R: Sí, los recursos pueden tener múltiples categorías asignadas.

**P: ¿Cómo afectan las restricciones de programa a las reservas?**  
R: Las restricciones se aplican automáticamente cuando usuarios de esos programas intentan reservar.

---

## 🚀 Funciones Avanzadas

### API para Desarrolladores

Para integraciones personalizadas:

**Endpoints Principales**:

```http
GET /api/v1/resources              # Listar recursos
POST /api/v1/resources             # Crear recurso
PUT /api/v1/resources/{id}         # Actualizar recurso
DELETE /api/v1/resources/{id}      # Eliminar recurso
```

**Autenticación**: Bearer Token JWT requerido

### Automatización

#### Importación Programada

- **Configurar** importaciones automáticas desde sistemas externos
- **Sincronizar** con sistemas académicos institucionales
- **Actualizar** disponibilidad basada en horarios de clase

#### Mantenimiento Predictivo (Proximamente)

- **Análisis** de patrones de uso
- **Predicción** de necesidades de mantenimiento
- **Alertas** tempranas de posibles fallos

---

## 📞 Contacto y Soporte

**Para Soporte Técnico**:

- 📧 Email: <soporte-bookly@ufps.edu.co> | <soporte@ufps.booklyapp.com>
- **WhatsApp**: +57 300 123 4567

Cuando contactes soporte, incluye:

- **Usuario y rol**
- **Acción que intentabas realizar**
- **Mensaje de error exacto**
- **Capturas de pantalla**
- **Archivo problemático** (para importaciones)

---

**Documento**: User Guide - Resources Service  
**Última actualización**: 31 de Agosto, 2025  
**Versión**: 2.0.0  
**Autor**: Equipo de Desarrollo Bookly  
**Revisor**: Arquitecto de Sistemas  
**Estado**: ✅ Documentación Completa y Validada

*Universidad Francisco de Paula Santander - Sistema Bookly de Reservas Institucionales*
