# 🛡️ Protección contra Ataques de Path Traversal

## 🚨 Qué Son Estos Ataques

Los **ataques de Path Traversal** (también llamados Directory Traversal) son intentos de acceder a archivos y directorios fuera del directorio raíz de la aplicación web mediante secuencias especiales de caracteres.

### Ejemplos de Ataques Detectados

```
❌ /app/public/../../../../../../app/public/index.php
❌ /config/../../../app/index.php
❌ /api/../../../etc/passwd
❌ /uploads/../../../../../../windows/system32/config
```

**Objetivo de los Atacantes**:
1. Acceder a archivos de configuración sensibles
2. Leer contraseñas o claves API
3. Ejecutar archivos maliciosos
4. Obtener información del sistema

## 🔍 Por Qué Ves Estos Errores en los Logs

### ❌ NO son errores de tu aplicación

Estos son **intentos de ataque automatizados** de bots que escanean internet buscando:
- Aplicaciones PHP vulnerables (tu app es Node.js)
- Paneles de administración expuestos
- Archivos de configuración accesibles
- Exploits conocidos

### ✅ Tu aplicación está rechazándolos correctamente

Los bots intentan rutas como:
```
/app/public/.../.../.../index.php
/config/.../admin.php
/api/.../etc/passwd
```

Pero tu aplicación **no tiene** estos archivos porque:
- ❌ No usas PHP (usas Node.js/NestJS)
- ❌ Las rutas no existen en tu API
- ❌ NestJS maneja las rutas correctamente

## 🛡️ Protección Implementada

### 1. PathTraversalGuardMiddleware

**Archivo**: `src/apps/api-gateway/infrastructure/middleware/path-traversal-guard.middleware.ts`

Este middleware detecta y bloquea automáticamente:

✅ **Patrones Bloqueados**:
```typescript
../                          // Path traversal clásico
%2e%2e                      // URL encoded ../
%252e%252e                  // Double URL encoded
..%2f                       // Mixed encoding
..%5c                       // Backslash variant
%c0%ae%c0%ae                // UTF-8 overlong encoding
.php, .aspx, .jsp, .cgi     // Archivos de otros lenguajes
/etc/passwd                 // Archivos del sistema Unix
/windows/system32           // Archivos del sistema Windows
/proc/self                  // Linux proc filesystem
```

### 2. Respuesta al Ataque

Cuando se detecta un intento:
```json
HTTP/1.1 400 Bad Request
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Invalid path format"
}
```

**Log generado**:
```
🚨 Path Traversal attempt blocked: GET /app/../../../etc/passwd
{
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "url": "/app/../../../etc/passwd",
  "path": "/app/../../../etc/passwd"
}
```

### 3. Orden de Ejecución

```
Request → PathTraversalGuardMiddleware → GatewayMiddleware → Routes
          ↓ (bloquea si sospechoso)
          400 Bad Request
```

El middleware de path traversal se ejecuta **PRIMERO** para bloquear ataques antes de procesamiento adicional.

## 🔧 Configuración Adicional Recomendada

### 1. Rate Limiting por IP

Agregar en `gateway.config.ts`:

```typescript
rateLimit: {
  pathTraversalAttempts: {
    max: 5,              // Máximo 5 intentos
    windowMs: 60000,     // En 1 minuto
    blockDuration: 3600000  // Bloquear por 1 hora
  }
}
```

### 2. Firewall en GCP/Cloud

**Google Cloud Armor** (si usas GCP):
```bash
# Crear regla para bloquear path traversal
gcloud compute security-policies rules create 1000 \
    --security-policy=bookly-policy \
    --expression="request.path.matches('.*\\.\\..*')" \
    --action=deny-403 \
    --description="Block path traversal attempts"
```

**AWS WAF** (si usas AWS):
```json
{
  "Name": "BlockPathTraversal",
  "Priority": 1,
  "Statement": {
    "ByteMatchStatement": {
      "SearchString": "..",
      "FieldToMatch": {
        "UriPath": {}
      }
    }
  },
  "Action": {
    "Block": {}
  }
}
```

### 3. Nginx/Reverse Proxy

Si usas Nginx como proxy reverso:

```nginx
# /etc/nginx/conf.d/security.conf
location ~ \.\. {
    deny all;
    return 400 "Bad Request";
}

location ~ \.(php|aspx|jsp|cgi)$ {
    deny all;
    return 404;
}
```

### 4. Logging y Alertas

Configurar alertas para múltiples intentos:

```typescript
// En monitoring.service.ts
if (pathTraversalAttempts > 10) {
  await this.alerting.send({
    severity: 'HIGH',
    title: 'Multiple Path Traversal Attempts Detected',
    ip: attackerIp,
    count: pathTraversalAttempts,
    timeWindow: '5 minutes'
  });
}
```

## 📊 Monitoreo y Análisis

### Ver Intentos de Ataque en Logs

```bash
# Filtrar intentos de path traversal en logs
docker logs bookly-api-gateway 2>&1 | grep "Path Traversal attempt blocked"

# Contar intentos por IP
docker logs bookly-api-gateway 2>&1 | \
  grep "Path Traversal" | \
  grep -oP 'ip":\s*"\K[^"]+' | \
  sort | uniq -c | sort -rn

# Ver últimos 20 intentos
docker logs bookly-api-gateway --tail 1000 2>&1 | \
  grep "Path Traversal" | tail -20
```

### Ejemplo de Output

```
🚨 Path Traversal attempt blocked: GET /app/../../../etc/passwd
  ip: 192.168.1.100
  userAgent: python-requests/2.28.0

🚨 Path Traversal attempt blocked: GET /config/.../admin.php
  ip: 192.168.1.100
  userAgent: python-requests/2.28.0

🚨 Path Traversal attempt blocked: GET /api/../../index.php
  ip: 203.0.113.45
  userAgent: Mozilla/5.0 (compatible; scanner)
```

### Estadísticas

```bash
# IPs más activas en intentos de ataque
docker logs bookly-api-gateway 2>&1 | \
  grep "Path Traversal" | \
  grep -oP 'ip":\s*"\K[^"]+' | \
  sort | uniq -c | sort -rn | head -10

# Output:
# 145 192.168.1.100
#  89 203.0.113.45
#  67 198.51.100.23
#  45 192.0.2.78
```

## 🚀 Aplicar Protección en Producción

### Desplegar el Middleware

```bash
cd /path/to/bookly-monorepo/bookly-backend

# Pull de cambios
git pull origin main

# Rebuild API Gateway
cd infrastructure
docker compose -f docker-compose.microservices.yml build api-gateway

# Reiniciar API Gateway
docker compose -p bookly -f docker-compose.microservices.yml restart api-gateway

# Verificar logs
docker logs bookly-api-gateway --tail 50
```

### Verificación

```bash
# Test 1: Request normal (debe pasar)
curl -s http://localhost:3000/api/v1/health

# Output esperado:
# { "status": "ok", ... }

# Test 2: Path traversal (debe bloquear)
curl -s http://localhost:3000/api/../../../etc/passwd

# Output esperado:
# {
#   "statusCode": 400,
#   "message": "Bad Request",
#   "error": "Invalid path format"
# }

# Test 3: Archivo PHP (debe bloquear)
curl -s http://localhost:3000/api/index.php

# Output esperado:
# {
#   "statusCode": 400,
#   "message": "Bad Request",
#   "error": "Invalid path format"
# }
```

## 🎯 Mejores Prácticas

### ✅ DO (Hacer)

1. **Mantener el middleware activo** - Protege contra ataques 24/7
2. **Monitorear logs regularmente** - Detecta patrones de ataque
3. **Actualizar patrones** - Agregar nuevos patrones según amenazas
4. **Rate limiting** - Limitar requests por IP
5. **Alertas automáticas** - Notificar múltiples intentos
6. **Firewall en Cloud** - Doble capa de protección

### ❌ DON'T (No hacer)

1. **No ignorar los logs** - Pueden indicar ataques coordinados
2. **No exponer información sensible** - En mensajes de error
3. **No confiar solo en middleware** - Usar múltiples capas
4. **No permitir todos los caracteres** - Sanitizar inputs
5. **No loggear datos sensibles** - En los warnings de ataque

## 📋 Checklist de Seguridad

- [x] PathTraversalGuardMiddleware instalado
- [x] Middleware configurado en API Gateway
- [x] Logs de intentos de ataque habilitados
- [ ] Rate limiting configurado para path traversal
- [ ] Alertas automáticas para múltiples intentos
- [ ] Firewall en Cloud (GCP Armor / AWS WAF)
- [ ] Reverse proxy rules (Nginx/Apache)
- [ ] Monitoreo regular de logs
- [ ] Plan de respuesta a incidentes
- [ ] Documentación para el equipo

## 🆘 Qué Hacer Si Hay un Ataque Masivo

### 1. Identificar la IP/IPs Atacantes

```bash
# Listar IPs con más de 50 intentos
docker logs bookly-api-gateway 2>&1 | \
  grep "Path Traversal" | \
  grep -oP 'ip":\s*"\K[^"]+' | \
  sort | uniq -c | \
  awk '$1 > 50 {print $2}'
```

### 2. Bloquear Temporalmente

```bash
# Bloquear IP en iptables (Linux)
sudo iptables -A INPUT -s 192.168.1.100 -j DROP

# Bloquear IP en GCP
gcloud compute firewall-rules create block-attacker \
    --action=DENY \
    --rules=all \
    --source-ranges=192.168.1.100/32
```

### 3. Revisar Logs Completos

```bash
# Ver todos los intentos de una IP específica
docker logs bookly-api-gateway 2>&1 | grep "192.168.1.100"

# Buscar patrones de ataque
docker logs bookly-api-gateway 2>&1 | \
  grep "Path Traversal" | \
  grep -oP 'url":\s*"\K[^"]+' | \
  sort | uniq -c | sort -rn
```

### 4. Verificar Integridad del Sistema

```bash
# Verificar que no hay archivos sospechosos
find /app -type f -mtime -1 -ls

# Verificar procesos activos
docker exec bookly-api-gateway ps aux

# Verificar conexiones de red
docker exec bookly-api-gateway netstat -tulpn
```

## 📚 Referencias

- [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [CWE-22: Path Traversal](https://cwe.mitre.org/data/definitions/22.html)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/helmet)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Última actualización**: 2025-10-24  
**Estado**: ✅ Protección Activa  
**Nivel de Amenaza**: 🟡 BAJO (intentos bloqueados exitosamente)
