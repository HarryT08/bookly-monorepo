---
trigger: manual
---

### RF-22: Notificación automática al solicitante con el estado de la solicitud, crítica para la transparencia

---

## HU-19: Notificación Automática al Solicitante con Carta de Aceptación o Rechazo

**Historia de Usuario**  
Como Solicitante, quiero recibir una notificación automática que incluya la carta formal (en formato PDF) de aceptación o rechazo de mi solicitud de reserva para estar informado de manera oportuna y tomar las acciones necesarias.

### Criterios de Aceptación

- La notificación se debe enviar automáticamente una vez que el responsable haya tomado una decisión sobre la solicitud.
- El mensaje de notificación debe incluir:
  - Estado final de la solicitud (aprobada o rechazada).
  - Detalles relevantes de la reserva (recurso, fecha, hora y duración).
  - En caso de rechazo, el motivo detallado.
  - La carta formal generada en formato PDF adjunta.
- El proceso de envío debe completarse en menos de 2 segundos bajo condiciones normales de carga.
- La notificación debe registrarse en el historial de auditoría (incluyendo el solicitante, fecha, hora y resultado del envío).
- El solicitante debe poder acceder a la carta desde su perfil en la plataforma si, por algún motivo, no se recibe el correo.

---

## SubHU-19.1: Generación de la Notificación con Carta Adjunta

**Historia de Usuario**  
Como Responsable de Validación, quiero que el sistema genere automáticamente una notificación que incluya la carta formal de aprobación o rechazo en PDF para formalizar la decisión y mantener la documentación del proceso.

### Criterios de Aceptación

- Al finalizar la decisión (aprobación o rechazo), el sistema debe invocar el módulo de generación de notificación.
- La notificación debe incluir un mensaje que resuma la decisión y un enlace o adjunto con la carta PDF.
- La carta PDF debe contener:
  - Datos del solicitante.
  - Detalles de la reserva (recurso, fecha, hora, duración).
  - Estado de la solicitud y, en caso de rechazo, el motivo.
  - Datos del responsable de la validación (nombre, cargo y, si aplica, firma digital).
- Se debe validar que todos los datos obligatorios estén presentes antes de generar la notificación.
- La generación de la notificación debe quedar registrada en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño de la Plantilla de Notificación y Carta**
- Subtarea 1.1: Definir el contenido, formato y estructura de la carta en PDF.
- Subtarea 1.2: Crear mockups de la notificación que incluya el mensaje y el adjunto.
- Subtarea 1.3: Validar el diseño con responsables y solicitantes.

**Tarea 2: Desarrollo del Módulo de Generación de Notificación en NestJS**
- Subtarea 2.1: Definir el DTO que recopile la información necesaria (datos del solicitante, detalles de reserva, estado, motivo, datos del responsable).
- Subtarea 2.2: Implementar la lógica para rellenar la plantilla de la carta y generar el PDF usando una librería (por ejemplo, PDFKit o Puppeteer).
- Subtarea 2.3: Integrar la generación del PDF con el módulo de notificación.
- Subtarea 2.4: Validar la integridad de los datos antes de la generación.

**Tarea 3: Registro de Auditoría y Manejo de Excepciones**
- Subtarea 3.1: Configurar logging para registrar la generación de la notificación y el PDF.
- Subtarea 3.2: Implementar manejo de errores para notificar a los administradores en caso de fallo en la generación.

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Escribir pruebas unitarias e integración en Jasmine utilizando escenarios Given-When-Then.
- Subtarea 4.2: Documentar la funcionalidad en la guía del usuario y la documentación técnica.
- Subtarea 4.3: Integrar la funcionalidad en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).

---

## SubHU-19.2: Envío Automático y Registro de la Notificación

**Historia de Usuario**  
Como Responsable de Validación, quiero que el sistema envíe automáticamente la notificación con la carta adjunta al solicitante y registre la acción para asegurar que el usuario reciba la comunicación formal de la decisión y se mantenga la trazabilidad del proceso.

### Criterios de Aceptación

- Una vez generada la notificación, el sistema debe enviar automáticamente un correo electrónico (u otra modalidad de notificación configurada) al solicitante con el PDF adjunto.
- El mensaje de notificación debe incluir un resumen claro de la decisión (aprobación o rechazo) y, en caso de rechazo, el motivo.
- El envío debe completarse en menos de 2 segundos en condiciones normales.
- La notificación debe quedar accesible desde el perfil del solicitante.
- La acción de envío y cualquier error ocurrido deben registrarse en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Desarrollo del Módulo de Envío de Notificaciones**
- Subtarea 1.1: Definir el DTO para el envío de notificaciones, incluyendo datos de la notificación y el PDF.
- Subtarea 1.2: Integrar el módulo con un servicio de correo electrónico (por ejemplo, SendGrid, Amazon SES) o sistema de mensajería.
- Subtarea 1.3: Configurar el formato y la plantilla del correo electrónico.

**Tarea 2: Integración con el Módulo de Generación de Notificación**
- Subtarea 2.1: Asegurar que el PDF generado en SubHU-19.1 se adjunte correctamente al correo.
- Subtarea 2.2: Implementar la lógica para enviar la notificación inmediatamente después de la generación.

**Tarea 3: Registro de Auditoría y Manejo de Excepciones en el Envío**
- Subtarea 3.1: Configurar logging para registrar el envío de notificaciones (usuario, fecha, resultado).
- Subtarea 3.2: Implementar manejo de errores para capturar y notificar fallos en el envío.

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Desarrollar pruebas unitarias e integración utilizando Jasmine con escenarios Given-When-Then para el flujo de envío.
- Subtarea 4.2: Documentar el proceso de notificación en la guía del usuario y en la documentación técnica.
- Subtarea 4.3: Incluir esta funcionalidad en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).
