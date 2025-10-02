---
trigger: manual
---

### RF-45: Verificación de identidad en solicitudes críticas mediante autenticación de doble factor, fortaleciendo la seguridad

---

## HU-37: Verificación de Identidad en Solicitudes Críticas mediante Doble Factor

**Historia de Usuario**  
Como Usuario con solicitudes críticas, quiero verificar mi identidad mediante autenticación de doble factor (2FA) para asegurar que solo personal autorizado realice operaciones sensibles y fortalecer la seguridad del sistema.

### Criterios de Aceptación

- La funcionalidad debe estar disponible para solicitudes consideradas críticas (definidas según reglas de negocio).
- Al activar una solicitud crítica, se debe solicitar una verificación 2FA adicional, mediante un código enviado a un canal configurado (SMS, correo electrónico o aplicación autenticadora).
- El usuario debe poder ingresar el código de 2FA en una interfaz segura.
- La verificación se considerará exitosa si el código ingresado es válido y se realiza dentro de un tiempo configurable (por ejemplo, 5 minutos).
- En caso de error (código inválido o vencido), el sistema mostrará un mensaje claro y permitirá reintentar la autenticación.
- Todas las acciones relacionadas (configuración de 2FA, intentos, verificaciones exitosas o fallidas) deben quedar registradas en el historial de auditoría.
- El tiempo de respuesta para la validación 2FA debe ser inferior a 2 segundos en condiciones normales.

---

## SubHU-37.1: Configuración y Activación de Autenticación de Doble Factor

**Historia de Usuario**  
Como Usuario, quiero configurar y activar la autenticación de doble factor (2FA) en mi cuenta para reforzar mi seguridad en el acceso a funciones críticas del sistema.

### Criterios de Aceptación

- La interfaz de usuario debe permitir activar o desactivar la opción de 2FA desde el perfil.
- Debe ofrecer opciones para seleccionar el canal de verificación (SMS, correo electrónico o aplicación autenticadora).
- El proceso de configuración debe incluir la verificación inicial del canal seleccionado (por ejemplo, enviar un código de verificación).
- Una vez activado, la cuenta debe estar marcada como "2FA activado" y mostrar información relevante (última verificación, método seleccionado).
- El proceso de configuración y activación debe completarse en menos de 2 segundos y quedar registrado en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Configuración 2FA**  
- Subtarea 1.1: Crear wireframes y mockups de la pantalla de configuración de 2FA en el perfil del usuario.  
- Subtarea 1.2: Incluir opciones de selección de canal (SMS, email, autenticador).  
- Subtarea 1.3: Validar el diseño con usuarios y stakeholders, ajustando según feedback.

**Tarea 2: Desarrollo del Endpoint de Configuración de 2FA**  
- Subtarea 2.1: Definir el DTO para activar/desactivar 2FA, incluyendo la selección del canal y datos de verificación.  
- Subtarea 2.2: Implementar la lógica en el servicio de autenticación en NestJS para almacenar la configuración en la base de datos (MongoDB con Prisma).  
- Subtarea 2.3: Integrar con el servicio de mensajería (SMS/Email) o con una API para aplicaciones autenticadoras para enviar un código de verificación inicial.  
- Subtarea 2.4: Registrar la acción de activación en el historial de auditoría.

**Tarea 3: Manejo de Excepciones y Validaciones**  
- Subtarea 3.1: Implementar validaciones que aseguren que el canal seleccionado esté disponible y funcione correctamente.  
- Subtarea 3.2: Desarrollar manejo de errores para notificar al usuario en caso de fallos en la configuración.

**Tarea 4: Pruebas y Documentación**  
- Subtarea 4.1: Escribir pruebas unitarias e integración con Jasmine (escenarios Given-When-Then) para el flujo de configuración de 2FA.  
- Subtarea 4.2: Documentar el proceso de activación de 2FA en la guía del usuario y en la documentación técnica.  
- Subtarea 4.3: Integrar la funcionalidad en el pipeline de CI/CD.

---

## SubHU-37.2: Verificación de Identidad en Solicitudes Críticas con 2FA

**Historia de Usuario**  
Como Usuario con solicitud crítica, quiero verificar mi identidad mediante un código 2FA al realizar una solicitud crítica para asegurar que solo yo, como titular de la cuenta, pueda autorizar acciones sensibles y reforzar la seguridad.

### Criterios de Aceptación

- Cuando un usuario realice una acción crítica, el sistema debe invocar automáticamente el flujo de verificación 2FA.
- Se enviará un código de verificación al canal configurado (SMS, email o autenticador).
- El usuario debe disponer de una interfaz segura para ingresar el código recibido.
- La verificación debe completarse en un tiempo configurable (por ejemplo, 5 minutos), y el sistema debe validar el código ingresado.
- Si la verificación es exitosa, la solicitud crítica se procesa; si falla, se permite reintentar o se cancela la acción, mostrando un mensaje de error claro.
- Todos los intentos, exitosos o fallidos, se registrarán en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño del Flujo de Verificación 2FA para Solicitudes Críticas**  
- Subtarea 1.1: Crear wireframes y mockups de la pantalla de ingreso del código de 2FA para acciones críticas.  
- Subtarea 1.2: Incluir mensajes de aviso sobre el tiempo límite y opciones de reintento.

**Tarea 2: Desarrollo del Middleware de Verificación 2FA**  
- Subtarea 2.1: Definir el DTO para el envío del código de verificación y su validación.  
- Subtarea 2.2: Implementar en el servicio de autenticación la lógica que, al detectar una acción crítica, envíe el código a través del canal configurado.  
- Subtarea 2.3: Desarrollar el middleware o guard en NestJS que intercepte la solicitud crítica y requiera la validación 2FA antes de proceder.  
- Subtarea 2.4: Integrar la verificación del código, comparando el valor ingresado con el generado y registrando el tiempo de respuesta.

**Tarea 3: Manejo de Excepciones y Notificaciones**  
- Subtarea 3.1: Implementar manejo de errores para notificar al usuario en caso de código incorrecto o expirado.  
- Subtarea 3.2: Registrar en el historial de auditoría todos los intentos de verificación (exitosos y fallidos).

**Tarea 4: Pruebas y Documentación**  
- Subtarea 4.1: Desarrollar pruebas unitarias e integración con Jasmine utilizando escenarios Given-When-Then para validar el flujo 2FA en solicitudes críticas.  
- Subtarea 4.2: Documentar el proceso de verificación 2FA en la guía del usuario y en la documentación técnica.  
- Subtarea 4.3: Integrar la funcionalidad en el pipeline de CI/CD.
