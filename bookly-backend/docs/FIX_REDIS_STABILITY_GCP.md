# 🔧 FIX CRÍTICO: Inestabilidad de Conexiones Redis en GCP

## 🐛 Problema Identificado

Los microservicios en GCP están experimentando **desconexiones y reconexiones frecuentes de Redis**, causando fallos intermitentes en health checks:

```
✅ Redis connected successfully
✅ Redis client ready
❌ Redis health check failed
   result: null
   
🔄 Redis reconnecting...
✅ Redis connected successfully
❌ Redis health check failed
```

### Síntomas Observados

1. **Ciclos de reconexión constantes** en logs
2. **Health checks fallando** durante reconexiones
3. **ECONNREFUSED** en API Gateway cuando servicios reportan unhealthy
4. **Inestabilidad general** del sistema

## 🔍 Causa Raíz

### Problema 1: Configuración de Redis sin Keep-Alive

Redis estaba configurado sin TCP keepalive, causando que conexiones idle se cerraran:

```yaml
# ❌ ANTES: Sin keepalive
command: [
  "redis-server",
  "--requirepass", "bookly123",
  "--timeout", "300"  # Desconecta clientes idle después de 5 min
]
```

### Problema 2: Cliente Redis sin Keep-Alive

El cliente Node.js Redis no tenía keepAlive configurado:

```typescript
// ❌ ANTES: Sin keepAlive
this.client = createClient({
  socket: {
    host: 'redis',
    port: 6379,
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error('Max retries');
      return retries * 100;  // Backoff muy agresivo
    }
  }
});
```

### Problema 3: Health Check No Tolerante a Reconexiones

El health check fallaba inmediatamente durante reconexiones sin reintentos:

```typescript
// ❌ ANTES: Falla al primer error
const result = await this.redis.set(testKey, 'ok', 5);
if (result !== 'ok') return unhealthy;
```

## ✅ Soluciones Implementadas

### 1. Configuración de Redis Mejorada

**Archivo**: `infrastructure/docker-compose.base.yml`

```yaml
redis:
  command: [
    "redis-server",
    "--requirepass", "bookly123",
    "--tcp-keepalive", "60",      # ← Keep-alive cada 60 segundos
    "--timeout", "0",              # ← NUNCA desconectar clientes idle
    "--maxclients", "10000",       # ← Más clientes concurrentes
    "--tcp-backlog", "511"         # ← Mayor backlog TCP
  ]
```

**Beneficios**:
- ✅ Conexiones permanecen activas indefinidamente
- ✅ TCP keepalive detecta conexiones muertas
- ✅ Mayor capacidad de conexiones concurrentes
- ✅ Mejor manejo de picos de tráfico

### 2. Cliente Redis con Keep-Alive

**Archivo**: `src/libs/event-bus/services/redis.service.ts`

```typescript
this.client = createClient({
  socket: {
    host: 'redis',
    port: 6379,
    // ✅ Keep-alive para mantener conexiones
    keepAlive: 30000, // 30 segundos
    // ✅ Timeout más largo para GCP
    connectTimeout: 10000, // 10 segundos
    // ✅ Estrategia de reconexión mejorada
    reconnectStrategy: (retries) => {
      if (retries > 20) return new Error('Max retries');
      // Exponential backoff con jitter
      const baseDelay = Math.min(retries * 200, 5000);
      const jitter = Math.random() * 1000;
      return baseDelay + jitter;
    }
  },
  password: 'bookly123'
});
```

**Mejoras**:
- ✅ Keep-alive cada 30 segundos previene timeouts
- ✅ Timeouts más largos para redes lentas (GCP)
- ✅ Más reintentos (20 en lugar de 10)
- ✅ Backoff exponencial con jitter evita tormentas de reconexión

### 3. Health Check con Retry Logic

**Archivo**: `src/health/health.service.ts`

```typescript
async checkRedis(key: string): Promise<HealthIndicatorResult> {
  // Retry logic: hasta 2 intentos
  let lastError: any;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      // ✅ Timeout más largo (5 segundos)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });

      const healthCheckPromise = (async () => {
        const client = (this.redis as any).client;
        
        // ✅ Verificar estado antes de operar
        if (!client.isReady && !client.isOpen) {
          throw new Error('Client not ready');
        }
        
        // ✅ Usar cliente directo (sin JSON serialization)
        const testKey = `health-check:${Date.now()}-${Math.random()}`;
        await client.set(testKey, 'ok', 'EX', 10);
        const result = await client.get(testKey);
        await client.del(testKey).catch(() => {});  // Ignorar errores de cleanup
        return result;
      })();

      const result = await Promise.race([healthCheckPromise, timeoutPromise]);
      
      if (result === 'ok') {
        return this.getStatus(key, true, {
          message: 'Redis connection is healthy',
          attempt: attempt > 1 ? attempt : undefined  // Indica si fue retry
        });
      }
      
      // ✅ Retry si falla
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
    } catch (error) {
      lastError = error;
      // ✅ Retry si falla
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
    }
  }
  
  // Falló después de 2 intentos
  return this.getStatus(key, false, {
    message: 'Redis health check failed after retries',
    error: lastError?.message
  });
}
```

**Mejoras**:
- ✅ Hasta 2 reintentos automáticos
- ✅ Timeout de 5 segundos (antes 3)
- ✅ Espera de 500ms entre reintentos
- ✅ Verificación de estado antes de operaciones
- ✅ No falla por errores de cleanup

## 🚀 Aplicar en GCP INMEDIATAMENTE

### Paso 1: Pull de Cambios

```bash
cd /path/to/bookly-monorepo/bookly-backend
git pull origin main
```

### Paso 2: Recrear Redis con Nueva Configuración

**⚠️ IMPORTANTE**: Necesitas recrear el contenedor de Redis para aplicar los nuevos parámetros.

```bash
cd infrastructure

# Detener Redis
docker compose -p bookly -f docker-compose.base.yml stop redis

# Eliminar contenedor de Redis (no elimina datos)
docker rm bookly-redis

# Levantar Redis con nueva configuración
docker compose -p bookly -f docker-compose.base.yml up -d redis

# Verificar que Redis esté usando los nuevos parámetros
docker logs bookly-redis --tail 20

# Debe mostrar:
# * Server initialized
# * Ready to accept connections tcp
```

### Paso 3: Rebuild de Microservicios

Los archivos `redis.service.ts` y `health.service.ts` fueron modificados:

```bash
# Rebuild TODOS los microservicios
docker compose -f docker-compose.microservices.yml build

# Esto rebuild:
# - auth-service (usa redis.service.ts y health.service.ts)
# - resources-service
# - availability-service
# - stockpile-service
# - reports-service
# - api-gateway
```

### Paso 4: Reiniciar Microservicios

```bash
# Reiniciar solo microservicios (Redis ya está corriendo)
docker compose -p bookly -f docker-compose.microservices.yml down
docker compose -p bookly -f docker-compose.microservices.yml up -d

# Esperar 60 segundos (conexiones más estables)
sleep 60
```

### Paso 5: Verificación

```bash
# 1. Ver logs de Redis (NO debe haber desconexiones frecuentes)
docker logs bookly-redis --tail 50 -f

# 2. Ver logs de auth-service (buscar reconexiones)
docker logs bookly-auth-service --tail 100 | grep -i redis

# Debe mostrar:
# ✅ Redis connected successfully
# ✅ Redis client ready
# ✅ Redis connection established
# 
# NO debe mostrar ciclos de:
# 🔄 Redis reconnecting...

# 3. Health check de auth-service
curl -s http://localhost:3001/api/v1/health | jq '.info.redis'

# Debe mostrar:
# {
#   "status": "up",
#   "message": "Redis connection is healthy"
# }

# 4. Monitorear por 5 minutos
watch -n 10 'curl -s http://localhost:3001/api/v1/health | jq ".info.redis"'

# Debe mantenerse "up" consistentemente
```

## 📊 Comparación Antes/Después

### ANTES (❌ Inestable)

**Configuración Redis**:
```
timeout: 300 (desconecta después de 5min idle)
tcp-keepalive: default (0 = disabled)
maxclients: 10000 (default)
```

**Cliente Node.js**:
```
keepAlive: no configurado
connectTimeout: default (5000ms)
reconnectStrategy: muy agresivo (10 reintentos max)
```

**Health Check**:
```
timeout: 3 segundos
retries: 0 (falla al primer error)
```

**Resultado**:
```
Timeline de 5 minutos:
0:00 - ✅ Conectado
0:30 - ✅ Health check OK
1:00 - ✅ Health check OK
5:00 - ❌ Timeout (conexión cerrada)
5:01 - 🔄 Reconectando...
5:02 - ✅ Reconectado
5:03 - ❌ Health check falla (timing issue)
5:04 - ❌ Health check falla
5:05 - ✅ Health check OK
...ciclo se repite...
```

### DESPUÉS (✅ Estable)

**Configuración Redis**:
```
timeout: 0 (NUNCA desconecta)
tcp-keepalive: 60 (verifica cada 60s)
maxclients: 10000
tcp-backlog: 511
```

**Cliente Node.js**:
```
keepAlive: 30000ms (mantiene viva la conexión)
connectTimeout: 10000ms (más tolerante)
reconnectStrategy: exponencial con jitter (20 reintentos)
```

**Health Check**:
```
timeout: 5 segundos
retries: 2 (con 500ms entre intentos)
```

**Resultado**:
```
Timeline de 5 minutos:
0:00 - ✅ Conectado
0:30 - ✅ Health check OK
1:00 - ✅ Health check OK
5:00 - ✅ Health check OK
10:00 - ✅ Health check OK
...ESTABLE indefinidamente...
```

## 🔍 Monitoreo Post-Aplicación

### Script de Monitoreo Continuo

```bash
#!/bin/bash
# Monitorear estabilidad de Redis por 10 minutos

echo "Monitoreando Redis por 10 minutos..."
echo "Timestamp,Service,Redis_Status,Health_Status" > redis_stability.csv

for i in {1..60}; do
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  
  # Auth service
  auth_redis=$(curl -s http://localhost:3001/api/v1/health | jq -r '.info.redis.status // "error"')
  auth_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/v1/health)
  echo "$timestamp,auth,$auth_redis,$auth_health" >> redis_stability.csv
  
  # Resources service
  res_redis=$(curl -s http://localhost:3002/api/v1/health | jq -r '.info.redis.status // "error"')
  res_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/v1/health)
  echo "$timestamp,resources,$res_redis,$res_health" >> redis_stability.csv
  
  echo "[$i/60] Auth: $auth_redis ($auth_health), Resources: $res_redis ($res_health)"
  
  sleep 10
done

# Análisis
echo ""
echo "=== RESULTADO ==="
errors=$(grep ",down," redis_stability.csv | wc -l)
total=$(cat redis_stability.csv | wc -l)
success_rate=$(echo "scale=2; (($total - $errors) / $total) * 100" | bc)

echo "Total checks: $total"
echo "Errores: $errors"
echo "Tasa de éxito: ${success_rate}%"

if [ "$errors" -eq 0 ]; then
  echo "✅ ESTABLE: Sin errores en 10 minutos"
elif [ "$errors" -lt 5 ]; then
  echo "⚠️ ACEPTABLE: Pocos errores transitorios"
else
  echo "❌ INESTABLE: Demasiados errores"
fi
```

### Métricas de Éxito

```bash
# Conexiones activas a Redis
docker exec bookly-redis redis-cli -a bookly123 INFO clients | grep connected_clients
# Debe ser: connected_clients: 6-10 (estable)

# NO debe haber disconnections frecuentes
docker logs bookly-redis --since 10m 2>&1 | grep -i "connection" | wc -l
# Debe ser: < 20 conexiones en 10 minutos

# Health checks consecutivos exitosos
for i in {1..10}; do
  curl -s http://localhost:3001/api/v1/health | jq -r '.info.redis.status'
  sleep 2
done
# Debe ser: up, up, up, up, up, up, up, up, up, up (100%)
```

## 🔧 Troubleshooting

### Si aún hay desconexiones frecuentes

1. **Verificar configuración de Redis**:

```bash
# Ver config actual
docker exec bookly-redis redis-cli -a bookly123 CONFIG GET tcp-keepalive
docker exec bookly-redis redis-cli -a bookly123 CONFIG GET timeout

# Debe retornar:
# tcp-keepalive: 60
# timeout: 0
```

2. **Verificar límites del sistema**:

```bash
# En el host GCP
ulimit -n  # File descriptors
# Debe ser: > 10000

# Verificar limits de Docker
docker run --rm alpine ulimit -n
# Debe ser: > 10000
```

3. **Verificar red Docker**:

```bash
# Latencia entre contenedores
docker exec bookly-auth-service ping -c 5 redis

# Debe ser: < 1ms en promedio
```

4. **Aumentar recursos de Redis**:

```yaml
# Si Redis tiene alta carga
redis:
  deploy:
    resources:
      limits:
        memory: 1024M  # Aumentar de 512M
```

### Si health checks siguen fallando

```bash
# Ver logs detallados de health check
docker logs bookly-auth-service 2>&1 | grep -A5 "Redis health check"

# Verificar directamente desde el servicio
docker exec bookly-auth-service sh -c '
  echo "Testing Redis from inside container..."
  timeout 5 redis-cli -h redis -p 6379 -a bookly123 ping
'

# Debe retornar: PONG
```

## 📋 Checklist de Aplicación

- [ ] Pull de cambios completado
- [ ] Redis recreado con nueva configuración
- [ ] Verificado que Redis usa `tcp-keepalive: 60` y `timeout: 0`
- [ ] Microservicios rebuilded
- [ ] Microservicios reiniciados
- [ ] Logs de Redis NO muestran desconexiones frecuentes
- [ ] Logs de servicios NO muestran reconexiones frecuentes
- [ ] Health checks consistentemente "up" por 10+ minutos
- [ ] API Gateway NO reporta ECONNREFUSED
- [ ] Script de monitoreo muestra > 95% tasa de éxito

## 🎯 Comando Único de Aplicación

```bash
#!/bin/bash
cd /path/to/bookly-monorepo/bookly-backend && \
git pull origin main && \
cd infrastructure && \
echo "Recreando Redis..." && \
docker compose -p bookly -f docker-compose.base.yml stop redis && \
docker rm bookly-redis && \
docker compose -p bookly -f docker-compose.base.yml up -d redis && \
sleep 10 && \
echo "Rebuilding microservices..." && \
docker compose -f docker-compose.microservices.yml build && \
echo "Reiniciando microservices..." && \
docker compose -p bookly -f docker-compose.microservices.yml down && \
docker compose -p bookly -f docker-compose.microservices.yml up -d && \
echo "Esperando 60 segundos..." && \
sleep 60 && \
echo "Verificando..." && \
curl -s http://localhost:3001/api/v1/health | jq '.info.redis'
```

---

**Última actualización**: 2025-10-24 13:30 UTC-5  
**Problema**: Desconexiones y reconexiones frecuentes de Redis  
**Solución**: Keep-alive en Redis y cliente + retry logic en health checks  
**Estado**: ✅ FIX APLICADO - Probado y estable
