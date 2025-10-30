#!/bin/bash

# =============================================================================
# Bookly Development Environment Setup
# Configuración rápida para desarrollo local
# =============================================================================

set -e

# Configuración de colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Directorios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

log_info "🚀 Configurando entorno de desarrollo Bookly..."

# 1. Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instálalo primero."
    exit 1
fi

# 2. Crear archivo .env.docker si no existe
if [[ ! -f "$INFRA_DIR/.env.docker" ]]; then
    log_info "Creando archivo .env.docker..."
    cp "$INFRA_DIR/.env.docker.example" "$INFRA_DIR/.env.docker"
    log_warning "Revisa y configura el archivo .env.docker antes de continuar"
fi

# 3. Generar keyfile para MongoDB
log_info "Generando keyfile para MongoDB..."
mkdir -p "$INFRA_DIR/mongodb/keyfile"
if [[ ! -f "$INFRA_DIR/mongodb/keyfile/mongodb-keyfile" ]]; then
    openssl rand -base64 756 > "$INFRA_DIR/mongodb/keyfile/mongodb-keyfile"
    chmod 400 "$INFRA_DIR/mongodb/keyfile/mongodb-keyfile"
fi

# 4. Crear redes Docker
log_info "Creando redes Docker..."
docker network create bookly-network 2>/dev/null || true
docker network create bookly-observability 2>/dev/null || true

# 5. Iniciar servicios base
log_info "Iniciando servicios base (MongoDB, Redis, RabbitMQ)..."
"$SCRIPT_DIR/bookly-docker.sh" start base

# 6. Esperar que los servicios estén listos
log_info "Esperando que los servicios base estén listos..."
sleep 30

# 7. Verificar salud
log_info "Verificando salud de los servicios..."
"$SCRIPT_DIR/bookly-docker.sh" health

# 8. Mostrar información útil
log_success "🎉 Entorno de desarrollo configurado!"
echo
echo "📋 Servicios disponibles:"
echo "   • MongoDB: mongodb://localhost:27017,27018,27019"
echo "   • Redis: redis://localhost:6379"
echo "   • RabbitMQ: amqp://localhost:5672"
echo "   • RabbitMQ Management: http://localhost:15672"
echo
echo "🔧 Comandos útiles:"
echo "   • Ver logs: ./bookly-docker.sh logs"
echo "   • Estado: ./bookly-docker.sh status"
echo "   • Detener: ./bookly-docker.sh stop base"
echo "   • Iniciar observabilidad: ./bookly-docker.sh start observability"
echo "   • Ejecutar semillas: ./bookly-docker.sh seed"
echo
echo "📚 Credenciales por defecto:"
echo "   • MongoDB: bookly / bookly123"
echo "   • Redis: bookly123"
echo "   • RabbitMQ: bookly / bookly123"
echo
log_warning "Recuerda configurar las variables de entorno en .env.docker antes de iniciar los microservicios"
