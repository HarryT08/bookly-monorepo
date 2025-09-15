# Hito {{HITO_NUMBER}} - {{HITO_NAME}}

## 📋 Resumen

**Estado:** {{STATUS}}  
**Cobertura:** {{COVERAGE}}% - {{COVERAGE_DESCRIPTION}}  
**Flujos:** {{FLOW_COUNT}} flujos completos de testing

Tests completos para validar la funcionalidad del **Hito {{HITO_NUMBER}} - {{HITO_NAME}}** del sistema Bookly.

## 🎯 Objetivos

{{OBJECTIVES_LIST}}

## 📁 Flujos de Testing

{{FLOWS_SECTION}}

## 👥 Usuarios de Prueba

Basados en los datos de `conf-test-data.js`:

- **Estudiante:** `{{STUDENT_EMAIL}}` / `{{STUDENT_PASSWORD}}`
- **Docente:** `{{TEACHER_EMAIL}}` / `{{TEACHER_PASSWORD}}`
- **Admin Programa:** `{{ADMIN_PROG_EMAIL}}` / `{{ADMIN_PROG_PASSWORD}}`
- **Admin General:** `{{ADMIN_GEN_EMAIL}}` / `{{ADMIN_GEN_PASSWORD}}`
- **Vigilante:** `{{SECURITY_EMAIL}}` / `{{SECURITY_PASSWORD}}`

## 📊 Datos de Prueba

Utilizando datos estandarizados de `conf-test-data.js` y `GenerateTestData`:

{{TEST_DATA_SECTION}}

## ✅ Métricas de Rendimiento Esperadas

{{PERFORMANCE_METRICS}}

## 🔍 Validaciones Específicas

- Formato de respuesta según estándar Bookly API
- Códigos de error específicos ({{ERROR_CODE_PREFIX}}-XXXX)
- Validación de datos obligatorios
- Restricciones de unicidad
- Permisos por rol de usuario
- Integridad referencial
- Logs de auditoría completos

## 📝 Reportes Generados

Cada flujo genera un reporte detallado en `results/`:

{{REPORTS_LIST}}

## 🚀 Comandos de Ejecución

```bash
# Ejecutar todo el hito
make test-hito-{{HITO_NUMBER}}

# Ejecutar flujos individuales
{{INDIVIDUAL_COMMANDS}}

# Ver resultados
make results-hito-{{HITO_NUMBER}}
```

## 📋 Estado de Implementación

| Flujo | Estado | Archivo |
|-------|--------|---------|
{{IMPLEMENTATION_TABLE}}

**Cobertura Total: {{COVERAGE}}% - {{COVERAGE_DESCRIPTION}}**

---

*Documentación generada automáticamente para Hito {{HITO_NUMBER}} - {{HITO_NAME}}*
