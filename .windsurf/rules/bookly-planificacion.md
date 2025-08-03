---
trigger: manual
---

## Establecimiento de Hitos

### Fase 1: Funcionalidades Básicas (Core)

**Hito 1 – Gestión de Recursos Core**  
Implementación de RF-01, RF-03 y RF-05 (creación, atributos esenciales y configuración de reglas)

**Hito 2 – Disponibilidad y Reservas Core**  
Implementación de RF-07, RF-08, RF-10 y RF-11 (definición de horarios, integración con calendarios, visualización en calendario y registro de historial)

**Hito 3 – Aprobaciones Básicas**  
Implementación de RF-20, RF-21 y RF-22 (validación de solicitudes, generación de documentos y notificación automática)

**Hito 4 – Auth Core**  
Implementación de RF-41, RF-42 y RF-43 (gestión de roles, restricciones y autenticación básica)

**Hito 5 – Reportes Básicos**  
Implementación de RF-31, RF-32 y RF-33 (generación de reportes de uso y exportación en CSV)

---

### Fase 2: Funcionalidades Complementarias

**Hito 6 – Mejoras en Gestión de Recursos**  
Implementación de RF-02 y RF-04 (asociación a categorías y importación masiva)  
Desarrollo opcional de RF-06 (módulo de mantenimiento)

**Hito 7 – Funcionalidades Avanzadas en Disponibilidad y Reservas**  
Implementación de RF-12, RF-14 y RF-15 (reservas periódicas, lista de espera y reasignación)  
Optimización de RF-9 (búsqueda avanzada)

**Hito 8 – Funcionalidades Avanzadas en Aprobaciones**  
Implementación de RF-23, RF-24 y RF-25 (pantalla de vigilancia, flujos de aprobación avanzados y registro detallado)  
Desarrollo opcional de RF-26, RF-27 y RF-28 (check-in/check-out digital e integración con mensajería)

**Hito 9 – Funcionalidades Avanzadas en Reportes y Análisis**  
Implementación de RF-34 y RF-35 (feedback y evaluación de usuarios)  
Desarrollo opcional de RF-36 y RF-37 (dashboards interactivos y reporte de demanda insatisfecha)

**Hito 10 – Mejoras en Auth Complementario**  
Implementación de RF-44 y RF-45 (registro de accesos y verificación de identidad avanzada)

---

## Definición y alcance de objetivos

### Objetivos Funcionales y Técnicos

#### Objetivos Funcionales

- **Gestión de Reservas**: Automatizar la solicitud, validación, aprobación y seguimiento de reservas de espacios (salas, auditorios, etc.).
- **Visualización en Tiempo Real**: Proporcionar una interfaz interactiva (por ejemplo, calendario) que muestre la disponibilidad de recursos en tiempo real.
- **Gestión de Usuarios y Roles**: Permitir la creación y administración de cuentas diferenciadas (profesores, estudiantes, personal administrativo, vigilantes) con sus respectivos permisos.
- **Generación de Reportes y Análisis**: Desarrollar módulos que faciliten la generación de reportes, exportación de datos (CSV) y visualización de estadísticas para la toma de decisiones.
- **Notificaciones y Documentación Automática**: Automatizar la generación de documentos (aprobación o rechazo de solicitudes) y notificar a los usuarios mediante correo o WhatsApp.

#### Objetivos Técnicos

- **Arquitectura Modular y Escalable**: Implementar una solución basada en microservicios utilizando NestJS, organizados en un monorepo con NX, que facilite el mantenimiento y escalabilidad.
- **Patrones de Diseño Modernos**: Aplicar CQRS, Event-Driven Architecture (EDA) y la Arquitectura Hexagonal (Ports & Adapters) para separar la lógica de negocio de las interfaces y mejorar la testabilidad.
- **Infraestructura como Código (IaC)**: Gestionar el despliegue y la infraestructura en la nube de forma programática mediante Pulumi.
- **Seguridad y Monitoreo**: Garantizar autenticación robusta (SSO, doble factor), control de accesos, logging estructurado con Winston y monitoreo/trazabilidad con OpenTelemetry y Sentry.
- **Integración Continua y Pruebas Automatizadas**: Incorporar pipelines de CI/CD (GitHub Actions) y pruebas BDD con Jasmine para asegurar la calidad del software.

---

## Límites del Sistema y Delimitación del Alcance

### Límites del Sistema

**Ámbito Funcional:**  
- La solución se centra exclusivamente en la gestión de reservas de espacios institucionales de la UFPS, sin extenderse a otros procesos o departamentos fuera del ámbito académico y administrativo.  
- Se delimita a la administración y control de recursos como salas, auditorios y otros espacios físicos gestionados por la universidad.

**Ámbito Técnico:**  
- El sistema se construirá bajo los principios de microservicios, utilizando tecnologías específicas (NestJS, MongoDB, Redis, etc.) y siguiendo los patrones arquitectónicos establecidos (CQRS, EDA, Arquitectura Hexagonal).  
- La infraestructura se gestionará mediante IaC (Pulumi), lo que delimita el alcance a entornos compatibles con esta tecnología.

---

### Delimitación para Evitar Proliferación de Requerimientos

**Enfoque en Funcionalidades Esenciales:**  
- Priorizar el desarrollo de las funcionalidades críticas para asegurar el funcionamiento del núcleo del sistema (core), dejando funcionalidades complementarias para futuras iteraciones.

**Validación y Retroalimentación Continua:**  
- Establecer sesiones periódicas con stakeholders para revisar y validar los requerimientos, asegurando que se mantenga el enfoque en los objetivos principales.

**Documentación y Gestión de Cambios:**  
- Utilizar herramientas de gestión de requerimientos que permitan registrar, priorizar y controlar cualquier cambio, evitando la adición de funcionalidades no esenciales.

**Fases de Desarrollo Iterativo:**  
- Dividir el proyecto en fases claramente definidas (funcionalidades básicas vs. complementarias), lo que permite concentrar los recursos en lo esencial y expandir el sistema de manera controlada.
