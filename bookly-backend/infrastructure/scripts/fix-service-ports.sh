#!/bin/bash

# Fix Service Ports - Rebuild microservices with correct ports
# resources-service: 3002 | availability-service: 3003

set -e

echo "🔧 Fixing microservice ports..."
echo ""
echo "❌ PROBLEMA IDENTIFICADO:"
echo "   - resources-service main.ts: puerto 3003 → debería ser 3002"
echo "   - availability-service main.ts: puerto 3002 → debería ser 3003"
echo "   - API Gateway gateway.config.ts: puertos intercambiados"
echo ""

cd "$(dirname "$0")/.."

echo "📋 Paso 1: Rebuild microservicios con puertos corregidos..."
docker compose -f docker-compose.microservices.yml build api-gateway resources-service availability-service

echo ""
echo "📋 Paso 2: Detener microservicios afectados..."
docker compose -p bookly -f docker-compose.microservices.yml stop resources-service availability-service api-gateway

echo ""
echo "📋 Paso 3: Remover contenedores antiguos..."
docker rm bookly-resources-service || true
docker rm bookly-availability-service || true
docker rm bookly-api-gateway || true

echo ""
echo "📋 Paso 4: Reiniciar microservicios con nuevos puertos..."
docker compose -p bookly -f docker-compose.microservices.yml up -d resources-service availability-service api-gateway

echo ""
echo "⏳ Esperando 30 segundos para inicialización..."
sleep 30

echo ""
echo "✅ Fix aplicado con éxito"
echo ""
echo "🔍 VERIFICACIÓN:"
echo ""
echo "1. Resources Service (debe estar en puerto 3002):"
echo "   curl -s http://localhost:3002/api/v1/health | jq '.'"
echo ""
echo "2. Availability Service (debe estar en puerto 3003):"
echo "   curl -s http://localhost:3003/api/v1/health | jq '.'"
echo ""
echo "3. API Gateway health check (ambos servicios deben estar 'up'):"
echo "   curl -s http://localhost:3000/api/v1/health/aggregated | jq '.services'"
echo ""
echo "4. Ver logs de recursos:"
echo "   docker logs bookly-resources-service --tail 50"
echo ""
echo "5. Ver logs de disponibilidad:"
echo "   docker logs bookly-availability-service --tail 50"
echo ""
