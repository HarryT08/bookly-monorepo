---
trigger: manual
---

### RF-25: Registro y trazabilidad de todas las aprobaciones, para auditoría y control

---

## HU-22: Registro y Trazabilidad de Aprobaciones para Auditoría

**Historia de Usuario**  
Como Administrador, quiero que el sistema registre y mantenga un historial detallado de todas las aprobaciones, modificaciones y rechazos de solicitudes de reserva para auditar el proceso, garantizar transparencia y tomar decisiones informadas basadas en datos históricos.

### Criterios de Aceptación

- Cada acción (aprobación, modificación o rechazo) debe registrarse automáticamente con los siguientes datos:
  - Identificación del solicitante y del recurso (nombre, ubicación, fecha, hora, duración).
  - Estado de la solicitud (pendiente, aprobada, rechazada, modificada).
  - Datos del aprobador (nombre, cargo, comentarios de la acción).
  - Fecha y hora exacta de la acción.
- Los registros deben ser inalterables y accesibles solo para usuarios autorizados.
- La interfaz de consulta debe permitir filtrar por fecha, usuario, recurso, estado y aprobador.
- Se debe ofrecer la opción de exportar el historial filtrado en formato CSV.
- El tiempo de respuesta de las consultas debe ser menor a 2 segundos en condiciones normales.
- Toda acción de registro debe quedar documentada en el historial de auditoría.

---

## SubHU-22.1: Registro Automático de Acciones de Aprobación

**Historia de Usuario**  
Como Administrador, quiero que el sistema registre automáticamente cada acción de validación (aprobación, rechazo o solicitud de modificación) de una solicitud de reserva para disponer de un historial completo y verificable para auditorías internas y externas.

### Criterios de Aceptación

- Al tomar una decisión sobre una solicitud, el sistema debe generar un registro que incluya todos los datos obligatorios:
  - Datos del solicitante, detalles de la reserva, estado final, datos del aprobador, fecha y hora, y comentarios (en caso de rechazo o modificación).
- El registro debe asignarse un identificador único y almacenarse de forma inalterable.
- Se debe notificar al responsable de la acción (por ejemplo, mediante un mensaje en la interfaz) que el registro se ha guardado exitosamente.
- En caso de error en el registro, se debe notificar al administrador y registrar el fallo.

### Tareas y Subtareas

**Tarea 1: Diseño del Modelo de Datos del Historial de Aprobaciones**
- Subtarea 1.1: Definir el esquema del historial (campos, tipos de datos, identificador único).
- Subtarea 1.2: Validar el diseño con el equipo de auditoría y seguridad.

**Tarea 2: Desarrollo del Módulo de Registro Automático en NestJS**
- Subtarea 2.1: Implementar un interceptor o middleware en el servicio de validación que capture cada acción.
- Subtarea 2.2: Desarrollar la lógica en el servicio para almacenar los registros en la base de datos (usando Prisma y MongoDB).
- Subtarea 2.3: Incluir validaciones para asegurar que cada registro contenga todos los datos requeridos.

**Tarea 3: Configuración de Auditoría y Manejo de Excepciones**
- Subtarea 3.1: Configurar herramientas de logging (por ejemplo, Winston) para registrar cada acción.
- Subtarea 3.2: Implementar manejo de errores para capturar y notificar fallos en el registro.

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Desarrollar pruebas unitarias e integración en Jasmine utilizando escenarios BDD (Given-When-Then).
- Subtarea 4.2: Documentar el modelo de datos, el flujo de registro y las políticas de auditoría en la guía del usuario.
- Subtarea 4.3: Integrar el módulo en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).

---

## SubHU-22.2: Consulta y Exportación del Historial de Aprobaciones

**Historia de Usuario**  
Como Administrador, quiero consultar y exportar el historial de aprobaciones de solicitudes de reserva para auditar el proceso, identificar patrones y mejorar la gestión de las reservas mediante análisis de datos.

### Criterios de Aceptación

- La interfaz debe permitir visualizar una lista completa del historial con todos los datos registrados (solicitante, reserva, aprobador, fecha, hora, estado y comentarios).
- Debe incluir filtros por fecha, usuario, recurso, estado y aprobador.
- La consulta debe responder en menos de 2 segundos en condiciones normales.
- Se debe permitir exportar el historial filtrado en formato CSV.
- El acceso a esta funcionalidad debe estar restringido a usuarios autorizados.
- Cada consulta y exportación debe quedar registrada en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Consulta del Historial**
- Subtarea 1.1: Crear wireframes y mockups de la pantalla de consulta, incluyendo filtros y opción de exportación.
- Subtarea 1.2: Validar el diseño con administradores y el equipo de auditoría.

**Tarea 2: Desarrollo del Endpoint de Consulta en NestJS**
- Subtarea 2.1: Definir el DTO para la consulta con filtros (fecha, usuario, recurso, estado, aprobador).
- Subtarea 2.2: Implementar la lógica en el servicio para recuperar y formatear los registros del historial.
- Subtarea 2.3: Optimizar la consulta para garantizar un tiempo de respuesta inferior a 2 segundos.

**Tarea 3: Desarrollo de la Funcionalidad de Exportación a CSV**
- Subtarea 3.1: Implementar la generación de un archivo CSV a partir de los registros filtrados.
- Subtarea 3.2: Integrar la opción de exportación en la interfaz de usuario.

**Tarea 4: Registro de Auditoría y Manejo de Errores**
- Subtarea 4.1: Configurar logging para registrar cada consulta y exportación.
- Subtarea 4.2: Implementar manejo de excepciones para capturar y notificar errores en la consulta o exportación.

**Tarea 5: Pruebas y Documentación**
- Subtarea 5.1: Escribir pruebas unitarias e integración utilizando Jasmine y escenarios BDD (Given-When-Then).
- Subtarea 5.2: Documentar el proceso de consulta y exportación en la guía del usuario y la documentación técnica.
- Subtarea 5.3: Integrar la funcionalidad en el pipeline de CI/CD.
