#!/bin/bash

# Setup SSL Certificates con Let's Encrypt para bookly.com
# Debe ejecutarse en la instancia GCP con el dominio ya configurado

set -e

DOMAIN="bookly.com"
EMAIL="admin@bookly.com"  # Cambiar por el email del admin

echo "🔐 Configurando certificados SSL para ${DOMAIN}..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.nginx.yml" ]; then
    echo "❌ Error: Debe ejecutar este script desde el directorio infrastructure/"
    exit 1
fi

# Crear directorios necesarios
echo "📁 Creando directorios para certificados..."
mkdir -p nginx/ssl/live/${DOMAIN}
mkdir -p nginx/certbot

# Crear certificado temporal para iniciar Nginx
echo "📝 Creando certificado temporal..."
openssl req -x509 -nodes -newkey rsa:2048 \
    -days 1 \
    -keyout nginx/ssl/live/${DOMAIN}/privkey.pem \
    -out nginx/ssl/live/${DOMAIN}/fullchain.pem \
    -subj "/CN=${DOMAIN}"

# Crear chain.pem (mismo que fullchain para temporal)
cp nginx/ssl/live/${DOMAIN}/fullchain.pem nginx/ssl/live/${DOMAIN}/chain.pem

echo ""
echo "✅ Certificado temporal creado"
echo ""

# Iniciar Nginx con certificado temporal
echo "🚀 Iniciando Nginx con certificado temporal..."
docker compose -p bookly -f docker-compose.nginx.yml up -d nginx

echo ""
echo "⏳ Esperando 10 segundos para que Nginx inicie..."
sleep 10

# Verificar que Nginx esté funcionando
if ! docker ps | grep -q bookly-nginx; then
    echo "❌ Error: Nginx no está funcionando"
    echo "Ver logs: docker logs bookly-nginx"
    exit 1
fi

echo "✅ Nginx funcionando correctamente"
echo ""

# Obtener certificado real de Let's Encrypt
echo "🔐 Obteniendo certificado real de Let's Encrypt..."
echo "Dominio: ${DOMAIN}"
echo "Email: ${EMAIL}"
echo ""

docker compose -p bookly -f docker-compose.nginx.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email ${EMAIL} \
    --agree-tos \
    --no-eff-email \
    -d ${DOMAIN} \
    -d www.${DOMAIN}

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Certificado SSL obtenido exitosamente"
    echo ""
    
    # Reiniciar Nginx para cargar el certificado real
    echo "🔄 Reiniciando Nginx con certificado real..."
    docker compose -p bookly -f docker-compose.nginx.yml restart nginx
    
    echo ""
    echo "✅ Nginx reiniciado con certificado SSL válido"
    echo ""
    echo "🎉 Configuración SSL completada!"
    echo ""
    echo "📋 Verificación:"
    echo "   1. Verificar certificado:"
    echo "      openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} < /dev/null | grep 'Verify return code'"
    echo ""
    echo "   2. Probar HTTPS:"
    echo "      curl -I https://${DOMAIN}"
    echo ""
    echo "   3. Renovación automática:"
    echo "      Los certificados se renovarán automáticamente cada 12 horas"
    echo ""
else
    echo ""
    echo "❌ Error al obtener certificado SSL"
    echo ""
    echo "Posibles causas:"
    echo "   1. El dominio ${DOMAIN} no apunta a esta IP"
    echo "   2. El puerto 80 no está accesible desde internet"
    echo "   3. Firewall de GCP bloqueando puerto 80"
    echo ""
    echo "Soluciones:"
    echo "   1. Verificar DNS: dig ${DOMAIN}"
    echo "   2. Verificar firewall GCP: gcloud compute firewall-rules list"
    echo "   3. Verificar que Nginx responde: curl http://$(hostname -I | awk '{print $1}'):80/nginx-health"
    echo ""
    exit 1
fi
