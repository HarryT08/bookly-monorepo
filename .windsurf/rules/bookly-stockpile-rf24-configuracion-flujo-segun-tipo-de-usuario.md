---
trigger: manual
---

## RF-24: Configuración de diferentes flujos de aprobación según el tipo de usuario

El sistema debe permitir la configuración de flujos de aprobación diferenciados según el tipo de usuario que realiza la solicitud de reserva (estudiante, profesor, administrativo). Esto garantizará que las reservas sean validadas por los responsables adecuados según las políticas de uso establecidas para cada perfil.

Los flujos de aprobación pueden variar en:

- Número de niveles de aprobación (ejemplo: los estudiantes requieren validación de un profesor, mientras que los administrativos pueden aprobar directamente).
- Tipo de aprobador asignado (ejemplo: el director de departamento aprueba reservas de profesores, mientras que un ingeniero de soporte valida reservas de equipos).
- Criterios específicos (ejemplo: ciertos recursos pueden requerir validación adicional para estudiantes, pero ser de acceso directo para administrativos).

El objetivo de esta funcionalidad es optimizar la gestión de reservas, asegurando que cada usuario siga un flujo de validación adecuado y eficiente, reduciendo demoras y mejorando el control sobre el uso de los recursos.

### Criterios de Aceptación

- El sistema debe permitir la configuración de múltiples flujos de aprobación según el tipo de usuario (estudiante, profesor, administrativo).
- Cada flujo de aprobación debe incluir niveles jerárquicos (ejemplo: un estudiante necesita la aprobación de un profesor antes de que la reserva sea revisada).
- El sistema debe notificar automáticamente a los validadores correspondientes cuando una solicitud requiere su aprobación.
- Si un aprobador no responde en un tiempo determinado, el sistema debe permitir reasignar la solicitud a otro validador o escalar la aprobación a un nivel superior. Si no hay otro validador o nivel superior, se debe enviar otra notificación con los datos y tiempo en espera.
- Los usuarios deben poder consultar en tiempo real el estado de su solicitud dentro del sistema.
- Se debe registrar un historial de aprobaciones y rechazos, permitiendo auditoría y seguimiento de cada solicitud.
- Los administradores deben poder modificar o actualizar los flujos de aprobación sin afectar solicitudes en proceso.

### Flujo de Uso

#### Configuración de flujos de aprobación (Administrador)

- El administrador accede al módulo de configuración de flujos de aprobación.
- Define reglas específicas para cada tipo de usuario (ejemplo: los estudiantes deben pasar por más validaciones que los administrativos).
- Establece los niveles de aprobación y los responsables asignados para cada flujo.
- Guarda la configuración, y el sistema aplica estos flujos a todas las nuevas solicitudes de reserva.

#### Envío de solicitud de reserva (Usuario)

- El usuario accede al sistema y selecciona el recurso que desea reservar.
- Completa los datos de la solicitud y la envía para su validación.
- El sistema asigna automáticamente el flujo de aprobación correspondiente según el tipo de usuario.

#### Validación de la solicitud (Aprobador designado)

- El validador recibe una notificación con los detalles de la reserva.
- Puede aprobar, rechazar o solicitar modificaciones en la solicitud.
- Si la solicitud es aprobada, se confirma la reserva y el usuario recibe una notificación.
- Si la solicitud es rechazada, el usuario recibe un mensaje con el motivo del rechazo y puede modificar su solicitud.
- Si el validador no responde en un tiempo determinado, la solicitud puede escalar a otro responsable o ser reasignada.

#### Confirmación y finalización del proceso

- Una vez aprobada la reserva, el recurso queda bloqueado en el sistema para su uso exclusivo.
- Se genera un historial de validaciones, permitiendo a los administradores auditar los procesos de aprobación.

### Restricciones y Consideraciones

- **Reglas de aprobación personalizadas**  
  ○ Cada tipo de usuario debe seguir un flujo de validación adaptado a su perfil, por lo que el sistema debe permitir configuraciones flexibles.

- **Tiempo límite para validaciones**  
  ○ Se debe definir un tiempo máximo para que un aprobador responda antes de escalar la solicitud a otro nivel o enviar solicitud nuevamente.

- **Accesibilidad del historial de aprobaciones**  
  ○ Solo administradores y usuarios con permisos específicos deben poder consultar el historial de validaciones.

- **Casos de excepciones**  
  ○ Se debe definir cómo manejar reservas urgentes o excepcionales que requieran validación inmediata.

- **Roles dinámicos**  
  ○ Los validadores pueden cambiar según la estructura organizativa, por lo que el sistema debe permitir actualizar aprobadores sin afectar solicitudes en proceso.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe permitir la gestión simultánea de múltiples flujos de aprobación sin afectar el rendimiento.
- **Rendimiento**: La validación y notificación de solicitudes debe realizarse en tiempo real para no generar retrasos en la gestión de reservas.
- **Seguridad**: Solo usuarios con permisos adecuados deben poder modificar los flujos de aprobación o aprobar solicitudes.
- **Usabilidad**: La interfaz debe ser intuitiva, permitiendo a los usuarios ver claramente el estado de sus solicitudes y los pasos pendientes.
- **Disponibilidad**: La funcionalidad debe estar operativa 24/7 para permitir solicitudes y aprobaciones en cualquier momento.
