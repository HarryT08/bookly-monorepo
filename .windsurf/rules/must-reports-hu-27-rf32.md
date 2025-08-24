---
trigger: manual
---

### RF-32: Reportes de cantidad de reservas realizadas por usuario o profesor, para monitorear la actividad

---

## HU-27: Generación de Reportes de Reservas por Usuario o Profesor

**Historia de Usuario**  
Como Administrador, quiero generar reportes que muestren la cantidad de reservas realizadas por cada usuario o profesor para monitorear la actividad, detectar patrones de uso y optimizar la asignación de recursos.

### Criterios de Aceptación

- El sistema debe permitir aplicar filtros por:
  - Usuario o profesor.
  - Período de tiempo (rango de fechas).
  - Tipo de recurso (opcional).
- El reporte debe mostrar:
  - Número total de reservas realizadas.
  - Comparativa entre reservas confirmadas y canceladas.
  - Recursos más y menos reservados por cada usuario.
- La generación del reporte debe completarse en menos de 2 segundos en condiciones normales.
- La visualización debe ser interactiva (tablas y gráficos) y responsiva.
- Se debe permitir exportar el reporte en formato CSV.
- Todas las acciones de generación y exportación del reporte deben quedar registradas en el historial de auditoría.

---

## SubHU-27.1: Reporte Interactivo de Reservas por Usuario o Profesor

**Historia de Usuario**  
Como Administrador, quiero visualizar un reporte interactivo que detalle la cantidad de reservas realizadas por cada usuario o profesor para identificar tendencias y tomar decisiones informadas sobre la asignación de recursos.

### Criterios de Aceptación

- La interfaz debe permitir aplicar filtros por usuario/profesor, período de tiempo y, opcionalmente, tipo de recurso.
- El reporte interactivo debe mostrar:
  - Número total de reservas por usuario.
  - Porcentaje de reservas confirmadas y canceladas.
  - Gráficos y tablas que ilustren la distribución de reservas.
- Los resultados deben actualizarse en tiempo real o mediante acción de “Buscar” con un tiempo de respuesta inferior a 2 segundos.
- La acción de generación del reporte debe quedar registrada en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Reporte Interactivo**
- Subtarea 1.1: Crear wireframes y mockups de la pantalla de reporte interactivo, incluyendo filtros y representación gráfica (por ejemplo, gráficos de barras o líneas).
- Subtarea 1.2: Validar el diseño con administradores y ajustar según feedback.

**Tarea 2: Desarrollo del Endpoint de Consulta de Reporte**
- Subtarea 2.1: Definir el DTO que reciba los filtros (usuario/profesor, rango de fechas, tipo de recurso).
- Subtarea 2.2: Implementar la lógica en el servicio para recuperar y procesar los datos de reservas desde la base de datos.
- Subtarea 2.3: Optimizar la consulta para garantizar un tiempo de respuesta inferior a 2 segundos.
- Subtarea 2.4: Integrar el endpoint con la base de datos utilizando Prisma y MongoDB.

**Tarea 3: Desarrollo del Componente de Visualización Interactiva**
- Subtarea 3.1: Seleccionar o desarrollar componentes gráficos (por ejemplo, Chart.js o D3.js) para mostrar los datos.
- Subtarea 3.2: Integrar estos componentes con el endpoint de consulta para actualizar los datos en tiempo real.
- Subtarea 3.3: Implementar opciones de filtrado y ordenamiento en la interfaz.

**Tarea 4: Registro de Auditoría y Manejo de Excepciones**
- Subtarea 4.1: Configurar logging para registrar cada generación y actualización del reporte.
- Subtarea 4.2: Implementar manejo de excepciones para capturar errores en el flujo de consulta.

**Tarea 5: Pruebas y Documentación**
- Subtarea 5.1: Desarrollar pruebas unitarias e integración con Jasmine utilizando escenarios BDD (Given-When-Then).
- Subtarea 5.2: Documentar la funcionalidad en la guía del usuario y en la documentación técnica.
- Subtarea 5.3: Integrar la funcionalidad en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).

---

## SubHU-27.2: Exportación del Reporte a CSV

**Historia de Usuario**  
Como Administrador, quiero exportar el reporte interactivo de reservas a un archivo CSV para poder compartir y analizar los datos en herramientas externas y facilitar la toma de decisiones.

### Criterios de Aceptación

- La interfaz debe incluir un botón “Exportar a CSV” en la vista del reporte interactivo.
- El archivo CSV debe incluir todos los datos mostrados en el reporte, respetando el formato adecuado.
- La exportación debe completarse en menos de 2 segundos bajo condiciones normales.
- La acción de exportación debe quedar registrada en el historial de auditoría.
- El archivo CSV debe poder descargarse sin errores.

### Tareas y Subtareas

**Tarea 1: Desarrollo del Endpoint de Exportación a CSV**
- Subtarea 1.1: Definir el DTO para la exportación, que incluya los mismos filtros aplicados en la visualización del reporte.
- Subtarea 1.2: Implementar la lógica en el servicio para generar el archivo CSV a partir de los datos del reporte.
- Subtarea 1.3: Validar que el CSV contenga todos los campos requeridos y en el formato correcto.

**Tarea 2: Integración en la Interfaz de Usuario**
- Subtarea 2.1: Añadir el botón “Exportar a CSV” en la pantalla del reporte interactivo.
- Subtarea 2.2: Conectar el botón con el endpoint de exportación para iniciar la descarga.

**Tarea 3: Registro de Auditoría y Manejo de Excepciones**
- Subtarea 3.1: Configurar logging para registrar cada acción de exportación.
- Subtarea 3.2: Implementar manejo de excepciones para capturar errores durante la generación o descarga del CSV.

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Desarrollar pruebas unitarias e integración utilizando Jasmine y escenarios BDD (Given-When-Then) para el flujo de exportación.
- Subtarea 4.2: Documentar el proceso de exportación en la guía del usuario y la documentación técnica.
- Subtarea 4.3: Integrar la funcionalidad en el pipeline de CI/CD.
