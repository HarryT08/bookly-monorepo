---
trigger: manual
---

## RF-18: Posibilidad de cancelar o modificar reservas con reglas específicas

El sistema debe permitir a los usuarios cancelar o modificar reservas bajo reglas predefinidas, asegurando una gestión eficiente de los recursos y evitando mal uso o cancelaciones de última hora que afecten la disponibilidad.  
Las reglas de cancelación y modificación pueden incluir condiciones como:  
Plazo mínimo para cancelar sin penalización (ejemplo: 24 horas antes del inicio de la reserva).  
Restricciones para modificar fechas y horarios (ejemplo: solo se permite modificar una reserva hasta 12 horas antes de su inicio).  
Aplicación de penalizaciones por cancelaciones tardías (ejemplo: restricciones futuras si un usuario cancela repetidamente sin previo aviso).  
El objetivo de esta funcionalidad es mejorar la planificación del uso de recursos, reducir el impacto de cancelaciones de última hora y permitir flexibilidad en la administración de reservas.

### Criterios de Aceptación

- El sistema debe permitir la cancelación de reservas dentro de los plazos permitidos sin penalización.
- Debe permitir la modificación de fechas y horarios de una reserva, respetando las reglas establecidas.
- Si la cancelación ocurre fuera del plazo permitido, el sistema debe aplicar restricciones o penalizaciones, si corresponde.
- Los administradores deben poder configurar las reglas de cancelación y modificación según el tipo de recurso o categoría de usuario.
- Los usuarios deben recibir una notificación de confirmación cuando cancelan o modifican una reserva.
- El sistema debe reflejar los cambios en tiempo real en la disponibilidad del recurso dentro del calendario.
- Se debe mantener un historial de cancelaciones y modificaciones para auditoría y control de usuarios reincidentes.

### Flujo de Uso

#### Cancelación de una reserva

- El usuario accede a la sección de reservas activas.
- Selecciona la reserva que desea cancelar.
- El sistema verifica si la cancelación está dentro del plazo permitido sin penalización.
- Si está dentro del plazo, la cancelación se confirma y el recurso queda disponible nuevamente.
- Si está fuera del plazo, se notifica al usuario sobre posibles penalizaciones antes de confirmar la cancelación.
- Se envía una confirmación de cancelación al usuario y se actualiza la disponibilidad en el sistema.

#### Modificación de una reserva

- El usuario accede a la sección de reservas activas.
- Selecciona la reserva y elige la opción de modificación.
- Puede cambiar la fecha, horario o duración, respetando las reglas establecidas.
- El sistema valida la disponibilidad del recurso y aplica los cambios si se cumplen las condiciones.
- Se envía una confirmación de modificación y se actualiza el historial de cambios.

#### Aplicación de penalizaciones (si aplica)

- Si la cancelación ocurre fuera del tiempo permitido, el usuario recibe una advertencia sobre posibles restricciones futuras.
- En caso de reincidencia en cancelaciones tardías, el sistema puede aplicar restricciones como:
  - Límite en la cantidad de reservas simultáneas.
  - Bloqueo temporal para realizar nuevas reservas.
  - Revisión manual de futuras solicitudes.

### Restricciones y Consideraciones

- **Diferentes reglas según el tipo de recurso o actividad:**
  - No todas las reservas deben tener las mismas condiciones de cancelación (ejemplo: salas de reuniones pueden requerir 24 horas, mientras que equipos especializados pueden requerir 48 horas).

- **Usuarios con privilegios especiales:**
  - Algunas categorías de usuario, como administradores o profesores, pueden estar exentos de ciertas restricciones.

- **Cancelaciones recurrentes:**
  - Se debe definir un mecanismo para identificar y gestionar usuarios que cancelen repetidamente sin previo aviso.

- **Límites de modificación:**
  - Se debe establecer si un usuario puede modificar su reserva varias veces o si hay un número máximo de modificaciones permitidas.

- **Impacto en reservas dependientes:**
  - En casos donde una reserva dependa de otra (ejemplo: equipos requeridos en una sala), la modificación o cancelación de una puede afectar otras reservas vinculadas.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad:** El sistema debe manejar un gran número de cancelaciones y modificaciones sin afectar el rendimiento.
- **Rendimiento:** Las validaciones de reglas y actualización de disponibilidad deben realizarse en tiempo real.
- **Seguridad:** Solo usuarios autorizados deben poder cancelar o modificar reservas según su nivel de acceso.
- **Notificaciones:** El sistema debe enviar alertas por correo electrónico o mensajes en la plataforma para confirmar cambios o advertir sobre restricciones.
- **Auditoría:** Se debe almacenar un historial de cancelaciones y modificaciones para analizar patrones de uso y detectar abuso del sistema.
