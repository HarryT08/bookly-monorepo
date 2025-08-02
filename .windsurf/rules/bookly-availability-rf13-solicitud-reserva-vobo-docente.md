---
trigger: manual
---

## RF-13: Solicitud de reserva con VoBo de un profesor para estudiantes

El sistema debe permitir que los estudiantes puedan solicitar reservas de recursos únicamente si cuentan con el Visto Bueno (VoBo) de un profesor. Este mecanismo garantizará que las reservas gestionadas por estudiantes sean validadas y aprobadas por un docente responsable antes de su confirmación.  
El flujo de aprobación debe incluir una notificación al profesor designado, quien podrá aprobar o rechazar la solicitud. Solo una vez aprobada, la reserva quedará confirmada y el recurso pendiente para asignar. En caso de rechazo, el estudiante será notificado y podrá modificar o cancelar su solicitud.  
Este proceso busca optimizar la gestión de recursos en entornos académicos, asegurando un uso adecuado y controlado por parte del cuerpo docente.

### Criterios de Aceptación

- El sistema debe permitir a los estudiantes seleccionar un profesor responsable para validar su solicitud de reserva.
- La solicitud de reserva debe permanecer en estado "Pendiente de Aprobación" hasta que el profesor la valide.
- El profesor debe recibir una notificación automática con los detalles de la solicitud.
- El profesor podrá aprobar o rechazar la solicitud desde su cuenta en el sistema.
- En caso de aprobación, la reserva quedará confirmada y el recurso “Pendiente de Asignación” y se notifica al estudiante.
- En caso de rechazo, el estudiante recibirá una notificación con el motivo del rechazo y podrá editar la solicitud o cancelarla.
- Si el profesor no responde en un tiempo determinado (configurable), la solicitud quedará automáticamente rechazada y el estudiante deberá reenviar o modificar la petición.
- El sistema debe mantener un registro de todas las solicitudes con su estado (aprobada, rechazada, pendiente).

### Flujo de Uso

#### Solicitud de reserva por parte del estudiante

- El estudiante accede al sistema y selecciona el recurso que desea reservar.
- En el formulario de solicitud, ingresa la fecha, hora y duración de la reserva.
- Selecciona un profesor que dará el VoBo para la reserva.
- Envía la solicitud, que queda en estado "Pendiente de Aprobación".

#### Revisión y aprobación por parte del profesor

- El profesor recibe una notificación con los detalles de la solicitud.
- Puede visualizar la solicitud en su panel y decidir si aprobar o rechazar.
- Si aprueba, la reserva queda confirmada, se notifica al estudiante y el recurso queda “Pendiente de Asignación”.
- Si rechaza, debe indicar un motivo de rechazo, y el estudiante será notificado.

#### Gestión de la reserva aprobada

- Una vez aprobada, la reserva se registra y se actualiza el estado del recurso a “Pendiente por Asignación”.
- Si el estudiante ya no necesita la reserva, puede cancelarla desde su cuenta.

#### Acción automática en caso de falta de respuesta

- Si el profesor no responde en el plazo establecido (ej., 24 horas), el sistema rechaza automáticamente la solicitud.
- El estudiante es notificado y puede volver a enviar la solicitud con otro profesor o modificar la petición.

### Restricciones y Consideraciones

- **Asignación de profesores:**
  - Solo los profesores habilitados en el sistema podrán aprobar solicitudes de reserva. Se debe garantizar que el estudiante elija un profesor válido.

- **Tiempo límite de aprobación:**
  - Se debe establecer un tiempo máximo de respuesta por parte del profesor antes de que la solicitud sea rechazada automáticamente.

- **Rechazos sin justificación:**
  - Se debe definir si es obligatorio que el profesor ingrese un motivo al rechazar una solicitud para brindar retroalimentación al estudiante.

- **Cantidad de solicitudes simultáneas:**
  - Se deben definir límites para evitar que un estudiante envíe múltiples solicitudes para el mismo recurso sin esperar respuesta.

- **Cambio de profesor asignado:**
  - Se debe establecer si un estudiante puede modificar el profesor designado después de haber enviado la solicitud.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad:** El sistema debe soportar un alto volumen de solicitudes sin afectar el rendimiento.
- **Seguridad:** Se debe garantizar que solo profesores y estudiantes con cuentas válidas puedan realizar y aprobar solicitudes.
- **Usabilidad:** La interfaz debe ser intuitiva y permitir la validación del VoBo con pocos clics.
- **Notificaciones:** Debe enviar alertas oportunas por correo electrónico o mensajes dentro del sistema.
- **Auditoría:** Se debe almacenar un historial de aprobaciones y rechazos para futuras consultas o auditorías.
