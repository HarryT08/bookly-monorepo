#!/bin/bash

# Script para verificar conexiones a servicios de infraestructura
# Bookly Backend - Connection Verification Script

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Bookly Infrastructure Connection Verification${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Función para verificar si un contenedor está corriendo
check_container() {
    local container_name=$1
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        echo -e "${GREEN}✓${NC} Container ${container_name} is running"
        return 0
    else
        echo -e "${RED}✗${NC} Container ${container_name} is NOT running"
        return 1
    fi
}

# Función para verificar Redis
check_redis() {
    echo -e "\n${YELLOW}Checking Redis...${NC}"
    
    if ! check_container "bookly-redis"; then
        return 1
    fi
    
    # Verificar conexión con contraseña
    if docker exec bookly-redis redis-cli -a bookly123 ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Redis authentication successful"
        
        # Contar clientes conectados
        local client_count=$(docker exec bookly-redis redis-cli -a bookly123 CLIENT LIST 2>/dev/null | grep -c "node-redis" || echo "0")
        local total_clients=$(docker exec bookly-redis redis-cli -a bookly123 CLIENT LIST 2>/dev/null | wc -l | xargs)
        
        echo -e "${GREEN}✓${NC} Redis has ${client_count} node-redis clients (${total_clients} total connections)"
        
        if [ "$client_count" -lt 5 ]; then
            echo -e "${YELLOW}⚠${NC} Warning: Expected 6 node-redis clients (one per service), found ${client_count}"
            echo -e "  ${BLUE}↳${NC} Some microservices may not be connected to Redis"
        else
            echo -e "${GREEN}✓${NC} All microservices appear to be connected"
        fi
        
        # Verificar estadísticas
        local rejected=$(docker exec bookly-redis redis-cli -a bookly123 INFO stats 2>/dev/null | grep "rejected_connections" | cut -d: -f2 | tr -d '\r')
        if [ "$rejected" != "0" ]; then
            echo -e "${RED}✗${NC} Redis has rejected ${rejected} connections"
            echo -e "  ${BLUE}↳${NC} Check maxclients configuration or connection pool settings"
        fi
    else
        echo -e "${RED}✗${NC} Redis authentication failed"
        return 1
    fi
}

# Función para verificar RabbitMQ
check_rabbitmq() {
    echo -e "\n${YELLOW}Checking RabbitMQ...${NC}"
    
    if ! check_container "bookly-rabbitmq"; then
        return 1
    fi
    
    # Verificar conexiones
    local connection_count=$(docker exec bookly-rabbitmq rabbitmqctl list_connections 2>/dev/null | grep -c "bookly" || echo "0")
    echo -e "${GREEN}✓${NC} RabbitMQ has ${connection_count} connections"
    
    if [ "$connection_count" -lt 5 ]; then
        echo -e "${YELLOW}⚠${NC} Warning: Expected ~6 connections (one per service), found ${connection_count}"
    fi
    
    # Verificar vhost
    if docker exec bookly-rabbitmq rabbitmqctl list_vhosts 2>/dev/null | grep -q "/bookly"; then
        echo -e "${GREEN}✓${NC} RabbitMQ vhost '/bookly' exists"
    else
        echo -e "${RED}✗${NC} RabbitMQ vhost '/bookly' not found"
    fi
}

# Función para verificar MongoDB
check_mongodb() {
    echo -e "\n${YELLOW}Checking MongoDB...${NC}"
    
    if ! check_container "bookly-mongodb-primary"; then
        return 1
    fi
    
    # Verificar replica set status
    if docker exec bookly-mongodb-primary mongosh --quiet --eval "rs.status().ok" 2>/dev/null | grep -q "1"; then
        echo -e "${GREEN}✓${NC} MongoDB replica set is healthy"
        
        # Contar miembros del replica set
        local member_count=$(docker exec bookly-mongodb-primary mongosh --quiet --eval "rs.status().members.length" 2>/dev/null)
        echo -e "${GREEN}✓${NC} MongoDB has ${member_count} replica set members"
        
        # Verificar estado de cada miembro
        docker exec bookly-mongodb-primary mongosh --quiet --eval "
            rs.status().members.forEach(function(member) {
                print(member.name + ' - ' + member.stateStr);
            })
        " 2>/dev/null | while read -r line; do
            echo -e "  ${GREEN}•${NC} ${line}"
        done
    else
        echo -e "${RED}✗${NC} MongoDB replica set check failed"
        return 1
    fi
}

# Función para verificar health endpoints de microservicios
check_service_health() {
    local service_name=$1
    local port=$2
    
    echo -e "\n${YELLOW}Checking ${service_name}...${NC}"
    
    local health_url="http://localhost:${port}/api/v1/health"
    local response=$(curl -s -w "\n%{http_code}" "${health_url}" 2>/dev/null || echo "000")
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓${NC} ${service_name} is healthy (HTTP ${http_code})"
        
        # Verificar componentes específicos
        if echo "$body" | grep -q '"redis"'; then
            if echo "$body" | grep -q '"redis":{"status":"up"'; then
                echo -e "  ${GREEN}✓${NC} Redis connection: UP"
            else
                echo -e "  ${RED}✗${NC} Redis connection: DOWN"
            fi
        fi
        
        if echo "$body" | grep -q '"rabbitmq"'; then
            if echo "$body" | grep -q '"rabbitmq":{"status":"up"'; then
                echo -e "  ${GREEN}✓${NC} RabbitMQ connection: UP"
            else
                echo -e "  ${RED}✗${NC} RabbitMQ connection: DOWN"
            fi
        fi
        
        if echo "$body" | grep -q '"database"'; then
            if echo "$body" | grep -q '"database":{"status":"up"'; then
                echo -e "  ${GREEN}✓${NC} Database connection: UP"
            else
                echo -e "  ${RED}✗${NC} Database connection: DOWN"
            fi
        fi
    elif [ "$http_code" = "503" ]; then
        echo -e "${RED}✗${NC} ${service_name} is unhealthy (HTTP 503)"
        echo -e "  ${YELLOW}↳${NC} Some dependencies may be down"
    elif [ "$http_code" = "000" ]; then
        echo -e "${YELLOW}⚠${NC} ${service_name} is not running or not reachable"
    else
        echo -e "${YELLOW}⚠${NC} ${service_name} returned HTTP ${http_code}"
    fi
}

# Verificar archivo .env
check_env_file() {
    echo -e "\n${YELLOW}Checking .env configuration...${NC}"
    
    if [ ! -f .env ]; then
        echo -e "${YELLOW}⚠${NC} .env file not found"
        echo -e "  ${BLUE}↳${NC} Copy from .env.example: cp .env.example .env"
        return 1
    fi
    
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Verificar variables críticas
    if grep -q "REDIS_PASSWORD=bookly123" .env 2>/dev/null; then
        echo -e "${GREEN}✓${NC} REDIS_PASSWORD is configured"
    else
        echo -e "${RED}✗${NC} REDIS_PASSWORD is missing or incorrect"
        echo -e "  ${BLUE}↳${NC} Should be: REDIS_PASSWORD=bookly123"
    fi
    
    if grep -q "RABBITMQ_PASSWORD=bookly123" .env 2>/dev/null; then
        echo -e "${GREEN}✓${NC} RABBITMQ_PASSWORD is configured"
    else
        echo -e "${RED}✗${NC} RABBITMQ_PASSWORD is missing or incorrect"
        echo -e "  ${BLUE}↳${NC} Should be: RABBITMQ_PASSWORD=bookly123"
    fi
    
    if grep -q "RABBITMQ_VHOST=/bookly" .env 2>/dev/null; then
        echo -e "${GREEN}✓${NC} RABBITMQ_VHOST is configured"
    else
        echo -e "${YELLOW}⚠${NC} RABBITMQ_VHOST may need update"
        echo -e "  ${BLUE}↳${NC} Should be: RABBITMQ_VHOST=/bookly"
    fi
}

# Main execution
main() {
    # Verificar configuración
    check_env_file
    
    # Verificar servicios de infraestructura
    check_redis
    check_rabbitmq
    check_mongodb
    
    # Verificar microservicios (si están corriendo)
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE}  Microservices Health Checks${NC}"
    echo -e "${BLUE}================================================${NC}"
    
    check_service_health "API Gateway" "3000"
    check_service_health "Auth Service" "3001"
    check_service_health "Availability Service" "3002"
    check_service_health "Resources Service" "3003"
    check_service_health "Stockpile Service" "3004"
    check_service_health "Reports Service" "3005"
    
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${GREEN}Verification complete!${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
    echo -e "For more details, check: ${BLUE}docs/INFRASTRUCTURE_CONNECTION_ISSUES.md${NC}"
    echo ""
}

# Cambiar al directorio del script
cd "$(dirname "$0")/.."

# Ejecutar
main
