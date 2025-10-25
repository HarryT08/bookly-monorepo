# 🚀 Deploy Bookly Backend en GCP - Producción

Guía completa para desplegar Bookly Backend en Google Cloud Platform con arquitectura de microservicios y Nginx como reverse proxy.

## 🏗️ Arquitectura

```
Internet (bookly.com)
    ↓
GCP Firewall (35.209.124.62:80/443)
    ↓
Nginx Container (bookly-nginx)
    ├─ Puerto 80: HTTP → HTTPS redirect
    └─ Puerto 443: HTTPS → API Gateway
        ↓
API Gateway (api-gateway:3000) - Red interna
    ↓
Microservicios (red bookly-network)
    ├─ auth-service:3001        ❌ NO accesible desde internet
    ├─ resources-service:3002    ❌ NO accesible desde internet
    ├─ availability-service:3003 ❌ NO accesible desde internet
    ├─ stockpile-service:3004    ❌ NO accesible desde internet
    └─ reports-service:3005      ❌ NO accesible desde internet
```

## 🎯 Características de Seguridad

✅ **TODO el tráfico pasa por Nginx → API Gateway**  
✅ **Microservicios NO exponen puertos al host**  
✅ **Solo puertos 80 y 443 expuestos a internet**  
✅ **Certificados SSL automáticos con Let's Encrypt**  
✅ **Rate limiting configurado en Nginx**  
✅ **Headers de seguridad (HSTS, CSP, XSS Protection)**  
✅ **Path Traversal protection en API Gateway**

## 📋 Pre-requisitos

### 1. Instancia GCP Configurada

```bash
# Instancia
Nombre: qa-bookly
Zona: us-central1-f
IP Externa: 35.209.124.62
```

### 2. Firewall Rules en GCP

```bash
# Permitir HTTP (puerto 80)
gcloud compute firewall-rules create bookly-allow-http \
    --network=default \
    --action=ALLOW \
    --rules=tcp:80 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=bookly-server

# Permitir HTTPS (puerto 443)
gcloud compute firewall-rules create bookly-allow-https \
    --network=default \
    --action=ALLOW \
    --rules=tcp:443 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=bookly-server

# Verificar reglas
gcloud compute firewall-rules list | grep bookly
```

### 3. DNS Configurado en Cloud DNS

**Zona**: `booklyapp-com`

**Registros A**:
```
bookly.com.        A  300  35.209.124.62
www.bookly.com.    A  300  35.209.124.62
```

**Verificar DNS**:
```bash
dig bookly.com +short
# Debe retornar: 35.209.124.62
```

### 4. Software Instalado en GCP Instance

```bash
# Conectarse a la instancia
gcloud compute ssh qa-bookly --zone=us-central1-f

# Instalar Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación
docker --version
docker-compose --version
```

## 🚀 Proceso de Deploy

### **Opción 1: Deploy Automático (Recomendado)**

```bash
# En la instancia GCP, clonar el repositorio
cd /home/$USER
git clone https://github.com/HenderOrlando/bookly-monorepo.git
cd bookly-monorepo/bookly-backend/infrastructure

# Ejecutar deploy completo
make prod-deploy
```

Este comando:
1. ✅ Verifica DNS
2. ✅ Detiene servicios existentes
3. ✅ Inicia servicios base (MongoDB, Redis, RabbitMQ)
4. ✅ Inicia microservicios (sin exponer puertos)
5. ✅ Inicia Nginx reverse proxy
6. ✅ Configura certificados SSL con Let's Encrypt
7. ✅ Verifica health de todos los servicios

### **Opción 2: Deploy Manual Paso a Paso**

#### Paso 1: Clonar Repositorio

```bash
cd /home/$USER
git clone https://github.com/HenderOrlando/bookly-monorepo.git
cd bookly-monorepo/bookly-backend/infrastructure
```

#### Paso 2: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables
nano .env

# Variables críticas:
# - NODE_ENV=production
# - DATABASE_URL=mongodb://...
# - REDIS_PASSWORD=...
# - JWT_SECRET=...
```

#### Paso 3: Iniciar Servicios Base

```bash
# MongoDB, Redis, RabbitMQ
docker compose -p bookly -f docker-compose.base.yml up -d

# Esperar 60 segundos
sleep 60

# Verificar que estén funcionando
docker ps | grep bookly
```

#### Paso 4: Iniciar Microservicios (SIN exponer puertos)

```bash
# Usar docker-compose.production.yml para NO exponer puertos
docker compose -p bookly \
    -f docker-compose.microservices.yml \
    -f docker-compose.production.yml \
    up -d

# Esperar 45 segundos
sleep 45
```

#### Paso 5: Verificar Health de Microservicios

```bash
# API Gateway (internamente)
docker exec bookly-api-gateway wget -q -O- http://localhost:3000/health

# Availability Service (corregir memoria)
docker logs bookly-availability-service --tail 50
# Debe mostrar: ✅ memory_heap: up, ✅ memory_rss: up
```

#### Paso 6: Iniciar Nginx

```bash
make prod-nginx-start

# O manualmente:
docker compose -p bookly -f docker-compose.nginx.yml up -d nginx
```

#### Paso 7: Setup SSL Certificates

```bash
make prod-setup-ssl

# O manualmente:
chmod +x scripts/setup-ssl-certificates.sh
./scripts/setup-ssl-certificates.sh
```

## 🔐 Certificados SSL

### Obtener Certificados (Primera Vez)

```bash
make prod-setup-ssl
```

### Renovación Automática

Los certificados se renuevan automáticamente cada 12 horas con el contenedor `certbot`.

### Renovación Manual

```bash
docker compose -p bookly -f docker-compose.nginx.yml run --rm certbot renew
docker compose -p bookly -f docker-compose.nginx.yml restart nginx
```

### Verificar Certificados

```bash
# SSL Labs
https://www.ssllabs.com/ssltest/analyze.html?d=bookly.com

# OpenSSL
openssl s_client -connect bookly.com:443 -servername bookly.com < /dev/null

# Fecha de expiración
echo | openssl s_client -connect bookly.com:443 -servername bookly.com 2>/dev/null | openssl x509 -noout -dates
```

## 🔍 Verificación Post-Deploy

### 1. Estado de Containers

```bash
make prod-status

# O manualmente:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep bookly
```

**Resultado esperado**:
```
bookly-nginx               Up 5 minutes   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
bookly-api-gateway         Up 5 minutes   (NO debe tener puertos externos)
bookly-auth-service        Up 5 minutes   (NO debe tener puertos externos)
bookly-resources-service   Up 5 minutes   (NO debe tener puertos externos)
bookly-availability-service Up 5 minutes  (NO debe tener puertos externos)
...
```

### 2. Health Checks

```bash
# Nginx health
curl -I http://bookly.com/nginx-health

# API Gateway health (a través de Nginx)
curl -s https://bookly.com/health | jq '.'

# Health agregado de todos los servicios
curl -s https://bookly.com/api/v1/health/aggregated | jq '.services'
```

### 3. Test de Endpoints

```bash
# API Docs
curl -I https://bookly.com/api/docs

# Auth endpoints
curl -I https://bookly.com/api/v1/auth/login

# Resources endpoints
curl -I https://bookly.com/api/v1/resources

# Availability endpoints
curl -I https://bookly.com/api/v1/availability
```

### 4. Verificar que Microservicios NO sean Accesibles

```bash
# Estos NO deben funcionar (debe dar timeout o connection refused)
curl --max-time 5 http://35.209.124.62:3001/health    # ❌ auth
curl --max-time 5 http://35.209.124.62:3002/health    # ❌ resources
curl --max-time 5 http://35.209.124.62:3003/health    # ❌ availability
curl --max-time 5 http://35.209.124.62:3004/health    # ❌ stockpile
curl --max-time 5 http://35.209.124.62:3005/health    # ❌ reports

# Solo debe funcionar:
curl --max-time 5 http://35.209.124.62:80/nginx-health  # ✅ Nginx
curl -I https://bookly.com                               # ✅ HTTPS
```

## 📊 Monitoreo

### Ver Logs en Tiempo Real

```bash
# Nginx
make prod-nginx-logs

# API Gateway
docker logs bookly-api-gateway -f

# Availability Service
docker logs bookly-availability-service -f

# Todos los servicios
docker-compose -p bookly -f docker-compose.microservices.yml logs -f
```

### Métricas de Recursos

```bash
# Uso de recursos
docker stats --no-stream

# Uso de disco
df -h

# Memoria disponible
free -h
```

### Alertas y Problemas Comunes

#### Problema: Availability Service con memory errors

**Síntoma**:
```
❌ memory_heap: down - "Used heap exceeded the set threshold"
```

**Solución**:
Ya corregido en `docker-compose.microservices.yml`:
- `MEMORY_HEAP_THRESHOLD_MB=768`
- `MEMORY_RSS_THRESHOLD_MB=1024`
- `deploy.resources.limits.memory=1G`

#### Problema: Certificados SSL no se obtienen

**Síntomas**:
```
❌ Error al obtener certificado SSL
```

**Causas posibles**:
1. DNS no apunta a la IP correcta
2. Puerto 80 bloqueado en firewall
3. Nginx no está funcionando

**Solución**:
```bash
# 1. Verificar DNS
dig bookly.com +short
# Debe retornar: 35.209.124.62

# 2. Verificar firewall
gcloud compute firewall-rules list | grep allow-http

# 3. Verificar Nginx
docker logs bookly-nginx
curl http://$(hostname -I | awk '{print $1}'):80/nginx-health
```

#### Problema: API Gateway no conecta a microservicios

**Síntoma**:
```
ECONNREFUSED api-gateway: 172.20.0.11:3003
```

**Solución**:
1. Verificar que fix de puertos esté aplicado
2. Rebuild microservicios:

```bash
cd infrastructure
make dev-fix-service-ports
```

## 🔧 Comandos Útiles

```bash
# Deploy completo
make prod-deploy

# Setup SSL
make prod-setup-ssl

# Ver estado
make prod-status

# Ver health
make prod-health

# Logs de Nginx
make prod-nginx-logs

# Reiniciar Nginx
make prod-nginx-stop && make prod-nginx-start

# Reiniciar todo
docker compose -p bookly -f docker-compose.nginx.yml restart
docker compose -p bookly -f docker-compose.microservices.yml restart

# Ver uso de recursos
docker stats --no-stream

# Limpiar containers no usados
docker system prune -f
```

## 📚 Documentación Adicional

- [FIX: Conflicto de Puertos](./FIX_SERVICE_PORTS_CONFLICT.md)
- [Seguridad: Path Traversal](./SECURITY_PATH_TRAVERSAL_ATTACKS.md)
- [Arquitectura de Microservicios](./ARCHITECTURE.md)

## 🆘 Soporte

Si encuentras problemas:

1. Verificar logs: `docker logs bookly-nginx` y `docker logs bookly-api-gateway`
2. Verificar health: `make prod-health`
3. Verificar DNS: `dig bookly.com`
4. Verificar firewall: `gcloud compute firewall-rules list`

---

**Última actualización**: 2025-10-24  
**Versión**: 1.0.0  
**Estado**: ✅ Producción Ready
