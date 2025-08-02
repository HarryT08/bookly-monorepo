---
trigger: manual
---

### RF-42: Restricción de modificaciones a los recursos únicamente a administradores, para proteger la integridad de la información

---

## HU-34: Restricción de Modificaciones a los Recursos Solo para Administradores

**Historia de Usuario**  
Como Administrador, quiero que solo los usuarios con rol de administrador puedan modificar los recursos para garantizar la integridad de la información y evitar cambios no autorizados.

### Criterios de Aceptación

- Al intentar modificar un recurso, el sistema debe verificar el rol del usuario autenticado.
- Si el usuario es administrador, se permitirá la modificación y se actualizará el recurso.
- Si el usuario no es administrador, el sistema deberá rechazar la operación y devolver un mensaje claro (por ejemplo, "No tiene permisos para modificar este recurso") con un código de error 403 (Forbidden).
- Todas las acciones (modificaciones aprobadas o intentos rechazados) deben quedar registradas en el historial de auditoría, incluyendo quién realizó la acción, la fecha y el resultado.
- La verificación del rol y la restricción deben aplicarse tanto en el backend (endpoint) como reflejarse en la interfaz de usuario (por ejemplo, ocultando o deshabilitando botones de edición para usuarios no autorizados).

---

## SubHU-34.1: Permitir Modificaciones Sólo a Administradores

**Historia de Usuario**  
Como Administrador, quiero que el sistema permita la modificación de recursos únicamente a usuarios con rol de administrador para asegurar que solo personal autorizado realice cambios en la información.

### Criterios de Aceptación

- El endpoint de modificación de recursos debe validar que el usuario tenga rol de administrador.
- Si la validación es exitosa, se debe proceder con la modificación y actualizar la información en la base de datos.
- La respuesta exitosa debe incluir un mensaje de confirmación y los datos actualizados del recurso.
- La acción de modificación aprobada debe registrarse en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño y Especificación del Requisito**  
- Subtarea 1.1: Revisar y documentar el flujo de modificación de recursos en el sistema.  
- Subtarea 1.2: Definir claramente las reglas de negocio que permiten la modificación solo a administradores.

**Tarea 2: Desarrollo del Endpoint de Modificación con Validación de Rol**  
- Subtarea 2.1: Definir el DTO para la actualización de recursos.  
- Subtarea 2.2: Implementar en el servicio de recursos la lógica de validación que verifique que el usuario autenticado tenga rol de administrador.  
- Subtarea 2.3: Integrar la validación en un middleware o guard (por ejemplo, utilizando los Guards de NestJS).  
- Subtarea 2.4: Actualizar el recurso en la base de datos si la validación es exitosa, usando Prisma y MongoDB.

**Tarea 3: Registro de Auditoría**  
- Subtarea 3.1: Configurar logging (por ejemplo, con Winston) para registrar cada modificación aprobada, incluyendo el identificador del usuario, fecha y datos modificados.  
- Subtarea 3.2: Almacenar la información en el historial de auditoría.

**Tarea 4: Pruebas y Documentación**  
- Subtarea 4.1: Desarrollar pruebas unitarias e integración utilizando Jasmine (escenarios Given-When-Then) para el flujo de modificación por administradores.  
- Subtarea 4.2: Documentar el proceso de modificación y las reglas de validación en la guía del usuario y en la documentación técnica.  
- Subtarea 4.3: Integrar la funcionalidad en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).

---

## SubHU-34.2: Manejo de Intentos de Modificación por Usuarios No Autorizados

**Historia de Usuario**  
Como Usuario no Administrador, quiero que se me impida modificar los recursos y se me muestre un mensaje de error para saber que no tengo los permisos necesarios y evitar cambios no autorizados.

### Criterios de Aceptación

- Si un usuario no administrador intenta modificar un recurso, el sistema debe retornar un código de error 403 (Forbidden) junto con un mensaje explicativo.
- La interfaz de usuario debe deshabilitar o ocultar las opciones de modificación para usuarios sin permisos.
- El intento de modificación por un usuario no autorizado debe quedar registrado en el historial de auditoría, incluyendo el identificador del usuario y la acción rechazada.
- La validación debe aplicarse de forma consistente tanto en el backend como en el frontend.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz para Usuarios No Administradores**  
- Subtarea 1.1: Actualizar la interfaz de recursos para que el botón de "Editar" se oculte o se deshabilite para usuarios sin rol de administrador.  
- Subtarea 1.2: Crear mensajes de error claros para mostrar en caso de que un usuario no autorizado intente acceder a la edición mediante URL directa.

**Tarea 2: Implementación de Validación en el Backend**  
- Subtarea 2.1: Configurar un Guard o middleware en el endpoint de modificación que verifique el rol del usuario.  
- Subtarea 2.2: Retornar un error 403 con un mensaje adecuado si la validación falla.  
- Subtarea 2.3: Desarrollar pruebas unitarias para validar la restricción de acceso en el endpoint.

**Tarea 3: Registro de Auditoría y Manejo de Excepciones**  
- Subtarea 3.1: Configurar logging para registrar cada intento de modificación fallido por usuarios no autorizados.  
- Subtarea 3.2: Implementar manejo de excepciones que asegure que se capture y notifique el intento fallido.

**Tarea 4: Pruebas y Documentación**  
- Subtarea 4.1: Desarrollar pruebas de integración con Jasmine utilizando escenarios Given-When-Then para simular intentos no autorizados.  
- Subtarea 4.2: Documentar la restricción y el comportamiento esperado para usuarios no autorizados en la guía del usuario.  
- Subtarea 4.3: Integrar la funcionalidad en el pipeline de CI/CD.
