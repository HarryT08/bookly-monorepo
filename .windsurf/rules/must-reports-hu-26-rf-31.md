---
trigger: manual
---

### RF-31: Generación de reportes sobre la utilización de recursos (por programa académico, período y tipo de recurso), crucial para la toma de decisiones

---

## HU-26: Generación de Reportes sobre la Utilización de Recursos

**Historia de Usuario**  
Como Administrador, quiero generar reportes que muestren la utilización de recursos filtrados por programa académico, período de tiempo y tipo de recurso para analizar el uso de los espacios y tomar decisiones informadas que optimicen la asignación de recursos.

### Criterios de Aceptación

- Se debe permitir aplicar filtros sobre:
  - Programa académico.
  - Período de tiempo (rango de fechas).
  - Tipo de recurso (salón, laboratorio, auditorio, equipo, etc.).
- El reporte debe incluir, al menos, los siguientes datos:
  - Número total de reservas.
  - Promedio de utilización.
  - Recursos con mayor y menor demanda.
  - Porcentaje de uso por programa académico.
- La generación del reporte debe completarse en menos de 2 segundos en condiciones normales.
- El reporte debe visualizarse de forma interactiva (tablas y gráficos) y permitir la actualización dinámica al modificar filtros.
- Se debe permitir exportar el reporte en formato CSV.
- Toda acción de generación y exportación del reporte debe quedar registrada en el historial de auditoría.

---

## SubHU-26.1: Reporte Interactivo de Utilización de Recursos

**Historia de Usuario**  
Como Administrador, quiero visualizar un reporte interactivo en la plataforma que muestre estadísticas de utilización de recursos según programa, período y tipo para identificar patrones de uso y optimizar la planificación y asignación de recursos.

### Criterios de Aceptación

- La interfaz debe permitir aplicar filtros por programa académico, período y tipo de recurso.
- El reporte interactivo debe mostrar gráficos (barras, líneas) y tablas con los datos relevantes.
- La actualización de los datos al aplicar o modificar filtros debe realizarse en tiempo real (o mediante acción de “Buscar”) en menos de 2 segundos.
- La visualización debe ser responsiva y fácil de interpretar.
- La generación del reporte debe quedar registrada en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Reporte Interactivo**
- Subtarea 1.1: Crear wireframes y mockups del formulario de búsqueda y visualización interactiva.
- Subtarea 1.2: Definir la disposición de filtros y la representación gráfica de los datos.
- Subtarea 1.3: Validar el diseño con administradores y usuarios clave.

**Tarea 2: Desarrollo del Endpoint de Consulta de Reporte**
- Subtarea 2.1: Definir el DTO que reciba los filtros (programa, período, tipo de recurso).
- Subtarea 2.2: Implementar la lógica en el servicio para recuperar y procesar los datos de reservas.
- Subtarea 2.3: Optimizar la consulta para asegurar un tiempo de respuesta inferior a 2 segundos.
- Subtarea 2.4: Integrar el endpoint con la base de datos usando Prisma y MongoDB.

**Tarea 3: Desarrollo del Componente de Visualización Interactiva**
- Subtarea 3.1: Seleccionar o desarrollar componentes gráficos (por ejemplo, usando Chart.js o D3.js).
- Subtarea 3.2: Integrar los componentes gráficos con el endpoint de consulta.
- Subtarea 3.3: Implementar la actualización dinámica de datos al modificar los filtros.

**Tarea 4: Registro de Auditoría y Manejo de Excepciones**
- Subtarea 4.1: Configurar logging para registrar cada generación y actualización del reporte.
- Subtarea 4.2: Implementar manejo de excepciones para capturar y notificar errores en la generación del reporte.

**Tarea 5: Pruebas y Documentación**
- Subtarea 5.1: Desarrollar pruebas unitarias e integración utilizando Jasmine y escenarios BDD (Given-When-Then).
- Subtarea 5.2: Documentar la funcionalidad en la guía del usuario y la documentación técnica.
- Subtarea 5.3: Integrar la funcionalidad en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).

---

## SubHU-26.2: Exportación de Reporte a CSV

**Historia de Usuario**  
Como Administrador, quiero exportar el reporte generado en formato CSV para poder compartir y analizar los datos en herramientas externas y facilitar la toma de decisiones.

### Criterios de Aceptación

- El sistema debe ofrecer un botón o acción de “Exportar a CSV” en la vista del reporte interactivo.
- El archivo CSV debe incluir todos los datos mostrados en el reporte (número total de reservas, promedio de utilización, etc.) y respetar el formato correcto.
- La exportación debe completarse en menos de 2 segundos en condiciones normales.
- La acción de exportación debe quedar registrada en el historial de auditoría.
- El usuario debe poder descargar el archivo CSV y, si es necesario, reintentar la exportación en caso de error.

### Tareas y Subtareas

**Tarea 1: Desarrollo del Endpoint de Exportación**
- Subtarea 1.1: Definir el DTO para la exportación que incluya los filtros aplicados.
- Subtarea 1.2: Implementar la lógica en el servicio para generar el archivo CSV a partir de los datos del reporte.
- Subtarea 1.3: Validar la integridad y formato del CSV generado.

**Tarea 2: Integración en la Interfaz de Usuario**
- Subtarea 2.1: Añadir un botón “Exportar a CSV” en la vista del reporte interactivo.
- Subtarea 2.2: Conectar el botón con el endpoint de exportación para iniciar la descarga.

**Tarea 3: Registro de Auditoría y Manejo de Excepciones**
- Subtarea 3.1: Configurar logging para registrar la acción de exportación.
- Subtarea 3.2: Implementar manejo de excepciones para capturar errores durante la generación o descarga del CSV.

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Desarrollar pruebas unitarias e integración utilizando Jasmine y escenarios BDD (Given-When-Then) para la exportación.
- Subtarea 4.2: Documentar la funcionalidad de exportación en la guía del usuario y la documentación técnica.
- Subtarea 4.3: Integrar la funcionalidad en el pipeline de CI/CD.
