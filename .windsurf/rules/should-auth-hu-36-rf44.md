---
trigger: manual
---

### RF-44: Registro de accesos y actividades para auditoría, que aporta trazabilidad y seguridad

---

## HU-36: Registro de Accesos y Actividades para Auditoría

**Historia de Usuario**  
Como Administrador, quiero que el sistema registre de forma automática todos los accesos y actividades realizadas por los usuarios para asegurar la trazabilidad de las acciones, detectar posibles incidentes de seguridad y facilitar auditorías internas y externas.

### Criterios de Aceptación

- El sistema debe registrar cada inicio de sesión, cierre de sesión y acción relevante (creación, modificación, eliminación de datos, cambios de configuración, etc.).
- Cada registro debe incluir:
  - Identificación del usuario (ID, nombre, rol).
  - Fecha y hora exacta de la acción.
  - Tipo de acción realizada (login, logout, actualización, eliminación, etc.).
  - Dirección IP y, si es posible, información del dispositivo o navegador.
- Los registros deben ser inalterables y almacenarse de forma segura para garantizar su integridad.
- Se debe implementar una interfaz de consulta para que administradores autorizados puedan filtrar y visualizar los registros (por usuario, fecha, acción, etc.).
- La funcionalidad debe incluir la opción de exportar los registros en formato CSV para auditoría.
- La validación y registro de cada acción deben realizarse en menos de 2 segundos en condiciones normales.
- Toda acción de acceso y actividad debe quedar registrada en el historial de auditoría de la plataforma.

---

## SubHU-36.1: Registro Automático de Accesos y Actividades

**Historia de Usuario**  
Como Administrador, quiero que el sistema registre automáticamente todos los accesos y actividades críticas para disponer de un historial completo y confiable que sirva como evidencia en auditorías y para el análisis de incidentes.

### Criterios de Aceptación

- El sistema debe capturar y almacenar de manera automática cada inicio de sesión, cierre de sesión y acción relevante (por ejemplo, creación, edición o eliminación de recursos).
- Los registros deben incluir información detallada: usuario, rol, fecha, hora, tipo de acción, dirección IP y datos adicionales relevantes.
- Los registros deben almacenarse de forma segura (por ejemplo, en una base de datos de logs o mediante un servicio de logging centralizado).
- Se deben implementar validaciones que aseguren la integridad y consistencia de la información registrada.
- En caso de error en el registro, el sistema debe notificar al administrador y registrar la incidencia.
- La operación de registro no debe afectar significativamente el rendimiento del sistema (tiempo de registro < 2 segundos).

### Tareas y Subtareas

**Tarea 1: Diseño del Modelo de Datos para Auditoría**  
- Subtarea 1.1: Definir el esquema del log, incluyendo campos como ID de usuario, nombre, rol, fecha/hora, tipo de acción, IP y otros metadatos.  
- Subtarea 1.2: Validar el diseño del modelo con el equipo de seguridad y auditoría.

**Tarea 2: Desarrollo del Módulo de Registro Automático**  
- Subtarea 2.1: Implementar un interceptor/middleware en NestJS que capture todas las solicitudes y acciones relevantes.  
- Subtarea 2.2: Desarrollar la lógica para almacenar la información capturada en la base de datos (MongoDB mediante Prisma) o enviarla a un sistema de logging centralizado (por ejemplo, Winston integrado con OpenTelemetry y Sentry).  
- Subtarea 2.3: Incluir validaciones de datos antes de guardar cada registro.  
- Subtarea 2.4: Realizar pruebas unitarias para asegurar la correcta captura y almacenamiento de registros.

**Tarea 3: Manejo de Errores y Notificaciones**  
- Subtarea 3.1: Configurar manejo de excepciones para capturar errores en el proceso de registro.  
- Subtarea 3.2: Notificar a los administradores en caso de fallos críticos en el sistema de logging.

**Tarea 4: Pruebas y Documentación**  
- Subtarea 4.1: Desarrollar pruebas de integración utilizando Jasmine con escenarios Given-When-Then.  
- Subtarea 4.2: Documentar el modelo de datos, la implementación del middleware y el flujo de registro en la guía técnica.  
- Subtarea 4.3: Integrar el módulo de auditoría en el pipeline de CI/CD (GitHub Actions, SonarQube, Pulumi).

---

## SubHU-36.2: Consulta y Exportación del Historial de Auditoría

**Historia de Usuario**  
Como Administrador, quiero consultar y exportar el historial de accesos y actividades para auditar el uso del sistema, detectar posibles incidentes y cumplir con las normativas de seguridad institucional.

### Criterios de Aceptación

- La interfaz debe permitir visualizar una lista detallada de los registros de auditoría, con opciones de filtrado por usuario, fecha, tipo de acción, y dirección IP.
- Los administradores autorizados deben poder exportar los registros filtrados en formato CSV.
- La consulta debe responder en menos de 2 segundos en condiciones normales de carga.
- La interfaz debe ser responsiva y accesible tanto en dispositivos de escritorio como móviles.
- Todas las consultas y exportaciones deben quedar registradas en el historial de auditoría.
- Solo los usuarios con permisos adecuados pueden acceder a esta funcionalidad.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Consulta de Auditoría**  
- Subtarea 1.1: Crear wireframes y mockups de la pantalla de consulta de auditoría, incluyendo filtros y opciones de exportación.  
- Subtarea 1.2: Validar el diseño con administradores y el equipo de auditoría, ajustando según sea necesario.

**Tarea 2: Desarrollo del Endpoint de Consulta de Auditoría**  
- Subtarea 2.1: Definir el DTO para la consulta que incluya filtros por usuario, fecha, tipo de acción, etc.  
- Subtarea 2.2: Implementar la lógica en el servicio para recuperar y formatear los registros de auditoría desde la base de datos.  
- Subtarea 2.3: Optimizar la consulta para asegurar un tiempo de respuesta inferior a 2 segundos.

**Tarea 3: Desarrollo del Módulo de Exportación a CSV**  
- Subtarea 3.1: Implementar la lógica para generar un archivo CSV a partir de los datos filtrados.  
- Subtarea 3.2: Integrar la opción de exportación en la interfaz de consulta.  
- Subtarea 3.3: Validar el formato del CSV (encabezados, datos correctos).

**Tarea 4: Registro de Auditoría y Manejo de Errores**  
- Subtarea 4.1: Configurar logging para registrar cada acción de consulta y exportación.  
- Subtarea 4.2: Implementar manejo de excepciones para capturar y notificar errores en el proceso de consulta/exportación.

**Tarea 5: Pruebas y Documentación**  
- Subtarea 5.1: Desarrollar pruebas unitarias e integración utilizando Jasmine con escenarios BDD (Given-When-Then).  
- Subtarea 5.2: Documentar la funcionalidad de consulta y exportación en la guía del usuario y la documentación técnica.  
- Subtarea 5.3: Integrar la funcionalidad en el pipeline de CI/CD.
