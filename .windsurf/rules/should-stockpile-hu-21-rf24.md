---
trigger: manual
---

### RF-24: Configuración de flujos de aprobación diferenciados según el tipo de usuario, que ayuda a adaptar el proceso a las necesidades de cada perfil

---

## HU-21: Configuración de Flujos de Aprobación Diferenciados

**Historia de Usuario**  
Como Administrador, quiero configurar diferentes flujos de aprobación según el tipo de usuario (estudiante, profesor, administrativo) para que cada solicitud de reserva se valide con los niveles y responsables adecuados, optimizando la eficiencia y el cumplimiento de las políticas institucionales.

### Criterios de Aceptación

- El sistema debe permitir definir y asignar flujos de aprobación diferenciados para cada tipo de usuario.
- Cada flujo debe incluir:
  - La cantidad de niveles de aprobación (por ejemplo, un estudiante requiere aprobación de un profesor y, en algunos casos, de un director).
  - El rol del aprobador en cada nivel (por ejemplo, profesor, director, ingeniero de soporte).
  - Un tiempo límite configurable para la respuesta de cada aprobador.
- El sistema debe enviar notificaciones automáticas al aprobador asignado cuando se active una solicitud.
- Si el aprobador no responde en el tiempo configurado, el sistema debe permitir la escalada o reasignación de la solicitud a otro responsable.
- El solicitante debe poder consultar el estado de su solicitud en tiempo real.
- Todas las configuraciones, acciones de aprobación, escaladas y notificaciones deben quedar registradas en el historial de auditoría.

---

## SubHU-21.1: Configuración de Flujos de Aprobación por Tipo de Usuario

**Historia de Usuario**  
Como Administrador, quiero configurar de forma diferenciada los flujos de aprobación para estudiantes, profesores y personal administrativo para que cada solicitud siga un proceso de validación acorde a las políticas y características de cada perfil.

### Criterios de Aceptación

- Se debe disponer de una interfaz para definir:
  - El número de niveles de aprobación para cada tipo de usuario.
  - El rol y responsable asignado en cada nivel (por ejemplo, profesor para estudiantes; director para docentes; aprobación directa para administrativos).
  - El tiempo límite para la respuesta en cada nivel.
- La configuración debe permitir editar, activar o desactivar flujos sin afectar solicitudes en curso.
- Los cambios en la configuración deben registrarse en el historial de auditoría (usuario, fecha, modificación).
- La interfaz debe ofrecer opciones para previsualizar y confirmar la configuración antes de guardarla.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Configuración de Flujos**
- Subtarea 1.1: Crear wireframes y mockups de la pantalla de configuración de flujos de aprobación.
- Subtarea 1.2: Incluir secciones diferenciadas para cada tipo de usuario (estudiante, profesor, administrativo).
- Subtarea 1.3: Validar el diseño con stakeholders y ajustar según retroalimentación.

**Tarea 2: Desarrollo del Endpoint para Configuración de Flujos**
- Subtarea 2.1: Definir el DTO que incluya número de niveles, roles de aprobadores y tiempos límite.
- Subtarea 2.2: Implementar la lógica en el servicio de configuración de aprobaciones.
- Subtarea 2.3: Integrar el endpoint con la base de datos utilizando Prisma y MongoDB.
- Subtarea 2.4: Incluir validaciones (por ejemplo, que los tiempos sean positivos, que se asigne al menos un aprobador por flujo).

**Tarea 3: Registro de Auditoría y Manejo de Errores**
- Subtarea 3.1: Configurar logging para registrar cada acción de configuración.
- Subtarea 3.2: Implementar manejo de excepciones para capturar errores y notificar al administrador.

**Tarea 4: Pruebas y Documentación**
- Subtarea 4.1: Desarrollar pruebas unitarias e integración en Jasmine (BDD: Given-When-Then).
- Subtarea 4.2: Documentar el proceso y la interfaz de configuración en la guía del usuario y la documentación técnica.
- Subtarea 4.3: Integrar el módulo en el pipeline de CI/CD.

---

## SubHU-21.2: Notificación y Escalado en Flujos de Aprobación

**Historia de Usuario**  
Como Administrador, quiero configurar notificaciones automáticas y reglas de escalado en los flujos de aprobación para que, en caso de no respuesta de un aprobador, la solicitud se reasigne o escale automáticamente, asegurando la continuidad del proceso de validación.

### Criterios de Aceptación

- El sistema debe enviar notificaciones automáticas al aprobador asignado cuando se active una solicitud.
- Si el aprobador no responde en el tiempo configurado, se debe notificar la necesidad de escalado o reasignación.
- La interfaz para escalado manual (si es necesario) debe permitir al administrador seleccionar otro responsable.
- El solicitante debe ser notificado de cualquier cambio en el flujo de aprobación (por ejemplo, reasignación a otro aprobador).
- Todas las notificaciones y escaladas deben quedar registradas en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño del Módulo de Notificaciones y Escalado**
- Subtarea 1.1: Crear wireframes y mockups de la interfaz de notificaciones para aprobadores y de escalado manual.
- Subtarea 1.2: Validar el diseño con stakeholders (administradores y responsables de validación).

**Tarea 2: Desarrollo del Módulo de Notificación**
- Subtarea 2.1: Definir el DTO para enviar notificaciones que incluya detalles de la solicitud y el tiempo límite.
- Subtarea 2.2: Integrar el módulo con un servicio de correo electrónico o de notificaciones (por ejemplo, SendGrid).
- Subtarea 2.3: Implementar la lógica para enviar notificaciones al aprobador al iniciar la solicitud.

**Tarea 3: Desarrollo de la Lógica de Escalado Automático**
- Subtarea 3.1: Implementar en el servicio de reservas la lógica para detectar falta de respuesta en el tiempo configurado.
- Subtarea 3.2: Configurar la reasignación automática o escalado a un nivel superior.
- Subtarea 3.3: Notificar al solicitante sobre el cambio en el flujo de aprobación.

**Tarea 4: Registro de Auditoría y Manejo de Excepciones**
- Subtarea 4.1: Configurar logging para registrar cada notificación y acción de escalado.
- Subtarea 4.2: Implementar manejo de excepciones y notificación de fallos en el proceso.

**Tarea 5: Pruebas y Documentación**
- Subtarea 5.1: Escribir pruebas unitarias e integración en Jasmine con escenarios Given-When-Then.
- Subtarea 5.2: Documentar el proceso de notificación y escalado en la guía del usuario y la documentación técnica.
- Subtarea 5.3: Integrar la funcionalidad en el pipeline de CI/CD.
