# 🔧 FIX CRÍTICO: Redis Health Check Fallando en GCP

## 🐛 Problema Identificado

Los microservicios en GCP están fallando los health checks de Redis con:

```
❌ redis
   status: down
   message: Redis health check failed
   details: Unexpected result from health check operation
   result: null
```

### Síntomas en los Logs

**Auth Service, Resources, Availability, Stockpile, Reports**:
```
✅ Database connected successfully
✅ Redis connected successfully
✅ Redis client ready
❌ Redis health check failed
   result: null
```

**API Gateway**:
```
WARN [LoadBalancerService] Health check failed for availability at http://availability-service:3003/api/v1/health: connect ECONNREFUSED 172.20.0.8:3003
WARN [LoadBalancerService] Health check failed for resources at http://resources-service:3002/api/v1/health: connect ECONNREFUSED 172.20.0.10:3002
```

## 🔍 Causa Raíz

El método `redis.set()` en `health.service.ts` estaba usando serialización JSON que causaba que el valor guardado fuera diferente al esperado:

**Problema**:
```typescript
// ❌ INCORRECTO
await this.redis.set(testKey, 'ok', 5);
// RedisService hace JSON.stringify('ok') -> '"ok"' (con comillas JSON)
// Se guarda: '"ok"'
// Se lee: JSON.parse('"ok"') -> 'ok'
// Pero en algunos casos retorna null
```

**Solución**:
```typescript
// ✅ CORRECTO - Usar cliente Redis directo
const client = (this.redis as any).client;
await client.set(testKey, 'ok', 'EX', 5);
// Se guarda: 'ok' (sin serialización)
// Se lee: 'ok'
// Comparación: result === 'ok' ✅
```

## ✅ Solución Implementada

### Archivo Modificado

**`src/health/health.service.ts`** - Método `checkRedis()`

```typescript
const healthCheckPromise = (async () => {
  const testKey = `health-check:${Date.now()}`;
  // Usar cliente Redis directamente (sin JSON serialization)
  const client = (this.redis as any).client;
  await client.set(testKey, 'ok', 'EX', 5);  // ← Sintaxis correcta con TTL
  const result = await client.get(testKey);
  await client.del(testKey);
  return result;
})();
```

**Cambios clave**:
1. ✅ Acceso directo al cliente ioredis (sin wrapper)
2. ✅ Sintaxis correcta de TTL: `set(key, value, 'EX', seconds)`
3. ✅ Sin serialización JSON para el health check

## 🚀 Aplicar en GCP INMEDIATAMENTE

### Paso 1: Pull de Cambios

```bash
cd /path/to/bookly-monorepo/bookly-backend
git pull origin main
```

### Paso 2: Verificar el Cambio

```bash
# Verificar que health.service.ts tiene el fix
grep -A5 "Use direct Redis client" src/health/health.service.ts

# Debe mostrar:
# // Use direct Redis client for health check (no JSON serialization)
# const client = (this.redis as any).client;
# await client.set(testKey, 'ok', 'EX', 5);
```

### Paso 3: Rebuild de TODOS los Microservicios

⚠️ **CRÍTICO**: El archivo `health.service.ts` está compartido por todos los servicios.

```bash
cd infrastructure

# Rebuild de TODOS los microservicios
docker compose -f docker-compose.microservices.yml build

# Esto rebuild:
# - auth-service
# - resources-service
# - availability-service
# - stockpile-service
# - reports-service
# - api-gateway
```

### Paso 4: Reiniciar Servicios

```bash
# Detener todos los servicios
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml down

# Levantar todo de nuevo
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml up -d

# Esperar 30 segundos para que inicien
sleep 30
```

### Paso 5: Verificar Health Checks

```bash
# Verificar logs de auth-service (debe mostrar Redis healthy)
docker logs bookly-auth-service --tail 50

# Buscar:
# ✅ redis
#    status: up
#    message: Redis connection is healthy

# Verificar API Gateway (NO debe haber ECONNREFUSED)
docker logs bookly-api-gateway --tail 50 | grep -i "health check"

# Debe mostrar:
# [LoadBalancerService] Health check result for auth: status=200, healthy=true
# [LoadBalancerService] Health check result for resources: status=200, healthy=true
# ...
```

### Paso 6: Test de Health Aggregated

```bash
# Test desde fuera de Docker
curl -s http://localhost:3000/health/aggregated | jq .

# Resultado esperado:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "services": {
#     "auth": {
#       "status": "up",
#       "components": {
#         "database": { "status": "up" },
#         "redis": { "status": "up" },     ← ✅ Debe estar UP
#         "rabbitmq": { "status": "up" }
#       }
#     },
#     "resources": { "status": "up" },
#     "availability": { "status": "up" },
#     "stockpile": { "status": "up" },
#     "reports": { "status": "up" }
#   }
# }
```

## 🔍 Diagnóstico Detallado

### Test Individual de Health de un Servicio

```bash
# Auth service
curl -s http://localhost:3001/api/v1/health | jq .

# Debe mostrar:
# {
#   "status": "ok",
#   "info": {
#     "database": { "status": "up" },
#     "redis": { "status": "up" },        ← ✅ Ahora debe estar UP
#     "rabbitmq": { "status": "up" },
#     "memory_heap": { "status": "up" },
#     "memory_rss": { "status": "up" },
#     "storage": { "status": "up" }
#   }
# }
```

### Verificar Conectividad Redis Directamente

```bash
# Conectar a Redis desde un servicio
docker exec bookly-auth-service sh -c "redis-cli -h redis -p 6379 -a bookly123 ping"

# Debe retornar: PONG
```

### Ver Logs Específicos de Redis Health Check

```bash
# Auth service
docker logs bookly-auth-service 2>&1 | grep -i "redis"

# Debe mostrar:
# [RedisService] info: ✅ Redis connected successfully
# [RedisService] info: ✅ Redis client ready
# [RedisService] info: Redis connection established
```

## 📊 Comparación Antes/Después

### ANTES (❌ Fallaba)

```
Estado del Health Check:
├─ database: ✅ up
├─ redis: ❌ down (result: null)
├─ rabbitmq: ✅ up
└─ Resultado: /health retorna 503

API Gateway:
├─ Intenta conectar a auth-service:3001/api/v1/health
├─ Recibe 503 (unhealthy)
└─ WARN: connect ECONNREFUSED

Logs:
"Redis health check failed"
"details: Unexpected result from health check operation"
"result: null"
```

### DESPUÉS (✅ Funciona)

```
Estado del Health Check:
├─ database: ✅ up
├─ redis: ✅ up
├─ rabbitmq: ✅ up
└─ Resultado: /health retorna 200 OK

API Gateway:
├─ Intenta conectar a auth-service:3001/api/v1/health
├─ Recibe 200 OK
└─ DEBUG: Health check result for auth: status=200, healthy=true

Logs:
"Redis connection is healthy"
"state: ready"
```

## 🔧 Troubleshooting

### Si Redis sigue fallando después del fix

1. **Verificar que el rebuild se hizo correctamente**:

```bash
# Ver fecha de build de las imágenes
docker images | grep bookly

# Si son anteriores al fix, rebuild con --no-cache
docker compose -f docker-compose.microservices.yml build --no-cache
```

2. **Verificar conectividad a Redis**:

```bash
# Desde auth-service
docker exec bookly-auth-service nc -zv redis 6379

# Debe mostrar: redis (172.20.0.X:6379) open
```

3. **Verificar estado de Redis**:

```bash
# Ver logs de Redis
docker logs bookly-redis --tail 30

# Ver info
docker exec bookly-redis redis-cli -a bookly123 info server
```

4. **Verificar variables de entorno**:

```bash
# Ver env de auth-service
docker exec bookly-auth-service env | grep REDIS

# Debe mostrar:
# REDIS_HOST=redis
# REDIS_PORT=6379
# REDIS_PASSWORD=bookly123
```

### Si hay ECONNREFUSED en API Gateway

```bash
# Verificar que los servicios están escuchando en 0.0.0.0
docker logs bookly-auth-service 2>&1 | grep "running on"

# Debe mostrar: http://0.0.0.0:3001
# NO debe mostrar: http://localhost:3001

# Si muestra localhost, ejecutar:
# make dev-fix-host-binding
```

## 📝 Explicación Técnica

### ¿Por qué fallaba con JSON.stringify()?

En el wrapper de RedisService:

```typescript
// RedisService.set()
async set(key: string, value: any, ttl?: number): Promise<void> {
  const serializedValue = JSON.stringify(value);  // 'ok' -> '"ok"'
  if (ttl) {
    await this.client.setEx(key, ttl, serializedValue);  // Guarda '"ok"'
  }
}

// RedisService.get()
async get<T>(key: string): Promise<T | null> {
  const value = await this.client.get(key);  // Lee '"ok"'
  return value ? JSON.parse(value) : null;   // '"ok"' -> 'ok'
}
```

El problema era que:
1. En algunos casos la serialización JSON causaba problemas
2. La sintaxis `set(key, value, ttl)` no era la correcta de ioredis
3. El TTL podía expirar entre set y get

### Solución: Cliente Directo

```typescript
// Usar cliente ioredis directamente
const client = (this.redis as any).client;

// Sintaxis correcta de ioredis con TTL
await client.set(key, value, 'EX', seconds);
// 'EX' = TTL en segundos
// Equivalente a: SETEX key seconds value
```

## ✅ Checklist de Verificación

- [ ] Pull de cambios completado
- [ ] Verificado que `health.service.ts` tiene el fix
- [ ] Rebuild de TODOS los microservicios
- [ ] Servicios reiniciados
- [ ] Logs NO muestran "result: null" en Redis health check
- [ ] Health checks individuales retornan 200 OK
- [ ] API Gateway NO tiene errores ECONNREFUSED
- [ ] Aggregated health muestra todos los servicios "up"
- [ ] Redis health check muestra "status: up"

## 📊 Métricas de Éxito

```bash
# Verificar que NO haya errores de Redis health check
docker logs bookly-auth-service 2>&1 | grep -i "redis health check failed" | wc -l
# Debe ser: 0

# Verificar health checks exitosos en API Gateway
docker logs bookly-api-gateway 2>&1 | grep "healthy=true" | wc -l
# Debe ser: > 0

# Verificar aggregated health
curl -s http://localhost:3000/health/aggregated | jq '.services | to_entries[] | select(.value.status != "up")'
# No debe mostrar nada (todos up)
```

## 🎯 Comando Único de Aplicación

```bash
#!/bin/bash
cd /path/to/bookly-monorepo/bookly-backend && \
git pull origin main && \
cd infrastructure && \
docker compose -f docker-compose.microservices.yml build && \
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml down && \
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml up -d && \
echo "Esperando 30 segundos..." && sleep 30 && \
echo "Verificando health..." && \
curl -s http://localhost:3000/health/aggregated | jq '.services'
```

---

**Última actualización**: 2025-10-24 13:15 UTC-5  
**Problema**: Redis health check retornando null  
**Solución**: Usar cliente Redis directo con sintaxis correcta  
**Estado**: ✅ FIX APLICADO - Listo para deploy en GCP
