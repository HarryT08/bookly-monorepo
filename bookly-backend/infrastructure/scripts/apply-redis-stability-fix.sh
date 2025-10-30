#!/bin/bash

# Script para aplicar el fix de estabilidad de Redis

set -e  # Exit on error

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}  FIX: ESTABILIDAD REDIS (Keep-Alive + Retry)  ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.base.yml" ]; then
    echo -e "${RED}❌ Error: Debes ejecutar este script desde el directorio infrastructure/${NC}"
    echo "   cd /path/to/bookly-monorepo/bookly-backend/infrastructure"
    exit 1
fi

echo -e "${YELLOW}📋 PASO 1: Verificando cambios en el código...${NC}"
echo ""

# Verificar Redis keepAlive en redis.service.ts
if grep -q "keepAlive: 30000" ../src/libs/event-bus/services/redis.service.ts; then
    echo -e "${GREEN}✓${NC} redis.service.ts tiene keepAlive configurado"
else
    echo -e "${RED}✗${NC} redis.service.ts NO tiene keepAlive"
    echo -e "${YELLOW}   Ejecuta: git pull origin main${NC}"
    exit 1
fi

# Verificar retry logic en health.service.ts
if grep -q "for (let attempt = 1; attempt <= 2; attempt++)" ../src/health/health.service.ts; then
    echo -e "${GREEN}✓${NC} health.service.ts tiene retry logic"
else
    echo -e "${RED}✗${NC} health.service.ts NO tiene retry logic"
    exit 1
fi

# Verificar tcp-keepalive en docker-compose
if grep -q "tcp-keepalive" docker-compose.base.yml; then
    echo -e "${GREEN}✓${NC} docker-compose.base.yml tiene tcp-keepalive"
else
    echo -e "${RED}✗${NC} docker-compose.base.yml NO tiene tcp-keepalive"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Todos los cambios están presentes${NC}"
echo ""

echo -e "${YELLOW}📋 PASO 2: Recreando Redis con nueva configuración...${NC}"
echo ""

# Detener Redis
echo "Deteniendo Redis..."
docker compose -p bookly -f docker-compose.base.yml stop redis

# Eliminar contenedor (no elimina volumen de datos)
echo "Eliminando contenedor de Redis..."
docker rm bookly-redis 2>/dev/null || true

# Levantar Redis con nueva configuración
echo "Levantando Redis con nueva configuración..."
docker compose -p bookly -f docker-compose.base.yml up -d redis

# Esperar a que Redis esté listo
echo -e "${YELLOW}⏳ Esperando a que Redis esté listo...${NC}"
for i in {10..1}; do
    echo -ne "\r   ${i} segundos restantes..."
    sleep 1
done
echo ""

# Verificar que Redis está corriendo
if docker ps --format '{{.Names}}' | grep -q "^bookly-redis$"; then
    echo -e "${GREEN}✓${NC} Redis está corriendo"
else
    echo -e "${RED}✗${NC} Redis no está corriendo"
    exit 1
fi

# Verificar configuración de Redis
echo ""
echo -e "${YELLOW}Verificando configuración de Redis:${NC}"

tcp_keepalive=$(docker exec bookly-redis redis-cli -a bookly123 CONFIG GET tcp-keepalive 2>/dev/null | tail -1)
timeout_val=$(docker exec bookly-redis redis-cli -a bookly123 CONFIG GET timeout 2>/dev/null | tail -1)

echo "  tcp-keepalive: $tcp_keepalive"
echo "  timeout: $timeout_val"

if [ "$tcp_keepalive" = "60" ] && [ "$timeout_val" = "0" ]; then
    echo -e "${GREEN}✓${NC} Configuración de Redis correcta"
else
    echo -e "${YELLOW}⚠${NC} Configuración no es la esperada"
    echo "     Esperado: tcp-keepalive=60, timeout=0"
fi

echo ""
echo -e "${GREEN}✅ Redis recreado con nueva configuración${NC}"
echo ""

echo -e "${YELLOW}📋 PASO 3: Rebuilding microservicios...${NC}"
echo -e "${BLUE}   Esto puede tomar 3-5 minutos...${NC}"
echo ""

# Rebuild de microservicios
docker compose -f docker-compose.microservices.yml build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el rebuild${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Rebuild completado${NC}"
echo ""

echo -e "${YELLOW}📋 PASO 4: Reiniciando microservicios...${NC}"
docker compose -p bookly -f docker-compose.microservices.yml down
docker compose -p bookly -f docker-compose.microservices.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al levantar microservicios${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Microservicios levantados${NC}"
echo ""

echo -e "${YELLOW}⏳ Esperando 60 segundos para que las conexiones se estabilicen...${NC}"
for i in {60..1}; do
    echo -ne "\r   ${i} segundos restantes..."
    sleep 1
done
echo ""
echo ""

echo -e "${YELLOW}📋 PASO 5: Verificando estabilidad de conexiones...${NC}"
echo ""

# Verificar conexiones activas a Redis
connections=$(docker exec bookly-redis redis-cli -a bookly123 INFO clients 2>/dev/null | grep connected_clients | cut -d: -f2 | tr -d '\r')
echo "Conexiones activas a Redis: $connections"

if [ "$connections" -ge 5 ] && [ "$connections" -le 15 ]; then
    echo -e "${GREEN}✓${NC} Número de conexiones normal"
else
    echo -e "${YELLOW}⚠${NC} Número de conexiones inesperado (esperado: 5-15)"
fi

echo ""

# Verificar health de servicios
services=(
    "auth-service:3001"
    "resources-service:3002"
    "availability-service:3003"
    "stockpile-service:3004"
    "reports-service:3005"
)

all_healthy=true
echo -e "${YELLOW}Verificando health de servicios:${NC}"
for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    
    if command -v jq >/dev/null 2>&1; then
        response=$(curl -s "http://localhost:${port}/api/v1/health" 2>/dev/null || echo '{"error":"failed"}')
        redis_status=$(echo "$response" | jq -r '.info.redis.status // .details.redis.status // "error"')
        http_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${port}/api/v1/health" 2>/dev/null || echo "000")
        
        if [ "$redis_status" = "up" ] && [ "$http_code" = "200" ]; then
            echo -e "${GREEN}✓${NC} $name - Redis: $redis_status, HTTP: $http_code"
        else
            echo -e "${YELLOW}⚠${NC} $name - Redis: $redis_status, HTTP: $http_code"
            all_healthy=false
        fi
    else
        http_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${port}/api/v1/health" 2>/dev/null || echo "000")
        if [ "$http_code" = "200" ]; then
            echo -e "${GREEN}✓${NC} $name - HTTP: $http_code"
        else
            echo -e "${YELLOW}⚠${NC} $name - HTTP: $http_code"
            all_healthy=false
        fi
    fi
done

echo ""

if [ "$all_healthy" = false ]; then
    echo -e "${YELLOW}⚠ Algunos servicios aún se están estabilizando${NC}"
    echo -e "${YELLOW}  Espera 1-2 minutos y verifica manualmente${NC}"
else
    echo -e "${GREEN}✅ Todos los servicios están saludables${NC}"
fi

echo ""

echo -e "${YELLOW}📋 PASO 6: Test de estabilidad (30 segundos)...${NC}"
echo ""

# Realizar 6 checks cada 5 segundos
stable_count=0
unstable_count=0

for i in {1..6}; do
    response=$(curl -s http://localhost:3001/api/v1/health 2>/dev/null || echo '{}')
    redis_status="unknown"
    
    if command -v jq >/dev/null 2>&1; then
        redis_status=$(echo "$response" | jq -r '.info.redis.status // "unknown"')
    fi
    
    if [ "$redis_status" = "up" ]; then
        echo -e "${GREEN}[$i/6]${NC} Redis: up"
        stable_count=$((stable_count + 1))
    else
        echo -e "${YELLOW}[$i/6]${NC} Redis: $redis_status"
        unstable_count=$((unstable_count + 1))
    fi
    
    if [ $i -lt 6 ]; then
        sleep 5
    fi
done

echo ""

success_rate=$((stable_count * 100 / 6))
echo "Tasa de éxito: ${success_rate}% (${stable_count}/6)"

if [ "$stable_count" -eq 6 ]; then
    echo -e "${GREEN}✅ ESTABLE: 100% de health checks exitosos${NC}"
elif [ "$stable_count" -ge 5 ]; then
    echo -e "${GREEN}✅ ACEPTABLE: ${success_rate}% de health checks exitosos${NC}"
else
    echo -e "${YELLOW}⚠ INESTABLE: Solo ${success_rate}% de health checks exitosos${NC}"
    echo -e "${YELLOW}  Monitorea por más tiempo con:${NC}"
    echo "  watch -n 5 'curl -s http://localhost:3001/api/v1/health | jq .info.redis'"
fi

echo ""

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}           ✅ FIX APLICADO                      ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}🎉 El fix de estabilidad de Redis ha sido aplicado${NC}"
echo ""
echo -e "${YELLOW}📋 MONITOREO RECOMENDADO:${NC}"
echo ""
echo "1. Monitorear por 10 minutos:"
echo "   watch -n 10 'curl -s http://localhost:3001/api/v1/health | jq .info.redis'"
echo ""
echo "2. Ver logs de Redis (no deben haber disconnections):"
echo "   docker logs bookly-redis --tail 50 -f"
echo ""
echo "3. Ver logs de auth-service (no deben haber reconnections):"
echo "   docker logs bookly-auth-service --tail 50 -f"
echo ""
echo "4. Verificar conexiones a Redis:"
echo "   docker exec bookly-redis redis-cli -a bookly123 CLIENT LIST"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
