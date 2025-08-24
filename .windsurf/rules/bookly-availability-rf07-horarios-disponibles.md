---
trigger: manual
---

## RF-07: Definir horarios disponibles para cada recurso con restricciones institucionales

El sistema debe permitir la configuración flexible y precisa de los horarios disponibles para cada recurso, asegurando su alineación con las normativas institucionales y evitando conflictos con otras actividades programadas. Esto incluye la gestión de franjas horarias, restricciones de uso, excepciones, bloqueos automáticos y reglas personalizadas para diferentes tipos de usuarios.

### Criterios de Aceptación

#### 1. Configuración de Horarios por Tipo de Recurso

1.1. Permitir la definición de horarios de disponibilidad personalizados para cada tipo de recurso (Ejemplo: auditorios disponibles de 8:00 a 18:00, laboratorios de 7:00 a 22:00).

1.2. Establecer franjas horarias recurrentes (Ejemplo: todos los lunes de 9:00 a 12:00).

1.3. Aplicar configuración de días festivos y períodos no lectivos, evitando reservas en fechas restringidas.

1.4. Implementar horarios diferenciados para periodos académicos (Ejemplo: un recurso puede estar disponible en el semestre 1 pero restringido en el semestre 2).

#### 2. Restricciones Institucionales y Normativas

2.1. Definir reglas institucionales sobre quién puede reservar ciertos recursos y en qué horarios (Ejemplo: salas de juntas solo accesibles para administrativos).

2.2. Permitir restricciones basadas en categoría de usuario (Ejemplo: los laboratorios de investigación solo pueden ser reservados por docentes e investigadores).

2.3. Aplicar prioridad de uso según tipo de actividad (Ejemplo: eventos académicos oficiales tienen prioridad sobre reuniones informales).

2.4. Integrar con el calendario académico institucional para bloquear automáticamente horarios de exámenes, conferencias u otros eventos.

#### 3. Gestión de Excepciones y Bloqueos Temporales

3.1. Permitir la creación de bloqueos temporales para mantenimiento, reparaciones o eventos especiales.

3.2. Configurar bloqueos recurrentes en días y horarios específicos (Ejemplo: todos los viernes de 14:00 a 16:00 por mantenimiento).

3.3. Opción para que los administradores puedan anular restricciones en casos excepcionales con justificación.

#### 4. Visualización y Consulta de Horarios Disponibles

4.1. Implementar una vista en formato calendario con los horarios de disponibilidad claramente representados.

4.2. Mostrar bloqueos y restricciones con indicadores visuales.

4.3. Permitir la consulta rápida de horarios disponibles mediante búsqueda por recurso, tipo, ubicación y usuario autorizado.

#### 5. Automatización y Notificaciones

5.1. Notificación automática a los usuarios cuando una disponibilidad cambia debido a bloqueos o restricciones.

5.2. Alertas para administradores cuando un recurso se está utilizando fuera de su horario permitido.

### Flujo de Uso

#### Configuración de Disponibilidad

- El administrador accede al módulo de horarios y restricciones.
- Define las franjas horarias de disponibilidad por tipo de recurso.
- Aplica restricciones según la normativa institucional.
- Guarda los cambios y el sistema los aplica automáticamente.

#### Validación en la Reserva

- Un usuario intenta reservar un recurso en una fecha y hora específica.
- El sistema valida si la solicitud cumple con los horarios disponibles y restricciones.
- Si la reserva no es válida, se muestra una notificación con las reglas aplicadas.
- Si cumple, la reserva es confirmada.

#### Modificación y Gestión de Restricciones

- El administrador revisa métricas de uso y ajusta restricciones si es necesario.
- Se generan reportes de disponibilidad para optimizar la asignación de horarios.

### Restricciones y Consideraciones

- Las reglas de disponibilidad deben ser configurables por tipo de recurso y usuario.
- Solo los administradores pueden modificar horarios y restricciones.
- Si una restricción afecta reservas activas, se debe notificar a los usuarios con antelación.
- Los bloqueos por eventos académicos deben sincronizarse automáticamente con el calendario institucional.

### Requerimientos No Funcionales Relacionados

- **Rendimiento:** La validación de disponibilidad debe realizarse en menos de **2 segundos**.
- **Seguridad:** Los cambios en horarios y restricciones deben registrarse en un historial de auditoría.
- **Escalabilidad:** Permitir la gestión de múltiples recursos con horarios complejos sin afectar el rendimiento del sistema.
- **Usabilidad:** Interfaz visual con **arrastrar y soltar en el calendario** para facilitar la configuración.
- **Notificaciones:** Alertas en tiempo real sobre cambios en disponibilidad.
