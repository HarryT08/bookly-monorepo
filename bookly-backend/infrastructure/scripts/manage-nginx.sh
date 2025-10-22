#!/bin/bash

# =============================================================================
# Gestión de Nginx - Bookly Backend
# Permite iniciar/detener nginx de forma independiente
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

ACTION=${1:-status}

case $ACTION in
    start)
        log_info "🚀 Iniciando Nginx..."
        
        # Verificar si los microservicios están corriendo
        if ! docker ps --format '{{.Names}}' | grep -q "bookly.*gateway\|bookly.*auth\|bookly.*resources"; then
            log_warning "⚠️  Los microservicios NO están corriendo."
            log_warning "⚠️  Nginx intentará conectarse y puede mostrar errores."
            echo ""
            read -p "¿Deseas iniciar Nginx de todas formas? (s/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Ss]$ ]]; then
                log_info "Operación cancelada"
                exit 0
            fi
        fi
        
        cd "$INFRA_DIR"
        docker compose -f docker-compose.base.yml up -d nginx
        log_success "✅ Nginx iniciado"
        ;;
        
    stop)
        log_info "⏹️  Deteniendo Nginx..."
        cd "$INFRA_DIR"
        docker compose -f docker-compose.base.yml stop nginx
        log_success "✅ Nginx detenido"
        ;;
        
    restart)
        log_info "🔄 Reiniciando Nginx..."
        cd "$INFRA_DIR"
        docker compose -f docker-compose.base.yml restart nginx
        log_success "✅ Nginx reiniciado"
        ;;
        
    status)
        log_info "📊 Estado de Nginx:"
        echo ""
        
        if docker ps --format '{{.Names}}' | grep -q "bookly-nginx"; then
            log_success "✅ Nginx está CORRIENDO"
            docker ps --filter "name=bookly-nginx" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        elif docker ps -a --format '{{.Names}}' | grep -q "bookly-nginx"; then
            log_warning "⚠️  Nginx está DETENIDO"
            docker ps -a --filter "name=bookly-nginx" --format "table {{.Names}}\t{{.Status}}"
        else
            log_error "❌ Nginx NO EXISTE"
        fi
        
        echo ""
        log_info "Microservicios disponibles:"
        SERVICES=$(docker ps --format '{{.Names}}' | grep -E "gateway|auth|resources|availability|stockpile|reports" || echo "ninguno")
        if [[ "$SERVICES" == "ninguno" ]]; then
            log_warning "⚠️  No hay microservicios corriendo"
        else
            echo "$SERVICES" | while read -r service; do
                echo "  ✅ $service"
            done
        fi
        ;;
        
    logs)
        log_info "📋 Logs de Nginx:"
        docker logs bookly-nginx -f
        ;;
        
    errors)
        log_info "🔍 Buscando errores en logs de Nginx:"
        echo ""
        
        if ! docker ps --format '{{.Names}}' | grep -q "bookly-nginx"; then
            log_error "❌ Nginx no está corriendo"
            exit 1
        fi
        
        # Buscar errores comunes
        echo "Errores de host not found:"
        docker logs bookly-nginx 2>&1 | grep -i "host not found" | tail -10 || echo "  (ninguno)"
        
        echo ""
        echo "Errores de upstream:"
        docker logs bookly-nginx 2>&1 | grep -i "upstream" | grep -i "error" | tail -10 || echo "  (ninguno)"
        
        echo ""
        echo "Errores críticos [emerg]:"
        docker logs bookly-nginx 2>&1 | grep "\[emerg\]" | tail -10 || echo "  (ninguno)"
        ;;
        
    *)
        echo "Uso: $0 {start|stop|restart|status|logs|errors}"
        echo ""
        echo "Comandos:"
        echo "  start   - Iniciar Nginx (pregunta si microservicios no están corriendo)"
        echo "  stop    - Detener Nginx"
        echo "  restart - Reiniciar Nginx"
        echo "  status  - Ver estado de Nginx y microservicios"
        echo "  logs    - Ver logs en tiempo real"
        echo "  errors  - Buscar errores en logs"
        exit 1
        ;;
esac
