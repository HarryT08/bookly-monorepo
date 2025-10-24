#!/bin/bash

# Script para verificar logs de microservicios y diagnosticar problemas

echo "🔍 DIAGNÓSTICO DE MICROSERVICIOS"
echo "================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Lista de servicios
SERVICES=(
  "bookly-auth-service:3001"
  "bookly-resources-service:3002"
  "bookly-availability-service:3003"
  "bookly-stockpile-service:3004"
  "bookly-reports-service:3005"
  "bookly-api-gateway:3000"
)

echo "📊 ESTADO DE CONTENEDORES"
echo "========================="
docker ps -a --filter "name=bookly-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "bookly-(auth|resources|availability|stockpile|reports|api-gateway)"
echo ""

echo "🔍 VERIFICACIÓN DE PUERTOS"
echo "=========================="
for service_info in "${SERVICES[@]}"; do
  IFS=':' read -r container_name port <<< "$service_info"
  
  # Verificar si el contenedor existe
  if docker ps -a --format '{{.Names}}' | grep -q "^${container_name}$"; then
    # Verificar si está corriendo
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
      # Verificar si el puerto está escuchando
      if docker exec "$container_name" sh -c "command -v netstat >/dev/null 2>&1" 2>/dev/null; then
        listening=$(docker exec "$container_name" netstat -tlnp 2>/dev/null | grep ":${port}" || echo "")
      elif docker exec "$container_name" sh -c "command -v ss >/dev/null 2>&1" 2>/dev/null; then
        listening=$(docker exec "$container_name" ss -tlnp 2>/dev/null | grep ":${port}" || echo "")
      else
        listening=""
      fi
      
      if [ -n "$listening" ]; then
        echo -e "${GREEN}✓${NC} $container_name está escuchando en puerto $port"
      else
        echo -e "${RED}✗${NC} $container_name NO está escuchando en puerto $port"
      fi
    else
      echo -e "${RED}✗${NC} $container_name no está corriendo"
    fi
  else
    echo -e "${RED}✗${NC} $container_name no existe"
  fi
done
echo ""

echo "📋 ÚLTIMAS 20 LÍNEAS DE LOGS DE CADA SERVICIO"
echo "=============================================="
for service_info in "${SERVICES[@]}"; do
  IFS=':' read -r container_name port <<< "$service_info"
  
  echo ""
  echo -e "${YELLOW}--- $container_name ---${NC}"
  
  if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
    docker logs "$container_name" --tail 20 2>&1 | tail -20
  else
    echo -e "${RED}Contenedor no está corriendo${NC}"
    echo "Logs del último intento:"
    docker logs "$container_name" --tail 20 2>&1 | tail -20
  fi
done

echo ""
echo "🔍 ERRORES ESPECÍFICOS"
echo "======================"

for service_info in "${SERVICES[@]}"; do
  IFS=':' read -r container_name port <<< "$service_info"
  
  if docker ps -a --format '{{.Names}}' | grep -q "^${container_name}$"; then
    errors=$(docker logs "$container_name" 2>&1 | grep -iE "error|failed|exception|econnrefused|cannot|unable" | tail -5)
    
    if [ -n "$errors" ]; then
      echo ""
      echo -e "${RED}Errores en $container_name:${NC}"
      echo "$errors"
    fi
  fi
done

echo ""
echo "🌐 CONECTIVIDAD ENTRE SERVICIOS"
echo "================================"

# Test desde API Gateway hacia otros servicios
if docker ps --format '{{.Names}}' | grep -q "^bookly-api-gateway$"; then
  echo "Testing desde API Gateway:"
  
  for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r container_name port <<< "$service_info"
    
    if [ "$container_name" != "bookly-api-gateway" ]; then
      # Extraer el nombre del servicio sin prefijo y sufijo
      service_name=$(echo "$container_name" | sed 's/bookly-//' | sed 's/-service//')
      hostname="${service_name}-service"
      
      # Test de conectividad
      if docker exec bookly-api-gateway sh -c "command -v nc >/dev/null 2>&1" 2>/dev/null; then
        if docker exec bookly-api-gateway nc -zv "$hostname" "$port" 2>&1 | grep -q "open"; then
          echo -e "${GREEN}✓${NC} API Gateway → $hostname:$port (OK)"
        else
          echo -e "${RED}✗${NC} API Gateway → $hostname:$port (FAIL)"
        fi
      else
        echo -e "${YELLOW}⚠${NC} nc no disponible en API Gateway"
        break
      fi
    fi
  done
fi

echo ""
echo "💾 USO DE RECURSOS"
echo "=================="
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep bookly

echo ""
echo "🔍 VERIFICACIÓN DE DATABASE_URL"
echo "================================"
for service_info in "${SERVICES[@]}"; do
  IFS=':' read -r container_name port <<< "$service_info"
  
  if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
    db_url=$(docker exec "$container_name" sh -c 'echo $DATABASE_URL' 2>/dev/null || echo "N/A")
    
    if [[ "$db_url" == *"localhost"* ]]; then
      echo -e "${RED}✗ $container_name: DATABASE_URL usa localhost (INCORRECTO)${NC}"
      echo "   $db_url"
    elif [[ "$db_url" == *"mongodb-primary"* ]]; then
      echo -e "${GREEN}✓ $container_name: DATABASE_URL correcto${NC}"
    else
      echo -e "${YELLOW}⚠ $container_name: DATABASE_URL: $db_url${NC}"
    fi
  fi
done

echo ""
echo "✅ DIAGNÓSTICO COMPLETO"
echo "======================="
echo "Si los servicios no están escuchando en sus puertos, revisa:"
echo "1. Los logs de errores arriba"
echo "2. DATABASE_URL debe usar mongodb-primary, no localhost"
echo "3. Los servicios deben estar 'Up' no 'Restarting'"
echo "4. Conectividad entre contenedores debe funcionar"
