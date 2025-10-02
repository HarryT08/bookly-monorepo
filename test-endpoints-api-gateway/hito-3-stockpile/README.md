# Hito 3 - Stockpile Core 📋

## 📋 Resumen

Validación del microservicio stockpile-service que maneja flujos de aprobación, validación de solicitudes, generación de documentos y sistema de notificaciones.

## 🎯 Objetivos

- Validar solicitudes de reserva por parte de responsables
- Probar flujos diferenciados según tipo de usuario y recurso
- Verificar generación automática de documentos PDF
- Validar sistema de notificaciones automáticas
- Probar pantalla de control para personal de vigilancia
- Verificar check-in/check-out digital con geolocalización
- Probar integración con sistemas de mensajería

## 🔄 Flujos de Testing Detallados

### (1) Approval Flows - Flujos de Aprobación

- Crear solicitudes de aprobación con diferentes tipos de recursos
- Revisar y validar solicitudes por administradores
- Aprobar/rechazar con documentación de razones
- Procesamiento automático según reglas configuradas
- Escalamiento de solicitudes complejas
- Auditoría completa de decisiones

**Endpoints principales:**

- `POST /api/v1/stockpile/approval-flows`
- `GET /api/v1/stockpile/approval-flows`
- `PUT /api/v1/stockpile/approval-flows/{id}/review`
- `POST /api/v1/stockpile/approval-flows/{id}/approve`
- `POST /api/v1/stockpile/approval-flows/{id}/reject`

### (2) Document Templates - Plantillas de Documentos

- Crear plantillas con variables dinámicas
- Actualizar contenido y estructura de plantillas
- Generar documentos usando plantillas con datos reales
- Exportar en múltiples formatos (PDF, DOCX, HTML)
- Versionar plantillas y mantener historial
- Eliminar plantillas obsoletas con validación de uso

**Endpoints principales:**

- `POST /api/v1/stockpile/document-templates`
- `GET /api/v1/stockpile/document-templates`
- `PUT /api/v1/stockpile/document-templates/{id}`
- `POST /api/v1/stockpile/document-templates/{id}/generate`
- `GET /api/v1/stockpile/document-templates/{id}/versions`

### (3) Notification System - Sistema de Notificaciones

- Crear plantillas de notificación personalizadas
- Configurar canales de envío (email, SMS, push, WhatsApp)
- Envío masivo con personalización individual
- Seguimiento de entregas y confirmaciones
- Configuración de horarios y frecuencias automáticas
- Gestión de suscripciones y preferencias de usuarios

**Endpoints principales:**

- `POST /api/v1/stockpile/notifications/templates`
- `GET /api/v1/stockpile/notifications/templates`
- `POST /api/v1/stockpile/notifications/send`
- `GET /api/v1/stockpile/notifications/status/{id}`
- `POST /api/v1/stockpile/notifications/batch`

### (4) Validation Security - Validación y Vigilancia

- Pantalla de control para personal de vigilancia
- Check-in/check-out con validación de identidad
- Verificación de permisos en tiempo real
- Alertas de seguridad automáticas
- Reportes de incidencias y anomalías
- Integración con sistemas de acceso físico

**Endpoints principales:**

- `GET /api/v1/stockpile/security/dashboard`
- `POST /api/v1/stockpile/security/checkin`
- `POST /api/v1/stockpile/security/checkout`
- `GET /api/v1/stockpile/security/alerts`
- `POST /api/v1/stockpile/security/incidents`

## 👥 Usuarios de Testing

- **Administrador General**: admin@ufps.edu.co
- **Coordinador de Programa**: coord.sistemas@ufps.edu.co
- **Personal de Vigilancia**: vigilante@ufps.edu.co
- **Docente**: docente@ufps.edu.co
- **Estudiante**: estudiante@ufps.edu.co
- **Personal Administrativo**: administrativo@ufps.edu.co

## 📊 Datos de Prueba

### Recursos para Aprobación

- Auditorios (requieren aprobación de coordinador)
- Laboratorios especializados (aprobación multinivel)
- Equipos multimedia (aprobación automática < 2 horas)
- Salas de reuniones (aprobación delegada)

### Plantillas de Documentos

- Carta de autorización de uso de auditorio
- Comprobante de reserva de laboratorio
- Informe de incidencia en recurso
- Notificación de mantenimiento programado
- Certificado de capacitación en equipos

### Tipos de Notificaciones

- Confirmación de solicitud recibida
- Aprobación/rechazo de reserva
- Recordatorio de reserva próxima (24h, 2h antes)
- Notificación de inicio de mantenimiento
- Alerta de uso no autorizado
- Reporte semanal de utilización

## ✅ Métricas Esperadas

- **Procesamiento de solicitudes**: < 1000ms
- **Generación de documentos**: < 3000ms
- **Envío de notificaciones**: < 2000ms
- **Consultas de estado**: < 500ms

## 🔍 Validaciones Específicas

- Formato de respuesta según estándar Bookly
- Códigos de error específicos del dominio
- Validación de permisos por rol
- Integridad referencial de datos
- Logs de auditoría completos
- Seguimiento de entregas de notificaciones

## 📝 Reportes Generados

Cada flujo genera un reporte detallado en `results/`:

- `approval-flows.md` - Flujos de aprobación y validación
- `document-templates.md` - Plantillas y generación de documentos
- `notification-system.md` - Sistema de notificaciones
- `validation-security.md` - Validación y vigilancia

## 🚀 Comandos de Ejecución

```bash
# Ejecutar todo el hito
make test-hito-3

# Ejecutar flujos individuales
make test-stockpile-approval
make test-stockpile-documents
make test-stockpile-notifications
make test-stockpile-security

# Ver resultados
make results-hito-3
```

## 📋 Estado de Implementación

| Flujo | Estado | Archivo |
|-------|--------|---------|
| Approval Flows | ✅ Implementado | `approval-flows.js` |
| Document Templates | ✅ Implementado | `document-templates.js` |
| Notification System | ✅ Implementado | `notification-system.js` |
| Validation Security | ✅ Implementado | `validation-security.js` |

**Cobertura Total: 100% - Todos los flujos implementados**

---

*Documentación generada automáticamente para Hito 3 - Stockpile Core*
