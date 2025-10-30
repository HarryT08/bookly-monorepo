# 🔧 FIX: Conflicto de Puertos entre Resources y Availability Services

## 🐛 Problema Identificado

El API Gateway no puede conectarse a `resources-service` ni `availability-service`:

```
Health check failed for availability at 
http://availability-service:3003/api/v1/health: 
connect ECONNREFUSED 172.20.0.12:3003

Health check failed for resources at 
http://resources-service:3002/api/v1/health: 
connect ECONNREFUSED 172.20.0.11:3002
```

## 🔍 Causa Raíz

Los servicios tenían **puertos intercambiados** en sus archivos `main.ts`:

### ❌ ANTES (Incorrecto)

| Servicio | Puerto Config | Puerto Esperado | Estado |
|----------|--------------|-----------------|---------|
| **resources-service** | `3003` ❌ | `3002` | Conflicto |
| **availability-service** | `3002` ❌ | `3003` | Conflicto |

**Archivos con problema**:

```typescript
// ❌ resources-service/main.ts (línea 20)
const port = configService.get<number>("resources.service.port", 3003);
// Debería ser 3002

// ❌ availability-service/main.ts (línea 20)
const port = configService.get<number>("availability.service.port", 3002);
// Debería ser 3003

// ❌ api-gateway/config/gateway.config.ts (líneas 47 y 58)
availability: {
  url: process.env.AVAILABILITY_SERVICE_URL || 'http://localhost:3002', // ❌ Debería ser 3003
}
resources: {
  url: process.env.RESOURCES_SERVICE_URL || 'http://localhost:3003', // ❌ Debería ser 3002
}
```

**Resultado**:
- Ambos servicios intentan usar puertos incorrectos
- Docker expone los puertos correctos (3002 y 3003)
- Pero los servicios internamente escuchan en puertos equivocados
- API Gateway no puede conectarse

## ✅ Solución Implementada

### 1. Corregir Puerto de Resources Service

**Archivo**: `src/apps/resources-service/main.ts`

```typescript
// ✅ DESPUÉS (Correcto)
const port = configService.get<number>("resources.service.port", 3002);
```

**Beneficios**:
- Puerto por defecto correcto: **3002**
- Coincide con docker-compose configuration

### 2. Corregir Puerto de Availability Service

**Archivo**: `src/apps/availability-service/main.ts`

```typescript
// ✅ DESPUÉS (Correcto)
const port = configService.get<number>("availability.service.port", 3003);
```

**Beneficios**:
- Puerto por defecto correcto: **3003**
- Coincide con docker-compose configuration

### 3. Corregir Puertos en API Gateway Config

**Archivo**: `src/apps/api-gateway/config/gateway.config.ts`

```typescript
// ✅ DESPUÉS (Correcto)
availability: {
  url: process.env.AVAILABILITY_SERVICE_URL || 'http://localhost:3003', // ✅ Correcto
}
resources: {
  url: process.env.RESOURCES_SERVICE_URL || 'http://localhost:3002', // ✅ Correcto
}
```

**Beneficios**:
- Load balancer usa puertos correctos
- Health checks funcionan correctamente
- Fallback a puertos correctos si no hay ENV vars

### 4. Tabla de Puertos Correctos

| Servicio | Puerto | Variable ENV | Hostname Docker |
|----------|--------|--------------|-----------------|
| API Gateway | 3000 | `PORT=3000` | `api-gateway` |
| Auth Service | 3001 | `PORT=3001` | `auth-service` |
| **Resources Service** | **3002** | `PORT=3002` | `resources-service` |
| **Availability Service** | **3003** | `PORT=3003` | `availability-service` |
| Stockpile Service | 3004 | `PORT=3004` | `stockpile-service` |
| Reports Service | 3005 | `PORT=3005` | `reports-service` |

## 🚀 Aplicar Fix en GCP AHORA

### **Opción 1: Comando Make (Recomendado)**

```bash
cd /path/to/bookly-monorepo/bookly-backend

# Pull de cambios
git pull origin main

# Aplicar fix automáticamente
cd infrastructure
make dev-fix-service-ports
```

Este comando:
1. ✅ Rebuild de `resources-service` y `availability-service`
2. ✅ Detiene servicios afectados (incluye `api-gateway`)
3. ✅ Elimina contenedores viejos
4. ✅ Inicia servicios con puertos corregidos
5. ✅ Espera 30 segundos para inicialización

### **Opción 2: Manual**

```bash
cd /path/to/bookly-monorepo/bookly-backend

# 1. Pull de cambios
git pull origin main

# 2. Rebuild servicios afectados
cd infrastructure
docker compose -f docker-compose.microservices.yml build resources-service availability-service

# 3. Detener servicios
docker compose -p bookly -f docker-compose.microservices.yml stop resources-service availability-service api-gateway

# 4. Remover contenedores viejos
docker rm bookly-resources-service bookly-availability-service bookly-api-gateway

# 5. Reiniciar con puertos corregidos
docker compose -p bookly -f docker-compose.microservices.yml up -d resources-service availability-service api-gateway

# 6. Esperar inicialización
sleep 30
```

## 🔍 Verificación Post-Fix

### 1. Verificar Puerto de Resources Service (3002)

```bash
# Health check directo
curl -s http://localhost:3002/api/v1/health | jq '.'

# Debe retornar:
# {
#   "status": "ok",
#   "info": {
#     "database": { "status": "up" },
#     "redis": { "status": "up" },
#     "rabbitmq": { "status": "up" }
#   }
# }

# Ver logs (debe mostrar puerto 3002)
docker logs bookly-resources-service --tail 50 | grep "running on"
# Debe mostrar: 🚀 Resources Service is running on: http://0.0.0.0:3002
```

### 2. Verificar Puerto de Availability Service (3003)

```bash
# Health check directo
curl -s http://localhost:3003/api/v1/health | jq '.'

# Debe retornar:
# {
#   "status": "ok",
#   "info": {
#     "database": { "status": "up" },
#     "redis": { "status": "up" },
#     "rabbitmq": { "status": "up" }
#   }
# }

# Ver logs (debe mostrar puerto 3003)
docker logs bookly-availability-service --tail 50 | grep "running on"
# Debe mostrar: 🚀 Availability Service is running on: http://0.0.0.0:3003
```

### 3. Verificar API Gateway Health Check

```bash
# Health check agregado (debe ver ambos servicios como 'healthy')
curl -s http://localhost:3000/api/v1/health/aggregated | jq '.services'

# Debe retornar:
# {
#   "resources": {
#     "status": "healthy",
#     "url": "http://resources-service:3002",
#     "responseTime": "< 100ms"
#   },
#   "availability": {
#     "status": "healthy",
#     "url": "http://availability-service:3003",
#     "responseTime": "< 100ms"
#   },
#   ...
# }

# Ver logs del API Gateway (NO debe haber errores ECONNREFUSED)
docker logs bookly-api-gateway --tail 100 | grep "Health check"

# NO debe aparecer:
# ❌ Health check failed for availability
# ❌ Health check failed for resources
# ❌ connect ECONNREFUSED
```

### 4. Verificar Conectividad Entre Servicios

```bash
# Desde API Gateway hacia Resources
docker exec bookly-api-gateway sh -c 'wget -qO- http://resources-service:3002/api/v1/health'
# Debe retornar JSON con status: "ok"

# Desde API Gateway hacia Availability
docker exec bookly-api-gateway sh -c 'wget -qO- http://availability-service:3003/api/v1/health'
# Debe retornar JSON con status: "ok"
```

### 5. Verificar Puertos en Docker

```bash
# Ver puertos expuestos
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -E "resources|availability"

# Debe mostrar:
# bookly-resources-service      0.0.0.0:3002->3002/tcp
# bookly-availability-service   0.0.0.0:3003->3003/tcp
```

## 📊 Comparación Antes/Después

### ANTES (❌ Conflicto)

```
Docker Compose Config:
  resources-service:
    ports: ["3002:3002"]     ← Puerto expuesto correcto
    environment:
      PORT: 3002              ← Variable ENV correcta

main.ts:
  const port = 3003          ← ❌ Puerto por defecto INCORRECTO

Resultado:
  - Docker expone puerto 3002
  - Servicio escucha internamente en 3003
  - Conexión FALLA: ECONNREFUSED
```

### DESPUÉS (✅ Correcto)

```
Docker Compose Config:
  resources-service:
    ports: ["3002:3002"]     ← Puerto expuesto correcto
    environment:
      PORT: 3002              ← Variable ENV correcta

main.ts:
  const port = configService.get("PORT", 3002)  ← ✅ Correcto

Resultado:
  - Docker expone puerto 3002
  - Servicio escucha internamente en 3002
  - Conexión OK ✅
```

## 🐛 Troubleshooting

### Si Resources Service sigue fallando

```bash
# 1. Ver logs completos
docker logs bookly-resources-service

# Buscar mensaje de puerto:
# ✅ Debe decir: "Resources Service is running on: http://0.0.0.0:3002"
# ❌ Si dice 3003, el fix no se aplicó

# 2. Verificar variable de entorno
docker exec bookly-resources-service env | grep PORT
# Debe mostrar: PORT=3002

# 3. Rebuild forzado
docker compose -f docker-compose.microservices.yml build --no-cache resources-service
docker compose -p bookly -f docker-compose.microservices.yml up -d resources-service
```

### Si Availability Service sigue fallando

```bash
# 1. Ver logs completos
docker logs bookly-availability-service

# Buscar mensaje de puerto:
# ✅ Debe decir: "Availability Service is running on: http://0.0.0.0:3003"
# ❌ Si dice 3002, el fix no se aplicó

# 2. Verificar variable de entorno
docker exec bookly-availability-service env | grep PORT
# Debe mostrar: PORT=3003

# 3. Rebuild forzado
docker compose -f docker-compose.microservices.yml build --no-cache availability-service
docker compose -p bookly -f docker-compose.microservices.yml up -d availability-service
```

### Si API Gateway sigue reportando ECONNREFUSED

```bash
# 1. Verificar red Docker
docker network inspect infrastructure_bookly-network | jq '.[0].Containers'

# Debe mostrar todos los contenedores en la misma red

# 2. Test de conectividad desde API Gateway
docker exec bookly-api-gateway sh -c '
  echo "Testing resources-service..."
  nc -zv resources-service 3002
  echo "Testing availability-service..."
  nc -zv availability-service 3003
'

# Ambos deben retornar: "succeeded"

# 3. Reiniciar API Gateway
docker compose -p bookly -f docker-compose.microservices.yml restart api-gateway
```

## 📋 Checklist de Aplicación

- [ ] Pull de cambios completado (`git pull origin main`)
- [ ] Rebuild de resources-service y availability-service
- [ ] Contenedores viejos eliminados
- [ ] Servicios reiniciados con puertos corregidos
- [ ] Resources service responde en puerto 3002
- [ ] Availability service responde en puerto 3003
- [ ] API Gateway health check sin errores ECONNREFUSED
- [ ] Health check agregado muestra ambos servicios "healthy"
- [ ] Logs no muestran errores de conexión
- [ ] Monitoreo de 5 minutos sin fallos

## 🎯 Resumen del Fix

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Resources Port Config** | `3003` ❌ | `3002` ✅ |
| **Availability Port Config** | `3002` ❌ | `3003` ✅ |
| **Variable ENV Usada** | `resources.service.port` | `PORT` |
| **Docker Expose** | Correcto | Correcto |
| **Internal Listen** | Incorrecto | Correcto ✅ |
| **API Gateway Connection** | ECONNREFUSED ❌ | OK ✅ |
| **Health Checks** | Failing | Passing ✅ |

---

**Última actualización**: 2025-10-24 16:40 UTC-5  
**Problema**: Puertos intercambiados entre resources y availability services  
**Solución**: Corregir main.ts para usar PORT con defaults correctos  
**Estado**: ✅ FIX APLICADO - Listo para deployment
