---
trigger: manual
---

## 📋 Resumen por Módulo

### 1. resources-service (Gestión de Recursos)
#### Historias de Usuario:
- HU-01: Crear Recurso
- HU-02: Editar Recurso
- HU-03: Eliminar o Deshabilitar Recurso
- HU-04: Definir Atributos Clave del Recurso
- HU-05: Configuración de Reglas de Disponibilidad
- HU-06: Asociar Recurso a Categoría y Programa Académico
- HU-07: Importación Masiva de Recursos
- HU-08: Gestión de Mantenimiento de Recursos

#### Casos de Uso:
- CU-008: Registrar un nuevo recurso
- CU-009: Modificar información de un recurso
- CU-010: Eliminar o deshabilitar un recurso

#### Requerimientos Funcionales:
- RF-01: Crear, editar y eliminar recursos
- RF-02: Asociar recursos a categoría y programas
- RF-03: Definir atributos clave del recurso
- RF-04: Importación masiva de recursos
- RF-05: Configuración de reglas de disponibilidad
- RF-06: Mantenimiento de recursos

#### Requerimientos No Funcionales:
- RNF-01: Registro de auditoría estructurado
- RNF-02: Validaciones de datos obligatorios
- RNF-03: Disponibilidad de edición sin afectar reservas activas


### 2. availability-service (Disponibilidad y Reservas)
#### Historias de Usuario:
- HU-09: Configurar horarios disponibles
- HU-10: Integración con calendarios
- HU-11: Visualización en formato calendario
- HU-12: Registro del historial de uso
- HU-13: Reservas periódicas
- HU-14: Lista de espera
- HU-15: Reasignación de reservas
- HU-16: Búsqueda avanzada

#### Casos de Uso:
- CU-011: Consultar disponibilidad
- CU-012: Realizar reserva
- CU-013: Cancelar reserva
- CU-014: Modificar reserva
- CU-015: Agregar recursos a una reserva

#### Requerimientos Funcionales:
- RF-07 al RF-19 incluyendo:
- RF-07: Configurar disponibilidad
- RF-08: Integración con calendarios
- RF-09: Búsqueda avanzada
- RF-10: Visualización en calendario
- RF-11: Historial de uso
- RF-12: Reservas periódicas
- RF-13: Manejo de modificaciones/cancelaciones
- RF-14: Lista de espera
- RF-15: Reasignación
- RF-16: Gestión de conflictos de disponibilidad (ligado a validaciones automáticas)
- RF-17: Gestión de disponibilidad por perfil
- RF-18: Compatibilidad con eventos institucionales
- RF-19: Interfaz de consulta accesible y responsive

#### Requerimientos No Funcionales:
- RNF-04: Disponibilidad en tiempo real
- RNF-05: Validación automática de conflictos
- RNF-06: Optimización de consultas concurrentes


### 3. stockpile-service (Aprobaciones y Validaciones)
#### Historias de Usuario:
- HU-17: Validar solicitudes
- HU-18: Generar carta PDF
- HU-19: Notificación automática
- HU-20: Pantalla de vigilancia
- HU-21: Flujos diferenciados
- HU-22: Registro de aprobaciones
- HU-23: Check-in/Check-out
- HU-24: Notificaciones por mensajería
- HU-25: Confirmación vía WhatsApp/email

#### Casos de Uso:
- CU-016: Enviar solicitud
- CU-017: Revisar solicitud
- CU-018: Aprobar reserva
- CU-019: Rechazar solicitud
- CU-020: Generar carta y notificar

#### Requerimientos Funcionales:
- RF-20: Validar solicitudes de reserva por parte de un responsable
- RF-21: Generación automática de documentos de aprobación o rechazo
- RF-22: Notificación automática al solicitante con el estado de la solicitud
- RF-23: Pantalla de control para el personal de vigilancia
- RF-24: Configuración de flujos de aprobación diferenciados
- RF-25: Registro y trazabilidad de todas las aprobaciones
- RF-26: Check-in/check-out digital (opcional)
- RF-27: Integración con sistemas de mensajería (correo, WhatsApp)
- RF-28: Notificaciones automáticas de cambios en reservas

#### Requerimientos No Funcionales:
- RNF-07: Registro completo de cada decisión
- RNF-08: Envío de notificaciones automáticas
- RNF-09: Seguridad reforzada en pasos críticos


### 4. reports-service (Reportes y Análisis)
#### Historias de Usuario:
- HU-26: Reportes de uso
- HU-27: Reportes por usuario/profesor
- HU-28: Exportación CSV
- HU-29: Registro de feedback
- HU-30: Evaluación de usuarios
- HU-31: Dashboards en tiempo real
- HU-32: Reporte de demanda insatisfecha

#### Casos de Uso:
- CU-021: Generar reporte de uso
- CU-022: Generar reporte por usuario
- CU-023: Exportar CSV
- CU-024: Visualizar dashboard
- CU-025: Analizar demanda insatisfecha

#### Requerimientos Funcionales:
- RF-31: Reporte de uso por recurso/programa/período
- RF-32: Reporte por usuario/profesor
- RF-33: Exportación en CSV
- RF-34: Registro de feedback de usuarios
- RF-35: Evaluación de usuarios por el staff
- RF-36: Dashboards interactivos
- RF-37: Reporte de demanda insatisfecha

#### Requerimientos No Funcionales:
- RNF-10: Exportación de reportes en múltiples formatos
- RNF-11: Visualización en tiempo real
- RNF-12: Accesibilidad por rol


### 5. auth-service (Seguridad y Control de Accesos)
#### Historias de Usuario:
- HU-33: Gestión de roles y permisos
- HU-34: Restricción de modificación
- HU-35: Autenticación segura y SSO
- HU-36: Auditoría de accesos
- HU-37: Verificación por 2FA

#### Casos de Uso:
- CU-001: Registrarse
- CU-002: Iniciar sesión
- CU-003: Cerrar sesión
- CU-004: Recuperar clave
- CU-005: Gestionar perfil
- CU-006: Gestionar roles
- CU-007: Asignar roles a usuarios

#### Requerimientos Funcionales:
- RF-41: Gestión de roles
- RF-42: Restricción de modificación
- RF-43: Autenticación y SSO
- RF-44: Auditoría
- RF-45: Doble factor

#### Requerimientos No Funcionales:
- RNF-13: Seguridad en las sesiones activas
- RNF-14: Protección contra ataques de fuerza bruta
- RNF-15: Registro de intentos de acceso no autorizados
