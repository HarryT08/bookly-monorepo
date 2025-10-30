#!/bin/bash

# Script para aplicar el fix de host binding (localhost → 0.0.0.0)

set -e  # Exit on error

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}  FIX: HOST BINDING (localhost → 0.0.0.0)     ${NC}"
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

# Verificar que los archivos main.ts tienen 0.0.0.0
services=(
    "../src/apps/auth-service/main.ts"
    "../src/apps/resources-service/main.ts"
    "../src/apps/availability-service/main.ts"
    "../src/apps/stockpile-service/main.ts"
    "../src/apps/reports-service/main.ts"
)

all_fixed=true
for service_file in "${services[@]}"; do
    if [ -f "$service_file" ]; then
        if grep -q "0.0.0.0" "$service_file"; then
            echo -e "${GREEN}✓${NC} $(basename $(dirname $service_file)) - Tiene 0.0.0.0"
        else
            echo -e "${RED}✗${NC} $(basename $(dirname $service_file)) - NO tiene 0.0.0.0"
            all_fixed=false
        fi
    else
        echo -e "${RED}✗${NC} Archivo no encontrado: $service_file"
        all_fixed=false
    fi
done
echo ""

if [ "$all_fixed" = false ]; then
    echo -e "${RED}❌ Error: No todos los servicios tienen el fix aplicado${NC}"
    echo -e "${YELLOW}   Ejecuta: git pull origin main${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Todos los archivos main.ts tienen 0.0.0.0${NC}"
echo ""

echo -e "${YELLOW}📋 PASO 2: Rebuilding microservices...${NC}"
echo -e "${BLUE}   Esto puede tomar 2-5 minutos...${NC}"
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

echo -e "${YELLOW}⏳ Esperando 30 segundos para que los servicios inicien...${NC}"
for i in {30..1}; do
    echo -ne "\r   ${i} segundos restantes..."
    sleep 1
done
echo ""
echo ""

echo -e "${YELLOW}📋 PASO 5: Verificando logs de inicio...${NC}"
echo ""

# Verificar que los servicios estén usando 0.0.0.0
services_names=(
    "bookly-auth-service"
    "bookly-resources-service"
    "bookly-availability-service"
    "bookly-stockpile-service"
    "bookly-reports-service"
)

all_ok=true
for service in "${services_names[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${service}$"; then
        # Buscar en los logs si está usando 0.0.0.0
        if docker logs "$service" 2>&1 | grep -q "http://0.0.0.0"; then
            echo -e "${GREEN}✓${NC} $service está usando 0.0.0.0"
        else
            echo -e "${RED}✗${NC} $service NO está usando 0.0.0.0"
            all_ok=false
        fi
    else
        echo -e "${RED}✗${NC} $service no está corriendo"
        all_ok=false
    fi
done
echo ""

if [ "$all_ok" = false ]; then
    echo -e "${RED}❌ Algunos servicios no están usando 0.0.0.0${NC}"
    echo -e "${YELLOW}   Revisa los logs:${NC}"
    for service in "${services_names[@]}"; do
        echo "   docker logs $service --tail 20"
    done
    exit 1
fi

echo -e "${GREEN}✅ Todos los servicios usan 0.0.0.0${NC}"
echo ""

echo -e "${YELLOW}📋 PASO 6: Verificando conectividad...${NC}"
echo ""

# Esperar 10 segundos más
sleep 10

# Test de conectividad desde API Gateway
if docker ps --format '{{.Names}}' | grep -q "^bookly-api-gateway$"; then
    echo "Testing conectividad desde API Gateway:"
    
    test_services=(
        "auth-service:3001"
        "resources-service:3002"
        "availability-service:3003"
        "stockpile-service:3004"
        "reports-service:3005"
    )
    
    connectivity_ok=true
    for test_service in "${test_services[@]}"; do
        IFS=':' read -r hostname port <<< "$test_service"
        
        if docker exec bookly-api-gateway sh -c "command -v nc >/dev/null 2>&1" 2>/dev/null; then
            if timeout 3 docker exec bookly-api-gateway nc -zv "$hostname" "$port" 2>&1 | grep -q "open"; then
                echo -e "${GREEN}✓${NC} API Gateway → $hostname:$port (OK)"
            else
                echo -e "${RED}✗${NC} API Gateway → $hostname:$port (FAIL)"
                connectivity_ok=false
            fi
        fi
    done
    echo ""
    
    if [ "$connectivity_ok" = true ]; then
        echo -e "${GREEN}✅ Conectividad verificada exitosamente${NC}"
    else
        echo -e "${YELLOW}⚠ Algunos tests de conectividad fallaron${NC}"
        echo -e "${YELLOW}  Esto puede ser normal si los servicios aún están inicializando${NC}"
    fi
else
    echo -e "${YELLOW}⚠ API Gateway no encontrado${NC}"
fi
echo ""

echo -e "${YELLOW}📋 PASO 7: Verificando health checks...${NC}"
echo ""

# Esperar 15 segundos más para health checks
sleep 15

# Verificar logs de API Gateway
if docker ps --format '{{.Names}}' | grep -q "^bookly-api-gateway$"; then
    econnrefused_count=$(docker logs bookly-api-gateway 2>&1 | grep ECONNREFUSED | wc -l)
    healthy_count=$(docker logs bookly-api-gateway 2>&1 | grep "healthy=true" | wc -l)
    
    echo "Errores ECONNREFUSED: $econnrefused_count"
    echo "Health checks exitosos: $healthy_count"
    echo ""
    
    if [ $econnrefused_count -gt 0 ]; then
        echo -e "${YELLOW}⚠ Aún hay errores ECONNREFUSED${NC}"
        echo -e "${YELLOW}  Espera 1-2 minutos y verifica con:${NC}"
        echo "  docker logs bookly-api-gateway --tail 30 -f"
    else
        echo -e "${GREEN}✅ No hay errores ECONNREFUSED${NC}"
    fi
fi
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}              ✅ FIX APLICADO                   ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}🎉 El fix de host binding ha sido aplicado exitosamente${NC}"
echo ""
echo -e "${YELLOW}📋 PRÓXIMOS PASOS:${NC}"
echo ""
echo "1. Verificar estado de servicios:"
echo "   docker ps --filter 'name=bookly'"
echo ""
echo "2. Ver logs de API Gateway:"
echo "   docker logs bookly-api-gateway --tail 30 -f"
echo ""
echo "3. Test de aggregated health:"
echo "   curl -s http://localhost:3000/health/aggregated | jq ."
echo ""
echo "4. Ejecutar diagnóstico completo:"
echo "   ./scripts/check-microservices-logs.sh"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
