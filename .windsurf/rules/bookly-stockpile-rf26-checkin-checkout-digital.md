---
trigger: manual
---

## RF-26: Implementación de check-in/check-out digital para validar que la persona que reservó el recurso realmente lo usa

El sistema debe permitir la implementación de un proceso de check-in/check-out digital para validar que la persona que realizó una reserva efectivamente utilice el recurso asignado. Este proceso garantizará que los usuarios cumplan con sus reservas, optimizando la utilización de los recursos y evitando bloqueos innecesarios por inasistencia.

El check-in se realizará al momento de iniciar la reserva y el check-out al finalizarla, permitiendo además:
- Registro de entrada y salida con hora exacta.
- Verificación de identidad (por PIN, credenciales o notificación en la app).
- Liberación anticipada del recurso si el usuario finaliza antes del tiempo programado.
- Notificación a administradores en caso de no presentarse al check-in dentro de un tiempo límite.

El objetivo es mejorar el control y gestión de las reservas, optimizar la disponibilidad de los recursos y generar trazabilidad del uso real de los mismos.

### Criterios de Aceptación

- El sistema debe habilitar un check-in digital para que el usuario confirme su asistencia antes de utilizar el recurso reservado.
- El check-in debe poder realizarse mediante código PIN, credenciales del sistema o confirmación en la app/web.
- El sistema debe registrar la hora exacta en la que el usuario hace check-in y check-out.
- Si el usuario no realiza el check-in dentro de un tiempo límite configurable (ejemplo: 15 minutos después del inicio de la reserva), la reserva debe ser marcada como "No Presentado", y el recurso podrá ser liberado para otros usuarios.
- El usuario debe poder hacer check-out antes del tiempo programado, liberando el recurso para ser reservado nuevamente.
- Se debe generar un historial de check-in y check-out accesible para administradores y usuarios con permisos especiales.
- Los administradores deben recibir alertas en caso de inasistencia repetida (configurar las veces), permitiendo aplicar restricciones a usuarios que incumplan con sus reservas.

### Flujo de Uso

#### Inicio de la reserva y recordatorio automático

- El usuario recibe un recordatorio antes de su reserva con instrucciones para hacer check-in.
- Si la reserva es en un espacio físico, puede acceder al sistema desde su dispositivo móvil o desde un lector QR en la entrada.

#### Check-in del usuario

- Al llegar al recurso, el usuario debe confirmar su presencia a través de:
  - Código QR escaneado desde su móvil.
  - PIN de confirmación ingresado en la plataforma.
  - Confirmación manual en la app/web.
- El sistema registra la hora exacta de ingreso y cambia el estado de la reserva a "En Uso".

#### Uso del recurso y finalización

- Durante el uso del recurso, el usuario puede ver el tiempo restante de su reserva.
- Si finaliza antes de lo programado, puede hacer check-out anticipado, liberando el recurso antes del tiempo límite.

#### Check-out y cierre de la reserva

- Al finalizar la reserva, el usuario realiza el check-out en la plataforma.
- El sistema registra la hora exacta de salida y finaliza la reserva.
- Si el usuario no hace check-out manualmente, el sistema lo registrará automáticamente al finalizar el tiempo de la reserva.

#### Gestión de inasistencias y penalizaciones

- Si el usuario no hace check-in dentro del tiempo límite, la reserva queda en estado "No Presentado" y puede ser reasignada.
- Si el usuario acumula varias inasistencias, se puede aplicar una restricción temporal en su capacidad de hacer nuevas reservas.
- El sistema genera un reporte de inasistencias, visible para administradores.

### Restricciones y Consideraciones

- **Tiempo límite de check-in**  
  ○ Se debe definir un tiempo máximo para que el usuario pueda validar su presencia antes de que la reserva sea liberada.

- **Identificación del usuario**  
  ○ Se deben habilitar diferentes métodos de validación (PIN, login, notificación en la app).

- **Manejo de reservas compartidas**  
  ○ Si un recurso es utilizado por varios usuarios (ejemplo: una sala para un grupo), debe haber un mecanismo para validar la asistencia del grupo.

- **Liberación de recursos en caso de inasistencia**  
  ○ Si un usuario no se presenta, el recurso debe quedar automáticamente disponible para otros usuarios.

- **Flexibilidad en el check-out**  
  ○ Se debe permitir que los usuarios liberen el recurso antes del tiempo programado, pero asegurando que no haya abuso del sistema.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe soportar múltiples check-ins simultáneos sin degradar el rendimiento.
- **Rendimiento**: El registro de check-in/check-out debe ser inmediato para evitar retrasos en la validación.
- **Seguridad**: Se debe garantizar que solo el usuario que reservó pueda hacer check-in, evitando suplantación.
- **Usabilidad**: La interfaz debe ser clara e intuitiva, facilitando el proceso de check-in y check-out en pocos pasos.
- **Disponibilidad**: El sistema debe estar operando 24/7 para garantizar el uso sin interrupciones.
