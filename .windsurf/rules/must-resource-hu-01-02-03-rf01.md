---
trigger: manual
---

### RF-01: Crear, editar y eliminar recursos

#### HU-01: Crear Recurso

**Historia de Usuario**  
Como Administrador, quiero crear un recurso para que la información de los espacios (salones, auditorios, equipos, laboratorios, etc.) esté actualizada y se puedan gestionar las reservas de manera precisa.

**Criterios de Aceptación**

- El formulario de creación debe permitir ingresar datos obligatorios: nombre, tipo, ubicación, capacidad, disponibilidad y, de ser necesario, reglas de uso.
- Se debe validar que:
  - Los campos obligatorios no quedan vacíos.
  - La capacidad ingresada sea un número entero mayor que 0.
  - Los horarios de disponibilidad no se superpongan con períodos bloqueados.
- Una vez creada, la acción se debe registrar en un historial de auditoría (quién creó el recurso, cuándo y con qué datos).
- Se debe mostrar un mensaje de confirmación exitoso al usuario.

**Tareas y Subtareas**

- **Tarea 1: Diseño de Interfaz de Usuario (UI)**
  - Subtarea 1.1: Crear mockups y wireframes del formulario de creación de recurso.
  - Subtarea 1.2: Definir y validar las reglas de validación en el frontend (campos obligatorios, formato de datos).
- **Tarea 2: Desarrollo del Endpoint de Creación en NestJS**
  - Subtarea 2.1: Definir el DTO (Data Transfer Object) para la creación de recursos.
  - Subtarea 2.2: Implementar la lógica de negocio en el servicio de recursos, incluyendo validaciones (por ejemplo, que la capacidad sea mayor a 0).
  - Subtarea 2.3: Integrar el servicio con la base de datos usando Prisma y MongoDB.
  - Subtarea 2.4: Desarrollar pruebas unitarias para el endpoint.
- **Tarea 3: Implementación del Registro de Auditoría**
  - Subtarea 3.1: Configurar la herramienta de logging (por ejemplo, Winston) para registrar la creación del recurso.
  - Subtarea 3.2: Almacenar en la base de datos la información del usuario que crea el recurso y la fecha/hora de la acción.
- **Tarea 4: Pruebas de Aceptación y BDD con Jasmine**
  - Subtarea 4.1: Escribir escenarios Given-When-Then para la creación de un recurso.
  - Subtarea 4.2: Ejecutar pruebas de integración que verifiquen el flujo completo (desde la UI hasta la base de datos).
- **Tarea 5: Documentación y Despliegue**
  - Subtarea 5.1: Documentar el endpoint, las reglas de validación y el flujo de auditoría.
  - Subtarea 5.2: Integrar la funcionalidad en el pipeline de CI/CD (GitHub Actions y SonarQube).

#### HU-02: Editar Recurso

**Historia de Usuario**  
Como Administrador, quiero editar la información de un recurso para mantener la base de datos actualizada y reflejar cualquier cambio en las características o disponibilidad de los espacios.

**Criterios de Aceptación**

- La interfaz debe mostrar un formulario de edición con los datos actuales del recurso precargados.
- Se deben poder modificar todos los atributos editables (nombre, tipo, ubicación, capacidad, horarios, etc.).
- Las validaciones deben asegurarse de que los nuevos datos cumplan los mismos criterios que en la creación (campos obligatorios, capacidad > 0, etc.).
- Toda modificación debe registrarse en el historial de auditoría (incluyendo qué cambios se realizaron y por quién).
- Al finalizar la edición, se debe notificar al usuario con un mensaje de éxito.

**Tareas y Subtareas**

- **Tarea 1: Diseño de la Interfaz de Edición**
  - Subtarea 1.1: Diseñar y aprobar mockups de la pantalla de edición de recurso.
  - Subtarea 1.2: Asegurarse de que el formulario pre-llene los datos actuales y permita cambios de manera intuitiva.
- **Tarea 2: Desarrollo del Endpoint de Edición en NestJS**
  - Subtarea 2.1: Definir el DTO para la actualización de recursos.
  - Subtarea 2.2: Implementar la lógica de actualización en el servicio, aplicando validaciones pertinentes.
  - Subtarea 2.3: Integrar la actualización con la base de datos.
  - Subtarea 2.4: Desarrollar pruebas unitarias para este flujo.
- **Tarea 3: Registro de Cambios en el Historial de Auditoría**
  - Subtarea 3.1: Implementar la funcionalidad para registrar los cambios (quién, cuándo, qué se cambió).
  - Subtarea 3.2: Asegurar la trazabilidad de todas las modificaciones.
- **Tarea 4: Pruebas de Aceptación y BDD con Jasmine**
  - Subtarea 4.1: Escribir escenarios BDD (Given-When-Then) que cubran el flujo de edición.
  - Subtarea 4.2: Ejecutar pruebas de integración para verificar la actualización en la base de datos.
- **Tarea 5: Documentación y Despliegue**
  - Subtarea 5.1: Actualizar la documentación técnica y del usuario.
  - Subtarea 5.2: Incluir este flujo en el pipeline de CI/CD.

#### HU-03: Eliminar o Deshabilitar Recurso

**Historia de Usuario**  
Como Administrador, quiero eliminar o deshabilitar un recurso para evitar que se utilicen espacios obsoletos o que ya no deben estar disponibles, asegurando la integridad de las reservas existentes.

**Criterios de Aceptación**

- Si el recurso no tiene reservas activas, el sistema debe permitir su eliminación completa.
- Si el recurso tiene reservas activas o historial de reservas, el sistema debe impedir la eliminación y, en su lugar, ofrecer la opción de deshabilitar.
- Al realizar la acción (eliminación o deshabilitación), se debe mostrar una confirmación y registrar la acción en el historial de auditoría.
- Se debe validar que no se puedan eliminar recursos críticos sin previo aviso a los usuarios afectados (por ejemplo, mediante una confirmación modal).

**Tareas y Subtareas**

- **Tarea 1: Diseño del Flujo de Eliminación/Deshabilitación**
  - Subtarea 1.1: Diseñar la interfaz de usuario que permita seleccionar un recurso para eliminación/deshabilitación.
  - Subtarea 1.2: Crear un modal de confirmación que indique los riesgos y permite elegir entre eliminar o deshabilitar.
- **Tarea 2: Desarrollo del Endpoint de Eliminación/Deshabilitación en NestJS**
  - Subtarea 2.1: Implementar la lógica para verificar si el recurso tiene reservas activas.
  - Subtarea 2.2: Si no existen reservas, proceder con la eliminación; si existen, cambiar el estado del recurso a “deshabilitado”.
  - Subtarea 2.3: Integrar la lógica con la base de datos y actualizar el registro del recurso.
  - Subtarea 2.4: Desarrollar pruebas unitarias para validar ambos flujos (eliminación y deshabilitación).
- **Tarea 3: Registro de Auditoría para la Acción**
  - Subtarea 3.1: Configurar el registro de logs para capturar la acción de eliminación o deshabilitación, incluyendo el usuario que realiza la acción y la fecha/hora.
- **Tarea 4: Pruebas de Aceptación y BDD con Jasmine**
  - Subtarea 4.1: Definir escenarios BDD (Given-When-Then) para la eliminación y para el flujo de deshabilitación.
  - Subtarea 4.2: Ejecutar pruebas de integración que verifiquen la integridad de la información y la actualización del historial.
- **Tarea 5: Documentación y Despliegue**
  - Subtarea 5.1: Documentar el comportamiento del sistema en ambos casos y las condiciones que determinan cada flujo.
  - Subtarea 5.2: Incluir esta funcionalidad en el pipeline de CI/CD y actualizar la documentación de usuario.
