# ⚡ Solución Rápida: Configurar Load Balancer

## 🚨 Problema Resuelto

El error ocurría porque el script intentaba validar Nginx **sin que el contenedor estuviera corriendo**.

## ✅ Solución en 3 Pasos

### **Paso 1: Pull de Cambios**

```bash
cd ~/bookly-monorepo/bookly-backend/infrastructure
git pull origin main
```

### **Paso 2: Iniciar Stack**

```bash
# Iniciar todos los servicios (incluido Nginx)
make dev-full
```

### **Paso 3: Configurar para Load Balancer**

```bash
# Ahora sí, configurar Nginx para Load Balancer
make dev-setup-lb
```

## 🎯 Qué hace `make dev-setup-lb`

1. ✅ Deshabilita configuraciones SSL locales
2. ✅ Habilita `bookly-loadbalancer.conf`
3. ✅ Verifica que Nginx esté corriendo
4. ✅ Valida configuración de Nginx
5. ✅ Reinicia Nginx
6. ✅ Prueba health check

## 📋 Flujo Completo

```bash
# 1. En tu máquina local - commitear y pushear
cd bookly-backend/infrastructure
git add .
git commit -m "feat: configurar nginx para GCP Load Balancer"
git push origin main

# 2. En servidor GCP - aplicar cambios
cd ~/bookly-monorepo/bookly-backend/infrastructure
git pull origin main

# 3. Iniciar stack (si no está corriendo)
make dev-full

# 4. Configurar para Load Balancer
make dev-setup-lb

# 5. Verificar
curl http://localhost/health
# Debe retornar: healthy
```

## 🔍 Verificación

```bash
# Ver estado de Nginx
docker ps | grep nginx
# Debe mostrar: Up X seconds, 0.0.0.0:80->80/tcp

# Ver logs
docker logs bookly-nginx --tail 20

# Test health check
curl http://localhost/health
# Debe retornar: healthy

# Test API
curl http://localhost/api/v1/health
# Debe retornar: {"status":"ok",...}
```

## 🌐 Configuración del Load Balancer

Después de configurar Nginx, sigue los pasos en:

**`docs/GCP-LOAD-BALANCER-SSL.md`**

Resumen:
1. ✅ Crear certificado SSL administrado
2. ✅ Crear health check (path: `/health`, port: `80`)
3. ✅ Crear backend service
4. ✅ Agregar instance group
5. ✅ Crear URL map y proxies
6. ✅ Crear forwarding rules
7. ✅ Actualizar DNS

## ⏱️ Tiempo Total

- Configurar Nginx: **2 minutos**
- Configurar Load Balancer: **10 minutos**
- Esperar certificado SSL: **15-60 minutos**

## 🎉 Resultado Final

```
✅ Nginx configurado para Load Balancer
✅ Health check funcionando en /health
✅ Solo puerto 80 expuesto (HTTP)
✅ Listo para recibir tráfico del Load Balancer
```

Luego de configurar el Load Balancer:

```
✅ HTTPS funciona: https://booklyapp.com
✅ Certificado válido (sin advertencias)
✅ HTTP redirige a HTTPS
✅ Alta disponibilidad y auto-scaling
```

## 📝 Notas Importantes

- **Nginx NO maneja SSL**: El Load Balancer lo hace
- **Solo puerto 80**: No se necesita puerto 443 en Nginx
- **Headers importantes**: `X-Forwarded-Proto`, `X-Forwarded-For`
- **Health check**: GCP usa `/health` para verificar instancia

---

**Si tienes problemas**: Ver sección de Troubleshooting en `docs/GCP-LOAD-BALANCER-SSL.md`
