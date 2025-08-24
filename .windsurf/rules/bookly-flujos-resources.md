---
trigger: manual
---

Módulo de Gestión de Recursos
Este módulo es responsable de la administración y configuración de los recursos disponibles para reserva en la plataforma Bookly, tales como salones, auditorios, laboratorios y equipos tecnológicos.
1.1. Procesos Clave
Creación, Edición y Eliminación de Recursos
Definición de Atributos Clave de los Recursos
Configuración de Reglas de Disponibilidad
Importación Masiva de Recursos
Mantenimiento de Recursos (Registro de Daños, Mantenimiento Programado)
Asociación de Recursos a Programas Académicos y Categorías
1.2. Pasos del Proceso
1.2.1. Creación, Edición y Eliminación de Recursos
Descripción
Permite a los administradores agregar, modificar o eliminar recursos en la plataforma asegurando la integridad de la información.
Flujo de Acciones
El administrador accede al panel de gestión de recursos.
Se selecciona la opción de Crear Nuevo Recurso.
Se completan los datos requeridos (nombre, tipo, ubicación, capacidad, disponibilidad).
El sistema valida los datos y guarda la información en la base de datos.
Para la edición, se selecciona un recurso existente y se actualizan los campos necesarios.
Para la eliminación, el sistema verifica si hay reservas activas antes de proceder.
Se registra la acción en el historial de auditoría.
Actores Principales
Administrador: Crea, edita y elimina recursos.
Sistema: Valida y almacena los cambios en la base de datos.
Resultados
Los recursos quedan registrados en la plataforma y son visibles para los usuarios.
Las modificaciones se reflejan en tiempo real.
Se evita la eliminación de recursos con reservas activas.
1.2.2. Definición de Atributos Clave de los Recursos
Descripción
Permite configurar las características fundamentales de los recursos para garantizar una gestión ordenada y precisa.
Flujo de Acciones
El administrador accede a la sección de configuración de atributos.
Define valores como nombre, descripción, ubicación, capacidad y horarios de disponibilidad.
Se configuran reglas de uso (ej.: tiempo mínimo de reserva, restricciones de acceso).
Se almacenan los cambios y se reflejan en la vista de detalle del recurso.
Actores Principales
Administrador: Define y actualiza los atributos.
Sistema: Valida los datos y registra los cambios en la auditoría.
Resultados
Estandarización de los recursos dentro de la plataforma.
Mayor claridad en la información presentada a los usuarios.
Mejora en la precisión de las reservas y reducción de errores.
1.2.3. Configuración de Reglas de Disponibilidad
Descripción
Define las reglas bajo las cuales los recursos pueden ser reservados, asegurando un uso eficiente y evitando conflictos.
Flujo de Acciones
El administrador accede a la configuración de disponibilidad.
Se establecen tiempos mínimos y máximos de reserva.
Se configuran períodos bloqueados (ej.: mantenimientos programados, eventos institucionales).
Se asignan prioridades de uso según el tipo de usuario.
El sistema valida la configuración y la aplica a las reservas.
Actores Principales
Administrador: Configura reglas y restricciones.
Sistema: Aplica validaciones y evita conflictos de horarios.
Resultados
Reducción de conflictos en reservas.
Optimización del uso de los espacios.
Mayor control sobre la disponibilidad.
1.2.4. Importación Masiva de Recursos
Descripción
Facilita la carga de recursos en bloque a través de archivos CSV o integración con sistemas externos.
Flujo de Acciones
El administrador selecciona la opción de importación de recursos.
Se sube un archivo CSV con los datos estructurados.
El sistema valida el formato y detecta posibles errores.
Si la validación es exitosa, se insertan los datos en la base de datos.
Se genera un reporte de importación con los resultados.
Actores Principales
Administrador: Sube archivos y revisa los resultados.
Sistema: Valida y procesa la importación.
Resultados
Ahorro de tiempo en la creación de recursos.
Reducción de errores manuales.
Integración con sistemas universitarios para sincronización de datos.
1.2.5. Mantenimiento de Recursos (Registro de Daños, Mantenimiento Programado)
Descripción
Gestiona incidentes y mantenimiento de los recursos para asegurar su óptimo funcionamiento.
Flujo de Acciones
Un usuario reporta un daño en un recurso.
El administrador revisa el reporte y programa un mantenimiento si es necesario.
Se bloquea la disponibilidad del recurso hasta que el mantenimiento sea completado.
Se notifica a los usuarios con reservas afectadas.
Una vez completado el mantenimiento, el recurso vuelve a estar disponible.
Actores Principales
Usuarios: Reportan daños.
Administrador: Gestiona mantenimiento y actualiza el estado del recurso.
Sistema: Notifica cambios y actualiza disponibilidad.
Resultados
Mejora en la disponibilidad y mantenimiento preventivo de los recursos.
Reducción de problemas técnicos en las reservas.
Mayor satisfacción de los usuarios.
1.2.6. Asociación de Recursos a Programas Académicos y Categorías
Descripción
Permite categorizar los recursos según su tipo y asignarlos a programas académicos específicos.
Flujo de Acciones
El administrador accede a la configuración de asociaciones.
Se selecciona un recurso y se le asignan una o más categorías.
Se vincula el recurso a programas académicos específicos.
Los cambios se guardan y quedan reflejados en los filtros de búsqueda.
Actores Principales
Administrador: Asigna categorías y programas.
Sistema: Registra las asociaciones y permite filtrarlas.
Resultados
Organización eficiente de los recursos.
Búsqueda más precisa y rápida por parte de los usuarios.
Mayor control sobre qué programas pueden acceder a ciertos recursos.
