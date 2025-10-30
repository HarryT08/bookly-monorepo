# Fix MongoDB Keyfile en Servidor

## Problemas Identificados

### Problema 1: MongoDB Keyfile

MongoDB no inicia correctamente debido a errores con el keyfile del replica set:

- ❌ `Unable to acquire security keyfile lock`
- ❌ `Invalid keyfile format`
- ❌ `Permission denied` al leer keyfile

### Problema 2: Nginx en Linux

Nginx no puede resolver hosts para microservicios:

- ❌ `host not found in upstream "host.docker.internal:3000"`

## Causas

### MongoDB:

1. **Keyfile con formato incorrecto**: El archivo tiene múltiples líneas cuando debe ser una sola línea
2. **Permisos incorrectos**: MongoDB requiere permisos exactos (400 o 600)
3. **Propietario incorrecto**: El usuario del contenedor no puede acceder al archivo montado desde el host
4. **Montaje con permisos restrictivos**: El volumen readonly no permite que el usuario mongodb lea el archivo

### Nginx:

1. **host.docker.internal no existe en Linux**: Este hostname especial solo funciona en Docker Desktop (Mac/Windows)
2. **No configurado extra_hosts**: Linux/GCP necesita mapear explícitamente el hostname al gateway del host

## Solución Implementada

### 1. Script de Regeneración Automática

Se creó `/infrastructure/scripts/fix-mongodb-keyfile.sh` que:

- ✅ Genera keyfile en formato correcto (una sola línea, 1024 caracteres base64)
- ✅ Configura permisos correctos (400)
- ✅ Valida formato y longitud
- ✅ Crea backup del keyfile anterior

### 2. Docker Compose Actualizado

Los tres nodos de MongoDB ahora:

- ✅ **Ejecutan como root inicialmente** para poder modificar permisos del keyfile
- ✅ **Copian el keyfile** desde `/host-keyfile` (montaje readonly del host) a `/opt/keyfile` (directorio interno)
- ✅ **Configuran permisos 400** y **owner mongodb:mongodb** al keyfile copiado
- ✅ **Ejecutan mongod** a través de `docker-entrypoint.sh` que maneja correctamente la inicialización y cambio de usuario
- ✅ Mayor tiempo de `start_period` (40s) para inicialización completa

### 3. Script de Inicialización Mejorado

`bookly-docker.sh` ahora:

- ✅ Detecta automáticamente keyfiles con formato incorrecto
- ✅ Regenera el keyfile si es necesario
- ✅ Verifica permisos antes de iniciar servicios

### 4. Nginx Configurado para Linux

`docker-compose.base.yml` para nginx ahora incluye:

- ✅ **extra_hosts** con mapeo `host.docker.internal:host-gateway`
- ✅ **Health check corregido** que no falla si los microservicios no están corriendo
- ✅ **Reinicio automático** de nginx en el script quick-fix-mongodb.sh

## Pasos para Aplicar

### Opción A: Aplicar Fix Completo (Recomendado)

```bash
# 1. Conectarse al servidor
ssh usuario@servidor

# 2. Navegar al directorio de infraestructura
cd /ruta/a/bookly-monorepo/bookly-backend/infrastructure

# 3. Pull de los cambios más recientes
git pull origin main

# 4. Detener MongoDB si está corriendo
make dev-stop
# O
docker compose -f docker-compose.base.yml down

# 5. Regenerar keyfile con formato correcto
chmod +x scripts/fix-mongodb-keyfile.sh
./scripts/fix-mongodb-keyfile.sh

# 6. Verificar que el keyfile sea correcto
echo "Líneas en keyfile (debe ser 0):"
wc -l mongodb/keyfile/mongodb-keyfile
echo "Permisos (debe ser 400):"
ls -la mongodb/keyfile/mongodb-keyfile

# 7. Limpiar volúmenes antiguos de keyfile (opcional pero recomendado)
docker volume rm infrastructure_mongodb_keyfile 2>/dev/null || true
docker volume rm infrastructure_mongodb_keyfile_secondary1 2>/dev/null || true
docker volume rm infrastructure_mongodb_keyfile_secondary2 2>/dev/null || true

# 8. Iniciar servicios
make dev-start
# O
make base

# 9. Verificar logs de MongoDB
docker logs bookly-mongodb-primary -f
```

### Opción B: Fix Rápido Manual

Si no puedes hacer pull de los cambios:

```bash
# 1. Detener MongoDB
cd /ruta/a/bookly-monorepo/bookly-backend/infrastructure
docker compose -f docker-compose.base.yml down

# 2. Regenerar keyfile manualmente
openssl rand -base64 756 | tr -d '\n' > mongodb/keyfile/mongodb-keyfile

# 3. Configurar permisos
chmod 400 mongodb/keyfile/mongodb-keyfile

# 4. Verificar
wc -l mongodb/keyfile/mongodb-keyfile  # Debe ser 0 (sin saltos de línea)
wc -c mongodb/keyfile/mongodb-keyfile  # Entre 6 y 1024 caracteres

# 5. Iniciar MongoDB
docker compose -f docker-compose.base.yml up -d

# 6. Verificar logs
docker logs bookly-mongodb-primary -f
```

## Verificación

Después de aplicar el fix, verifica que MongoDB inicie correctamente:

```bash
# Ver estado de los contenedores
docker ps | grep mongodb

# Ver logs sin errores de keyfile
docker logs bookly-mongodb-primary 2>&1 | grep -i "keyfile"

# Verificar replica set
docker exec bookly-mongodb-primary mongosh \
  --username bookly \
  --password bookly123 \
  --authenticationDatabase admin \
  --eval "rs.status()"

# Debe mostrar:
# - 1 nodo PRIMARY
# - 2 nodos SECONDARY
# - Sin errores de keyfile

# Verificar nginx sin errores de host
docker logs bookly-nginx 2>&1 | grep "host not found"
# NO debe mostrar nada (sin errores)
```

## Resultado Esperado

### MongoDB

✅ MongoDB inicia sin errores de keyfile  
✅ Los 3 nodos del replica set están saludables (1 PRIMARY + 2 SECONDARY)  
✅ Conexión exitosa desde aplicaciones  
✅ Logs sin mensajes de error relacionados con keyfile

### Nginx

✅ Nginx inicia sin errores de "host not found"  
✅ Puede resolver `host.docker.internal` correctamente en Linux/GCP  
✅ Health check pasa correctamente  
✅ Listo para hacer proxy a microservicios cuando se inicien

## Troubleshooting

### Si MongoDB aún no inicia:

```bash
# 1. Verificar que el keyfile no tenga saltos de línea
cat -A mongodb/keyfile/mongodb-keyfile | head -5
# No debe mostrar símbolos $, solo caracteres base64

# 2. Verificar permisos exactos
stat mongodb/keyfile/mongodb-keyfile
# Debe ser -r-------- (400)

# 3. Limpiar completamente y reiniciar
make dev-stop
docker volume prune -f
./scripts/fix-mongodb-keyfile.sh
make dev-start
```

### Si persisten errores:

```bash
# Ver logs detallados
docker logs bookly-mongodb-primary --tail 100

# Verificar comando de inicio
docker inspect bookly-mongodb-primary | grep -A 20 "Cmd"

# Entrar al contenedor para debugging
docker exec -it bookly-mongodb-primary bash
ls -la /opt/keyfile/
cat /opt/keyfile/mongodb-keyfile | wc -c
```

## Notas Adicionales

- **Keyfile compartido**: Los 3 nodos del replica set DEBEN usar el MISMO keyfile
- **Formato crítico**: DEBE ser una sola línea sin saltos de línea (`\n`)
- **Permisos estrictos**: MongoDB rechaza keyfiles con permisos 644 o más permisivos
- **Base64 puro**: Solo caracteres base64 válidos (A-Z, a-z, 0-9, +, /, =)

## Archivos Modificados

```
infrastructure/
├── scripts/
│   ├── bookly-docker.sh          # Verifica y regenera keyfile automáticamente
│   └── fix-mongodb-keyfile.sh    # Script dedicado para fix de keyfile
├── docker-compose.base.yml       # Configuración mejorada de MongoDB
└── docs/
    └── FIX_MONGODB.md        # Esta guía
```

## Cambios Técnicos Implementados

### Configuración Anterior (❌ Con problemas)

```yaml
mongodb-primary:
  user: mongodb # Problema: no puede copiar archivos con permisos
  command: ["bash", "-c", "cp /tmp/keyfile/mongodb-keyfile ..."]
  volumes:
    - ./mongodb/keyfile/mongodb-keyfile:/tmp/keyfile/mongodb-keyfile:ro
```

**Problema**: El usuario `mongodb` no puede leer archivos montados readonly desde el host.

### Configuración Nueva (✅ Funcional)

```yaml
mongodb-primary:
  entrypoint: ["/bin/bash", "-c"] # Ejecuta como root
  command:
    - |
      set -e
      mkdir -p /opt/keyfile
      # Copia desde montaje readonly del host
      cp /host-keyfile/mongodb-keyfile /opt/keyfile/mongodb-keyfile
      # Configura permisos correctos
      chmod 400 /opt/keyfile/mongodb-keyfile
      chown mongodb:mongodb /opt/keyfile/mongodb-keyfile
      # Ejecuta mongod con docker-entrypoint.sh (cambia a usuario mongodb)
      exec docker-entrypoint.sh mongod --keyFile /opt/keyfile/mongodb-keyfile ...
  volumes:
    - ./mongodb/keyfile:/host-keyfile:ro # Directorio completo montado
```

**Solución**:

1. Ejecuta como root para tener permisos de copia y chown
2. Copia el keyfile a directorio interno del contenedor
3. Configura permisos 400 y owner mongodb:mongodb
4. Usa `exec docker-entrypoint.sh` que maneja el cambio de usuario correctamente

## Comandos Útiles

```bash
# Regenerar keyfile y reiniciar
make dev-fix-mongo

# Ver estado de servicios
make status

# Ver logs de MongoDB
make logs s=mongodb-primary

# Reiniciar solo MongoDB
docker compose -f docker-compose.base.yml restart mongodb-primary mongodb-secondary1 mongodb-secondary2

# Health check
make health

# Ver keyfile dentro del contenedor
docker exec bookly-mongodb-primary ls -la /opt/keyfile/
docker exec bookly-mongodb-primary cat /opt/keyfile/mongodb-keyfile | wc -c
```
