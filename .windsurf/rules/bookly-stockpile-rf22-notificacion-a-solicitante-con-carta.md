---
trigger: manual
---

## RF-22: Notificación automática al solicitante con carta de aceptación o rechazo

El sistema debe generar y enviar automáticamente una notificación al solicitante con la carta de aceptación o rechazo de su solicitud de reserva. Esta notificación debe incluir un documento formal en formato PDF que detalle el estado de la solicitud, asegurando una comunicación eficiente y transparente entre los usuarios y los administradores del sistema.

El objetivo de esta funcionalidad es garantizar que los usuarios sean informados de manera oportuna sobre el estado de su reserva, reduciendo la necesidad de seguimiento manual y optimizando la gestión de recursos.

### Criterios de Aceptación

- Cuando una solicitud de reserva es aprobada o rechazada, el sistema debe generar automáticamente una carta en formato PDF.
- La carta debe incluir información detallada como:
  - Datos del solicitante (nombre, cargo, contacto).
  - Detalles de la reserva (fecha, hora, recurso solicitado, duración).
  - Estado de la solicitud (aprobada o rechazada).
  - Motivo de la decisión en caso de rechazo.
  - Datos y firma del responsable de la validación.
- El sistema debe enviar una notificación automática por correo electrónico al solicitante con la carta adjunta.
- El solicitante debe poder descargar la carta desde su perfil en el sistema de reservas.
- El sistema debe mantener un registro de todas las notificaciones enviadas, asegurando trazabilidad y auditoría.
- En caso de problemas en la entrega del correo, el usuario debe recibir un aviso dentro del sistema para que pueda acceder a la carta de manera manual.

### Flujo de Uso

#### Generación de la carta de aceptación o rechazo

- Un usuario realiza una solicitud de reserva en el sistema.
- Un responsable valida la solicitud y la aprueba o rechaza.
- El sistema genera automáticamente una carta en formato PDF con la decisión tomada.

#### Envío de la notificación automática

- Una vez generada la carta, el sistema envía una notificación por correo electrónico al solicitante.
- El correo incluye un mensaje personalizado y la carta de aceptación o rechazo adjunta en formato PDF.

#### Acceso a la carta desde el sistema

- El usuario puede ingresar al sistema y descargar su carta desde la sección "Mis Reservas".
- En caso de problemas con el correo, el sistema mostrará un aviso y permitirá la descarga manual del documento.

#### Registro y auditoría

- El sistema almacena un historial de notificaciones enviadas, permitiendo a los administradores revisar registros en caso de disputas o aclaraciones.

### Restricciones y Consideraciones

- **Formato del documento**  
  ○ El sistema debe permitir la personalización de la carta con logotipos institucionales y formatos específicos según la entidad.

- **Entrega garantizada**  
  ○ Se debe contar con un mecanismo alternativo para acceder a la carta si el correo electrónico falla.

- **Acceso restringido**  
  ○ Sólo el solicitante y los administradores deben poder descargar la carta de aprobación o rechazo.

- **Tiempo de generación y envío**  
  ○ La notificación debe generarse y enviarse inmediatamente después de la validación de la solicitud.

- **Manejo de errores**  
  ○ Si el correo electrónico no se puede entregar, el sistema debe notificar al usuario y permitirle acceder a la carta desde su perfil.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe poder manejar múltiples notificaciones simultáneas sin afectar el rendimiento.
- **Rendimiento**: La generación de documentos y envío de correos debe ser rápida y eficiente.
- **Seguridad**: Las cartas deben estar protegidas contra alteraciones y accesibles solo para los usuarios autorizados.
- **Usabilidad**: La interfaz debe permitir una descarga fácil y rápida de los documentos.
- **Disponibilidad**: La funcionalidad debe estar siempre operativa para garantizar la comunicación eficiente de las decisiones de reserva.
