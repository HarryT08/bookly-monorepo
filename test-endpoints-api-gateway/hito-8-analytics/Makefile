# Makefile para Hito 8 - Analytics Avanzados
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

.PHONY: help test-all test-predictive test-business test-visualization clean results
.DEFAULT_GOAL := help

help: ## Mostrar ayuda disponible
	@echo "$(MAGENTA)Hito 8 - Analytics Avanzados$(NC)"
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

test-all: ## Ejecutar todos los tests del hito
	@echo "$(MAGENTA)=== EJECUTANDO HITO 8 - ANALYTICS AVANZADOS ===$(NC)"
	@$(MAKE) test-predictive
	@$(MAKE) test-business  
	@$(MAKE) test-visualization
	@echo "$(GREEN)✓ Todos los tests del Hito 8 completados$(NC)"

test-predictive: ## Test: Análisis predictivo y ML
	@echo "$(BLUE)Ejecutando: Predictive Analytics Tests$(NC)"
	@$(NVM_SCRIPT) && node predictive-analytics.js

test-business: ## Test: Business Intelligence
	@echo "$(BLUE)Ejecutando: Business Intelligence Tests$(NC)"
	@$(NVM_SCRIPT) && node business-intelligence.js

test-visualization: ## Test: Visualización de datos
	@echo "$(BLUE)Ejecutando: Data Visualization Tests$(NC)"
	@$(NVM_SCRIPT) && node data-visualization.js

results: ## Ver resultados de los tests
	@echo "$(CYAN)Resultados del Hito 8:$(NC)"
	@find results/ -name "*.md" -exec echo "📄 {}" \; -exec head -5 {} \; 2>/dev/null || echo "$(YELLOW)No hay resultados generados aún$(NC)"

clean: ## Limpiar archivos temporales
	@echo "$(YELLOW)Limpiando archivos temporales del Hito 8...$(NC)"
	@rm -rf results/*.tmp
	@rm -rf *.log
	@echo "$(GREEN)✓ Limpieza completada$(NC)"
