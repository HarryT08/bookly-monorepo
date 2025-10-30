#!/bin/bash

# =============================================================================
# Bookly Docker Management Script
# Gestión completa de la infraestructura Docker para Bookly Backend
# =============================================================================

set -e

# Configuración de colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración de directorios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$INFRA_DIR")"

# Configuración de archivos
ENV_FILE="$INFRA_DIR/.env.docker"
BASE_COMPOSE="$INFRA_DIR/docker-compose.base.yml"
OBSERVABILITY_COMPOSE="$INFRA_DIR/docker-compose.observability.yml"
MICROSERVICES_COMPOSE="$INFRA_DIR/docker-compose.microservices.yml"
DEV_COMPOSE="$INFRA_DIR/docker-compose.dev.yml"

# Función para mostrar logs con colores
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

# Función para mostrar ayuda
show_help() {
    cat << EOF
🔧 Bookly Docker Management Script

USAGE:
    $0 [COMMAND] [OPTIONS]

COMMANDS:
    init                 Inicializar configuración completa
    start               Iniciar todos los servicios
    stop                Detener todos los servicios
    restart             Reiniciar todos los servicios
    status              Mostrar estado de los servicios
    logs [service]      Mostrar logs (opcional: servicio específico)
    build               Construir imágenes de microservicios
    clean               Limpiar contenedores y volúmenes
    reset               Reset completo (CUIDADO: elimina todos los datos)
    
    # Servicios específicos
    base                Servicios base (MongoDB, Redis, RabbitMQ)
    observability       Servicios de observabilidad (SigNoz, Sentry)
    microservices       Microservicios de aplicación
    
    # Gestión de datos
    backup              Crear backup de datos
    restore [file]      Restaurar backup
    seed                Ejecutar semillas de base de datos
    
    # Utilidades
    shell [service]     Acceder a shell de un servicio
    exec [service] [cmd] Ejecutar comando en un servicio
    health              Verificar salud de todos los servicios

OPTIONS:
    -f, --force         Forzar operación sin confirmación
    -v, --verbose       Salida detallada
    -h, --help          Mostrar esta ayuda

EXAMPLES:
    $0 init                          # Configuración inicial completa
    $0 start base                    # Solo servicios base
    $0 logs auth-service            # Logs del servicio de autenticación
    $0 shell mongodb-primary        # Shell de MongoDB
    $0 exec redis redis-cli info    # Ejecutar comando en Redis
    $0 backup --force               # Backup forzado
    $0 clean --verbose              # Limpieza con salida detallada

EOF
}

# Función para verificar prerrequisitos
check_prerequisites() {
    log_info "Verificando prerrequisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose no está instalado"
        exit 1
    fi
    
    # Verificar archivos de configuración
    if [[ ! -f "$BASE_COMPOSE" ]]; then
        log_error "Archivo docker-compose.base.yml no encontrado"
        exit 1
    fi
    
    log_success "Prerrequisitos verificados correctamente"
}

# Función para inicializar configuración
init_config() {
    log_info "Inicializando configuración de Bookly Docker..."
    
    # Verificar/crear archivo .env
    if [[ ! -f "$ENV_FILE" ]]; then
        if [[ -f "$ENV_FILE.example" ]]; then
            cp "$ENV_FILE.example" "$ENV_FILE"
            log_warning "Archivo .env.docker creado desde example. Revisa y configura los valores necesarios."
        else
            log_error "Archivo .env.docker.example no encontrado"
            exit 1
        fi
    fi
    
    # Crear directorios necesarios
    mkdir -p "$INFRA_DIR/data"/{mongodb,redis,rabbitmq,clickhouse,sentry}
    mkdir -p "$INFRA_DIR/logs"
    mkdir -p "$INFRA_DIR/backups"
    mkdir -p "$INFRA_DIR/mongodb/keyfile"
    
    # Verificar y configurar MongoDB keyfile
    KEYFILE="$INFRA_DIR/mongodb/keyfile/mongodb-keyfile"
    if [[ ! -f "$KEYFILE" ]] || [[ $(wc -l < "$KEYFILE" | tr -d ' ') -ne 0 ]]; then
        log_warning "MongoDB keyfile no existe o tiene formato incorrecto, regenerando..."
        if [[ -f "$SCRIPT_DIR/fix-mongodb-keyfile.sh" ]]; then
            bash "$SCRIPT_DIR/fix-mongodb-keyfile.sh"
        else
            # Generar keyfile directamente
            log_info "Generando keyfile..."
            openssl rand -base64 756 | tr -d '\n' > "$KEYFILE"
            chmod 400 "$KEYFILE"
            log_success "Keyfile generado"
        fi
    else
        # Asegurar permisos correctos
        chmod 400 "$KEYFILE"
        log_info "Keyfile existente verificado"
    fi
    
    # Crear redes Docker
    docker network create bookly-network 2>/dev/null || true
    docker network create bookly-observability 2>/dev/null || true
    
    log_success "Configuración inicializada correctamente"
}

# Función para construir imágenes
build_images() {
    log_info "Construyendo imágenes de microservicios..."
    
    cd "$PROJECT_DIR"
    
    # Construir cada microservicio
    local services=("api-gateway" "auth-service" "resources-service" "availability-service" "stockpile-service" "reports-service")
    
    for service in "${services[@]}"; do
        log_info "Construyendo imagen para $service..."
        docker build -f "infrastructure/docker/Dockerfile.$service" -t "bookly/$service:latest" .
    done
    
    log_success "Imágenes construidas exitosamente"
}

# Función para iniciar servicios
start_services() {
    local stack=${1:-"all"}
    
    case $stack in
        "base")
            log_info "Iniciando servicios base..."
            docker compose -f "$BASE_COMPOSE" --env-file "$ENV_FILE" up -d
            ;;
        "observability")
            log_info "Iniciando servicios de observabilidad..."
            docker compose -f "$OBSERVABILITY_COMPOSE" --env-file "$ENV_FILE" up -d
            ;;
        "microservices")
            log_info "Iniciando microservicios..."
            docker compose -f "$MICROSERVICES_COMPOSE" --env-file "$ENV_FILE" up -d
            ;;
        "dev")
            log_info "Iniciando microservicios..."
            docker compose -f "$DEV_COMPOSE" --env-file "$ENV_FILE" up -d
            ;;
        "all"|*)
            log_info "Iniciando todos los servicios..."
            docker compose -f "$BASE_COMPOSE" -f "$OBSERVABILITY_COMPOSE" -f "$MICROSERVICES_COMPOSE" --env-file "$ENV_FILE" up -d
            ;;
    esac
    
    log_success "Servicios iniciados correctamente"
}

# Función para detener servicios
stop_services() {
    local stack=${1:-"all"}
    
    case $stack in
        "base")
            log_info "Deteniendo servicios base..."
            docker compose -f "$BASE_COMPOSE" --env-file "$ENV_FILE" down
            ;;
        "observability")
            log_info "Deteniendo servicios de observabilidad..."
            docker compose -f "$OBSERVABILITY_COMPOSE" --env-file "$ENV_FILE" down
            ;;
        "microservices")
            log_info "Deteniendo microservicios..."
            docker compose -f "$MICROSERVICES_COMPOSE" --env-file "$ENV_FILE" down
            ;;
        "dev")
            log_info "Deteniendo microservicios..."
            docker compose -f "$DEV_COMPOSE" --env-file "$ENV_FILE" down
            ;;
        "all"|*)
            log_info "Deteniendo todos los servicios..."
            docker compose -f "$BASE_COMPOSE" -f "$OBSERVABILITY_COMPOSE" -f "$MICROSERVICES_COMPOSE" -f "$DEV_COMPOSE" --env-file "$ENV_FILE" down
            ;;
    esac
    
    log_success "Servicios detenidos correctamente"
}

# Función para mostrar estado
show_status() {
    log_info "Estado de los servicios Bookly:"
    echo
    docker compose -f "$BASE_COMPOSE" -f "$OBSERVABILITY_COMPOSE" -f "$MICROSERVICES_COMPOSE" -f "$DEV_COMPOSE" --env-file "$ENV_FILE" ps
}

# Función para mostrar logs
show_logs() {
    local service=$1
    local compose_files="-f $BASE_COMPOSE -f $OBSERVABILITY_COMPOSE -f $MICROSERVICES_COMPOSE -f $DEV_COMPOSE"
    
    if [[ -n "$service" ]]; then
        log_info "Mostrando logs para $service..."
        docker compose $compose_files --env-file "$ENV_FILE" logs -f --tail=100 "$service"
    else
        log_info "Mostrando logs de todos los servicios..."
        docker compose $compose_files --env-file "$ENV_FILE" logs -f --tail=50
    fi
}

# Función para limpiar
clean_services() {
    local force=$1
    
    if [[ "$force" != "--force" ]]; then
        log_warning "Esto eliminará todos los contenedores y volúmenes de Bookly."
        read -p "¿Estás seguro? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Operación cancelada"
            return 0
        fi
    fi
    
    log_info "Limpiando servicios..."
    
    # Detener y eliminar contenedores
    docker compose -f "$BASE_COMPOSE" -f "$OBSERVABILITY_COMPOSE" -f "$MICROSERVICES_COMPOSE" -f "$DEV_COMPOSE" --env-file "$ENV_FILE" down -v --remove-orphans
    
    # Eliminar imágenes de Bookly
    docker images bookly/* -q | xargs -r docker rmi -f
    
    # Limpiar redes
    docker network rm bookly-network bookly-observability 2>/dev/null || true
    
    log_success "Limpieza completada"
}

# Función para reset completo
reset_services() {
    local force=$1
    
    if [[ "$force" != "--force" ]]; then
        log_error "CUIDADO: Esto eliminará TODOS los datos de Bookly permanentemente."
        read -p "¿Estás ABSOLUTAMENTE seguro? Escribe 'DELETE_ALL': " confirm
        if [[ "$confirm" != "DELETE_ALL" ]]; then
            log_info "Operación cancelada"
            return 0
        fi
    fi
    
    log_warning "Realizando reset completo..."
    
    # Limpiar servicios
    clean_services --force
    
    # Eliminar directorios de datos
    rm -rf "$INFRA_DIR/data"
    rm -rf "$INFRA_DIR/logs"
    
    log_success "Reset completado"
}

# Función para crear backup
create_backup() {
    log_info "Creando backup de Bookly..."
    
    local backup_dir="$INFRA_DIR/backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/bookly_backup_$timestamp.tar.gz"
    
    mkdir -p "$backup_dir"
    
    # Crear backup de datos
    docker run --rm \
        -v bookly_mongodb_primary_data:/data/mongodb:ro \
        -v bookly_redis_data:/data/redis:ro \
        -v bookly_rabbitmq_data:/data/rabbitmq:ro \
        -v "$backup_dir":/backup \
        alpine:latest \
        tar czf "/backup/bookly_backup_$timestamp.tar.gz" \
        /data/mongodb /data/redis /data/rabbitmq
    
    log_success "Backup creado: $backup_file"
}

# Función para verificar salud
check_health() {
    log_info "Verificando salud de los servicios..."
    
    # Servicios base con sus puertos host
    local base_services=(
        "mongodb-primary:27017:localhost"
        "redis:6379:localhost" 
        "rabbitmq:5672:localhost"
    )
    
    # Microservicios con sus puertos host
    local micro_services=(
        "api-gateway:3000:localhost"
        "auth-service:3001:localhost"
        "resources-service:3002:localhost"
        "availability-service:3003:localhost"
        "stockpile-service:3004:localhost"
        "reports-service:3005:localhost"
    )
    
    # Verificar servicios base
    for service in "${base_services[@]}"; do
        local name="${service%%:*}"
        local port_host="${service#*:}"
        local port="${port_host%%:*}"
        local host="${port_host#*:}"
        
        if docker ps --format "table {{.Names}}" | grep -q "bookly-$name"; then
            if nc -z "$host" "$port" 2>/dev/null; then
                log_success "$name: ✓ Saludable"
            else
                log_error "$name: ✗ No responde"
            fi
        else
            log_warning "$name: - No está ejecutándose"
        fi
    done
    
    # Verificar microservicios
    for service in "${micro_services[@]}"; do
        local name="${service%%:*}"
        local port_host="${service#*:}"
        local port="${port_host%%:*}"
        local host="${port_host#*:}"
        
        if docker ps --format "table {{.Names}}" | grep -q "bookly-$name"; then
            if nc -z "$host" "$port" 2>/dev/null; then
                log_success "$name: ✓ Saludable"
            else
                log_error "$name: ✗ No responde"
            fi
        else
            log_warning "$name: - No está ejecutándose"
        fi
    done
}

# Función para ejecutar semillas
run_seeds() {
    log_info "Ejecutando semillas de base de datos..."
    
    # Verificar que MongoDB esté disponible
    if ! docker ps --format "table {{.Names}}" | grep -q "bookly-mongodb-primary"; then
        log_error "MongoDB no está ejecutándose"
        exit 1
    fi
    
    # Ejecutar semillas
    docker compose -f "$MICROSERVICES_COMPOSE" --env-file "$ENV_FILE" exec auth-service npm run prisma:db:seed
    
    log_success "Semillas ejecutadas correctamente"
}

# Función principal
main() {
    local command=$1
    shift || true
    
    case $command in
        "init")
            check_prerequisites
            init_config
            ;;
        "start")
            check_prerequisites
            start_services "$1"
            ;;
        "stop")
            stop_services "$1"
            ;;
        "restart")
            stop_services "$1"
            start_services "$1"
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$1"
            ;;
        "build")
            check_prerequisites
            build_images
            ;;
        "clean")
            clean_services "$1"
            ;;
        "reset")
            reset_services "$1"
            ;;
        "base"|"observability"|"microservices")
            check_prerequisites
            start_services "$command"
            ;;
        "backup")
            create_backup
            ;;
        "seed")
            run_seeds
            ;;
        "health")
            check_health
            ;;
        "shell")
            if [[ -z "$1" ]]; then
                log_error "Especifica el servicio para shell"
                exit 1
            fi
            docker compose -f "$BASE_COMPOSE" -f "$OBSERVABILITY_COMPOSE" -f "$MICROSERVICES_COMPOSE" --env-file "$ENV_FILE" exec "$1" sh
            ;;
        "exec")
            if [[ -z "$1" ]]; then
                log_error "Especifica el servicio para exec"
                exit 1
            fi
            local service=$1
            shift
            docker compose -f "$BASE_COMPOSE" -f "$OBSERVABILITY_COMPOSE" -f "$MICROSERVICES_COMPOSE" --env-file "$ENV_FILE" exec "$service" "$@"
            ;;
        "help"|"-h"|"--help"|"")
            show_help
            ;;
        *)
            log_error "Comando desconocido: $command"
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal con todos los argumentos
main "$@"
