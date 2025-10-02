# 🐳 Infraestructura - Bookly Backend

Este directorio contiene toda la configuración de infraestructura Docker para el despliegue del backend de Bookly, incluyendo servicios base, observabilidad y microservicios.

## 📁 Estructura

```
infrastructure/
├── docker-compose.yml                    # Archivo maestro
├── docker-compose.base.yml               # Servicios base (MongoDB, Redis, RabbitMQ)
├── docker-compose.observability.yml      # Stack de observabilidad
├── docker-compose.microservices.yml      # Microservicios de Bookly
├── .env.docker.example                   # Variables de entorno de ejemplo
├── Makefile                              # Comandos rápidos con make
├── README.docker.md                      # Documentación detallada Docker
├── docker/                               # Dockerfiles optimizados
│   ├── Dockerfile.base                   # Base común para microservicios
│   ├── Dockerfile.api-gateway            # API Gateway con Nginx
│   ├── Dockerfile.auth-service           # Servicio de autenticación
│   ├── Dockerfile.resources-service      # Gestión de recursos
│   ├── Dockerfile.availability-service   # Disponibilidad y reservas
│   ├── Dockerfile.stockpile-service      # Aprobaciones y validaciones
│   └── Dockerfile.reports-service        # Reportes y análisis
├── scripts/                              # Scripts de automatización
│   ├── bookly-docker.sh                  # Script principal de gestión
│   └── setup-dev.sh                      # Configuración rápida desarrollo
├── mongodb/                              # Configuración MongoDB Cluster
├── redis/                                # Configuración Redis optimizada
├── rabbitmq/                             # Configuración RabbitMQ + colas
├── nginx/                                # API Gateway y reverse proxy
├── otel/                                 # OpenTelemetry Collector
├── clickhouse/                           # Base de datos para telemetría
├── alertmanager/                         # Gestión de alertas
├── k8s/                                  # Manifiestos Kubernetes (futuro)
└── pulumi/                               # Infraestructura como código (futuro)
```

## 🚀 Inicio Rápido

### Prerrequisitos

1. **Docker** y **Docker Compose** instalados
2. **Node.js 22** para desarrollo local
3. **Make** (opcional, para comandos rápidos)

### Configuración Inicial

```bash
# 1. Navegar al directorio de infraestructura
cd bookly-backend/infrastructure

# 2. Configurar entorno de desarrollo
./scripts/setup-dev.sh

# 3. Iniciar servicios base para desarrollo
make dev-start
# O alternativamente:
./scripts/bookly-docker.sh start base
```

### Verificar Estado

```bash
# Ver estado de servicios
make status
# O:
./scripts/bookly-docker.sh status

# Verificar salud de servicios
make health
# O:
./scripts/bookly-docker.sh health
```

## 📦 Stacks Disponibles

### 🔧 Servicios Base (`base`)

- **MongoDB Cluster**: 3 réplicas con autenticación (puertos 27017-27019)
- **Redis**: Cache y sesiones optimizado (puerto 6379)
- **RabbitMQ**: Event-driven architecture (puertos 5672/15672)
- **Nginx**: Reverse proxy y API Gateway (puertos 80/8080)

### 📊 Observabilidad (`observability`)

- **SigNoz**: Stack completo de observabilidad (puerto 3301)
- **Sentry**: Monitoreo de errores (puerto 9001)
- **ClickHouse**: Base de datos para telemetría (puertos 8123/9000)
- **OpenTelemetry Collector**: Recolección telemetría (puertos 4317/4318)
- **Alertmanager**: Gestión de alertas (puerto 9093)

### 🎯 Microservicios (`microservices`)

- **API Gateway**: Punto de entrada principal (puerto 3000)
- **Auth Service**: Autenticación y autorización (puerto 3001)
- **Resources Service**: Gestión de recursos (puerto 3002)
- **Availability Service**: Disponibilidad y reservas (puerto 3003)
- **Stockpile Service**: Aprobaciones y validaciones (puerto 3004)
- **Reports Service**: Reportes y análisis (puerto 3005)

## ⚡ Comandos Rápidos con Make

```bash
# Configuración inicial
make dev-setup          # Configurar entorno de desarrollo

# Gestión de servicios
make dev-start          # Iniciar servicios base
make dev-stop           # Detener servicios base
make dev-restart        # Reiniciar servicios base
make status             # Ver estado de servicios
make health             # Verificar salud de servicios

# Observabilidad
make obs-start          # Iniciar stack de observabilidad
make obs-stop           # Detener observabilidad

# Microservicios
make services-start     # Iniciar microservicios
make services-stop      # Detener microservicios
make services-build     # Construir imágenes

# Datos y limpieza
make seed               # Ejecutar semillas de base de datos
make backup             # Crear backup
make clean              # Limpiar contenedores
make reset              # Reset completo (¡CUIDADO!)

# Logs y debugging
make logs               # Ver logs de todos los servicios
make logs-auth          # Ver logs del auth-service
make logs-resources     # Ver logs del resources-service
```

## 🔧 Configuración

### Variables de Entorno

Copiar y configurar el archivo de variables de entorno:

```bash
cp .env.docker.example .env.docker
# Editar .env.docker con tus configuraciones
```

### Variables Principales

```bash
# Base de datos
MONGODB_ROOT_USERNAME=bookly
MONGODB_ROOT_PASSWORD=bookly123
DATABASE_URL=mongodb://bookly:bookly123@mongodb-primary:27017,mongodb-secondary1:27017,mongodb-secondary2:27017/bookly?replicaSet=bookly-rs&authSource=admin

# Cache y sesiones
REDIS_PASSWORD=bookly123

# Autenticación
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# OAuth Google (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Observabilidad
SENTRY_DSN=your-sentry-dsn
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
```

## 🔗 URLs de Acceso

### Servicios Principales

- **API Gateway**: <http://localhost> (nginx)
- **API Management**: <http://localhost:8080>
- **Swagger Docs**: <http://localhost:3001/api/docs> (auth-service)

### Bases de Datos

- **MongoDB**: mongodb://localhost:27017,27018,27019
- **Redis**: redis://localhost:6379
- **RabbitMQ Management**: <http://localhost:15672>

### Observabilidad

- **SigNoz**: <http://localhost:3301>
- **Sentry**: <http://localhost:9001>
- **Alertmanager**: <http://localhost:9093>

## 🔐 Credenciales por Defecto

```bash
# MongoDB
Usuario: bookly
Contraseña: bookly123

# RabbitMQ Management
Usuario: bookly  
Contraseña: bookly123

# Sentry
Usuario: admin@bookly.local
Contraseña: admin123
```

## 📊 Arquitectura y Monitoreo

La infraestructura incluye:

- **Health Checks**: Verificación automática de estado de servicios
- **Logging**: Logs estructurados con Winston
- **Metrics**: Métricas de aplicación y sistema con SigNoz
- **Tracing**: Trazabilidad distribuida con OpenTelemetry
- **Alerting**: Alertas automáticas via Sentry y Alertmanager
- **Event-Driven Architecture**: Comunicación asíncrona con RabbitMQ

## 🔒 Seguridad

- **Redes Docker aisladas**: `bookly-network` y `bookly-observability`
- **Usuarios no-root** en todos los contenedores
- **Autenticación obligatoria** en MongoDB, Redis y RabbitMQ
- **Rate limiting** en API Gateway (Nginx)
- **Health checks** y resource limits para todos los servicios
- **Keyfile MongoDB** para autenticación entre réplicas del cluster

## 📚 Documentación Adicional

- **README.docker.md**: Documentación detallada de Docker con troubleshooting
- **Makefile**: Lista completa de comandos disponibles
- **scripts/bookly-docker.sh**: Script con 20+ comandos de gestión

## 🚨 Troubleshooting Rápido

```bash
# Ver logs de errores
make logs | grep -i error

# Verificar uso de recursos
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Reiniciar servicios problemáticos
make dev-restart

# Limpiar y reiniciar desde cero
make clean && make dev-setup && make dev-start
```

## 🔮 Futuro: Kubernetes y Cloud

Los directorios `k8s/` y `pulumi/` están preparados para futuras implementaciones de:

- **Kubernetes**: Manifiestos para despliegue en K8s
- **Pulumi**: Infraestructura como código para cloud providers
- **Helm Charts**: Paquetes para despliegue en Kubernetes

---

**📖 Para documentación completa**: Ver `README.docker.md`  
**⚠️ Nota**: Esta configuración está optimizada para desarrollo. Para producción, revisar las recomendaciones de seguridad en la documentación detallada.
