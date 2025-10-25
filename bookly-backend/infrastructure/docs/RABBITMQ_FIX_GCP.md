# 🐰 Fix: RabbitMQ Connection Issues en GCP

## 🐛 Problema

```
Error: connection refused to rabbitmq:5672
ACCESS_REFUSED - Login was refused using authentication mechanism PLAIN
```

## 🔍 Causas Identificadas

### 1. **Vhost Mismatch** ✅ CORREGIDO

**Problema**: El vhost en definitions.json era `/bookly` pero la URL de conexión usa `bookly` (sin slash).

**Error en logs**:

```
[error] vhost bookly not found
```

**Solución Aplicada**:

- `definitions.json`: Cambiado de `"name": "/bookly"` → `"name": "bookly"`
- `rabbitmq.conf`: Cambiado `default_vhost = /bookly` → `default_vhost = bookly`
- `docker-compose.base.yml`: Cambiado `RABBITMQ_DEFAULT_VHOST: /bookly` → `bookly`

### 2. **Password Hash Incorrecto** ✅ CORREGIDO

**Problema**: El archivo `definitions.json` tenía la contraseña en texto plano en lugar de hasheada.

**Solución Aplicada**:

```json
// ❌ Antes (incorrecto)
{
  "name": "bookly",
  "password": "bookly123",
  "tags": "administrator"
}

// ✅ Ahora (correcto)
{
  "name": "bookly",
  "password_hash": "msP0jMdLL/RQnJsU2XeV6Z+yU4/3BCfNC1WiNYAugXwpHRPT",
  "hashing_algorithm": "rabbit_password_hashing_sha256",
  "tags": ["administrator"]
}
```

### 2. **Healthcheck Mejorado** ✅ APLICADO

El healthcheck anterior solo verificaba que RabbitMQ respondiera, pero no que estuviera completamente funcional.

**Nuevo healthcheck**:

```yaml
healthcheck:
  test:
    [
      "CMD-SHELL",
      "rabbitmq-diagnostics check_port_connectivity && rabbitmq-diagnostics check_running && rabbitmq-diagnostics check_local_alarms",
    ]
  interval: 10s
  timeout: 10s
  retries: 10
  start_period: 60s # Da 60s para que RabbitMQ inicie y cargue definiciones
```

### 3. **Depends_on con Healthcheck** ✅ YA CONFIGURADO

Todos los microservicios ya tienen:

```yaml
depends_on:
  rabbitmq:
    condition: service_healthy # Esperan a que RabbitMQ esté healthy
```

## 🚀 Pasos para Aplicar en GCP

### Paso 1: Subir Cambios al Repositorio

```bash
cd /Users/henderorlando/Documents/GitHub/bookly-monorepo

# Verificar cambios
git status

# Agregar archivos modificados
git add bookly-backend/infrastructure/rabbitmq/definitions.json
git add bookly-backend/infrastructure/docker-compose.base.yml
git add bookly-backend/infrastructure/docker-compose.microservices.yml

# Commit
git commit -m "fix: Corregir autenticación RabbitMQ y mejorar healthcheck

- Cambiado password en texto plano por password_hash en definitions.json
- Mejorado healthcheck de RabbitMQ con múltiples verificaciones
- Aumentado start_period a 60s para dar tiempo de carga de definiciones
- API Gateway ahora espera a que RabbitMQ esté healthy"

# Push
git push origin main
```

### Paso 2: En el Servidor GCP

```bash
# SSH al servidor
gcloud compute ssh bookly-server --zone=your-zone

# O SSH directo
ssh user@your-gcp-ip

# Navegar al proyecto
cd /path/to/bookly-monorepo/bookly-backend/infrastructure

# Pull de los cambios
git pull origin main
```

### Paso 3: Aplicar Fix de RabbitMQ

**⚠️ IMPORTANTE**: Necesitas eliminar el volumen de RabbitMQ para que cargue las nuevas definiciones.

**Opción A - Comando Automatizado (Recomendado)**:

```bash
# Ejecuta el fix completo automáticamente
make dev-fix-rabbitmq

# Reinicia los microservicios
make microservices-restart
```

**Opción B - Paso a Paso Manual**:

```bash
# Detener RabbitMQ
docker compose -f docker-compose.base.yml stop rabbitmq

# Eliminar volumen de RabbitMQ (las definiciones se recargarán desde el archivo)
docker volume rm bookly_rabbitmq_data

# Reiniciar RabbitMQ
docker compose -f docker-compose.base.yml up -d rabbitmq

# Esperar 60 segundos a que cargue las definiciones
sleep 60

# Verificar vhost
docker exec bookly-rabbitmq rabbitmqctl list_vhosts

# Verificar permisos
docker exec bookly-rabbitmq rabbitmqctl list_permissions -p bookly
```

### Paso 4: Rebuild y Reiniciar

```bash
# Rebuild de todo (opcional pero recomendado)
docker compose -f docker-compose.dev.yml build --no-cache

# Iniciar servicios base primero
docker compose -f docker-compose.base.yml up -d

# Esperar a que RabbitMQ esté healthy
watch -n 2 'docker ps --filter "name=rabbitmq" --format "table {{.Names}}\t{{.Status}}"'
# Esperar hasta ver: "Up X minutes (healthy)"

# Luego iniciar microservicios
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml up -d
```

### Paso 5: Verificar RabbitMQ

```bash
# 1. Ver logs de RabbitMQ
docker logs bookly-rabbitmq --tail 100

# Buscar líneas como:
# - "Server startup complete"
# - "Management definitions import succeeded"
# - "accepted AMQP connection"

# 2. Verificar que el vhost /bookly existe
docker exec bookly-rabbitmq rabbitmqctl list_vhosts

# Debería mostrar:
# Listing vhosts ...
# name
# /bookly

# 3. Verificar que el usuario bookly tiene permisos
docker exec bookly-rabbitmq rabbitmqctl list_permissions -p /bookly

# Debería mostrar:
# Listing permissions for vhost "/bookly" ...
# user   configure  write  read
# bookly  .*         .*     .*

# 4. Verificar exchanges
docker exec bookly-rabbitmq rabbitmqctl list_exchanges -p /bookly

# Debería mostrar exchanges como:
# - bookly.events
# - booklyapp.commands
# - bookly.notifications
# - bookly.dlx

# 5. Test de conexión manual
docker exec -it bookly-rabbitmq rabbitmq-diagnostics check_port_connectivity
docker exec -it bookly-rabbitmq rabbitmq-diagnostics check_running
docker exec -it bookly-rabbitmq rabbitmq-diagnostics check_local_alarms
```

### Paso 6: Verificar Microservicios

```bash
# Ver que los microservicios NO se estén reiniciando
watch -n 2 'docker ps --filter "name=bookly" --format "table {{.Names}}\t{{.Status}}"'

# Ver logs de un microservicio para verificar conexión a RabbitMQ
docker logs bookly-api-gateway --tail 50 2>&1 | grep -i rabbit

# Debería ver algo como:
# [Nest] LOG [RabbitMQModule] Successfully connected to RabbitMQ
# [Nest] LOG [RabbitMQModule] Channel created

# NO debe ver:
# Error: connect ECONNREFUSED
# ACCESS_REFUSED - Login was refused
```

### Paso 7: Acceder a RabbitMQ Management UI

```bash
# Desde tu navegador local (si tienes firewall abierto):
http://your-gcp-ip:15672

# Credenciales:
# Usuario: bookly
# Password: bookly123

# En la UI, verificar:
# - Connections tab: Debería haber conexiones de los microservicios
# - Channels tab: Debería haber canales activos
# - Queues tab: Deberían aparecer las colas configuradas
```

## 🔍 Troubleshooting Adicional

### Si RabbitMQ no inicia

```bash
# Ver logs completos
docker logs bookly-rabbitmq 2>&1 | less

# Buscar errores como:
# - Error loading definitions
# - Permission denied
# - Port already in use

# Verificar que los archivos de configuración se montan correctamente
docker exec bookly-rabbitmq ls -la /etc/rabbitmq/
# Debe mostrar:
# - rabbitmq.conf
# - definitions.json

# Ver contenido de archivos montados
docker exec bookly-rabbitmq cat /etc/rabbitmq/definitions.json | head -20
```

### Si las definiciones no se cargan

```bash
# Verificar que el archivo definitions.json es válido JSON
cd infrastructure/rabbitmq
cat definitions.json | python3 -m json.tool > /dev/null && echo "✅ JSON válido" || echo "❌ JSON inválido"

# Forzar recarga de definiciones (si RabbitMQ ya está corriendo)
docker exec bookly-rabbitmq rabbitmqctl import_definitions /etc/rabbitmq/definitions.json
```

### Si los microservicios no pueden conectarse

```bash
# 1. Verificar que RabbitMQ está en la misma red
docker network inspect bookly_bookly-network | grep -A 5 "bookly-rabbitmq"

# 2. Test de conectividad desde un microservicio
docker exec bookly-api-gateway nc -zv rabbitmq 5672
# Debería mostrar: rabbitmq (172.20.0.x:5672) open

# 3. Verificar variables de entorno del microservicio
docker exec bookly-api-gateway env | grep RABBITMQ
# Debería mostrar:
# RABBITMQ_URL=amqp://bookly:bookly123@rabbitmq:5672/bookly

# 4. Test de autenticación desde un microservicio
docker exec -it bookly-api-gateway sh
# Dentro del contenedor:
apk add --no-cache curl
curl -u bookly:bookly123 http://rabbitmq:15672/api/overview
# Debería retornar JSON con información de RabbitMQ
```

### Si persiste ACCESS_REFUSED

Esto podría significar que las credenciales hasheadas no coinciden. Regenera el hash:

```bash
# En tu máquina local
python3 << 'EOF'
import hashlib, base64, os
password = 'bookly123'
salt = os.urandom(4)
hash = hashlib.sha256(salt + password.encode()).digest()
encoded = base64.b64encode(salt + hash).decode()
print(f"Salt (hex): {salt.hex()}")
print(f"Password hash: {encoded}")
EOF

# Actualiza el password_hash en definitions.json con el nuevo valor
# Luego repite los pasos 3-5
```

## 📊 Estado Esperado Post-Fix

### RabbitMQ Management UI

Connections: **6+** (uno por cada microservicio)

```
Connection name          User    Virtual host    State
[email protected]/172.20.0.10    bookly  /bookly         running
[email protected]/172.20.0.11    bookly  /bookly         running
[email protected]/172.20.0.12  bookly  /bookly         running
...
```

### Logs de Microservicios

```bash
$ docker logs bookly-api-gateway 2>&1 | grep -i rabbit

[Nest] LOG [RabbitMQModule] Connecting to RabbitMQ at amqp://bookly:***@rabbitmq:5672/bookly
[Nest] LOG [RabbitMQModule] Successfully connected to RabbitMQ
[Nest] LOG [RabbitMQModule] Channel created successfully
[Nest] LOG [EventBusService] RabbitMQ Event Bus initialized
```

### Docker PS

```bash
$ docker ps --filter "name=bookly"

NAMES                       STATUS
bookly-rabbitmq             Up 10 minutes (healthy)
bookly-api-gateway          Up 5 minutes (healthy)
bookly-auth-service         Up 5 minutes (healthy)
bookly-resources-service    Up 5 minutes (healthy)
bookly-availability-service Up 5 minutes (healthy)
bookly-stockpile-service    Up 5 minutes (healthy)
bookly-reports-service      Up 5 minutes (healthy)
```

✅ **Todos healthy, sin reinicios!**

## 🎯 Resumen de Cambios

| Archivo                            | Cambio                          | Razón                                               |
| ---------------------------------- | ------------------------------- | --------------------------------------------------- |
| `rabbitmq/definitions.json`        | Password hash SHA256            | RabbitMQ requiere hash, no texto plano              |
| `docker-compose.base.yml`          | Healthcheck mejorado            | Verificar que RabbitMQ está completamente funcional |
| `docker-compose.microservices.yml` | api-gateway depends_on rabbitmq | Asegurar que RabbitMQ esté healthy antes de iniciar |

## 📝 Comandos de Verificación Rápida

```bash
# Resumen del estado
docker ps --filter "name=bookly" --format "table {{.Names}}\t{{.Status}}" && \
docker exec bookly-rabbitmq rabbitmqctl list_vhosts && \
docker exec bookly-rabbitmq rabbitmqctl list_connections --formatter json | jq '.[] | .user + " @ " + .name'
```

## 🆘 Si Nada Funciona

**Plan B**: Usar credenciales más simples sin hash

1. Modificar `docker-compose.base.yml`:

```yaml
environment:
  RABBITMQ_DEFAULT_USER: bookly
  RABBITMQ_DEFAULT_PASS: bookly123
  RABBITMQ_DEFAULT_VHOST: /bookly
```

2. Eliminar o comentar montaje de `definitions.json` temporalmente:

```yaml
volumes:
  - rabbitmq_data:/var/lib/rabbitmq
  - ./rabbitmq/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf:ro
  # - ./rabbitmq/definitions.json:/etc/rabbitmq/definitions.json:ro  # Comentar
```

3. Reiniciar y crear vhost/permisos manualmente:

```bash
docker compose -f docker-compose.base.yml up -d rabbitmq

# Esperar a que inicie
sleep 30

# Crear vhost y permisos
docker exec bookly-rabbitmq rabbitmqctl add_vhost /bookly
docker exec bookly-rabbitmq rabbitmqctl set_permissions -p /bookly bookly ".*" ".*" ".*"

# Verificar
docker exec bookly-rabbitmq rabbitmqctl list_permissions -p /bookly
```

---

**Última actualización**: 2025-10-23
**Versión RabbitMQ**: 3.12-management-alpine
