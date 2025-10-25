#!/bin/bash

# Deploy Bookly Backend en GCP - Producción
# Script completo de despliegue con Nginx reverse proxy

set -e

echo "🚀 Deploy Bookly Backend en GCP - Producción"
echo "============================================"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.microservices.yml" ]; then
    echo "❌ Error: Debe ejecutar este script desde el directorio infrastructure/"
    exit 1
fi

# Variables
DOMAIN="bookly.com"
GCP_INSTANCE_IP="35.209.124.62"

echo "📋 Configuración:"
echo "   - Dominio: ${DOMAIN}"
echo "   - IP GCP: ${GCP_INSTANCE_IP}"
echo ""

# Paso 1: Verificar DNS
echo "🔍 Paso 1: Verificando configuración DNS..."
DNS_IP=$(dig +short ${DOMAIN} | tail -n1)

if [ -z "$DNS_IP" ]; then
    echo "❌ Error: No se pudo resolver ${DOMAIN}"
    echo "   Configure el DNS en Cloud DNS de GCP para apuntar a ${GCP_INSTANCE_IP}"
    exit 1
fi

if [ "$DNS_IP" != "$GCP_INSTANCE_IP" ]; then
    echo "⚠️  Advertencia: DNS apunta a ${DNS_IP} pero la instancia GCP es ${GCP_INSTANCE_IP}"
    echo "   Puede tardar hasta 48 horas en propagarse"
fi

echo "✅ DNS configurado: ${DOMAIN} → ${DNS_IP}"
echo ""

# Paso 2: Detener servicios existentes (si los hay)
echo "🛑 Paso 2: Deteniendo servicios existentes..."
docker compose -p bookly -f docker-compose.nginx.yml down 2>/dev/null || true
docker compose -p bookly -f docker-compose.microservices.yml down 2>/dev/null || true

echo "✅ Servicios detenidos"
echo ""

# Paso 3: Limpiar contenedores antiguos
echo "🧹 Paso 3: Limpiando contenedores antiguos..."
docker system prune -f --volumes 2>/dev/null || true

echo "✅ Contenedores limpiados"
echo ""

# Paso 4: Iniciar servicios base (MongoDB, Redis, RabbitMQ)
echo "💾 Paso 4: Iniciando servicios base..."
docker compose -p bookly -f docker-compose.base.yml up -d

echo "⏳ Esperando 60 segundos para inicialización de servicios base..."
sleep 60

echo "✅ Servicios base iniciados"
echo ""

# Paso 5: Iniciar microservicios (SIN exponer puertos)
echo "⚙️  Paso 5: Iniciando microservicios (red interna)..."
docker compose -p bookly \
    -f docker-compose.microservices.yml \
    -f docker-compose.production.yml \
    up -d

echo "⏳ Esperando 45 segundos para inicialización de microservicios..."
sleep 45

echo "✅ Microservicios iniciados"
echo ""

# Paso 6: Verificar health de microservicios
echo "🏥 Paso 6: Verificando salud de microservicios..."

# API Gateway (internamente)
if docker exec bookly-api-gateway wget -q -O- http://localhost:3000/health > /dev/null 2>&1; then
    echo "   ✅ API Gateway: healthy"
else
    echo "   ❌ API Gateway: unhealthy"
fi

# Auth Service
if docker exec bookly-auth-service wget -q -O- http://localhost:3001/health > /dev/null 2>&1; then
    echo "   ✅ Auth Service: healthy"
else
    echo "   ❌ Auth Service: unhealthy"
fi

# Resources Service  
if docker exec bookly-resources-service wget -q -O- http://localhost:3002/health > /dev/null 2>&1; then
    echo "   ✅ Resources Service: healthy"
else
    echo "   ❌ Resources Service: unhealthy"
fi

# Availability Service
if docker exec bookly-availability-service wget -q -O- http://localhost:3003/health > /dev/null 2>&1; then
    echo "   ✅ Availability Service: healthy"
else
    echo "   ❌ Availability Service: unhealthy"
fi

echo ""

# Paso 7: Iniciar Nginx
echo "🌐 Paso 7: Iniciando Nginx reverse proxy..."
docker compose -p bookly -f docker-compose.nginx.yml up -d nginx

echo "⏳ Esperando 10 segundos para inicialización de Nginx..."
sleep 10

echo "✅ Nginx iniciado"
echo ""

# Paso 8: Verificar Nginx
echo "🔍 Paso 8: Verificando Nginx..."
if docker ps | grep -q bookly-nginx; then
    echo "✅ Nginx container funcionando"
    
    # Test interno
    if docker exec bookly-nginx wget -q -O- http://localhost/nginx-health > /dev/null 2>&1; then
        echo "✅ Nginx respondiendo correctamente"
    else
        echo "❌ Nginx no responde al health check"
    fi
else
    echo "❌ Nginx container no está funcionando"
    echo "Ver logs: docker logs bookly-nginx"
    exit 1
fi

echo ""

# Paso 9: Setup SSL (si no existe)
echo "🔐 Paso 9: Verificando certificados SSL..."
if [ ! -f "nginx/ssl/live/${DOMAIN}/fullchain.pem" ] || [ $(find nginx/ssl/live/${DOMAIN}/fullchain.pem -mtime +7 2>/dev/null | wc -l) -gt 0 ]; then
    echo "📝 Certificados SSL no encontrados o vencidos"
    echo "Ejecutando setup de SSL..."
    chmod +x scripts/setup-ssl-certificates.sh
    ./scripts/setup-ssl-certificates.sh
else
    echo "✅ Certificados SSL válidos encontrados"
fi

echo ""

# Paso 10: Verificación final
echo "🎯 Paso 10: Verificación final..."
echo ""

echo "📊 Estado de containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep bookly || true

echo ""
echo "🌐 URLs de acceso:"
echo "   - HTTP:  http://${DOMAIN}"
echo "   - HTTPS: https://${DOMAIN}"
echo "   - API:   https://${DOMAIN}/api/v1"
echo "   - Health: https://${DOMAIN}/health"
echo "   - Docs:  https://${DOMAIN}/api/docs"
echo ""

echo "📋 Comandos útiles:"
echo "   - Ver logs de Nginx:"
echo "     docker logs bookly-nginx -f"
echo ""
echo "   - Ver logs de API Gateway:"
echo "     docker logs bookly-api-gateway -f"
echo ""
echo "   - Health check agregado:"
echo "     curl -s https://${DOMAIN}/api/v1/health/aggregated | jq '.'"
echo ""
echo "   - Reiniciar servicios:"
echo "     docker compose -p bookly -f docker-compose.nginx.yml restart"
echo ""
echo "   - Ver uso de recursos:"
echo "     docker stats --no-stream"
echo ""

echo "🎉 ¡Deploy completado exitosamente!"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Los microservicios NO son accesibles directamente desde internet"
echo "   - TODO el tráfico pasa por Nginx → API Gateway"
echo "   - Solo los puertos 80 y 443 están expuestos"
echo "   - Los certificados SSL se renuevan automáticamente cada 12 horas"
echo ""
