---
trigger: manual
---

## RF-29: Recordatorios de reserva con opciones de configuración

El sistema debe permitir a los usuarios configurar recordatorios personalizados para sus reservas, asegurando que reciban notificaciones en el momento más conveniente antes del uso del recurso.

Los recordatorios pueden enviarse mediante correo electrónico o WhatsApp, y deben ser configurables en diferentes intervalos, como:
- 30 minutos antes del inicio de la reserva.
- 1 hora antes del inicio de la reserva.
- 24 horas antes del uso del recurso.

El objetivo de esta funcionalidad es minimizar inasistencias, optimizar la utilización de los recursos y mejorar la experiencia del usuario a través de una comunicación anticipada y configurable.

### Criterios de Aceptación

- El sistema debe permitir a los usuarios configurar sus preferencias de recordatorio desde su perfil o al momento de hacer una reserva.
- Los recordatorios deben enviarse automáticamente en los intervalos configurados por el usuario.
- El sistema debe ofrecer opciones de notificación por correo electrónico y WhatsApp, y el usuario debe poder elegir uno o varios métodos de notificación.
- Si un usuario no configura una preferencia específica, el sistema debe enviar un recordatorio por defecto 30 minutos antes de la reserva.
- La notificación debe incluir información clara sobre la reserva:
  - Fecha y hora del inicio de la reserva.
  - Ubicación y detalles del recurso reservado.
  - Instrucciones adicionales, si aplica.
- El sistema debe permitir a los administradores visualizar un historial de recordatorios enviados para auditoría y control.
- Si una reserva es cancelada antes de que se envíe el recordatorio, el sistema debe evitar el envío para evitar confusión.

### Flujo de Uso

#### Configuración de recordatorios (Usuario)

- El usuario accede a su perfil en el sistema y selecciona la opción "Configuración de recordatorios".
- Elige los intervalos de tiempo en los que desea recibir los recordatorios (ejemplo: 1 hora antes y 30 minutos antes).
- Selecciona el método de notificación preferido (correo o WhatsApp).
- Guarda la configuración y el sistema la aplicará a todas sus futuras reservas.

#### Creación de una reserva y activación de recordatorios

- El usuario realiza una nueva reserva en el sistema.
- Si no ha configurado recordatorios previamente, el sistema le ofrece la opción de personalizar los recordatorios en ese momento.
- El sistema programa los recordatorios según la preferencia del usuario o, en su defecto, establece el recordatorio por defecto de 30 minutos antes.

#### Envío de recordatorios

- En el intervalo configurado, el sistema envía automáticamente la notificación a través de los canales seleccionados por el usuario.
- La notificación incluye:
  - Fecha y hora de la reserva.
  - Ubicación y detalles del recurso reservado.
  - Instrucciones adicionales o requisitos previos para el uso del recurso.
- Si la reserva es cancelada antes del recordatorio, el sistema cancela el envío.

#### Registro y auditoría de notificaciones

- El sistema mantiene un historial de recordatorios enviados que puede ser consultado por los administradores para auditoría.
- Si un usuario indica que no recibió la notificación, el administrador puede revisar el historial y verificar su entrega.

### Restricciones y Consideraciones

- **Configuración individual por usuario**
  - Cada usuario debe poder personalizar sus recordatorios sin afectar la configuración de otros.
- **Evitar envíos innecesarios**
  - Si una reserva es cancelada antes de que el recordatorio sea enviado, el sistema debe detener el envío.
- **Frecuencia de recordatorios**
  - Se debe definir un número máximo de recordatorios por reserva para evitar saturar a los usuarios con demasiadas notificaciones.
- **Usuarios con múltiples reservas**
  - Si un usuario tiene varias reservas el mismo día, el sistema debe consolidar los recordatorios en un solo mensaje para evitar envíos redundantes.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe poder manejar una gran cantidad de notificaciones simultáneamente sin afectar el rendimiento.
- **Rendimiento**: Los recordatorios deben enviarse en tiempo real sin retrasos perceptibles para el usuario.
- **Seguridad**: Se debe garantizar que las notificaciones solo sean enviadas a los usuarios autorizados y que sus datos personales estén protegidos.
- **Usabilidad**: La configuración de recordatorios debe ser clara y accesible para todos los usuarios, con opciones intuitivas.
- **Disponibilidad**: La funcionalidad debe operar 24/7, asegurando la entrega de notificaciones en cualquier momento del día.
