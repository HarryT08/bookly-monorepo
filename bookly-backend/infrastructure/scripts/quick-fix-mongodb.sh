#!/bin/bash

# =============================================================================
# Quick Fix MongoDB Keyfile - Bookly (Para GCP)
# Solución rápida de un solo comando
# =============================================================================

set -e

echo "🔧 Fix rápido de MongoDB Keyfile..."

# 1. Detener MongoDB
echo "⏹️  Deteniendo MongoDB..."
docker compose -f docker-compose.base.yml stop mongodb-primary mongodb-secondary1 mongodb-secondary2 mongodb-init 2>/dev/null || true

# 2. Regenerar keyfile
echo "🔑 Generando nuevo keyfile..."
mkdir -p mongodb/keyfile
openssl rand -base64 756 | tr -d '\n' > mongodb/keyfile/mongodb-keyfile
chmod 400 mongodb/keyfile/mongodb-keyfile

# 3. Verificar formato
LINES=$(wc -l < mongodb/keyfile/mongodb-keyfile | tr -d ' ')
SIZE=$(wc -c < mongodb/keyfile/mongodb-keyfile | tr -d ' ')

echo "✓ Keyfile generado:"
echo "  - Líneas: $LINES (debe ser 0)"
echo "  - Tamaño: $SIZE caracteres"
echo "  - Permisos: $(ls -l mongodb/keyfile/mongodb-keyfile | awk '{print $1}')"

if [[ $LINES -ne 0 ]]; then
    echo "❌ ERROR: Keyfile tiene saltos de línea"
    exit 1
fi

if [[ $SIZE -lt 6 ]] || [[ $SIZE -gt 1024 ]]; then
    echo "❌ ERROR: Keyfile tiene tamaño incorrecto"
    exit 1
fi

# 4. Limpiar volúmenes de keyfile
echo "🧹 Limpiando volúmenes de keyfile..."
docker volume rm infrastructure_mongodb_keyfile 2>/dev/null || true
docker volume rm infrastructure_mongodb_keyfile_secondary1 2>/dev/null || true
docker volume rm infrastructure_mongodb_keyfile_secondary2 2>/dev/null || true

# 5. Iniciar MongoDB
echo "▶️  Iniciando MongoDB..."
docker compose -f docker-compose.base.yml up -d mongodb-primary mongodb-secondary1 mongodb-secondary2

# 6. Esperar inicialización
echo "⏳ Esperando inicialización (40 segundos)..."
sleep 40

# 7. Iniciar mongodb-init
echo "🔄 Iniciando configuración de replica set..."
docker compose -f docker-compose.base.yml up -d mongodb-init

# 8. Reiniciar nginx si está corriendo (fix host.docker.internal)
if docker ps | grep -q bookly-nginx; then
    echo "🔄 Reiniciando nginx..."
    docker compose -f docker-compose.base.yml restart nginx
fi

# 8. Verificar estado
echo ""
echo "✅ Fix aplicado. Verificando estado..."
sleep 5

docker ps | grep mongodb
echo ""
echo "📋 Para ver logs: docker logs bookly-mongodb-primary -f"
echo "🔍 Para verificar replica set: docker exec bookly-mongodb-primary mongosh -u bookly -p bookly123 --authenticationDatabase admin --eval 'rs.status()'"
