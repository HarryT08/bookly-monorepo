# 🔐 GCP Load Balancer con SSL para booklyapp.com

Configuración de Load Balancer de GCP con certificado SSL administrado para booklyapp.com.

## 🏗️ Arquitectura

```
Internet
    ↓
booklyapp.com (DNS)
    ↓
GCP Cloud Load Balancer (HTTPS - puerto 443)
    ├─ SSL/TLS Termination (certificado administrado por Google)
    └─ Backend: Instance Group
        ↓
        HTTP (puerto 80) → Instancia GCP
            ↓
            Docker Container: Nginx
                ↓
                API Gateway (puerto 3000)
                    ↓
                    Microservicios
```

## 🎯 Ventajas de esta Arquitectura

✅ **Google maneja SSL**: Certificados automáticos y renovación  
✅ **Alta disponibilidad**: Load Balancer distribuye tráfico  
✅ **Escalabilidad**: Auto-scaling de instancias  
✅ **Health checks**: Monitoreo automático  
✅ **CDN integrado**: Cache global opcional  
✅ **DDoS protection**: Protección de Google Cloud Armor

## 📋 Configuración del Load Balancer

### **1. Crear Certificado SSL Administrado**

```bash
# Crear certificado SSL administrado por Google
gcloud compute ssl-certificates create booklyapp-ssl-cert \
    --domains=booklyapp.com,www.booklyapp.com \
    --global

# Verificar estado (puede tardar 15-60 minutos en aprovisionar)
gcloud compute ssl-certificates describe booklyapp-ssl-cert --global
```

### **2. Crear Health Check**

```bash
# Health check para verificar que Nginx esté funcionando
gcloud compute health-checks create http bookly-health-check \
    --port=80 \
    --request-path=/health \
    --check-interval=10s \
    --timeout=5s \
    --unhealthy-threshold=3 \
    --healthy-threshold=2
```

### **3. Crear Backend Service**

```bash
# Crear backend service
gcloud compute backend-services create bookly-backend-service \
    --protocol=HTTP \
    --health-checks=bookly-health-check \
    --global \
    --port-name=http \
    --timeout=30s \
    --connection-draining-timeout=300s

# Agregar instance group al backend
gcloud compute backend-services add-backend bookly-backend-service \
    --instance-group=bookly-instance-group \
    --instance-group-zone=us-central1-f \
    --balancing-mode=UTILIZATION \
    --max-utilization=0.8 \
    --global
```

### **4. Crear URL Map**

```bash
# URL map para routing
gcloud compute url-maps create bookly-lb \
    --default-service=bookly-backend-service
```

### **5. Crear HTTPS Target Proxy**

```bash
# Target proxy con certificado SSL
gcloud compute target-https-proxies create bookly-https-proxy \
    --url-map=bookly-lb \
    --ssl-certificates=booklyapp-ssl-cert
```

### **6. Crear HTTP Target Proxy (redirect a HTTPS)**

```bash
# Crear URL map para redirect
gcloud compute url-maps create bookly-http-redirect \
    --default-url-redirect-response-code=301 \
    --default-url-redirect-https-redirect

# Target proxy HTTP para redirect
gcloud compute target-http-proxies create bookly-http-proxy \
    --url-map=bookly-http-redirect
```

### **7. Crear Forwarding Rules**

```bash
# Reservar IP estática global
gcloud compute addresses create bookly-lb-ip --global

# Obtener la IP
gcloud compute addresses describe bookly-lb-ip --global

# Forwarding rule HTTPS (puerto 443)
gcloud compute forwarding-rules create bookly-https-rule \
    --address=bookly-lb-ip \
    --global \
    --target-https-proxy=bookly-https-proxy \
    --ports=443

# Forwarding rule HTTP (puerto 80 - redirect)
gcloud compute forwarding-rules create bookly-http-rule \
    --address=bookly-lb-ip \
    --global \
    --target-http-proxy=bookly-http-proxy \
    --ports=80
```

## 🌐 Configuración DNS

```bash
# Obtener IP del Load Balancer
LB_IP=$(gcloud compute addresses describe bookly-lb-ip --global --format="get(address)")
echo "IP del Load Balancer: $LB_IP"

# Actualizar DNS en Cloud DNS
gcloud dns record-sets transaction start --zone=booklyapp-com

# Eliminar registro A anterior (si existe)
gcloud dns record-sets transaction remove 35.209.124.62 \
    --name=booklyapp.com. \
    --ttl=300 \
    --type=A \
    --zone=booklyapp-com

# Agregar nuevo registro A con IP del LB
gcloud dns record-sets transaction add $LB_IP \
    --name=booklyapp.com. \
    --ttl=300 \
    --type=A \
    --zone=booklyapp-com

# Ejecutar transacción
gcloud dns record-sets transaction execute --zone=booklyapp-com
```

## 🔧 Configuración de Nginx en Instancia

### **1. Deshabilitar configuraciones SSL locales**

En el servidor GCP:

```bash
cd ~/bookly-monorepo/bookly-backend/infrastructure

# Deshabilitar configuración con SSL local
mv nginx/conf.d/bookly-qa.conf.disabled nginx/conf.d/bookly-qa.conf.backup 2>/dev/null || true
mv nginx/conf.d/bookly-qa-no-ssl.conf nginx/conf.d/bookly-qa-no-ssl.conf.disabled 2>/dev/null || true

# Habilitar configuración para Load Balancer
# (Ya está en bookly-loadbalancer.conf)

# Pull de cambios
git pull origin main

# Reiniciar Nginx
docker restart bookly-nginx
```

### **2. Verificar Nginx**

```bash
# Nginx debe escuchar SOLO puerto 80
docker exec bookly-nginx nginx -t

# Verificar puertos
docker ps | grep nginx
# Debe mostrar: 0.0.0.0:80->80/tcp

# Test health check
curl http://localhost/health
# Debe retornar: healthy

# Test desde Load Balancer (usar IP del LB)
curl http://$LB_IP/health -H "Host: booklyapp.com"
```

## 🏥 Health Check Configuration

El Load Balancer usa:
- **Path**: `/health`
- **Port**: `80`
- **Protocol**: `HTTP`
- **Interval**: `10s`
- **Timeout**: `5s`
- **Unhealthy threshold**: `3` checks consecutivos
- **Healthy threshold**: `2` checks consecutivos

Nginx responde en `/health` con:
```
HTTP/1.1 200 OK
Content-Type: text/plain

healthy
```

## 🔍 Verificación Post-Configuración

### **1. Verificar certificado SSL**

```bash
# Ver estado del certificado
gcloud compute ssl-certificates describe booklyapp-ssl-cert --global

# Debe mostrar:
# managed:
#   status: ACTIVE
#   domains:
#     - booklyapp.com
#     - www.booklyapp.com
```

### **2. Test desde navegador**

- Abrir: `https://booklyapp.com`
- Verificar certificado: Debe ser emitido por Google Trust Services
- No debe haber advertencias de seguridad

### **3. Test con curl**

```bash
# HTTPS debe funcionar (SIN -k)
curl -I https://booklyapp.com/health

# HTTP debe redirigir a HTTPS
curl -I http://booklyapp.com/health
# Debe retornar: 301 Moved Permanently

# API debe funcionar
curl https://booklyapp.com/api/v1/health

# Health agregado
curl https://booklyapp.com/api/v1/health/aggregated
```

### **4. Verificar headers**

```bash
# Ver headers del Load Balancer
curl -I https://booklyapp.com/health

# Debe incluir:
# X-Forwarded-Proto: https
# X-Forwarded-For: <tu-ip>
```

## 📊 Monitoreo

### **Ver logs del Load Balancer**

```bash
# Logs del Load Balancer
gcloud logging read "resource.type=http_load_balancer AND resource.labels.forwarding_rule_name=bookly-https-rule" \
    --limit=50 \
    --format=json

# Métricas del backend
gcloud monitoring time-series list \
    --filter='metric.type="loadbalancing.googleapis.com/https/backend_latencies"'
```

### **Ver logs de Nginx**

```bash
# En la instancia GCP
docker logs bookly-nginx -f --tail 100

# Ver solo errores
docker logs bookly-nginx 2>&1 | grep -i error
```

## 🛡️ Seguridad Adicional (Opcional)

### **Cloud Armor - WAF y DDoS Protection**

```bash
# Crear política de seguridad
gcloud compute security-policies create bookly-security-policy \
    --description="Security policy for Bookly"

# Regla para bloquear IPs sospechosas
gcloud compute security-policies rules create 1000 \
    --security-policy=bookly-security-policy \
    --expression="origin.ip == '1.2.3.4'" \
    --action=deny-403

# Aplicar a backend service
gcloud compute backend-services update bookly-backend-service \
    --security-policy=bookly-security-policy \
    --global
```

## 🔧 Troubleshooting

### Problema: Certificado no se aprovisiona

**Síntoma**: `status: PROVISIONING` por más de 60 minutos

**Solución**:
```bash
# 1. Verificar DNS apunta a IP del LB
dig booklyapp.com +short
# Debe retornar la IP del Load Balancer

# 2. Verificar que el dominio sea accesible por HTTP
curl http://booklyapp.com/health

# 3. Google necesita verificar el dominio por HTTP antes de emitir SSL
```

### Problema: Health check falla

**Síntoma**: Backend marcado como UNHEALTHY

**Solución**:
```bash
# 1. Verificar que Nginx responde en /health
docker exec bookly-nginx wget -O- http://localhost/health

# 2. Verificar firewall permite tráfico del health check
gcloud compute firewall-rules create allow-health-check \
    --allow=tcp:80 \
    --source-ranges=130.211.0.0/22,35.191.0.0/16 \
    --target-tags=bookly-server

# 3. Ver logs del health check
gcloud logging read "resource.type=gce_backend_service" --limit=20
```

### Problema: 502 Bad Gateway

**Síntoma**: Load Balancer retorna 502

**Causas comunes**:
1. API Gateway no está funcionando
2. Nginx no puede conectar a API Gateway
3. Timeout demasiado corto

**Solución**:
```bash
# Verificar API Gateway
docker exec bookly-nginx wget -O- http://host.docker.internal:3000/health

# Verificar logs de Nginx
docker logs bookly-nginx --tail 50

# Aumentar timeout del backend
gcloud compute backend-services update bookly-backend-service \
    --timeout=60s \
    --global
```

## 📋 Comandos Útiles

```bash
# Ver estado del Load Balancer
gcloud compute forwarding-rules list

# Ver estado de backends
gcloud compute backend-services get-health bookly-backend-service --global

# Ver certificados
gcloud compute ssl-certificates list

# Ver logs recientes
gcloud logging read "resource.type=http_load_balancer" --limit=20

# Eliminar Load Balancer (si necesitas recrear)
gcloud compute forwarding-rules delete bookly-https-rule --global -q
gcloud compute forwarding-rules delete bookly-http-rule --global -q
gcloud compute target-https-proxies delete bookly-https-proxy -q
gcloud compute target-http-proxies delete bookly-http-proxy -q
gcloud compute url-maps delete bookly-lb -q
gcloud compute url-maps delete bookly-http-redirect -q
gcloud compute backend-services delete bookly-backend-service --global -q
```

## ✅ Checklist Final

- [ ] Load Balancer creado y funcionando
- [ ] Certificado SSL en estado ACTIVE
- [ ] DNS apunta a IP del Load Balancer
- [ ] Health check pasa (backend HEALTHY)
- [ ] HTTPS funciona sin advertencias: `https://booklyapp.com`
- [ ] HTTP redirige a HTTPS
- [ ] API responde: `https://booklyapp.com/api/v1/health`
- [ ] Nginx solo expone puerto 80 (NO 443)
- [ ] Headers X-Forwarded-Proto configurados correctamente

## 📚 Documentación Adicional

- [GCP Load Balancing](https://cloud.google.com/load-balancing/docs)
- [SSL Certificates](https://cloud.google.com/load-balancing/docs/ssl-certificates)
- [Health Checks](https://cloud.google.com/load-balancing/docs/health-checks)
- [Cloud Armor](https://cloud.google.com/armor/docs)

---

**Última actualización**: 2025-10-25  
**Ambiente**: QA/Producción  
**Dominio**: booklyapp.com  
**Load Balancer**: Global HTTPS
