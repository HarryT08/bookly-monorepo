# 🐳 Bookly Backend - Docker Infrastructure

Configuración completa de Docker para el backend de Bookly, incluyendo servicios base, observabilidad y microservicios.

## 📋 Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Bookly Docker Stack                     │
├─────────────────────────────────────────────────────────────┤
│  🌐 API Gateway (Nginx) - Puerto 80/8080                  │
├─────────────────────────────────────────────────────────────┤
│                   Microservicios                           │
│  • auth-service:3001      • stockpile-service:3004         │
│  • resources-service:3002 • reports-service:3005           │
│  • availability-service:3003                               │
├─────────────────────────────────────────────────────────────┤
│                   Servicios Base                           │
│  • MongoDB Cluster (3 réplicas): 27017-27019              │
│  • Redis Cache: 6379                                       │
│  • RabbitMQ: 5672, Management: 15672                      │
├─────────────────────────────────────────────────────────────┤
│                  Observabilidad                            │
│  • SigNoz Frontend: 3301                                   │
│  • Sentry: 9001                                            │
│  • OpenTelemetry Collector: 4317/4318                     │
│  • ClickHouse: 9000/8123                                   │
│  • Alertmanager: 9093                                      │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Inicio Rápido para Desarrollo

### 1. Configuración Inicial
```bash
# Navegar al directorio de infraestructura
cd bookly-backend/infrastructure

# Configurar entorno de desarrollo
./scripts/setup-dev.sh
```

### 2. Iniciar Servicios Base
```bash
# Solo servicios base (MongoDB, Redis, RabbitMQ)
./scripts/bookly-docker.sh start base

# O usar make
make dev-start
```

### 3. Verificar Estado
```bash
# Ver estado de servicios
./scripts/bookly-docker.sh status

# Verificar salud
./scripts/bookly-docker.sh health

# Ver logs
./scripts/bookly-docker.sh logs
```

## 📦 Stacks Disponibles

### 🔧 Servicios Base (`base`)
- **MongoDB Cluster**: 3 réplicas con autenticación
- **Redis**: Cache y sesiones
- **RabbitMQ**: Event-driven architecture
- **Nginx**: Reverse proxy y API Gateway

### 📊 Observabilidad (`observability`)
- **SigNoz**: Métricas, trazas y logs
- **Sentry**: Monitoreo de errores
- **ClickHouse**: Base de datos para telemetría
- **OpenTelemetry**: Collector de telemetría
- **Alertmanager**: Gestión de alertas

### 🎯 Microservicios (`microservices`)
- **API Gateway**: Punto de entrada principal
- **Auth Service**: Autenticación y autorización
- **Resources Service**: Gestión de recursos
- **Availability Service**: Disponibilidad y reservas
- **Stockpile Service**: Aprobaciones y validaciones
- **Reports Service**: Reportes y análisis

## 🛠️ Comandos Principales

### Gestión General
```bash
# Inicializar configuración completa
./scripts/bookly-docker.sh init

# Iniciar todos los servicios
./scripts/bookly-docker.sh start

# Detener todos los servicios
./scripts/bookly-docker.sh stop

# Reiniciar servicios
./scripts/bookly-docker.sh restart

# Ver estado
./scripts/bookly-docker.sh status
```

### Gestión por Stack
```bash
# Solo servicios base
./scripts/bookly-docker.sh start base
./scripts/bookly-docker.sh stop base

# Solo observabilidad
./scripts/bookly-docker.sh start observability
./scripts/bookly-docker.sh stop observability

# Solo microservicios
./scripts/bookly-docker.sh start microservices
./scripts/bookly-docker.sh stop microservices
```

### Logs y Debugging
```bash
# Logs de todos los servicios
./scripts/bookly-docker.sh logs

# Logs de un servicio específico
./scripts/bookly-docker.sh logs auth-service

# Shell de un contenedor
./scripts/bookly-docker.sh shell mongodb-primary

# Ejecutar comando en contenedor
./scripts/bookly-docker.sh exec redis redis-cli info
```

### Construcción y Limpieza
```bash
# Construir imágenes de microservicios
./scripts/bookly-docker.sh build

# Limpiar contenedores y volúmenes
./scripts/bookly-docker.sh clean

# Reset completo (¡CUIDADO!)
./scripts/bookly-docker.sh reset --force
```

### Gestión de Datos
```bash
# Ejecutar semillas de base de datos
./scripts/bookly-docker.sh seed

# Crear backup
./scripts/bookly-docker.sh backup

# Verificar salud de servicios
./scripts/bookly-docker.sh health
```

## ⚙️ Configuración

### Archivo .env.docker
Copiar y configurar el archivo de variables de entorno:
```bash
cp .env.docker.example .env.docker
# Editar .env.docker con tus configuraciones
```

### Variables Importantes
```bash
# Base de datos
MONGODB_ROOT_USERNAME=bookly
MONGODB_ROOT_PASSWORD=bookly123
DATABASE_URL=mongodb://bookly:bookly123@mongodb-primary:27017,mongodb-secondary1:27017,mongodb-secondary2:27017/bookly?replicaSet=bookly-rs&authSource=admin

# Cache
REDIS_PASSWORD=bookly123

# JWT
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
- **API Gateway**: http://localhost
- **API Management**: http://localhost:8080
- **Auth Service**: http://localhost:3001
- **Resources Service**: http://localhost:3002

### Bases de Datos
- **MongoDB**: mongodb://localhost:27017,27018,27019
- **Redis**: redis://localhost:6379
- **RabbitMQ**: amqp://localhost:5672
- **RabbitMQ Management**: http://localhost:15672

### Observabilidad
- **SigNoz**: http://localhost:3301
- **Sentry**: http://localhost:9001
- **ClickHouse**: http://localhost:8123
- **Alertmanager**: http://localhost:9093

## 🔐 Credenciales por Defecto

```bash
# MongoDB
Usuario: bookly
Contraseña: bookly123

# Redis
Contraseña: bookly123

# RabbitMQ
Usuario: bookly
Contraseña: bookly123

# Sentry
Usuario: admin@bookly.local
Contraseña: admin123

# ClickHouse
Usuario: signoz
Contraseña: signoz123
```

## 📁 Estructura de Archivos

```
infrastructure/
├── docker-compose.yml              # Archivo maestro
├── docker-compose.base.yml         # Servicios base
├── docker-compose.observability.yml # Observabilidad
├── docker-compose.microservices.yml # Microservicios
├── .env.docker.example             # Variables de entorno
├── docker/                         # Dockerfiles
│   ├── Dockerfile.base
│   ├── Dockerfile.api-gateway
│   ├── Dockerfile.auth-service
│   ├── Dockerfile.resources-service
│   ├── Dockerfile.availability-service
│   ├── Dockerfile.stockpile-service
│   └── Dockerfile.reports-service
├── scripts/                        # Scripts de gestión
│   ├── bookly-docker.sh            # Script principal
│   └── setup-dev.sh                # Configuración desarrollo
├── mongodb/                        # Config MongoDB
│   ├── init-replica.js
│   └── keyfile/
├── redis/                          # Config Redis
│   └── redis.conf
├── rabbitmq/                       # Config RabbitMQ
│   ├── rabbitmq.conf
│   └── definitions.json
├── nginx/                          # Config Nginx
│   └── nginx.conf
├── otel/                           # Config OpenTelemetry
│   └── otel-collector-config.yaml
├── clickhouse/                     # Config ClickHouse
│   ├── clickhouse-config.xml
│   └── clickhouse-users.xml
└── alertmanager/                   # Config Alertmanager
    └── alertmanager.yml
```

## 🛡️ Seguridad

### Configuraciones de Seguridad
- **Redes Docker aisladas**: `bookly-network` y `bookly-observability`
- **Usuarios no-root** en todos los contenedores
- **Autenticación obligatoria** en MongoDB y Redis
- **Rate limiting** en Nginx
- **Health checks** para todos los servicios
- **Keyfile de MongoDB** para autenticación entre réplicas

### Recomendaciones de Producción
1. **Cambiar todas las contraseñas por defecto**
2. **Configurar certificados SSL/TLS**
3. **Habilitar autenticación en todos los servicios**
4. **Configurar firewall y network policies**
5. **Implementar secretos con Docker Secrets o Kubernetes Secrets**
6. **Configurar backup automático**
7. **Monitorear logs de seguridad**

## 🚨 Troubleshooting

### Problemas Comunes

#### MongoDB no inicia
```bash
# Verificar permisos del keyfile
chmod 400 mongodb/keyfile/mongodb-keyfile

# Ver logs
./scripts/bookly-docker.sh logs mongodb-primary
```

#### Error de memoria
```bash
# Ajustar límites en .env.docker
MEMORY_HEAP_THRESHOLD_MB=2048
MEMORY_RSS_THRESHOLD_MB=2048
```

#### Puerto en uso
```bash
# Ver qué proceso usa el puerto
lsof -i :3001

# Cambiar puerto en .env.docker o detener el proceso
```

#### Servicios no se conectan
```bash
# Verificar redes Docker
docker network ls | grep bookly

# Recrear redes
docker network rm bookly-network bookly-observability
./scripts/bookly-docker.sh init
```

### Comandos de Diagnóstico
```bash
# Estado detallado
docker ps -a | grep bookly

# Uso de recursos
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Logs de error
docker-compose logs --tail=100 | grep -i error

# Verificar configuración
docker-compose config
```

## 📚 Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Replica Set](https://docs.mongodb.com/manual/replication/)
- [Redis Configuration](https://redis.io/documentation)
- [RabbitMQ Management](https://www.rabbitmq.com/management.html)
- [SigNoz Documentation](https://signoz.io/docs/)
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)

## 🤝 Contribuir

Para reportar problemas o contribuir mejoras:

1. Verificar que el problema no esté ya reportado
2. Incluir logs relevantes y configuración
3. Describir pasos para reproducir el problema
4. Proponer solución si es posible

---

**⚠️ Nota**: Esta configuración está optimizada para desarrollo. Para producción, revisar las recomendaciones de seguridad y ajustar configuraciones según el entorno.
