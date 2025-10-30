---
trigger: manual
---

### RF-35: Evaluación de usuarios por parte del personal administrativo, para incentivar el uso responsable

---

## HU-30: Evaluación de Usuarios por el Personal Administrativo

**Historia de Usuario**  
Como Personal Administrativo, quiero evaluar el desempeño y comportamiento de los usuarios en el uso de los recursos para identificar oportunidades de mejora, fomentar un uso responsable y optimizar la asignación de los recursos institucionales.

### Criterios de Aceptación

- Se debe disponer de un formulario de evaluación accesible para el personal administrativo.  
- El formulario incluirá campos para puntuar aspectos clave (por ejemplo, puntualidad, cumplimiento de reservas, incidencias reportadas, etc.) con un rango numérico definido (por ejemplo, 1 a 5).  
- Se debe permitir agregar comentarios adicionales para justificar o complementar la evaluación.  
- Al enviar la evaluación, el sistema debe asociar la evaluación al usuario evaluado y registrar la fecha de la evaluación.  
- Los resultados de la evaluación (puntaje y comentarios) deben almacenarse de forma inalterable en la base de datos.  
- La evaluación registrada debe actualizar un indicador o score que permita comparar el uso responsable entre usuarios.  
- Se debe notificar al evaluador la confirmación del registro y registrar la acción en el historial de auditoría.  
- La funcionalidad debe integrarse con el módulo de reservas para vincular evaluaciones con incidencias o patrones de uso.

---

## SubHU-30.1: Registro de Evaluación de Usuarios

**Historia de Usuario**  
Como Personal Administrativo, quiero registrar evaluaciones de los usuarios mediante un formulario estructurado para documentar su comportamiento en el uso de los recursos y disponer de información para tomar decisiones correctivas.

### Criterios de Aceptación

- El formulario debe permitir ingresar:  
  - Un puntaje numérico (rango 1-5) para cada criterio evaluado.  
  - Comentarios adicionales (opcional o obligatorio, según configuración).  
- La fecha de evaluación se registrará automáticamente.  
- El sistema validará que los puntajes ingresados estén dentro del rango permitido.  
- La evaluación se asociará al perfil del usuario evaluado.  
- Al enviar el formulario, se mostrará un mensaje de confirmación de registro.  
- La acción de registro se documentará en el historial de auditoría con la identificación del evaluador, fecha y detalles de la evaluación.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Evaluación**  
- Subtarea 1.1: Crear wireframes y mockups del formulario de evaluación que incluya campos para puntaje y comentarios.  
- Subtarea 1.2: Validar el diseño con el personal administrativo y ajustar según feedback.  

**Tarea 2: Desarrollo del Endpoint de Registro de Evaluaciones en NestJS**  
- Subtarea 2.1: Definir el DTO para la evaluación (incluyendo puntajes, comentarios y datos del usuario).  
- Subtarea 2.2: Implementar la lógica en el servicio para almacenar la evaluación en la base de datos (MongoDB mediante Prisma).  
- Subtarea 2.3: Incluir validaciones para asegurar que los puntajes se encuentren dentro del rango 1-5.  

**Tarea 3: Registro de Auditoría y Manejo de Errores**  
- Subtarea 3.1: Configurar logging (por ejemplo, utilizando Winston) para registrar la acción de evaluación.  
- Subtarea 3.2: Implementar manejo de excepciones para notificar errores en el proceso de registro.  

**Tarea 4: Pruebas y Documentación**  
- Subtarea 4.1: Desarrollar pruebas unitarias e integración con Jasmine, utilizando escenarios BDD (Given-When-Then).  
- Subtarea 4.2: Documentar la funcionalidad en la guía del usuario y la documentación técnica.  
- Subtarea 4.3: Integrar el módulo en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).

---

## SubHU-30.2: Consulta y Análisis de Evaluaciones

**Historia de Usuario**  
Como Personal Administrativo, quiero consultar y analizar las evaluaciones de los usuarios para identificar patrones de uso responsable o inadecuado y tomar acciones correctivas que optimicen la asignación de los recursos.

### Criterios de Aceptación

- La interfaz debe permitir visualizar un historial de evaluaciones que incluya:  
  - Datos del usuario evaluado.  
  - Puntajes y comentarios de cada evaluación.  
  - Fecha de cada evaluación.  
- Se deben ofrecer filtros por usuario, fecha y rango de puntajes.  
- La consulta debe responder en menos de 2 segundos en condiciones normales.  
- Se debe permitir exportar el historial de evaluaciones en formato CSV.  
- Toda acción de consulta y exportación debe quedar registrada en el historial de auditoría.  
- El acceso a esta información debe estar restringido a personal autorizado.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Consulta de Evaluaciones**  
- Subtarea 1.1: Crear wireframes y mockups para la pantalla de consulta, incluyendo filtros y opción de exportación.  
- Subtarea 1.2: Validar el diseño con administradores y el equipo de análisis.  

**Tarea 2: Desarrollo del Endpoint de Consulta de Evaluaciones en NestJS**  
- Subtarea 2.1: Definir el DTO para la consulta (incluyendo filtros por usuario, fecha y puntaje).  
- Subtarea 2.2: Implementar la lógica en el servicio para recuperar y formatear las evaluaciones.  
- Subtarea 2.3: Optimizar la consulta para asegurar un tiempo de respuesta inferior a 2 segundos.  
- Subtarea 2.4: Integrar el endpoint con la base de datos utilizando Prisma y MongoDB.  

**Tarea 3: Desarrollo del Módulo de Exportación a CSV para Evaluaciones**  
- Subtarea 3.1: Implementar la lógica para generar un archivo CSV con los datos filtrados.  
- Subtarea 3.2: Integrar la opción de exportación en la interfaz.  

**Tarea 4: Registro de Auditoría y Manejo de Excepciones**  
- Subtarea 4.1: Configurar logging para registrar cada acción de consulta y exportación.  
- Subtarea 4.2: Implementar manejo de errores para capturar y notificar incidencias en la consulta.  

**Tarea 5: Pruebas y Documentación**  
- Subtarea 5.1: Desarrollar pruebas unitarias e integración utilizando Jasmine con escenarios BDD (Given-When-Then).  
- Subtarea 5.2: Documentar el proceso de consulta y exportación en la guía del usuario.  
- Subtarea 5.3: Integrar la funcionalidad en el pipeline de CI/CD.
