---
trigger: manual
---

## RF-41: Gestión de roles y permisos según perfil de usuario

El sistema debe permitir la gestión de roles y permisos diferenciados según el perfil de usuario, garantizando que cada tipo de usuario tenga acceso únicamente a las funcionalidades que le corresponden.

Los perfiles deben incluir:

- Estudiante: Puede realizar reservas, consultar disponibilidad y recibir notificaciones sobre sus reservas.
- Docente: Puede realizar reservas individuales o múltiples, gestionar solicitudes de estudiantes y aprobar reservas en ciertos casos.
- Administrador: Tiene control total sobre las configuraciones del sistema, gestión de reservas, generación de reportes, asignación de permisos y administración de usuarios.
- Vigilante: Puede visualizar reservas aprobadas para gestionar accesos y verificar la asistencia de los usuarios.
- Administrativo general: Puede generar reportes de uso, validar reservas y administrar horarios de los recursos.
- Administrativo del programa académico: Puede generar reportes de uso, validar reservas y administrar horarios de los recursos solo para un programa académico.

El propósito de esta funcionalidad es garantizar la seguridad y eficiencia en la administración de recursos, asignando accesos y permisos de manera controlada para cada tipo de usuario.

### Criterios de Aceptación

- El sistema debe permitir asignar roles y permisos específicos a cada usuario según su perfil.
- Cada rol debe tener acceso únicamente a las funcionalidades correspondientes:
  - Estudiantes: Reservar, cancelar, consultar disponibilidad, evaluar administrativo, evaluar recursos.
  - Docentes: Reservar, cancelar, aprobar solicitudes de estudiantes, consultar historial.
  - Administradores general: Configurar el sistema, gestionar reservas globales, generar reportes, asignar roles a usuarios, modificar roles, modificar permisos.
  - Administradores del programa académico: Configurar el sistema, gestionar reservas globales, generar reportes, asignar roles a usuarios, modificar roles, modificar permisos solo para un programa académico.
  - Vigilantes: Consultar reservas aprobadas, verificar check-in/check-out de usuarios, evaluar asistentes.
  - Administrativos: Generar reportes, ajustar disponibilidad de recursos, validar solicitudes de reservas, evaluar asistentes.
- Debe existir una interfaz de administración de roles que permita modificar permisos de manera flexible sin afectar la estructura del sistema.
- El sistema debe registrar un historial de cambios en permisos para auditoría.
- Si un usuario cambia de rol, el sistema debe actualizar sus permisos automáticamente sin afectar reservas previas.
- Solo los administradores autorizados deben poder modificar los roles y permisos de los usuarios.

### Flujo de Uso

#### Creación de permisos por parte del administrador

- El administrador accede al módulo "Gestión de Usuarios y Roles".
- Selecciona "Crear Nuevo Permiso".
- Completa los campos requeridos (nombre, categoría, roles, estado, acción - buscar, crear, editar, borrar -, nivel de visualización - elementos -, atributos a visualizar de acuerdo al nivel, alcance de la visualización - personal, grupal, global -, etc.).
- Guarda la información y el sistema confirma la creación exitosa.
- Actualiza los permisos de los usuarios que tengan el rol donde se relaciona el permiso editado automáticamente.

#### Edición de permisos por parte del administrador

- El administrador busca un permiso en el sistema mediante filtros avanzados.
- Accede a la opción "Editar".
- Modifica los atributos permitidos.
- Guarda los cambios, los cuales quedan registrados en el historial de auditoría.
- Actualiza los permisos de los usuarios que tengan el rol donde se relaciona el permiso editado automáticamente.

#### Eliminación de permisos por parte del administrador

- El administrador selecciona un permiso a eliminar.
- Si el permiso está activo, el sistema impide su eliminación.
- Si el permiso no tiene restricciones, se elimina y queda registrado en el historial.
- Si el permiso tiene historial de asignaciones, se impide su eliminación y pasa a ser deshabilitado.
- Un permiso deshabilitado no puede ser asignado a un usuario.

#### Creación de roles por parte del administrador

- El administrador accede al módulo "Gestión de Usuarios y Roles".
- Selecciona "Crear Nuevo Rol".
- Completa los campos requeridos (nombre, categoría, permisos, estado, etc.).
- Solo pueden ser asignados al rol los permisos activos.
- Guarda la información y el sistema confirma la creación exitosa.

#### Edición de roles por parte del administrador

- El administrador busca un rol en el sistema mediante filtros avanzados.
- Accede a la opción "Editar".
- Modifica los atributos permitidos.
- Solo pueden ser asignados al rol los permisos activos.
- Guarda los cambios, los cuales quedan registrados en el historial de auditoría.
- Actualiza los permisos de los usuarios con el rol automáticamente.

#### Eliminación de roles por parte del administrador

- El administrador selecciona un rol a eliminar.
- Si el rol está activo, el sistema impide su eliminación.
- Si el rol no tiene restricciones, se elimina y queda registrado en el historial.
- Si el rol tiene historial de asignaciones, se impide su eliminación y pasa a ser deshabilitado.
- El rol puede ser activado nuevamente desde la edición del rol.
- Un rol deshabilitado no puede ser asignado a un usuario.

#### Asignación y gestión de roles por parte del administrador

- Un administrador accede al módulo "Gestión de Usuarios y Roles".
- Consulta la lista de usuarios y asigna un rol específico a cada usuario.
- Puede modificar permisos adicionales si es necesario para un caso particular.
- Guarda los cambios y el sistema aplica los permisos automáticamente.
- El rol es asignado a un usuario en un programa académico.

#### Interacción del usuario según su rol

- Un usuario accede al sistema y ve las opciones habilitadas según su perfil:
  - Estudiante: Puede ver, reservar recursos, evaluar administrativos, evaluar recursos.
  - Docente: Puede reservar recursos, aprobar reservas de estudiantes, gestionar horarios.
  - Vigilante: Puede visualizar reservas activas, validar accesos, evaluar asistentes.
  - Administrativo: Puede consultar reportes y realizar ajustes en la disponibilidad de los recursos.
  - Administrador General: Tiene control total del sistema.

#### Modificación de roles y permisos

- Si un usuario requiere un cambio de rol, el administrador accede nuevamente al módulo "Gestión de Usuarios y Roles" y actualiza su perfil.
- El sistema actualiza automáticamente los permisos asignados.

#### Auditoría y control de cambios

- El sistema registra cualquier modificación de roles o permisos en un historial de auditoría, indicando:
  - Quién realizó el cambio.
  - Qué cambios se aplicaron.
  - Fecha y hora del ajuste.

### Restricciones y Consideraciones

- **Acceso restringido**
  - Solo los administradores deben poder modificar roles y permisos.
- **Prevención de conflictos de permisos**
  - Un usuario solo tiene un rol en un programa académico.
- **Actualización en tiempo real**
  - Cuando un usuario cambia de rol, los permisos deben actualizarse automáticamente sin necesidad de reiniciar sesión.
  - Si tiene una sesión activa, esta notificará la recarga de la sesión para actualizar los permisos.
- **Roles predefinidos y personalizados**
  - Los roles predefinidos no podrán editarse ni deshabilitarse.
  - Solo los roles personalizados pueden ser editados o eliminados.
- **Manejo de excepciones**
  - Si un usuario pierde su rol de administrador, debe confirmarlo antes de aplicar el cambio para evitar bloqueos accidentales.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe permitir gestionar una gran cantidad de usuarios sin afectar el rendimiento.
- **Rendimiento**: Los cambios en roles y permisos deben aplicarse en tiempo real sin demoras.
- **Seguridad**: Se deben aplicar controles de acceso estrictos para evitar modificaciones no autorizadas.
- **Usabilidad**: La interfaz de administración de roles debe ser clara e intuitiva, con opciones organizadas y explicaciones sobre cada permiso.
- **Disponibilidad**: La funcionalidad debe estar operativa 24/7, permitiendo la gestión de roles en cualquier momento.
