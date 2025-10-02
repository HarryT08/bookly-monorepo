---
trigger: manual
---

### RF-20: Validar solicitudes de reserva por parte de un responsable (director, ingeniero de soporte o secretaria), esencial para la asignación correcta de recursos

---

## HU-17: Validación de Solicitudes de Reserva

**Historia de Usuario**  
Como Responsable de Validación (Director, Ingeniero de Soporte o Secretaria), quiero revisar y validar las solicitudes de reserva para asegurar que los recursos se asignen correctamente de acuerdo con las políticas institucionales y evitar conflictos o usos indebidos.

### Criterios de Aceptación

- El sistema debe mostrar una lista de solicitudes de reserva pendientes de validación, con información detallada (solicitante, recurso, fecha y hora, motivo de la reserva, etc.).
- El responsable debe poder aprobar, rechazar o solicitar modificaciones en cada solicitud.
- Al aprobar una solicitud, la reserva se asigna y se actualiza el estado a “Confirmada”; al rechazarla, el estado pasa a “Rechazada” y se debe incluir un motivo de rechazo.
- Si se solicita modificación, la solicitud vuelve al solicitante con comentarios y se marca como “Pendiente de Revisión”.
- Cada acción (aprobación, rechazo, solicitud de modificación) debe registrarse en el historial de auditoría (incluyendo el responsable, la fecha, la hora y el detalle de la acción).
- El sistema debe enviar notificaciones automáticas al solicitante informando sobre el estado de su solicitud.

---

## SubHU-17.1: Gestión de la Decisión de Validación

**Historia de Usuario**  
Como Responsable de Validación, quiero tomar decisiones (aprobar, rechazar o solicitar modificaciones) sobre las solicitudes de reserva para asegurar que sólo se asignen recursos cuando se cumplan todos los criterios y normativas.

### Criterios de Aceptación

- El responsable debe disponer de botones o acciones en la interfaz para aprobar, rechazar o solicitar modificaciones.
- Al aprobar, la reserva se marca como “Confirmada” y se asigna el recurso; al rechazar, se requiere ingresar un motivo de rechazo.
- En caso de solicitar modificaciones, la solicitud se devuelve al solicitante con comentarios específicos.
- Todas las decisiones deben actualizar el estado de la solicitud y registrarse en el historial de auditoría.
- La interfaz debe refrescar la lista de solicitudes pendientes en tiempo real tras cada acción.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Validación de Solicitudes**
- Subtarea 1.1: Crear wireframes y mockups de la pantalla de validación que muestre la lista de solicitudes con botones para “Aprobar”, “Rechazar” y “Solicitar Modificación”.
- Subtarea 1.2: Validar el diseño con responsables y usuarios clave para asegurar claridad y usabilidad.

**Tarea 2: Desarrollo del Endpoint para la Gestión de Decisiones**
- Subtarea 2.1: Definir el DTO para enviar la acción de validación (aprobación, rechazo con motivo, solicitud de modificación con comentarios).
- Subtarea 2.2: Implementar la lógica en el servicio de reservas para actualizar el estado de la solicitud según la decisión.
- Subtarea 2.3: Integrar validaciones en el backend para asegurar que, en caso de rechazo, se ingrese un motivo.
- Subtarea 2.4: Registrar cada acción en el historial de auditoría utilizando Prisma y MongoDB.

**Tarea 3: Registro de Auditoría y Manejo de Excepciones**
- Subtarea 3.1: Configurar logging (usando Winston) para capturar las acciones de validación.
- Subtarea 3.2: Implementar manejo de excepciones y notificaciones en caso de errores en la actualización de estado.

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Escribir pruebas unitarias e integración en Jasmine, utilizando escenarios Given-When-Then para cada acción de validación.
- Subtarea 4.2: Documentar el flujo de validación en la guía del usuario y en la documentación técnica.
- Subtarea 4.3: Integrar este módulo en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).

---

## SubHU-17.2: Notificación Automática al Solicitante

**Historia de Usuario**  
Como Responsable de Validación, quiero notificar automáticamente al solicitante sobre la decisión tomada en su solicitud de reserva para que éste reciba información oportuna y pueda tomar las acciones correspondientes (aceptar, modificar o cancelar).

### Criterios de Aceptación

- Al finalizar la validación, el sistema debe enviar una notificación (por correo electrónico, notificación en la app o WhatsApp) al solicitante.
- La notificación debe incluir: el estado final de la solicitud (aprobada, rechazada o pendiente de modificación), el motivo en caso de rechazo o los comentarios en caso de solicitud de modificación, y, en caso de aprobación, la confirmación de la asignación.
- La notificación debe enviarse de forma automática inmediatamente después de la acción del responsable.
- La acción de notificación debe quedar registrada en el historial de auditoría.
- Se debe ofrecer la posibilidad al solicitante de consultar el estado de su solicitud en su panel de usuario.

### Tareas y Subtareas

**Tarea 1: Diseño de la Plantilla de Notificación**
- Subtarea 1.1: Crear un diseño de plantilla para notificaciones, adaptable a los diferentes estados de la solicitud.
- Subtarea 1.2: Validar el diseño con stakeholders y ajustar según retroalimentación.

**Tarea 2: Desarrollo del Módulo de Notificación en NestJS**
- Subtarea 2.1: Definir el DTO para enviar datos de notificación (estado de la solicitud, motivo o comentarios, información del recurso).
- Subtarea 2.2: Implementar la lógica en el servicio para generar y enviar la notificación.
- Subtarea 2.3: Integrar la funcionalidad con el servicio de correo o de mensajería (según la tecnología definida).
- Subtarea 2.4: Registrar la acción de notificación en el historial de auditoría.

**Tarea 3: Pruebas y Documentación**
- Subtarea 3.1: Escribir pruebas unitarias e integración (usando Jasmine y escenarios BDD) para el flujo de notificación.
- Subtarea 3.2: Documentar el proceso de notificación en la guía del usuario y la documentación técnica.
- Subtarea 3.3: Incluir la funcionalidad en el pipeline de CI/CD.
