---
trigger: manual
---

## RF-31: Generación de reportes sobre la utilización de recursos por programa académico, período de tiempo y tipo de recurso

El sistema debe permitir la generación de reportes detallados sobre la utilización de los recursos en función de diferentes criterios, como:

- **Programa académico**: Identificar qué programas utilizan más los recursos.
- **Materia**: Identificar qué materias utilizan más los recursos.
- **Período de tiempo**: Filtrar el uso de recursos en rangos de tiempo específicos (diario, semanal, mensual, semestral).
- **Tipo de recurso**: Analizar qué categorías de recursos (salas, equipos, laboratorios) tienen mayor demanda.

Estos reportes deben ofrecer estadísticas y visualizaciones (gráficos y tablas) para facilitar el análisis y la toma de decisiones sobre la gestión y optimización del uso de los recursos en la institución.

El propósito de esta funcionalidad es proporcionar información clave para la planificación académica y administrativa, ayudando a mejorar la eficiencia y disponibilidad de los recursos.

### Criterios de Aceptación

- El sistema debe permitir la generación de reportes personalizados basados en los siguientes filtros:
  - Programa académico
  - Materia
  - Período de tiempo (rango de fechas seleccionable)
  - Tipo de recurso (ejemplo: laboratorios, auditorios, equipos tecnológicos)
- Los reportes deben incluir:
  - Número total de reservas dentro del período seleccionado.
  - Promedio de utilización de los recursos.
  - Recursos con mayor y menor demanda.
  - Porcentaje de uso por programa académico.
- Los reportes deben poder ser exportados en formato CSV.
- El sistema debe permitir la visualización gráfica de los datos, utilizando gráficos de barras, líneas y tablas comparativas.
- Los usuarios con permisos adecuados deben poder agendar reportes automáticos para recibirlos periódicamente.
- Se debe mantener un historial de reportes generados, permitiendo la consulta y comparación de datos en diferentes períodos.

### Flujo de Uso

#### Acceso al módulo de reportes

- Un usuario con permisos administrativos accede al módulo de **"Generación de Reportes"**.
- Selecciona los criterios de filtrado:
  - Programa académico.
  - Materia
  - Período de tiempo.
  - Tipo de recurso.

#### Generación del reporte

- El sistema procesa la solicitud y genera un reporte con los datos solicitados.
- Se muestran gráficos estadísticos y tablas con información clave por día.

#### Exportación y consulta del reporte

- El usuario puede descargar el reporte en CSV.
- Si el usuario necesita un reporte recurrente, puede programarlo para recibirlo automáticamente por correo.
- El sistema almacena el historial de reportes generados para futuras consultas.

#### Análisis y toma de decisiones

- Los administradores y responsables de planificación académica pueden analizar los datos para mejorar la distribución y asignación de recursos.
- Si detectan baja utilización de ciertos recursos, pueden ajustar su disponibilidad o reubicar equipos según la demanda.

### Restricciones y Consideraciones

- **Acceso restringido**
  - Solo usuarios con permisos administrativos deben poder generar y consultar reportes.
- **Carga de datos en tiempo real**
  - Si la base de datos tiene un alto volumen de registros, se debe optimizar la consulta para evitar tiempos de espera largos.
- **Periodicidad de actualización**
  - Se debe seleccionar un período de tiempo que puede ser 5 segundos, 10 segundos, 30 segundos, 1 minuto, 5 minutos, 10 minutos, 30 minutos para actualizar los datos. Por defecto estará 30 minutos.
- **Retención de datos**
  - Solo se guardarán los reportes generados cuando el usuario lo solicite, de lo contrario no se almacenarán.
- **Diferencias en uso de recursos**
  - Algunos recursos pueden tener distintos niveles de disponibilidad y demanda según la temporada académica (ejemplo: laboratorios más usados en semanas de exámenes).
- **Configuración de reportes automáticos**
  - Se debe establecer una frecuencia de envío de reportes programados sin sobrecargar el sistema.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe soportar la generación simultánea de múltiples reportes sin afectar el rendimiento.
- **Seguridad**: Los reportes deben ser accesibles solo para usuarios autorizados, protegiendo la información sensible de los programas académicos.
- **Usabilidad**: La interfaz debe ser intuitiva, permitiendo que los usuarios generen reportes sin necesidad de conocimientos avanzados.
- **Disponibilidad**: La funcionalidad debe estar operativa 24/7, permitiendo la consulta de reportes en cualquier momento.
