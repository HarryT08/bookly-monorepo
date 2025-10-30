---
trigger: manual
---

### RF-15: Reasignación de reservas en caso de mantenimiento o eventos imprevistos, considerando dependencias funcionales

---

## HU-15: Reasignación de Reservas en Caso de Mantenimiento o Eventos Imprevistos

**Historia de Usuario**  
Como Administrador, quiero reasignar reservas automáticamente o de forma manual cuando un recurso se vuelva inactivo por mantenimiento o eventos imprevistos para minimizar la interrupción del servicio y asegurar que los usuarios afectados obtengan una alternativa o sean notificados para tomar una decisión.

### Criterios de Aceptación Generales

- Cuando un recurso se vuelve inactivo (por mantenimiento, falla técnica o evento imprevisto), el sistema debe identificar todas las reservas afectadas y cambiar su estado a "Pendiente de Reasignación".
- Si hay recursos alternativos disponibles, el sistema debe intentar reasignar automáticamente la reserva y notificar al usuario afectado.
- En caso de que la reasignación automática no sea posible o el usuario rechace la opción, el sistema debe permitir la intervención manual por parte del administrador.
- Las notificaciones automáticas y manuales deben incluir un tiempo límite configurable para que el usuario confirme la nueva asignación.
- Todas las acciones (automáticas y manuales) deben quedar registradas en el historial de auditoría, indicando usuario, fecha, recurso asignado y acción realizada.
- La funcionalidad debe integrarse con el módulo de reservas y con la gestión de disponibilidad en tiempo real.

---

## SubHU-15.1: Reasignación Automática de Reservas

**Historia de Usuario**  
Como Administrador, quiero que el sistema reasigne automáticamente las reservas afectadas cuando un recurso se vuelva inactivo por mantenimiento o eventos imprevistos para reducir el tiempo de inactividad y optimizar la utilización de recursos sin intervención manual inmediata.

### Criterios de Aceptación

- El sistema detecta automáticamente el cambio de estado del recurso a "No disponible" (por mantenimiento o imprevistos).
- Las reservas asociadas se actualizan a un estado "Pendiente de Reasignación" y se dispara el proceso de búsqueda de recursos alternativos equivalentes.
- Si se encuentra un recurso alternativo disponible, el sistema reasigna la reserva y notifica al usuario.
- Si se produce algún conflicto durante la reasignación (por ejemplo, disponibilidad simultánea), el sistema notifica al usuario para que elija entre opciones alternativas o active el flujo manual.
- Todas las acciones y resultados deben registrarse en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Detección Automática del Cambio de Estado del Recurso**
- Subtarea 1.1: Implementar lógica en el servicio de reservas para detectar cuando un recurso cambia su estado a “No disponible”.
- Subtarea 1.2: Integrar esta lógica con el módulo de mantenimiento o de eventos imprevistos.
- Subtarea 1.3: Desarrollar pruebas unitarias para verificar la detección correcta.

**Tarea 2: Desarrollo del Algoritmo de Reasignación Automática**
- Subtarea 2.1: Definir el algoritmo para seleccionar recursos alternativos equivalentes.
- Subtarea 2.2: Implementar la lógica en el servicio de reservas para actualizar automáticamente el estado de la reserva a “Pendiente de Reasignación” y reasignar si es posible.
- Subtarea 2.3: Validar la disponibilidad del recurso alternativo antes de confirmar la reasignación.
- Subtarea 2.4: Notificar al usuario afectado con los detalles de la reasignación y el tiempo límite para confirmar.
- Subtarea 2.5: Escribir pruebas unitarias e integración (BDD con Jasmine, Given-When-Then).

**Tarea 3: Registro de Auditoría y Manejo de Excepciones**
- Subtarea 3.1: Configurar logging (usando Winston) para registrar cada acción automática de reasignación.
- Subtarea 3.2: Implementar manejo de excepciones para capturar errores en el proceso y notificar al administrador.

**Tarea 4: Documentación y Validación**
- Subtarea 4.1: Documentar el proceso de detección y reasignación automática en la guía del usuario.
- Subtarea 4.2: Integrar el módulo en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).

---

## SubHU-15.2: Reasignación Manual y Confirmación por Usuario

**Historia de Usuario**  
Como Administrador, quiero poder intervenir manualmente en la reasignación de reservas afectadas y permitir que los usuarios confirmen o rechacen la nueva asignación para gestionar casos excepcionales donde la reasignación automática no sea viable o requiera ajustes personalizados.

### Criterios de Aceptación

- Si la reasignación automática falla o el usuario rechaza la opción automática, el sistema debe permitir la reasignación manual.
- El administrador debe disponer de una interfaz que muestre todas las reservas afectadas y recursos alternativos disponibles.
- El sistema debe enviar notificaciones al usuario con la opción de confirmar o rechazar la nueva asignación.
- Si el usuario confirma, la reserva se actualiza; si rechaza, se notifica la cancelación o se deriva a la lista de espera.
- Todas las acciones realizadas manualmente deben registrarse en el historial de auditoría.
- La funcionalidad debe incluir validaciones para garantizar que el recurso alternativo esté realmente disponible.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Reasignación Manual**
- Subtarea 1.1: Crear wireframes y mockups de la pantalla de reasignación manual para administradores.
- Subtarea 1.2: Definir la presentación de los recursos alternativos disponibles y el estado de cada reserva afectada.
- Subtarea 1.3: Validar el diseño con stakeholders y ajustar según requerimientos.

**Tarea 2: Desarrollo del Endpoint para Reasignación Manual**
- Subtarea 2.1: Definir el DTO para la actualización manual de reservas.
- Subtarea 2.2: Implementar la lógica en el servicio de reservas para actualizar la reserva con el recurso alternativo seleccionado.
- Subtarea 2.3: Integrar validaciones que aseguren que el recurso alternativo esté disponible.
- Subtarea 2.4: Actualizar el estado de la reserva y registrar la acción.

**Tarea 3: Desarrollo de la Lógica de Notificación y Confirmación**
- Subtarea 3.1: Implementar la lógica para enviar notificaciones al usuario con la opción de confirmar o rechazar la reasignación manual.
- Subtarea 3.2: Desarrollar el flujo de confirmación: si el usuario confirma, actualizar la reserva; si rechaza, derivar a cancelación o a la lista de espera.
- Subtarea 3.3: Registrar cada acción en el historial de auditoría.

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Desarrollar pruebas unitarias e integración con Jasmine utilizando escenarios Given-When-Then.
- Subtarea 4.2: Documentar el proceso de reasignación manual y el flujo de confirmación de usuario.
- Subtarea 4.3: Integrar la funcionalidad en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).
