---
trigger: manual
---

### RF-26: Implementación de check-in/check-out digital, que podría añadirse en una iteración posterior para validar el uso real del recurso

---

## HU-23: Implementación de Check-In/Check-Out Digital

**Historia de Usuario**  
Como Usuario que tiene una reserva, quiero realizar check-in y check-out digital para confirmar mi presencia al iniciar y finalizar el uso del recurso, de modo que se optimice la asignación, se libere el recurso oportunamente y se mantenga la trazabilidad del uso.

### Criterios de Aceptación Generales

- Se debe ofrecer la opción de realizar check-in digital antes del inicio de la reserva y check-out al finalizar el uso.
- La verificación de identidad se realizará mediante un método seguro (por ejemplo, ingreso de PIN, credenciales o confirmación en la app).
- El sistema registrará la hora exacta del check-in y del check-out.
- Si el usuario no realiza el check-in dentro de un tiempo límite configurado (por ejemplo, 15 minutos tras el inicio de la reserva), se debe notificar a los administradores.
- En caso de check-out anticipado, el recurso se liberará para ser reservado nuevamente.
- Todas las acciones (check-in, check-out, notificaciones) se deben registrar en el historial de auditoría.
- La funcionalidad debe integrarse de forma transparente con el módulo de reservas y actualizar el estado de la reserva en tiempo real.

---

## SubHU-23.1: Check-In Digital

**Historia de Usuario**  
Como Usuario con reserva activa, quiero realizar el check-in digital mediante un método seguro para confirmar mi presencia y activar el uso del recurso asignado.

### Criterios de Aceptación

- La interfaz debe mostrar la opción de check-in digital al iniciar la reserva.
- El usuario debe autenticarse mediante un método seguro (PIN, credenciales o notificación en la app).
- Al realizar el check-in, se debe registrar la hora exacta y actualizar el estado de la reserva a “En Uso”.
- Si el usuario no realiza el check-in dentro del plazo configurado (ej., 15 minutos después del inicio programado), se debe enviar una notificación automática a los administradores.
- La acción de check-in debe quedar registrada en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Check-In**
- Subtarea 1.1: Crear wireframes y mockups para la pantalla de check-in, mostrando opción de autenticación (campo de PIN, botón de confirmación, etc.).
- Subtarea 1.2: Validar el diseño con usuarios y personal de soporte.

**Tarea 2: Desarrollo del Endpoint de Check-In en NestJS**
- Subtarea 2.1: Definir el DTO que reciba la solicitud de check-in (ID de la reserva, método de autenticación, PIN/credenciales).
- Subtarea 2.2: Implementar la lógica en el servicio para validar la identidad, registrar la hora exacta de check-in y actualizar el estado de la reserva a “En Uso”.
- Subtarea 2.3: Integrar el endpoint con la base de datos utilizando Prisma y MongoDB.
- Subtarea 2.4: Incluir validaciones (por ejemplo, verificación de PIN correcto y del tiempo límite).

**Tarea 3: Implementación de Notificaciones y Registro de Auditoría**
- Subtarea 3.1: Configurar el envío de notificaciones automáticas al administrador si no se realiza el check-in en el tiempo configurado.
- Subtarea 3.2: Registrar la acción de check-in (usuario, fecha, hora, estado actualizado) en el historial de auditoría utilizando un sistema de logging (por ejemplo, Winston).

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Desarrollar pruebas unitarias e integración utilizando Jasmine y escenarios BDD (Given-When-Then) para el flujo de check-in.
- Subtarea 4.2: Documentar la funcionalidad de check-in en la guía del usuario y en la documentación técnica.
- Subtarea 4.3: Integrar el módulo de check-in en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).

---

## SubHU-23.2: Check-Out Digital

**Historia de Usuario**  
Como Usuario que está utilizando un recurso, quiero realizar el check-out digital para confirmar el fin de mi uso y liberar el recurso de forma anticipada si es necesario, optimizando la disponibilidad.

### Criterios de Aceptación

- La interfaz debe mostrar la opción de check-out digital al finalizar el uso del recurso.
- Al realizar el check-out, se debe registrar la hora exacta y actualizar el estado de la reserva a “Finalizada”.
- Si el usuario realiza el check-out antes del tiempo programado, el recurso se libera inmediatamente para nuevas reservas.
- La acción de check-out debe quedar registrada en el historial de auditoría.
- En caso de no realizar el check-out de forma manual, el sistema debe registrar el cierre automático al final del tiempo programado y notificar al usuario.
- Se debe enviar una notificación de confirmación al usuario y actualizar la disponibilidad en tiempo real.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Check-Out**
- Subtarea 1.1: Crear wireframes y mockups de la pantalla de check-out, mostrando botón de confirmación y estado de la reserva.
- Subtarea 1.2: Validar el diseño con usuarios y personal de soporte, asegurando facilidad de uso en dispositivos móviles y de escritorio.

**Tarea 2: Desarrollo del Endpoint de Check-Out en NestJS**
- Subtarea 2.1: Definir el DTO para la solicitud de check-out (ID de reserva, datos de autenticación si aplica).
- Subtarea 2.2: Implementar la lógica en el servicio para registrar la hora exacta de check-out, actualizar el estado de la reserva a “Finalizada” y liberar el recurso.
- Subtarea 2.3: Integrar el endpoint con la base de datos usando Prisma y MongoDB.
- Subtarea 2.4: Incluir validaciones y manejo de excepciones para asegurar la correcta actualización del estado.

**Tarea 3: Notificaciones y Registro de Auditoría**
- Subtarea 3.1: Configurar el envío de notificaciones al usuario confirmando el check-out y la liberación del recurso.
- Subtarea 3.2: Registrar la acción de check-out en el historial de auditoría, incluyendo datos relevantes (usuario, fecha, hora, estado).
- Subtarea 3.3: Implementar lógica de cierre automático en caso de no check-out manual.

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Desarrollar pruebas unitarias e integración con Jasmine, utilizando escenarios BDD (Given-When-Then) para el flujo de check-out.
- Subtarea 4.2: Documentar la funcionalidad de check-out en la guía del usuario y la documentación técnica.
- Subtarea 4.3: Integrar el módulo de check-out en el pipeline de CI/CD.
