# Reports Service - Guía de Usuario

## 📋 Tabla de Contenido

- [🚀 Introducción](#-introducción)
- [🌐 URLs de Acceso](#-urls-de-acceso)
- [👥 Roles y Permisos](#-roles-y-permisos)
- [📊 Tipos de Reportes](#-tipos-de-reportes)
- [📈 Generación de Reportes](#-generación-de-reportes)
- [💾 Exportación de Datos](#-exportación-de-datos)
- [🎯 Dashboard Interactivo](#-dashboard-interactivo)
- [💬 Sistema de Feedback](#-sistema-de-feedback)
- [🔧 Resolución de Problemas](#-resolución-de-problemas)
- [❓ Preguntas Frecuentes](#-preguntas-frecuentes)
- [📞 Contacto y Soporte](#-contacto-y-soporte)

---

## 🚀 Introducción

El **Servicio de Reportes de Bookly** es la herramienta central para el análisis y visualización de datos del sistema de reservas institucionales de la Universidad Francisco de Paula Santander (UFPS). Este microservicio implementa los requerimientos funcionales **RF-31** a **RF-37**, proporcionando capacidades avanzadas de generación de reportes, análisis de datos y dashboards interactivos.

### Alcance del Servicio

El Reports Service gestiona:

- **RF-31**: Reportes de uso por recurso, programa académico y período de tiempo
- **RF-32**: Reportes personalizados por usuario y profesor  
- **RF-33**: Exportación de datos en múltiples formatos (CSV, Excel, PDF)
- **RF-34**: Sistema de registro y gestión de feedback de usuarios
- **RF-35**: Evaluación de usuarios por parte del staff administrativo
- **RF-36**: Dashboards interactivos con métricas en tiempo real
- **RF-37**: Análisis de demanda insatisfecha y optimización de recursos

### ¿Qué puedes hacer?

✅ **Generar reportes de uso** de recursos por programa académico y período  
✅ **Analizar patrones de usuarios** individuales y estadísticas personales  
✅ **Exportar datos** en múltiples formatos (CSV, Excel, PDF)  
✅ **Visualizar métricas** en dashboards interactivos en tiempo real  
✅ **Proporcionar feedback** sobre recursos y experiencias de uso  
✅ **Analizar demanda insatisfecha** para optimizar recursos

---

## 🌐 URLs de Acceso

| Entorno | URL Base | Descripción |
|---------|----------|-------------|
| **Producción** | `https://bookly.ufps.edu.co/reports` | Aplicación web principal |
| **Staging** | `https://ufps.booklyapp.com/reports` | Entorno de desarrollo |
| **Desarrollo** | `http://localhost:3100/reports` | Entorno de desarrollo |
| **API Base** | `https://ufps.booklyapp.com/api/v1/reports` | Endpoints REST del servicio |
| **API Docs** | `https://ufps.booklyapp.com/api/v1/reports/docs` | Documentación Swagger/OpenAPI |

---

## 👥 Roles y Permisos

| Rol | Permisos | Descripción |
|-----|----------|-------------|
| **👨‍💼 ADMIN** | Acceso completo | Todos los reportes y configuraciones del sistema |
| **🏛️ PROGRAM_ADMIN** | Reportes del programa | Reportes de su programa académico específico |
| **📋 ADMINISTRATIVE** | Reportes operacionales | Métricas administrativas y de gestión |
| **👨‍🏫 TEACHER** | Reportes propios + estudiantes | Sus reportes y los de sus estudiantes |
| **👨‍🎓 STUDENT** | Reportes personales | Solo sus propias estadísticas y reportes |

## 🔐 Acceso al Sistema

### Autenticación

1. **Inicia sesión** en el sistema Bookly con tus credenciales UFPS
2. **Navega** al módulo de "Reportes y Análisis"
3. **Verifica** que tienes los permisos necesarios según tu rol

## 📊 Tipos de Reportes

### 1. Reportes de Uso (RF-31)

**Propósito**: Analizar el uso de recursos por programa, tipo y período de tiempo.

**Información Incluida**:
- Total de reservas por recurso
- Horas de ocupación
- Tasa de ocupación promedio
- Recursos más utilizados
- Horarios pico de uso
- Comparativas por período

**Filtros Disponibles**:
```
📅 Período: Fecha inicio y fin
🏛️ Programa: Ingeniería de Sistemas, Medicina, etc.
🏢 Edificio: Por nombre o código de edificio
📍 Piso: Nivel específico del edificio
🎯 Tipo de Recurso: Salón, Laboratorio, Auditorio
📊 Métricas: Básicas o detalladas
```

### 2. Reportes de Usuario (RF-32)

**Propósito**: Estadísticas personalizadas por usuario o profesor.

**Información Incluida**:
- Historial completo de reservas
- Total de horas reservadas
- Recursos favoritos
- Patrones de uso
- Tasa de cancelaciones
- Feedback proporcionado

**Tipos de Vista**:
- **Vista Personal**: Mis propias estadísticas
- **Vista Estudiante**: Para profesores que ven estadísticas de sus estudiantes
- **Vista Programa**: Para administradores que ven usuarios de su programa

### 3. Reportes de Exportación (RF-33)

**Formatos Disponibles**:
- **CSV**: Para análisis en Excel/Google Sheets
- **Excel (.xlsx)**: Con formato y gráficos incluidos
- **PDF**: Para presentaciones o archivo físico

**Opciones de Exportación**:
- Incluir gráficos y visualizaciones
- Configurar idioma (español/inglés)
- Seleccionar columnas específicas
- Aplicar filtros personalizados

### 4. Dashboard Interactivo (RF-36)

**Métricas en Tiempo Real**:
- Reservas activas actuales
- Usuarios conectados
- Utilización de recursos
- Estado del sistema
- Tendencias de uso

**Visualizaciones Disponibles**:
- Gráficos de tendencias temporales
- Mapas de calor de ocupación
- Comparativas por programa
- Alertas y notificaciones

### 5. Análisis de Demanda (RF-37)

**Información Proporcionada**:
- Demanda total vs satisfecha
- Recursos con mayor demanda insatisfecha
- Recomendaciones de optimización
- Predicciones de necesidades futuras

## 📈 Generación de Reportes

### Proceso Paso a Paso

#### 1. Reportes de Uso

**URL**: `/reports/usage`

**Proceso**:

1. **Selecciona el tipo de reporte**: "Reporte de Uso"
2. **Configura filtros**:
   ```
   📅 Período: Enero 1, 2025 - Enero 31, 2025
   🏛️ Programa: Ingeniería de Sistemas
   🎯 Tipo: Salones de clase
   📊 Métricas: Detalladas
   ```
3. **Haz clic en "Generar Reporte"**
4. **Espera la generación** (puede tomar 30-60 segundos)
5. **Revisa los resultados** en pantalla

**Ejemplo de Resultado**:
```
📊 REPORTE DE USO - ENERO 2025
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 MÉTRICAS GENERALES
• Total de Reservas: 1,247
• Total de Horas: 3,891 horas
• Tasa de Ocupación: 74.5%
• Usuarios Únicos: 284

🏆 RECURSOS MÁS UTILIZADOS
1. Salón 101-A: 89 reservas (212 horas)
2. Lab. Sistemas 201: 67 reservas (189 horas)
3. Auditorio Principal: 23 reservas (145 horas)

⏰ HORARIOS PICO
• Mañana (8:00-12:00): 45% del uso
• Tarde (14:00-18:00): 38% del uso
• Noche (18:00-22:00): 17% del uso
```

#### 2. Reportes de Usuario

**URL**: `/reports/users/me`

**Para Ver Tu Reporte Personal**:

1. **Navega** a "Mis Reportes"
2. **Selecciona período**: Último mes, semestre, año, o personalizado
3. **Visualiza estadísticas**:
   - Reservas realizadas
   - Recursos utilizados
   - Patrones de uso
   - Feedback dado

**Ejemplo de Reporte Personal**:
```
👤 MI REPORTE - USUARIO: Juan Pérez (Estudiante)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ESTADÍSTICAS DEL MES
• Reservas Realizadas: 12
• Total de Horas: 36 horas
• Tasa de Cancelación: 8.3% (1 de 12)
• Recursos Diferentes: 5

🏆 MIS RECURSOS FAVORITOS
1. Biblioteca Central: 5 reservas
2. Salón 204-B: 3 reservas
3. Lab. Cómputo 1: 2 reservas

📅 PATRÓN DE USO
• Lunes: 25% de mis reservas
• Martes: 33% de mis reservas
• Jueves: 25% de mis reservas
• Viernes: 17% de mis reservas

💬 FEEDBACK PROPORCIONADO: 3 comentarios
```

#### 3. Dashboard en Tiempo Real

**URL**: `/dashboard`

**Características**:

- **Actualización automática** cada 30 segundos
- **Métricas en vivo** del sistema
- **Gráficos interactivos** que se pueden filtrar
- **Alertas visuales** para situaciones críticas

**Widgets Disponibles**:
```
📊 Reservas Activas: 47 en curso
👥 Usuarios Conectados: 123 activos
🏢 Ocupación General: 68% de capacidad
⚡ Estado del Sistema: Saludable
📈 Tendencia Semanal: ↗️ +12% vs semana anterior
```

## 💾 Exportación de Datos

### Proceso de Exportación

1. **Genera** o visualiza el reporte deseado
2. **Haz clic** en "Exportar Datos"
3. **Selecciona formato**:
   - **CSV**: Mejor para análisis en hojas de cálculo
   - **Excel**: Incluye formato y gráficos
   - **PDF**: Para presentaciones o archivos
4. **Configura opciones adicionales**:
   ```
   ✅ Incluir gráficos
   ✅ Agregar metadatos
   🌍 Idioma: Español
   📊 Columnas: Todas seleccionadas
   ```
5. **Confirma la exportación**
6. **Descarga** el archivo cuando esté listo (recibirás notificación)

### Gestión de Exportaciones

**Ver Historial**:
- Navega a "Mis Exportaciones"
- Ve el estado de cada exportación
- Descarga archivos completados
- Los archivos expiran después de 24 horas

**Estados de Exportación**:
- 🔄 **Procesando**: La exportación está en curso
- ✅ **Completado**: Listo para descargar
- ❌ **Error**: Hubo un problema (contacta soporte)
- ⏰ **Expirado**: El archivo ya no está disponible

## 🎯 Dashboard Interactivo

### Navegación del Dashboard

#### Panel Principal

**Métricas Clave (Tiempo Real)**:
```
┌─────────────────┬─────────────────┬─────────────────┐
│  🎯 OCUPACIÓN   │  👥 USUARIOS    │  📊 RESERVAS    │
│     68.5%       │   123 activos   │   47 activas    │
│   ↗️ +5.2%      │   ↗️ +12 nuevos │   ↘️ -3 vs ayer │
└─────────────────┴─────────────────┴─────────────────┘
```

#### Gráficos Interactivos

1. **Tendencias de Reservas**:
   - Vista diaria, semanal, mensual
   - Filtros por programa y tipo de recurso
   - Comparación con períodos anteriores

2. **Mapa de Calor de Ocupación**:
   - Visualización por edificio y piso
   - Horarios más ocupados
   - Identificación de patrones

3. **Análisis de Programas**:
   - Uso por programa académico
   - Comparativas entre facultades
   - Métricas de eficiencia

#### Alertas y Notificaciones

El sistema te notificará sobre:
- 🔴 **Alta demanda** en recursos específicos
- 🟡 **Mantenimiento programado** de recursos
- 🟢 **Nuevos recursos disponibles**
- 📊 **Reportes mensuales** listos para revisión

### Personalización del Dashboard

**Widgets Personalizables**:
- Arrastra y reorganiza widgets
- Configura métricas mostradas
- Establece alertas personalizadas
- Guarda configuraciones favoritas

## 💬 Sistema de Feedback

### Proporcionar Feedback (RF-34)

**Tipos de Feedback**:

1. **Feedback de Recurso**:
   - Calificación (1-5 estrellas)
   - Comentarios sobre el recurso
   - Reportar problemas técnicos
   - Sugerir mejoras

2. **Feedback de Experiencia**:
   - Satisfacción con el proceso de reserva
   - Facilidad de uso del sistema
   - Tiempo de respuesta
   - Sugerencias generales

**Proceso para Dar Feedback**:

1. **Completa tu reserva** o utiliza un recurso
2. **Recibe notificación** para proporcionar feedback
3. **Haz clic** en "Dar Feedback"
4. **Califica tu experiencia**:
   ```
   ⭐⭐⭐⭐⭐ Calidad del recurso
   ⭐⭐⭐⭐⭐ Proceso de reserva
   ⭐⭐⭐⭐⭐ Experiencia general
   ```
5. **Escribe comentarios** (opcional)
6. **Envía** el feedback

### Ver Feedback Agregado

**Para Administradores**:
- Dashboard de feedback consolidado
- Métricas de satisfacción por recurso
- Identificación de problemas recurrentes
- Reportes de mejoras implementadas

## 🔧 Resolución de Problemas

### Problemas Comunes

#### 1. "No puedo ver reportes de otros usuarios"

**Causa**: Permisos insuficientes  
**Solución**:
- Verifica tu rol de usuario
- Solo ADMIN y PROGRAM_ADMIN pueden ver reportes de otros
- Contacta a tu administrador para cambio de permisos

#### 2. "La exportación está tomando mucho tiempo"

**Causa**: Gran volumen de datos o servidor ocupado  
**Solución**:
- Reduce el rango de fechas del reporte
- Aplica más filtros para limitar los datos
- Intenta en horarios de menor uso (temprano en la mañana)

#### 3. "Los gráficos no se cargan en el dashboard"

**Causa**: Problemas de conexión o navegador  
**Solución**:
- Refresca la página (F5)
- Limpia caché del navegador
- Verifica tu conexión a internet
- Prueba en modo incógnito

#### 4. "No recibo notificaciones de reportes"

**Causa**: Configuración de notificaciones  
**Solución**:
- Ve a "Configuración de Perfil"
- Habilita "Notificaciones de Reportes"
- Verifica que tu email esté actualizado

### Códigos de Error Comunes

| Código | Descripción | Solución |
|--------|-------------|----------|
| **REP-001** | Filtros de fecha inválidos | Verifica formato de fechas (YYYY-MM-DD) |
| **REP-002** | Sin permisos para el reporte | Contacta administrador para permisos |
| **REP-003** | Reporte demasiado grande | Reduce rango de fechas o aplica filtros |
| **REP-004** | Error de exportación | Reintenta o contacta soporte técnico |
| **REP-005** | Dashboard no disponible | Servicio en mantenimiento, intenta más tarde |

## ❓ Preguntas Frecuentes

### Generales

**P: ¿Con qué frecuencia se actualizan los reportes?**  
R: Los reportes se actualizan en tiempo real. Los datos mostrados reflejan el estado actual del sistema.

**P: ¿Puedo programar reportes automáticos?**  
R: Sí, los usuarios ADMIN y PROGRAM_ADMIN pueden configurar reportes automáticos mensuales o semanales.

**P: ¿Los datos históricos están disponibles?**  
R: Mantenemos datos históricos por 2 años. Datos anteriores están disponibles bajo solicitud especial.

### Exportación

**P: ¿Cuál es el límite de registros para exportación?**  
R: El límite es de 100,000 registros por exportación. Para volúmenes mayores, contacta soporte técnico.

**P: ¿Cuánto tiempo están disponibles las exportaciones?**  
R: Los archivos exportados están disponibles por 24 horas después de la generación.

**P: ¿Puedo exportar gráficos?**  
R: Sí, selecciona "Incluir gráficos" en las opciones de exportación para formatos Excel y PDF.

### Dashboard

**P: ¿El dashboard consume muchos datos móviles?**  
R: El dashboard está optimizado y consume aproximadamente 1-2 MB por hora de uso activo.

**P: ¿Puedo personalizar las métricas mostradas?**  
R: Sí, haz clic en "Personalizar Dashboard" para seleccionar qué widgets mostrar.

### Feedback

**P: ¿Mi feedback es anónimo?**  
R: Puedes elegir si dar feedback anónimo o no. Por defecto, el feedback incluye tu información para seguimiento.

**P: ¿Cómo se usa mi feedback?**  
R: El feedback se usa para mejorar recursos, identificar problemas y planificar mantenimientos.

---

## 📞 Contacto y Soporte

**Para Soporte Técnico**:
- 📧 Email: `soporte-bookly@ufps.edu.co` | `soporte@ufps.booklyapp.com`
- **WhatsApp**: +57 300 123 4567

Cuando contactes soporte, incluye:
- **Usuario y rol**
- **Acción que intentabas realizar**
- **Mensaje de error exacto**
- **Capturas de pantalla**
- **Archivo problemático** (para importaciones)

---

**Documento**: User Guide - Reports Service  
**Última actualización**: 31 de Agosto, 2025  
**Versión**: 2.0.0  
**Autor**: Equipo de Desarrollo Bookly  
**Revisor**: Arquitecto de Sistemas  
**Estado**: ✅ Documentación Completa y Validada

*Universidad Francisco de Paula Santander - Sistema Bookly de Reservas Institucionales*
