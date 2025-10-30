# Hito 2 - Availability Core 📅

## 📋 Resumen

Validación del núcleo de disponibilidad y reservas de recursos institucionales.

## 🎯 Objetivos

- Configurar disponibilidad básica de recursos
- Implementar sistema de reservas
- Integrar con calendarios externos
- Validar gestión de horarios complejos
- Probar funcionalidad de búsqueda avanzada
- Verificar notificaciones automáticas

## 🔄 Flujos de Testing Detallados

### (1) Basic Availability - Disponibilidad Básica

- Consultar disponibilidad general de recursos
- Configurar horarios básicos de disponibilidad
- Validar reglas de disponibilidad por tipo de usuario
- Verificar disponibilidad en tiempo real

**Endpoints probados:**

- `GET /api/v1/availability/resources/{id}/availability`
- `POST /api/v1/availability/schedules`
- `GET /api/v1/availability/schedules/{id}`
- `PUT /api/v1/availability/schedules/{id}`
- `DELETE /api/v1/availability/schedules/{id}`

### (2) Reservation Management - Gestión de Reservas

- Crear reservas individuales y recurrentes
- Validar conflictos de horarios automáticamente
- Probar modificación y cancelación de reservas
- Testear reservas con múltiples recursos
- Validar notificaciones de confirmación
- Verificar límites de reserva por usuario
- Probar lista de espera automática

**Endpoints principales:**

- `POST /api/v1/availability/reservations`
- `GET /api/v1/availability/reservations`
- `PUT /api/v1/availability/reservations/{id}`
- `DELETE /api/v1/availability/reservations/{id}/cancel`

### (3) Calendar Integration - Integración con Calendarios

- Sincronizar con Google Calendar/Outlook
- Exportar reservas a formatos .ics
- Validar importación de eventos externos
- Probar notificaciones de calendario
- Testear actualización bidireccional
- Verificar manejo de zonas horarias
- Validar conflictos con eventos externos

**Endpoints principales:**

- `GET /api/v1/availability/calendar`
- `POST /api/v1/availability/calendar/sync`
- `GET /api/v1/availability/calendar-integrations/{id}/events`
- `GET /api/v1/availability/export/ical`

### (4) Advanced Search - Búsqueda Avanzada

- Buscar recursos disponibles por criterios múltiples
- Filtrar por capacidad, equipamiento y ubicación
- Probar búsqueda por rango de fechas
- Validar ordenamiento por relevancia
- Testear filtros de programa académico
- Verificar sugerencias de recursos alternativos
- Probar búsqueda con predicción de disponibilidad

**Endpoints principales:**

- `GET /api/v1/availability/search`
- `POST /api/v1/availability/search/filters`
- `GET /api/v1/availability/search/free-slots`

### (5) Reassignment System - Sistema de Reasignación

- Crear solicitudes de reasignación
- Procesar reasignaciones automáticas
- Gestionar lista de espera
- Validar reglas de reasignación
- Notificaciones de cambios

**Endpoints probados:**

- `GET /api/v1/availability/reassignment-requests`
- `POST /api/v1/availability/reassignment-requests`
- `PUT /api/v1/availability/reassignment-requests/{id}/respond`
- `POST /api/v1/availability/reassignment-requests/{id}/process`
- `GET /api/v1/availability/waiting-list`

### (6) Usage Tracking - Seguimiento de Uso

- Registrar uso efectivo de recursos
- Generar historial de reservas
- Calcular métricas de utilización
- Detectar patrones de uso
- Reportes de ocupación

**Endpoints probados:**

- `GET /api/v1/availability/usage-history`
- `POST /api/v1/availability/usage-tracking/checkin`
- `POST /api/v1/availability/usage-tracking/checkout`
- `GET /api/v1/availability/analytics/utilization`
- `GET /api/v1/availability/analytics/patterns`

## 👥 Usuarios de Testing

- **Estudiante**: Juan Pérez (<estudiante.test@ufps.edu.co>)
- **Docente**: María García (<docente.test@ufps.edu.co>)
- **Administrativo**: Admin Test (<admin.test@ufps.edu.co>)
- **Vigilante**: Guardia Nocturno (<vigilante.test@ufps.edu.co>)

## 📊 Datos de Prueba

Utilizando recursos y categorías de las semillas:

### Recursos de Test

- **Salón 101** (SALON) - Capacidad: 30
- **Lab Sistemas** (LABORATORIO) - Capacidad: 25  
- **Auditorio Principal** (AUDITORIO) - Capacidad: 200
- **Proyector A1** (EQUIPO_MULTIMEDIA)

### Horarios de Test

- Lunes a Viernes: 7:00 AM - 10:00 PM
- Sábados: 8:00 AM - 6:00 PM
- Domingos: Cerrado

### Escenarios de Reserva

- Reservas de 1-2 horas (clases regulares)
- Reservas extendidas de 4+ horas (eventos)
- Reservas recurrentes semanales
- Reservas con múltiples recursos

## ✅ Métricas Esperadas

- **Disponibilidad**: Consulta < 500ms
- **Reservas**: Creación < 1s
- **Búsqueda**: Resultados < 2s
- **Sincronización**: Calendarios < 5s
- **Reasignación**: Procesamiento < 3s

## 🔍 Validaciones Específicas

- Formato de respuesta según estándar Bookly
- Códigos de error específicos del dominio
- Validación de conflictos de horarios
- Permisos por rol de usuario
- Integridad referencial de datos
- Logs de auditoría completos

## 📝 Reportes Generados

Cada flujo genera un reporte detallado en `results/`:

- `basic-availability.md` - Configuración y consultas de disponibilidad
- `reservation-management.md` - Gestión completa de reservas
- `calendar-integration.md` - Integración con calendarios externos
- `advanced-search.md` - Búsqueda y filtros avanzados
- `reassignment-system.md` - Sistema de reasignación
- `usage-tracking.md` - Seguimiento y analíticas

## 🚀 Comandos de Ejecución

```bash
# Ejecutar todo el hito
make test-hito-2

# Ejecutar flujos individuales
make test-availability-basic
make test-availability-reservations
make test-availability-calendar
make test-availability-search
make test-availability-reassignment
make test-availability-tracking

# Ver resultados
make results-hito-2
```

## 📋 Estado de Implementación

| Flujo | Estado | Archivo |
|-------|--------|---------|
| Basic Availability | ✅ Implementado | `basic-availability.js` |
| Reservation Management | ✅ Implementado | `reservation-management.js` |
| Calendar Integration | ✅ Implementado | `calendar-integration.js` |
| Advanced Search | ✅ Implementado | `advanced-search.js` |
| Reassignment System | ✅ Implementado | `reassignment-system.js` |
| Usage Tracking | ✅ Implementado | `usage-tracking.js` |

**Cobertura Total: 100% - Todos los flujos implementados**

---

*Documentación generada automáticamente para Hito 2 - Availability Core*
