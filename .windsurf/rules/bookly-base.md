---
trigger: always_on
---

# Bookly – Sistema de Reservas Institucionales
Bookly es una solución tecnológica diseñada para optimizar la gestión de reservas de espacios y recursos institucionales (salas, auditorios, equipos, etc.) en universidades como la Universidad Francisco de Paula Santander (UFPS).
## ✨ Arquitectura General
Bookly sigue los principios de:
- Arquitectura Hexagonal (Ports & Adapters)
- Clean Code
- CQRS (Command Query Responsibility Segregation)
- Event-Driven Architecture (EDA)
- Behavior-Driven Development (BDD) con Jasmine
- Infraestructura como Código (IaC) con Pulumi
- Monorepo gestionado con Nx
## 📦 Estructura del Proyecto (Monorepo Nx)
bookly-monorepo/
├── apps/                                # Aplicaciones independientes (microservicios + frontend)
│   ├── auth-service/                    # Servicio de autenticación y control de accesos
│   │   ├── src/
│   │   │   ├── application/             # CQRS: commands, queries, use-cases
│   │   │   ├── domain/                  # Entidades, interfaces y lógica de dominio
│   │   │   ├── infrastructure/          # Adaptadores HTTP, DB, eventos
│   │   │   ├── config/                  # Configuración del microservicio
│   │   │   └── main.ts                  # Bootstrap de NestJS
│   │   ├── test/                        # Pruebas unitarias y BDD
│   │   └── Dockerfile
│
│   ├── resources-service/               # Gestión de recursos físicos (salas, equipos, etc.)
│   ├── availability-service/            # Gestión de horarios y reservas
│   ├── stockpile-service/               # Flujos de aprobación y validación
│   ├── reports-service/                 # Generación de reportes y dashboards
│   ├── api-gateway/                     # Puerta de enlace para unificar peticiones externas
│   └── bookly-web/                      # Frontend en Next.js
│       ├── public/
│       ├── pages/                       # Páginas (routes) de Next.js
│       ├── components/
│       │   ├── atoms/                   # Elementos básicos: Botón, Input, Label, etc.
│       │   ├── molecules/               # Composición de varios átomos
│       │   ├── organisms/               # Secciones completas de UI
│       │   ├── templates/               # Layout general de páginas
│       │   └── pages/                   # Páginas ensambladas con templates
│       ├── services/                    # Llamadas a APIs
│       ├── hooks/                       # Custom React hooks
│       ├── store/                       # Redux Toolkit o Zustand
│       ├── i18n/                        # Configuración multilenguaje
│       └── next.config.js

├── libs/                                # Librerías reutilizables compartidas
│   ├── common/                          # Pipes, interceptors, middlewares
│   ├── dto/                             # Data Transfer Objects compartidos
│   ├── event-bus/                       # Base del sistema de eventos (RabbitMQ, Redis)
│   ├── logging/                         # Configuración global de Winston
│   ├── monitoring/                      # Integración con OpenTelemetry y Sentry

├── infrastructure/                      # Definición de infraestructura
│   ├── pulumi/
│   │   ├── index.ts                     # Entrada principal
│   │   ├── kubernetes.ts               # Clúster y servicios
│   │   ├── redis.ts                    # Redis Cluster
│   │   ├── database.ts                 # MongoDB Atlas
│   │   └── api-gateway.ts              # Configuración del API Gateway
│   ├── k8s/
│   │   ├── deployments/                # YAMLs de despliegue por microservicio
│   │   ├── services/                   # Exposición de servicios
│   │   └── ingress/                    # Regla de entrada pública
│   └── scripts/
│       ├── deploy.sh                   # Script de despliegue
│       └── setup-env.sh                # Configuración de entorno

├── .github/workflows/                  # CI/CD con GitHub Actions
│   ├── ci-cd.yml
│   ├── sonar-analysis.yml
│   └── deploy-k8s.yml

├── tests/                              # Pruebas de integración globales
├── nx.json                             # Configuración de Nx
├── package.json                        # Dependencias del monorepo
├── tsconfig.base.json                  # Configuración base de TypeScript
└── README.md                           # Documentación general del proyecto

## 🧠 Arquitectura

Bookly implementa una arquitectura moderna basada en:

- **Clean Architecture**: separación de responsabilidades entre dominio, aplicación e infraestructura. Cada microservicio respeta esta estructura (`src/domain`, `src/application`, `src/infrastructure`).
- **CQRS + Event-Driven Architecture (EDA)**: separación entre comandos y consultas. Los eventos como `ReservationCreated` son publicados y manejados asincrónicamente a través de RabbitMQ. Usar Redis para manejar la cache de datos.
- **BDD con Jasmine**: pruebas estructuradas usando el patrón Given-When-Then, validadas automáticamente en cada commit vía GitHub Actions.
- **Swagger + AsyncAPI**: documentación automática de APIs REST y eventos distribuidos, centralizada en el `api-gateway`.

Estas arquitecturas debe asegurar modularidad, escalabilidad y trazabilidad.