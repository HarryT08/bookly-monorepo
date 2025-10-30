---
trigger: manual
---

2. Módulo de Disponibilidad y Reserva
El módulo de Disponibilidad y Reserva permite a los usuarios consultar la disponibilidad de los recursos, realizar solicitudes de reserva y gestionar cambios en las mismas. También se encarga de validar que los espacios sean asignados de manera óptima, evitando conflictos y optimizando el uso de los recursos institucionales.
2.1. Procesos Clave
Consulta de Disponibilidad de Recursos
Solicitud de Reserva
Validación de Disponibilidad y Confirmación de Reserva
Modificación o Cancelación de Reserva
Gestión de Lista de Espera
Reasignación de Reservas por Mantenimiento o Eventos Imprevistos
Check-in/Check-out de Reservas (Opcional)
2.2. Pasos del Proceso
2.2.1. Consulta de Disponibilidad de Recursos
Descripción
Permite a los usuarios verificar en tiempo real la disponibilidad de los recursos antes de realizar una reserva.
Flujo de Acciones
El usuario accede al sistema y selecciona la opción Consultar Disponibilidad.
Filtra los recursos según tipo, ubicación, fecha y horario deseado.
El sistema consulta la base de datos y muestra los resultados disponibles en formato de calendario.
Si no hay disponibilidad, se sugiere una lista de horarios alternativos o se ofrece la opción de unirse a la Lista de Espera.
Actores Principales
Usuario: Realiza la consulta de disponibilidad.
Sistema: Procesa la solicitud, verifica la disponibilidad y muestra los resultados en tiempo real.
Resultados
Se facilita la planificación de reservas al usuario.
Se optimiza el uso de los espacios al mostrar horarios alternativos disponibles.
Se evita la duplicación de reservas en horarios ocupados.
2.2.2. Solicitud de Reserva
Descripción
Permite a los usuarios solicitar la reserva de un recurso específico según su disponibilidad.
Flujo de Acciones
El usuario selecciona un recurso disponible en la interfaz de calendario.
Completa el formulario de solicitud, incluyendo fecha, horario, motivo de uso y requisitos adicionales.
El sistema valida los datos y muestra un resumen de la solicitud.
Se genera un número de solicitud y se envía una notificación al usuario con el estado de la solicitud.
Actores Principales
Usuario: Completa y envía la solicitud de reserva.
Sistema: Valida la disponibilidad y registra la solicitud.
Resultados
Se garantiza que solo se soliciten reservas en horarios disponibles.
Se mantiene un registro digital de las solicitudes.
Se informa al usuario sobre el estado de su solicitud de manera inmediata.
2.2.3. Validación de Disponibilidad y Confirmación de Reserva
Descripción
Asegura que la reserva no genere conflictos y confirma su asignación en el sistema.
Flujo de Acciones
El sistema revisa automáticamente si la solicitud no interfiere con otras reservas o eventos institucionales.
Si no hay conflictos, la reserva se confirma y se notifica al usuario.
Si hay un conflicto, se sugiere un horario alternativo o la inclusión en la Lista de Espera.
Se actualiza la disponibilidad del recurso en el calendario.
Actores Principales
Sistema: Verifica disponibilidad y asigna la reserva.
Usuario: Recibe la confirmación o ajustes en su reserva.
Resultados
Se evita la sobreasignación de recursos.
Se mantiene actualizada la disponibilidad en tiempo real.
Se reduce la posibilidad de errores en la asignación de espacios.
2.2.4. Modificación o Cancelación de Reserva
Descripción
Permite a los usuarios cambiar detalles de su reserva o cancelarla en caso de que no sea requerida.
Flujo de Acciones
El usuario accede a la sección Mis Reservas.
Selecciona la reserva a modificar o cancelar.
Si es una modificación, el sistema valida la nueva configuración y la actualiza si es posible.
Si es una cancelación, el sistema libera la disponibilidad del recurso. La cancelación sólo puede realizarse con cierto tiempo de antelación configurable.
Se notifica a los usuarios afectados en caso de cambios o cancelaciones.
Actores Principales
Usuario: Solicita la modificación o cancelación.
Sistema: Gestiona los cambios y actualiza la disponibilidad.
Resultados
Se flexibiliza la gestión de reservas para los usuarios.
Se optimiza el uso de los recursos al liberar espacios cancelados.
Se evita la ocupación de espacios innecesarios.
2.2.5. Gestión de Lista de Espera
Descripción
Permite a los usuarios inscribirse en una lista de espera si el recurso no está disponible en el horario deseado.
Flujo de Acciones
Un usuario intenta reservar un recurso sin disponibilidad.
El sistema ofrece la opción de Unirse a la Lista de Espera.
Se asigna un número de posición en la lista y se envía una notificación al usuario.
Si una reserva se cancela, el sistema asigna automáticamente el recurso al primer usuario en la lista.
Se notifica al usuario con un tiempo límite para confirmar su reserva.
Actores Principales
Usuario: Se inscribe en la lista de espera.
Sistema: Gestiona la lista y asigna recursos disponibles.
Resultados
Se maximiza la utilización de los recursos.
Se reduce la cantidad de espacios no utilizados por cancelaciones de última hora.
Se mejora la experiencia del usuario al permitirle acceder a recursos previamente no disponibles.
2.2.6. Reasignación de Reservas por Mantenimiento o Eventos Imprevistos
Descripción
Reasigna reservas si un recurso se vuelve inactivo por mantenimiento o eventos inesperados.
Flujo de Acciones
Se detecta que un recurso será inhabilitado por mantenimiento o un evento especial.
El sistema revisa las reservas activas y las cambia a estado Pendiente de Reasignación.
Se busca automáticamente un recurso alternativo para reasignar la reserva.
Se notifica al usuario afectado y se le ofrece la opción de aceptar o rechazar la reasignación.
Actores Principales
Administrador: Define los recursos que entrarán en mantenimiento.
Sistema: Reasigna las reservas y gestiona notificaciones.
Resultados
Se garantiza el uso continuo de los recursos disponibles.
Se minimizan las afectaciones a los usuarios con reservas ya confirmadas.
Se optimiza la planificación institucional.
