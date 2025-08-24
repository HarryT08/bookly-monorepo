---
trigger: manual
---

## RF-23: Generación de pantalla para el personal de vigilancia indicando las reservas aprobadas

El sistema debe contar con una pantalla de control para el personal de vigilancia, donde se muestran en tiempo real todas las reservas aprobadas para el día y las próximas jornadas. Esta funcionalidad permitirá a los vigilantes verificar y gestionar el acceso de los usuarios a los recursos reservados, asegurando que solo las personas autorizadas ingresen a los espacios o utilicen los equipos asignados.

La pantalla debe mostrar información clave como:

- Datos del solicitante (nombre, cargo, identificación).
- Detalles de la reserva (fecha, hora de inicio y fin, recurso reservado, ubicación).
- Estado de la reserva (confirmada, en curso, cancelada).
- Lista de personas autorizadas (si aplica).
- Opciones de validación (confirmar ingreso del usuario, marcar asistencia, registrar incidencias).

El propósito de esta funcionalidad es mejorar la eficiencia en el control de acceso, reducir el uso de documentos físicos y proporcionar a los vigilantes una herramienta digital confiable y en tiempo real.

### Criterios de Aceptación

- El sistema debe mostrar una pantalla de control en tiempo real con la lista de reservas aprobadas para el día y las próximas jornadas.
- La pantalla debe incluir opciones de filtrado por fecha, ubicación y tipo de recurso para facilitar la búsqueda de reservas específicas.
- Los vigilantes deben poder confirmar el ingreso del usuario, marcando asistencia en el sistema.
- Si una reserva es cancelada o modificada, la pantalla debe reflejar los cambios inmediatamente.
- Debe incluir una función de búsqueda rápida para encontrar reservas por nombre del solicitante, número de identificación o tipo de recurso.
- Se debe registrar un historial de accesos con las reservas verificadas, incluyendo la hora de ingreso y el vigilante que validó la entrada.
- Si un usuario no está en la lista, el sistema debe permitir la verificación manual de su reserva ingresando su número de identificación.

### Flujo de Uso

#### Acceso a la pantalla de vigilancia

- El personal de vigilancia inicia sesión en el sistema con sus credenciales.
- Accede a la sección "Control de Reservas".

#### Visualización y filtrado de reservas

- La pantalla muestra un listado en tiempo real con todas las reservas aprobadas del día.
- El vigilante puede aplicar filtros por fecha, ubicación y recurso para agilizar la búsqueda.
- Puede utilizar la barra de búsqueda para encontrar reservas específicas ingresando el nombre del solicitante o el número de reserva.

#### Verificación y control de acceso

- Cuando un usuario llega a la entrada, el vigilante busca su reserva en la pantalla.
- Si la reserva está activa, el vigilante puede confirmar el ingreso presionando un botón en la interfaz.
- Si la reserva no aparece, el sistema permite buscar manualmente con el número de identificación del usuario.
- En caso de incidencias (por ejemplo, un usuario llega fuera de su horario), el vigilante puede registrar la situación en el sistema.

#### Registro de accesos y seguimiento

- Cada ingreso confirmado se almacena en un historial de accesos, incluyendo la hora de validación y el vigilante responsable.
- Los administradores pueden consultar este historial para auditoría y control.

### Restricciones y Consideraciones

- **Disponibilidad en múltiples ubicaciones**  
  ○ Si hay más de un punto de control, la pantalla debe mostrar solo las reservas correspondientes a cada área.

- **Manejo de reservas modificadas o canceladas**  
  ○ La pantalla debe actualizarse en tiempo real para reflejar cualquier cambio en las reservas.

- **Acceso restringido**  
  ○ Solo los vigilantes y administradores deben poder visualizar y gestionar esta pantalla.

- **Modo de contingencia**  
  ○ Si el sistema se encuentra fuera de línea, debe existir una opción para descargar la lista de reservas aprobadas en un documento PDF.

- **Control de intentos de ingreso no autorizados**  
  ○ Si un usuario intenta ingresar sin reserva, el sistema debe registrar la incidencia para su análisis.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: La pantalla debe poder gestionar cientos de reservas simultáneamente sin degradar el rendimiento.
- **Rendimiento**: La actualización de datos debe ser en tiempo real, sin retrasos en la sincronización.
- **Seguridad**: Sólo el personal autorizado debe poder acceder y validar reservas.
- **Usabilidad**: La interfaz debe ser intuitiva, con un diseño optimizado para su uso en dispositivos táctiles.
- **Disponibilidad**: La funcionalidad debe estar accesible
