#!/bin/bash
# Script para automatizar el despliegue de la infraestructura de Bookly

set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar requisitos previos
echo -e "${YELLOW}Verificando requisitos...${NC}"

# Verificar que Pulumi esté instalado
if ! command -v pulumi &> /dev/null; then
    echo -e "${RED}Error: Pulumi no está instalado. Visite https://www.pulumi.com/docs/get-started/install/${NC}"
    exit 1
fi

# Verificar que kubectl esté instalado
if ! command -v kubectl &> /dev/null; then
    echo -e "${YELLOW}Advertencia: kubectl no está instalado. Puede ser necesario para operaciones de diagnóstico.${NC}"
fi

# Moverse al directorio de infraestructura
cd "$(dirname "$0")/../pulumi"

# Verificar si es un despliegue inicial o una actualización
STACK_NAME="${BOOKLY_ENV:-dev}"
if ! pulumi stack select $STACK_NAME &> /dev/null; then
    echo -e "${YELLOW}Creando stack '$STACK_NAME'...${NC}"
    pulumi stack init $STACK_NAME
fi

# Ejecutar Pulumi update
echo -e "${GREEN}Desplegando infraestructura para stack '$STACK_NAME'...${NC}"

if [ "$1" == "--preview" ]; then
    pulumi preview
else
    pulumi up --yes
fi

echo -e "${GREEN}Infraestructura desplegada correctamente${NC}"
