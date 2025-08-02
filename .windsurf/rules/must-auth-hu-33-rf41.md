---
trigger: manual
---

### RF-41: Gestión de roles y permisos según el perfil del usuario, vital para la seguridad

---

## HU-33: Gestión de Roles y Permisos según el Perfil del Usuario

**Historia de Usuario**  
Como Administrador, quiero gestionar roles y permisos según el perfil del usuario para asegurar que solo los usuarios autorizados puedan acceder y modificar información sensible, garantizando la seguridad y el cumplimiento de las políticas institucionales.

### Criterios de Aceptación

- La interfaz debe permitir crear, editar y eliminar roles.
- Se debe poder asignar un conjunto de permisos (por ejemplo, lectura, escritura, modificación, eliminación) a cada rol.
- La funcionalidad debe permitir ver un listado de roles existentes, con sus permisos asignados, de forma clara y ordenada.
- Cualquier acción de creación, modificación o eliminación de roles y permisos debe quedar registrada en el historial de auditoría (incluyendo el usuario que realizó la acción, fecha, hora y cambios efectuados).
- Los cambios en roles y permisos deben aplicarse de forma inmediata y reflejarse en el control de acceso del sistema.
- Se deben manejar adecuadamente los errores (por ejemplo, no permitir duplicidad de roles o asignar permisos inválidos) y notificar al usuario en caso de fallo.

---

## SubHU-33.1: Gestión de Roles (Creación, Edición y Eliminación)

**Historia de Usuario**  
Como Administrador, quiero crear, editar y eliminar roles para definir y actualizar las categorías de usuarios que tendrán distintos niveles de acceso en el sistema.

### Criterios de Aceptación

- La interfaz debe permitir ingresar un nombre único para cada rol.
- Se debe validar que no existan roles duplicados.
- El sistema debe permitir editar el nombre y los detalles de un rol existente.
- Se debe permitir la eliminación de roles, salvo aquellos que estén en uso activo (mostrando un mensaje de error o solicitando confirmación adicional).
- Cada acción (creación, edición, eliminación) debe quedar registrada en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Gestión de Roles**  
- Subtarea 1.1: Crear wireframes y mockups para la pantalla de administración de roles, incluyendo formularios para crear y editar.  
- Subtarea 1.2: Validar el diseño con usuarios clave y ajustar según retroalimentación.

**Tarea 2: Desarrollo del Endpoint para Gestión de Roles en NestJS**  
- Subtarea 2.1: Definir el DTO para la creación y edición de roles.  
- Subtarea 2.2: Implementar la lógica en el servicio para crear, editar y eliminar roles, incluyendo validación de duplicidad.  
- Subtarea 2.3: Integrar el endpoint con la base de datos utilizando Prisma y MongoDB.  
- Subtarea 2.4: Desarrollar pruebas unitarias para validar la funcionalidad.

**Tarea 3: Registro de Auditoría y Manejo de Excepciones**  
- Subtarea 3.1: Configurar logging (por ejemplo, usando Winston) para registrar cada acción sobre roles.  
- Subtarea 3.2: Implementar manejo de errores y notificaciones en caso de fallos (por ejemplo, intento de eliminar un rol en uso).

**Tarea 4: Pruebas de Integración y Documentación**  
- Subtarea 4.1: Desarrollar pruebas de integración utilizando Jasmine (escenarios Given-When-Then).  
- Subtarea 4.2: Documentar la funcionalidad en la guía del usuario y la documentación técnica.  
- Subtarea 4.3: Integrar el módulo de roles en el pipeline de CI/CD.

---

## SubHU-33.2: Asignación y Gestión de Permisos por Rol

**Historia de Usuario**  
Como Administrador, quiero asignar y gestionar permisos específicos para cada rol para asegurar que cada categoría de usuario tenga los niveles de acceso adecuados y restringir la modificación de información sensible.

### Criterios de Aceptación

- La interfaz debe permitir asignar permisos (por ejemplo, lectura, escritura, edición, eliminación) a cada rol.
- Se debe poder modificar los permisos asignados a un rol existente.
- La asignación de permisos debe validarse para asegurar que solo se puedan asignar permisos predefinidos y válidos.
- Los cambios en la asignación de permisos deben reflejarse inmediatamente en el sistema de control de acceso.
- Toda acción (asignación, modificación o eliminación de permisos) debe quedar registrada en el historial de auditoría.
- Se deben manejar errores (por ejemplo, asignar permisos inexistentes) y notificar al usuario en caso de fallo.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz para Gestión de Permisos**  
- Subtarea 1.1: Crear wireframes y mockups que muestren cómo se asignarán y visualizarán los permisos para cada rol.  
- Subtarea 1.2: Validar el diseño con administradores y usuarios clave.

**Tarea 2: Desarrollo del Endpoint para Asignación de Permisos en NestJS**  
- Subtarea 2.1: Definir el DTO para la asignación y modificación de permisos.  
- Subtarea 2.2: Implementar la lógica en el servicio para asignar, editar y eliminar permisos para un rol.  
- Subtarea 2.3: Integrar validaciones para asegurar que solo se asignen permisos válidos y predefinidos.  
- Subtarea 2.4: Integrar el endpoint con la base de datos utilizando Prisma y MongoDB.  
- Subtarea 2.5: Desarrollar pruebas unitarias para esta funcionalidad.

**Tarea 3: Registro de Auditoría y Manejo de Excepciones**  
- Subtarea 3.1: Configurar logging para registrar todas las acciones de asignación y modificación de permisos.  
- Subtarea 3.2: Implementar manejo de excepciones para notificar y registrar cualquier error en el proceso.

**Tarea 4: Pruebas de Integración y Documentación**  
- Subtarea 4.1: Desarrollar pruebas unitarias e integración utilizando Jasmine y escenarios BDD (Given-When-Then).  
- Subtarea 4.2: Documentar el proceso de gestión de permisos en la guía del usuario y la documentación técnica.  
- Subtarea 4.3: Integrar la funcionalidad en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).
