---
trigger: manual
---

## RF-05: Configuración de reglas de disponibilidad como tiempo mínimo/máximo de reserva, períodos bloqueados y prioridades de uso

El sistema debe permitir la configuración flexible de reglas de disponibilidad para cada recurso, garantizando que su uso se ajuste a las normativas institucionales y a las necesidades operativas. Esto incluye la gestión de tiempo mínimo y máximo de reserva, períodos bloqueados, prioridades de uso y excepciones, optimizando la asignación de los recursos y evitando conflictos.

### Criterios de Aceptación

- **Tiempo Mínimo y Máximo de Reserva**
  - Definir tiempo mínimo de uso para evitar reservas de poca duración (Ejemplo: mínimo 30 minutos).
  - Establecer un tiempo máximo de uso por sesión para evitar acaparamiento de recursos (Ejemplo: máximo 4 horas continuas).
  - Configurar tiempo de espera entre reservas para permitir preparación o limpieza del recurso (Ejemplo: 15 minutos entre reservas en auditorios).
  - Definir número máximo de reservas por usuario dentro de un período determinado (Ejemplo: máximo 5 reservas semanales).

- **Períodos Bloqueados y Restricciones de Uso**
  - Configurar bloqueos recurrentes en días u horarios específicos (Ejemplo: laboratorios cerrados los domingos).
  - Bloquear automáticamente recursos durante eventos académicos o administrativos (Ejemplo: auditorios reservados para exámenes finales).
  - Permitir bloqueos temporales por mantenimiento, averías o actividades institucionales especiales.
  - Integración con el calendario académico para aplicar bloqueos automáticos en fechas de suspensión de actividades.

- **Priorización de Uso**
  - Definir reglas de acceso preferencial según el perfil del usuario (Ejemplo: docentes y administrativos pueden reservar antes que estudiantes).
  - Configurar niveles de prioridad por tipo de reserva (Ejemplo: investigaciones tienen prioridad sobre actividades recreativas).
  - Permitir asignación automática de prioridad según la antigüedad de la solicitud o la importancia del evento.
  - Restringir el uso de ciertos recursos a grupos específicos (Ejemplo: equipos de laboratorio solo para estudiantes de Ingeniería).

- **Excepciones y Configuraciones Personalizadas**
  - Permitir flexibilizar reglas en casos especiales con aprobación administrativa.
  - Definir períodos de alta demanda con restricciones adicionales (Ejemplo: máximo 2 horas por reserva en época de exámenes).
  - Establecer reglas distintas para reservas individuales y grupales (Ejemplo: grupos pueden reservar por más tiempo).
  - Habilitar reservas periódicas bajo reglas establecidas (Ejemplo: una sala reservada todos los martes de 8 a 10 am por un semestre).

- **Notificaciones y Alertas**
  - Notificar a los usuarios cuando una reserva entra en conflicto con un período bloqueado o regla de prioridad.
  - Generar alertas automáticas para los administradores cuando un recurso alcanza su límite de reservas permitidas.
  - Avisar con anticipación sobre bloqueos programados (Ejemplo: “Este laboratorio estará en mantenimiento el próximo lunes”).

### Flujo de Uso

#### Configuración de Reglas

- El administrador accede al módulo de configuración de disponibilidad.
- Define tiempos mínimos y máximos de reserva.
- Configura períodos bloqueados y reglas de prioridad.
- Guarda las configuraciones y el sistema aplica las reglas de inmediato.

#### Gestión de Reservas con Validación de Reglas

- Un usuario intenta reservar un recurso.
- Se notifica al usuario que la solicitud se ha realizado.
- El sistema valida que la solicitud cumple con las reglas de disponibilidad.
- Si la reserva no cumple, muestra una alerta al administrador para que elija cómo proceder.
- Si cumple, se confirma la reserva y se notifica al usuario.

#### Modificación y Ajustes de Disponibilidad

- Un administrador revisa las métricas de uso del recurso.
- Si detecta problemas en las reglas de disponibilidad, ajusta las configuraciones.
- El sistema actualiza las reglas sin afectar reservas previas confirmadas.

### Restricciones y Consideraciones

- Las reglas deben ser configurables por tipo de recurso (Ejemplo: un auditorio tiene reglas distintas a un equipo de cómputo).
- Solo los administradores pueden modificar las reglas de disponibilidad.
- Los períodos bloqueados no pueden ser sobreescritos por reservas estándar.
- Si un usuario alcanza el límite de reservas permitidas, el sistema debe bloquear nuevas solicitudes.
- La modificación de reglas no debe afectar reservas ya confirmadas sin notificación previa.

### Requerimientos No Funcionales Relacionados

- **Eficiencia:** La validación de reglas debe realizarse en menos de **2 segundos** al momento de reservar.
- **Seguridad:** Solo administradores pueden modificar reglas, con historial de cambios registrado.
- **Usabilidad:** Las reglas deben mostrarse en una **interfaz visual clara y fácil de configurar**.
- **Escalabilidad:** Permitir la **adición de nuevas reglas en el futuro** sin afectar la estructura del sistema.
