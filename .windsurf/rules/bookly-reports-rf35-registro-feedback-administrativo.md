---
trigger: manual
---

## RF-35: Evaluación de usuarios por parte del personal administrativo para mejorar el uso responsable de los recursos

El sistema debe permitir que el personal administrativo evalúe a los usuarios en función de su comportamiento y responsabilidad en el uso de los recursos reservados.

Esta evaluación busca identificar patrones de uso inadecuado, fomentar un uso más eficiente de los recursos y aplicar medidas correctivas si es necesario.

Los administradores podrán calificar aspectos como:

- Cumplimiento de horarios (check-in y check-out).
- Uso adecuado de los recursos asignados.
- Frecuencia de cancelaciones sin aviso.
- Reportes de daños o mal uso del recurso.

El objetivo de esta funcionalidad es garantizar el uso eficiente y responsable de los recursos, premiando a los usuarios con un historial positivo y aplicando restricciones a quienes incumplan repetidamente.

### Criterios de Aceptación

- El sistema debe permitir que el personal administrativo evalúe a los usuarios después del uso de un recurso.
- La evaluación debe incluir los siguientes criterios:
  - Cumplimiento de horarios (asistencia, puntualidad).
  - Uso adecuado del recurso sin generar daños.
  - Historial de cancelaciones y asistencia a reservas previas.
- Cada usuario debe tener un historial de evaluaciones, accesible solo para administradores.
- Si un usuario recibe múltiples evaluaciones negativas, el sistema debe permitir aplicar restricciones en sus futuras reservas.
- Los usuarios deben poder consultar sus evaluaciones, pero no podrán editarlas ni eliminarlas.
- Si un usuario considera que una evaluación es injusta, debe haber una opción para solicitar revisión al administrador.

### Flujo de Uso

#### Registro de evaluación por parte del administrador

- Una vez que un usuario finaliza su reserva, el sistema permite al administrador evaluar su comportamiento.
- El administrador accede a la sección "Evaluación de Usuarios" y selecciona la reserva a evaluar.
- Completa la evaluación calificando:
  - Asistencia (puntual, tardía, no presentado).
  - Estado del recurso tras su uso (adecuado, con daños, sucio).
  - Cancelaciones previas sin aviso.
- Opcionalmente, puede agregar comentarios sobre la conducta del usuario.

#### Registro y consulta del historial de evaluaciones

- El sistema almacena la evaluación en el perfil del usuario, donde los administradores pueden ver su historial.
- Si un usuario tiene múltiples evaluaciones negativas, se pueden aplicar medidas correctivas.

#### Aplicación de restricciones o beneficios

- Si un usuario ha tenido varias incidencias, el sistema puede aplicar:
  - Restricción temporal en la creación de nuevas reservas.
  - Reducción del número máximo de reservas simultáneas.
- Si el usuario tiene un historial positivo, puede recibir:
  - Asignación automática de recursos.
  - Acceso a recursos restringidos a usuarios con buena reputación.

#### Solicitud de revisión de evaluación (si aplica)

- Si un usuario considera que su evaluación fue injusta, puede enviar una solicitud de revisión.
- Un administrador revisará el caso y podrá modificar la evaluación si es necesario.

### Restricciones y Consideraciones

- **Acceso restringido a las evaluaciones**
  - Solo el personal administrativo debe poder registrar evaluaciones, y solo los administradores deben poder revisar el historial de un usuario.
- **Evitar sesgos en la evaluación**
  - Se deben definir criterios objetivos y medibles para evaluar el comportamiento del usuario.
- **No modificación de evaluaciones**
  - Una vez registrada la evaluación, no debe poder ser editada, salvo en casos excepcionales justificados por un administrador.
- **Tiempo límite para registrar la evaluación**
  - Se debe definir un período dentro del cual los administradores pueden registrar la evaluación (ejemplo: 24 horas después del uso del recurso).
- **Confidencialidad de la evaluación**
  - Los usuarios pueden ver sus calificaciones, pero no las de otros usuarios.
  - Los usuarios no pueden ver el administrativo que le evaluó.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe soportar un alto volumen de evaluaciones sin afectar el rendimiento.
- **Rendimiento**: La consulta del historial de evaluaciones debe realizarse en tiempo real sin retrasos.
- **Seguridad**: La información de las evaluaciones debe estar protegida y solo accesible por administradores.
- **Usabilidad**: La interfaz de evaluación debe ser simple, con opciones de calificación predefinidas para agilizar el proceso.
- **Disponibilidad**: La funcionalidad debe estar operativa 24/7, permitiendo la evaluación en cualquier momento.
