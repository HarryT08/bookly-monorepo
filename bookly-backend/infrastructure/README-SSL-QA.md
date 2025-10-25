# 🔐 SSL para QA - booklyapp.com

Configuración de SSL para el ambiente de QA en booklyapp.com (IP: 35.209.124.62)

## 🎯 Objetivo

Permitir acceso HTTPS a booklyapp.com en el servidor QA con certificados SSL autofirmados.

## 📋 Pre-requisitos

✅ DNS configurado: `booklyapp.com` → `35.209.124.62`  
✅ Firewall GCP: puertos 80 y 443 abiertos  
✅ Microservicios funcionando: `make dev-full`  
✅ API Gateway accesible en red interna

## 🚀 Setup Rápido

### **Paso 1: Generar Certificados SSL**

```bash
cd infrastructure
make dev-ssl-generate
```

Esto genera:

- `nginx/ssl/booklyapp.com.key` - Clave privada
- `nginx/ssl/booklyapp.com.crt` - Certificado autofirmado (válido 365 días)

### **Paso 2: Iniciar Stack Completo**

```bash
make dev-full
```

Este comando inicia:

- ✅ Servicios base (MongoDB, Redis, RabbitMQ)
- ✅ Microservicios (Auth, Resources, Availability, Stockpile, Reports)
- ✅ API Gateway
- ✅ **Nginx con SSL** (puertos 80, 443, 8080)

### **Paso 3: Verificar**

```bash
# Verificar certificados
make dev-ssl-verify

# Probar HTTPS
make dev-ssl-test

# O manualmente:
curl -k https://booklyapp.com/nginx-health
curl -k https://booklyapp.com/api/v1/health
```

## 🌐 URLs de Acceso

### HTTPS (Recomendado)

- **API**: `https://booklyapp.com/api/v1/`
- **Health**: `https://booklyapp.com/health`
- **Docs**: `https://booklyapp.com/api/docs`

### HTTP (Redirige a HTTPS)

- `http://booklyapp.com` → `https://booklyapp.com`

### Management (Solo interno)

- `http://booklyapp.com:8080/management/auth`
- `http://booklyapp.com:8080/management/resources`

## ⚠️ Advertencia de Certificado

Los navegadores mostrarán advertencia de seguridad:

```
⚠️ Su conexión no es privada
NET::ERR_CERT_AUTHORITY_INVALID
```

**Esto es NORMAL en QA** porque son certificados autofirmados.

### Cómo Aceptar el Certificado

#### Chrome/Edge

1. Clic en "Avanzado"
2. Clic en "Ir a booklyapp.com (no seguro)"

#### Firefox

1. Clic en "Avanzado"
2. Clic en "Aceptar el riesgo y continuar"

#### curl (comandos)

Usar flag `-k` o `--insecure`:

```bash
curl -k https://booklyapp.com/api/v1/health
```

## 🔍 Verificación de Funcionamiento

### 1. Nginx está funcionando con SSL

```bash
docker ps | grep bookly-nginx
# Debe mostrar: 0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp, 0.0.0.0:8080->8080/tcp
```

### 2. Certificados están cargados

```bash
docker exec bookly-nginx ls -la /etc/nginx/ssl/
# Debe mostrar: booklyapp.com.crt, booklyapp.com.key
```

### 3. Nginx puede conectar a API Gateway

```bash
docker exec bookly-nginx wget -q -O- http://api-gateway:3000/health
# Debe retornar JSON con status: "ok"
```

### 4. HTTPS funciona externamente

```bash
curl -k -I https://booklyapp.com
# Debe retornar: HTTP/2 301 (redirect a HTTPS) o HTTP/2 200
```

### 5. API Gateway responde

```bash
curl -k -s https://booklyapp.com/api/v1/health | jq '.status'
# Debe retornar: "ok"
```

## 🛠️ Troubleshooting

### Problema: "Connection refused" en puerto 443

**Solución**:

```bash
# Verificar que Nginx esté corriendo
docker ps | grep nginx

# Ver logs de Nginx
docker logs bookly-nginx

# Reiniciar Nginx
docker restart bookly-nginx
```

### Problema: "SSL certificate problem"

**Solución**:

```bash
# Regenerar certificados
make dev-ssl-generate

# Reiniciar Nginx
docker restart bookly-nginx
```

### Problema: Nginx no encuentra api-gateway

**Causa**: Nginx usa `api-gateway:3000` en red Docker interna

**Solución**:

```bash
# Verificar que API Gateway esté en la misma red
docker network inspect infrastructure_bookly-network | grep api-gateway

# Debe aparecer el contenedor bookly-api-gateway
```

### Problema: "502 Bad Gateway"

**Causa**: API Gateway no está funcionando

**Solución**:

```bash
# Verificar health de API Gateway
docker exec bookly-api-gateway wget -q -O- http://localhost:3000/health

# Ver logs
docker logs bookly-api-gateway --tail 100

# Reiniciar API Gateway
docker restart bookly-api-gateway
```

## 📊 Arquitectura

```
Internet
    ↓
DNS: booklyapp.com → 35.209.124.62
    ↓
GCP Firewall (puertos 80, 443)
    ↓
Nginx Container (bookly-nginx)
    ├─ Puerto 80: HTTP → HTTPS redirect
    ├─ Puerto 443: HTTPS + SSL
    └─ Puerto 8080: Management
        ↓
        proxy_pass http://api-gateway:3000
        ↓
API Gateway (red interna)
    ↓
Microservicios (red interna)
```

## 🔐 Seguridad

### Certificados Autofirmados (QA)

- ✅ Válidos por 365 días
- ✅ Incluyen SANs: `booklyapp.com`, `www.booklyapp.com`, `*.booklyapp.com`
- ⚠️ NO validados por CA (Certificate Authority)
- ⚠️ Navegadores muestran advertencia

### Para Producción

Usar **Let's Encrypt** con certbot para certificados válidos:

```bash
# Instalar certbot
docker run -it --rm \
  -v ./nginx/ssl:/etc/letsencrypt \
  certbot/certbot certonly \
  --standalone \
  -d booklyapp.com \
  -d www.booklyapp.com
```

## 📋 Comandos Útiles

```bash
# Generar certificados
make dev-ssl-generate

# Verificar certificados
make dev-ssl-verify

# Probar HTTPS
make dev-ssl-test

# Ver logs de Nginx
docker logs bookly-nginx -f

# Reiniciar Nginx
docker restart bookly-nginx

# Ver configuración de Nginx
docker exec bookly-nginx cat /etc/nginx/conf.d/bookly-qa.conf

# Probar API Gateway directamente
docker exec bookly-nginx wget -q -O- http://api-gateway:3000/health
```

## ✅ Checklist de Configuración

- [ ] DNS apunta a 35.209.124.62: `dig booklyapp.com`
- [ ] Firewall permite 80 y 443
- [ ] Certificados generados: `ls nginx/ssl/`
- [ ] Stack iniciado: `make dev-full`
- [ ] Nginx funcionando: `docker ps | grep nginx`
- [ ] Puerto 443 expuesto: `netstat -tulpn | grep 443`
- [ ] HTTPS responde: `curl -k https://booklyapp.com/nginx-health`
- [ ] API Gateway accesible: `curl -k https://booklyapp.com/api/v1/health`

## 📚 Archivos de Configuración

- `docker-compose.base.yml` - Nginx con puerto 443 y volumen SSL
- `nginx/nginx.conf` - Configuración principal, upstream a `api-gateway:3000`
- `nginx/conf.d/bookly-qa.conf` - Configuración SSL para booklyapp.com
- `scripts/generate-ssl-certificates-qa.sh` - Script para generar certificados
- `Makefile` - Comandos `dev-ssl-*`

---

**Última actualización**: 2025-10-24  
**Ambiente**: QA  
**Dominio**: booklyapp.com  
**IP**: 35.209.124.62
