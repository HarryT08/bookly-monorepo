---
trigger: manual
---

### RF-36: Dashboards interactivos con estadísticas en tiempo real, que pueden implementarse en fases complementarias

---

## HU-31: Visualización de Dashboards Interactivos en Tiempo Real

**Historia de Usuario**  
Como Administrador, quiero visualizar dashboards interactivos con estadísticas en tiempo real para monitorear el uso de recursos y tomar decisiones basadas en datos actualizados, mejorando la eficiencia en la asignación y optimización de recursos.

### Criterios de Aceptación

- La pantalla de dashboards debe mostrar indicadores clave como número total de reservas, tasa de cancelación, utilización por recurso, distribución por programa académico y otros KPIs relevantes.
- Los datos deben actualizarse en tiempo real o con un intervalo configurado (por ejemplo, cada 30 segundos), con un tiempo de respuesta inferior a 2 segundos en condiciones normales.
- Se debe permitir aplicar filtros por fecha, tipo de recurso, programa académico y ubicación.
- La visualización debe incluir gráficos interactivos (barras, líneas, pastel) y tablas comparativas.
- La interfaz debe ser responsiva y funcionar en dispositivos móviles y de escritorio.
- Cada acción (aplicación de filtros, actualización de datos) debe quedar registrada en el historial de auditoría.

---

## SubHU-31.1: Visualización del Dashboard Interactivo

**Historia de Usuario**  
Como Administrador, quiero ver un dashboard interactivo que muestre estadísticas actualizadas en tiempo real para obtener una visión clara y dinámica del uso de recursos y detectar rápidamente áreas de mejora.

### Criterios de Aceptación

- La pantalla debe mostrar gráficos y tablas con indicadores clave (número total de reservas, uso por tipo de recurso, etc.).
- Se deben aplicar filtros dinámicos (por fecha, programa, recurso, ubicación) que actualicen la visualización de forma instantánea.
- La actualización de los datos debe ocurrir en tiempo real o con un intervalo configurado (ej. cada 30 segundos).
- La interfaz debe ser intuitiva, permitiendo al usuario interactuar con los gráficos (por ejemplo, haciendo clic para ver detalles).
- La generación de la visualización debe quedar registrada en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz del Dashboard**  
- Subtarea 1.1: Crear wireframes y mockups que muestren la disposición de gráficos, tablas e indicadores.  
- Subtarea 1.2: Validar el diseño con administradores y usuarios clave.  
- Subtarea 1.3: Definir la simbología visual (colores, íconos) para cada indicador.

**Tarea 2: Desarrollo del Componente de Visualización (Frontend)**  
- Subtarea 2.1: Seleccionar una librería de gráficos (por ejemplo, Chart.js, D3.js) adecuada para la representación interactiva.  
- Subtarea 2.2: Implementar el componente del dashboard integrando gráficos y tablas.  
- Subtarea 2.3: Programar la actualización dinámica de datos utilizando WebSockets o técnicas de polling.

**Tarea 3: Desarrollo del Endpoint de Consulta de Datos (Backend)**  
- Subtarea 3.1: Definir el DTO que reciba filtros (fecha, recurso, programa, ubicación).  
- Subtarea 3.2: Implementar la lógica en el servicio para recuperar estadísticas y datos relevantes de la base de datos (MongoDB con Prisma).  
- Subtarea 3.3: Optimizar la consulta para garantizar una respuesta en menos de 2 segundos.

**Tarea 4: Registro de Auditoría y Manejo de Excepciones**  
- Subtarea 4.1: Configurar logging para registrar cada consulta y actualización en el dashboard.  
- Subtarea 4.2: Implementar manejo de excepciones para notificar y registrar errores en la actualización de datos.

**Tarea 5: Pruebas y Documentación**  
- Subtarea 5.1: Desarrollar pruebas unitarias e integración utilizando Jasmine y escenarios BDD (Given-When-Then).  
- Subtarea 5.2: Documentar la funcionalidad del dashboard en la guía del usuario y en la documentación técnica.  
- Subtarea 5.3: Integrar la funcionalidad en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).

---

## SubHU-31.2: Configuración de Filtros y Exportación de Datos del Dashboard

**Historia de Usuario**  
Como Administrador, quiero configurar filtros avanzados y exportar los datos mostrados en el dashboard a formato CSV para realizar análisis externos y compartir información de forma sencilla.

### Criterios de Aceptación

- La interfaz debe permitir aplicar filtros (por fecha, programa académico, tipo de recurso, ubicación) que se reflejen en el dashboard.
- Se debe incluir un botón “Exportar a CSV” que genere un archivo con los datos filtrados del dashboard.
- El archivo CSV debe incluir encabezados y todos los datos relevantes (indicadores, resultados, etc.) en el formato correcto.
- La exportación debe completarse en menos de 2 segundos y permitir la descarga sin errores.
- La acción de exportación y cualquier cambio en los filtros debe quedar registrada en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño de la Funcionalidad de Filtros y Exportación**  
- Subtarea 1.1: Actualizar los wireframes del dashboard para incluir opciones de filtrado avanzado.  
- Subtarea 1.2: Diseñar la interfaz del botón “Exportar a CSV” y la presentación del archivo generado.  
- Subtarea 1.3: Validar el diseño con administradores y usuarios clave.

**Tarea 2: Desarrollo del Módulo de Filtrado (Backend y Frontend)**  
- Subtarea 2.1: Ampliar el DTO y la lógica del endpoint de consulta para aceptar filtros adicionales.  
- Subtarea 2.2: Imp
