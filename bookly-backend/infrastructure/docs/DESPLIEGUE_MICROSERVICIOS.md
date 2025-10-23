# Guía de Despliegue - Servicios Base + Microservicios

## Problema Resuelto

✅ **Error**: `the attribute 'version' is obsolete, it will be ignored`  
✅ **Error**: `service "stockpile-service" depends on undefined service "otel"`

## Soluciones Aplicadas

### 1. Eliminada Directiva `version` Obsoleta

La directiva `version: '3.8'` es obsoleta en Docker Compose v2. Se eliminó de:

- ✅ `docker-compose.base.yml`
- ✅ `docker-compose.microservices.yml`
- ✅ `docker-compose.observability.yml`
- ✅ `docker-compose.yml`

### 2. Eliminadas Dependencias de Observabilidad

Los microservicios ya NO requieren el stack de observabilidad para funcionar:

- ✅ Eliminada red `bookly-observability` de todos los microservicios
- ✅ Ahora solo usan la red `bookly-network` (servicios base)
- ✅ Variables de entorno de observabilidad siguen disponibles pero son opcionales

## Comandos Disponibles

### Opción 1: Servicios Base + Microservicios (Recomendado)

```bash
# Iniciar todo junto (usa docker-compose.dev.yml)
make dev-full

# Ver logs
make dev-full-logs

# Detener todo
make dev-full-stop

# O paso por paso
make dev-start        # 1. Inicia MongoDB, Redis, RabbitMQ
make microservices    # 2. Inicia los 6 microservicios
```

**Nota**: `make dev-full` usa `docker-compose.dev.yml` que incluye automáticamente `base.yml` y `microservices.yml`.

### Opción 2: Solo Servicios Base (Sin Microservicios)

```bash
# Solo infraestructura base
make dev-start

# Detener nginx si no lo necesitas
make nginx-stop
```

### Opción 3: Control Granular

```bash
# Gestión de microservicios
make microservices          # Iniciar microservicios
make microservices-stop     # Detener microservicios
make microservices-restart  # Reiniciar microservicios
make microservices-logs     # Ver logs en tiempo real

# Gestión de servicios base
make dev-start              # Iniciar base
make dev-stop               # Detener base
make dev-restart            # Reiniciar base

# Gestión de nginx
make nginx-start            # Iniciar nginx
make nginx-stop             # Detener nginx
make nginx-restart          # Reiniciar nginx
make nginx-status           # Ver estado
```

### Opción 4: Control Individual por Servicio

Ahora puedes gestionar cada servicio individualmente:

```bash
# Servicios Base
make mongodb-primary-start/stop/restart/logs
make redis-start/stop/restart/logs
make rabbitmq-start/stop/restart/logs

# Microservicios
make api-gateway-start/stop/restart/logs
make auth-start/stop/restart/logs
make resources-start/stop/restart/logs
make availability-start/stop/restart/logs
make stockpile-start/stop/restart/logs
make reports-start/stop/restart/logs
```

**Ver guía completa**: `docs/COMANDOS_SERVICIOS.md`

## Workflow Típico de Desarrollo

### Desarrollo Solo con Base de Datos

```bash
# 1. Iniciar servicios base
make dev-start

# 2. Detener nginx (opcional, evita errores)
make nginx-stop

# 3. Trabajar con MongoDB, Redis, RabbitMQ directamente
# ...

# 4. Ver logs si necesitas
make dev-logs
```

### Desarrollo Full Stack (Base + Microservicios)

```bash
# 1. Iniciar todo
make dev-full

# 2. Verificar que todo esté corriendo
docker ps

# 3. Iniciar nginx si necesitas proxy
make nginx-start

# 4. Acceder a los servicios
# API Gateway: http://localhost:3000
# Auth Service: http://localhost:3001
# Resources Service: http://localhost:3002
# Availability Service: http://localhost:3003
# Stockpile Service: http://localhost:3004
# Reports Service: http://localhost:3005

# 5. Ver logs de un servicio específico
docker logs bookly-api-gateway -f
```

### Desarrollo Solo Microservicios (Base ya corriendo)

```bash
# Si los servicios base ya están corriendo:
make microservices

# Reiniciar un microservicio específico
docker restart bookly-auth-service

# Ver logs
docker logs bookly-auth-service -f
```

## Verificación

### Verificar Servicios Base

```bash
# Ver estado
docker ps | grep -E "mongodb|redis|rabbitmq"

# Debe mostrar:
# - bookly-mongodb-primary (healthy)
# - bookly-mongodb-secondary1 (healthy)
# - bookly-mongodb-secondary2 (healthy)
# - bookly-redis (healthy)
# - bookly-rabbitmq (healthy)
```

### Verificar Microservicios

```bash
# Ver todos los microservicios
docker ps | grep bookly | grep -E "gateway|auth|resources|availability|stockpile|reports"

# Debe mostrar:
# - bookly-api-gateway
# - bookly-auth-service
# - bookly-resources-service
# - bookly-availability-service
# - bookly-stockpile-service
# - bookly-reports-service

# Verificar health de cada uno
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # Resources
curl http://localhost:3003/health  # Availability
curl http://localhost:3004/health  # Stockpile
curl http://localhost:3005/health  # Reports
```

## Arquitectura de Red

### Red `bookly-network`

Todos los servicios (base + microservicios) están conectados a esta red:

```
bookly-network
├── mongodb-primary (27017)
├── mongodb-secondary1 (27018)
├── mongodb-secondary2 (27019)
├── redis (6379)
├── rabbitmq (5672, 15672)
├── nginx (80, 8080)
├── api-gateway (3000)
├── auth-service (3001)
├── resources-service (3002)
├── availability-service (3003)
├── stockpile-service (3004)
└── reports-service (3005)
```

### Red `bookly-observability` (Opcional)

Solo se necesita si despliegas el stack de observabilidad:

```bash
# Iniciar observabilidad
make observability

# Servicios disponibles:
# - SigNoz: http://localhost:3301
# - Sentry: http://localhost:9001
# - OpenTelemetry Collector: 4317/4318
```

## Variables de Entorno

### DATABASE_URL para Microservicios

Los microservicios usan hostnames Docker:

```env
DATABASE_URL=mongodb://bookly:bookly123@mongodb-primary:27017,mongodb-secondary1:27017,mongodb-secondary2:27017/bookly?replicaSet=bookly-rs&authSource=admin
```

### Servicios Backend

```env
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=bookly123

RABBITMQ_URL=amqp://bookly:bookly123@rabbitmq:5672/bookly
```

## Puertos Expuestos

### Servicios Base

- **MongoDB Primary**: 27017
- **MongoDB Secondary 1**: 27018
- **MongoDB Secondary 2**: 27019
- **Redis**: 6379
- **RabbitMQ AMQP**: 5672
- **RabbitMQ Management**: 15672
- **Nginx HTTP**: 80
- **Nginx Admin**: 8080

### Microservicios

- **API Gateway**: 3000
- **Auth Service**: 3001
- **Resources Service**: 3002
- **Availability Service**: 3003
- **Stockpile Service**: 3004
- **Reports Service**: 3005

## Troubleshooting

### Error: "service depends on undefined service"

**Causa**: Falta iniciar los servicios base

**Solución**:

```bash
# Iniciar servicios base primero
make dev-start

# Luego microservicios
make microservices
```

### Error: "network bookly-network not found"

**Causa**: La red externa no existe

**Solución**:

```bash
# Crear la red
docker network create bookly-network

# Reiniciar servicios
make dev-restart
```

### Microservicio No Se Conecta a MongoDB

**Causa**: DATABASE_URL con hostnames incorrectos

**Solución**: Verifica que uses hostnames Docker:

```env
# ✅ Correcto (en Docker)
DATABASE_URL=mongodb://bookly:bookly123@mongodb-primary:27017/bookly

# ❌ Incorrecto (en Docker)
DATABASE_URL=mongodb://bookly:bookly123@localhost:27017/bookly
```

### Nginx en Loop de Errores

**Causa**: Microservicios no están corriendo

**Solución**:

```bash
# Detener nginx temporalmente
make nginx-stop

# Iniciar microservicios
make microservices

# Iniciar nginx
make nginx-start
```

## Resumen de Comandos Clave

```bash
# Stack completo (usa docker-compose.dev.yml)
make dev-full              # Iniciar base + microservicios
make dev-full-stop         # Detener todo
make dev-full-logs         # Ver logs en tiempo real
make dev-full-restart      # Reiniciar todo

# Por partes
make dev-start             # Solo base
make microservices         # Solo microservicios
make nginx-start           # Solo nginx

# Detener por partes
make dev-stop              # Detener base
make microservices-stop    # Detener microservicios
make nginx-stop            # Detener nginx

# Logs individuales
make dev-logs              # Logs de base
make microservices-logs    # Logs de microservicios
make nginx-logs            # Logs de nginx

# Estado
docker ps                  # Ver todos los contenedores
make status                # Estado detallado
make nginx-status          # Estado de nginx + microservicios
```

## Siguientes Pasos

1. ✅ Servicios base corriendo
2. ✅ Microservicios corriendo
3. ⏭️ Configurar observabilidad (opcional): `make observability`
4. ⏭️ Iniciar frontend: `cd apps/bookly-web && npm run dev`
5. ⏭️ Acceder a la aplicación: http://localhost:3000
