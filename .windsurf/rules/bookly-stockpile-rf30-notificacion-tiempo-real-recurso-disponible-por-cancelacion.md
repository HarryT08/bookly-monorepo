---
trigger: manual
---

## RF-30: Alertas en tiempo real cuando un recurso queda disponible tras una cancelación (espera activa)

El sistema debe permitir que los usuarios interesados en un recurso específico reciban alertas en tiempo real cuando este quede disponible debido a una cancelación. Esta funcionalidad, denominada **"Espera Activa"**, permite a los usuarios suscribirse a notificaciones de disponibilidad para ciertos recursos, mejorando la eficiencia en su uso y reduciendo el tiempo en que estos permanecen sin asignación.

Las alertas deben enviarse por correo electrónico o WhatsApp, y deben incluir:
- Detalles del recurso disponible (nombre, ubicación, características).
- Fecha y hora de la cancelación.
- Un enlace directo para reservar rápidamente el recurso antes de que otro usuario lo tome.

El objetivo de esta funcionalidad es optimizar la utilización de los recursos, ofreciendo a los usuarios una segunda oportunidad de acceso a recursos altamente demandados sin necesidad de monitorear manualmente el sistema.

### Criterios de Aceptación

- El sistema debe permitir a los usuarios suscribirse a la lista de espera activa para recibir alertas sobre recursos específicos.
- Cuando una reserva es cancelada, el sistema debe notificar inmediatamente a los usuarios suscritos al recurso liberado.
- La notificación debe incluir un enlace directo que permita al usuario acceder al sistema y reservar el recurso antes de que otro usuario lo haga.
- El sistema debe respetar el orden de suscripción a la lista de espera, notificando primero al usuario que se registró antes.
- Si un usuario recibe una notificación pero no reserva en un tiempo límite configurado (ejemplo: 10 minutos), el sistema debe notificar al siguiente usuario en la lista.
- Los administradores deben poder consultar el historial de alertas enviadas y reservas generadas a partir de la espera activa.
- Los usuarios deben poder cancelar su suscripción a la espera activa en cualquier momento.

### Flujo de Uso

#### Suscripción a la lista de espera activa

- Un usuario intenta reservar un recurso, pero este está ocupado en la fecha y hora requerida.
- El sistema ofrece la opción de **"Activar Alerta de Disponibilidad"**.
- Se confirma la suscripción y el usuario queda en lista de espera para ese recurso.

#### Cancelación de una reserva y activación de alerta

- Un usuario cancela su reserva, liberando el recurso.
- El sistema detecta la disponibilidad y genera una alerta automática.
- Se envía una notificación al primer usuario en la lista de espera.

#### Recepción y acción sobre la alerta

- El usuario recibe un mensaje con los detalles del recurso disponible y un enlace directo para reservar.
- Si el usuario no reserva dentro del tiempo límite (ejemplo: 10 minutos), el sistema envía la alerta al siguiente usuario en la lista.
- El primer usuario en confirmar obtiene la reserva y el recurso queda nuevamente asignado.

#### Cancelación de la suscripción a la espera activa

- Si un usuario ya no desea recibir alertas, puede cancelar su suscripción desde su perfil.
- Si la fecha y hora requerida por el usuario suscrito ha pasado, se cancela la suscripción y se elimina de la lista de espera automáticamente.
- El sistema lo elimina de la lista de espera sin afectar a otros usuarios.

### Restricciones y Consideraciones

- **Orden de prioridad en la lista de espera**
  - Los usuarios deben ser notificados en el orden en que se suscribieron, evitando ventajas injustas.
- **Tiempo límite de respuesta**
  - Para evitar que un recurso quede sin uso por demoras en la respuesta, el sistema debe establecer un período de reserva antes de notificar al siguiente usuario.
- **Cantidad de usuarios en lista de espera**
  - Puede haber un límite máximo de suscriptores por recurso, evitando saturación en notificaciones y conflictos en la asignación.
- **Manejo de reservas concurrentes**
  - Si dos usuarios intentan reservar el recurso al mismo tiempo tras recibir la alerta, el sistema debe otorgar la reserva al primer usuario que confirme.
- **Configuración de notificaciones**
  - Los usuarios deben poder seleccionar qué recursos desean seguir y a través de qué medio recibirán las alertas.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe soportar múltiples suscripciones y alertas en paralelo sin afectar el rendimiento.
- **Rendimiento**: La notificación debe enviarse en tiempo real tras la cancelación de una reserva.
- **Seguridad**: Solo los usuarios registrados y autorizados deben poder suscribirse y recibir alertas.
- **Usabilidad**: La interfaz de suscripción y notificación debe ser clara y accesible en dispositivos móviles y de escritorio.
- **Disponibilidad**: La funcionalidad debe estar operativa 24/7, garantizando que las alertas lleguen en cualquier momento.
