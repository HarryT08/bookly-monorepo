---
trigger: manual
---

## RF-39: Reporte de cumplimiento de reservas

El sistema debe permitir el reporte del cumplimiento de reservas, comparando el número de reservas realizadas con aquellas que fueron efectivamente utilizadas por los usuarios.

Este registro debe proporcionar datos sobre:

- Cantidad de reservas programadas vs. reservas utilizadas.
- Usuarios con mayor y menor tasa de cumplimiento.
- Porcentaje de inasistencias por tipo de recurso, ubicación o período de tiempo.

El propósito de esta funcionalidad es mejorar la planificación de recursos, identificar patrones de inasistencia, evitar bloqueos innecesarios de espacios y optimizar la administración de reservas en la institución.

### Criterios de Aceptación

- El sistema debe registrar y comparar automáticamente:
  - Reservas realizadas.
  - Reservas efectivamente utilizadas (check-in/check-out registrado).
  - Reservas canceladas o no utilizadas (no-show).
- Se debe generar un informe de cumplimiento, filtrando por:
  - Usuario o programa académico.
  - Tipo de recurso (salas, auditorios, equipos tecnológicos).
  - Ubicación del recurso.
  - Período de tiempo (diario, semanal, mensual, semestral).
- Los administradores deben poder ver un historial de cumplimiento por usuario, permitiendo aplicar restricciones a quienes acumulen demasiadas inasistencias.
- Si un usuario no hace check-in dentro del tiempo límite, el sistema debe marcar la reserva como "no utilizada" y reflejarla en el registro de cumplimiento.
- Se debe permitir la exportación del informe en formatos CSV.
- El sistema debe generar alertas automáticas cuando la tasa de inasistencia supere un umbral crítico predefinido.
- Los usuarios deben poder visualizar su propio historial de cumplimiento en su perfil.

### Flujo de Uso

#### Registro de reservas y seguimiento

- Un usuario realiza una reserva en el sistema.
- La reserva queda registrada con el estado "Pendiente de uso" hasta que se realice el check-in.

#### Verificación del cumplimiento de la reserva

- Si el usuario hace check-in a tiempo, la reserva se marca como "Utilizada".
- Si el usuario no hace check-in dentro del tiempo límite, la reserva se marca automáticamente como "No utilizada".
- Si el usuario cancela con anticipación, la reserva se marca como "Cancelada" y no afecta su tasa de cumplimiento.

#### Generación del informe de cumplimiento

- Un administrador accede al módulo "Reporte de cumplimiento de Reservas" y filtra los datos por:
  - Rango de fechas.
  - Usuario o programa académico.
  - Tipo y ubicación del recurso.
- El sistema genera un reporte con gráficos y métricas, mostrando:
  - Porcentaje de cumplimiento general y por usuario.
  - Recursos con mayor y menor tasa de uso efectivo.
  - Usuarios con alta tasa de inasistencia.

#### Aplicación de medidas correctivas

- Si un usuario acumula un alto número de inasistencias, el administrador puede:
  - Aplicar restricciones en futuras reservas.
  - Solicitar justificación antes de aceptar nuevas reservas.
- Si un recurso tiene una alta tasa de no utilización, se pueden realizar ajustes en su disponibilidad o reasignación.

### Restricciones y Consideraciones

- **Registro basado en check-in/check-out**
  - Para contabilizar correctamente las reservas utilizadas, el sistema debe contar con un mecanismo de validación (código PIN, confirmación en la app).
- **Tiempos de tolerancia**
  - Se debe definir un tiempo límite de check-in antes de marcar una reserva como no utilizada.
- **Acceso a la información**
  - Solo los administradores deben poder ver el historial de cumplimiento de otros usuarios. Los usuarios solo podrán ver su propio historial.
- **Diferenciación entre inasistencias y cancelaciones**
  - Una reserva cancelada con antelación no debe contar como incumplida.
- **Configuración de umbrales de cumplimiento**
  - Se debe permitir definir cuántas inasistencias consecutivas generan una restricción o penalización.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe procesar grandes volúmenes de reservas sin afectar el rendimiento.
- **Seguridad**: La información de cumplimiento debe estar protegida y solo accesible para usuarios con permisos adecuados.
- **Usabilidad**: La interfaz debe ser intuitiva, con filtros de búsqueda y visualización de datos clara.
- **Disponibilidad**: La funcionalidad debe estar operativa 24/7, permitiendo la consulta de registros en cualquier momento.
