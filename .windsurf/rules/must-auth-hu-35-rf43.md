---
trigger: manual
---

### RF-43: Implementación de autenticación y autorización mediante credenciales o SSO, asegurando un acceso controlado

---

## HU-35: Implementación de Autenticación y Autorización Segura

**Historia de Usuario**  
Como Usuario de la plataforma, quiero iniciar sesión mediante mis credenciales o a través de un sistema SSO para acceder de forma segura y centralizada a mis funciones sin tener que gestionar múltiples contraseñas, garantizando la integridad y confidencialidad de mi información.

### Criterios de Aceptación

- El sistema debe permitir la autenticación tradicional mediante usuario (correo electrónico o identificador) y contraseña.
- El sistema debe integrarse con un mecanismo de Single Sign-On (SSO) utilizando protocolos estándar (por ejemplo, OAuth2 o SAML) para usuarios universitarios.
- Tras la autenticación, se debe generar un token de acceso seguro (por ejemplo, JWT) con un tiempo de expiración configurable.
- El sistema debe validar y autorizar el acceso basándose en el token emitido, integrándose con el módulo de roles (RF-41).
- Se debe implementar un mecanismo de renovación y revocación de tokens.
- Los accesos, tanto exitosos como fallidos, deben registrarse en el historial de auditoría.
- La interfaz de inicio de sesión y SSO debe ser intuitiva y adaptable a dispositivos móviles y de escritorio.
- La respuesta del sistema (autenticación exitosa o error) debe ocurrir en menos de 2 segundos en condiciones normales de carga.

---

## SubHU-35.1: Autenticación Tradicional mediante Credenciales

**Historia de Usuario**  
Como Usuario, quiero iniciar sesión introduciendo mi usuario y contraseña para acceder al sistema de manera rápida y segura.

### Criterios de Aceptación

- La interfaz debe mostrar un formulario de login con campos para usuario (correo electrónico o ID) y contraseña.
- El sistema validará las credenciales contra la base de datos de usuarios.
- En caso de autenticación exitosa, se generará un token JWT y se redirigirá al usuario a la página principal.
- Si las credenciales son inválidas, se mostrará un mensaje de error claro y se registrará el intento fallido.
- Todas las acciones de login (éxito o error) se deben registrar en el historial de auditoría.

### Tareas y Subtareas

**Tarea 1: Diseño de la Interfaz de Login**  
- Subtarea 1.1: Crear wireframes y mockups del formulario de inicio de sesión.  
- Subtarea 1.2: Validar el diseño con usuarios y stakeholders.

**Tarea 2: Desarrollo del Endpoint de Autenticación**  
- Subtarea 2.1: Definir el DTO para el login (usuario y contraseña).  
- Subtarea 2.2: Implementar la lógica en el servicio de autenticación en NestJS, utilizando Passport.js (o similar) para validar credenciales.  
- Subtarea 2.3: Integrar con la base de datos de usuarios usando Prisma y MongoDB.  
- Subtarea 2.4: Generar y emitir un token JWT seguro tras la validación.

**Tarea 3: Registro de Auditoría y Manejo de Errores**  
- Subtarea 3.1: Configurar logging (ej., Winston) para registrar cada intento de login.  
- Subtarea 3.2: Implementar manejo de excepciones para capturar y reportar errores de autenticación.

**Tarea 4: Pruebas y Documentación**  
- Subtarea 4.1: Desarrollar pruebas unitarias e integración con Jasmine (escenarios Given-When-Then) para el flujo de login.  
- Subtarea 4.2: Documentar la funcionalidad en la guía del usuario y en la documentación técnica.  
- Subtarea 4.3: Incluir el módulo de autenticación en el pipeline de CI/CD.

---

## SubHU-35.2: Integración con SSO (Single Sign-On)

**Historia de Usuario**  
Como Usuario universitario, quiero iniciar sesión utilizando un sistema SSO para acceder a la plataforma sin tener que recordar credenciales adicionales, aprovechando la infraestructura de autenticación centralizada de la universidad.

### Criterios de Aceptación

- El sistema debe ofrecer una opción para iniciar sesión mediante SSO.
- La integración SSO debe utilizar protocolos estándar (por ejemplo, OAuth2 o SAML) y validar la identidad del usuario contra el proveedor institucional.
- Tras la autenticación SSO, el sistema debe mapear los datos del usuario al modelo interno y generar un token JWT.
- El flujo SSO debe ser transparente para el usuario y completar la autenticación en menos de 2 segundos.
- Los accesos mediante SSO deben quedar registrados en el historial de auditoría, incluyendo detalles del proveedor SSO.
- Se debe manejar correctamente cualquier error en la autenticación SSO, notificando al usuario y registrando la incidencia.

### Tareas y Subtareas

**Tarea 1: Investigación y Selección del Protocolo SSO**  
- Subtarea 1.1: Investigar las opciones de integración SSO (OAuth2, SAML) y seleccionar la que se ajuste a los requerimientos de la universidad.  
- Subtarea 1.2: Documentar las especificaciones y configuraciones necesarias.

**Tarea 2: Desarrollo del Módulo de Integración SSO en NestJS**  
- Subtarea 2.1: Configurar el módulo de autenticación en NestJS para soportar SSO (por ejemplo, utilizando Passport con estrategias SAML o OAuth2).  
- Subtarea 2.2: Implementar endpoints para redirección y callback del SSO.  
- Subtarea 2.3: Mapear la respuesta del proveedor SSO al modelo interno de usuario y generar un token JWT.

**Tarea 3: Registro de Auditoría y Manejo de Excepciones**  
- Subtarea 3.1: Configurar logging para registrar cada autenticación vía SSO, incluyendo información relevante del proveedor.  
- Subtarea 3.2: Implementar manejo de excepciones para capturar errores en el flujo SSO y notificar a los administradores.

**Tarea 4: Pruebas y Documentación**  
- Subtarea 4.1: Desarrollar pruebas unitarias e integración utilizando Jasmine con escenarios BDD (Given-When-Then) para el flujo SSO.  
- Subtarea 4.2: Documentar el proceso de integración SSO en la guía del usuario y la documentación técnica.  
- Subtarea 4.3: Integrar la funcionalidad SSO en el pipeline de CI/CD.
