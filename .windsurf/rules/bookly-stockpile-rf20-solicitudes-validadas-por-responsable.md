---
trigger: manual
---

## RF-20: Permitir que las solicitudes de reserva sean validadas por un responsable (director, ingeniero de soporte o secretaria).

El sistema debe permitir que las solicitudes de reserva sean validadas por un responsable autorizado, como un director, ingeniero de soporte o secretaria, antes de su confirmación. Esta validación es esencial para garantizar que los recursos sean asignados correctamente y evitar mal uso o conflictos en la disponibilidad.  
El propósito de esta funcionalidad es proporcionar un control adicional sobre el uso de los recursos, asegurando que las solicitudes sean revisadas y aprobadas de acuerdo con las políticas de la institución.

### Criterios de Aceptación

- El sistema debe permitir configurar que las reservas requieran validación previa antes de ser confirmadas.
- Los responsables deben recibir notificaciones automáticas cuando haya nuevas solicitudes pendientes de revisión.
- El responsable debe poder aprobar, rechazar o solicitar modificaciones en la solicitud de reserva.
- Si la solicitud es aprobada, el sistema debe asignar el recurso automáticamente y notificar al solicitante.
- Si la solicitud es rechazada, el sistema debe informar al usuario sobre la decisión y permitirle realizar cambios si es necesario.
- Si el responsable no responde en un tiempo determinado (configurable), la reserva puede ser reasignada a otro validador. Si solo hay un validador,, el sistema vuelve a notificar con el tiempo que la reserva ha estado pendiente por revisión.
- El sistema debe registrar un historial de aprobaciones y rechazos para auditoría y control.

### Flujo de Uso

#### Envío de la solicitud por el usuario

- El usuario accede al sistema y completa el formulario de reserva.
- Si el recurso requiere validación, el sistema marca la solicitud como "Pendiente de Aprobación".
- El usuario recibe una notificación indicando que su solicitud está en proceso de validación.

#### Revisión por parte del responsable

- El responsable recibe una notificación automática sobre la nueva solicitud pendiente.
- Accede al sistema y revisa los detalles de la reserva.
- Puede optar por:
  - Aprobar la solicitud → Se asigna el recurso y se notifica al usuario.
  - Rechazar la solicitud → El usuario recibe una notificación con el motivo del rechazo.
  - Solicitar modificaciones → Se devuelve la solicitud al usuario con comentarios para ajustar la reserva.

#### Confirmación o cancelación de la reserva

- Si la reserva es aprobada, el recurso queda bloqueado en el sistema y el usuario recibe una confirmación.
- Si la reserva es rechazada, el usuario puede modificar la solicitud y reenviarla para revisión.
- Si el responsable no responde dentro del tiempo establecido, el sistema puede asignar la solicitud a otro validador y si no hay otro validador, vuelve a enviar la solicitud con el tiempo de espera por respuesta.

### Registro y auditoría

- Todas las acciones de validación (aprobaciones, rechazos y comentarios) quedan registradas en el sistema.
- Los administradores pueden revisar el historial de validaciones para auditar decisiones y optimizar el proceso.
