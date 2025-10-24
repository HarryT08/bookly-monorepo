# 🔧 FIX CRÍTICO: Servicios Escuchando en localhost en Docker

## 🐛 Problema Real Identificado

Los microservicios estaban **escuchando en `localhost`** en lugar de `0.0.0.0`, haciendo que **NO sean accesibles desde otros contenedores Docker**.

### Síntoma
```
[WARN] Health check failed for auth at http://auth-service:3001/api/v1/health: connect ECONNREFUSED 172.20.0.12:3001
```

### Diagnóstico Realizado

**Script de diagnóstico ejecutado**:
```bash
./scripts/check-microservices-logs.sh
```

**Resultado**:
```
✓ bookly-auth-service está escuchando en puerto 3001
✓ bookly-resources-service está escuchando en puerto 3002
✓ bookly-availability-service está escuchando en puerto 3003
✓ bookly-stockpile-service está escuchando en puerto 3004
✓ bookly-reports-service está escuchando en puerto 3005

Pero los logs mostraban:
🚀 Auth Service is running on: http://localhost:3001
```

### Causa Raíz

En Docker, cuando un servicio escucha en `localhost`:
- ❌ Solo es accesible **desde dentro del mismo contenedor**
- ❌ Otros contenedores **NO pueden conectarse**
- ❌ `localhost` se refiere a la interfaz loopback del contenedor individual

**Explicación Técnica**:
```
localhost = 127.0.0.1 = Loopback del contenedor
0.0.0.0 = Todas las interfaces de red = Accesible desde red Docker
```

## ✅ Solución Implementada

### Cambios en `main.ts` de cada microservicio

**Antes** (INCORRECTO):
```typescript
const host = configService.get<string>('auth.service.host', 'localhost');
await app.listen(port, host);
// Resultado: Service is running on: http://localhost:3001
```

**Después** (CORRECTO):
```typescript
const host = configService.get<string>('auth.service.host', '0.0.0.0');
await app.listen(port, host);
// Resultado: Service is running on: http://0.0.0.0:3001
```

### Archivos Modificados

| Archivo | Línea | Cambio |
|---------|-------|--------|
| `auth-service/main.ts` | 21 | `"localhost"` → `"0.0.0.0"` |
| `resources-service/main.ts` | 21-23 | `"localhost"` → `"0.0.0.0"` |
| `availability-service/main.ts` | 21-23 | `"localhost"` → `"0.0.0.0"` |
| `stockpile-service/main.ts` | 21-23 | `"localhost"` → `"0.0.0.0"` |
| `reports-service/main.ts` | 21 | `"localhost"` → `"0.0.0.0"` |

## 🚀 Aplicar en GCP INMEDIATAMENTE

### Paso 1: Pull de Cambios

```bash
cd /path/to/bookly-monorepo/bookly-backend
git pull origin main
```

### Paso 2: Rebuild de TODOS los Microservicios

**⚠️ CRÍTICO**: Los archivos `main.ts` cambiaron, necesitas rebuild completo:

```bash
cd infrastructure

# Rebuild de TODOS los microservicios (necesario)
docker compose -f docker-compose.microservices.yml build

# Esto rebuild:
# - auth-service
# - resources-service
# - availability-service
# - stockpile-service
# - reports-service
# - api-gateway (también por las buenas prácticas)
```

### Paso 3: Detener y Reiniciar Todo

```bash
# Detener todos los servicios
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml down

# Levantar todo de nuevo
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml up -d

# Esperar 30-60 segundos para que inicien
sleep 30
```

### Paso 4: Verificar con el Script de Diagnóstico

```bash
# Ejecutar diagnóstico completo
./scripts/check-microservices-logs.sh
```

**Resultado Esperado**:
```
✓ bookly-auth-service está escuchando en puerto 3001
✓ bookly-resources-service está escuchando en puerto 3002
✓ bookly-availability-service está escuchando en puerto 3003
✓ bookly-stockpile-service está escuchando en puerto 3004
✓ bookly-reports-service está escuchando en puerto 3005

Logs:
🚀 Auth Service is running on: http://0.0.0.0:3001  ✅
🚀 Resources Service is running on: http://0.0.0.0:3002  ✅
...

CONECTIVIDAD ENTRE SERVICIOS:
✓ API Gateway → auth-service:3001 (OK)
✓ API Gateway → resources-service:3002 (OK)
...
```

### Paso 5: Verificar Health Checks desde API Gateway

```bash
# Ver logs del API Gateway
docker logs bookly-api-gateway --tail 30 -f

# NO debe haber errores ECONNREFUSED
# Debe mostrar:
# [LoadBalancerService] Health check result for auth: status=200, healthy=true
```

## 🔍 Verificación Manual Rápida

### Test de Conectividad

```bash
# Desde API Gateway hacia auth-service
docker exec bookly-api-gateway curl -s http://auth-service:3001/api/v1/health | jq .

# Debe responder:
# {
#   "status": "ok",
#   "info": {
#     "database": { "status": "up" },
#     "redis": { "status": "up" },
#     "rabbitmq": { "status": "up" }
#   }
# }
```

### Test de Aggregated Health

```bash
curl -s http://localhost:3000/health/aggregated | jq .

# Debe mostrar todos los servicios "up":
# {
#   "status": "healthy",
#   "services": {
#     "auth": { "status": "up" },
#     "resources": { "status": "up" },
#     "availability": { "status": "up" },
#     "stockpile": { "status": "up" },
#     "reports": { "status": "up" }
#   }
# }
```

## 📊 Comparación Antes/Después

### ANTES (❌ Fallaba)
```
Estado: Servicios corriendo pero inaccesibles
Logs: "Service is running on: http://localhost:3001"
Binding: 127.0.0.1:3001
Accesible desde: Solo dentro del contenedor
Health Checks: ECONNREFUSED 172.20.0.12:3001
Resultado: Gateway no puede conectar
```

### DESPUÉS (✅ Funciona)
```
Estado: Servicios accesibles desde red Docker
Logs: "Service is running on: http://0.0.0.0:3001"
Binding: 0.0.0.0:3001
Accesible desde: Toda la red Docker
Health Checks: HTTP 200 OK
Resultado: Gateway puede conectar exitosamente
```

## 🆘 Troubleshooting

### Si aún ves ECONNREFUSED después del fix

1. **Verificar que hiciste rebuild**:
```bash
# Ver fecha de build de la imagen
docker images | grep bookly

# Si las imágenes son viejas (antes del fix), rebuild:
docker compose -f docker-compose.microservices.yml build --no-cache
```

2. **Verificar logs de inicio**:
```bash
docker logs bookly-auth-service --tail 50 | grep "running on"

# Debe mostrar: http://0.0.0.0:3001
# Si muestra localhost, el rebuild no funcionó
```

3. **Verificar binding real del puerto**:
```bash
# Desde dentro del contenedor
docker exec bookly-auth-service netstat -tlnp | grep 3001

# Debe mostrar: 0.0.0.0:3001 LISTEN
# NO debe mostrar: 127.0.0.1:3001
```

4. **Test de conectividad directa**:
```bash
# Desde otro contenedor
docker exec bookly-api-gateway nc -zv auth-service 3001

# Debe mostrar: auth-service (172.20.0.X:3001) open
```

### Si el rebuild falla

```bash
# Limpiar todo y rebuild desde cero
docker compose -f docker-compose.microservices.yml down
docker system prune -f
docker compose -f docker-compose.microservices.yml build --no-cache
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml up -d
```

## 📝 Por Qué localhost No Funciona en Docker

### Conceptos Clave

**1. Namespace de Red en Docker**:
Cada contenedor tiene su propio namespace de red con:
- Su propia interfaz loopback (`lo` / `127.0.0.1`)
- Interfaz conectada a la red Docker (`eth0` / IP de red Docker)

**2. Binding de Sockets**:
```
localhost/127.0.0.1 → Solo loopback del contenedor
0.0.0.0 → Todas las interfaces (loopback + eth0)
```

**3. Comunicación entre Contenedores**:
- Los contenedores se conectan a través de la red Docker
- Usan IPs de red Docker (172.20.0.X)
- **NO usan localhost/127.0.0.1**

### Diagrama Visual

```
┌─────────────────────────────────────────┐
│  Contenedor auth-service                │
│                                          │
│  listen(3001, 'localhost')              │
│      ↓                                   │
│  127.0.0.1:3001 (loopback) ❌          │
│  No accesible desde fuera               │
└─────────────────────────────────────────┘
           ↑ ECONNREFUSED
┌──────────┴──────────────────────────────┐
│  Contenedor api-gateway                 │
│  Intenta: http://auth-service:3001      │
│  Resuelve: 172.20.0.12:3001            │
│  Pero 172.20.0.12:3001 no está bound   │
└─────────────────────────────────────────┘

VS

┌─────────────────────────────────────────┐
│  Contenedor auth-service                │
│                                          │
│  listen(3001, '0.0.0.0')                │
│      ↓                                   │
│  0.0.0.0:3001 (todas las interfaces) ✅│
│  - 127.0.0.1:3001 (loopback)           │
│  - 172.20.0.12:3001 (eth0/Docker) ✅   │
└─────────────────────────────────────────┘
           ↑ HTTP 200 OK
┌──────────┴──────────────────────────────┐
│  Contenedor api-gateway                 │
│  Intenta: http://auth-service:3001      │
│  Resuelve: 172.20.0.12:3001 ✅         │
│  Se conecta exitosamente               │
└─────────────────────────────────────────┘
```

## 🎯 Checklist de Verificación Final

- [ ] Pull de cambios completado
- [ ] Rebuild de TODOS los microservicios
- [ ] Servicios reiniciados
- [ ] Logs muestran `0.0.0.0` en lugar de `localhost`
- [ ] Script de diagnóstico ejecutado sin errores
- [ ] Health checks del API Gateway exitosos (200 OK)
- [ ] NO hay errores ECONNREFUSED en logs
- [ ] Aggregated health muestra todos "up"
- [ ] Test de conectividad manual exitoso

## 📊 Métricas de Éxito

```bash
# Verificar que NO haya errores ECONNREFUSED
docker logs bookly-api-gateway 2>&1 | grep ECONNREFUSED | wc -l
# Debe ser: 0

# Verificar health checks exitosos
docker logs bookly-api-gateway 2>&1 | grep "healthy=true" | wc -l
# Debe ser: > 0

# Verificar servicios up
curl -s http://localhost:3000/health/aggregated | jq '.services | length'
# Debe ser: 5

# Verificar todos up
curl -s http://localhost:3000/health/aggregated | jq '.services | to_entries[] | select(.value.status != "up")'
# No debe mostrar nada (todos up)
```

## 📚 Referencias

- [Docker Networking Overview](https://docs.docker.com/network/)
- [NestJS Application Options](https://docs.nestjs.com/faq/http-adapter#getting-started)
- [Node.js net.Server.listen()](https://nodejs.org/api/net.html#serverlistenport-host-backlog-callback)

---

**Última actualización**: 2025-10-23 22:30 UTC-5  
**Problema**: Servicios escuchando en localhost  
**Solución**: Cambiar binding a 0.0.0.0  
**Estado**: ✅ FIX APLICADO - Listo para deploy
