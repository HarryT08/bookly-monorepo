#!/bin/bash
# Script para configurar el entorno de desarrollo/producción de Bookly

set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Determinar el entorno
ENV="${1:-dev}"
VALID_ENVS=("dev" "test" "staging" "prod")

if [[ ! " ${VALID_ENVS[*]} " =~ " ${ENV} " ]]; then
    echo -e "${RED}Entorno no válido. Opciones: dev, test, staging, prod${NC}"
    exit 1
fi

echo -e "${GREEN}Configurando entorno: ${ENV}${NC}"

# Crear archivo de variables de entorno
CONFIG_DIR="$(dirname "$0")/../config"
mkdir -p $CONFIG_DIR

# Generar archivo de configuración
cat > $CONFIG_DIR/$ENV.env <<EOL
# Configuración general
NODE_ENV=${ENV}
PORT=3000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/bookly?retryWrites=true&w=majority

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=change_this_in_production
JWT_EXPIRATION=1d

# Logging
LOG_LEVEL=${ENV == "prod" ? "info" : "debug"}

# API Gateway
API_GATEWAY_URL=http://localhost:3000

# Servicios
AUTH_SERVICE_URL=http://localhost:3001
RESOURCES_SERVICE_URL=http://localhost:3002
AVAILABILITY_SERVICE_URL=http://localhost:3003
STOCKPILE_SERVICE_URL=http://localhost:3004
REPORTS_SERVICE_URL=http://localhost:3005
EOL

echo -e "${YELLOW}Archivo de configuración generado en $CONFIG_DIR/$ENV.env${NC}"
echo -e "${YELLOW}IMPORTANTE: Edite este archivo para agregar valores reales de secretos y configuraciones.${NC}"

# Configurar variables de entorno para Pulumi
echo -e "${GREEN}Configurando variables de Pulumi para stack '$ENV'...${NC}"

# Verificar si existe el stack
if ! pulumi stack ls | grep -q "$ENV"; then
    echo -e "${YELLOW}Creando stack '$ENV'...${NC}"
    pulumi stack init $ENV
fi

# Seleccionar el stack
pulumi stack select $ENV

# Configurar variables
echo -e "${YELLOW}Configurando variables para el stack...${NC}"
pulumi config set environment $ENV
pulumi config set mongodb-atlas-org-id "org-id-example" --plaintext

echo -e "${YELLOW}Para configurar secretos, use:${NC}"
echo "pulumi config set --secret mongodb-atlas-public-key YOUR_KEY"
echo "pulumi config set --secret mongodb-atlas-private-key YOUR_KEY"
echo "pulumi config set --secret mongodb-user-password YOUR_PASSWORD"

echo -e "${GREEN}Entorno configurado correctamente${NC}"
