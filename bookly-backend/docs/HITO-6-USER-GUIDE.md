# HITO 6 - Guía de Usuario
## Mejoras en Gestión de Recursos - Manual de Usuario

### 📖 Introducción

Esta guía describe las nuevas funcionalidades implementadas en el Hito 6 de Bookly para mejorar la gestión de recursos institucionales. Las mejoras incluyen:

- **Programas Académicos**: Asociación de recursos a programas específicos
- **Categorías Múltiples**: Un recurso puede pertenecer a varias categorías
- **Importación Masiva**: Carga de recursos mediante archivos CSV
- **Tipos de Mantenimiento**: Gestión flexible de tipos de mantenimiento
- **Responsables de Recursos**: Asignación de usuarios responsables por recurso

### 👥 Roles y Permisos

#### Administrador General
- **Acceso completo** a todas las funcionalidades
- Puede crear, modificar y eliminar programas académicos
- Gestiona importaciones masivas de recursos
- Asigna responsables a cualquier recurso
- Configura tipos de mantenimiento personalizados

#### Administrador de Programa
- **Acceso limitado** a recursos de su programa académico
- Puede importar recursos para su programa
- Asigna responsables dentro de su programa
- Consulta estadísticas de su programa

#### Usuarios Generales
- **Solo lectura** para consultas públicas
- Pueden ver recursos disponibles y sus características
- Acceso a información básica de programas y categorías

### 🎓 Gestión de Programas Académicos

#### ¿Qué es un Programa Académico?

Un programa académico es una clasificación que agrupa recursos según su uso institucional (Ingeniería de Sistemas, Medicina, Derecho, etc.). Cada recurso debe estar asociado a exactamente un programa académico.

#### Crear un Nuevo Programa

**Requisitos:**
- Rol: Administrador General
- Datos obligatorios: Nombre del programa
- Datos opcionales: Código, descripción, facultad

**Pasos:**
1. Acceder al módulo de "Programas Académicos"
2. Hacer clic en "Crear Programa"
3. Completar el formulario:
   - **Nombre**: Nombre completo del programa (ej: "Ingeniería de Sistemas")
   - **Código**: Código corto único (ej: "INGSIST") - opcional
   - **Descripción**: Descripción detallada del programa
   - **Facultad**: Nombre de la facultad a la que pertenece
4. Guardar los cambios

**Validaciones:**
- El nombre debe ser único en el sistema
- El código (si se especifica) debe ser único
- No se pueden crear programas duplicados

#### Modificar un Programa Existente

**Pasos:**
1. Buscar el programa en la lista
2. Hacer clic en "Editar"
3. Modificar los campos necesarios
4. Guardar los cambios

**Nota:** El código del programa no puede modificarse una vez creado.

#### Desactivar/Reactivar Programas

Los programas no se eliminan del sistema, solo se desactivan:

**Desactivar:**
- Solo Administradores Generales
- El programa deja de estar disponible para nuevos recursos
- Los recursos existentes mantienen su asociación

**Reactivar:**
- Solo Administradores Generales
- El programa vuelve a estar disponible

### 📂 Gestión de Categorías de Recursos

#### Categorías Múltiples

A diferencia de los programas académicos, un recurso puede pertenecer a múltiples categorías simultáneamente.

**Categorías por defecto (no eliminables):**
- Salón
- Laboratorio
- Auditorio
- Equipo Multimedia

#### Asignar Categorías a un Recurso

**Método 1: Asignación Individual**
1. Seleccionar el recurso
2. Ir a la sección "Categorías"
3. Hacer clic en "Asignar Categoría"
4. Seleccionar la categoría deseada
5. Confirmar la asignación

**Método 2: Asignación Múltiple**
1. Seleccionar el recurso
2. Hacer clic en "Gestionar Categorías"
3. Seleccionar múltiples categorías
4. Hacer clic en "Asignar Seleccionadas"

**Método 3: Reemplazo Completo**
1. Seleccionar el recurso
2. Hacer clic en "Reemplazar Categorías"
3. Seleccionar las nuevas categorías (las anteriores se removerán)
4. Confirmar el reemplazo

#### Operaciones Masivas

**Asignar una categoría a múltiples recursos:**
1. Ir al módulo "Categorías"
2. Seleccionar la categoría
3. Hacer clic en "Asignar a Recursos"
4. Seleccionar los recursos deseados
5. Confirmar la operación

### 📥 Importación Masiva de Recursos

#### Preparación del Archivo CSV

**Formato requerido:**
```csv
name,type,capacity,location,description,schedule,availability
"Aula 101","SALON",40,"Edificio A - Piso 1","Aula magistral con proyector","Monday-Saturday 06:00-22:00","AVAILABLE"
"Lab Sistemas","LABORATORIO",30,"Edificio B - Piso 2","Laboratorio de cómputo con 30 PCs","Monday-Friday 08:00-18:00","AVAILABLE"
"Auditorio Principal","AUDITORIO",200,"Edificio Central","Auditorio con sistema de sonido","Monday-Sunday 08:00-20:00","AVAILABLE"
```

**Campos obligatorios:**
- `name`: Nombre del recurso (único)
- `type`: Tipo de recurso (SALON, LABORATORIO, AUDITORIO, etc.)
- `capacity`: Capacidad máxima de personas

**Campos opcionales:**
- `location`: Ubicación física del recurso
- `description`: Descripción detallada
- `schedule`: Horario de disponibilidad (formato: "Days HH:MM-HH:MM")
- `availability`: Estado inicial (AVAILABLE, MAINTENANCE, UNAVAILABLE)

**Valores por defecto:**
- `schedule`: "Monday-Saturday 06:00-22:00"
- `availability`: "AVAILABLE"
- `description`: Se genera automáticamente si no se especifica

#### Proceso de Importación

**Paso 1: Vista Previa**
1. Ir al módulo "Importación de Recursos"
2. Hacer clic en "Nueva Importación"
3. Seleccionar el archivo CSV
4. Hacer clic en "Vista Previa"
5. Revisar los datos detectados:
   - ✅ Filas válidas (en verde)
   - ❌ Filas con errores (en rojo)
   - ⚠️ Advertencias (en amarillo)

**Paso 2: Corrección de Errores**
Si hay errores en la vista previa:
1. Descargar el archivo con errores marcados
2. Corregir los datos en el archivo original
3. Repetir la vista previa

**Paso 3: Iniciar Importación**
1. Una vez validados los datos, hacer clic en "Iniciar Importación"
2. El sistema procesará el archivo en segundo plano
3. Recibirás una notificación cuando termine

**Paso 4: Seguimiento**
1. Ir a "Mis Importaciones" para ver el progreso
2. Estados posibles:
   - **PENDING**: En cola para procesamiento
   - **PROCESSING**: Procesando datos
   - **COMPLETED**: Completada exitosamente
   - **FAILED**: Falló durante el procesamiento
   - **PARTIALLY_COMPLETED**: Completada con algunos errores

#### Errores Comunes y Soluciones

**Error: "Nombre duplicado"**
- **Causa**: Ya existe un recurso con ese nombre
- **Solución**: Cambiar el nombre o verificar si es el mismo recurso

**Error: "Tipo inválido"**
- **Causa**: El tipo especificado no existe en el sistema
- **Solución**: Usar tipos válidos (SALON, LABORATORIO, AUDITORIO, etc.)

**Error: "Capacidad inválida"**
- **Causa**: La capacidad no es un número válido
- **Solución**: Especificar un número entero positivo

**Error: "Formato de horario inválido"**
- **Causa**: El horario no sigue el formato esperado
- **Solución**: Usar formato "Monday-Friday 08:00-18:00"

#### Límites y Recomendaciones

**Límites técnicos:**
- Máximo 10,000 filas por archivo
- Tamaño máximo de archivo: 50MB
- Formatos soportados: CSV únicamente

**Recomendaciones:**
- Probar con archivos pequeños primero (10-50 recursos)
- Usar la vista previa siempre antes de importar
- Mantener copias de seguridad de los archivos originales
- Importar en horarios de baja actividad del sistema

### 🔧 Gestión de Tipos de Mantenimiento

#### Tipos por Defecto

El sistema incluye tres tipos de mantenimiento que no pueden modificarse:

1. **PREVENTIVO** (Verde - Prioridad 1)
   - Mantenimiento programado regular
   - Se ejecuta según calendario establecido

2. **CORRECTIVO** (Amarillo - Prioridad 2)
   - Reparación de fallas o problemas detectados
   - Se ejecuta cuando se reporta un problema

3. **EMERGENCIA** (Rojo - Prioridad 3)
   - Mantenimiento urgente por seguridad
   - Máxima prioridad, se ejecuta inmediatamente

#### Crear Tipos Personalizados

**Requisitos:**
- Rol: Administrador General o Administrador de Programa

**Pasos:**
1. Ir al módulo "Tipos de Mantenimiento"
2. Hacer clic en "Crear Tipo Personalizado"
3. Completar el formulario:
   - **Nombre**: Identificador único (ej: "LIMPIEZA_PROFUNDA")
   - **Descripción**: Descripción detallada del tipo
   - **Color**: Color para identificación visual (formato hexadecimal)
   - **Prioridad**: Número del 1-10 (1 = máxima prioridad)
4. Guardar el tipo

**Ejemplos de tipos personalizados:**
- LIMPIEZA_PROFUNDA (Azul - Prioridad 2)
- CALIBRACION_EQUIPOS (Morado - Prioridad 3)
- ACTUALIZACION_SOFTWARE (Cian - Prioridad 4)

#### Gestionar Tipos Existentes

**Modificar tipo personalizado:**
1. Buscar el tipo en la lista
2. Hacer clic en "Editar"
3. Modificar los campos necesarios
4. Guardar los cambios

**Nota:** Solo se pueden modificar tipos personalizados, no los tipos por defecto.

**Desactivar tipo:**
1. Seleccionar el tipo personalizado
2. Hacer clic en "Desactivar"
3. Confirmar la acción

**Nota:** Los tipos desactivados no aparecen en nuevos mantenimientos, pero se mantienen en registros históricos.

### 👤 Gestión de Responsables de Recursos

#### ¿Qué es un Responsable de Recurso?

Un responsable es un usuario asignado para supervisar y gestionar un recurso específico. Sus responsabilidades incluyen:
- Aprobar reservas del recurso
- Reportar problemas o daños
- Coordinar mantenimientos
- Supervisar el uso adecuado

#### Asignar Responsables

**Método 1: Asignación Individual**
1. Seleccionar el recurso
2. Ir a la sección "Responsables"
3. Hacer clic en "Asignar Responsable"
4. Buscar y seleccionar el usuario
5. Confirmar la asignación

**Método 2: Asignación Múltiple**
1. Seleccionar el recurso
2. Hacer clic en "Gestionar Responsables"
3. Seleccionar múltiples usuarios
4. Hacer clic en "Asignar Seleccionados"

**Método 3: Asignación Masiva**
1. Seleccionar un usuario
2. Hacer clic en "Asignar a Recursos"
3. Seleccionar múltiples recursos
4. Confirmar la asignación

#### Transferir Responsabilidades

**Transferencia individual:**
1. Ir al perfil del usuario actual
2. Seleccionar "Transferir Responsabilidades"
3. Elegir el nuevo responsable
4. Seleccionar los recursos a transferir
5. Confirmar la transferencia

**Transferencia completa:**
1. Usar la opción "Transferir Todas"
2. Todas las responsabilidades se transfieren automáticamente

#### Consultar Responsabilidades

**Ver recursos de un usuario:**
1. Ir al perfil del usuario
2. Sección "Recursos Asignados"
3. Lista todos los recursos activos

**Ver responsables de un recurso:**
1. Ir al detalle del recurso
2. Sección "Responsables Actuales"
3. Lista todos los usuarios responsables

**Mis recursos (usuario actual):**
1. Ir a "Mi Panel"
2. Sección "Mis Recursos"
3. Lista todos los recursos bajo tu responsabilidad

### 📊 Consultas y Reportes

#### Estadísticas de Importación

**Mis estadísticas:**
- Total de importaciones realizadas
- Recursos importados exitosamente
- Tasa de éxito promedio
- Última importación realizada

**Estadísticas generales (Solo administradores):**
- Total de importaciones del sistema
- Usuarios más activos en importación
- Recursos importados por programa
- Tendencias de importación por período

#### Consultas Avanzadas

**Recursos por programa:**
1. Seleccionar el programa académico
2. Ver todos los recursos asociados
3. Filtrar por categoría, estado, responsable

**Recursos por categoría:**
1. Seleccionar la categoría
2. Ver todos los recursos de esa categoría
3. Filtrar por programa, estado, capacidad

**Responsabilidades por usuario:**
1. Buscar el usuario
2. Ver todos sus recursos asignados
3. Filtrar por programa, categoría, estado

### 🔍 Búsqueda y Filtros

#### Búsqueda Global

La búsqueda global permite encontrar recursos por:
- Nombre del recurso
- Ubicación
- Descripción
- Programa académico
- Categorías

#### Filtros Avanzados

**Por programa académico:**
- Seleccionar uno o múltiples programas
- Ver solo recursos activos/inactivos

**Por categoría:**
- Seleccionar una o múltiples categorías
- Combinación con otros filtros

**Por capacidad:**
- Rango de capacidad (mínima - máxima)
- Útil para encontrar espacios adecuados

**Por disponibilidad:**
- Solo recursos disponibles
- Recursos en mantenimiento
- Recursos fuera de servicio

**Por responsable:**
- Recursos con responsable asignado
- Recursos sin responsable
- Recursos de un usuario específico

### ⚠️ Solución de Problemas Comunes

#### Problema: No puedo crear un programa académico
**Posibles causas:**
- No tienes permisos de administrador
- El nombre ya existe en el sistema
- El código ya está en uso

**Solución:**
- Verificar rol de usuario
- Usar un nombre único
- Omitir el código o usar uno diferente

#### Problema: La importación falló
**Posibles causas:**
- Archivo con formato incorrecto
- Datos duplicados o inválidos
- Archivo demasiado grande

**Solución:**
- Verificar formato CSV
- Usar vista previa para validar
- Dividir archivos grandes

#### Problema: No puedo asignar un responsable
**Posibles causas:**
- Usuario ya es responsable del recurso
- No tienes permisos suficientes
- Usuario no existe o está inactivo

**Solución:**
- Verificar asignaciones existentes
- Confirmar permisos de administrador
- Verificar estado del usuario

#### Problema: No aparecen mis recursos
**Posibles causas:**
- Filtros activos ocultando resultados
- No tienes recursos asignados
- Recursos desactivados

**Solución:**
- Limpiar todos los filtros
- Verificar asignaciones de responsabilidad
- Incluir recursos inactivos en la búsqueda

### 📞 Soporte y Contacto

#### Soporte Técnico
- **Email**: soporte.bookly@ufps.edu.co
- **Teléfono**: +57 (7) 575-8888 ext. 1234
- **Horario**: Lunes a Viernes, 8:00 AM - 5:00 PM

#### Capacitación
- **Sesiones grupales**: Solicitar con 48 horas de anticipación
- **Capacitación individual**: Disponible para administradores
- **Documentación online**: Disponible 24/7 en el portal

#### Reportar Problemas
1. **Portal de soporte**: https://soporte.bookly.ufps.edu.co
2. **Email directo**: bugs@bookly.ufps.edu.co
3. **Incluir siempre**:
   - Descripción detallada del problema
   - Pasos para reproducir el error
   - Capturas de pantalla si es posible
   - Información del navegador y sistema operativo

---

**Versión del Manual**: 1.0.0  
**Fecha de Actualización**: Enero 2025  
**Próxima Revisión**: Marzo 2025
