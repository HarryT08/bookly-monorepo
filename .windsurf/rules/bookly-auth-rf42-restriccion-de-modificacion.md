---
trigger: manual
---

## RF-42: Restricción de modificaciones a los recursos únicamente a administradores

El sistema debe garantizar que únicamente los administradores tengan la capacidad de modificar la información de los recursos disponibles, asegurando un control estricto sobre la configuración y gestión de estos.

Las modificaciones restringidas incluyen:

- Edición de detalles de los recursos (nombre, ubicación, capacidad, características).
- Cambio en la disponibilidad o estado de los recursos (activo, en mantenimiento, fuera de servicio).
- Eliminación o desactivación de recursos.
- Ajuste de horarios de uso y restricciones de acceso.

El objetivo de esta funcionalidad es mantener la integridad y disponibilidad de los recursos, evitando modificaciones accidentales o no autorizadas por parte de usuarios sin los permisos adecuados.

### Criterios de Aceptación

- Solo los administradores deben tener acceso a la opción de modificar recursos en el sistema.
- Los usuarios con roles distintos al administrador (estudiantes, docentes, administrativos, vigilantes) no deben poder modificar información de los recursos.
- El sistema debe registrar un historial de modificaciones indicando:
  - Quién realizó el cambio.
  - Fecha y hora de la modificación.
  - Detalles específicos del cambio realizado.
- Si un usuario sin permisos intenta modificar un recurso, el sistema debe mostrar un mensaje de restricción y registrar el intento.
- Los administradores deben poder restaurar versiones previas de los recursos si un cambio afecta la disponibilidad o configuración.
- Se debe implementar una autenticación adicional cuando un administrador intente eliminar un recurso, para evitar eliminaciones accidentales.

### Flujo de Uso Mejorado

#### Acceso y modificación de un recurso (Administrador)

- Un administrador accede al módulo "Gestión de Recursos".
- Selecciona el recurso que desea modificar.
- Realiza los cambios necesarios (ajuste de horarios, actualización de disponibilidad, cambio de ubicación, etc.).
- Guarda los cambios, y el sistema registra la modificación en el historial de auditoría.

#### Intento de modificación por un usuario sin permisos

- Un usuario sin permisos intenta editar un recurso.
- El sistema bloquea la acción y muestra un mensaje de error indicando que la modificación sólo está permitida para administradores.
- El sistema registra el intento de modificación en el historial de auditoría y se notifica al administrador del programa académico.

#### Registro de modificaciones, intentos de modificación y control de auditoría

- Cada modificación realizada por un administrador se almacena en un historial de cambios.
- Cada intento de modificación por un usuario sin permisos se almacena en un historial de notificaciones.
- Si se detecta un error, el administrador puede revertir la última modificación o restaurar un estado anterior del recurso.

#### Eliminación de un recurso

- Un administrador intenta eliminar un recurso.
- El sistema solicita una confirmación adicional para evitar eliminaciones accidentales.
- Si la eliminación se confirma, el recurso se marca como "desactivado" en lugar de eliminarse permanentemente.

### Restricciones y Consideraciones

- **Acceso restringido**
  - Solo los administradores deben tener acceso al módulo de edición de recursos.
- **Prevención de eliminaciones accidentales**
  - Se debe requerir una autenticación adicional o doble confirmación con PIN antes de eliminar un recurso.
- **Historial de cambios**
  - Todas las modificaciones deben ser registradas para permitir auditoría y reversión en caso de errores.
- **Control de versiones**
  - Si un administrador necesita restaurar una versión anterior de un recurso, debe haber una opción para hacerlo.
  - Restaurar una versión no mantiene las versiones anteriores.
- **Bloqueo de edición para usuarios no autorizados**
  - La interfaz debe ocultar o deshabilitar las opciones de edición de recursos para quienes no tengan permisos.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe permitir la gestión de una gran cantidad de recursos sin afectar el rendimiento.
- **Rendimiento**: La carga y actualización de datos debe realizarse en tiempo real sin retrasos perceptibles.
- **Seguridad**: Se debe implementar un control de acceso basado en roles para garantizar que solo los administradores puedan modificar recursos.
- **Usabilidad**: La interfaz debe ser clara y accesible, con opciones de edición bien diferenciadas para administradores.
- **Disponibilidad**: La funcionalidad debe estar operativa 24/7, permitiendo a los administradores modificar recursos en cualquier momento.
