---
trigger: manual
---

## RF-17: Opción de configurar tiempos de preparación entre reservas

El sistema debe permitir la configuración de un tiempo de preparación entre reservas para garantizar la correcta disposición de los recursos antes de su próximo uso. Este tiempo puede ser utilizado para tareas como limpieza, configuración, mantenimiento o reorganización de equipos y espacios.  
El objetivo de esta funcionalidad es evitar solapamientos en las reservas, mejorar la eficiencia operativa y garantizar que los recursos estén listos para su siguiente uso. La configuración de estos intervalos debe ser flexible y administrable por los responsables del sistema, permitiendo definir distintos tiempos de preparación según el tipo de recurso y actividad.

### Criterios de Aceptación

- El sistema debe permitir establecer tiempos de preparación configurables por cada tipo de recurso y actividad.
- Al programar una reserva, el sistema debe calcular automáticamente el intervalo necesario entre la reserva actual y la siguiente, bloqueando ese período para evitar conflictos.
- La duración del tiempo de preparación debe ser configurable y asignable de manera individual para cada recurso, grupo de recursos o actividad.
- Si un usuario intenta reservar un recurso sin considerar el tiempo de preparación, el sistema debe ajustar automáticamente el horario disponible y mostrar una notificación.
- Los administradores deben poder modificar los tiempos de preparación sin afectar reservas ya confirmadas, excepto si es necesario aplicar cambios globales.
- La disponibilidad del recurso en la vista de calendario debe reflejar el tiempo de preparación, asegurando que los usuarios solo puedan reservar en horarios viables.
- Se debe registrar un historial de cambios en la configuración de tiempos de preparación para auditoría.

### Flujo de Uso

#### Configuración del tiempo de preparación

- El administrador accede a la configuración de recursos.
- Selecciona un recurso, grupo de recursos o actividad y define el tiempo de preparación requerido.
- Guarda los cambios y el sistema actualiza la disponibilidad de reservas en función de la nueva configuración.

#### Creación de una reserva por un usuario

- El usuario accede al sistema y selecciona un recurso disponible.
- Define la fecha y hora de la reserva dentro del calendario del sistema.
- El sistema valida la disponibilidad y agrega automáticamente el tiempo de preparación al finalizar la reserva.
- Si el horario solicitado entra en conflicto con otro debido al tiempo de preparación, el sistema ajusta la disponibilidad y notifica al usuario.
- El usuario confirma la reserva y recibe la notificación de “Pendiente de Asignación”.

#### Visualización en el calendario y ajuste de reservas

- Los tiempos de preparación se reflejan en la vista del calendario como períodos bloqueados.
- Si una reserva se cancela o modifica, el sistema ajusta dinámicamente el tiempo de preparación para evitar espacios innecesarios sin uso.
- Si el administrador reduce el tiempo de preparación, el sistema recalcula automáticamente la disponibilidad de los recursos.

### Restricciones y Consideraciones

- **Diferentes tiempos de preparación según el tipo de recurso o actividad:**
  - No todos los recursos o actividades requieren el mismo tiempo de preparación; por lo tanto, la configuración debe permitir variabilidad.

- **Impacto en la disponibilidad de reservas:**
  - Los tiempos de preparación pueden reducir la cantidad de reservas posibles en un día, por lo que se debe evaluar el impacto en la capacidad operativa.

- **Modificación de tiempos de preparación con reservas existentes:**
  - Se debe definir si los cambios en los tiempos de preparación afectan reservas ya confirmadas o solo nuevas reservas.

- **Manejo de eventos excepcionales:**
  - En caso de necesidad operativa, un administrador debe poder anular temporalmente el tiempo de preparación en casos específicos.

- **Compatibilidad con reservas periódicas:**
  - La funcionalidad debe asegurar que los tiempos de preparación no interfieran con reservas recurrentes o programadas con anticipación.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad:** El sistema debe permitir la gestión de múltiples configuraciones de tiempos de preparación sin afectar el rendimiento general.
- **Rendimiento:** Los cálculos de disponibilidad deben ejecutarse en tiempo real sin retrasos en la reserva.
- **Seguridad:** Solo administradores autorizados deben poder modificar los tiempos de preparación.
- **Usabilidad:** La interfaz debe ser intuitiva y mostrar claramente los intervalos bloqueados en la visualización de calendario.
- **Disponibilidad:** La funcionalidad debe garantizar un 99.9% de operatividad, asegurando la correcta programación de reservas sin interrupciones.
