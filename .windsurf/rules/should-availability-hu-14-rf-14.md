---
trigger: manual
---

### RF-14: Implementar lista de espera para reservas sobrecargadas, para maximizar la utilización de los recursos

---

## HU-14: Gestión de Lista de Espera para Reservas Sobrecargadas

**Historia de Usuario**  
Como Usuario, quiero unirme a la lista de espera cuando no haya disponibilidad para reservar un recurso para tener la oportunidad de obtenerlo tan pronto se libere, sin tener que monitorear constantemente su disponibilidad.

### Criterios de Aceptación

- Cuando un usuario intenta reservar un recurso sin disponibilidad, se le debe ofrecer la opción de unirse a una lista de espera.
- El sistema debe registrar automáticamente la fecha y hora de inscripción, asignando un orden basado en el momento de ingreso.
- La interfaz debe permitir al usuario visualizar su posición en la lista de espera.
- El usuario debe tener la opción de cancelar su inscripción en cualquier momento.
- Todas las acciones (inscripción, actualización o cancelación) deben registrarse en el historial de auditoría.
- La lógica de la lista de espera debe integrarse con el proceso de asignación: cuando se libera un recurso, el primer usuario en la lista es notificado con un tiempo limitado para confirmar la reserva.

---

## SubHU-14.1: Inscripción en la Lista de Espera

**Historia de Usuario**  
Como Usuario, quiero inscribirme en la lista de espera cuando un recurso esté completamente reservado para asegurar mi posición y tener la oportunidad de ser notificado cuando el recurso se libere.

### Criterios de Aceptación

- Al intentar reservar un recurso no disponible, el sistema debe ofrecer la opción "Unirse a la lista de espera".
- El usuario debe poder confirmar su inscripción y el sistema debe registrar automáticamente la fecha, hora y asignar un número de orden.
- La interfaz mostrará la posición actual del usuario en la lista de espera.
- Se debe permitir la cancelación de la inscripción en cualquier momento.
- La inscripción y cualquier cancelación deben quedar registradas en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Inscripción**
- Subtarea 1.1: Crear wireframes y mockups del flujo de inscripción en la lista de espera.
- Subtarea 1.2: Validar el diseño con usuarios y administradores para asegurar claridad y facilidad de uso.

**Tarea 2: Desarrollo del Endpoint para Inscripción**
- Subtarea 2.1: Definir el DTO para la inscripción en la lista de espera, incluyendo datos del usuario, recurso y timestamp.
- Subtarea 2.2: Implementar la lógica en el servicio de reservas para agregar el usuario a la lista de espera, asegurando que no se duplique la inscripción para el mismo recurso.
- Subtarea 2.3: Integrar el endpoint con la base de datos (MongoDB usando Prisma).

**Tarea 3: Registro de Auditoría y Manejo de Errores**
- Subtarea 3.1: Configurar logging (por ejemplo, con Winston) para registrar cada acción de inscripción o cancelación.
- Subtarea 3.2: Implementar manejo de excepciones para notificar al usuario en caso de error.

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Desarrollar pruebas unitarias e integración en Jasmine utilizando escenarios BDD (Given-When-Then).
- Subtarea 4.2: Documentar el proceso de inscripción y las reglas de la lista de espera en la guía del usuario.
- Subtarea 4.3: Incluir esta funcionalidad en el pipeline de CI/CD.

---

## SubHU-14.2: Notificación y Confirmación de Reserva desde la Lista de Espera

**Historia de Usuario**  
Como Usuario en la Lista de Espera, quiero ser notificado cuando un recurso se libere y disponer de un tiempo limitado para confirmar mi reserva para asegurar mi acceso al recurso antes de que otro usuario tome mi lugar.

### Criterios de Aceptación

- Cuando un recurso se libera (por cancelación o modificación), el sistema debe notificar automáticamente al primer usuario en la lista de espera.
- La notificación debe incluir un enlace o acción que permita confirmar la reserva y un tiempo configurable (por ejemplo, 10 minutos) para hacerlo.
- Si el usuario confirma dentro del plazo, la reserva se asigna; de lo contrario, el sistema debe pasar al siguiente usuario en la lista.
- La confirmación o expiración de la notificación se registrará en el historial de auditoría.
- Se deben enviar recordatorios si el tiempo de confirmación está por expirar.

### Tareas y Subtareas

**Tarea 1: Desarrollo del Módulo de Notificaciones para la Lista de Espera**
- Subtarea 1.1: Implementar la lógica para detectar cuando un recurso se libera y obtener el primer usuario en la lista.
- Subtarea 1.2: Desarrollar el formato de notificación (correo electrónico, mensaje en la app, o WhatsApp) que incluya detalles del recurso y el enlace para confirmar.
- Subtarea 1.3: Configurar el tiempo límite para la confirmación y establecer recordatorios automáticos.

**Tarea 2: Desarrollo de la Lógica de Confirmación y Escalado**
- Subtarea 2.1: Implementar la lógica en el servicio de reservas para aceptar la confirmación del usuario y asignar el recurso.
- Subtarea 2.2: Si el usuario no confirma en el tiempo estipulado, activar la notificación al siguiente usuario en la lista.
- Subtarea 2.3: Registrar todas las acciones (confirmación, expiración, escalado) en la base de datos.

**Tarea 3: Registro de Auditoría y Manejo de Excepciones**
- Subtarea 3.1: Configurar logging para registrar cada notificación y acción de confirmación.
- Subtarea 3.2: Implementar manejo de errores que notifique a los administradores en caso de fallos en el proceso.

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Escribir pruebas unitarias e integración con Jasmine utilizando escenarios Given-When-Then.
- Subtarea 4.2: Documentar el flujo de notificación y confirmación, incluyendo la configuración del tiempo límite.
- Subtarea 4.3: Integrar la funcionalidad en el pipeline de CI/CD.
