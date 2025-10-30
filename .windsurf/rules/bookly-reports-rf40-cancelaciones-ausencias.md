---
trigger: manual
---

## RF-40: Reporte de cancelaciones y ausencias

El sistema debe generar el reporte de las cancelaciones y ausencias de los usuarios en sus reservas, generando indicadores clave para evaluar patrones de uso y mejorar la gestión de recursos.

Estos indicadores deben permitir a los administradores:

- Identificar usuarios con alta tasa de cancelaciones o inasistencias.
- Detectar recursos con mayor número de reservas canceladas.
- Establecer alertas cuando un usuario acumule demasiadas ausencias sin previo aviso.

El propósito de esta funcionalidad es mejorar la eficiencia en la gestión de recursos, reducir la cantidad de reservas desperdiciadas y garantizar que los usuarios hagan un uso responsable del sistema.

### Criterios de Aceptación

- El sistema debe registrar todas las cancelaciones y ausencias, clasificándolas en:
  - Cancelaciones anticipadas (con suficiente tiempo para reasignar el recurso).
  - Cancelaciones tardías (con poco margen para reasignación).
  - Ausencias sin aviso (No-Show) (cuando el usuario no hace check-in dentro del tiempo límite).
- Los indicadores deben permitir visualizar:
  - Porcentaje de cancelaciones y ausencias por usuario.
  - Recursos con mayor número de cancelaciones o ausencias.
  - Días y horarios con mayor incidencia de cancelaciones o inasistencias.
- El sistema debe generar alertas automáticas cuando un usuario alcance un umbral crítico de inasistencias.
- Los administradores deben poder filtrar y exportar reportes en CSV.
- Los usuarios deben poder consultar su historial de cancelaciones y ausencias dentro de su perfil.
- Se debe permitir la configuración de medidas correctivas automáticas, como restricciones temporales para usuarios con alto nivel de ausencias.

### Flujo de Uso

#### Registro de cancelaciones y ausencias

- Un usuario cancela una reserva antes de la fecha programada.
- El sistema registra la cancelación y la clasifica según la anticipación con la que se realizó.
- Si el usuario no hace check-in dentro del tiempo límite, el sistema marca la reserva como "No-Show" y lo registra en su historial.

#### Generación de indicadores y reportes

- Un administrador accede al módulo "Reporte de Cancelaciones y Ausencias".
- Selecciona los filtros deseados:
  - Rango de fechas (diario, semanal, mensual).
  - Usuario o programa académico.
  - Tipo de recurso.
- El sistema muestra gráficos interactivos y tablas dinámicas con estadísticas detalladas.

#### Aplicación de alertas y restricciones

- Si un usuario alcanza un nivel crítico de ausencias, el sistema genera una alerta para los administradores.
- Dependiendo de la configuración, el sistema puede aplicar:
  - Restricciones en nuevas reservas (por un tiempo determinado).
  - Solicitudes de justificación antes de aprobar reservas futuras.
  - Notificaciones automáticas al usuario sobre su nivel de incumplimiento.

#### Consulta del historial por el usuario

- Los usuarios pueden acceder a su perfil y revisar su historial de cancelaciones y ausencias.
- Pueden ver su porcentaje de cumplimiento y recibir recomendaciones para mejorar su nivel de asistencia.

### Restricciones y Consideraciones

- **Tiempos de tolerancia**
  - Se debe definir cuánto tiempo después del inicio de la reserva se considera una ausencia (ejemplo: 15 minutos sin check-in).
- **Diferenciación entre cancelaciones y ausencias**
  - Cancelar con antelación no debe contar negativamente en el historial del usuario.
- **Configuración de umbrales**
  - Los administradores deben poder definir el número máximo de ausencias antes de aplicar restricciones.
- **Acceso restringido a los reportes**
  - Solo los administradores deben poder consultar los indicadores de todos los usuarios.
- **Manejo de excepciones**
  - Se debe permitir que un usuario justifique una ausencia con sus razones antes de que impacte en su historial.

### Requerimientos No Funcionales Relacionados

- **Escalabilidad**: El sistema debe soportar miles de registros de cancelaciones y ausencias sin afectar el rendimiento.
- **Rendimiento**: Los reportes deben generarse en menos de 5 segundos en condiciones normales.
- **Seguridad**: La información sobre el historial de cumplimiento de reservas debe estar protegida y solo accesible por usuarios autorizados.
- **Usabilidad**: La interfaz de indicadores debe ser clara, con gráficos interactivos y opciones de filtrado intuitivas.
- **Disponibilidad**: La funcionalidad debe estar operativa 24/7, permitiendo su consulta en cualquier momento.
