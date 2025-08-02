---
trigger: manual
---

### RF-33: Posibilidad de exportar reportes en formato CSV, indispensable para el análisis externo

---

## HU-28: Exportación de Reportes en Formato CSV

**Historia de Usuario**  
Como Administrador, quiero exportar los reportes generados en formato CSV para analizar y compartir la información de uso de los recursos en herramientas externas, facilitando la toma de decisiones y el análisis de datos.

### Criterios de Aceptación

- El sistema debe ofrecer una opción clara (botón o enlace) en la interfaz de reportes para exportar el reporte actual a CSV.
- El archivo CSV debe incluir todos los campos y datos mostrados en el reporte (por ejemplo, número total de reservas, porcentajes, métricas de utilización, etc.).
- La exportación debe respetar los filtros aplicados (por programa académico, período de tiempo y tipo de recurso).
- El proceso de generación del archivo CSV debe completarse en menos de 2 segundos bajo condiciones normales de carga.
- El usuario debe poder descargar el archivo CSV sin errores.
- La acción de exportación debe registrarse en el historial de auditoría, indicando quién, cuándo y con qué filtros se realizó la exportación.

---

## SubHU-28.1: Desarrollo e Integración del Módulo de Exportación a CSV

**Historia de Usuario**  
Como Administrador, quiero que el sistema genere y me permita descargar el reporte en formato CSV para disponer de los datos en un formato fácilmente manipulable y compartible.

### Criterios de Aceptación

- El módulo debe recibir los filtros aplicados en la vista de reportes y generar un archivo CSV con los datos correspondientes.
- El archivo debe tener el formato correcto, incluyendo encabezados y filas con los datos, y respetar los formatos de fecha y numéricos.
- La generación del CSV se debe realizar automáticamente al hacer clic en “Exportar a CSV”.
- El sistema debe manejar errores en la generación o descarga y notificar al usuario en caso de fallo.
- La acción de exportación se debe registrar en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Exportación**
- Subtarea 1.1: Crear wireframes y mockups que muestren la opción “Exportar a CSV” en la vista de reportes.
- Subtarea 1.2: Validar el diseño con administradores y ajustar según retroalimentación.

**Tarea 2: Desarrollo del Endpoint de Exportación a CSV**
- Subtarea 2.1: Definir el DTO que incluya los filtros actuales (programa, período, tipo de recurso).
- Subtarea 2.2: Implementar la lógica en el servicio para extraer los datos filtrados desde la base de datos (usando Prisma y MongoDB).
- Subtarea 2.3: Utilizar una librería (por ejemplo, `json2csv` o similar) para transformar los datos en un archivo CSV.
- Subtarea 2.4: Implementar validaciones para asegurar la integridad de los datos exportados.

**Tarea 3: Integración en el Frontend**
- Subtarea 3.1: Añadir un botón “Exportar a CSV” en la interfaz de reportes.
- Subtarea 3.2: Conectar el botón con el endpoint de exportación para iniciar la descarga.
- Subtarea 3.3: Mostrar mensajes de éxito o error al usuario según corresponda.

**Tarea 4: Registro de Auditoría y Manejo de Excepciones**
- Subtarea 4.1: Configurar logging (por ejemplo, con Winston) para registrar cada exportación, incluyendo filtros aplicados y usuario.
- Subtarea 4.2: Implementar manejo de excepciones que capture y notifique errores durante la generación o descarga del CSV.

**Tarea 5: Pruebas y Documentación**
- Subtarea 5.1: Desarrollar pruebas unitarias e integración en Jasmine utilizando escenarios BDD (Given-When-Then) para el flujo de exportación.
- Subtarea 5.2: Documentar el proceso de exportación, incluyendo ejemplos de uso y formatos esperados, en la guía del usuario.
- Subtarea 5.3: Incluir esta funcionalidad en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).
