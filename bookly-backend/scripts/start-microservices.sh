#!/bin/bash

# Script para iniciar microservicios de Bookly en host
# Conectando a servicios base en Docker

set -e

# Configuración de colores para logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Directorio base del proyecto
PROJECT_ROOT="/Users/henderorlando/Documents/GitHub/bookly-monorepo/bookly-backend"
ENV_FILE="$PROJECT_ROOT/.env.host"

# Verificar que existe el archivo .env.host
if [ ! -f "$ENV_FILE" ]; then
    log_error "Archivo .env.host no encontrado en: $ENV_FILE"
    exit 1
fi

# Función para verificar conectividad a servicios base
check_base_services() {
    log_info "Verificando conectividad a servicios base en Docker..."
    
    # MongoDB
    if nc -z localhost 27017; then
        log_success "MongoDB: ✓ Disponible en puerto 27017"
    else
        log_error "MongoDB: ✗ No disponible en puerto 27017"
        return 1
    fi
    
    # Redis
    if nc -z localhost 6379; then
        log_success "Redis: ✓ Disponible en puerto 6379"
    else
        log_error "Redis: ✗ No disponible en puerto 6379"
        return 1
    fi
    
    # RabbitMQ
    if nc -z localhost 5672; then
        log_success "RabbitMQ: ✓ Disponible en puerto 5672"
    else
        log_error "RabbitMQ: ✗ No disponible en puerto 5672"
        return 1
    fi
    
    return 0
}

# Función para iniciar un microservicio
start_microservice() {
    local service_name=$1
    local port=$2
    local npm_script=$3
    
    log_info "Iniciando $service_name en puerto $port..."
    
    # Verificar si el puerto ya está en uso
    if nc -z localhost $port; then
        log_warning "$service_name ya está ejecutándose en puerto $port"
        return 0
    fi
    
    # Cambiar al directorio del proyecto
    cd "$PROJECT_ROOT"
    
    # Copiar archivo de configuración host si no existe .env
    if [ ! -f ".env" ]; then
        log_info "Copiando configuración host a .env"
        cp .env.host .env
    fi
    
    # Instalar dependencias si es necesario
    if [ ! -d "node_modules" ]; then
        log_info "Instalando dependencias..."
        npm install
    fi
    
    # Generar cliente Prisma
    log_info "Generando cliente Prisma..."
    npx prisma generate
    
    # Iniciar el microservicio en background
    log_info "Ejecutando: npm run $npm_script"
    nohup npm run $npm_script > "logs/${service_name}.log" 2>&1 &
    local pid=$!
    
    # Guardar PID para poder detener el servicio después
    echo $pid > "pids/${service_name}.pid"
    
    # Esperar un momento y verificar que el servicio esté ejecutándose
    sleep 3
    
    if kill -0 $pid 2>/dev/null; then
        if nc -z localhost $port; then
            log_success "$service_name iniciado correctamente en puerto $port (PID: $pid)"
            return 0
        else
            log_warning "$service_name iniciado pero no responde en puerto $port (PID: $pid)"
            return 1
        fi
    else
        log_error "$service_name falló al iniciar"
        return 1
    fi
}

# Función para detener todos los microservicios
stop_microservices() {
    log_info "Deteniendo microservicios..."
    
    cd "$PROJECT_ROOT"
    
    if [ -d "pids" ]; then
        for pidfile in pids/*.pid; do
            if [ -f "$pidfile" ]; then
                local service_name=$(basename "$pidfile" .pid)
                local pid=$(cat "$pidfile")
                
                if kill -0 $pid 2>/dev/null; then
                    log_info "Deteniendo $service_name (PID: $pid)"
                    kill $pid
                    rm "$pidfile"
                else
                    log_warning "$service_name ya no está ejecutándose"
                    rm "$pidfile"
                fi
            fi
        done
    fi
}

# Función para verificar estado de microservicios
status_microservices() {
    log_info "Estado de microservicios:"
    
    # Lista de servicios y sus puertos
    local services="api-gateway:3000 auth-service:3001 resources-service:3002 availability-service:3003 stockpile-service:3004 reports-service:3005"
    
    for service_port in $services; do
        local service_name=$(echo $service_port | cut -d: -f1)
        local port=$(echo $service_port | cut -d: -f2)
        
        if nc -z localhost $port; then
            log_success "$service_name: ✓ Activo en puerto $port"
        else
            log_warning "$service_name: ✗ Inactivo en puerto $port"
        fi
    done
}

# Función principal para iniciar todos los microservicios
start_all() {
    log_info "=== Iniciando Stack de Microservicios Bookly ==="
    
    # Verificar servicios base
    if ! check_base_services; then
        log_error "Servicios base no disponibles. Ejecute primero: docker-compose -f docker-compose.base.yml up -d"
        exit 1
    fi
    
    # Crear directorios necesarios
    cd "$PROJECT_ROOT"
    mkdir -p logs pids
    
    # Iniciar microservicios uno por uno
    log_info "Iniciando microservicios..."
    
    # API Gateway debe iniciarse primero como puerta de entrada
    start_microservice "api-gateway" "3000" "start:gateway"
    sleep 3
    
    start_microservice "auth-service" "3001" "start:auth"
    sleep 2
    
    start_microservice "resources-service" "3002" "start:resources"
    sleep 2
    
    start_microservice "availability-service" "3003" "start:availability"
    sleep 2
    
    start_microservice "stockpile-service" "3004" "start:stockpile"
    sleep 2
    
    start_microservice "reports-service" "3005" "start:reports"
    sleep 2
    
    log_success "=== Microservicios iniciados ==="
    status_microservices
    
    log_info "Logs disponibles en: $PROJECT_ROOT/logs/"
    log_info "PIDs guardados en: $PROJECT_ROOT/pids/"
    log_info "Para detener: $0 stop"
}

# Función para mostrar logs de un servicio específico
logs() {
    local service_name=$1
    local log_file="$PROJECT_ROOT/logs/${service_name}.log"
    
    if [ -f "$log_file" ]; then
        tail -f "$log_file"
    else
            log_error "Log no encontrado: $log_file"
        log_info "Servicios disponibles: api-gateway, auth-service, resources-service, availability-service, stockpile-service, reports-service"
    fi
}

# Función para reiniciar un servicio específico
restart_service() {
{{ ... }}
    local pidfile="$PROJECT_ROOT/pids/${service_name}.pid"
    
    if [ -f "$pidfile" ]; then
        local pid=$(cat "$pidfile")
        if kill -0 $pid 2>/dev/null; then
            log_info "Deteniendo $service_name (PID: $pid)"
            kill $pid
        fi
        rm "$pidfile"
    fi
    
    # Reiniciar según el servicio
    case $service_name in
        "api-gateway")
            start_microservice "api-gateway" "3000" "start:gateway"
            ;;
        "auth-service")
            start_microservice "auth-service" "3001" "start:auth"
            ;;
        "resources-service")
            start_microservice "resources-service" "3002" "start:resources"
            ;;
        "availability-service")
            start_microservice "availability-service" "3003" "start:availability"
            ;;
        "stockpile-service")
            start_microservice "stockpile-service" "3004" "start:stockpile"
            ;;
        "reports-service")
            start_microservice "reports-service" "3005" "start:reports"
            ;;
        *)
            log_error "Servicio desconocido: $service_name"
            log_info "Servicios disponibles: api-gateway, auth-service, resources-service, availability-service, stockpile-service, reports-service"
            ;;
    esac
}

# Función de ayuda
show_help() {
    echo "Uso: $0 [COMANDO] [ARGUMENTOS]"
    echo ""
    echo "COMANDOS:"
    echo "  start           Iniciar todos los microservicios"
    echo "  stop            Detener todos los microservicios"
    echo "  status          Mostrar estado de todos los microservicios"
    echo "  restart [NAME]  Reiniciar un microservicio específico"
    echo "  logs [NAME]     Mostrar logs de un microservicio específico"
    echo "  check           Verificar conectividad a servicios base"
    echo "  help            Mostrar esta ayuda"
    echo ""
    echo "EJEMPLOS:"
    echo "  $0 start                    # Iniciar todos los servicios"
    echo "  $0 logs auth-service        # Ver logs de auth-service"
    echo "  $0 restart resources-service # Reiniciar resources-service"
    echo ""
    echo "SERVICIOS DISPONIBLES:"
    echo "  api-gateway (puerto 3000) - Puerta de entrada principal"
    echo "  auth-service (puerto 3001) - Gestión de autenticación y autorización"
    echo "  resources-service (puerto 3002) - Gestión de recursos institucionales"
    echo "  availability-service (puerto 3003) - Gestión de disponibilidad de recursos"
    echo "  stockpile-service (puerto 3004) - Gestión de inventario de recursos"
    echo "  reports-service (puerto 3005) - Generación de informes y reportes"
}

# Main
case "${1:-start}" in
    "start")
        start_all
        ;;
    "stop")
        stop_microservices
        ;;
    "status")
        status_microservices
        ;;
    "check")
        check_base_services
        ;;
    "restart")
        if [ -z "$2" ]; then
            log_error "Especifica el nombre del servicio a reiniciar"
            show_help
            exit 1
        fi
        restart_service "$2"
        ;;
    "logs")
        if [ -z "$2" ]; then
            log_error "Especifica el nombre del servicio para ver logs"
            show_help
            exit 1
        fi
        logs "$2"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        log_error "Comando desconocido: $1"
        show_help
        exit 1
        ;;
esac
