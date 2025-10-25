# Comandos de Gestión de Servicios Individuales

## Índice

- [Servicios Base](#servicios-base)
  - [MongoDB Primary](#mongodb-primary)
  - [Redis](#redis)
  - [RabbitMQ](#rabbitmq)
  - [Nginx](#nginx)
- [Microservicios](#microservicios)
  - [API Gateway](#api-gateway)
  - [Auth Service](#auth-service)
  - [Resources Service](#resources-service)
  - [Availability Service](#availability-service)
  - [Stockpile Service](#stockpile-service)
  - [Reports Service](#reports-service)

## Servicios Base

### MongoDB Primary

```bash
# Gestión
make mongodb-primary-start     # Iniciar MongoDB Primary
make mongodb-primary-stop      # Detener MongoDB Primary
make mongodb-primary-restart   # Reiniciar MongoDB Primary
make mongodb-primary-logs      # Ver logs en tiempo real

# Shell
docker exec -it bookly-mongodb-primary mongosh -u bookly -p bookly123 --authenticationDatabase admin
```

**Puerto**: 27017

### Redis

```bash
# Gestión
make redis-start               # Iniciar Redis
make redis-stop                # Detener Redis
make redis-restart             # Reiniciar Redis
make redis-logs                # Ver logs en tiempo real

# CLI
docker exec -it bookly-redis redis-cli -a bookly123
```

**Puerto**: 6379

### RabbitMQ

```bash
# Gestión
make rabbitmq-start            # Iniciar RabbitMQ
make rabbitmq-stop             # Detener RabbitMQ
make rabbitmq-restart          # Reiniciar RabbitMQ
make rabbitmq-logs             # Ver logs en tiempo real

# Management UI
open http://localhost:15672    # Usuario: bookly / Pass: bookly123
```

**Puertos**: 5672 (AMQP), 15672 (Management UI)

### Nginx

```bash
# Gestión
make nginx-start               # Iniciar Nginx
make nginx-stop                # Detener Nginx
make nginx-restart             # Reiniciar Nginx
make nginx-status              # Ver estado
make nginx-logs                # Ver logs en tiempo real
make nginx-errors              # Ver solo errores
```

**Puertos**: 80 (HTTP), 8080 (Admin)

## Microservicios

### API Gateway

```bash
# Gestión
make api-gateway-start         # Iniciar API Gateway
make api-gateway-stop          # Detener API Gateway
make api-gateway-restart       # Reiniciar API Gateway
make api-gateway-logs          # Ver logs en tiempo real

# Health check
curl http://localhost:3000/health

# API Docs
open http://localhost:3000/api/docs
```

**Puerto**: 3000  
**Dependencias**: MongoDB, Redis, RabbitMQ

### Auth Service

```bash
# Gestión
make auth-start                # Iniciar Auth Service
make auth-stop                 # Detener Auth Service
make auth-restart              # Reiniciar Auth Service
make auth-logs                 # Ver logs en tiempo real

# Health check
curl http://localhost:3001/health

# Test login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@booklyapp.com","password":"admin123"}'
```

**Puerto**: 3001  
**Dependencias**: MongoDB, Redis, RabbitMQ

### Resources Service

```bash
# Gestión
make resources-start           # Iniciar Resources Service
make resources-stop            # Detener Resources Service
make resources-restart         # Reiniciar Resources Service
make resources-logs            # Ver logs en tiempo real

# Health check
curl http://localhost:3002/health

# Listar recursos
curl http://localhost:3002/api/v1/resources
```

**Puerto**: 3002  
**Dependencias**: MongoDB, Redis, RabbitMQ

### Availability Service

```bash
# Gestión
make availability-start        # Iniciar Availability Service
make availability-stop         # Detener Availability Service
make availability-restart      # Reiniciar Availability Service
make availability-logs         # Ver logs en tiempo real

# Health check
curl http://localhost:3003/health

# Ver disponibilidad
curl http://localhost:3003/api/v1/availability
```

**Puerto**: 3003  
**Dependencias**: MongoDB, Redis, RabbitMQ

### Stockpile Service

```bash
# Gestión
make stockpile-start           # Iniciar Stockpile Service
make stockpile-stop            # Detener Stockpile Service
make stockpile-restart         # Reiniciar Stockpile Service
make stockpile-logs            # Ver logs en tiempo real

# Health check
curl http://localhost:3004/health

# Ver aprobaciones
curl http://localhost:3004/api/v1/stockpile
```

**Puerto**: 3004  
**Dependencias**: MongoDB, Redis, RabbitMQ

### Reports Service

```bash
# Gestión
make reports-start             # Iniciar Reports Service
make reports-stop              # Detener Reports Service
make reports-restart           # Reiniciar Reports Service
make reports-logs              # Ver logs en tiempo real

# Health check
curl http://localhost:3005/health

# Ver reportes
curl http://localhost:3005/api/v1/reports
```

**Puerto**: 3005  
**Dependencias**: MongoDB, Redis, RabbitMQ

## Ejemplos de Uso

### Reiniciar un Microservicio después de Cambios de Código

```bash
# Ejemplo: Modificaste código de Auth Service
make auth-restart
make auth-logs
```

### Ver Logs de Múltiples Servicios

```bash
# Terminal 1
make api-gateway-logs

# Terminal 2
make auth-logs

# Terminal 3
make mongodb-primary-logs
```

### Detener un Servicio para Mantenimiento

```bash
# Detener Redis temporalmente
make redis-stop

# Realizar mantenimiento...

# Reiniciar Redis
make redis-start
```

### Debug de un Servicio Específico

```bash
# Ver logs con más detalle
make auth-logs

# En otra terminal, ver el contenedor
docker inspect bookly-auth-service

# Entrar al contenedor si necesitas
docker exec -it bookly-auth-service sh
```

## Comandos de Grupo

### Stack Completo

```bash
make dev-full              # Iniciar todo
make dev-full-stop         # Detener todo
make dev-full-logs         # Ver todos los logs
make dev-full-restart      # Reiniciar todo
```

### Solo Servicios Base

```bash
make dev-start             # Iniciar base
make dev-stop              # Detener base
make dev-logs              # Ver logs de base
```

### Solo Microservicios

```bash
make microservices         # Iniciar microservicios
make microservices-stop    # Detener microservicios
make microservices-logs    # Ver logs de microservicios
```

## Troubleshooting

### Servicio No Inicia

```bash
# Ver logs del servicio
make <servicio>-logs

# Ejemplo: Auth Service no inicia
make auth-logs

# Ver estado del contenedor
docker ps -a | grep bookly-auth-service

# Ver detalles del contenedor
docker inspect bookly-auth-service
```

### Servicio Consume Mucha Memoria

```bash
# Ver stats en tiempo real
docker stats bookly-auth-service

# Reiniciar el servicio
make auth-restart
```

### Cambiar Puerto de un Servicio

Los puertos están definidos en `docker-compose.*.yml`. Para cambiar:

1. Editar el archivo correspondiente
2. Reiniciar el servicio: `make <servicio>-restart`

### Ver Todos los Comandos Disponibles

```bash
make help
```

## Resumen de Comandos por Acción

### Iniciar Servicios

```bash
# Servicios Base
make mongodb-primary-start
make redis-start
make rabbitmq-start
make nginx-start

# Microservicios
make api-gateway-start
make auth-start
make resources-start
make availability-start
make stockpile-start
make reports-start
```

### Detener Servicios

```bash
# Servicios Base
make mongodb-primary-stop
make redis-stop
make rabbitmq-stop
make nginx-stop

# Microservicios
make api-gateway-stop
make auth-stop
make resources-stop
make availability-stop
make stockpile-stop
make reports-stop
```

### Ver Logs

```bash
# Servicios Base
make mongodb-primary-logs
make redis-logs
make rabbitmq-logs
make nginx-logs

# Microservicios
make api-gateway-logs
make auth-logs
make resources-logs
make availability-logs
make stockpile-logs
make reports-logs
```

### Reiniciar Servicios

```bash
# Servicios Base
make mongodb-primary-restart
make redis-restart
make rabbitmq-restart
make nginx-restart

# Microservicios
make api-gateway-restart
make auth-restart
make resources-restart
make availability-restart
make stockpile-restart
make reports-restart
```

## Comandos Docker Directos

Si prefieres usar Docker directamente:

```bash
# Ver logs
docker logs bookly-<servicio> -f

# Reiniciar
docker restart bookly-<servicio>

# Detener
docker stop bookly-<servicio>

# Iniciar
docker start bookly-<servicio>

# Ver stats
docker stats bookly-<servicio>

# Entrar al contenedor
docker exec -it bookly-<servicio> sh
```

## Notas Importantes

- **Dependencias**: Algunos servicios dependen de otros. Por ejemplo, los microservicios necesitan MongoDB, Redis y RabbitMQ corriendo.
- **Orden de Inicio**: Es recomendable iniciar primero los servicios base, luego los microservicios.
- **Logs**: Usar `-f` (follow) para ver logs en tiempo real. Presiona `Ctrl+C` para salir.
- **Restart**: El comando restart hace stop + start, lo que puede tomar unos segundos.
