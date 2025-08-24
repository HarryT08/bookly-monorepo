---
trigger: manual
---

## RF-06: Módulo de mantenimiento de recursos con registro de daños, mantenimientos programados y reportes de incidentes

El sistema debe contar con un módulo de mantenimiento de recursos que permita la gestión integral de incidentes, daños y mantenimientos programados, asegurando la disponibilidad y operatividad de los recursos universitarios. Este módulo debe incluir herramientas para el registro, seguimiento, notificación y resolución de problemas, permitiendo que los administradores optimicen el uso y vida útil de los activos.

### Criterios de Aceptación

#### Registro y Clasificación de Incidentes y Daños

- Permitir el registro de incidentes por parte de usuarios y administradores, indicando detalles como:
  - **Tipo de incidente** (Ejemplo: Falla técnica, daño estructural, equipo faltante).
  - **Nivel de criticidad** (Baja, Media, Alta).
  - **Ubicación y recurso afectado**.
  - **Evidencias** (Ejemplo: fotos, documentos).
  - Habilitar una interfaz para la consulta de incidentes activos, en revisión y resueltos.

#### Gestión de Mantenimientos Programados

- Permitir la programación de mantenimientos preventivos y correctivos con opciones de periodicidad (Ejemplo: semanal, mensual, trimestral).
- Bloquear automáticamente la disponibilidad de recursos que estén en mantenimiento.
- Notificar a los usuarios afectados por mantenimientos programados.
- Mantener un historial de mantenimientos con detalles de cada intervención.

#### Notificaciones y Alertas

- Notificación automática a los administradores cuando un recurso es reportado como dañado.
- Alertas para técnicos de mantenimiento sobre tareas pendientes.
- Aviso a los usuarios cuando un recurso vuelve a estar disponible.

#### Reportes y Auditoría

- Generación de reportes sobre:
  - Frecuencia y tipos de fallas.
  - Recursos con mayor índice de fallos.
  - Costos y tiempos de mantenimiento.
- Registro de auditoría de todas las acciones realizadas en el módulo.

### Flujo de Uso

#### Reporte del problema

- Un usuario reporta un daño desde la plataforma.
- El sistema notifica al administrador de mantenimiento.
- El recurso se marca como *"En revisión"* si la falla es crítica.

#### Evaluación y Asignación de Solución

- El administrador revisa el incidente y asigna un técnico o equipo de mantenimiento.
- Se genera un plan de acción con tiempo estimado de resolución.

#### Ejecución y Cierre del Incidente

- El problema es solucionado y el recurso se vuelve a activar.
- Se registra un informe con detalles de la intervención.

### Restricciones y Consideraciones

- Solo los administradores y técnicos pueden gestionar mantenimientos y cerrar incidentes.
- Los recursos en estado **“En Mantenimiento”** no deben estar disponibles para reservas.
- La información sobre fallas debe ser accesible solo para usuarios con permisos adecuados.

### Requerimientos No Funcionales Relacionados

- **Eficiencia:** La actualización del estado de un recurso debe procesarse en menos de **2 segundos**.
- **Seguridad:** Los datos sobre incidentes y mantenimientos deben estar protegidos.
- **Usabilidad:** La interfaz debe permitir un **flujo intuitivo de reporte y gestión**.
- **Escalabilidad:** Permitir la integración con **sensores IoT para detección automática de fallas**.
