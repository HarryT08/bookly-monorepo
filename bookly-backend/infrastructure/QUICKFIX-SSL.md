# 🚨 FIX RÁPIDO: Nginx reiniciando por falta de certificados SSL

## ⚡ Solución INMEDIATA (Sin SSL - HTTP Only)

**EN TU SERVIDOR GCP**, ejecuta:

```bash
# 1. Pull de cambios
cd ~/bookly-monorepo/bookly-backend/infrastructure
git pull origin main

# 2. Reiniciar Nginx (ahora usa HTTP sin SSL)
docker restart bookly-nginx

# 3. Verificar que NO se reinicia
sleep 5
docker ps | grep nginx

# 4. Probar HTTP
curl http://booklyapp.com/nginx-health
curl http://booklyapp.com/api/v1/health
```

## ✅ Qué hace esto

- ✅ Deshabilita SSL temporalmente (`bookly-qa.conf.disabled`)
- ✅ Activa configuración HTTP (`bookly-qa-no-ssl.conf`)
- ✅ Nginx deja de reiniciarse
- ✅ booklyapp.com funciona por HTTP (puerto 80)

## 🔐 Habilitar SSL (Después)

Cuando quieras SSL, ejecuta:

```bash
# 1. Generar certificados
make dev-ssl-generate

# 2. Habilitar SSL
mv nginx/conf.d/bookly-qa.conf.disabled nginx/conf.d/bookly-qa.conf

# 3. Deshabilitar HTTP-only
mv nginx/conf.d/bookly-qa-no-ssl.conf nginx/conf.d/bookly-qa-no-ssl.conf.disabled

# 4. Reiniciar
docker restart bookly-nginx

# 5. Probar HTTPS
curl -k https://booklyapp.com/nginx-health
```

## 📋 Estado Actual

```
✅ HTTP (puerto 80): Funciona
❌ HTTPS (puerto 443): Deshabilitado temporalmente
```

## 🌐 Acceso

- **API**: `http://booklyapp.com/api/v1/`
- **Health**: `http://booklyapp.com/health`
- **Docs**: `http://booklyapp.com/api/docs`

---

**Esto es temporal hasta que generes los certificados SSL**
