---
trigger: manual
---

### RF-03: Definir atributos clave (nombre, descripción, ubicación, capacidad, horarios de disponibilidad y reglas de uso) para garantizar la integridad de la información

#### HU-04: Definir Atributos Clave del Recurso

**Historia de Usuario**  
Como Administrador, quiero definir los atributos clave de cada recurso (nombre, descripción, ubicación, capacidad, horarios de disponibilidad y reglas de uso) para que la información de los recursos sea completa, consistente y facilite la gestión y reserva de espacios.

---

##### SubHU-04.1: Definir Atributos Básicos

**Historia de Usuario**  
Como Administrador, quiero definir los atributos básicos (nombre, descripción, ubicación y capacidad) de cada recurso para que éste se identifique de manera clara y se garantice la integridad de la información.

**Criterios de Aceptación**

- Los campos de nombre, descripción, ubicación y capacidad son obligatorios.
- La capacidad debe validarse para que sea un número entero mayor que 0.
- Los datos ingresados deben visualizarse correctamente en la consulta de recursos.
- Toda creación o modificación de estos atributos debe registrarse en el historial de auditoría.

**Tareas y Subtareas**

- **Tarea 1: Diseño de la Interfaz de Atributos Básicos**
  - Subtarea 1.1: Crear wireframes/mockups del formulario para ingresar y editar atributos básicos.
  - Subtarea 1.2: Validar el diseño con stakeholders y obtener feedback.
- **Tarea 2: Desarrollo del Endpoint de Atributos Básicos en NestJS**
  - Subtarea 2.1: Definir el DTO (Data Transfer Object) para la creación/actualización de atributos básicos.
  - Subtarea 2.2: Implementar la lógica en el servicio que gestione la creación y actualización, incluyendo validaciones (por ejemplo, capacidad > 0).
  - Subtarea 2.3: Integrar el endpoint con la base de datos usando Prisma y MongoDB.
- **Tarea 3: Implementación de Validaciones y Registro de Auditoría**
  - Subtarea 3.1: Desarrollar validaciones en el backend y, de ser posible, en el frontend para garantizar que los campos obligatorios estén completos.
  - Subtarea 3.2: Configurar el registro de auditoría (usando Winston u otra herramienta) para almacenar información sobre quién creó o editó el recurso y cuándo.
- **Tarea 4: Pruebas y Documentación**
  - Subtarea 4.1: Escribir pruebas unitarias y de integración en Jasmine, aplicando escenarios Given-When-Then (BDD) para el flujo de creación/edición.
  - Subtarea 4.2: Documentar la funcionalidad y actualizar la guía del usuario.

---

##### SubHU-04.2: Configurar Horarios de Disponibilidad

**Historia de Usuario**  
Como Administrador, quiero configurar los horarios de disponibilidad de cada recurso para asegurar que solo se puedan reservar en períodos válidos y evitar conflictos de agenda.

**Criterios de Aceptación**

- Se debe permitir definir rangos horarios de disponibilidad para cada recurso.
- No deben permitirse solapamientos entre los horarios ingresados ni conflictos con períodos bloqueados.
- La interfaz debe mostrar una vista clara (por ejemplo, un calendario o lista) de los horarios configurados.
- Los cambios en la configuración de horarios deben registrarse en el historial de auditoría.
- (Opcional) Integración con un sistema de calendario para validar disponibilidad en tiempo real.

**Tareas y Subtareas**

- **Tarea 1: Diseño de la Interfaz de Horarios**
  - Subtarea 1.1: Crear mockups de la pantalla para la configuración de horarios de disponibilidad.
  - Subtarea 1.2: Recoger y validar requerimientos de visualización con stakeholders.
- **Tarea 2: Desarrollo del Módulo de Gestión de Horarios en NestJS**
  - Subtarea 2.1: Definir el DTO para la gestión de horarios (incluyendo fecha, hora de inicio y fin).
  - Subtarea 2.2: Implementar la lógica en el servicio para agregar, editar y eliminar rangos de horarios.
  - Subtarea 2.3: Implementar validaciones para evitar solapamientos y garantizar el cumplimiento de periodos bloqueados.
- **Tarea 3: Integración y Validación en Tiempo Real**
  - Subtarea 3.1: (Opcional) Integrar con APIs de calendario para sincronizar reservas y validar disponibilidad.
  - Subtarea 3.2: Desarrollar pruebas de integración que verifiquen la correcta validación de horarios.
- **Tarea 4: Pruebas y Documentación**
  - Subtarea 4.1: Escribir pruebas unitarias y escenarios BDD en Jasmine.
  - Subtarea 4.2: Documentar la configuración de horarios y actualizar la documentación técnica.

---

##### SubHU-04.3: Establecer Reglas de Uso

**Historia de Usuario**  
Como Administrador, quiero establecer reglas de uso para cada recurso para regular su utilización, asegurar el cumplimiento de políticas institucionales y evitar abusos en las reservas.

**Criterios de Aceptación**

- Se debe permitir definir reglas de uso, tales como tiempo mínimo y máximo de reserva, restricciones de uso y requisitos previos.
- La interfaz debe ser intuitiva para configurar y editar estas reglas.
- Las reglas definidas deben validarse para evitar conflictos con la disponibilidad y otros atributos del recurso.
- Toda modificación en las reglas debe registrarse en el historial de auditoría.
- La información de las reglas de uso debe mostrarse en la vista de detalles del recurso.

**Tareas y Subtareas**

- **Tarea 1: Diseño de la Interfaz para Reglas de Uso**
  - Subtarea 1.1: Crear wireframes/mockups para la configuración de reglas de uso.
  - Subtarea 1.2: Validar el diseño con usuarios clave (por ejemplo, administradores y responsables de reservas).
- **Tarea 2: Desarrollo del Endpoint para Reglas de Uso en NestJS**
  - Subtarea 2.1: Definir el DTO y el modelo de datos para las reglas de uso.
  - Subtarea 2.2: Implementar la lógica de negocio en el servicio para agregar, editar y eliminar reglas.
  - Subtarea 2.3: Integrar esta funcionalidad con la base de datos.
- **Tarea 3: Validación de Reglas y Manejo de Excepciones**
  - Subtarea 3.1: Desarrollar validaciones para asegurar que las reglas configuradas no entren en conflicto con otros parámetros (por ejemplo, horarios o capacidad).
  - Subtarea 3.2: Implementar manejo de errores y excepciones que notifiquen al usuario en caso de conflictos.
- **Tarea 4: Pruebas y Documentación**
  - Subtarea 4.1: Desarrollar pruebas unitarias y escenarios BDD en Jasmine para el módulo de reglas de uso.
  - Subtarea 4.2: Documentar la funcionalidad, incluyendo ejemplos de configuración de reglas y procedimientos de validación.
