---
trigger: manual
---

## RF-14: Implementar una lista de espera para reservas sobrecargadas

El sistema debe permitir a los usuarios inscribirse en una lista de espera cuando intentan reservar un recurso que ya está completamente ocupado para una fecha y hora específicas. Esta funcionalidad garantiza que, en caso de cancelación o liberación del recurso, los usuarios en lista de espera sean notificados y puedan confirmar su reserva en orden de prioridad.  
El propósito de esta funcionalidad es maximizar la utilización de los recursos, reducir la pérdida de oportunidades debido a cancelaciones y optimizar la gestión de reservas.

### Criterios de Aceptación

- Cuando un usuario intenta reservar un recurso sin disponibilidad, el sistema lo inscribe en la lista de espera.
- La lista de espera debe seguir un orden de prioridad basado en el momento de inscripción.
- Si un recurso se libera, el sistema debe notificar automáticamente al usuario en primer lugar de la lista, dándole un tiempo determinado (configurable) para confirmar la reserva.
- Si el usuario no confirma dentro del tiempo límite, se cancela la confirmación y el siguiente usuario en la lista es notificado.
- Los usuarios pueden retirarse voluntariamente de la lista de espera en cualquier momento.
- Los administradores deben poder visualizar y gestionar la lista de espera para cada recurso, incluyendo la reasignación de reservas si es necesario.
- El sistema debe registrar todas las inscripciones, cancelaciones y asignaciones en un historial de lista de espera.

### Flujo de Uso

#### Intento de reserva sin disponibilidad

- El usuario intenta reservar un recurso, pero el sistema indica que está totalmente ocupado.
- Se le ofrece la opción de unirse a la lista de espera.

#### Registro en la lista de espera

- El usuario confirma su inscripción en la lista de espera.
- El sistema muestra su posición en la lista y le permite retirarse si lo desea.

#### Liberación de una reserva

- Un usuario cancela su reserva o la administración libera el recurso.
- El sistema notifica al primer usuario en la lista y le da un tiempo límite para confirmar su reserva.

#### Asignación de la reserva

- Si el usuario acepta dentro del tiempo límite, la reserva se confirma.
- Si no responde o rechaza, el sistema pasa la oportunidad al siguiente usuario en la lista.

#### Salida de la lista de espera

- Los usuarios pueden cancelar su inscripción manualmente si ya no necesitan la reserva.
- Si la fecha y hora de la reserva pasan sin que se libere el recurso, los usuarios son automáticamente eliminados de la lista.

### Restricciones y Consideraciones

- **Límite de usuarios en lista de espera:**
  - Se debe definir un número máximo de usuarios por recurso para evitar listas excesivamente largas.

- **Tiempo de respuesta para confirmación:**
  - Se debe establecer un período de gracia para que los usuarios confirmen su reserva antes de pasar al siguiente en la lista.

- **Jerarquía de asignación:**
  - Puede ser necesario establecer reglas adicionales para ciertos casos, como priorizar ciertos tipos de usuarios (ej., docentes sobre estudiantes).

- **Control de abandono:**
  - Si un usuario rechaza una reserva más de una vez, podría perder prioridad en futuras listas de espera.

- **Disponibilidad de notificación:**
  - Si un usuario no tiene habilitadas las notificaciones o no responde, se debe garantizar que la oportunidad no se pierda.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad:** El sistema debe poder gestionar múltiples listas de espera simultáneamente sin afectar el rendimiento.
- **Rendimiento:** La verificación de disponibilidad y asignación debe ser rápida para evitar retrasos en la reasignación de recursos.
- **Seguridad:** Solo los usuarios autorizados pueden unirse a la lista de espera y recibir asignaciones.
- **Notificaciones:** Debe enviar alertas por correo o dentro del sistema para informar cambios en la lista de espera.
- **Auditoría:** Se debe registrar un historial de asignaciones y notificaciones para garantizar la transparencia.
