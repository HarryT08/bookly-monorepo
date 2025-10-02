# BOOKLY API GATEWAY - TESTING MAKEFILE
# Sistema completo de testing para todos los endpoints del API Gateway

.PHONY: help install test-all test-hito-1 test-hito-2 test-hito-3 test-hito-4 test-hito-5 test-hito-6 test-hito-7 test-hito-8 test-hito-9 test-hito-10 results clean sync-test-data sync-endpoints refactor-setup
.DEFAULT_GOAL := help

# Variables de configuración
NODE_VERSION := 22.15.0
API_GATEWAY_URL := http://localhost:3000
NVM_SCRIPT := source ~/.nvm/nvm.sh && nvm use $(NODE_VERSION)

# Colores para output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
MAGENTA := \033[0;35m
CYAN := \033[0;36m
WHITE := \033[1;37m
NC := \033[0m # No Color

help: ## Mostrar ayuda de comandos disponibles
	@echo "$(CYAN)BOOKLY API GATEWAY - TESTING SUITE$(NC)"
	@echo "$(WHITE)Sistema completo de testing para endpoints del API Gateway$(NC)"
	@echo ""
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Ejemplos de uso:$(NC)"
	@echo "  $(GREEN)make install$(NC)          - Instalar dependencias"
	@echo "  $(GREEN)make test-all$(NC)         - Ejecutar todos los tests"
	@echo "  $(GREEN)make test-hito-1$(NC)      - Tests del Hito 1 (Resources)"
	@echo "  $(GREEN)make results$(NC)          - Ver resultados de tests"
	@echo ""

check-prerequisites: ## Verificar prerrequisitos del sistema
	@echo "$(BLUE)Verificando prerrequisitos...$(NC)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)Error: Node.js no está instalado$(NC)"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "$(RED)Error: npm no está instalado$(NC)"; exit 1; }
	@curl -f -s $(API_GATEWAY_URL)/api/v1/health >/dev/null || { echo "$(YELLOW)Warning: API Gateway no está disponible en $(API_GATEWAY_URL)$(NC)"; }
	@echo "$(GREEN)✓ Prerrequisitos verificados$(NC)"

install: check-prerequisites ## Instalar dependencias del proyecto
	@echo "$(BLUE)Instalando dependencias...$(NC)"
	@$(NVM_SCRIPT) && npm install
	@echo "$(GREEN)✓ Dependencias instaladas$(NC)"

# ================================
# TESTS POR HITO
# ================================

test-hito-1: ## Ejecutar todos los tests del Hito 1 - Resources Core
	@echo "$(MAGENTA)=== HITO 1 - RESOURCES CORE ===$(NC)"
	@$(MAKE) -C hito-1-resources test-all
	@echo "$(GREEN)✓ Hito 1 completado$(NC)"

test-hito-2: ## Ejecutar todos los tests del Hito 2 - Availability Core
	@echo "$(GREEN)=== HITO 2 - AVAILABILITY CORE ===$(NC)"
	@$(MAKE) -C hito-2-availability test-all
	@echo "$(GREEN)✓ Hito 2 completado$(NC)"

test-hito-3: ## Ejecutar todos los tests del Hito 3 - Stockpile Core
	@echo "$(CYAN)=== HITO 3 - STOCKPILE CORE ===$(NC)"
	@$(MAKE) -C hito-3-stockpile test-all
	@echo "$(GREEN)✓ Hito 3 completado$(NC)"

test-hito-4: ## Ejecutar todos los tests del Hito 4 - Auth Core + SSO
	@echo "$(MAGENTA)=== HITO 4 - AUTH CORE + SSO ===$(NC)"
	@$(MAKE) -C hito-4-auth test-all
	@echo "$(GREEN)✓ Hito 4 completado$(NC)"

test-hito-5: ## Ejecutar todos los tests del Hito 5 - Reports Core
	@echo "$(MAGENTA)=== HITO 5 - REPORTS CORE ===$(NC)"
	@$(MAKE) -C hito-5-reports test-all
	@echo "$(GREEN)✓ Hito 5 completado$(NC)"

test-hito-6: ## Ejecutar todos los tests del Hito 6 - Mejoras Resources
	@echo "$(MAGENTA)=== HITO 6 - MEJORAS RESOURCES ===$(NC)"
	@$(MAKE) -C hito-6-resources-improvements test-all
	@echo "$(GREEN)✓ Hito 6 completado$(NC)"

test-hito-7: ## Ejecutar todos los tests del Hito 7 - Notificaciones Avanzadas
	@echo "$(MAGENTA)=== HITO 7 - NOTIFICACIONES AVANZADAS ===$(NC)"
	@$(MAKE) -C hito-7-notifications test-all
	@echo "$(GREEN)✓ Hito 7 completado$(NC)"

test-hito-8: ## Ejecutar todos los tests del Hito 8 - Analytics Avanzados
	@echo "$(MAGENTA)=== HITO 8 - ANALYTICS AVANZADOS ===$(NC)"
	@$(MAKE) -C hito-8-analytics test-all
	@echo "$(GREEN)✓ Hito 8 completado$(NC)"

test-hito-9: ## Ejecutar todos los tests del Hito 9 - Integraciones Externas
	@echo "$(MAGENTA)=== HITO 9 - INTEGRACIONES EXTERNAS ===$(NC)"
	@$(MAKE) -C hito-9-integrations test-all
	@echo "$(GREEN)✓ Hito 9 completado$(NC)"

test-hito-10: ## Ejecutar todos los tests del Hito 10 - Optimización y Performance
	@echo "$(MAGENTA)=== HITO 10 - OPTIMIZACIÓN Y PERFORMANCE ===$(NC)"
	@$(MAKE) -C hito-10-performance test-all
	@echo "$(GREEN)✓ Hito 10 completado$(NC)"

# ================================
# TESTS INDIVIDUALES POR HITO
# ================================

# Hito 1 - Resources Core (delegar a Makefile individual)
test-resources-crud: ## Test individual: CRUD de recursos
	@$(MAKE) -C hito-1-resources test-crud

test-resources-categories: ## Test individual: Gestión de categorías
	@$(MAKE) -C hito-1-resources test-categories

test-resources-programs: ## Test individual: Gestión de programas
	@$(MAKE) -C hito-1-resources test-programs

test-resources-import: ## Test individual: Import/Export
	@$(MAKE) -C hito-1-resources test-import-export

test-resources-maintenance: ## Test individual: Mantenimiento
	@$(MAKE) -C hito-1-resources test-maintenance

# Hito 2 - Availability Core (delegar a Makefile individual)
test-availability-basic: ## Test individual: Disponibilidad básica
	@$(MAKE) -C hito-2-availability test-basic

test-availability-search: ## Test individual: Búsqueda avanzada
	@$(MAKE) -C hito-2-availability test-search

test-availability-calendar: ## Test individual: Integración calendario
	@$(MAKE) -C hito-2-availability test-calendar

test-availability-reassignment: ## Test individual: Sistema reasignación
	@$(MAKE) -C hito-2-availability test-reassignment

test-availability-tracking: ## Test individual: Seguimiento uso
	@$(MAKE) -C hito-2-availability test-tracking

# Hito 3 - Stockpile Core (delegar a Makefile individual)
test-stockpile-approval: ## Test individual: Flujos aprobación
	@$(MAKE) -C hito-3-stockpile test-approval

test-stockpile-documents: ## Test individual: Plantillas documentos
	@$(MAKE) -C hito-3-stockpile test-documents

test-stockpile-notifications: ## Test individual: Sistema notificaciones
	@$(MAKE) -C hito-3-stockpile test-notifications

test-stockpile-security: ## Test individual: Validación y seguridad
	@$(MAKE) -C hito-3-stockpile test-security

# ================================
# TESTS COMPLETOS
# ================================

test-all: ## Ejecutar todos los tests de todos los hitos
	@echo "$(WHITE)========================================$(NC)"
	@echo "$(WHITE)  BOOKLY API GATEWAY - TESTING SUITE  $(NC)"
	@echo "$(WHITE)========================================$(NC)"
	@echo ""
	@make test-hito-1
	@make test-hito-2
	@make test-hito-3
	@make test-hito-4
	@make test-hito-5
	@make test-hito-6
	@make test-hito-7
	@make test-hito-8
	@make test-hito-9
	@make test-hito-10
	@echo ""
	@echo "$(GREEN)✓ Todos los tests completados$(NC)"
	@echo "$(CYAN)Ejecutar 'make results' para ver resumen$(NC)"

test-implemented: ## Ejecutar solo tests implementados (Hitos 1-3)
	@echo "$(BLUE)Ejecutando tests implementados...$(NC)"
	@make test-hito-1
	@make test-hito-2
	@make test-hito-3
	@echo "$(GREEN)✓ Tests implementados completados$(NC)"

# ================================
# RESULTADOS Y REPORTES
# ================================

results: ## Mostrar resumen de resultados
	@echo "$(CYAN)=== RESULTADOS DE TESTING ===$(NC)"
	@find . -name "*.md" -path "*/results/*" | head -10 | while read file; do \
		echo "$(GREEN)📄 $$file$(NC)"; \
	@echo "$(YELLOW)Para ver un reporte específico:$(NC)"
	@echo "  cat hito-1-resources/results/[nombre-flujo].md"

results-hito-1: ## Mostrar resultados del Hito 1
	@echo "$(CYAN)=== RESULTADOS HITO 1 - RESOURCES ===$(NC)"
	@find hito-1-resources/results -name "*.md" 2>/dev/null | while read file; do \
		echo "$(GREEN)📄 $$file$(NC)"; \
		echo "$(BLUE)---$(NC)"; \
		head -20 "$$file" | grep -E "(##|✅|❌|⚠️)" | head -5; \
		echo ""; \
	done || echo "$(YELLOW)No hay resultados disponibles para Hito 1$(NC)"

results-hito-2: ## Ver resultados específicos del Hito 2
	@echo "$(CYAN)📊 Resultados Hito 2 - Availability Core:$(NC)"
	@find hito-2-availability/results -name "*.md" -exec echo "  📄 {}" \; -exec head -20 {} \; 2>/dev/null || echo "  No hay resultados disponibles"
results-summary: ## Resumen ejecutivo de todos los resultados
	@echo "$(CYAN)=== RESUMEN EJECUTIVO ===$(NC)"
	@total_files=0; \
	for hito in hito-*; do \
		if [ -d "$$hito/results" ]; then \
			count=$$(find "$$hito/results" -name "*.md" 2>/dev/null | wc -l); \
			total_files=$$((total_files + count)); \
			echo "$(GREEN)$$hito$(NC): $$count reportes"; \
		fi; \
	done; \
	echo "$(WHITE)Total: $$total_files reportes generados$(NC)"

# ================================
# UTILIDADES
# ================================

health-check: ## Verificar estado de microservicios
	@echo "$(BLUE)Verificando salud de microservicios...$(NC)"
	@services="auth-service:3001 availability-service:3002 resources-service:3003 stockpile-service:3004 reports-service:3005"; \
	for service in $$services; do \
		name=$$(echo $$service | cut -d: -f1); \
		port=$$(echo $$service | cut -d: -f2); \
		url="http://localhost:$$port/api/v1/health"; \
		if curl -f -s $$url >/dev/null 2>&1; then \
			echo "$(GREEN)✓ $$name ($$port)$(NC)"; \
		else \
			echo "$(RED)✗ $$name ($$port)$(NC)"; \
		fi; \
	done

api-status: ## Verificar estado del API Gateway
	@echo "$(BLUE)Verificando API Gateway...$(NC)"
	@if curl -f -s $(API_GATEWAY_URL)/api/v1/health >/dev/null; then \
		echo "$(GREEN)✓ API Gateway disponible en $(API_GATEWAY_URL)$(NC)"; \
	else \
		echo "$(RED)✗ API Gateway no disponible$(NC)"; \
		echo "$(YELLOW)Asegúrate de que el backend esté ejecutándose$(NC)"; \
	fi

setup-env: ## Configurar variables de entorno
	@echo "$(BLUE)Configurando variables de entorno...$(NC)"
	@echo "API_GATEWAY_URL=$(API_GATEWAY_URL)" > .env
	@echo "NODE_ENV=test" >> .env
	@echo "LOG_LEVEL=info" >> .env
	@echo "$(GREEN)✓ Archivo .env creado$(NC)"

# ================================
# LIMPIEZA
# ================================

clean: ## Limpiar archivos generados y cache
	@echo "$(BLUE)Limpiando archivos temporales...$(NC)"
	@rm -rf node_modules/.cache
	@rm -f .env
	@find . -name "*.log" -type f -delete
	@echo "$(GREEN)✓ Limpieza completada$(NC)"

clean-results: ## Limpiar resultados de tests
	@echo "$(BLUE)Limpiando resultados de tests...$(NC)"
	@find . -path "*/results/*.md" -type f -delete
	@echo "$(GREEN)✓ Resultados limpiados$(NC)"

clean-all: clean clean-results ## Limpieza completa
	@echo "$(GREEN)✓ Limpieza completa realizada$(NC)"

# ================================
# DESARROLLO
# ================================

lint: ## Ejecutar linting en archivos JavaScript
	@echo "$(BLUE)Ejecutando linting...$(NC)"
	@$(NVM_SCRIPT) && npx eslint . --ext .js --fix || echo "$(YELLOW)Linting completado con advertencias$(NC)"

format: ## Formatear código con Prettier
	@echo "$(BLUE)Formateando código...$(NC)"
	@$(NVM_SCRIPT) && npx prettier --write '**/*.{js,json,md}'
	@echo "$(GREEN)✓ Código formateado$(NC)"

dev-setup: install setup-env ## Configuración completa para desarrollo
	@echo "$(GREEN)✓ Configuración de desarrollo completada$(NC)"
	@echo "$(CYAN)Ejecutar 'make health-check' para verificar servicios$(NC)"

# ================================
# CI/CD
# ================================

ci-test: install test-implemented ## Tests para CI/CD (solo implementados)
	@echo "$(GREEN)✓ Tests CI/CD completados$(NC)"

ci-full: install test-all ## Tests completos para CI/CD
	@echo "$(GREEN)✓ Tests completos CI/CD finalizados$(NC)"

# ================================
# INFORMACIÓN
# ================================

info: ## Mostrar información del proyecto
	@echo "$(CYAN)BOOKLY API GATEWAY TESTING SUITE$(NC)"
	@echo "$(WHITE)Versión: 1.0.0$(NC)"
	@echo "$(WHITE)Node.js: $(NODE_VERSION)$(NC)"
	@echo "$(WHITE)API Gateway: $(API_GATEWAY_URL)$(NC)"
	@echo ""
	@echo "$(YELLOW)Estructura del proyecto:$(NC)"
	@tree -L 2 -I 'node_modules|.git' . || ls -la

version: ## Mostrar versión
	@echo "Bookly API Gateway Testing Suite v1.0.0"

# ================================
# SCRIPTS DE REFACTORIZACIÓN
# ================================

sync-test-data: ## Sincronizar datos de test con base de datos MongoDB
	@echo "$(BLUE)Sincronizando datos de test...$(NC)"
	@$(NVM_SCRIPT) && node shared/sync-test-data.js
	@echo "$(GREEN)✓ Datos sincronizados$(NC)"

sync-endpoints: ## Validar endpoints de microservicios
	@echo "$(BLUE)Validando endpoints de microservicios...$(NC)"
	@$(NVM_SCRIPT) && node shared/sync-endpoints.js
	@echo "$(GREEN)✓ Endpoints validados$(NC)"

refactor-setup: sync-test-data sync-endpoints ## Ejecutar configuración completa de refactorización
	@echo "$(GREEN)✓ Configuración de refactorización completada$(NC)"

backup-config: ## Crear backup de archivos de configuración
	@echo "$(BLUE)Creando backup de configuración...$(NC)"
	@cp shared/conf-test-data.js shared/conf-test-data.backup.js
	@cp shared/conf-urls-microservices.js shared/conf-urls-microservices.backup.js
	@echo "$(GREEN)✓ Backup creado$(NC)"

restore-config: ## Restaurar archivos de configuración desde backup
	@echo "$(BLUE)Restaurando configuración desde backup...$(NC)"
	@cp shared/conf-test-data.backup.js shared/conf-test-data.js
	@cp shared/conf-urls-microservices.backup.js shared/conf-urls-microservices.js
	@echo "$(GREEN)✓ Configuración restaurada$(NC)"

check-config: ## Verificar validez de archivos de configuración
	@echo "$(BLUE)Verificando archivos de configuración...$(NC)"
	@$(NVM_SCRIPT) && node -e "console.log('Config files check:'); require('./shared/conf-test-data'); require('./shared/conf-urls-microservices'); console.log('✅ All config files are valid');"
	@echo "$(GREEN)✓ Archivos de configuración válidos$(NC)"

# Configuración de Make
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
