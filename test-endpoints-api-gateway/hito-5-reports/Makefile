# Makefile para Hito 5 - Reports Core
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

.PHONY: help test-all test-usage test-users test-dashboard test-export clean results
.DEFAULT_GOAL := help

help: ## Mostrar ayuda disponible
	@echo "$(MAGENTA)Hito 5 - Reports Core$(NC)"
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

test-all: ## Ejecutar todos los tests del hito
	@echo "$(MAGENTA)=== EJECUTANDO HITO 5 - REPORTS CORE ===$(NC)"
	@$(MAKE) test-usage
	@$(MAKE) test-users  
	@$(MAKE) test-dashboard
	@$(MAKE) test-export
	@echo "$(GREEN)✓ Todos los tests del Hito 5 completados$(NC)"

test-usage: ## Test: Reportes de uso y utilización
	@echo "$(BLUE)Ejecutando: Usage Reports Tests$(NC)"
	@$(NVM_SCRIPT) && node usage-reports.js

test-users: ## Test: Reportes de usuarios  
	@echo "$(BLUE)Ejecutando: User Reports Tests$(NC)"
	@$(NVM_SCRIPT) && node user-reports.js

test-dashboard: ## Test: Dashboard y analytics
	@echo "$(BLUE)Ejecutando: Dashboard Analytics Tests$(NC)"
	@$(NVM_SCRIPT) && node dashboard-analytics.js

test-export: ## Test: Exportación de reportes
	@echo "$(BLUE)Ejecutando: Export Reports Tests$(NC)"
	@$(NVM_SCRIPT) && node export-reports.js

results: ## Ver resultados de los tests
	@echo "$(CYAN)Resultados del Hito 5:$(NC)"
	@find results/ -name "*.md" -exec echo "📄 {}" \; -exec head -5 {} \; 2>/dev/null || echo "$(YELLOW)No hay resultados generados aún$(NC)"

clean: ## Limpiar archivos temporales
	@echo "$(YELLOW)Limpiando archivos temporales del Hito 5...$(NC)"
	@rm -rf results/*.tmp
	@rm -rf *.log
	@echo "$(GREEN)✓ Limpieza completada$(NC)"
