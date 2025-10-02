---
trigger: manual
---

### RF-21: Generación automática de documentos de aprobación o rechazo, lo que formaliza el proceso y agiliza la comunicación

---

## HU-18: Generación Automática de Documentos de Aprobación o Rechazo

**Historia de Usuario**  
Como Responsable de Validación, quiero que el sistema genere automáticamente un documento PDF de aprobación o rechazo de reserva para formalizar y documentar de manera oficial la decisión tomada, facilitando la comunicación con el solicitante y garantizando la trazabilidad del proceso.

### Criterios de Aceptación

- Al tomar una decisión (aprobación o rechazo) sobre una solicitud de reserva, se debe generar un documento PDF que incluya:
  - Datos del solicitante (nombre, rol, contacto).
  - Detalles completos de la reserva (recurso, fecha, hora, duración).
  - Estado de la solicitud (aprobada o rechazada).
  - En caso de rechazo, debe incluir el motivo detallado.
  - Información del responsable (nombre, cargo, firma digital o datos de validación) si aplica.
- El documento debe generarse automáticamente al finalizar la acción de validación.
- El PDF debe poder descargarse desde el portal y enviarse automáticamente por correo electrónico al solicitante.
- La generación del documento y el envío deben registrarse en el historial de auditoría.
- Se debe validar que todos los campos obligatorios estén presentes antes de generar el documento.
- La generación y envío no deben afectar significativamente el rendimiento del sistema (tiempo de generación y envío < 2 segundos en condiciones normales).

---

## SubHU-18.1: Generación Automática del Documento PDF

**Historia de Usuario**  
Como Responsable de Validación, quiero que el sistema genere automáticamente un documento PDF con todos los detalles de la reserva y la decisión para formalizar de manera oficial la aprobación o rechazo y mantener una documentación confiable del proceso.

### Criterios de Aceptación

- Al finalizar la validación de una solicitud, se debe invocar el módulo de generación de PDF.
- El documento debe incluir:
  - Datos del solicitante.
  - Información del recurso (nombre, ubicación, etc.).
  - Fecha, hora y duración de la reserva.
  - Estado de la solicitud y, en caso de rechazo, el motivo.
  - Datos del responsable de la validación.
- El documento se genera en formato PDF y se guarda en un repositorio seguro.
- Se debe registrar la generación del documento en el historial de auditoría (usuario, fecha, acción).
- El proceso de generación debe manejar errores y notificar en caso de fallo.

### Tareas y Subtareas

**Tarea 1: Diseño de la Plantilla del Documento PDF**
- Subtarea 1.1: Definir el contenido y formato de la plantilla (estructura, tipografía, logos institucionales, etc.).
- Subtarea 1.2: Crear mockups y validarlos con stakeholders (Responsables y Administradores).

**Tarea 2: Desarrollo del Módulo de Generación de PDF en NestJS**
- Subtarea 2.1: Seleccionar una librería adecuada (por ejemplo, PDFKit o Puppeteer).
- Subtarea 2.2: Definir el DTO que recoja todos los datos necesarios de la reserva y la decisión.
- Subtarea 2.3: Implementar la lógica para rellenar la plantilla con los datos dinámicos.
- Subtarea 2.4: Implementar validaciones para asegurar que todos los campos obligatorios estén presentes.
- Subtarea 2.5: Guardar el PDF generado en un sistema de almacenamiento seguro (puede ser local o en la nube).

**Tarea 3: Registro de Auditoría y Manejo de Excepciones**
- Subtarea 3.1: Configurar el logging (por ejemplo, con Winston) para registrar la generación del documento.
- Subtarea 3.2: Implementar manejo de excepciones para capturar y notificar errores en el proceso de generación.

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Desarrollar pruebas unitarias e integración en Jasmine utilizando escenarios Given-When-Then.
- Subtarea 4.2: Documentar la API y la funcionalidad de generación de PDF en la guía del usuario.
- Subtarea 4.3: Incluir el módulo en el pipeline de CI/CD.

---

## SubHU-18.2: Envío Automático y Registro del Documento

**Historia de Usuario**  
Como Responsable de Validación, quiero que el sistema envíe automáticamente el documento PDF generado al solicitante y registre la acción de envío para garantizar que el usuario reciba la notificación formal de la decisión y se mantenga la trazabilidad de la comunicación.

### Criterios de Aceptación

- Una vez generado el documento, el sistema debe enviar automáticamente un correo electrónico (o notificación vía app/WhatsApp) al solicitante con el PDF adjunto.
- El correo/notificación debe incluir un mensaje claro con la decisión (aprobación o rechazo) y, en caso de rechazo, el motivo.
- El documento debe estar disponible para descarga en el perfil del usuario.
- La acción de envío debe quedar registrada en el historial de auditoría (incluyendo detalles del correo, usuario notificado y fecha/hora).
- El proceso de envío debe manejar errores y notificar a un administrador en caso de fallo.

### Tareas y Subtareas

**Tarea 1: Desarrollo del Módulo de Envío de Notificaciones**
- Subtarea 1.1: Definir el DTO para la notificación, incluyendo el documento PDF y los datos relevantes (estado, motivo, etc.).
- Subtarea 1.2: Integrar el módulo con un servicio de correo electrónico o notificaciones (por ejemplo, SendGrid, Amazon SES o similar).
- Subtarea 1.3: Configurar el formato del mensaje y la plantilla de notificación.

**Tarea 2: Integración con el Módulo de Generación de PDF**
- Subtarea 2.1: Asegurar que el PDF generado se pase correctamente al módulo de notificación.
- Subtarea 2.2: Implementar la lógica para adjuntar el documento y enviar el mensaje al solicitante.

**Tarea 3: Registro de Auditoría del Envío**
- Subtarea 3.1: Configurar logging para registrar la acción de envío de notificaciones.
- Subtarea 3.2: Implementar el registro en la base de datos de la acción (usuario, fecha, resultado del envío).

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Desarrollar pruebas unitarias e integración (BDD con Jasmine y escenarios Given-When-Then) para validar el envío automático.
- Subtarea 4.2: Documentar el proceso de notificación y registro en la guía del usuario y la documentación técnica.
- Subtarea 4.3: Incluir esta funcionalidad en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).
