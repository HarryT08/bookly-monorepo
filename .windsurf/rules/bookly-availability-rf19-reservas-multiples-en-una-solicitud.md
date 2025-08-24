---
trigger: manual
---

## RF-19: Permitir reservas múltiples en una sola solicitud

El sistema debe permitir a los usuarios realizar reservas múltiples en una sola solicitud, facilitando la programación de eventos que requieran la reserva simultánea de varios recursos. Esto incluye la posibilidad de reservar múltiples salas, equipos, auditorios o laboratorios en un solo proceso, asegurando que todos los elementos estén disponibles en la misma fecha y horario.  
El objetivo de esta funcionalidad es reducir el tiempo y esfuerzo en la gestión de reservas, evitando que los usuarios deban generar múltiples solicitudes individuales. Además, se busca optimizar la planificación del uso de los recursos, asegurando su correcta asignación y disponibilidad.

### Criterios de Aceptación

- El usuario debe poder seleccionar múltiples recursos en una misma solicitud de reserva.
- El sistema debe verificar la disponibilidad simultánea de todos los recursos seleccionados antes de permitir la confirmación de la reserva.
- Si algún recurso no está disponible, el sistema debe mostrar que no está disponible para la fecha elegida.
- El sistema debe generar una única solicitud de reserva con varias asignaciones de recursos vinculadas.
- La confirmación de la solicitud debe mostrar un resumen detallado de todas las reservas incluidas.
- El usuario debe poder modificar o cancelar cada recurso dentro de la reserva múltiple sin afectar los demás (excepto si hay dependencias).
- Los administradores deben poder visualizar y gestionar las reservas múltiples desde el panel de administración.
- Se deben enviar notificaciones únicas para toda la reserva múltiple, evitando comunicaciones separadas por cada recurso.

### Flujo de Uso

#### Inicio de la reserva múltiple

- El usuario accede al módulo de reservas y selecciona la opción de reserva múltiple.
- Define la fecha y hora del evento o actividad.
- Agrega los recursos requeridos (salas, equipos, laboratorios, etc.).
- El sistema verifica la disponibilidad de todos los recursos en el mismo horario.

#### Validación y alternativas

- Si todos los recursos están disponibles, el usuario puede avanzar a la confirmación.
- Si algún recurso no está disponible, el sistema muestra cuales no lo están.
- El usuario puede aceptar la solicitud de reserva o modificar su solicitud.

#### Confirmación de la solicitud

- Se muestra un resumen detallado con los recursos seleccionados, fechas y horarios.
- El usuario revisa y confirma la reserva múltiple.
- El sistema genera reservas individuales vinculadas, asegurando que todas se confirmen juntas.

#### Notificación y gestión de reservas

- El usuario recibe una única confirmación con los detalles de todas las reservas.
- Si requiere modificar o cancelar una reserva dentro del grupo, puede hacerlo sin afectar las demás.
- Si la reserva múltiple requiere aprobación administrativa, el sistema envía la solicitud a revisión.

#### Modificación o cancelación de reservas múltiples

- Si el usuario necesita cancelar o modificar una reserva específica dentro del grupo, el sistema permite hacerlo sin afectar las demás.
- En caso de que una reserva dependa de otra (ejemplo: un equipo dentro de una sala específica), la cancelación o modificación puede requerir ajustes adicionales.
- Se envía una notificación de actualización al usuario y a los administradores si es necesario.

### Restricciones y Consideraciones

- **Disponibilidad simultánea:**
  - No todos los recursos pueden estar disponibles al mismo tiempo, algo que el sistema debe mostrar claramente.

- **Límite de recursos por solicitud:**
  - Se debe definir un número máximo de recursos que un usuario puede incluir en una sola reserva múltiple.

- **Jerarquía de autorización:**
  - Algunas reservas múltiples pueden requerir la aprobación de un administrador antes de ser confirmadas.

- **Dependencia entre recursos:**
  - Si un recurso está vinculado a otro (ejemplo: un equipo dentro de una sala específica), su cancelación o modificación podría afectar al resto.

- **Bloqueo temporal de recursos:**
  - Para evitar conflictos, los recursos seleccionados deben bloquearse temporalmente mientras el usuario completa la solicitud.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad:** El sistema debe manejar múltiples solicitudes de reservas simultáneamente sin afectar el rendimiento.
- **Rendimiento:** La validación de disponibilidad para múltiples recursos debe ser rápida y eficiente.
- **Seguridad:** Solo usuarios autorizados deben poder realizar reservas múltiples según sus permisos.
- **Usabilidad:** La interfaz debe ser intuitiva, permitiendo agregar, modificar o eliminar recursos fácilmente antes de confirmar la reserva.
- **Notificaciones:** Se deben enviar alertas claras y centralizadas para evitar confusión en la gestión de reservas múltiples.
