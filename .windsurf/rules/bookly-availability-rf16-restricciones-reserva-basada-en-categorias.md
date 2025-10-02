---
trigger: manual
---

## RF-16: Establecer restricciones de reserva basadas en categorías

El sistema debe permitir la configuración de restricciones de reserva en función de la categoría del usuario. Esto significa que ciertos recursos solo podrán ser reservados por grupos específicos, como profesores, investigadores, personal administrativo o estudiantes, asegurando que los recursos especializados sean utilizados de manera adecuada y priorizando el acceso según su finalidad.  
El propósito de esta funcionalidad es optimizar la gestión de los recursos, evitar el uso indebido y garantizar que los usuarios autorizados tengan acceso prioritario a los equipos, laboratorios, salas y otros activos según su rol dentro de la institución.

### Criterios de Aceptación

- El sistema debe permitir la configuración de restricciones de reserva para cada recurso con base en las categorías de usuario.
- Al intentar realizar una reserva, el sistema debe verificar si el usuario pertenece a una categoría con permisos adecuados.
- Si el usuario no tiene acceso al recurso, el sistema debe denegar la reserva y mostrar un mensaje explicativo.
- La administración del sistema debe poder modificar las restricciones de cada recurso a través de una interfaz de configuración.
- Los usuarios con permisos de administrador deben poder asignar categorías a los usuarios y actualizar sus roles cuando sea necesario.
- La restricción debe aplicarse tanto en la búsqueda de recursos como en la reserva, evitando que usuarios sin permisos visualicen o accedan a recursos restringidos.
- Se debe permitir la solicitud de permisos especiales, donde un usuario pueda pedir acceso a un recurso restringido bajo aprobación de un administrador.
- Se debe registrar un historial de intentos de reserva en recursos restringidos para auditoría.

### Flujo de Uso

#### Configuración de restricciones por parte del administrador

- El administrador accede al módulo de configuración de recursos.
- Selecciona un recurso y asigna las categorías de usuario autorizadas para reservarlo.
- Guarda los cambios y las restricciones quedan activas en el sistema.

#### Intento de reserva por un usuario

- El usuario busca un recurso y selecciona una fecha y hora para la reserva.
- El sistema verifica la categoría del usuario y compara con las restricciones del recurso.
- Si el usuario tiene permiso, puede continuar con la reserva.
- Si no tiene permiso, el sistema deniega la solicitud y muestra un mensaje con las razones.
- Opcionalmente, el sistema puede ofrecer una opción para solicitar autorización especial.

#### Solicitud de acceso especial (si aplica)

- Si el usuario no tiene permisos pero necesita acceso, puede enviar una solicitud especial al administrador.
- El administrador recibe una notificación y revisa la solicitud.
- Puede aprobar o rechazar la petición, notificando al usuario la decisión.

#### Registro y auditoría

- Todas las reservas aceptadas y rechazadas quedan registradas en el historial del sistema.
- Los administradores pueden consultar reportes sobre intentos de reserva en recursos restringidos.

### Restricciones y Consideraciones

- **Gestión de permisos dinámica**
  - Se debe definir un mecanismo que permita actualizar las categorías de usuario sin afectar reservas ya realizadas.

- **Manejo de usuarios con múltiples roles**
  - Algunos usuarios pueden pertenecer a más de una categoría (ej., un estudiante que también es asistente de investigación). Se debe permitir definir excepciones en estos casos.

- **Limitaciones en la solicitud de acceso especial**
  - Se debe establecer un número máximo de solicitudes por usuario para evitar abuso del sistema.

- **Reglas de acceso temporales**
  - Se debe definir si ciertas restricciones pueden cambiar en función de fechas específicas (ej., acceso extendido en periodos de exámenes o proyectos especiales).

- **Visibilidad de los recursos restringidos**
  - Se debe decidir si los usuarios sin permisos pueden ver los recursos en el sistema pero no reservarlos, o si están completamente ocultos para ellos.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad:** El sistema debe ser capaz de manejar una gran cantidad de usuarios y recursos con diferentes configuraciones de restricción sin degradar el rendimiento.
- **Rendimiento:** La verificación de permisos debe realizarse de forma rápida para no afectar la experiencia del usuario.
- **Seguridad:** Solo administradores autorizados pueden modificar restricciones y asignar roles de usuario.
- **Usabilidad:** La interfaz para configurar y gestionar restricciones debe ser intuitiva para facilitar su administración.
- **Auditoría:** Se debe registrar un historial de intentos de reserva en recursos restringidos para análisis y control.
