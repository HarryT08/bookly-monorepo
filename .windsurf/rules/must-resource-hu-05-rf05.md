---
trigger: manual
---

### RF-05: Configuración de reglas de disponibilidad esenciales para evitar conflictos en la asignación de recursos

#### HU-05: Configuración de Reglas de Disponibilidad

**Historia de Usuario**  
Como Administrador, quiero configurar las reglas de disponibilidad para los recursos para garantizar que las reservas se ajusten a las normativas institucionales y optimicen el uso de los espacios, evitando conflictos y garantizando períodos de preparación adecuados.

---

##### SubHU-05.1: Configurar Tiempos de Reserva

**Historia de Usuario**  
Como Administrador, quiero definir los tiempos mínimos y máximos de reserva, así como los intervalos de preparación entre reservas para asegurar que cada espacio tenga el tiempo suficiente para ser preparado y evitar reservas de corta duración que puedan afectar la operatividad.

**Criterios de Aceptación**

- Se debe permitir ingresar un tiempo mínimo de reserva (por ejemplo, 30 minutos) y un tiempo máximo (por ejemplo, 4 horas).
- Se debe poder configurar un intervalo obligatorio entre reservas (por ejemplo, 15 minutos) para tareas de preparación.
- Los valores ingresados deben validarse:
  - El tiempo mínimo debe ser menor que el máximo.
  - Los intervalos deben ser números positivos.
- La configuración se mostrará en la vista de detalles del recurso y cualquier modificación se registrará en el historial de auditoría.

**Tareas y Subtareas**

- **Tarea 1: Diseño de la Interfaz para Tiempos de Reserva**
  - Subtarea 1.1: Crear wireframes y mockups del formulario de configuración de tiempos (mínimo, máximo y preparación).
  - Subtarea 1.2: Validar el diseño con stakeholders y ajustar según feedback.
- **Tarea 2: Desarrollo del Endpoint en NestJS**
  - Subtarea 2.1: Definir el DTO para la configuración de tiempos de reserva.
  - Subtarea 2.2: Implementar la lógica en el servicio de recursos para guardar y actualizar estos valores.
  - Subtarea 2.3: Realizar las validaciones: verificar que el tiempo mínimo < tiempo máximo y que los intervalos sean válidos.
  - Subtarea 2.4: Integrar con la base de datos utilizando Prisma y MongoDB.
- **Tarea 3: Registro de Auditoría y Manejo de Excepciones**
  - Subtarea 3.1: Configurar el registro de cambios (quién, cuándo, qué se modificó) usando un sistema de logging (p. ej., Winston).
  - Subtarea 3.2: Implementar manejo de errores para notificar al usuario si se ingresan datos inválidos.
- **Tarea 4: Pruebas y Documentación**
  - Subtarea 4.1: Escribir pruebas unitarias e integración (usando Jasmine y escenarios BDD Given-When-Then) para el flujo de configuración.
  - Subtarea 4.2: Documentar la funcionalidad y actualizar la guía del usuario.

---

##### SubHU-05.2: Configurar Períodos Bloqueados

**Historia de Usuario**  
Como Administrador, quiero configurar períodos bloqueados para cada recurso para evitar reservas durante tiempos no operativos (por ejemplo, mantenimiento, eventos institucionales o días festivos) y garantizar la integridad de la agenda.

**Criterios de Aceptación**

- Se debe permitir ingresar uno o más períodos bloqueados con fecha, hora de inicio y fin.
- No se deben permitir superposiciones entre períodos bloqueados o con horarios de reserva previamente definidos.
- La interfaz debe mostrar claramente los períodos bloqueados en un calendario o lista.
- Los cambios en los períodos bloqueados deben registrarse en el historial de auditoría.
- En el proceso de reserva, el sistema debe rechazar automáticamente reservas que coincidan con estos períodos.

**Tareas y Subtareas**

- **Tarea 1: Diseño de la Interfaz para Períodos Bloqueados**
  - Subtarea 1.1: Crear prototipos de la pantalla donde se visualizarán y configurarán los períodos bloqueados.
  - Subtarea 1.2: Validar el diseño con el equipo de administración y usuarios clave.

- **Tarea 2: Desarrollo del Módulo de Períodos Bloqueados en NestJS**
  - Subtarea 2.1: Definir el DTO y modelo de datos para un período bloqueado.
  - Subtarea 2.2: Implementar la lógica para agregar, editar y eliminar períodos bloqueados.
  - Subtarea 2.3: Desarrollar validaciones que eviten la superposición de períodos bloqueados y su conflicto con horarios de reserva.

- **Tarea 3: Integración y Pruebas de Validación en Reserva**
  - Subtarea 3.1: Integrar el módulo de períodos bloqueados con el servicio de validación de reservas.
  - Subtarea 3.2: Escribir pruebas unitarias y de integración (usando Jasmine) que simulen reservas en períodos bloqueados y verifiquen el rechazo correcto.

- **Tarea 4: Documentación y Registro de Auditoría**
  - Subtarea 4.1: Documentar la funcionalidad y su integración en el sistema.
  - Subtarea 4.2: Configurar el registro de auditoría para cada acción relacionada con la gestión de períodos bloqueados.

---

##### SubHU-05.3: Configurar Prioridades de Uso

**Historia de Usuario**  
Como Administrador, quiero configurar reglas de prioridad de uso para los recursos para asignar preferencia en las reservas a ciertos perfiles (por ejemplo, docentes o administrativos) y gestionar la asignación en situaciones de alta demanda.

**Criterios de Aceptación**

- Se debe permitir definir niveles de prioridad (ej.: alta, media, baja) para diferentes tipos de usuarios o solicitudes.
- La interfaz debe ofrecer una opción para asignar prioridades de uso al configurar o editar un recurso.
- Durante la validación de una reserva, el sistema debe tener en cuenta la prioridad configurada para sugerir alternativas o gestionar listas de espera.
- Las configuraciones de prioridad deben poder modificarse y quedar registradas en el historial de auditoría.
- La configuración debe integrarse con el mecanismo de notificación, informando a los usuarios de cualquier ajuste de prioridad.

**Tareas y Subtareas**

- **Tarea 1: Diseño de la Interfaz para Prioridades de Uso**
  - Subtarea 1.1: Diseñar mockups del formulario de asignación de prioridad al recurso.
  - Subtarea 1.2: Recoger feedback de los stakeholders sobre los niveles de prioridad requeridos.

- **Tarea 2: Desarrollo del Endpoint para Configuración de Prioridades en NestJS**
  - Subtarea 2.1: Definir el DTO y modelo de datos para las reglas de prioridad.
  - Subtarea 2.2: Implementar la lógica en el servicio para asignar, editar y eliminar prioridades.
  - Subtarea 2.3: Integrar la funcionalidad con el sistema de reservas para que se valide la prioridad durante la asignación.

- **Tarea 3: Integración y Pruebas de Validación de Prioridades**
  - Subtarea 3.1: Desarrollar pruebas unitarias y de integración (usando Jasmine y el patrón BDD) para verificar el correcto funcionamiento de las reglas de prioridad en diferentes escenarios de reserva.
  - Subtarea 3.2: Validar que los cambios en las prioridades se reflejen correctamente en la lógica de asignación de reservas.

- **Tarea 4: Documentación y Registro de Auditoría**
  - Subtarea 4.1: Documentar la configuración de prioridades, incluyendo ejemplos de asignación.
  - Subtarea 4.2: Asegurar que cada modificación en las reglas de prioridad quede registrada en el historial de auditoría.