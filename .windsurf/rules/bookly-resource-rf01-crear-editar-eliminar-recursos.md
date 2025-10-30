---
trigger: manual
---

## RF-01: Crear, editar y eliminar recursos (salones, auditorios, equipos, laboratorios, etc.)

El sistema debe permitir la gestión completa de los recursos disponibles en la universidad, asegurando su correcta administración mediante la creación, edición y eliminación de registros. Esto garantizará que la información esté siempre actualizada y accesible para los usuarios autorizados.

### Criterios de Aceptación

- **Los administradores deben poder crear un nuevo recurso**, ingresando información obligatoria como nombre, tipo, ubicación, disponibilidad y capacidad.
- **Debe ser posible editar recursos existentes**, modificando cualquier atributo, con registro de auditoría sobre los cambios realizados.
- **Se debe permitir eliminar recursos**, con restricciones según su estado y uso en reservas previas.
- Si un recurso eliminado ha sido usado el recurso sólo pasa a ser **deshabilitado** para evitar usos futuros.
- En caso de haber conflicto entre una **modificación de la disponibilidad de un recurso con una reserva previa a la modificación**, el sistema debe impedir la acción y sugerir la asignación.
- **Validaciones en la creación/edición:**
  - Un recurso **no puede crearse sin nombre, tipo ni ubicación**.
  - La **capacidad debe ser un número entero mayor a 0** si aplica.
  - **Los horarios de disponibilidad no pueden superponerse** con otros periodos bloqueados.
  - En caso de eliminar un recurso y existen **reservas activas con él**, el sistema debe impedir la acción y sugerir reasignación.
  - Se debe registrar el **historial de cambios en los recursos** (quién los creó, modificó o eliminó, las modificaciones aplicadas y cuándo).

### Flujo de Uso

#### Creación

- El administrador accede al módulo de gestión de recursos.
- Selecciona "Crear Nuevo Recurso".
- Completa los campos requeridos (nombre, categoría, ubicación, capacidad, disponibilidad, estado, etc.).
- Guarda la información y el sistema confirma la creación exitosa.

#### Edición

- El administrador busca un recurso en el sistema mediante filtros avanzados.
- Accede a la opción "Editar".
- Modifica los atributos permitidos.
- Guarda los cambios, los cuales quedan registrados en el historial de auditoría.

#### Eliminación

- El administrador selecciona un recurso a eliminar.
- Si el recurso tiene reservas activas, el sistema impide su eliminación.
- Si el recurso no tiene restricciones, se elimina y queda registrado en el historial.
- Si el recurso tiene historial de reservas, se impide su eliminación y pasa a ser deshabilitado.

### Restricciones y Consideraciones

- Solo los usuarios con permisos de **"Administrador de Recursos"** pueden crear, editar y eliminar recursos.
- Un recurso **no puede eliminarse si tiene reservas futuras activas**.
- Un recurso **no puede modificar su disponibilidad si tiene reservas futuras activas**.
- La modificación de la **ubicación, disponibilidad o estado de un recurso debe generar notificación** a los usuarios con reservas previas.
- Se deben implementar **confirmaciones antes de eliminar recursos** para evitar eliminaciones accidentales.

### Requerimientos No Funcionales Relacionados

- **Rendimiento:** La creación, edición y eliminación de recursos debe procesarse en menos de **2 segundos** en condiciones normales de carga.
- **Seguridad:** Se debe utilizar un sistema de **roles y permisos** para restringir la modificación de recursos a personal autorizado.
- **Auditoría:** Cada cambio realizado en los recursos debe ser registrado con **fecha, hora y usuario responsable**.
