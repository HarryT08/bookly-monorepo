#!/bin/bash

# Script para aplicar el fix de Redis health check

set -e  # Exit on error

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}  FIX: REDIS HEALTH CHECK (result: null)      ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.microservices.yml" ]; then
    echo -e "${RED}❌ Error: Debes ejecutar este script desde el directorio infrastructure/${NC}"
    echo "   cd /path/to/bookly-monorepo/bookly-backend/infrastructure"
    exit 1
fi

echo -e "${YELLOW}📋 PASO 1: Verificando cambios en el código...${NC}"
echo ""

# Verificar que health.service.ts tiene el fix
if grep -q "Use direct Redis client for health check" ../src/health/health.service.ts; then
    echo -e "${GREEN}✓${NC} health.service.ts tiene el fix aplicado"
else
    echo -e "${RED}✗${NC} health.service.ts NO tiene el fix"
    echo -e "${YELLOW}   Ejecuta: git pull origin main${NC}"
    exit 1
fi

# Verificar sintaxis correcta
if grep -q "client.set(testKey, 'ok', 'EX', 5)" ../src/health/health.service.ts; then
    echo -e "${GREEN}✓${NC} Sintaxis de Redis SET correcta (con 'EX')"
else
    echo -e "${RED}✗${NC} Sintaxis de Redis SET incorrecta"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ El código tiene el fix aplicado${NC}"
echo ""

echo -e "${YELLOW}📋 PASO 2: Rebuilding TODOS los microservicios...${NC}"
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

echo -e "${YELLOW}📋 PASO 3: Deteniendo servicios...${NC}"
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml down
echo ""
echo -e "${GREEN}✅ Servicios detenidos${NC}"
echo ""

echo -e "${YELLOW}📋 PASO 4: Levantando servicios con nuevo build...${NC}"
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al levantar servicios${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Servicios levantados${NC}"
echo ""

echo -e "${YELLOW}⏳ Esperando 45 segundos para que los servicios inicien...${NC}"
for i in {45..1}; do
    echo -ne "\r   ${i} segundos restantes..."
    sleep 1
done
echo ""
echo ""

echo -e "${YELLOW}📋 PASO 5: Verificando health checks de servicios individuales...${NC}"
echo ""

# Verificar health de cada servicio
services=(
    "auth-service:3001"
    "resources-service:3002"
    "availability-service:3003"
    "stockpile-service:3004"
    "reports-service:3005"
)

all_healthy=true
for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    
    # Intentar health check
    response=$(curl -s -w "%{http_code}" -o /tmp/health_check.json "http://localhost:${port}/api/v1/health" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        # Verificar que Redis esté UP
        redis_status=$(jq -r '.info.redis.status // .details.redis.status // "unknown"' /tmp/health_check.json 2>/dev/null)
        
        if [ "$redis_status" = "up" ]; then
            echo -e "${GREEN}✓${NC} $name - Health: 200 OK, Redis: UP"
        else
            echo -e "${YELLOW}⚠${NC} $name - Health: 200 OK, Redis: $redis_status"
            all_healthy=false
        fi
    else
        echo -e "${RED}✗${NC} $name - Health: $response"
        all_healthy=false
    fi
done

echo ""

if [ "$all_healthy" = false ]; then
    echo -e "${YELLOW}⚠ Algunos servicios no están completamente saludables${NC}"
    echo -e "${YELLOW}  Espera 1-2 minutos más y verifica manualmente:${NC}"
    echo "  curl -s http://localhost:3001/api/v1/health | jq ."
else
    echo -e "${GREEN}✅ Todos los servicios están saludables${NC}"
fi

echo ""

echo -e "${YELLOW}📋 PASO 6: Verificando API Gateway...${NC}"
echo ""

# Verificar logs de API Gateway
if docker ps --format '{{.Names}}' | grep -q "^bookly-api-gateway$"; then
    # Buscar errores ECONNREFUSED
    econnrefused_count=$(docker logs bookly-api-gateway 2>&1 | grep ECONNREFUSED | tail -20 | wc -l)
    
    # Buscar health checks exitosos
    healthy_count=$(docker logs bookly-api-gateway 2>&1 | grep "healthy=true" | tail -20 | wc -l)
    
    echo "Errores ECONNREFUSED (últimos 20): $econnrefused_count"
    echo "Health checks exitosos (últimos 20): $healthy_count"
    echo ""
    
    if [ $econnrefused_count -gt 0 ]; then
        echo -e "${YELLOW}⚠ Aún hay errores ECONNREFUSED recientes${NC}"
        echo -e "${YELLOW}  Esto es normal si los servicios acaban de iniciar${NC}"
        echo -e "${YELLOW}  Espera 1-2 minutos y verifica con:${NC}"
        echo "  docker logs bookly-api-gateway --tail 30 -f"
    else
        echo -e "${GREEN}✅ No hay errores ECONNREFUSED recientes${NC}"
    fi
fi

echo ""

echo -e "${YELLOW}📋 PASO 7: Verificando aggregated health...${NC}"
echo ""

# Test de aggregated health
if command -v jq >/dev/null 2>&1; then
    aggregated_response=$(curl -s http://localhost:3000/health/aggregated 2>/dev/null || echo '{"error": "failed"}')
    
    # Contar servicios UP
    services_up=$(echo "$aggregated_response" | jq -r '.services | to_entries[] | select(.value.status == "up") | .key' 2>/dev/null | wc -l)
    services_total=$(echo "$aggregated_response" | jq -r '.services | length' 2>/dev/null)
    
    echo "Servicios UP: $services_up / $services_total"
    
    if [ "$services_up" -eq "$services_total" ] && [ "$services_total" -gt 0 ]; then
        echo -e "${GREEN}✅ Todos los servicios están UP en aggregated health${NC}"
    else
        echo -e "${YELLOW}⚠ Algunos servicios no están UP${NC}"
        echo "Detalles:"
        echo "$aggregated_response" | jq '.services' 2>/dev/null || echo "$aggregated_response"
    fi
else
    echo -e "${YELLOW}⚠ jq no está instalado, no se puede verificar aggregated health${NC}"
    echo "  Instala jq o verifica manualmente:"
    echo "  curl -s http://localhost:3000/health/aggregated"
fi

echo ""

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}           ✅ FIX APLICADO                      ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}🎉 El fix de Redis health check ha sido aplicado${NC}"
echo ""
echo -e "${YELLOW}📋 VERIFICACIÓN FINAL:${NC}"
echo ""
echo "1. Ver logs de un servicio:"
echo "   docker logs bookly-auth-service --tail 30"
echo ""
echo "2. Test de health individual:"
echo "   curl -s http://localhost:3001/api/v1/health | jq ."
echo ""
echo "3. Test de aggregated health:"
echo "   curl -s http://localhost:3000/health/aggregated | jq ."
echo ""
echo "4. Ver logs de API Gateway:"
echo "   docker logs bookly-api-gateway --tail 30 -f"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

# Cleanup
rm -f /tmp/health_check.json
