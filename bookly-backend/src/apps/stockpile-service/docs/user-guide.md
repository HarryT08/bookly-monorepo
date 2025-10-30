# Bookly Stockpile Service - Guía de Usuario

## Índice

- [🏢 Introducción](#-introducción)
- [🔍 Gestión de Aprobaciones](#-gestión-de-aprobaciones)
- [🏛️ Pantalla de Control para Vigilancia](#-pantalla-de-control-para-vigilancia)
- [⚙️ Configuración de Flujos](#-configuración-de-flujos)
- [📄 Documentos y Notificaciones](#-documentos-y-notificaciones)
- [🔓 Check-in/Check-out Digital](#-check-incheck-out-digital)
- [🔧 Troubleshooting](#-troubleshooting)
- [❓ Preguntas Frecuentes](#-preguntas-frecuentes)
- [📞 Contacto y Soporte](#-contacto-y-soporte)

---

## 🏢 Introducción

El **Stockpile Service** de Bookly es el microservicio central que gestiona todo el proceso de **aprobación y validación de reservas** en la Universidad Francisco de Paula Santander (UFPS). Este servicio implementa los requerimientos funcionales RF-20 a RF-28, proporcionando funcionalidades completas para:

- **Validación de solicitudes** por responsables autorizados con flujos configurables
- **Generación automática** de documentos PDF oficiales de aprobación/rechazo
- **Notificaciones automáticas** por email, WhatsApp y otros canales
- **Pantalla de control** en tiempo real para personal de vigilancia
- **Flujos diferenciados** según tipo de usuario, recurso y programa académico
- **Trazabilidad completa** y auditoría de todas las decisiones
- **Check-in/check-out digital** opcional con códigos QR
- **Integración** con sistemas de mensajería institucional

## 🌐 URLs de Acceso

| Entorno | URL Base | Descripción |
|---------|----------|-------------|
| **Producción** | `https://bookly.ufps.edu.co/stockpile` | Aplicación web principal |
| **Staging** | `https://ufps.booklyapp.com/stockpile` | Entorno de desarrollo |
| **Desarrollo** | `http://localhost:3100/stockpile` | Entorno de desarrollo |
| **API Base** | `https://ufps.booklyapp.com/api/v1/stockpile` | Endpoints REST del servicio |
| **API Docs** | `https://ufps.booklyapp.com/api/v1/stockpile/docs` | Documentación Swagger/OpenAPI |

### Roles de Usuario

| Rol | Permisos | Descripción |
|-----|----------|-------------|
| **Coordinador de Aprobaciones** | Aprobar/rechazar solicitudes, configurar flujos | Gestiona el proceso de validación de reservas |
| **Personal de Vigilancia** | Ver reservas aprobadas, check-in/out | Controla acceso físico a recursos con verificación digital |
| **Administrador de Documentos** | Crear plantillas, generar documentos | Gestiona documentación oficial y personalización |
| **Administrador de Notificaciones** | Configurar notificaciones, ver historial | Gestiona comunicaciones automáticas y templates |
| **Administrador General** | Control total del sistema | Configuración avanzada y supervisión integral |
| **Administrador de Programa** | Gestión por programa académico | Control de flujos y recursos específicos del programa |

---

## 🔍 Gestión de Aprobaciones

### Proceso de Aprobación

1. **Usuario solicita reserva** → Sistema evalúa si requiere aprobación
2. **Asigna a responsable** → Envía notificación automática  
3. **Responsable revisa** → Aprueba, rechaza o solicita modificaciones
4. **Sistema genera documento** → Envía notificación al usuario
5. **Usuario recibe confirmación** → Puede proceder con la reserva

### Revisar Solicitudes Pendientes

**Acceso**: Coordinador de Aprobaciones, Administrador de Programa

1. **Inicia sesión** en el sistema con tu rol autorizado
2. **Navega** a "Aprobaciones" > "Solicitudes Pendientes"
3. **Verás una lista** con todas las solicitudes que requieren tu validación

### Aprobar una Solicitud

1. **Selecciona** la solicitud que deseas aprobar
2. **Revisa** la información detallada del solicitante y reserva
3. **Haz clic** en "Aprobar Solicitud"
4. **Completa** comentarios y condiciones especiales si es necesario
5. **Confirma** la aprobación
6. **El sistema automáticamente** genera documento y envía notificaciones

### Rechazar una Solicitud

1. **Selecciona** la solicitud que deseas rechazar
2. **Especifica** el motivo del rechazo
3. **Proporciona** explicación detallada y sugerencias alternativas
4. **Confirma** el rechazo
5. **El sistema** genera documento de rechazo y notifica al usuario

---

## 🏛️ Pantalla de Control para Vigilancia

### Acceso a la Pantalla de Vigilancia

**Acceso**: Personal de Vigilancia, Administrador General

1. **Inicia sesión** con credenciales de vigilancia
2. **Navega** a "Control de Acceso" > "Reservas Activas"
3. **Verás** la pantalla en tiempo real con reservas del día

### Verificar Acceso de Usuario

1. **Cuando llega un usuario**, busca su reserva por:
   - 🔍 **Nombre**: Escribe el nombre completo
   - 🆔 **Cédula**: Escribe número de identificación
   - 📱 **Código QR**: Escanea código en la reserva

2. **Verifica** la información mostrada
3. **Autoriza el acceso** si todo está correcto
4. **Reporta incidencia** si hay problemas

### Registrar Check-in/Check-out

**Check-in (Entrada)**:

1. **Confirma** identidad del usuario
2. **Registra** método de verificación usado
3. **Anota** observaciones si es necesario
4. **Estado** cambia a "EN CURSO"

**Check-out (Salida)**:

1. **Busca** reserva activa del usuario  
2. **Evalúa** estado del recurso
3. **Registra** cualquier incidencia
4. **Estado** cambia a "COMPLETADA"

---

## ⚙️ Configuración de Flujos

### Crear Flujo de Aprobación

**Acceso**: Administrador General, Administrador de Programa

1. **Navega** a "Configuración" > "Flujos de Aprobación"
2. **Haz clic** en "Crear Nuevo Flujo"
3. **Define** nombre, descripción y criterios de aplicación
4. **Configura** secuencia de aprobadores
5. **Establece** tiempos límite y reglas de escalación
6. **Guarda** el flujo

### Flujos Predefinidos

| Tipo Usuario | Recurso | Flujo |
|--------------|---------|-------|
| **Estudiante** | Aula común | Automática |
| **Estudiante** | Laboratorio | Coordinador Programa |
| **Docente** | Horario académico | Automática |
| **Externo** | Cualquiera | Doble aprobación |

---

## 📄 Documentos y Notificaciones

### Configurar Plantillas de Documentos

1. **Navega** a "Configuración" > "Plantillas de Documentos"
2. **Crea** nueva plantilla con información institucional
3. **Define** variables dinámicas para personalización
4. **Configura** formato y diseño del documento
5. **Prueba** generación con datos de ejemplo

### Configurar Notificaciones

1. **Define** plantillas para email y WhatsApp
2. **Configura** triggers automáticos
3. **Personaliza** contenido según tipo de decisión
4. **Prueba** envío de notificaciones

---

## 🔓 Check-in/Check-out Digital

### Activar Control Digital

1. **Navega** a "Configuración" > "Control de Acceso"
2. **Habilita** check-in/check-out obligatorio
3. **Configura** métodos de verificación
4. **Define** tolerancias de tiempo

### Uso de Códigos QR

- **Usuarios** reciben código QR único en email de aprobación
- **Vigilantes** escanean código para verificar identidad
- **Sistema** valida automáticamente fecha, hora y permisos

---

## 🔧 Troubleshooting

### Solicitud No Recibida

**Problema**: Responsable no recibe notificación de solicitud
**Solución**:

- Revisar carpeta spam
- Verificar configuración de flujo
- Reenviar notificación manualmente

### Documento No Se Genera

**Problema**: PDF oficial no se crea automáticamente
**Solución**:

- Verificar plantilla activa
- Revisar sintaxis de variables
- Generar documento manualmente

### Check-in No Funciona

**Problema**: Código QR no funciona
**Solución**:

- Verificar estado de reserva (debe estar APROBADA)
- Confirmar fecha/hora dentro del rango
- Buscar reserva manualmente por cédula

---

## ❓ Preguntas Frecuentes

### ¿Cuánto tiempo tengo para aprobar una solicitud?

El tiempo depende del flujo configurado, generalmente 24-48 horas. Después se escala automáticamente.

### ¿Puedo modificar una aprobación ya otorgada?

Sí, pero se registra en el historial de auditoría. Es mejor contactar al usuario directamente.

### ¿Qué pasa si el usuario no hace check-out?

El sistema marca la reserva como "NO FINALIZADA" y genera reporte para seguimiento.

### ¿Puedo crear flujos específicos por programa?

Sí, los flujos se pueden configurar por programa académico, tipo de recurso y rol de usuario.

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

**Documento**: User Guide - Stockpile Service  
**Última actualización**: 31 de Agosto, 2025  
**Versión**: 2.0.0  
**Autor**: Equipo de Desarrollo Bookly  
**Revisor**: Arquitecto de Sistemas  
**Estado**: ✅ Documentación Completa y Validada

*Universidad Francisco de Paula Santander - Sistema Bookly de Reservas Institucionales*
