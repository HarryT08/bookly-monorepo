---
trigger: manual
---

## RF-15: Reasignación de reservas en caso de mantenimiento o eventos imprevistos

El sistema debe permitir la reasignación automática o manual de reservas cuando un recurso deja de estar disponible debido a mantenimiento programado, fallas técnicas o eventos imprevistos. Esta funcionalidad debe ofrecer opciones alternativas a los usuarios afectados, asegurando que sus necesidades sean atendidas sin afectar la planificación general del uso de recursos.  
El propósito de esta funcionalidad es minimizar el impacto de cancelaciones inesperadas y garantizar la continuidad en la disponibilidad de recursos para los usuarios.

### Criterios de Aceptación

- El sistema debe registrar cuándo un recurso queda no disponible debido a mantenimiento o eventos inesperados.
- Las reservas afectadas deben cambiar su estado a "Pendiente de Reasignación" y notificar a los usuarios.
- Los usuarios deben recibir una notificación automática con opciones de reasignación o la posibilidad de cancelar su reserva.
- Si el usuario acepta la reasignación, el sistema debe actualizar la reserva y reflejar la nueva ubicación o recurso asignado.
- Si no hay opciones disponibles, el usuario puede optar por quedar en una lista de espera o recibir una alerta cuando se libere un recurso.
- Los administradores deben poder gestionar manualmente la reasignación en caso de que las opciones automáticas no sean viables.
- Se debe registrar un historial de reasignaciones para auditoría y control de incidencias.

### Flujo de Uso

#### Identificación del problema

- Un recurso previamente reservado se vuelve no disponible debido a mantenimiento o un evento imprevisto.
- El sistema cambia el estado de las reservas afectadas a "Pendiente de Reasignación".

#### Generación de alternativas de reasignación

- El sistema busca recursos alternativos con disponibilidad en la misma fecha y horario.
- Si hay recursos equivalentes disponibles, el sistema sugiere opciones al usuario.
- Si no hay opciones disponibles, se ofrece la posibilidad de ingresar a una lista de espera.

#### Notificación al usuario

- El usuario recibe una alerta automática sobre la afectación de su reserva.
- Puede elegir entre:
  - Rechazar y cancelar la reserva sin penalización.
  - Ingresar a la lista de espera para ser reasignado cuando haya disponibilidad.

#### Confirmación de la nueva reserva

- Si el usuario acepta una alternativa, la reserva se actualiza con los nuevos datos.
- El usuario recibe una confirmación de la reasignación con la información del nuevo recurso “Pendiente de Reasignación”.
- Si rechaza la reasignación, la reserva se cancela automáticamente y el recurso queda disponible para otros usuarios.

#### Gestión manual por administradores

- Los administradores pueden intervenir en la reasignación.
- Pueden asignar manualmente otro recurso o modificar los horarios de la reserva.

### Restricciones y Consideraciones

- **Tiempo de aviso:** Se debe establecer un margen mínimo de tiempo para notificar a los usuarios sobre cancelaciones por mantenimiento programado.

- **Priorización de reasignaciones:** Dependiendo del tipo de usuario (ejemplo: docentes vs. estudiantes), ciertas reservas pueden tener prioridad en la reasignación.

- **Capacidad de los recursos alternativos:** No todos los recursos pueden ser sustituidos entre sí, por lo que se debe definir una lógica de equivalencias entre recursos.

- **Límites en la reasignación automática:** Se debe establecer hasta cuántas veces una reserva puede ser reasignada antes de ser cancelada automáticamente.

- **Opcionalidad del usuario:** El usuario siempre debe tener la posibilidad de aceptar o rechazar la reasignación sin penalización.
