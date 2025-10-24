#!/bin/sh
set -e

# Colores para logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${GREEN}🚀 Starting Bookly Microservice: ${SERVICE_NAME}${NC}"

# Crear directorios necesarios si no existen
echo "${YELLOW}📁 Setting up directories...${NC}"
mkdir -p /app/logs
mkdir -p /app/uploads
mkdir -p /app/templates
mkdir -p /app/documents
mkdir -p /app/exports

# Ajustar permisos para el usuario bookly (UID 1001)
echo "${YELLOW}🔐 Fixing permissions...${NC}"
chown -R bookly:bookly /app/logs 2>/dev/null || true
chown -R bookly:bookly /app/uploads 2>/dev/null || true
chown -R bookly:bookly /app/templates 2>/dev/null || true
chown -R bookly:bookly /app/documents 2>/dev/null || true
chown -R bookly:bookly /app/exports 2>/dev/null || true

# Cambiar al usuario bookly y ejecutar el comando
echo "${GREEN}👤 Switching to user 'bookly'...${NC}"
echo "${GREEN}🎯 Executing: $@${NC}"

# Usar dumb-init para manejar señales correctamente
exec dumb-init su-exec bookly "$@"
