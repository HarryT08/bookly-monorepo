---
trigger: manual
---

## RF-03: Definir atributos como nombre, descripción, ubicación, capacidad, horarios de disponibilidad y reglas de uso

El sistema debe permitir la configuración y gestión de atributos clave para cada recurso registrado, asegurando que la información sea clara, completa y útil para su administración y uso eficiente. Los atributos deben incluir información general, operativa y de disponibilidad, permitiendo la personalización según el tipo de recurso.

### Criterios de Aceptación

- Cada recurso debe contar con los siguientes atributos mínimos y obligatorios:
  - **Identificación:** Nombre único del recurso.
  - **Descripción:** Información relevante sobre su uso y características.
  - **Ubicación:** Edificio, piso y espacio específico dentro del campus.
  - **Capacidad:** Número máximo de personas o especificación técnica en caso de equipos.
  - **Estado:** Disponible, En uso, En mantenimiento, Fuera de servicio.
  - **Categoría:** Tipo de recurso (Ejemplo: Salón, Auditorio, Computador, Herramienta de laboratorio).
  - **Programa Académico Asociado:** Vinculación con facultades o áreas específicas.

- Atributos operativos y de uso adicionales, configurables según el tipo de recurso:
  - **Requisitos previos:** Condiciones necesarias para su uso (Ejemplo: solo para profesores, requiere capacitación). Ayuda a permitir que los recursos tengan horarios de disponibilidad personalizados y evitar conflictos en la programación de reservas.
    - **Días y horarios de disponibilidad:** Configuración de franjas horarias en las que el recurso puede ser reservado.
    - **Tiempo mínimo/máximo de uso:** Define los límites de tiempo que puede durar una reserva (Ejemplo: mínimo 30 min, máximo 4 horas).
    - **Tiempo de preparación entre reservas:** Tiempo requerido antes y después de cada reserva para limpieza, configuración o calibración del recurso (Ejemplo: 15 minutos entre reservas de auditorios).
    - **Días bloqueados:** Fechas en las que el recurso no está disponible por mantenimiento, días festivos, exámenes o eventos especiales.
    - **Frecuencia de reservas permitida:** Determina si se permiten reservas periódicas (Ejemplo: todos los martes de 8 a 10 am).
  - **Reglas de uso:** Límites de reserva, tiempos mínimos y máximos de uso, restricciones especiales. Es necesario definir políticas que regulen quién puede utilizar un recurso y bajo qué condiciones.
    - **Prioridad de usuarios:** Indica si el recurso tiene prioridad de uso para ciertos grupos (Ejemplo: solo profesores, investigadores o estudiantes de ciertos programas).
    - **Requisitos previos para uso:** Condiciones que deben cumplir los usuarios antes de reservar (Ejemplo: sólo quienes han completado un curso de seguridad pueden usar un laboratorio de química).
    - **Límite de reservas por usuario:** Controla cuántas reservas puede hacer un usuario en un periodo de tiempo (Ejemplo: máximo 5 reservas semanales).
    - **Tiempo de antelación mínima/máxima para reservar:** Define cuándo se puede realizar una reserva (Ejemplo: mínimo con 24 horas de anticipación, máximo con 2 meses de anticipación).
    - **Condiciones de cancelación:** Reglas sobre cancelaciones y penalizaciones por no uso (Ejemplo: si no cancelas 1 semana antes, se bloquea tu acceso por una semana).
  - **Información técnica y características del recurso:** Equipamiento adicional disponible junto con el recurso (Ejemplo: proyector en un auditorio). Se busca describir las especificaciones técnicas para recursos especializados.
    - **Especificaciones técnicas:** Información detallada del recurso (Ejemplo: proyector con resolución 4K, laptop con 16GB RAM, capacidad del auditorio de 200 personas).
    - **Recursos asociados:** Equipos o elementos adicionales que vienen con el recurso (Ejemplo: un laboratorio con proyectores, pizarras electrónicas, micrófonos).
    - **Software preinstalado (para equipos de cómputo):** Lista de programas disponibles en equipos tecnológicos (Ejemplo: AutoCAD, MATLAB, Photoshop).
    - **Condiciones de mantenimiento:** Frecuencia y tipo de mantenimiento requerido (Ejemplo: mantenimiento trimestral para microscopios).
    - **Tiempo estimado de vida útil:** Plazo esperado de uso antes de ser reemplazado o dado de baja.
  - **Costo y condiciones financieras (opcional):** Aplicable si ciertos recursos tienen tarifas asociadas. Ayuda a gestionar tarifas de uso cuando aplique.
    - **Costo por reserva:** Si el uso del recurso requiere un pago (Ejemplo: alquiler de un auditorio para eventos privados).
    - **Descuentos por usuario o programa académico:** Tarifas diferenciadas según el tipo de usuario (Ejemplo: los estudiantes tienen un 50% de descuento en ciertas reservas).
    - **Métodos de pago aceptados:** Pago en línea, facturación a la facultad, cobro en efectivo, entre otros.
    - **Depósitos o garantías:** Monto que se debe dejar en garantía para ciertos equipos o instalaciones.

- Los administradores deben poder:
  - Crear y modificar los atributos de un recurso.
  - Configurar reglas personalizadas de uso y disponibilidad.
  - Definir atributos específicos según el tipo de recurso (Ejemplo: un auditorio tendrá capacidad en número de asientos, mientras que un equipo de laboratorio tendrá especificaciones técnicas).
  - Agregar costos asociados a un recurso.

- Se debe incluir una **validación automática para evitar errores** en los datos ingresados.
- Los atributos deben ser **visualizables en las interfaces de búsqueda y detalles** del recurso.

### Flujo de Uso

#### Creación de un nuevo recurso

- El administrador accede a la opción **"Crear Recurso"**.
- Introduce los atributos obligatorios y opcionales según el tipo de recurso.
- Guarda la información, validando que todos los campos requeridos estén completos.
- El sistema confirma la creación del recurso y lo registra en el inventario.

#### Edición de atributos de un recurso existente

- El administrador busca el recurso en la base de datos.
- Accede a la opción **"Editar"** y actualiza los atributos necesarios.
- Guarda los cambios, los cuales quedan registrados en el historial de auditoría.

#### Visualización y consulta de recursos

- Los usuarios pueden **buscar y filtrar recursos según sus atributos**.
- El sistema muestra **información detallada con los atributos definidos**.

### Restricciones y Consideraciones

- Un recurso no puede crearse sin los **atributos obligatorios**.
- Solo los administradores pueden **modificar atributos críticos** como ubicación y capacidad.
- Si un recurso está en uso o tiene reservas activas, ciertas modificaciones deben estar **restringidas o requerir aprobación**.
- Las reglas de uso deben ser **configurables por tipo de recurso y ajustables a cada recurso**, según necesidades institucionales.

### Requerimientos No Funcionales Relacionados

- **Eficiencia:** La carga y consulta de atributos debe realizarse en **menos de 2 segundos** en condiciones normales de carga.
- **Seguridad:** La modificación de atributos debe estar protegida por **permisos de usuario** y registrada en un historial de cambios.
- **Escalabilidad:** El sistema debe permitir **agregar nuevos atributos en el futuro** sin afectar su funcionamiento.
