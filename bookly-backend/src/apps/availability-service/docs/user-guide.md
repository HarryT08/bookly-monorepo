# Bookly Availability Service - Guía de Usuario

## Índice

- [📅 Introducción](#-introducción)
- [👥 Tipos de Reserva](#-tipos-de-reserva)
- [🚀 Comenzar a Usar](#-comenzar-a-usar)
- [📋 Gestión de Reservas](#-gestión-de-reservas)
- [⏳ Sistema de Lista de Espera](#-sistema-de-lista-de-espera)
- [🔄 Reasignación de Recursos](#-reasignación-de-recursos)
- [📅 Integración con Calendarios](#-integración-con-calendarios)
- [🔔 Notificaciones y Recordatorios](#-notificaciones-y-recordatorios)
- [📊 Historial y Reportes](#-historial-y-reportes)
- [📱 Uso desde Dispositivos Móviles](#-uso-desde-dispositivos-móviles)
- [🚨 Manejo de Emergencias](#-manejo-de-emergencias)
- [📞 Contacto y Soporte](#-contacto-y-soporte)
- [🔧 Solución de Problemas](#-solución-de-problemas)
- [📈 Consejos para Optimizar tu Experiencia](#-consejos-para-optimizar-tu-experiencia)
- [🔄 Actualizaciones y Novedades](#-actualizaciones-y-novedades)

---

## 📅 Introducción

El **Availability Service** de Bookly es el microservicio central que gestiona la disponibilidad de espacios y recursos en la Universidad Francisco de Paula Santander (UFPS). Este servicio implementa los requerimientos funcionales RF-07 a RF-19, proporcionando funcionalidades completas para:

- **Consulta de disponibilidad** en tiempo real
- **Gestión de reservas** simples y recurrentes
- **Listas de espera** automáticas con notificaciones
- **Reasignación inteligente** de recursos
- **Integración** con calendarios externos (Google, Outlook)
- **Búsqueda avanzada** con filtros múltiples
- **Visualización en calendario** interactivo

## 🌐 URLs de Acceso

| Entorno | URL Base | Descripción |
|---------|----------|-------------|
| **Producción** | `https://bookly.ufps.edu.co/availability` | Aplicación web principal |
| **Staging** | `https://ufps.booklyapp.com/availability` | Entorno de desarrollo |
| **Desarrollo** | `http://localhost:3100/availability` | Entorno de desarrollo |
| **API Base** | `https://ufps.booklyapp.com/api/v1/availability` | Endpoints REST del servicio |
| **API Docs** | `https://ufps.booklyapp.com/api/v1/availability/docs` | Documentación Swagger/OpenAPI |

### Roles de Usuario

- **Estudiante**: Consulta y reserva espacios básicos
- **Docente**: Reservas académicas y programación semestral
- **Administrativo General**: Reservas para eventos institucionales
- **Administrador de Programa**: Gestión de espacios del programa
- **Administrador General**: Control total del sistema
- **Vigilante**: Validación de reservas y check-in/check-out

---

## 👥 Tipos de Reserva

### Reservas Inmediatas

- **Disponibilidad**: Recursos disponibles al momento
- **Confirmación**: Automática para recursos sin restricciones
- **Duración**: Máximo 4 horas por sesión

### Reservas Programadas

- **Anticipación**: Hasta 30 días en adelante
- **Aprobación**: Requerida para recursos especializados
- **Flexibilidad**: Modificación hasta 2 horas antes

### Reservas Recurrentes

- **Periodicidad**: Semanal, quincenal o mensual
- **Duración**: Hasta un semestre académico
- **Gestión**: Modificar instancias individuales o serie completa

---

## 🚀 Comenzar a Usar

### 1. Consultar Disponibilidad

#### Búsqueda Básica

**URL**: `/reservations/search`

**Proceso**:

1. Selecciona **fecha y hora** deseada
2. Especifica **duración** de la reserva
3. Filtra por **tipo de recurso** (aula, laboratorio, auditorio)
4. Ve resultados disponibles en tiempo real

```javascript
// Ejemplo de búsqueda
{
  "fecha": "2025-01-15",
  "horaInicio": "09:00",
  "horaFin": "11:00",
  "tipoRecurso": "aula",
  "capacidad": 25
}
```

#### Búsqueda Avanzada

**Filtros Disponibles**:

- **Capacidad**: Número de personas
- **Equipamiento**: Proyector, sistema de sonido, pizarra digital
- **Ubicación**: Edificio, piso, zona específica
- **Accesibilidad**: Rampas, ascensores, señalización braille
- **Tipo de actividad**: Clase, reunión, evento, examen

### 2. Crear Reserva

#### Reserva Simple

**Proceso**:

1. Selecciona el recurso deseado
2. Confirma fecha y horario
3. Especifica el **propósito** de la reserva
4. Agrega **número de asistentes**
5. Solicita **equipamiento adicional** si es necesario
6. Confirma la reserva

```javascript
// Datos requeridos
{
  "recurso": "Aula 101 - Edificio de Sistemas",
  "fechaInicio": "2025-01-15T09:00:00Z",
  "fechaFin": "2025-01-15T11:00:00Z",
  "proposito": "Clase de Programación Orientada a Objetos",
  "asistentes": 25,
  "equipamiento": ["proyector", "microfono"],
  "observaciones": "Requiere acceso a internet de alta velocidad"
}
```

#### Reserva Recurrente

**Configuración de Recurrencia**:

```javascript
{
  "patron": {
    "frecuencia": "semanal",
    "dias": ["lunes", "miercoles", "viernes"],
    "horaInicio": "09:00",
    "horaFin": "11:00",
    "fechaInicio": "2025-01-15",
    "fechaFin": "2025-05-15"
  },
  "excepciones": [
    "2025-04-15", // Semana Santa
    "2025-04-17"
  ]
}
```

---

## 📋 Gestión de Reservas

### Ver Mis Reservas

**URL**: `/my-reservations`

**Información Mostrada**:

- Estado actual (confirmada, pendiente, cancelada)
- Código de confirmación
- Detalles del recurso y horario
- Opciones de modificación o cancelación

### Modificar Reserva

**Condiciones**:

- Hasta **2 horas antes** del horario programado
- Sujeto a disponibilidad del nuevo horario
- Puede requerir nueva aprobación

**Proceso**:

1. Accede a **"Mis Reservas"**
2. Selecciona la reserva a modificar
3. Elige **nuevo horario** o **recurso alternativo**
4. Justifica el **motivo del cambio**
5. Confirma la modificación

### Cancelar Reserva

**Beneficios de Cancelación Oportuna**:

- **+24 horas**: Sin penalización
- **2-24 horas**: Penalización mínima
- **< 2 horas**: Penalización estándar

**Proceso**:

1. Ve a **"Mis Reservas"**
2. Selecciona **"Cancelar"**
3. Indica **motivo de cancelación**
4. Confirma la acción

---

## ⏳ Sistema de Lista de Espera

### Unirse a Lista de Espera

**¿Cuándo usar?**

- Recurso no disponible en horario deseado
- Alternativa automática cuando hay conflictos
- Preferencia por recurso específico

**Proceso**:

1. En resultados de búsqueda, selecciona **"Unirse a lista de espera"**
2. Especifica **horario preferido**
3. Establece **prioridad** (normal, alta, urgente)
4. Configura **notificaciones** (email, SMS, app)
5. Define **tiempo máximo de espera**

```javascript
// Configuración de lista de espera
{
  "recursoDeseado": "Laboratorio de Sistemas",
  "horarioPreferido": {
    "inicio": "2025-01-15T09:00:00Z",
    "fin": "2025-01-15T11:00:00Z"
  },
  "prioridad": "alta",
  "tiempoMaximoEspera": "7_dias",
  "notificaciones": {
    "email": true,
    "sms": false,
    "enApp": true
  },
  "autoConfirmar": false
}
```

### Gestionar Posición en Lista

**Mi Lista de Espera**:

- **Posición actual** en la cola
- **Tiempo estimado** de espera
- **Recursos alternativos** sugeridos
- **Historial** de movimientos en la lista

**Acciones Disponibles**:

- **Cambiar prioridad** (si es elegible)
- **Modificar horario** preferido
- **Salir** de la lista de espera
- **Configurar** recordatorios

---

## 🔄 Reasignación de Recursos

### Solicitar Reasignación

**Motivos Válidos**:

- Daño en el equipamiento del recurso original
- Cambio en número de asistentes
- Necesidades técnicas específicas
- Conflictos de horario

**Proceso**:

1. Desde **"Mis Reservas"**, selecciona **"Solicitar reasignación"**
2. Especifica **motivo detallado**
3. Selecciona **recurso alternativo** preferido
4. Elige **nuevo horario** si es necesario
5. Establece **prioridad** de la solicitud

```javascript
// Solicitud de reasignación
{
  "reservaOriginal": "reservation-uuid",
  "motivoReasignacion": "El proyector del aula está dañado",
  "recursoAlternativo": "Aula 102",
  "nuevoHorario": {
    "inicio": "2025-01-15T10:00:00Z",
    "fin": "2025-01-15T12:00:00Z"
  },
  "prioridad": "urgente",
  "justificacion": "La clase requiere presentaciones multimedia"
}
```

### Responder a Reasignación

**Como Usuario Afectado**:

- **Aceptar**: Confirma el cambio propuesto
- **Rechazar**: Mantiene la reserva original
- **Contrapropuesta**: Sugiere alternativa diferente

**Tiempo de Respuesta**:

- **Prioridad urgente**: 2 horas
- **Prioridad alta**: 24 horas
- **Prioridad normal**: 48 horas

---

## 📅 Integración con Calendarios

### Sincronización con Google Calendar

**Configuración Inicial**:

1. Ve a **"Configuración" > "Calendarios"**
2. Selecciona **"Conectar Google Calendar"**
3. Autoriza el acceso a tu cuenta
4. Configura **preferencias de sincronización**

**Opciones de Sincronización**:

```javascript
{
  "sincronizacionBidireccional": true,
  "sincronizacionAutomatica": true,
  "intervaloSincronizacion": "15_minutos",
  "incluirEventosPrivados": false,
  "calendarioDestino": "Reservas UFPS",
  "notificacionesSincronizacion": true
}
```

### Sincronización con Outlook

**Proceso Similar**:

1. **"Configuración" > "Calendarios"**
2. **"Conectar Microsoft Outlook"**
3. Autenticación con cuenta institucional
4. Configuración de preferencias

### Gestión de Conflictos

**Detección Automática**:

- Eventos superpuestos en calendario personal
- Reservas institucionales conflictivas
- Horarios académicos registrados

**Resolución**:

- **Sugerencias automáticas** de horarios alternativos
- **Notificación** a usuarios afectados
- **Escalación** a coordinadores si es necesario

---

## 🔔 Notificaciones y Recordatorios

### Configurar Notificaciones

**Tipos de Eventos**:

- Confirmación de reserva
- Recordatorio antes del evento
- Cambios en la reserva
- Disponibilidad en lista de espera
- Conflictos detectados

**Canales de Notificación**:

```javascript
{
  "email": {
    "habilitado": true,
    "tiempos": ["24_horas", "2_horas", "30_minutos"]
  },
  "sms": {
    "habilitado": false,
    "solo_urgentes": true
  },
  "enApp": {
    "habilitado": true,
    "sonido": true,
    "vibración": true
  },
  "calendar": {
    "sincronizar": true,
    "recordatorios": ["15_minutos", "1_hora"]
  }
}
```

### Gestión de Recordatorios

**Recordatorios Automáticos**:

- **24 horas antes**: Confirmación de asistencia
- **2 horas antes**: Preparativos y ubicación
- **30 minutos antes**: Check-in disponible
- **Al inicio**: Código de acceso (si aplica)

---

## 📊 Historial y Reportes

### Mi Historial de Reservas

**URL**: `/history`

**Información Disponible**:

- Todas las reservas pasadas y futuras
- Estadísticas de uso por mes
- Recursos más utilizados
- Patrones de reserva
- Cancelaciones y modificaciones

### Exportar Datos

**Formatos Disponibles**:

- **CSV**: Para análisis en Excel
- **PDF**: Reporte formal
- **iCal**: Para importar en calendarios
- **JSON**: Para desarrolladores

**Filtros de Exportación**:

```javascript
{
  "rangoFechas": {
    "inicio": "2025-01-01",
    "fin": "2025-12-31"
  },
  "tiposRecurso": ["aula", "laboratorio"],
  "estados": ["confirmada", "completada"],
  "incluirCanceladas": false,
  "agruparPor": "mes"
}
```

---

## 📱 Uso desde Dispositivos Móviles

### Aplicación Móvil (Proximamente)

**Funcionalidades Principales**:

- Búsqueda rápida de disponibilidad
- Reservas inmediatas con GPS
- Notificaciones push en tiempo real
- Check-in con código QR
- Mapa interactivo del campus

### Website Responsivo

**Acceso desde navegador móvil**:

- Interfaz optimizada para touch
- Búsqueda por voz (Proximamente)
- Cámara para escanear códigos QR
- Sincronización offline (Proximamente)

### Modo Offline (Proximamente)

**Funcionalidades Disponibles**:

- Consultar reservas guardadas
- Ver mapas del campus descargados
- Códigos de confirmación almacenados
- Sincronización automática al reconectar

---

## 🚨 Manejo de Emergencias

### Cancelación de Emergencia

**Proceso Rápido**:

1. Escribe al **whatsapp**: `+57 300 123 4567`
2. Proporciona tu **código de confirmación**
3. Explica brevemente la **situación**
4. Recibe **confirmación inmediata**

### Notificación Masiva

**En caso de emergencias institucionales**:

- **Evacuación**: Cancelación automática de reservas
- **Clima severo**: Suspensión de actividades
- **Falla técnica**: Reasignación automática
- **Eventos especiales**: Restricciones temporales

---

## 🔧 Solución de Problemas

### Problemas Comunes

#### 1. No puedo encontrar un recurso disponible

**Soluciones**:

- Amplía el **rango de fechas** de búsqueda
- Considera **horarios alternativos** (mañana vs tarde)
- Úsate a **lista de espera** para horarios populares
- Verifica **recursos equivalentes** en otros edificios

#### 2. Mi reserva fue cancelada automáticamente

**Causas posibles**:

- **No-show** en reserva anterior (penalización)
- **Mantenimiento** programado del recurso
- **Evento institucional** prioritario
- **Conflicto** no resuelto a tiempo

**Solución**:

- Verifica tu **historial de penalizaciones**
- Contacta **soporte** para aclaración
- **Re-reserva** con recursos alternativos

#### 3. El calendario no se sincroniza

**Verificaciones**:

- **Conexión a internet** estable
- **Permisos** de calendario actualizados
- **Configuración** de sincronización correcta
- **Espacio disponible** en el dispositivo

#### 4. No recibo notificaciones

**Revisiones**:

- **Configuración** de notificaciones en la app
- **Permisos** del navegador o aplicación
- **Filtros de spam** en email
- **Configuración** del dispositivo

---

## 📈 Consejos para Optimizar tu Experiencia

### Mejores Prácticas

#### Para Reservas Exitosas

- **Reserva con anticipación**: Especialmente para recursos populares
- **Sé específico**: Describe claramente el propósito de la reserva
- **Verifica equipamiento**: Confirma que el recurso tiene lo que necesitas
- **Llega puntual**: El check-in tardío puede resultar en cancelación

#### Para Listas de Espera

- **Sé flexible** con horarios alternativos
- **Configura notificaciones** para respuesta rápida
- **Mantén actualizada** tu información de contacto
- **Responde rápidamente** a ofertas de disponibilidad

#### Para Reservas Recurrentes

- **Planifica excepciones** (festivos, vacaciones)
- **Revisa regularmente** las instancias futuras
- **Comunica cambios** con anticipación
- **Mantén coherencia** en el uso del espacio

### Funcionalidades Avanzadas

#### Automatización

- **Reservas automáticas** basadas en horario académico (Proximamente)
- **Reasignación inteligente** por preferencias (Proximamente)
- **Predicción** de disponibilidad por patrones históricos (Proximamente)

#### Integración con Sistemas Académicos

- **Sincronización** con horarios de clase (Proximamente)
- **Reservas automáticas** para actividades programadas (Proximamente)
- **Integración** con sistema de asistencia (Proximamente)

---

## 🔄 Actualizaciones y Novedades

### Versión Actual: 2.3.0

#### Nuevas Funcionalidades

- ✅ **Búsqueda por voz** en dispositivos móviles
- ✅ **Check-in con QR** para acceso sin contacto
- ✅ **Mapa 3D** del campus con disponibilidad en tiempo real
- ✅ **Inteligencia artificial** para sugerencias de horarios

#### Mejoras Implementadas

- ✅ **Tiempo de respuesta** 50% más rápido
- ✅ **Interfaz rediseñada** más intuitiva
- ✅ **Notificaciones mejoradas** con más contexto
- ✅ **Sincronización** más estable con calendarios externos

### Próximas Funcionalidades

- 🔄 **Asistente virtual** para consultas comunes
- 🔄 **Realidad aumentada** para navegación en campus
- 🔄 **Analytics personal** de uso de espacios
- 🔄 **Integración** con sistemas de climatización

---

## 📞 Contacto y Soporte

**Para Soporte Técnico**:

- 📧 Email: `soporte-bookly@ufps.edu.co` | `soporte@ufps.booklyapp.com`
- **WhatsApp**: +57 300 123 4567

Cuando contactes soporte, incluye:

- **Usuario y rol**
- **Acción que intentabas realizar**
- **Mensaje de error exacto**
- **Capturas de pantalla**
- **Archivo problemático** (para importaciones)

---

**Documento**: User Guide - Availability Service  
**Última actualización**: 31 de Agosto, 2025  
**Versión**: 2.3.0  
**Autor**: Equipo de Desarrollo Bookly  
**Revisor**: Arquitecto de Sistemas  
**Estado**: ✅ Documentación Completa y Validada

*Universidad Francisco de Paula Santander - Sistema Bookly de Reservas Institucionales*
