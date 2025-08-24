---
trigger: manual
---

#### RF-07: Definir horarios disponibles y validar la disponibilidad en tiempo real, garantizando que no se generen conflictos en las reservas

---

### HU-09: Configurar Horarios Disponibles para Recursos

**Historia de Usuario**  
Como Administrador, quiero definir los horarios disponibles para cada recurso con restricciones institucionales para asegurar que las reservas se realicen únicamente en periodos autorizados, evitando conflictos y garantizando el cumplimiento de las normativas institucionales.

**Criterios de Aceptación**

- El sistema debe permitir configurar franjas horarias de disponibilidad para cada recurso (por ejemplo, de 8:00 a 18:00).
- Se deben poder definir restricciones adicionales, como días no operativos, períodos bloqueados por eventos o mantenimientos, y excepciones especiales.
- La configuración debe validar que no existan solapamientos entre franjas horarias ni conflictos con restricciones predefinidas.
- Los cambios en la configuración se deben registrar en el historial de auditoría (usuario, fecha, modificaciones realizadas).
- La vista de disponibilidad de cada recurso debe reflejar claramente las franjas autorizadas y bloqueadas.
- La integración con el proceso de reserva debe impedir que se realicen reservas fuera de los horarios configurados.

---

### SubHU-09.1: Configurar Franjas Horarias Básicas

**Historia de Usuario**  
Como Administrador, quiero configurar las franjas horarias básicas de disponibilidad para cada recurso para que se establezcan los períodos en los que éstos pueden ser reservados de forma normal.

**Criterios de Aceptación**

- El formulario de configuración debe permitir ingresar la hora de inicio y fin de la disponibilidad (por ejemplo, de 8:00 a 18:00).
- Se debe validar que la hora de inicio sea anterior a la hora de fin.
- Los datos ingresados deben visualizarse en la vista de detalles del recurso.
- Cualquier modificación se debe registrar en el historial de auditoría.

**Tareas y Subtareas**

- **Tarea 1: Diseño de la Interfaz de Configuración de Franjas Horarias**
  - Subtarea 1.1: Crear wireframes y mockups del formulario para definir las franjas horarias.
  - Subtarea 1.2: Validar el diseño con stakeholders y ajustar según retroalimentación.

- **Tarea 2: Desarrollo del Endpoint para Configuración de Horarios en NestJS**
  - Subtarea 2.1: Definir el DTO para la configuración de horarios (hora de inicio y fin).
  - Subtarea 2.2: Implementar la lógica en el servicio para almacenar y actualizar las franjas horarias.
  - Subtarea 2.3: Integrar validaciones que aseguren que la hora de inicio sea anterior a la de fin.
  - Subtarea 2.4: Conectar el endpoint con la base de datos mediante Prisma y MongoDB.

- **Tarea 3: Registro de Auditoría y Manejo de Excepciones**
  - Subtarea 3.1: Configurar el log (por ejemplo, con Winston) para registrar cada acción sobre la configuración horaria.
  - Subtarea 3.2: Implementar manejo de errores que notifique al usuario si se ingresan datos inválidos.

- **Tarea 4: Pruebas y Documentación**
  - Subtarea 4.1: Desarrollar pruebas unitarias e integración con Jasmine utilizando escenarios Given-When-Then.
  - Subtarea 4.2: Documentar la funcionalidad en la guía del usuario y actualizar la documentación técnica.
  - Subtarea 4.3: Integrar el módulo en el pipeline de CI/CD (GitHub Actions, SonarQube).

---

### SubHU-09.2: Configurar Restricciones Institucionales y Bloqueos

**Historia de Usuario**  
Como Administrador, quiero configurar restricciones institucionales y bloquear ciertos períodos para que se impida la reserva de recursos durante días no operativos, eventos especiales o mantenimientos, garantizando el cumplimiento de las políticas institucionales.

**Criterios de Aceptación**

- El sistema debe permitir definir períodos bloqueados especificando fecha, hora de inicio y fin.
- Se debe validar que los períodos bloqueados no se superpongan con las franjas horarias definidas.
- La interfaz debe mostrar visualmente (por ejemplo, en un calendario o lista) los períodos bloqueados asociados a cada recurso.
- Durante la reserva, el sistema debe rechazar solicitudes que coincidan con períodos bloqueados.
- Los cambios en las restricciones deben registrarse en el historial de auditoría.

**Tareas y Subtareas**

- **Tarea 1: Diseño de la Interfaz para Restricciones y Bloqueos**
  - Subtarea 1.1: Crear prototipos (wireframes/mockups) de la pantalla para definir y visualizar períodos bloqueados.
  - Subtarea 1.2: Recoger feedback de usuarios clave (administradores y responsables de reservas).

- **Tarea 2: Desarrollo del Módulo de Restricciones en NestJS**
  - Subtarea 2.1: Definir el DTO y modelo de datos para los períodos bloqueados (fecha, hora de inicio y fin).
  - Subtarea 2.2: Implementar la lógica en el servicio para agregar, editar y eliminar períodos bloqueados.
  - Subtarea 2.3: Desarrollar validaciones para evitar solapamientos con las franjas horarias básicas y otros períodos bloqueados.

- **Tarea 3: Integración con el Proceso de Reserva**
  - Subtarea 3.1: Modificar la lógica de validación de reservas para comprobar que la solicitud no se realice en períodos bloqueados.
  - Subtarea 3.2: Desarrollar pruebas de integración que simulen reservas durante períodos bloqueados y verifiquen el rechazo adecuado.

- **Tarea 4: Registro de Auditoría y Notificaciones**
  - Subtarea 4.1: Implementar el registro en el historial de auditoría para cada acción de configuración de restricciones.
  - Subtarea 4.2: Configurar notificaciones automáticas para informar a los administradores de cambios críticos en los períodos bloqueados.

- **Tarea 5: Pruebas y Documentación**
  - Subtarea 5.1: Escribir pruebas unitarias y de integración (usando Jasmine y escenarios BDD).
  - Subtarea 5.2: Documentar la funcionalidad y actualizar la guía del usuario.
  - Subtarea 5.3: Integrar esta funcionalidad en el pipeline de CI/CD.
