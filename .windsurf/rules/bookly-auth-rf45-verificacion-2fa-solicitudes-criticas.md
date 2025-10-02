---
trigger: manual
---

## RF-45: Verificación de identidad en solicitudes críticas mediante autenticación de doble factor

El sistema debe implementar un mecanismo de autenticación de doble factor (2FA) para verificar la identidad de los usuarios cuando realicen solicitudes críticas dentro del sistema.

Estas solicitudes incluyen, pero no se limitan a:

- Modificación o eliminación de reservas confirmadas.
- Cambio en permisos o roles de usuarios.
- Gestión de configuraciones del sistema.
- Acceso a reportes confidenciales o auditorías.

El propósito de esta funcionalidad es fortalecer la seguridad del sistema, asegurando que solo los usuarios autorizados puedan ejecutar acciones de alto impacto, reduciendo riesgos de acceso no autorizado, errores o fraudes.

### Criterios de Aceptación

- El sistema debe requerir una autenticación de doble factor cuando un usuario intente realizar una solicitud crítica.
- Los métodos de 2FA deben incluir:
  - Código de verificación de correo electrónico.
  - Código de autenticación generado por una app de autenticación (Google Authenticator, Microsoft Authenticator, etc.).
- El código de verificación debe ser válido solo por un tiempo limitado (ejemplo: 5 minutos).
- Si el usuario no ingresa el código dentro del tiempo establecido, la solicitud debe ser rechazada automáticamente.
- Debe existir un historial de autenticaciones donde los administradores puedan revisar quién realizó cada verificación de identidad.
- Si un usuario no puede completar la autenticación de doble factor, el sistema debe proporcionar una opción para solicitar soporte a un administrador.
- Se debe evitar que el usuario pueda deshabilitar el 2FA en acciones críticas sin autorización del administrador.

### Flujo de Uso Mejorado

#### Inicio de una solicitud crítica

- Un usuario intenta realizar una acción que requiere autenticación de doble factor (ejemplo: modificar una reserva confirmada o cambiar permisos).
- El sistema detecta que la acción es crítica y activa el proceso de verificación de identidad.

#### Envío del código de autenticación

- El sistema genera un código único y lo envía al usuario a través del método configurado (correo, app de autenticación).
- El usuario recibe el código y lo ingresa en el sistema dentro del tiempo límite.

#### Validación y ejecución de la solicitud

- Si el código ingresado es correcto, el sistema autoriza la solicitud y registra la autenticación en el historial de auditoría.
- Si el código es incorrecto o expira, la solicitud es rechazada y el usuario debe volver a iniciar el proceso.

#### Registro y auditoría de la autenticación

- El sistema almacena un registro de verificación de identidad, incluyendo:
  - Fecha y hora de la autenticación.
  - Tipo de solicitud verificada.
  - Método de autenticación utilizado.
  - Resultado (éxito o fallo).

### Restricciones y Consideraciones

- **Obligatoriedad de la autenticación**
  - No debe permitirse que un usuario realice solicitudes críticas sin completar el 2FA.
- **Tiempo límite de validez del código**
  - Se debe establecer un tiempo de expiración para evitar el uso indebido de códigos antiguos.
- **Protección contra múltiples intentos fallidos**
  - Si un usuario ingresa códigos incorrectos repetidamente, el sistema debe bloquear temporalmente la función por seguridad.
- **Usuarios con problemas de acceso**
  - Se debe definir el email y clave con aprobación de administrador o docente como procedimiento para casos donde un usuario legítimo no pueda acceder a su método de 2FA (ejemplo: correo inaccesible o cambio de número de teléfono).
- **Compatibilidad con diferentes métodos de autenticación**
  - Se debe permitir la configuración de múltiples opciones de 2FA para garantizar accesibilidad y seguridad.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe poder manejar múltiples solicitudes simultáneas de autenticación sin afectar el rendimiento.
- **Seguridad**: El sistema debe utilizar protocolos de cifrado seguros para el envío y almacenamiento de códigos de autenticación.
- **Usabilidad**: La interfaz debe ser clara e intuitiva, facilitando la autenticación sin generar fricción innecesaria en la experiencia del usuario.
- **Disponibilidad**: La funcionalidad debe estar operativa 24/7, permitiendo autenticaciones en cualquier momento.
