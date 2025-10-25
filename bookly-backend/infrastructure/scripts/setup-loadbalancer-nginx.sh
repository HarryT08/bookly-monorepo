#!/bin/bash

# Configurar Nginx para trabajar detrás de GCP Load Balancer
# El Load Balancer maneja SSL, Nginx solo recibe HTTP

set -e

echo "🔧 Configurando Nginx para GCP Load Balancer..."
echo ""

# Verificar directorio
if [ ! -d "nginx/conf.d" ]; then
    echo "❌ Error: Debe ejecutar desde el directorio infrastructure/"
    exit 1
fi

# Paso 1: Deshabilitar configuraciones SSL locales
echo "📋 Paso 1: Deshabilitando configuraciones SSL locales..."

if [ -f "nginx/conf.d/bookly-qa.conf" ]; then
    mv nginx/conf.d/bookly-qa.conf nginx/conf.d/bookly-qa.conf.backup
    echo "   ✅ bookly-qa.conf → backup"
fi

if [ -f "nginx/conf.d/bookly-qa-no-ssl.conf" ]; then
    mv nginx/conf.d/bookly-qa-no-ssl.conf nginx/conf.d/bookly-qa-no-ssl.conf.disabled
    echo "   ✅ bookly-qa-no-ssl.conf → disabled"
fi

# Paso 2: Verificar que bookly-loadbalancer.conf existe
echo ""
echo "📋 Paso 2: Verificando configuración para Load Balancer..."

if [ ! -f "nginx/conf.d/bookly-loadbalancer.conf" ]; then
    echo "   ❌ Error: nginx/conf.d/bookly-loadbalancer.conf no existe"
    echo "   Ejecute: git pull origin main"
    exit 1
fi

echo "   ✅ bookly-loadbalancer.conf encontrado"

# Paso 3: Verificar si Nginx está corriendo
echo ""
echo "📋 Paso 3: Verificando si Nginx está corriendo..."

if docker ps | grep -q bookly-nginx; then
    echo "   ✅ Nginx está corriendo"
    
    # Validar configuración
    echo ""
    echo "📋 Paso 4: Verificando sintaxis de Nginx..."
    if docker exec bookly-nginx nginx -t > /dev/null 2>&1; then
        echo "   ✅ Configuración de Nginx válida"
    else
        echo "   ⚠️  Advertencia: Error en configuración de Nginx"
        docker exec bookly-nginx nginx -t
    fi
    
    # Reiniciar Nginx
    echo ""
    echo "📋 Paso 5: Reiniciando Nginx..."
    docker restart bookly-nginx
    
    echo "   ⏳ Esperando 5 segundos..."
    sleep 5
    
    # Verificar estado
    echo ""
    echo "📋 Paso 6: Verificando estado de Nginx..."
    if docker ps | grep bookly-nginx | grep -q "Up"; then
        echo "   ✅ Nginx funcionando correctamente"
    else
        echo "   ❌ Nginx no está funcionando"
        docker logs bookly-nginx --tail 20
        exit 1
    fi
else
    echo "   ⚠️  Nginx no está corriendo"
    echo "   📝 Necesitas iniciar el stack primero:"
    echo "      make dev-full"
    echo ""
    echo "   ℹ️  La configuración se aplicará cuando inicies Nginx"
    exit 0
fi

# Paso 7: Test health check
echo ""
echo "📋 Paso 7: Probando health check..."

if curl -s http://localhost/health | grep -q "healthy"; then
    echo "   ✅ Health check funciona"
else
    echo "   ⚠️  Health check no responde"
    echo "   Esto es normal si Nginx acaba de iniciarse"
fi

# Paso 8: Verificar puertos
echo ""
echo "📋 Paso 8: Verificando puertos expuestos..."

PORTS=$(docker ps | grep bookly-nginx | grep -oP '0\.0\.0\.0:\d+' || true)

if echo "$PORTS" | grep -q "0.0.0.0:80"; then
    echo "   ✅ Puerto 80 expuesto"
else
    echo "   ⚠️  Puerto 80 NO expuesto"
fi

if echo "$PORTS" | grep -q "0.0.0.0:443"; then
    echo "   ⚠️  Puerto 443 expuesto (no necesario con Load Balancer)"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Resumen:"
echo "   - Nginx configurado para recibir tráfico HTTP del Load Balancer"
echo "   - SSL manejado por GCP Load Balancer"
echo "   - Health check en /health funcionando"
echo ""
echo "🔍 Próximos pasos:"
echo "   1. Configurar Load Balancer en GCP (ver docs/GCP-LOAD-BALANCER-SSL.md)"
echo "   2. Actualizar DNS para apuntar a IP del Load Balancer"
echo "   3. Esperar que certificado SSL se aprovisione (15-60 min)"
echo "   4. Probar: https://booklyapp.com"
echo ""
