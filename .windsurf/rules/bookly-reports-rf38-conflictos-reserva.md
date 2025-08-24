---
trigger: manual
---

## RF-38: Reporte de conflictos de reservas

El sistema debe generar un reporte de conflictos de reservas que permita identificar los períodos con mayor saturación de recursos, facilitando la toma de decisiones para mejorar la planificación y optimización del uso de los espacios y equipos disponibles.

Este reporte debe incluir información sobre:

- Recursos con mayor cantidad de solicitudes simultáneas en el mismo horario.
- Períodos críticos de alta demanda en los que las reservas entran en conflicto.
- Usuarios y programas académicos con mayor incidencia de reservas en conflicto.
- Recursos con más problemas de sobreasignación.

El propósito de esta funcionalidad es proporcionar datos que permitan a los administradores ajustar la disponibilidad de recursos, reorganizar horarios y minimizar la cantidad de reservas rechazadas debido a saturación.

### Criterios de Aceptación

- El sistema debe permitir la generación de reportes de conflictos de reservas con los siguientes filtros:
  - Rango de fechas (diario, semanal, mensual, semestral).
  - Tipo de recurso (salas, auditorios, laboratorios, equipos tecnológicos).
  - Ubicación del recurso.
- Usuarios y programas académicos con mayor cantidad de reservas en conflicto.
- El reporte debe mostrar:
  - Cantidad total de conflictos de reservas por recurso.
  - Períodos críticos con más conflictos de horarios.
- La información debe visualizarse en gráficos interactivos y tablas dinámicas.
- Se debe permitir la exportación del reporte en formatos CSV.
- Los administradores deben poder programar reportes automáticos para su análisis periódico.
- Si un recurso supera un umbral crítico de conflictos, el sistema debe generar alertas automáticas recomendando ajustes en su disponibilidad.

### Flujo de Uso

#### Acceso al módulo de reportes

- Un administrador accede a la sección "Reporte de Conflictos de Reservas".
- Selecciona los filtros de consulta:
  - Rango de fechas.
  - Tipo y ubicación del recurso.
  - Usuarios y programas académicos con más reservas en conflicto.

#### Generación del reporte

- El sistema recopila la información y genera un reporte detallado, incluyendo:
  - Cantidad total de reservas en conflicto.
  - Recursos con mayor cantidad de problemas de disponibilidad.
  - Períodos de mayor saturación de reservas.
- Se presentan gráficos interactivos y tablas con los datos procesados.

#### Análisis del reporte y toma de decisiones

- Los administradores revisan los datos y determinan ajustes en los horarios o capacidad de los recursos.
- Si un recurso tiene una alta cantidad de conflictos, pueden:
  - Ajustar su disponibilidad para atender la demanda.
  - Habilitar recursos alternativos en los horarios con mayor saturación.
  - Reorganizar la asignación de espacios y equipos.

#### Exportación y seguimiento del reporte

- El usuario puede descargar el reporte en CSV.
- Si es necesario, puede programar reportes automáticos para monitoreo continuo.
- Se mantiene un historial de reportes generados, permitiendo comparar datos en distintos períodos de tiempo.

### Restricciones y Consideraciones

- Acceso restringido
  - Solo los administradores deben poder generar y visualizar este reporte.
- Carga de datos en tiempo real
  - Se debe garantizar tiempos de respuesta rápidos, especialmente en períodos con alta concurrencia de reservas.
- Periodicidad de actualización
  - Se debe seleccionar un período de tiempo que puede ser 5 segundos, 10 segundos, 30 segundos, 1 minuto, 5 minutos, 10 minutos, 30 minutos para actualizar los datos. Por defecto estará 30 minutos.
- Diferencias en la demanda de recursos
  - Algunos recursos pueden ser más solicitados en ciertas épocas del año, lo que debe considerarse en el análisis.
- Frecuencia de generación del reporte
  - Se debe definir si los reportes se generan manualmente bajo demanda o de forma automática en intervalos predefinidos.
- Manejo de umbrales críticos
  - Se deben establecer valores para definir cuándo un recurso está saturado y cuándo se requiere una intervención administrativa.

### Requerimientos No Funcionales Relacionados

- Escalabilidad: El sistema debe poder procesar grandes volúmenes de datos sin afectar el rendimiento.
- Seguridad: La información sobre conflictos de reservas debe estar protegida y solo ser accesible para usuarios con permisos administrativos.
- Usabilidad: La interfaz del reporte debe ser intuitiva, con gráficos interactivos fáciles de interpretar.
- Disponibilidad: La funcionalidad debe estar operativa 24/7, permitiendo la consulta de reportes en cualquier momento.
