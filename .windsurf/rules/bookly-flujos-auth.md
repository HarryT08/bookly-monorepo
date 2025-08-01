---
trigger: manual
---

5. Módulo de Seguridad y Control de Accesos
Este módulo se encarga de la autenticación, autorización y gestión de permisos dentro de la plataforma Bookly. Su objetivo es garantizar que los usuarios accedan únicamente a los recursos y funciones autorizadas, protegiendo la integridad y confidencialidad de la información.
5.1. Procesos Clave
Gestión de Roles y Permisos
Autenticación y Autorización de Usuarios
Verificación de Identidad en Accesos Críticos
Registro y Auditoría de Accesos
Restricción de Modificaciones a los Recursos
Implementación de Doble Factor de Autenticación (2FA)
5.2. Pasos del Proceso
5.2.1. Gestión de Roles y Permisos
Descripción
Define los roles de los usuarios en la plataforma y asigna permisos específicos según su nivel de acceso.
Flujo de Acciones
El administrador accede al módulo de configuración de roles.
Se crean nuevos roles o se editan los existentes (Ej.: Administrador, Docente, Estudiante, Vigilante).
Se asignan permisos específicos a cada rol (Ej.: Crear reservas, Aprobar solicitudes, Consultar reportes).
El sistema guarda la configuración y la aplica en tiempo real.
Se registra la acción en el historial de auditoría.
Actores Principales
Administrador: Configura y gestiona roles y permisos.
Sistema: Aplica restricciones y valida permisos en las operaciones de los usuarios.
Resultados
Se evita el acceso no autorizado a funciones críticas.
Se estructura el sistema según jerarquías de permisos.
Se facilita la auditoría y el control de acceso.
5.2.2. Autenticación y Autorización de Usuarios
Descripción
Permite que los usuarios accedan a la plataforma con credenciales seguras y solo a las funciones que les corresponden.
Flujo de Acciones
El usuario accede a la página de inicio de sesión.
Ingresa sus credenciales (usuario y contraseña o SSO institucional).
El sistema valida las credenciales con la base de datos.
Si la autenticación es exitosa, se verifica su rol y se le otorgan permisos según su perfil.
Se registra el acceso en el historial de auditoría.
Actores Principales
Usuario: Inicia sesión para acceder a la plataforma.
Sistema: Valida credenciales y gestiona la sesión del usuario.
Resultados
Se garantiza que solo usuarios autorizados accedan a la plataforma.
Se minimizan riesgos de suplantación de identidad.
Se permite una gestión centralizada de credenciales.
5.2.3. Verificación de Identidad en Accesos Críticos
Descripción
Asegura que solo usuarios autorizados puedan realizar acciones sensibles dentro del sistema.
Flujo de Acciones
Un usuario intenta realizar una acción crítica (Ej.: Aprobación de reservas, Eliminación de registros, Modificación de permisos).
El sistema solicita una verificación adicional (Ej.: Ingreso de contraseña, código enviado al correo o autenticación de doble factor).
Si la verificación es exitosa, la acción se permite; de lo contrario, se bloquea.
Se registra la acción en el historial de auditoría.
Actores Principales
Usuario: Intenta ejecutar una acción crítica.
Sistema: Solicita validación adicional y registra la acción.
Resultados
Se refuerza la seguridad en procesos clave.
Se evita el acceso no autorizado a configuraciones sensibles.
Se auditan los intentos de acceso a funciones críticas.
5.2.4. Registro y Auditoría de Accesos
Descripción
Monitorea y almacena un historial detallado de los accesos y actividades dentro de la plataforma.
Flujo de Acciones
Cada inicio de sesión, acción de modificación o intento de acceso se registra automáticamente.
Se almacena información como usuario, fecha, hora, IP y tipo de acción realizada.
Los administradores pueden consultar los registros en cualquier momento.
Se generan alertas en caso de detección de actividad sospechosa (Ej.: múltiples intentos fallidos de acceso).
Actores Principales
Sistema: Registra y almacena eventos de acceso.
Administrador: Supervisa y audita los registros de acceso.
Resultados
Se mejora la trazabilidad y detección de accesos no autorizados.
Se facilita la auditoría de seguridad.
Se permite una mejor respuesta ante incidentes.
5.2.5. Restricción de Modificaciones a los Recursos
Descripción
Controla quién puede modificar, eliminar o actualizar los recursos dentro del sistema.
Flujo de Acciones
Un usuario intenta modificar un recurso (Ej.: cambiar disponibilidad de una sala, eliminar una reserva).
El sistema verifica si el usuario tiene permisos adecuados según su rol.
Si está autorizado, se permite la acción; de lo contrario, se muestra un mensaje de error.
Se registra la acción en el historial de auditoría.
Actores Principales
Usuario: Intenta modificar un recurso.
Sistema: Verifica permisos y autoriza o bloquea la acción.
Resultados
Se evita la manipulación no autorizada de datos críticos.
Se mantiene la integridad de la información.
Se mejora la seguridad en la administración de recursos.
5.2.6. Implementación de Doble Factor de Autenticación (2FA)
Descripción
Agrega una capa adicional de seguridad en el inicio de sesión para evitar accesos no autorizados.
Flujo de Acciones
El usuario activa la opción de autenticación en dos pasos en su perfil.
En cada inicio de sesión, después de ingresar la contraseña, el sistema envía un código de verificación al correo o teléfono del usuario.
El usuario ingresa el código y el sistema lo valida.
Si el código es correcto, se concede el acceso; de lo contrario, se rechaza la sesión.
Actores Principales
Usuario: Activa y utiliza la autenticación en dos pasos.
Sistema: Genera y verifica códigos de autenticación.
Resultados
Se mejora la seguridad en el acceso a la plataforma.
Se reduce el riesgo de accesos fraudulentos.
Se protege la información de los usuarios.
