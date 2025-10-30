# 🚀 Deployment en GCP - Fix de Permisos

## 🐛 Problema Resuelto

**Error**: Microservicios reiniciándose infinitamente por permisos denegados en `/app/logs`

```
Error: EACCES: permission denied, open 'logs/application-2025-10-23.log'
```

**Causa**: Los volúmenes Docker se crean con permisos de root, pero los contenedores corren como usuario `bookly` (UID 1001).

## ✅ Solución Implementada

### 1. Script de Entrypoint con Fix de Permisos

Creado: `infrastructure/scripts/docker-entrypoint.sh`

**Funcionalidad**:
- Crea directorios necesarios (`/app/logs`, `/app/uploads`, etc.)
- Ajusta permisos para usuario `bookly` (UID 1001)
- Ejecuta la aplicación con el usuario correcto usando `su-exec`
- Maneja señales correctamente con `dumb-init`

### 2. Dockerfiles Actualizados

**6 Dockerfiles modificados**:
- ✅ `docker/Dockerfile.api-gateway`
- ✅ `docker/Dockerfile.auth-service`
- ✅ `docker/Dockerfile.resources-service`
- ✅ `docker/Dockerfile.availability-service`
- ✅ `docker/Dockerfile.stockpile-service`
- ✅ `docker/Dockerfile.reports-service`

**Cambios aplicados**:
```dockerfile
# Agregado su-exec para cambiar de usuario
RUN apk add --no-cache dumb-init su-exec

# Copiado el script de entrypoint
COPY infrastructure/scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Removido USER bookly (ahora lo maneja el entrypoint)

# Configurado entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "-r", "ts-node/register", "-r", "tsconfig-paths/register", "src/apps/XXX-service/main.ts"]
```

## 🚀 Instrucciones de Deployment en GCP

### Paso 1: Subir Cambios a Git

```bash
cd /Users/henderorlando/Documents/GitHub/bookly-monorepo

# Verificar cambios
git status

# Agregar archivos modificados
git add bookly-backend/infrastructure/docker/
git add bookly-backend/infrastructure/scripts/docker-entrypoint.sh
git add bookly-backend/infrastructure/docker-compose.microservices.yml
git add bookly-backend/.dockerignore

# Commit con mensaje descriptivo
git commit -m "fix: Resolver permisos de logs en microservicios + fix bcrypt + fix redes

- Agregado docker-entrypoint.sh para ajustar permisos de directorios
- Instalado su-exec en todos los microservicios
- Eliminado --ignore-scripts para compilar bcrypt correctamente
- Removido conflicto de redes en docker-compose.microservices.yml
- Agregado .dockerignore para prevenir copia de node_modules locales"

# Push al repositorio
git push origin main  # o la rama que corresponda
```

### Paso 2: Conectar al Servidor GCP

```bash
# SSH al servidor GCP
gcloud compute ssh bookly-server --zone=your-zone

# O usando SSH directo
ssh user@your-gcp-ip
```

### Paso 3: Actualizar Código en el Servidor

```bash
# Navegar al directorio del proyecto
cd /path/to/bookly-monorepo/bookly-backend/infrastructure

# Pull de los cambios
git pull origin main

# Verificar que docker-entrypoint.sh tenga permisos de ejecución
chmod +x scripts/docker-entrypoint.sh
```

### Paso 4: Detener Servicios Actuales

```bash
# Detener todo el stack
docker compose -f docker-compose.dev.yml down

# O si usas Makefile
make dev-full-stop

# OPCIONAL: Limpiar volúmenes antiguos (¡CUIDADO! Borra datos)
# docker compose -f docker-compose.dev.yml down --volumes
```

### Paso 5: Rebuild de Imágenes

```bash
# Build completo sin cache (asegura compilación correcta de bcrypt)
docker compose -f docker-compose.dev.yml build --no-cache

# O build solo de microservicios
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml build --no-cache

# Verificar imágenes creadas
docker images | grep bookly
```

### Paso 6: Iniciar Servicios

```bash
# Opción 1: Todo junto
make dev-full

# Opción 2: Paso a paso
# 1. Iniciar servicios base (MongoDB, Redis, RabbitMQ)
make dev-start

# 2. Esperar a que estén healthy
docker ps

# 3. Iniciar microservicios
make microservices

# Ver logs en tiempo real
make dev-full-logs
```

### Paso 7: Verificar Deployment

```bash
# Ver estado de contenedores
docker ps

# Verificar que NO se estén reiniciando
watch -n 2 'docker ps --format "table {{.Names}}\t{{.Status}}"'

# Ver logs de un servicio específico
docker logs bookly-api-gateway -f --tail 50
docker logs bookly-resources-service -f --tail 50

# Verificar permisos de logs DENTRO del contenedor
docker exec bookly-api-gateway ls -la /app/logs

# Debería mostrar:
# drwxr-xr-x  bookly  bookly  /app/logs
```

### Paso 8: Health Checks

```bash
# Desde el servidor GCP
curl http://localhost:3000/api/health  # API Gateway
curl http://localhost:3001/api/v1/health  # Auth
curl http://localhost:3002/api/v1/health  # Resources
curl http://localhost:3003/api/v1/health  # Availability
curl http://localhost:3004/api/v1/health  # Stockpile
curl http://localhost:3005/api/v1/health  # Reports

# O desde tu máquina local (si tienes firewall configurado)
curl http://your-gcp-ip:3000/api/health
```

## 🔍 Troubleshooting en GCP

### Si los servicios siguen reiniciándose

```bash
# 1. Ver logs completos del servicio problemático
docker logs bookly-resources-service --tail 200 2>&1 | less

# 2. Buscar errores específicos
docker logs bookly-resources-service 2>&1 | grep -i error
docker logs bookly-resources-service 2>&1 | grep -i "permission denied"

# 3. Verificar que el entrypoint se ejecutó
docker logs bookly-resources-service 2>&1 | grep "Starting Bookly Microservice"

# 4. Ingresar al contenedor para debug
docker exec -it bookly-resources-service sh

# Dentro del contenedor:
ls -la /app/logs
ls -la /app/uploads
whoami  # Debería ser 'bookly'
id      # Debería mostrar uid=1001(bookly) gid=1001(bookly)
```

### Si bcrypt sigue fallando

```bash
# Verificar que bcrypt es binario de Linux
docker exec bookly-resources-service file /app/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node

# Debería decir: "ELF 64-bit LSB shared object"
# NO debería decir: "Mach-O" (eso es macOS)

# Si sigue siendo Mach-O, rebuild forzado:
docker compose -f docker-compose.dev.yml build --no-cache --pull
```

### Si hay problemas de red

```bash
# Ver redes existentes
docker network ls | grep bookly

# Debería haber solo UNA red: bookly_bookly-network
# Si hay múltiples, limpiar:
docker network prune

# Recrear red manualmente si es necesario
docker network create --driver bridge --subnet 172.20.0.0/16 bookly_bookly-network
```

### Si MongoDB no inicia

```bash
# Ver logs de MongoDB
docker logs bookly-mongodb-primary -f

# Verificar permisos de volumen
docker volume inspect bookly_mongodb_primary_data

# Recrear volumen si es necesario (¡BORRA DATOS!)
docker volume rm bookly_mongodb_primary_data
docker compose -f docker-compose.base.yml up -d mongodb-primary
```

## 📊 Monitoreo Post-Deployment

### Logs Centralizados

```bash
# Ver logs de todos los microservicios
docker compose -f docker-compose.dev.yml logs -f --tail=100

# Ver solo un servicio
docker compose -f docker-compose.dev.yml logs -f api-gateway

# Filtrar por nivel de log
docker logs bookly-api-gateway 2>&1 | grep ERROR
docker logs bookly-api-gateway 2>&1 | grep WARN
```

### Métricas de Recursos

```bash
# Ver uso de recursos por contenedor
docker stats

# Ver uso de disco
docker system df

# Limpiar recursos no usados (libera espacio)
docker system prune -a --volumes  # ¡CUIDADO! Borra todo lo no usado
```

### Estado de Servicios

```bash
# Crear script de monitoreo
cat > /tmp/check-bookly.sh << 'EOF'
#!/bin/bash
echo "=== Bookly Services Status ==="
docker ps --filter "name=bookly" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "=== Health Checks ==="
for port in 3000 3001 3002 3003 3004 3005; do
  service=$(curl -s http://localhost:$port/health 2>/dev/null || curl -s http://localhost:$port/api/health 2>/dev/null || echo "ERROR")
  echo "Port $port: $service"
done
EOF

chmod +x /tmp/check-bookly.sh

# Ejecutar check
/tmp/check-bookly.sh

# Agregar a cron para monitoreo continuo (opcional)
# crontab -e
# */5 * * * * /tmp/check-bookly.sh >> /var/log/bookly-health.log
```

## 🔄 Rollback en Caso de Problemas

### Rollback Rápido

```bash
# Detener todo
docker compose -f docker-compose.dev.yml down

# Hacer checkout a commit anterior
git log --oneline -10  # Ver commits recientes
git checkout <commit-hash-anterior>

# Rebuild y reiniciar
docker compose -f docker-compose.dev.yml build
docker compose -f docker-compose.dev.yml up -d
```

### Rollback Parcial (Solo Microservicios)

```bash
# Detener solo microservicios
docker stop bookly-api-gateway bookly-auth-service bookly-resources-service \
           bookly-availability-service bookly-stockpile-service bookly-reports-service

# Revertir cambios
git checkout HEAD~1 -- infrastructure/docker/
git checkout HEAD~1 -- infrastructure/scripts/

# Rebuild solo microservicios
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml build

# Reiniciar
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml up -d
```

## ✅ Checklist de Deployment

Antes de dar por completado el deployment, verificar:

- [ ] `git pull` ejecutado en servidor GCP
- [ ] `docker-entrypoint.sh` tiene permisos de ejecución (`chmod +x`)
- [ ] Build completado sin errores (`docker compose build --no-cache`)
- [ ] Todos los contenedores están `running` (no restarting)
- [ ] Logs NO muestran errores de permisos
- [ ] Logs NO muestran errores de bcrypt
- [ ] Health checks responden correctamente en todos los servicios
- [ ] Verificado que `/app/logs` tiene owner `bookly` dentro de contenedores
- [ ] No hay reinicios infinitos (verificar con `watch docker ps`)
- [ ] MongoDB, Redis, RabbitMQ están healthy
- [ ] Nginx responde correctamente

## 📝 Comandos Útiles

```bash
# Ver todos los servicios de Bookly
docker ps --filter "name=bookly" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"

# Restart de un servicio específico
docker restart bookly-api-gateway

# Ver logs desde el inicio
docker logs bookly-api-gateway --since 2025-10-23T00:00:00

# Ejecutar comando como root en contenedor (debug)
docker exec -u root bookly-api-gateway sh

# Ver variables de entorno de un servicio
docker exec bookly-api-gateway env

# Inspeccionar configuración de un contenedor
docker inspect bookly-api-gateway | less

# Ver tamaño de imágenes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep bookly

# Backup de volúmenes (IMPORTANTE antes de cambios)
docker run --rm -v bookly_mongodb_primary_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb-backup-$(date +%Y%m%d).tar.gz /data
```

## 🎯 Resultado Esperado

Después de un deployment exitoso:

```bash
$ docker ps --filter "name=bookly"

NAMES                         STATUS                    PORTS
bookly-api-gateway            Up 5 minutes (healthy)    0.0.0.0:3000->3000/tcp
bookly-auth-service           Up 5 minutes (healthy)    0.0.0.0:3001->3001/tcp
bookly-resources-service      Up 5 minutes (healthy)    0.0.0.0:3002->3002/tcp
bookly-availability-service   Up 5 minutes (healthy)    0.0.0.0:3003->3003/tcp
bookly-stockpile-service      Up 5 minutes (healthy)    0.0.0.0:3004->3004/tcp
bookly-reports-service        Up 5 minutes (healthy)    0.0.0.0:3005->3005/tcp
bookly-mongodb-primary        Up 1 hour (healthy)       0.0.0.0:27017->27017/tcp
bookly-redis                  Up 1 hour (healthy)       0.0.0.0:6379->6379/tcp
bookly-rabbitmq               Up 1 hour (healthy)       0.0.0.0:5672->5672/tcp
bookly-nginx                  Up 1 hour (healthy)       0.0.0.0:80->80/tcp
```

**✅ Sin reinicios, todos healthy!** 🎉

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa logs: `docker logs <servicio> --tail 100`
2. Verifica el troubleshooting en este documento
3. Comparte logs completos para análisis
4. Considera rollback si es crítico

**Última actualización**: 2025-10-23
