# Nginx y Microservicios - Guía de Gestión

## Comportamiento Normal

### ⚠️ Nginx Falla si NO Hay Microservicios

**Esto es completamente NORMAL y esperado.**

Nginx está configurado para hacer proxy a los microservicios:
- API Gateway (puerto 3000)
- Auth Service (puerto 3001)
- Resources Service (puerto 3002)
- Availability Service (puerto 3003)
- Stockpile Service (puerto 3004)
- Reports Service (puerto 3005)

Cuando inicias **solo los servicios base** (MongoDB, Redis, RabbitMQ) sin desplegar microservicios, nginx **intentará conectarse a hosts que no existen** y **fallará al iniciar**.

### Errores Típicos (Esperados)

```
nginx: [emerg] host not found in upstream "host.docker.internal:3000"
```

Este error significa que nginx no puede resolver el hostname porque el microservicio **no está corriendo todavía**.

## Soluciones

### Opción 1: Detener Nginx Hasta Desplegar Microservicios (Recomendado)

```bash
# Detener solo nginx
make nginx-stop

# Verificar que los demás servicios siguen corriendo
docker ps

# Cuando despliegues los microservicios, reinicia nginx
make nginx-start
```

### Opción 2: Ver Estado y Errores

```bash
# Ver estado de nginx y microservicios disponibles
make nginx-status

# Ver errores específicos de nginx
make nginx-errors

# Ver logs en tiempo real
make nginx-logs
```

### Opción 3: Reiniciar Nginx Después de Desplegar Microservicios

```bash
# 1. Desplegar tus microservicios primero
npm run start:dev

# 2. Verificar que estén corriendo
docker ps | grep bookly

# 3. Iniciar/reiniciar nginx
make nginx-start
# o
make nginx-restart
```

## Comandos Disponibles

### Gestión de Nginx

```bash
make nginx-start    # Iniciar nginx (pregunta si no hay microservicios)
make nginx-stop     # Detener nginx
make nginx-restart  # Reiniciar nginx
make nginx-status   # Ver estado de nginx y microservicios
make nginx-logs     # Ver logs en tiempo real
make nginx-errors   # Buscar errores en logs
```

### Workflow Típico

#### Desarrollo Sin Microservicios

```bash
# 1. Iniciar servicios base (MongoDB, Redis, RabbitMQ)
make dev-start

# 2. Detener nginx (opcional, si da errores molestos)
make nginx-stop

# 3. Trabajar con la base de datos, redis, etc.
# ...

# 4. Cuando estés listo para probar con microservicios
npm run start:dev

# 5. Iniciar nginx para hacer proxy
make nginx-start
```

#### Desarrollo Con Microservicios

```bash
# 1. Iniciar todo junto
make dev-start

# 2. Desplegar microservicios inmediatamente
npm run start:dev

# 3. Verificar que nginx esté funcionando
make nginx-status

# 4. Si hay errores, reiniciar nginx
make nginx-restart
```

## Verificación

### Verificar que Nginx Está OK

```bash
# Ver estado
make nginx-status

# Debe mostrar:
# ✅ Nginx está CORRIENDO
# ✅ Microservicios disponibles:
#   ✅ bookly-api-gateway
#   ✅ bookly-auth-service
#   etc.
```

### Verificar Conexión a Microservicios

```bash
# Probar endpoint de health del API Gateway a través de nginx
curl http://localhost/health

# Probar autenticación a través de nginx
curl http://localhost/api/v1/auth/health
```

## Troubleshooting

### Problema: Nginx en Loop de Errores

**Síntoma**: Logs de nginx llenos de "host not found"

**Causa**: Microservicios no están corriendo

**Solución**:
```bash
# Opción A: Detener nginx
make nginx-stop

# Opción B: Desplegar microservicios primero
npm run start:dev
make nginx-restart
```

### Problema: Nginx NO Puede Conectarse Después de Desplegar

**Síntoma**: Microservicios corriendo pero nginx da 502 Bad Gateway

**Causa**: Nginx necesita reiniciarse para detectar nuevos servicios

**Solución**:
```bash
# Reiniciar nginx
make nginx-restart

# Verificar logs
make nginx-logs
```

### Problema: host.docker.internal No Funciona en Linux/GCP

**Síntoma**: "host not found in upstream host.docker.internal"

**Causa**: `host.docker.internal` solo funciona en Docker Desktop (Mac/Windows)

**Solución**: Ya aplicada en `docker-compose.base.yml`:
```yaml
nginx:
  extra_hosts:
    - "host.docker.internal:host-gateway"
```

## Configuración Actual

### Upstreams Configurados

Nginx tiene configurados estos upstreams en `/infrastructure/nginx/nginx.conf`:

- **api_gateway**: `host.docker.internal:3000` + `172.20.0.1:3000` (backup)
- **auth_service**: `host.docker.internal:3001` + `172.20.0.1:3001` (backup)
- **resources_service**: `host.docker.internal:3002` + `172.20.0.1:3002` (backup)
- **availability_service**: `host.docker.internal:3003` + `172.20.0.1:3003` (backup)
- **stockpile_service**: `host.docker.internal:3004` + `172.20.0.1:3004` (backup)
- **reports_service**: `host.docker.internal:3005` + `172.20.0.1:3005` (backup)

### Rutas Configuradas

- `/` → API Gateway
- `/api/v1/auth/*` → Auth Service
- `/api/v1/resources/*` → Resources Service
- `/api/v1/availability/*` → Availability Service
- `/api/v1/stockpile/*` → Stockpile Service
- `/api/v1/reports/*` → Reports Service

## Resumen

✅ **Es NORMAL que nginx falle sin microservicios**  
✅ **Usa `make nginx-stop` para detenerlo temporalmente**  
✅ **Inicia nginx después de desplegar microservicios**  
✅ **Usa `make nginx-status` para verificar estado**  
✅ **Los servicios base (MongoDB, Redis, RabbitMQ) NO necesitan nginx**
