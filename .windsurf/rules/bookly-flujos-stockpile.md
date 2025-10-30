---
trigger: manual
---

3. Módulo de Aprobaciones y Gestión de Solicitudes
El módulo de Aprobaciones y Gestión de Solicitudes es responsable de administrar el flujo de validación de reservas dentro del sistema Bookly. Garantiza que las solicitudes sean revisadas, aprobadas o rechazadas según las políticas de la universidad, asegurando trazabilidad y comunicación eficiente entre los actores involucrados
3.1. Procesos Clave
Generación y Envío de la Solicitud de Reserva
Revisión y Validación de la Solicitud
Aprobación o Rechazo de la Reserva
Generación Automática de Documentos de Aprobación o Rechazo
Notificación Automática al Solicitante y Responsables
Registro y Auditoría de las Aprobaciones y Rechazos
3.2. Pasos del Proceso
3.2.1. Generación y Envío de la Solicitud de Reserva
Descripción
El responsable revisa la solicitud y verifica si cumple con los requisitos para ser aprobada.
Flujo de Acciones
El responsable recibe una notificación con los detalles de la solicitud.
Accede al módulo de Gestión de Solicitudes y visualiza la reserva pendiente.
Evalúa la solicitud según criterios como:
Disponibilidad real del recurso.
Cumplimiento de normativas y permisos.
Conflictos con otras reservas o eventos institucionales.
Puede solicitar información adicional al solicitante si es necesario.
Decide si aprueba o rechaza la solicitud.
Actores Principales
Responsable: Evalúa la solicitud y decide su aprobación o rechazo.
Usuario: Puede responder a solicitudes de información adicional.
Sistema: Facilita el acceso a la información y registra la decisión.
Resultados
Se asegura que las reservas sean autorizadas por un responsable adecuado.
Se evita la asignación indebida de recursos.
3.2.2. Aprobación o Rechazo de la Reserva
Descripción
El responsable toma una decisión sobre la solicitud y el sistema actualiza su estado.
Flujo de Acciones
Si la solicitud es aprobada, el sistema cambia el estado a "Confirmada".
Si la solicitud es rechazada, el responsable debe indicar un motivo.
Se registra la decisión en la base de datos y en el historial de auditoría.
Se activan las notificaciones automáticas para informar al solicitante.
Actores Principales
Responsable: Toma la decisión de aprobar o rechazar la solicitud.
Sistema: Actualiza el estado y genera registros en la auditoría.
Usuario: Recibe la notificación con la decisión.
Resultados
Reservas aprobadas quedan activas y listas para su uso.
Las reservas rechazadas son archivadas con el motivo de la decisión.
3.2.3. Generación Automática de Documentos de Aprobación o Rechazo
Descripción
Una vez tomada la decisión, el sistema genera automáticamente documentos oficiales de confirmación o rechazo.
Flujo de Acciones
El sistema genera un documento PDF con la resolución de la solicitud.
El documento incluye:
Datos del solicitante.
Detalles del recurso y horario.
Estado de la reserva (Aprobada/Rechazada).
Firma electrónica del responsable.
El documento se almacena en el sistema y se envía por correo electrónico al solicitante.
Actores Principales
Sistema: Genera y envía el documento automáticamente.
Usuario: Recibe la confirmación oficial de la reserva.
Resultados
Se formaliza el proceso de aprobación/rechazo con documentación oficial.
Se mantiene un registro estructurado de cada decisión tomada.
3.2.4. Notificación Automática al Solicitante y Responsables
Descripción
Una vez aprobada o rechazada la solicitud, el sistema envía notificaciones a los involucrados.
Flujo de Acciones
Se envía un correo electrónico al solicitante con la respuesta.
Se notifica a los administradores o personal de vigilancia si la reserva fue aprobada.
En caso de rechazo, el usuario recibe el motivo y posibles opciones alternativas.
Actores Principales
Sistema: Envia notificaciones automáticas.
Usuario: Recibe la confirmación o rechazo.
Administradores/Vigilancia: Son informados de reservas activas.
Resultados
Los solicitantes reciben confirmación inmediata de su solicitud.
Se informa a las partes involucradas sobre reservas activas.
3.2.5. Registro y Auditoría de las Aprobaciones y Rechazos
Descripción
Cada acción en el flujo de aprobaciones se registra para auditoría y control.
Flujo de Acciones
Genera la acción en el flujo
Registra acción con los datos:
Usuario que realizó la solicitud.
Responsable de la aprobación/rechazo.
Fecha y hora de cada acción.
Estado de la reserva (Pendiente, Aprobada, Rechazada).
Motivos de rechazo si aplica.
Actores Principales
Usuario: Realiza la acción.
Sistema: Registra la acción realizada en el historial de auditoría.
Resultados
Se garantiza trazabilidad y control sobre las decisiones tomadas.
Se pueden generar reportes de solicitudes aprobadas y rechazadas.
