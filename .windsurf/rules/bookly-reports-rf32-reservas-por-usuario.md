---
trigger: manual
---

## RF-32: Reportes de cantidad de reservas realizadas por usuario o profesor

El sistema debe permitir la generación de reportes detallados sobre la cantidad de reservas realizadas por cada usuario o profesor dentro de un período de tiempo determinado.

Estos reportes deben proporcionar información clave, como:

- Número total de reservas realizadas por usuario.
- Frecuencia de reservas (diaria, semanal, mensual).
- Recursos más reservados por cada usuario o profesor.
- Porcentaje de reservas efectivamente utilizadas vs. canceladas.

El objetivo de esta funcionalidad es facilitar el análisis del uso de los recursos por parte de los usuarios, ayudando a los administradores a monitorear patrones de uso, detectar posibles abusos y optimizar la asignación de recursos dentro de la institución.

### Criterios de Aceptación

- El sistema debe permitir generar reportes filtrando por:
  - Usuario o profesor específico.
  - Período de tiempo (diario, semanal, mensual, semestral, anual).
  - Tipo de recurso reservado (salas, laboratorios, equipos, auditorios).
- Los reportes deben mostrar:
  - Cantidad total de reservas realizadas.
  - Porcentaje de reservas efectivas vs. canceladas.
  - Recursos más utilizados por cada usuario o profesor.
- El sistema debe permitir exportar los reportes en formato CSV.
- Los reportes deben poder visualizarse en gráficos estadísticos como barras, líneas y tablas dinámicas.
- Solo los administradores y usuarios con permisos adecuados deben poder acceder a esta información.
- Se debe mantener un historial de reportes generados, permitiendo la consulta y comparación de datos en diferentes períodos.
- El sistema debe permitir la programación de reportes automáticos para ser generados y enviados en intervalos predefinidos.

### Flujo de Uso

#### Acceso al módulo de reportes

- Un administrador accede al módulo **"Reportes de Reservas por Usuario/Profesor"**.
- Selecciona los filtros deseados:
  - Usuario o profesor específico (opcional).
  - Período de tiempo (ejemplo: último mes).
  - Tipo de recurso (salas, auditorios, equipos, etc.).

#### Generación del reporte

- El sistema procesa la solicitud y genera el reporte con los datos correspondientes.
- Se muestran gráficos visuales y tablas con el número de reservas por usuario, los recursos más usados y la frecuencia de uso.

#### Exportación y consulta del reporte

- El usuario puede descargar el reporte en CSV.
- Si es necesario, puede programar reportes automáticos que se generen y envíen periódicamente.
- El sistema almacena un historial de reportes generados para futuras consultas.

#### Análisis y toma de decisiones

- Los administradores pueden analizar patrones de uso y detectar usuarios con excesivas cancelaciones o un alto número de reservas.
- Si detectan uso ineficiente o abusivo, pueden ajustar políticas de reserva o establecer restricciones.

### Restricciones y Consideraciones

- **Acceso restringido**
  - Solo los administradores y usuarios autorizados deben poder consultar los reportes de reservas por usuario.
- **Carga de datos en tiempo real**
  - Si la base de datos contiene un alto volumen de reservas, se deben optimizar las consultas para evitar largos tiempos de espera.
- **Periodicidad de actualización**
  - Se debe seleccionar un período de tiempo que puede ser 5 segundos, 10 segundos, 30 segundos, 1 minuto, 5 minutos, 10 minutos, 30 minutos para actualizar los datos. Por defecto estará 30 minutos.
- **Tiempos de retención de datos**
  - Se debe definir un período de almacenamiento para los reportes generados, evitando acumulación innecesaria de archivos.
- **Segmentación de información**
  - Se debe garantizar que los reportes muestran información precisa, evitando errores en la asignación de reservas a los usuarios.
- **Configuración de reportes automáticos**
  - Se debe establecer una frecuencia de envío de reportes sin sobrecargar el sistema.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe permitir generar múltiples reportes simultáneamente sin afectar el rendimiento.
- **Seguridad**: Solo los usuarios con permisos adecuados deben poder acceder a estos reportes.
- **Usabilidad**: La interfaz debe ser intuitiva, permitiendo que los usuarios generen reportes sin necesidad de conocimientos técnicos.
- **Disponibilidad**: La funcionalidad debe estar operativa 24/7, permitiendo la consulta de reportes en cualquier momento.
