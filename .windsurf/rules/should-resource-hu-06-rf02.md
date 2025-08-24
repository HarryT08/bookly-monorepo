---
trigger: manual
---

### SHOULD - Módulo de Gestión de Recursos

#### RF-02: Asociar cada recurso a una categoría y a uno o más programas académicos, lo que permite clasificar y filtrar la información de manera efectiva

---

### HU-06: Asociar Recurso a Categoría y Programa Académico

**Historia de Usuario**  
Como Administrador, quiero asociar cada recurso a una categoría y a uno o más programas académicos para que la información se organice adecuadamente, facilitando la búsqueda, filtrado y reserva según las necesidades académicas y administrativas.

**Criterios de Aceptación**

- El sistema debe disponer de una lista de categorías predefinidas (por ejemplo, Salón, Laboratorio, Auditorio, Equipo, etc.) que pueda ser configurada.
- Se debe permitir asignar a cada recurso uno o varios programas académicos.
- En el formulario de creación y edición de recursos, el usuario debe poder seleccionar al menos una categoría y un programa académico.
- Si se intenta guardar un recurso sin al menos una categoría y un programa asignados, el sistema mostrará un error claro.
- Cualquier cambio en la asociación (asignación o actualización) deberá registrarse en el historial de auditoría, indicando quién realizó el cambio y en qué momento.
- La vista de detalles del recurso debe mostrar claramente la categoría y los programas académicos asociados.

---

### SubHU-06.1: Asignación de Categoría al Recurso

**Historia de Usuario**  
Como Administrador, quiero asignar una categoría a cada recurso para clasificar y organizar los espacios de manera coherente y facilitar su búsqueda y filtrado.

**Criterios de Aceptación**

- Debe existir un listado de categorías configurables que se muestren en un componente select (desplegable o tags).
- El sistema obligará a seleccionar al menos una categoría al crear o editar un recurso.
- La categoría asignada se mostrará en la vista de detalles del recurso.
- Cualquier modificación en la categoría deberá registrarse en el historial de auditoría.

**Tareas y Subtareas**

- **Tarea 1: Diseño de la Interfaz de Selección de Categoría**
  - Subtarea 1.1: Crear wireframes y mockups del formulario de recurso que incluya la selección de categoría.
  - Subtarea 1.2: Validar el diseño con stakeholders y ajustar según feedback.

- **Tarea 2: Desarrollo del Endpoint para Asignación de Categoría**
  - Subtarea 2.1: Definir el DTO para la asociación de categoría.
  - Subtarea 2.2: Implementar la lógica en el servicio de recursos para guardar la categoría seleccionada.
  - Subtarea 2.3: Validar en el backend que al menos se seleccione una categoría.
  - Subtarea 2.4: Desarrollar pruebas unitarias para el endpoint.

- **Tarea 3: Integración con Base de Datos y Registro de Auditoría**
  - Subtarea 3.1: Actualizar el modelo de datos para incluir la relación entre recursos y categorías.
  - Subtarea 3.2: Realizar la migración usando Prisma.
  - Subtarea 3.3: Configurar el logging para registrar la acción (usuario, fecha, categoría asignada).

- **Tarea 4: Pruebas de Aceptación y Documentación**
  - Subtarea 4.1: Escribir escenarios BDD (Given-When-Then) en Jasmine para la asignación de categoría.
  - Subtarea 4.2: Documentar la funcionalidad en la guía del usuario y la documentación técnica.
  - Subtarea 4.3: Integrar el flujo en el pipeline de CI/CD.

---

### SubHU-06.2: Asignación de Programa Académico al Recurso

**Historia de Usuario**  
Como Administrador, quiero asignar uno o más programas académicos a cada recurso para que se pueda filtrar y gestionar el acceso a los espacios según las necesidades institucionales.

**Criterios de Aceptación**

- El formulario de creación/edición debe incluir un componente que permita la selección múltiple de programas académicos.
- Se debe validar que al menos se asigne un programa académico al recurso.
- La información de los programas asignados se mostrará en la vista de detalles del recurso.
- Las modificaciones en la asociación de programas deben registrarse en el historial de auditoría.

**Tareas y Subtareas**

- **Tarea 1: Diseño de la Interfaz para Selección de Programas Académicos**
  - Subtarea 1.1: Crear mockups y wireframes del componente de selección múltiple de programas académicos.
  - Subtarea 1.2: Validar el diseño con stakeholders y ajustar según requerimientos.

- **Tarea 2: Desarrollo del Endpoint para Asociación de Programas Académicos**
  - Subtarea 2.1: Definir el DTO para la asociación de programas académicos.
  - Subtarea 2.2: Implementar la lógica en el servicio de recursos para almacenar la asociación.
  - Subtarea 2.3: Incluir validaciones que obliguen a seleccionar al menos un programa.
  - Subtarea 2.4: Crear pruebas unitarias que verifiquen la correcta asociación.

- **Tarea 3: Integración y Actualización de Modelo de Datos**
  - Subtarea 3.1: Modificar el modelo de datos para representar la relación de uno a muchos (o muchos a muchos) entre recursos y programas académicos.
  - Subtarea 3.2: Ejecutar migraciones con Prisma.
  - Subtarea 3.3: Implementar el registro de auditoría para cambios en la asociación.

- **Tarea 4: Pruebas de Aceptación y Documentación**
  - Subtarea 4.1: Desarrollar escenarios BDD (Given-When-Then) para el flujo de asociación de programas.
  - Subtarea 4.2: Documentar el proceso y actualizar las guías de usuario y técnica.
  - Subtarea 4.3: Integrar la funcionalidad en el pipeline de CI/CD.
