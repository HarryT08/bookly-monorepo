---
trigger: manual
---

### SHOULD - Módulo de Aprobaciones y Gestión de Solicitudes

---

## RF-23: Pantalla de control para el personal de vigilancia, permitiendo un seguimiento en tiempo real de las reservas aprobadas

---

## HU-20: Pantalla de Control para el Personal de Vigilancia

**Historia de Usuario**  
Como Personal de Vigilancia, quiero visualizar en tiempo real una pantalla que muestre todas las reservas aprobadas (para el día y próximas jornadas) para gestionar y controlar el acceso a los recursos, asegurando que solo las personas autorizadas ingresen a los espacios asignados.

### Criterios de Aceptación

- La pantalla debe mostrar en tiempo real una lista de reservas aprobadas para el día y las próximas jornadas.
- Cada registro debe incluir:
  - Datos del solicitante (nombre, identificación, rol).
  - Detalles de la reserva (recurso, fecha, hora de inicio y fin, ubicación).
  - Estado de la reserva (confirmada, en uso, cancelada).
- Se debe incluir un buscador y filtros por fecha, recurso, ubicación y nombre/ID del solicitante.
- La pantalla debe permitir acciones para:
  - Marcar manualmente la entrada del usuario (cambio de estado a “En Uso”).
  - Registrar incidencias o irregularidades (con un campo de texto para comentarios).
  - Permitir ver una opción para búsqueda manual en caso de que el usuario no aparezca en la lista.
- Toda acción realizada (confirmación de entrada, registro de incidencia, búsqueda manual) debe quedar registrada en el historial de auditoría.
- La interfaz debe actualizarse automáticamente en tiempo real cuando se produzcan cambios en las reservas (nuevas aprobaciones, cancelaciones, modificaciones).
- La pantalla debe ser responsiva y usable en dispositivos móviles y de escritorio.

---

## SubHU-20.1: Visualización y Filtrado en Tiempo Real

**Historia de Usuario**  
Como Personal de Vigilancia, quiero visualizar y filtrar en tiempo real las reservas aprobadas para localizar rápidamente la información necesaria y gestionar el acceso de forma eficiente.

### Criterios de Aceptación

- La pantalla actualiza la lista de reservas aprobadas en tiempo real (con un tiempo de respuesta menor a 2 segundos).
- Se deben aplicar filtros por fecha, recurso, ubicación y nombre o identificación del solicitante.
- Los resultados muestran todos los datos relevantes (nombre, identificación, recurso, fecha, hora, ubicación, estado).
- La acción de filtrar debe quedar registrada en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Visualización**
- Subtarea 1.1: Crear wireframes y mockups de la pantalla de control con un listado de reservas, filtros y buscador.
- Subtarea 1.2: Validar el diseño con personal de vigilancia y ajustar según retroalimentación.

**Tarea 2: Desarrollo del Componente de Visualización (Frontend)**
- Subtarea 2.1: Implementar el componente utilizando una librería adecuada (por ejemplo, una tabla dinámica o grid).
- Subtarea 2.2: Integrar filtros y opciones de búsqueda.
- Subtarea 2.3: Configurar la actualización en tiempo real mediante WebSockets o polling.

**Tarea 3: Desarrollo del Endpoint de Consulta (Backend)**
- Subtarea 3.1: Definir el DTO para la consulta de reservas aprobadas.
- Subtarea 3.2: Implementar la lógica en el servicio para recuperar reservas y aplicar filtros.
- Subtarea 3.3: Asegurar el manejo de excepciones y validaciones de datos.

**Tarea 4: Registro de Auditoría y Pruebas**
- Subtarea 4.1: Configurar logging para registrar cada acción de filtrado y actualización.
- Subtarea 4.2: Desarrollar pruebas unitarias e integración con Jasmine (BDD: Given-When-Then).
- Subtarea 4.3: Documentar la funcionalidad y actualizar la guía del usuario.

---

## SubHU-20.2: Confirmación de Entrada y Registro de Incidencias

**Historia de Usuario**  
Como Personal de Vigilancia, quiero marcar la entrada de los usuarios y registrar incidencias directamente desde la pantalla de control para confirmar el acceso de manera ordenada y documentar cualquier irregularidad.

### Criterios de Aceptación

- La pantalla debe incluir opciones para marcar la entrada de un usuario (cambio de estado a “En Uso”) y para registrar incidencias.
- Al confirmar la entrada, el sistema debe actualizar el estado de la reserva y registrar la acción (usuario, fecha, hora) en el historial de auditoría.
- Se debe disponer de un formulario para ingresar incidencias, con un campo de texto para comentarios.
- Si el usuario no aparece en la lista, se debe permitir la validación manual mediante ingreso de identificación.
- La interfaz debe actualizarse en tiempo real tras cada acción.

### Tareas y Subtareas

**Tarea 1: Diseño del Flujo de Confirmación y Registro de Incidencias**
- Subtarea 1.1: Crear wireframes y mockups que ilustren el flujo para confirmar entrada y registrar incidencias.
- Subtarea 1.2: Validar el diseño con personal de vigilancia y ajustar según sus requerimientos.

**Tarea 2: Desarrollo del Componente de Confirmación en el Frontend**
- Subtarea 2.1: Implementar botones y formularios para marcar la entrada y registrar incidencias.
- Subtarea 2.2: Integrar la función de validación manual para buscar usuario por identificación.
- Subtarea 2.3: Asegurar que la pantalla se actualice en tiempo real con cada acción.

**Tarea 3: Desarrollo del Endpoint de Actualización de Estado y Registro de Incidencias (Backend)**
- Subtarea 3.1: Definir el DTO para actualizar el estado de la reserva y registrar una incidencia.
- Subtarea 3.2: Implementar la lógica en el servicio para actualizar el estado a “En Uso” y almacenar la incidencia.
- Subtarea 3.3: Integrar validaciones y manejo de excepciones para evitar inconsistencias.
- Subtarea 3.4: Registrar la acción en el historial de auditoría.

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Desarrollar pruebas unitarias e integración (usando Jasmine y escenarios BDD).
- Subtarea 4.2: Documentar el flujo completo en la guía del usuario y actualizar la documentación técnica.
- Subtarea 4.3: Integrar la funcionalidad en el pipeline de CI/CD.
