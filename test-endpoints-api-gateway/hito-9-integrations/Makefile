# Makefile para Hito 9 - Integraciones Externas
# Parte del sistema de testing para Bookly API Gateway

# Configuración
SHELL := /bin/bash
NODE_VERSION := 18
NVM_SCRIPT := source ~/.nvm/nvm.sh && nvm use $(NODE_VERSION)

# Colores para output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
MAGENTA := \033[0;35m
CYAN := \033[0;36m
NC := \033[0m

.PHONY: help test-all test-calendars test-sso test-academic clean results
.DEFAULT_GOAL := help

help: ## Mostrar ayuda disponible
	@echo "$(MAGENTA)Hito 9 - Integraciones Externas$(NC)"
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

test-all: ## Ejecutar todos los tests del hito
	@echo "$(MAGENTA)=== EJECUTANDO HITO 9 - INTEGRACIONES EXTERNAS ===$(NC)"
	@$(MAKE) test-calendars
	@$(MAKE) test-sso
	@$(MAKE) test-academic
	@echo "$(GREEN)✓ Todos los tests del Hito 9 completados$(NC)"

test-calendars: ## Test: Integración con calendarios externos
	@echo "$(BLUE)Ejecutando: External Calendars Integration Tests$(NC)"
	@$(NVM_SCRIPT) && node external-calendars.js

test-sso: ## Test: Sistemas SSO y autenticación externa
	@echo "$(BLUE)Ejecutando: SSO Systems Integration Tests$(NC)"
	@$(NVM_SCRIPT) && node sso-systems.js

test-academic: ## Test: Sistemas académicos (SIA, LMS)
	@echo "$(BLUE)Ejecutando: Academic Systems Integration Tests$(NC)"
	@$(NVM_SCRIPT) && node academic-systems.js

results: ## Ver resultados de los tests
	@echo "$(CYAN)Resultados del Hito 9:$(NC)"
	@find results/ -name "*.md" -exec echo "📄 {}" \; -exec head -5 {} \; 2>/dev/null || echo "$(YELLOW)No hay resultados generados aún$(NC)"

clean: ## Limpiar archivos temporales
	@echo "$(YELLOW)Limpiando archivos temporales del Hito 9...$(NC)"
	@rm -rf results/*.tmp
	@rm -rf *.log
	@echo "$(GREEN)✓ Limpieza completada$(NC)"
