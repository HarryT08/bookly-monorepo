# =============================================================================
# Bookly Backend Infrastructure - Makefile
# Comandos rápidos para gestión Docker
# =============================================================================

.PHONY: help init dev-start dev-stop dev-restart dev-status dev-logs dev-clean
.PHONY: start stop restart status logs build clean reset backup seed health
.PHONY: base observability microservices all
.PHONY: shell exec mongodb redis rabbitmq nginx
.DEFAULT_GOAL := help

# Configuración
DOCKER_SCRIPT := ./scripts/bookly-docker.sh
DEV_SCRIPT := ./scripts/setup-dev.sh

# =============================================================================
# AYUDA
# =============================================================================

help: ## Mostrar ayuda
	@echo "🔧 Bookly Backend Infrastructure - Makefile"
	@echo ""
	@echo "COMANDOS PRINCIPALES:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "EJEMPLOS:"
	@echo "  make dev-start     # Iniciar desarrollo"
	@echo "  make logs          # Ver todos los logs"
	@echo "  make shell s=redis # Shell de Redis"
	@echo "  make health        # Verificar salud"

# =============================================================================
# DESARROLLO RÁPIDO
# =============================================================================

dev-setup: ## Configuración inicial para desarrollo
	@echo "🚀 Configurando entorno de desarrollo..."
	@$(DEV_SCRIPT)

dev-start: ## Iniciar servicios base para desarrollo
	@echo "▶️  Iniciando servicios base..."
	@$(DOCKER_SCRIPT) start base

dev-stop: ## Detener servicios de desarrollo
	@echo "⏹️  Deteniendo servicios base..."
	@$(DOCKER_SCRIPT) stop base

dev-restart: dev-stop dev-start ## Reiniciar servicios de desarrollo

dev-status: ## Estado de servicios de desarrollo
	@$(DOCKER_SCRIPT) status

dev-logs: ## Logs de servicios de desarrollo
	@$(DOCKER_SCRIPT) logs

dev-clean: ## Limpiar servicios de desarrollo
	@echo "🧹 Limpiando servicios de desarrollo..."
	@$(DOCKER_SCRIPT) clean

dev-fix-mongo: ## Fix del keyfile de MongoDB y reiniciar
	@echo "🔧 Aplicando fix de MongoDB keyfile..."
	@chmod +x scripts/fix-mongodb-keyfile.sh
	@bash scripts/fix-mongodb-keyfile.sh
	@echo "🔄 Reiniciando MongoDB..."
	@docker compose -f docker-compose.base.yml restart mongodb-primary mongodb-secondary1 mongodb-secondary2
	@echo "✅ Fix aplicado. Verifica logs con: make logs s=mongodb-primary"

dev-fix-rabbitmq: ## Fix de RabbitMQ - Recarga definiciones y vhost
	@echo "🐰 Aplicando fix de RabbitMQ..."
	@echo "⚠️  IMPORTANTE: Esto eliminará el volumen de RabbitMQ"
	@echo "🛑 Deteniendo RabbitMQ..."
	@docker compose -f docker-compose.base.yml stop rabbitmq
	@echo "🗑️  Eliminando volumen de RabbitMQ..."
	@docker volume rm bookly_rabbitmq_data 2>/dev/null || echo "Volumen no existe"
	@echo "🚀 Iniciando RabbitMQ con nuevas definiciones..."
	@docker compose -f docker-compose.base.yml up -d rabbitmq
	@echo "⏳ Esperando a que RabbitMQ esté listo (60s)..."
	@sleep 60
	@echo "✅ RabbitMQ reiniciado con nuevas configuraciones"
	@echo "🔍 Verificando vhost:"
	@docker exec bookly-rabbitmq rabbitmqctl list_vhosts
	@echo "🔍 Verificando permisos:"
	@docker exec bookly-rabbitmq rabbitmqctl list_permissions -p bookly
	@echo "✅ Fix completado. Ahora reinicia los microservicios con: make microservices-restart"

# =============================================================================
# GESTIÓN DE MICROSERVICIOS
# =============================================================================

microservices: ## Iniciar microservicios (requiere servicios base)
	@echo "🚀 Iniciando microservicios..."
	@docker network inspect bookly-network >/dev/null 2>&1 || \
		(echo "⚠️  Red bookly-network no existe. Iniciando servicios base primero..." && $(MAKE) dev-start)
	@docker compose -f docker-compose.microservices.yml up -d
	@echo "✅ Microservicios iniciados"
	@echo "📊 Ver estado: make status"

microservices-stop: ## Detener microservicios
	@echo "⏹️  Deteniendo microservicios..."
	@docker compose -f docker-compose.microservices.yml down
	@echo "✅ Microservicios detenidos"

microservices-restart: microservices-stop microservices ## Reiniciar microservicios

microservices-logs: ## Ver logs de microservicios
	@docker compose -f docker-compose.microservices.yml logs -f

dev-full: ## Iniciar servicios base + microservicios (todo en uno)
	@echo "🚀 Iniciando stack completo (base + microservicios)..."
	@docker compose -f docker-compose.dev.yml up -d
	@echo "✅ Stack completo iniciado"
	@echo "📊 Ver estado: docker ps"
	@echo "📋 Ver logs: make logs"

dev-full-stop: ## Detener stack completo
	@echo "⏹️  Deteniendo stack completo..."
	@docker compose -f docker-compose.dev.yml down
	@echo "✅ Stack completo detenido"

dev-full-logs: ## Ver logs del stack completo
	@docker compose -f docker-compose.dev.yml logs -f

dev-full-restart: dev-full-stop dev-full ## Reiniciar stack completo

# =============================================================================
# GESTIÓN DE SERVICIOS INDIVIDUALES
# =============================================================================

## Servicios Base

# MongoDB Primary
mongodb-primary-start: ## Iniciar MongoDB Primary
	@docker compose -f docker-compose.base.yml up -d mongodb-primary

mongodb-primary-stop: ## Detener MongoDB Primary
	@docker compose -f docker-compose.base.yml stop mongodb-primary

mongodb-primary-logs: ## Ver logs de MongoDB Primary
	@docker logs bookly-mongodb-primary -f

mongodb-primary-restart: mongodb-primary-stop mongodb-primary-start ## Reiniciar MongoDB Primary

# Redis
redis-start: ## Iniciar Redis
	@docker compose -f docker-compose.base.yml up -d redis

redis-stop: ## Detener Redis
	@docker compose -f docker-compose.base.yml stop redis

redis-logs: ## Ver logs de Redis
	@docker logs bookly-redis -f

redis-restart: redis-stop redis-start ## Reiniciar Redis

# RabbitMQ
rabbitmq-start: ## Iniciar RabbitMQ
	@docker compose -f docker-compose.base.yml up -d rabbitmq

rabbitmq-stop: ## Detener RabbitMQ
	@docker compose -f docker-compose.base.yml stop rabbitmq

rabbitmq-logs: ## Ver logs de RabbitMQ
	@docker logs bookly-rabbitmq -f

rabbitmq-restart: rabbitmq-stop rabbitmq-start ## Reiniciar RabbitMQ

## Microservicios

# API Gateway
api-gateway-start: ## Iniciar API Gateway
	@docker compose -f docker-compose.microservices.yml up -d api-gateway

api-gateway-stop: ## Detener API Gateway
	@docker compose -f docker-compose.microservices.yml stop api-gateway

api-gateway-logs: ## Ver logs de API Gateway
	@docker logs bookly-api-gateway -f

api-gateway-restart: api-gateway-stop api-gateway-start ## Reiniciar API Gateway

# Auth Service
auth-start: ## Iniciar Auth Service
	@docker compose -f docker-compose.microservices.yml up -d auth-service

auth-stop: ## Detener Auth Service
	@docker compose -f docker-compose.microservices.yml stop auth-service

auth-logs: ## Ver logs de Auth Service
	@docker logs bookly-auth-service -f

auth-restart: auth-stop auth-start ## Reiniciar Auth Service

# Resources Service
resources-start: ## Iniciar Resources Service
	@docker compose -f docker-compose.microservices.yml up -d resources-service

resources-stop: ## Detener Resources Service
	@docker compose -f docker-compose.microservices.yml stop resources-service

resources-logs: ## Ver logs de Resources Service
	@docker logs bookly-resources-service -f

resources-restart: resources-stop resources-start ## Reiniciar Resources Service

# Availability Service
availability-start: ## Iniciar Availability Service
	@docker compose -f docker-compose.microservices.yml up -d availability-service

availability-stop: ## Detener Availability Service
	@docker compose -f docker-compose.microservices.yml stop availability-service

availability-logs: ## Ver logs de Availability Service
	@docker logs bookly-availability-service -f

availability-restart: availability-stop availability-start ## Reiniciar Availability Service

# Stockpile Service
stockpile-start: ## Iniciar Stockpile Service
	@docker compose -f docker-compose.microservices.yml up -d stockpile-service

stockpile-stop: ## Detener Stockpile Service
	@docker compose -f docker-compose.microservices.yml stop stockpile-service

stockpile-logs: ## Ver logs de Stockpile Service
	@docker logs bookly-stockpile-service -f

stockpile-restart: stockpile-stop stockpile-start ## Reiniciar Stockpile Service

# Reports Service
reports-start: ## Iniciar Reports Service
	@docker compose -f docker-compose.microservices.yml up -d reports-service

reports-stop: ## Detener Reports Service
	@docker compose -f docker-compose.microservices.yml stop reports-service

reports-logs: ## Ver logs de Reports Service
	@docker logs bookly-reports-service -f

reports-restart: reports-stop reports-start ## Reiniciar Reports Service

# =============================================================================
# GESTIÓN DE NGINX
# =============================================================================

nginx-start: ## Iniciar Nginx (verifica microservicios)
	@chmod +x scripts/manage-nginx.sh
	@bash scripts/manage-nginx.sh start

nginx-stop: ## Detener Nginx
	@chmod +x scripts/manage-nginx.sh
	@bash scripts/manage-nginx.sh stop

nginx-restart: ## Reiniciar Nginx
	@chmod +x scripts/manage-nginx.sh
	@bash scripts/manage-nginx.sh restart

nginx-status: ## Ver estado de Nginx y microservicios
	@chmod +x scripts/manage-nginx.sh
	@bash scripts/manage-nginx.sh status

nginx-logs: ## Ver logs de Nginx en tiempo real
	@chmod +x scripts/manage-nginx.sh
	@bash scripts/manage-nginx.sh logs

nginx-errors: ## Buscar errores en logs de Nginx
	@chmod +x scripts/manage-nginx.sh
	@bash scripts/manage-nginx.sh errors

# =============================================================================
# GESTIÓN COMPLETA
# =============================================================================

init: ## Inicializar configuración completa
	@echo "🔧 Inicializando configuración..."
	@$(DOCKER_SCRIPT) init

start: ## Iniciar todos los servicios
	@echo "▶️  Iniciando todos los servicios..."
	@$(DOCKER_SCRIPT) start

stop: ## Detener todos los servicios
	@echo "⏹️  Deteniendo todos los servicios..."
	@$(DOCKER_SCRIPT) stop

restart: stop start ## Reiniciar todos los servicios

status: ## Mostrar estado de todos los servicios
	@$(DOCKER_SCRIPT) status

logs: ## Mostrar logs de todos los servicios
	@$(DOCKER_SCRIPT) logs $(s)

build: ## Construir imágenes de microservicios
	@echo "🔨 Construyendo imágenes..."
	@$(DOCKER_SCRIPT) build

clean: ## Limpiar contenedores y volúmenes
	@echo "🧹 Limpiando servicios..."
	@$(DOCKER_SCRIPT) clean $(if $(force),--force)

reset: ## Reset completo (CUIDADO: elimina todos los datos)
	@echo "💣 Reset completo..."
	@$(DOCKER_SCRIPT) reset $(if $(force),--force)

# =============================================================================
# STACKS ESPECÍFICOS
# =============================================================================

base: ## Iniciar solo servicios base (MongoDB, Redis, RabbitMQ)
	@echo "▶️  Iniciando servicios base..."
	@$(DOCKER_SCRIPT) start base

observability: ## Iniciar solo servicios de observabilidad
	@echo "▶️  Iniciando observabilidad..."
	@$(DOCKER_SCRIPT) start observability

microservices: ## Iniciar solo microservicios
	@echo "▶️  Iniciando microservicios..."
	@$(DOCKER_SCRIPT) start microservices

all: base observability microservices ## Iniciar todos los stacks secuencialmente

# =============================================================================
# GESTIÓN DE DATOS
# =============================================================================

backup: ## Crear backup de datos
	@echo "💾 Creando backup..."
	@$(DOCKER_SCRIPT) backup

seed: ## Ejecutar semillas de base de datos
	@echo "🌱 Ejecutando semillas..."
	@$(DOCKER_SCRIPT) seed

health: ## Verificar salud de servicios
	@echo "🏥 Verificando salud..."
	@$(DOCKER_SCRIPT) health

# =============================================================================
# ACCESO A SERVICIOS
# =============================================================================

shell: ## Acceder a shell de un servicio (uso: make shell s=redis)
	@if [ -z "$(s)" ]; then \
		echo "❌ Especifica el servicio: make shell s=<servicio>"; \
		echo "Servicios disponibles: mongodb-primary, redis, rabbitmq, auth-service, etc."; \
	else \
		echo "🐚 Accediendo a shell de $(s)..."; \
		$(DOCKER_SCRIPT) shell $(s); \
	fi

exec: ## Ejecutar comando en servicio (uso: make exec s=redis c="redis-cli info")
	@if [ -z "$(s)" ] || [ -z "$(c)" ]; then \
		echo "❌ Especifica servicio y comando: make exec s=<servicio> c=\"<comando>\""; \
	else \
		echo "⚡ Ejecutando '$(c)' en $(s)..."; \
		$(DOCKER_SCRIPT) exec $(s) $(c); \
	fi

# =============================================================================
# ACCESOS RÁPIDOS A SERVICIOS ESPECÍFICOS
# =============================================================================

mongodb: ## Shell de MongoDB
	@$(DOCKER_SCRIPT) shell mongodb-primary

redis: ## Shell de Redis
	@$(DOCKER_SCRIPT) shell redis

rabbitmq: ## Shell de RabbitMQ
	@$(DOCKER_SCRIPT) shell rabbitmq

nginx: ## Shell de Nginx
	@$(DOCKER_SCRIPT) shell nginx

auth: ## Shell de Auth Service
	@$(DOCKER_SCRIPT) shell auth-service

resources: ## Shell de Resources Service
	@$(DOCKER_SCRIPT) shell resources-service

# =============================================================================
# COMANDOS DE DIAGNÓSTICO
# =============================================================================

ps: ## Mostrar contenedores Docker
	@docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep bookly || echo "No hay contenedores Bookly ejecutándose"

images: ## Mostrar imágenes Docker de Bookly
	@docker images bookly/* --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

networks: ## Mostrar redes Docker de Bookly
	@docker network ls | grep bookly

volumes: ## Mostrar volúmenes Docker de Bookly
	@docker volume ls | grep bookly

stats: ## Mostrar estadísticas de recursos
	@docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" --no-stream | grep bookly

errors: ## Mostrar errores en logs
	@echo "🔍 Buscando errores en logs..."
	@$(DOCKER_SCRIPT) logs | grep -i error | tail -20 || echo "No se encontraron errores recientes"

# =============================================================================
# UTILIDADES DE DESARROLLO
# =============================================================================

mongo-cli: ## Cliente MongoDB
	@$(DOCKER_SCRIPT) exec mongodb-primary mongosh --username bookly --password bookly123 --authenticationDatabase admin bookly

redis-cli: ## Cliente Redis
	@$(DOCKER_SCRIPT) exec redis redis-cli -a bookly123

rabbit-admin: ## Abrir RabbitMQ Management en navegador
	@echo "🐰 Abriendo RabbitMQ Management..."
	@echo "URL: http://localhost:15672"
	@echo "Usuario: bookly / Contraseña: bookly123"
	@open http://localhost:15672 2>/dev/null || echo "Abre manualmente: http://localhost:15672"

signoz: ## Abrir SigNoz en navegador
	@echo "📊 Abriendo SigNoz..."
	@echo "URL: http://localhost:3301"
	@open http://localhost:3301 2>/dev/null || echo "Abre manualmente: http://localhost:3301"

sentry: ## Abrir Sentry en navegador
	@echo "🐛 Abriendo Sentry..."
	@echo "URL: http://localhost:9001"
	@echo "Usuario: admin@bookly.local / Contraseña: admin123"
	@open http://localhost:9001 2>/dev/null || echo "Abre manualmente: http://localhost:9001"

# =============================================================================
# COMANDOS DE PRUEBAS
# =============================================================================

test-connections: ## Probar conexiones a servicios
	@echo "🔌 Probando conexiones..."
	@echo "MongoDB:" && nc -z localhost 27017 && echo "✅ OK" || echo "❌ FAIL"
	@echo "Redis:" && nc -z localhost 6379 && echo "✅ OK" || echo "❌ FAIL"
	@echo "RabbitMQ:" && nc -z localhost 5672 && echo "✅ OK" || echo "❌ FAIL"
	@echo "API Gateway:" && nc -z localhost 80 && echo "✅ OK" || echo "❌ FAIL"

ping-services: ## Ping a todos los servicios
	@echo "🏓 Ping a servicios..."
	@for service in auth-service resources-service availability-service stockpile-service reports-service; do \
		echo -n "$$service: "; \
		curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "❌"; \
	done

# =============================================================================
# INFORMACIÓN ÚTIL
# =============================================================================

info: ## Mostrar información de configuración
	@echo "📋 Información de Configuración Bookly"
	@echo ""
	@echo "🗂️  Archivos:"
	@echo "   • Configuración: .env.docker"
	@echo "   • Base: docker-compose.base.yml"
	@echo "   • Observabilidad: docker-compose.observability.yml"
	@echo "   • Microservicios: docker-compose.microservices.yml"
	@echo ""
	@echo "🔗 URLs de Acceso:"
	@echo "   • API Gateway: http://localhost"
	@echo "   • Management: http://localhost:8080"
	@echo "   • RabbitMQ: http://localhost:15672"
	@echo "   • SigNoz: http://localhost:3301"
	@echo "   • Sentry: http://localhost:9001"
	@echo ""
	@echo "🔐 Credenciales por Defecto:"
	@echo "   • MongoDB: bookly / bookly123"
	@echo "   • Redis: bookly123"
	@echo "   • RabbitMQ: bookly / bookly123"

urls: ## Mostrar todas las URLs importantes
	@echo "🔗 URLs de Servicios Bookly:"
	@echo ""
	@echo "📡 API y Servicios:"
	@echo "   • API Gateway:        http://localhost"
	@echo "   • API Management:     http://localhost:8080"
	@echo "   • Auth Service:       http://localhost:3001"
	@echo "   • Resources Service:  http://localhost:3002"
	@echo "   • Availability:       http://localhost:3003"
	@echo "   • Stockpile:          http://localhost:3004"
	@echo "   • Reports:            http://localhost:3005"
	@echo ""
	@echo "🗄️  Bases de Datos:"
	@echo "   • MongoDB:            mongodb://localhost:27017,27018,27019"
	@echo "   • Redis:              redis://localhost:6379"
	@echo "   • RabbitMQ:           amqp://localhost:5672"
	@echo "   • ClickHouse:         http://localhost:8123"
	@echo ""
	@echo "📊 Observabilidad:"
	@echo "   • RabbitMQ Mgmt:      http://localhost:15672"
	@echo "   • SigNoz:             http://localhost:3301"
	@echo "   • Sentry:             http://localhost:9001"
	@echo "   • Alertmanager:       http://localhost:9093"

# =============================================================================
# VARIABLES PARA COMANDOS
# =============================================================================

# Variables que se pueden usar:
# s = servicio (para shell y exec)
# c = comando (para exec)
# force = forzar operación (para clean y reset)

# =============================================================================
# FIXES Y DIAGNÓSTICO
# =============================================================================

dev-fix-host-binding: ## Aplicar fix de host binding (localhost → 0.0.0.0)
	@echo "🔧 Aplicando fix de host binding..."
	@chmod +x scripts/apply-host-binding-fix.sh
	@./scripts/apply-host-binding-fix.sh

dev-diagnose: ## Diagnóstico completo de microservicios
	@echo "🔍 Ejecutando diagnóstico..."
	@chmod +x scripts/check-microservices-logs.sh
	@./scripts/check-microservices-logs.sh

dev-fix-all: dev-fix-mongodb dev-fix-host-binding ## Aplicar todos los fixes (MongoDB + Host Binding)
	@echo "✅ Todos los fixes aplicados"
