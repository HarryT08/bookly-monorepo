---
trigger: manual
---

## RF-37: Reporte de demanda insatisfecha

El sistema debe generar un reporte de demanda insatisfecha, identificando solicitudes de reserva que fueron rechazadas o no pudieron ser atendidas debido a la falta de disponibilidad de recursos en determinadas fechas y horarios.

Este reporte permitirá a los administradores y planificadores analizar:

- Cantidad de solicitudes rechazadas por recurso, fecha y usuario.
- Motivos del rechazo (falta de disponibilidad, restricciones de acceso, mantenimiento, etc.).
- Recursos con mayor demanda no satisfecha.
- Fechas y horarios con mayor nivel de solicitudes sin atender.

El propósito de esta funcionalidad es proporcionar datos clave para mejorar la planificación de la capacidad de los recursos, optimizando su disponibilidad y reduciendo la cantidad de solicitudes rechazadas.

### Criterios de Aceptación

- El sistema debe permitir la generación de un reporte de demanda insatisfecha, filtrando por:
  - Rango de fechas (diario, semanal, mensual, semestral).
  - Tipo de recurso (salas, auditorios, laboratorios, equipos tecnológicos).
  - Motivo de rechazo (sin disponibilidad, mantenimiento, restricciones de acceso).
  - Usuario o programa académico que realizó la solicitud.
- El reporte debe mostrar:
  - Número total de solicitudes rechazadas o no atendidas.
  - Motivo principal del rechazo.
  - Recursos más demandados sin disponibilidad.
- El sistema debe permitir la visualización gráfica del reporte, con gráficos de barras, líneas y tablas de datos.
- Se debe poder exportar el reporte en formatos CSV.
- Los administradores deben poder configurar alertas cuando un recurso supere un umbral crítico de demanda insatisfecha.
- El sistema debe almacenar un historial de reportes generados, permitiendo su consulta posterior.

### Flujo de Uso

#### Acceso al módulo de reportes

- Un administrador accede a la sección "Reporte de Demanda Insatisfecha".
- Selecciona los filtros de consulta:
  - Rango de fechas.
  - Tipo de recurso.
  - Motivo de rechazo.
  - Usuario o programa académico.

#### Generación del reporte

- El sistema recopila la información y genera un reporte detallado con:
  - Cantidad de solicitudes rechazadas.
  - Recursos con mayor demanda no satisfecha.
  - Motivos principales de los rechazos.
- Se presentan gráficos interactivos con la distribución de datos.

#### Exportación y análisis del reporte

- El usuario puede descargar el reporte en CSV.
- Se pueden programar reportes automáticos que sean enviados a administradores en intervalos definidos.

#### Uso del reporte para toma de decisiones

- Los administradores analizan los datos y pueden tomar acciones como:
  - Aumentar la disponibilidad de ciertos recursos en horarios críticos.
  - Redistribuir horarios o agregar más unidades de recursos solicitados.
  - Ajustar políticas de reserva para mejorar la asignación de espacios y equipos.
- Se configuran alertas automáticas si un recurso supera un umbral de rechazo definido (ejemplo: más del 30% de solicitudes rechazadas en un mes).
