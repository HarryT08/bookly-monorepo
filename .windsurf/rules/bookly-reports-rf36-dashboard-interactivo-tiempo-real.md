---
trigger: manual
---

## RF-36: Dashboards interactivos con estadísticas en tiempo real sobre disponibilidad y ocupación

El sistema debe proporcionar dashboards interactivos que muestran estadísticas en tiempo real sobre la disponibilidad y ocupación de los recursos.

Estos dashboards deben ofrecer una visualización clara y dinámica del estado de los recursos, permitiendo a los administradores y usuarios con permisos monitorear:

- Recursos ocupados vs. disponibles en tiempo real.
- Capacidad de cada recurso y su nivel de utilización.
- Historial de uso de los recursos en diferentes períodos de tiempo.

El objetivo de esta funcionalidad es proporcionar información visual y en tiempo real que facilite la toma de decisiones estratégicas sobre la gestión y asignación de recursos, optimizando su uso y disponibilidad.

### Criterios de Aceptación

- El sistema debe mostrar un dashboard interactivo con:
  - Estado actual de los recursos (disponibles, ocupados, bloqueados, en mantenimiento).
  - Gráficos dinámicos de ocupación por período de tiempo.
  - Filtros personalizables (por tipo de recurso, ubicación, programa académico, fecha).
- La información debe actualizarse en tiempo real, reflejando cambios de estado de los recursos de manera inmediata.
- Los usuarios deben poder interactuar con los gráficos, seleccionando períodos específicos o comparando datos históricos.
- Se debe permitir la exportación de datos en formato CSV.
- Los administradores deben poder configurar alertas cuando un recurso alcance un umbral crítico de ocupación o disponibilidad.
- El sistema debe incluir una sección de reportes automáticos, permitiendo que ciertos análisis se generen y envíen periódicamente a usuarios específicos.

### Flujo de Uso

#### Acceso al dashboard

- Un usuario con permisos accede a la sección "Monitoreo de Recursos".
- Visualiza un resumen general del estado de los recursos en un panel principal.

#### Configuración de visualización

- El usuario aplica filtros para visualizar información específica, como:
  - Fecha o período de análisis (día, semana, mes, año).
  - Tipo de recurso (salas, auditorios, laboratorios, equipos tecnológicos).
  - Ubicación de los recursos.
  - Tasa de ocupación por programa académico.

#### Análisis y toma de decisiones

- El usuario analiza los gráficos y detecta patrones de uso.
- Puede generar y descargar un reporte detallado de la ocupación y disponibilidad de los recursos.
- Si un recurso está constantemente saturado, se pueden tomar decisiones para aumentar su disponibilidad o redistribuir reservas.
- Si un recurso está infrautilizado, los administradores pueden ajustar su asignación o promoción.

#### Configuración de alertas y reportes automáticos

- Los administradores pueden configurar notificaciones automáticas cuando un recurso:
  - Alcance su capacidad máxima de reservas en un período determinado.
  - Tenga baja utilización, indicando posibles ajustes en su disponibilidad.
- Pueden programar reportes que se envíen automáticamente a ciertos usuarios en intervalos definidos (ejemplo: reporte semanal de ocupación de salas).

### Restricciones y Consideraciones

- **Acceso restringido**
  - Solo administradores y usuarios con permisos específicos deben poder visualizar datos completos de ocupación y disponibilidad.
- **Carga en tiempo real**
  - Se debe garantizar que el sistema actualice los datos sin afectar la velocidad de respuesta.
- **Periodicidad de actualización**
  - Se debe seleccionar un período de tiempo que puede ser 5 segundos, 10 segundos, 30 segundos, 1 minuto, 5 minutos, 10 minutos, 30 minutos para actualizar los datos. Por defecto estará 30 minutos.
- **Compatibilidad con dispositivos**
  - El dashboard debe ser accesible desde dispositivos móviles y computadoras, asegurando una experiencia responsiva.
- **Manejo de alertas**
  - Se deben establecer límites para evitar el envío excesivo de notificaciones cuando los recursos lleguen a su ocupación máxima.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe poder procesar grandes volúmenes de datos sin afectar el rendimiento.
- **Rendimiento**: Los datos deben actualizarse en tiempo real sin retrasos perceptibles.
- **Seguridad**: La información de ocupación debe estar protegida contra accesos no autorizados.
- **Usabilidad**: La interfaz debe ser intuitiva, con gráficos interactivos fáciles de interpretar.
- **Disponibilidad**: La funcionalidad debe estar operativa 24/7, permitiendo monitoreo en cualquier momento.
