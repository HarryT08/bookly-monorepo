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
    
    # Crear directorios si no existen
    mkdir -p scripts/pids scripts/logs
    
    # Iniciar el microservicio en background
    log_info "Ejecutando: npm run $npm_script"
    nohup npm run $npm_script > "scripts/logs/${service_name}.log" 2>&1 &
    local pid=$!
    
    # Guardar PID para poder detener el servicio después
    echo $pid > "scripts/pids/${service_name}.pid"
    
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

# Función para iniciar un microservicio en paralelo
start_microservice_parallel() {
    local service_name=$1
    local port=$2
    local npm_script=$3
    local status_file="$PROJECT_ROOT/scripts/status/${service_name}.status"
    
    # Verificar si el puerto ya está en uso
    if nc -z localhost $port; then
        echo "RUNNING:$service_name ya está ejecutándose en puerto $port" > "$status_file"
        return 0
    fi
    
    # Cambiar al directorio del proyecto
    cd "$PROJECT_ROOT"
    
    # Iniciar el microservicio en background
    nohup npm run $npm_script > "scripts/logs/${service_name}.log" 2>&1 &
    local pid=$!
    
    # Guardar PID
    echo $pid > "scripts/pids/${service_name}.pid"
    
    # Esperar hasta 30 segundos para que el servicio se inicie
    local max_wait=30
    local waited=0
    local service_started=false
    
    while [ $waited -lt $max_wait ]; do
        sleep 1
        waited=$((waited + 1))
        
        # Verificar si el proceso sigue vivo
        if ! kill -0 $pid 2>/dev/null; then
            local error_msg=$(tail -n 5 "scripts/logs/${service_name}.log" | tr '\n' ' ')
            echo "ERROR:$service_name falló al iniciar. Error: $error_msg" > "$status_file"
            return 1
        fi
        
        # Verificar si el puerto está disponible
        if nc -z localhost $port; then
            echo "SUCCESS:$service_name iniciado correctamente en puerto $port (PID: $pid)" > "$status_file"
            service_started=true
            break
        fi
    done
    
    if [ "$service_started" = false ]; then
        echo "TIMEOUT:$service_name no respondió en puerto $port después de ${max_wait}s (PID: $pid)" > "$status_file"
        return 1
    fi
    
    return 0
}

# Función para esperar y mostrar el status de todos los servicios
wait_for_all_services() {
    local services="$1"
    local max_total_wait=60  # 60 segundos máximo total
    local waited=0
    local all_completed=false
    
    log_info "Esperando a que todos los microservicios se inicien..."
    
    # Mostrar progreso
    while [ $waited -lt $max_total_wait ] && [ "$all_completed" = false ]; do
        sleep 2
        waited=$((waited + 2))
        
        local completed_count=0
        local total_count=0
        
        for service_port in $services; do
            local service_name=$(echo $service_port | cut -d: -f1)
            total_count=$((total_count + 1))
            
            if [ -f "$PROJECT_ROOT/scripts/status/${service_name}.status" ]; then
                completed_count=$((completed_count + 1))
            fi
        done
        
        if [ $completed_count -eq $total_count ]; then
            all_completed=true
        else
            echo -ne "\r[INFO] Progreso: $completed_count/$total_count servicios completados (${waited}s)"
        fi
    done
    
    echo ""  # Nueva línea
    
    # Mostrar resultados finales
    log_info "=== RESULTADO FINAL ==="
    local success_count=0
    local error_count=0
    
    for service_port in $services; do
        local service_name=$(echo $service_port | cut -d: -f1)
        local port=$(echo $service_port | cut -d: -f2)
        local status_file="$PROJECT_ROOT/scripts/status/${service_name}.status"
        
        if [ -f "$status_file" ]; then
            local status_content=$(cat "$status_file")
            local status_type=$(echo "$status_content" | cut -d: -f1)
            local status_message=$(echo "$status_content" | cut -d: -f2-)
            
            case "$status_type" in
                "SUCCESS")
                    log_success "✓ $service_name: $status_message"
                    success_count=$((success_count + 1))
                    ;;
                "RUNNING")
                    log_success "✓ $service_name: $status_message"
                    success_count=$((success_count + 1))
                    ;;
                "ERROR")
                    log_error "✗ $service_name: $status_message"
                    error_count=$((error_count + 1))
                    ;;
                "TIMEOUT")
                    log_warning "⚠ $service_name: $status_message"
                    error_count=$((error_count + 1))
                    ;;
                *)
                    log_error "✗ $service_name: Estado desconocido - $status_content"
                    error_count=$((error_count + 1))
                    ;;
            esac
        else
            log_error "✗ $service_name: No se pudo determinar el estado"
            error_count=$((error_count + 1))
        fi
    done
    
    echo ""
    log_info "=== RESUMEN ==="
    log_success "Servicios exitosos: $success_count"
    if [ $error_count -gt 0 ]; then
        log_error "Servicios con errores: $error_count"
    fi
    
    if [ $error_count -eq 0 ]; then
        log_success "🎉 Todos los microservicios se iniciaron correctamente"
        return 0
    else
        log_warning "⚠️  Algunos microservicios tuvieron problemas. Revise los logs para más detalles."
        return 1
    fi
}

# Función para detener todos los microservicios
stop_microservices() {
    log_info "Deteniendo microservicios..."
    
    cd "$PROJECT_ROOT"
    
    # Crear directorios si no existen
    mkdir -p pids logs
    
    # Detener servicios por archivos PID
    if [ -d "pids" ]; then
        for pidfile in scripts/pids/*.pid; do
            if [ -f "$pidfile" ]; then
                local service_name=$(basename "$pidfile" .pid)
                local pid=$(cat "$pidfile")
                
                if kill -0 $pid 2>/dev/null; then
                    log_info "Deteniendo $service_name (PID: $pid)"
                    # Intentar terminación amable primero
                    kill -TERM $pid
                    sleep 2
                    # Si aún está corriendo, forzar terminación
                    if kill -0 $pid 2>/dev/null; then
                        log_warning "Forzando terminación de $service_name"
                        kill -KILL $pid
                    fi
                fi
                rm "$pidfile"
            fi
        done
    fi
    
    # Método alternativo: buscar procesos por puerto
    local services=(
        "3000:api-gateway"
        "3001:auth-service" 
        "3002:availability-service"
        "3003:resources-service"
        "3004:stockpile-service"
        "3005:reports-service"
    )
    
    for service_config in "${services[@]}"; do
        local port=$(echo $service_config | cut -d: -f1)
        local service_name=$(echo $service_config | cut -d: -f2)
        
        # Buscar proceso usando el puerto
        local pid=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$pid" ]; then
            log_info "Deteniendo $service_name en puerto $port (PID: $pid)"
            kill -TERM $pid 2>/dev/null
            sleep 2
            # Verificar si aún existe y forzar si es necesario
            if kill -0 $pid 2>/dev/null; then
                log_warning "Forzando terminación de $service_name"
                kill -KILL $pid 2>/dev/null
            fi
        fi
    done
}

# Función para verificar estado de microservicios
status_microservices() {
    log_info "Estado de microservicios: \n"
    
    # Lista de servicios y sus puertos
    local services="api-gateway:3000 auth-service:3001 availability-service:3002 resources-service:3003 stockpile-service:3004 reports-service:3005"
    
    for service_port in $services; do
        local service_name=$(echo $service_port | cut -d: -f1)
        local port=$(echo $service_port | cut -d: -f2)
        
        if nc -z localhost $port; then
            log_success "$service_name: ✓ Activo en puerto $port \n"
        else
            log_warning "$service_name: ✗ Inactivo en puerto $port \n"
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
    mkdir -p scripts/logs scripts/pids scripts/status
    
    # Limpiar archivos de status previos
    rm -f scripts/status/*.status
    
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
    
    # Generar cliente Prisma una sola vez
    log_info "Generando cliente Prisma..."
    npx prisma generate
    
    # Lista de servicios y sus configuraciones
    local services="api-gateway:3000:start:gateway auth-service:3001:start:auth availability-service:3002:start:availability resources-service:3003:start:resources stockpile-service:3004:start:stockpile reports-service:3005:start:reports"
    
    log_info "Iniciando todos los microservicios en paralelo... \n"
    
    # Iniciar todos los servicios en paralelo
    for service_config in $services; do
        local service_name=$(echo $service_config | cut -d: -f1)
        local port=$(echo $service_config | cut -d: -f2)
        local npm_script=$(echo $service_config | cut -d: -f3-)
        
        log_info "Lanzando $service_name..."
        start_microservice_parallel "$service_name" "$port" "$npm_script" &
    done
    
    # Esperar a que todos los servicios se inicien y mostrar resultados
    wait_for_all_services "$services"
    local result=$?
    
    echo ""
    log_info "Logs disponibles en: $PROJECT_ROOT/scripts/logs/"
    log_info "PIDs guardados en: $PROJECT_ROOT/scripts/pids/"
    log_info "Status guardado en: $PROJECT_ROOT/scripts/status/"
    log_info "Para detener: $0 stop"
    log_info "Para ver estado: $0 status"
    
    return $result
}

# Función para mostrar logs de un servicio específico
logs() {
    local service_name=$1
    local log_file="$PROJECT_ROOT/scripts/logs/${service_name}.log"
    
    if [ -f "$log_file" ]; then
        tail -f "$log_file"
    else
            log_error "Log no encontrado: $log_file"
        log_info "Servicios disponibles: api-gateway, auth-service, resources-service, availability-service, stockpile-service, reports-service"
    fi
}

# Función para reiniciar un servicio específico
restart_service() {
    local service_name=$1
    
    if [ -z "$service_name" ]; then
        log_error "Nombre de servicio requerido"
        return 1
    fi
    
    log_info "Reiniciando servicio: $service_name"
    local pidfile="$PROJECT_ROOT/scripts/pids/${service_name}.pid"
    
    if [ -f "$pidfile" ]; then
        local pid=$(cat "$pidfile")
        if kill -0 $pid 2>/dev/null; then
            log_info "Deteniendo $service_name (PID: $pid)"
            kill $pid
            
            # Esperar a que el proceso termine y el puerto se libere
            local max_wait=10
            local wait_count=0
            while kill -0 $pid 2>/dev/null && [ $wait_count -lt $max_wait ]; do
                sleep 1
                wait_count=$((wait_count + 1))
            done
            
            # Si aún está corriendo, forzar terminación
            if kill -0 $pid 2>/dev/null; then
                log_warning "Forzando terminación de $service_name"
                kill -KILL $pid
                sleep 2
            fi
        fi
        rm "$pidfile"
    fi
    
    # Esperar adicional para que el puerto se libere completamente
    local service_port=""
    case $service_name in
        "api-gateway") service_port="3000" ;;
        "auth-service") service_port="3001" ;;
        "availability-service") service_port="3002" ;;
        "resources-service") service_port="3003" ;;
        "stockpile-service") service_port="3004" ;;
        "reports-service") service_port="3005" ;;
    esac
    
    if [ ! -z "$service_port" ]; then
        local port_wait=5
        while nc -z localhost $service_port 2>/dev/null && [ $port_wait -gt 0 ]; do
            log_info "Esperando que se libere el puerto $service_port..."
            sleep 1
            port_wait=$((port_wait - 1))
        done
    fi
    
    # Reiniciar según el servicio
    case $service_name in
        "api-gateway")
            start_microservice "api-gateway" "3000" "start:gateway"
            service_port="3000"
            ;;
        "auth-service")
            start_microservice "auth-service" "3001" "start:auth"
            service_port="3001"
            ;;
        "availability-service")
            start_microservice "availability-service" "3002" "start:availability"
            service_port="3002"
            ;;
        "resources-service")
            start_microservice "resources-service" "3003" "start:resources"
            service_port="3003"
            ;;
        "stockpile-service")
            start_microservice "stockpile-service" "3004" "start:stockpile"
            service_port="3004"
            ;;
        "reports-service")
            start_microservice "reports-service" "3005" "start:reports"
            service_port="3005"
            ;;
        *)
            log_error "Servicio desconocido: $service_name"
            log_info "Servicios disponibles: api-gateway, auth-service, resources-service, availability-service, stockpile-service, reports-service"
            return 1
            ;;
    esac
    
    # Esperar a que el servicio esté completamente iniciado y respondiendo
    if [ ! -z "$service_port" ]; then
        log_info "Esperando que $service_name responda completamente..."
        local max_startup_wait=30
        local startup_wait=0
        
        while [ $startup_wait -lt $max_startup_wait ]; do
            if nc -z localhost $service_port 2>/dev/null; then
                log_success "$service_name reiniciado exitosamente y respondiendo en puerto $service_port"
                return 0
            fi
            sleep 2
            startup_wait=$((startup_wait + 2))
            log_info "Esperando respuesta de $service_name... ($startup_wait/$max_startup_wait segundos)"
        done
        
        log_error "$service_name no responde después de $max_startup_wait segundos"
        return 1
    fi
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
    echo "  $0 start                     # Iniciar todos los servicios"
    echo "  $0 logs api-gateway          # Ver logs de api-gateway"
    echo "  $0 restart auth-service      # Reiniciar auth-service"
    echo ""
    echo "SERVICIOS DISPONIBLES:"
    echo "  api-gateway (puerto 3000) - Puerta de entrada principal"
    echo "  auth-service (puerto 3001) - Gestión de autenticación y autorización"
    echo "  availability-service (puerto 3002) - Gestión de disponibilidad de recursos"
    echo "  resources-service (puerto 3003) - Gestión de recursos institucionales"
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
