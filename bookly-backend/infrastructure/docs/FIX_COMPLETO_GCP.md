# 🚀 FIX COMPLETO - Microservicios en GCP

## 🐛 Problemas Identificados y Resueltos

### 1. ❌ DATABASE_URL con localhost (CRÍTICO)
**Error**: Los microservicios no pueden conectarse a MongoDB
```
Database Error: [PrismaService] Connection refused - Is the database server running?
```

**Causa**: DATABASE_URL usaba `localhost` en lugar de hostnames Docker

**Solución**:
```yaml
# ❌ Antes
DATABASE_URL: mongodb://bookly:bookly123@localhost:27017,localhost:27018,localhost:27019/bookly?replicaSet=bookly-rs&authSource=admin

# ✅ Ahora
DATABASE_URL: mongodb://bookly:bookly123@mongodb-primary:27017,mongodb-secondary1:27017,mongodb-secondary2:27017/bookly?replicaSet=bookly-rs&authSource=admin
```

### 2. ❌ RabbitMQ Vhost Mismatch
**Error**: 
```
[error] vhost bookly not found
```

**Causa**: Vhost configurado como `/bookly` pero URL usa `bookly` (sin slash)

**Solución**:
- `definitions.json`: `/bookly` → `bookly`
- `rabbitmq.conf`: `default_vhost = /bookly` → `default_vhost = bookly`
- `docker-compose.base.yml`: `RABBITMQ_DEFAULT_VHOST: /bookly` → `bookly`

### 3. ✅ Permisos de logs (YA RESUELTO)
Entrypoint script inline en Dockerfiles ajusta permisos automáticamente.

## 📋 Checklist de Verificación Pre-Deployment

Antes de aplicar en GCP, verifica:

- [ ] MongoDB replica set está corriendo y healthy
- [ ] Redis está corriendo y healthy
- [ ] RabbitMQ está corriendo y healthy
- [ ] Red `bookly-network` existe
- [ ] Volúmenes de datos están creados

## 🚀 Pasos de Deployment en GCP

### Paso 1: Pull de Cambios

```bash
cd /path/to/bookly-monorepo/bookly-backend/infrastructure
git pull origin main
```

### Paso 2: Detener Servicios Actuales

```bash
# Detener microservicios
docker compose -f docker-compose.microservices.yml down

# Detener servicios base (excepto volúmenes)
docker compose -f docker-compose.base.yml down
```

### Paso 3: Fix de RabbitMQ (IMPORTANTE)

**Necesitas eliminar el volumen de RabbitMQ para que cargue el vhost correcto**:

```bash
# Opción A: Usar comando automatizado
make dev-fix-rabbitmq

# Opción B: Manual
docker compose -f docker-compose.base.yml stop rabbitmq
docker volume rm bookly_rabbitmq_data
docker compose -f docker-compose.base.yml up -d rabbitmq
sleep 60  # Esperar a que cargue definiciones
```

### Paso 4: Verificar MongoDB

```bash
# Verificar que MongoDB esté healthy
docker ps --filter "name=mongodb" --format "table {{.Names}}\t{{.Status}}"

# Verificar replica set
docker exec bookly-mongodb-primary mongosh -u bookly -p bookly123 \
  --authenticationDatabase admin \
  --eval "rs.status().members.map(m => ({name: m.name, state: m.stateStr}))"

# Debe mostrar 1 PRIMARY y 2 SECONDARY
```

### Paso 5: Verificar RabbitMQ

```bash
# Verificar vhost (debe ser "bookly" sin slash)
docker exec bookly-rabbitmq rabbitmqctl list_vhosts

# Verificar permisos
docker exec bookly-rabbitmq rabbitmqctl list_permissions -p bookly

# NO debe haber errores "vhost not found"
docker logs bookly-rabbitmq 2>&1 | grep "vhost bookly not found"
```

### Paso 6: Rebuild Microservicios (Recomendado)

```bash
# Rebuild con nuevas configuraciones
docker compose -f docker-compose.microservices.yml build --no-cache
```

### Paso 7: Iniciar Todo

```bash
# Iniciar servicios base
docker compose -f docker-compose.base.yml up -d

# Esperar a que estén healthy
watch -n 2 'docker ps --filter "name=bookly" --format "table {{.Names}}\t{{.Status}}"'

# Cuando veas (healthy) en MongoDB, Redis y RabbitMQ, inicia microservicios
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml up -d
```

### Paso 8: Verificar Microservicios

```bash
# Ver estado de todos los servicios
docker ps --filter "name=bookly" --format "table {{.Names}}\t{{.Status}}"

# Ver logs de un microservicio
docker logs bookly-auth-service --tail 50

# Buscar conexiones exitosas
docker logs bookly-auth-service 2>&1 | grep -i "database\|mongodb\|rabbit"

# Debe mostrar:
# ✅ MongoDB connection established
# ✅ Successfully connected to RabbitMQ
```

## 🔍 Verificación de Conexiones

### MongoDB

```bash
# Ver conexiones activas a MongoDB
docker exec bookly-mongodb-primary mongosh -u bookly -p bookly123 \
  --authenticationDatabase admin \
  --eval "db.currentOp().inprog.filter(op => op.active).map(op => op.client)"

# Debe mostrar conexiones desde los microservicios (172.20.0.x)
```

### RabbitMQ

```bash
# Ver conexiones activas a RabbitMQ
docker exec bookly-rabbitmq rabbitmqctl list_connections --formatter json | \
  jq '.[] | {user: .user, name: .name, state: .state}'

# Debe mostrar 6+ conexiones en estado "running"
```

### Redis

```bash
# Ver clientes conectados a Redis
docker exec bookly-redis redis-cli CLIENT LIST

# Debe mostrar conexiones desde microservicios
```

## 📊 Estado Esperado Post-Fix

### Docker PS

```bash
$ docker ps --filter "name=bookly" --format "table {{.Names}}\t{{.Status}}"

NAMES                          STATUS
bookly-mongodb-primary         Up 10 minutes (healthy)
bookly-mongodb-secondary1      Up 10 minutes (healthy)
bookly-mongodb-secondary2      Up 10 minutes (healthy)
bookly-redis                   Up 10 minutes (healthy)
bookly-rabbitmq                Up 10 minutes (healthy)
bookly-nginx                   Up 10 minutes (healthy)
bookly-api-gateway             Up 5 minutes (healthy)
bookly-auth-service            Up 5 minutes (healthy)
bookly-resources-service       Up 5 minutes (healthy)
bookly-availability-service    Up 5 minutes (healthy)
bookly-stockpile-service       Up 5 minutes (healthy)
bookly-reports-service         Up 5 minutes (healthy)
```

**✅ Todos healthy, SIN reinicios**

### Logs de Auth Service (ejemplo)

```bash
$ docker logs bookly-auth-service --tail 30

[Nest] INFO [PrismaService] MongoDB connection established
[Nest] INFO [PrismaService] Connected to: mongodb-primary:27017,mongodb-secondary1:27017,mongodb-secondary2:27017
[Nest] INFO [RedisService] Redis connection established at redis:6379
[Nest] INFO [RabbitMQModule] Successfully connected to RabbitMQ
[Nest] INFO [RabbitMQModule] Channel created successfully
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO [RoutesResolver] AuthController {/v1/auth}:
[Nest] INFO [RouterExplorer] Mapped {/v1/auth/login, POST} route
[Nest] INFO [RouterExplorer] Mapped {/v1/auth/register, POST} route
[Nest] INFO Auth Service is running on port 3001
```

## 🆘 Troubleshooting

### Si MongoDB sigue con "Connection refused"

```bash
# Verificar que DATABASE_URL es correcta
docker exec bookly-auth-service env | grep DATABASE_URL

# Debe mostrar:
# DATABASE_URL=mongodb://bookly:bookly123@mongodb-primary:27017,mongodb-secondary1:27017,mongodb-secondary2:27017/bookly?replicaSet=bookly-rs&authSource=admin

# Test de conectividad desde microservicio
docker exec bookly-auth-service nc -zv mongodb-primary 27017
# Debe mostrar: mongodb-primary (172.20.0.x:27017) open
```

### Si RabbitMQ sigue con "vhost not found"

```bash
# Verificar vhost actual
docker exec bookly-rabbitmq rabbitmqctl list_vhosts

# Si aparece "/bookly" (con slash), el volumen no se eliminó correctamente
# Eliminar volumen y reiniciar:
docker compose -f docker-compose.base.yml stop rabbitmq
docker volume rm bookly_rabbitmq_data
docker compose -f docker-compose.base.yml up -d rabbitmq
sleep 60

# Verificar nuevamente
docker exec bookly-rabbitmq rabbitmqctl list_vhosts
# Debe mostrar: bookly (SIN slash)
```

### Si los microservicios se reinician continuamente

```bash
# Ver logs en tiempo real
docker logs bookly-auth-service -f

# Errores comunes:
# 1. "Database connection refused" → DATABASE_URL incorrecta
# 2. "vhost not found" → RabbitMQ volumen no eliminado
# 3. "Permission denied logs" → Entrypoint no se ejecutó (rebuild necesario)
```

## 📝 Resumen de Archivos Modificados

| Archivo | Cambio | Impacto |
|---------|--------|---------|
| `docker-compose.microservices.yml` | DATABASE_URL con hostnames Docker | **CRÍTICO** - Permite conexión a MongoDB |
| `rabbitmq/definitions.json` | Vhost `/bookly` → `bookly` | **CRÍTICO** - Permite conexión a RabbitMQ |
| `rabbitmq/rabbitmq.conf` | default_vhost corregido | Complementa fix de vhost |
| `docker-compose.base.yml` | RABBITMQ_DEFAULT_VHOST corregido | Complementa fix de vhost |
| `Makefile` | Comando `dev-fix-rabbitmq` | Facilita aplicación de fix |

## ✅ Comandos de Verificación Rápida

```bash
# 1. Verificar que todos los servicios están healthy
docker ps --filter "name=bookly" --format "table {{.Names}}\t{{.Status}}" | grep healthy | wc -l
# Debe mostrar: 12 (6 base + 6 microservicios)

# 2. Verificar que no hay reinicios
docker ps --filter "name=bookly" --format "{{.Names}}: {{.Status}}" | grep -i restart
# No debe mostrar nada

# 3. Verificar conexiones a MongoDB
docker exec bookly-mongodb-primary mongosh -u bookly -p bookly123 \
  --authenticationDatabase admin \
  --eval "db.serverStatus().connections"
# Debe mostrar current: 6+, available: suficientes

# 4. Verificar conexiones a RabbitMQ
docker exec bookly-rabbitmq rabbitmqctl list_connections | wc -l
# Debe mostrar: 6+ (una por microservicio)

# 5. Test de endpoint de health
curl http://localhost:3001/health
# Debe responder: {"status":"ok","database":"connected","redis":"connected"}
```

## 🎯 Checklist Final

- [ ] MongoDB: 12 servicios healthy
- [ ] Sin reinicios en docker ps
- [ ] 6+ conexiones activas a MongoDB
- [ ] 6+ conexiones activas a RabbitMQ
- [ ] 6 conexiones activas a Redis
- [ ] Health endpoints responden OK
- [ ] Logs sin errores de conexión
- [ ] Nginx accesible en puerto 80/8080

---

**Última actualización**: 2025-10-23 21:00 UTC-5  
**Versiones**: MongoDB 7.0, RabbitMQ 3.12, Redis 7.2, Node.js 22.15.0

## 📞 Soporte

Si después de aplicar estos fixes los servicios siguen sin funcionar:

1. Recopila logs: `docker compose -f docker-compose.dev.yml logs > logs-completos.txt`
2. Verifica red: `docker network inspect bookly_bookly-network`
3. Verifica volúmenes: `docker volume ls | grep bookly`
4. Revisa variables de entorno: `docker exec bookly-auth-service env`
