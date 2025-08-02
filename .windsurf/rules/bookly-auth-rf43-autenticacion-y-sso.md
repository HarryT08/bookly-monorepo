---
trigger: manual
---

## RF-43: Implementación de autenticación y autorización mediante credenciales universitarias o SSO

El sistema debe implementar un mecanismo de autenticación y autorización basado en credenciales universitarias o Single Sign-On (SSO), permitiendo que los usuarios accedan utilizando sus cuentas institucionales sin necesidad de crear credenciales adicionales.

Este sistema de autenticación garantizará que solo los usuarios autorizados puedan acceder a la plataforma y se les asignen permisos según su perfil (estudiante, docente, administrativo, vigilante o administrador).

La integración con SSO facilitará la gestión centralizada de usuarios, proporcionando una experiencia de acceso más fluida, segura y alineada con los protocolos de identidad de la universidad.

### Criterios de Aceptación

- El sistema debe permitir el inicio de sesión mediante credenciales universitarias, integrándose con los servicios de autenticación institucionales.
- Debe soportar Single Sign-On (SSO), permitiendo a los usuarios acceder sin necesidad de ingresar sus credenciales múltiples veces si ya están autenticados en otros sistemas de la universidad.
- La autenticación debe verificar automáticamente el rol del usuario y asignarle los permisos correspondientes dentro del sistema.
- Si un usuario no tiene permisos de acceso, el sistema debe mostrar un mensaje de restricción y redirigirlo al administrador.
- Se debe registrar un historial de accesos, almacenando información como:
  - Fecha y hora del acceso.
  - Dirección IP y dispositivo utilizado.
  - Resultado del intento de autenticación (exitoso o fallido).
- Los administradores deben poder gestionar manualmente los accesos en casos excepcionales (ejemplo: usuarios externos invitados).
  - La gestión manual de acceso equivale a un registro de usuario con los siguientes datos:
    - Nombre del usuario nuevo para las comunicaciones.
    - Email del usuario nuevo que debe ser verificado.
    - Rol con el que va a entrar el usuario.
- Si el servicio de autenticación falla, el sistema debe ofrecer un método de respaldo para garantizar el acceso a usuarios con permisos especiales.
  - Cuando un usuario ingresa con SSO por primera vez será registrado sin clave.
  - Si el usuario intenta ingresar sin SSO y no tiene clave asignada, deberá verificar el email.

### Flujo de Uso Mejorado

#### Inicio de sesión mediante SSO o credenciales universitarias

- El usuario accede al portal de reservas.
- Se le presenta la opción de autenticarse con:
  - SSO (inicio de sesión único vinculado a la universidad).
  - Ingreso manual de credenciales.
- Si el usuario ya está autenticado con el SSO institucional, el acceso debe ser automático.

#### Validación de credenciales y asignación de permisos

- El sistema verifica la identidad del usuario con el servicio de autenticación de la universidad.
- Si las credenciales son válidas, el sistema recupera el perfil del usuario y asigna los permisos correspondientes.
- Si el perfil no es suficiente para identificar y asignar los permisos correspondientes, el sistema muestra un mensaje de error de permisos y notifica al administrador.
- Si la autenticación falla o el usuario no tiene permisos, el sistema muestra un mensaje de error de autenticación y notifica al administrador.

#### Acceso y uso del sistema

- Una vez autenticado, el usuario accede al sistema y visualiza las opciones disponibles según su rol:
  - Estudiante: Reservar recursos, consultar disponibilidad.
  - Docente: Aprobar reservas de estudiantes, gestionar horarios.
  - Administrador general: Control total del sistema, gestión de roles y reportes.
  - Administrador de programa de estudio: Control total sobre el programa de estudio, gestión de roles y reportes.
  - Vigilante: Ver reservas activas y validar acceso.
  - Administrativo: Gestionar reportes y disponibilidad de recursos.

#### Registro y auditoría de accesos

- Cada intento de inicio de sesión se almacena en un registro de actividad, indicando la fecha, hora y estado de la autenticación.
- Los administradores pueden consultar el historial de accesos y detectar intentos fallidos o accesos sospechosos.

### Restricciones y Consideraciones

- **Dependencia del servicio de autenticación institucional**
  - Si el SSO o el sistema de credenciales de la universidad presenta fallos, el acceso a la plataforma se realiza con clave propia.
- **Manejo de usuarios sin credenciales universitarias**
  - Los usuarios (invitados, proveedores, externos) pueden acceder con un método de autenticación alterno de clave propia.
- **Expiración de sesiones (configurable)**
  - Debe establecerse un tiempo máximo de inactividad antes de cerrar automáticamente la sesión del usuario por seguridad.
- **Revocación de accesos**
  - Si un usuario deja de pertenecer a la universidad, su acceso debe ser revocado automáticamente mediante la integración con el sistema de autenticación.
- **Seguridad en dispositivos compartidos**
  - Se debe habilitar un botón de "Cerrar sesión en todos los dispositivos" para evitar accesos no autorizados en equipos públicos.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe permitir un alto número de autenticaciones simultáneas sin afectar el rendimiento.
- **Rendimiento**: El inicio de sesión debe realizarse en menos de 3 segundos en condiciones normales.
- **Seguridad**: Se debe utilizar protocolos seguros de autenticación como OAuth2, SAML o OpenID Connect para proteger las credenciales.
- **Usabilidad**: La interfaz de inicio de sesión debe ser intuitiva, permitiendo el acceso con un solo clic mediante SSO.
- **Disponibilidad**: La funcionalidad debe estar operativa 24/7, garantizando que los usuarios puedan acceder en cualquier momento.