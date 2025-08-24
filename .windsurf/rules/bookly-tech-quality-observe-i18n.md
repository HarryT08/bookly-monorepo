---
trigger: always_on
---

## 🛠️ Tecnologías

Bookly está construido sobre un stack moderno y escalable, agrupado por función:

### Backend
- NestJS (framework modular)
- Prisma (ORM sobre MongoDB)
- MongoDB Atlas (base de datos NoSQL distribuida)
- Swagger + AsyncAPI (documentación automática de APIs REST y eventos distribuidos, centralizada en el `api-gateway`)

### Comunicación y Eventos
- Redis (cache)
- RabbitMQ (eventos distribuidos)
- WebSockets (notificaciones en tiempo real)

### Observabilidad
- Winston (logging estructurado)
- OpenTelemetry (trazabilidad)
- Sentry (notificación de errores)

### Frontend
- Next.js (SSR/CSR)
- Redux Toolkit (estado global)
- SWR (queries cacheables)
- Storybook (documentación de UI)

### Infraestructura & DevOps
- Nx (gestión monorepo del proyecto)
- Pulumi (IaC en TypeScript)
- GitHub Actions (CI/CD)
- Kubernetes (EKS/GKE/AKS)



## ✅ Calidad

Bookly aplica controles de calidad automatizados y auditables, integrados desde el desarrollo hasta producción:

- **SonarQube + GitHub Actions**: Ejecuta análisis estático en cada PR. Evalúa cobertura, duplicación, mantenibilidad y seguridad. Archivo: `.github/workflows/sonar-analysis.yml`
- **Jasmine + Given-When-Then**: Pruebas BDD para cada microservicio. Se encuentran en `apps/*-service/test/`, cubren lógica de dominio y validaciones de flujo.
- **Auditoría estructurada**: Todas las acciones críticas son registradas mediante Winston y enviadas a Sentry. Configuración en `libs/logging/`.
- **Cobertura de pruebas automática**: Generada en cada commit con `npm run test:cov`. Requiere >80% para permitir despliegue.



## 📊 Observabilidad

Bookly cuenta con una capa de observabilidad distribuida que permite rastrear errores, monitorear acciones del sistema y detectar cuellos de botella en tiempo real:

- **Logs con Winston**: Registra cada evento importante (inicio de sesión, creación de reserva, errores) en formato estructurado JSON. Centraliza logs por servicio. Ubicado en `libs/logging/`.
- **Trazabilidad con OpenTelemetry**: Permite seguir el rastro de cada solicitud y evento entre microservicios. Se usa en flujos CQRS y EDA, midiendo tiempos de ejecución. Ubicado en `libs/monitoring/`.
- **Alertas con Sentry**: Captura excepciones y errores críticos en frontend y backend. Permite crear alertas automáticas sobre errores como `reservation_conflict`, `auth_failure`, etc. Configurado en `libs/monitoring/`.

Todos los servicios heredan esta configuración, y los errores se tipifican según el estándar de respuesta JSON con los siguientes campos:

```json
{
  "code": "RSRC-0301",
  "message": "El recurso solicitado no existe o ha sido eliminado.",
  "type": "error",
  "exception_code": "R-20",
  "http_code": 404,
  "http_exception": "NotFoundException"
}
```
Donde:
- `code`: Identificador único compuesto por el módulo (ej. RSRC) y el número de error.
- `message`: Descripción legible del error que puede mostrarse al usuario.
- `type`: Clasificación del error (error, warning, info).
- `exception_code`: Código interno para seguimiento.
- `http_code`: Código de estado HTTP correspondiente.
- `http_exception`: Excepción HTTP lanzada por NestJS.



## 🌍 Internacionalización

Bookly soporta múltiples idiomas tanto en su frontend como backend. Esto permite brindar una experiencia localizada para usuarios de diferentes lenguas, cumpliendo con estándares de accesibilidad y usabilidad global.

- **nestjs-i18n**: Utilizado en el backend para traducir mensajes de error, respuestas API y validaciones. Detecta el idioma desde el token JWT o encabezado HTTP. Las traducciones están en `libs/i18n/translations/`.
- **react-i18next**: Usado en el frontend (Next.js) para traducir componentes, formularios, mensajes y feedback visual. Soporta namespaces y carga dinámica. Las traducciones se encuentran en `apps/bookly-web/i18n/`.

Ambos están integrados en CI/CD y se prueban mediante snapshots y validaciones de traducciones en las pruebas BDD. Las claves de traducción siguen una estructura común y se versionan junto con el código.
