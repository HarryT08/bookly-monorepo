---
trigger: manual
---

### COULD - Módulo de Gestión de Recursos

#### RF-06: Módulo de mantenimiento de recursos (registro de daños, mantenimientos programados y reportes de incidentes), que aporta valor adicional pero puede implementarse en una fase posterior.

---

### HU-08: Gestión de Mantenimiento de Recursos

**Historia de Usuario**  
Como Administrador, quiero gestionar el mantenimiento de los recursos para garantizar su disponibilidad y correcto funcionamiento, minimizando el impacto de fallas en la operación académica.

**Criterios de Aceptación Generales**

- El sistema debe permitir registrar, visualizar y gestionar mantenimientos preventivos y correctivos de los recursos.
- Se debe registrar el estado del recurso antes y después del mantenimiento.
- Debe existir una integración con la disponibilidad de reservas para bloquear el uso de un recurso en mantenimiento.
- Todos los mantenimientos registrados deben quedar almacenados con trazabilidad y auditoría.
- Se debe notificar a los usuarios afectados en caso de que un mantenimiento interfiera con sus reservas.

---

### SubHU-08.1: Registro de Daños e Incidentes

**Historia de Usuario**  
Como Usuario o Administrador, quiero reportar daños o incidentes en los recursos para que se puedan programar mantenimientos y evitar su uso en condiciones inadecuadas.

**Criterios de Aceptación**

- Los usuarios deben poder registrar un daño o incidente asociado a un recurso.
- El formulario de reporte debe incluir:
  - Descripción del problema.
  - Nivel de criticidad (baja, media, alta).
  - Evidencias (opcional, imágenes/documentos).
- El sistema debe permitir a los administradores visualizar y gestionar los reportes.
- En caso de daños graves, el sistema debe deshabilitar automáticamente el recurso y notificar al equipo de mantenimiento.

**Tareas y Subtareas**

- **Tarea 1: Diseño de la Interfaz de Reporte de Daños**
  - Subtarea 1.1: Crear wireframes y mockups del formulario de reporte.
  - Subtarea 1.2: Validar la interfaz con stakeholders.

- **Tarea 2: Desarrollo del Módulo de Reporte en NestJS**
  - Subtarea 2.1: Definir el DTO y modelo de datos para reportes de daños.
  - Subtarea 2.2: Implementar API para el registro de reportes.
  - Subtarea 2.3: Integrar validaciones en el backend (por ejemplo, nivel de criticidad requerido).
  - Subtarea 2.4: Almacenar reportes en MongoDB usando Prisma.

- **Tarea 3: Registro de Auditoría y Notificaciones**
  - Subtarea 3.1: Implementar el registro de auditoría para cada reporte.
  - Subtarea 3.2: Configurar notificaciones automáticas para el equipo de mantenimiento cuando un reporte sea crítico.

- **Tarea 4: Pruebas y Documentación**
  - Subtarea 4.1: Escribir pruebas unitarias e integración con Jasmine y escenarios Given-When-Then.
  - Subtarea 4.2: Documentar el proceso de reporte de daños.
  - Subtarea 4.3: Incluir el módulo en CI/CD.

---

### SubHU-08.2: Programación de Mantenimientos Preventivos

**Historia de Usuario**  
Como Administrador o Técnico de Mantenimiento, quiero programar mantenimientos preventivos en los recursos para minimizar la probabilidad de fallas y garantizar su óptimo funcionamiento.

**Criterios de Aceptación**

- El sistema debe permitir programar mantenimientos preventivos de forma periódica o específica.
- Se deben definir parámetros como:
  - Fecha y hora del mantenimiento.
  - Tipo de mantenimiento (limpieza, revisión técnica, actualización de software, etc.).
  - Técnico asignado.
- Se debe bloquear la disponibilidad del recurso durante el período de mantenimiento.
- Se debe notificar a los usuarios con reservas afectadas.

**Tareas y Subtareas**

- **Tarea 1: Diseño de la Interfaz de Programación de Mantenimientos**
  - Subtarea 1.1: Crear wireframes y mockups del módulo de mantenimiento preventivo.
  - Subtarea 1.2: Validar el diseño con el equipo de mantenimiento.

- **Tarea 2: Desarrollo del Módulo de Programación en NestJS**
  - Subtarea 2.1: Definir DTO y modelo de datos para los mantenimientos preventivos.
  - Subtarea 2.2: Implementar API para crear, actualizar y eliminar mantenimientos preventivos.
  - Subtarea 2.3: Integrar con la disponibilidad del recurso para bloquear reservas.

- **Tarea 3: Notificación y Registro de Auditoría**
  - Subtarea 3.1: Implementar notificaciones automáticas para los usuarios afectados.
  - Subtarea 3.2: Registrar en la auditoría cada acción sobre mantenimientos programados.

- **Tarea 4: Pruebas y Documentación**
  - Subtarea 4.1: Desarrollar pruebas unitarias y de integración con Jasmine.
  - Subtarea 4.2: Documentar la configuración de mantenimientos preventivos.

---

### SubHU-08.3: Registro y Seguimiento de Mantenimientos Correctivos

**Historia de Usuario**  
Como Administrador o Técnico de Mantenimiento, quiero registrar y dar seguimiento a los mantenimientos correctivos para asegurar que los recursos dañados sean reparados y vuelvan a estar disponibles.

**Criterios de Aceptación**

- Se debe permitir registrar mantenimientos correctivos indicando:
  - Recurso afectado.
  - Motivo del mantenimiento.
  - Acciones realizadas.
  - Fecha y duración del mantenimiento.
  - Técnico responsable.
- Los mantenimientos correctivos deben actualizar el estado del recurso (por ejemplo, de “en mantenimiento” a “operativo”).
- Los administradores deben poder consultar el historial de mantenimientos correctivos de cada recurso.

**Tareas y Subtareas**

- **Tarea 1: Diseño de la Interfaz de Registro de Mantenimientos Correctivos**
  - Subtarea 1.1: Crear mockups para el registro y visualización de mantenimientos correctivos.
  - Subtarea 1.2: Validar con el equipo de mantenimiento.

- **Tarea 2: Desarrollo del Módulo de Mantenimientos Correctivos en NestJS**
  - Subtarea 2.1: Definir DTO y modelo de datos para registros de mantenimiento.
  - Subtarea 2.2: Implementar API para registrar, actualizar y consultar mantenimientos correctivos.
  - Subtarea 2.3: Integrar cambios de estado del recurso en la base de datos.

- **Tarea 3: Notificación y Registro de Auditoría**
  - Subtarea 3.1: Implementar notificaciones automáticas cuando un recurso vuelve a estar operativo.
  - Subtarea 3.2: Registrar en auditoría las acciones realizadas en cada mantenimiento.

- **Tarea 4: Pruebas y Documentación**
  - Subtarea 4.1: Desarrollar pruebas unitarias y de integración con Jasmine.
  - Subtarea 4.2: Documentar el flujo de registro de mantenimiento correctivo.
