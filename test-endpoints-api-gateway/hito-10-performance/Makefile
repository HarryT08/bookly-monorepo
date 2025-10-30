# Makefile para Hito 10 - Optimización y Performance
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

.PHONY: help test-all test-load test-cache test-database clean results
.DEFAULT_GOAL := help

help: ## Mostrar ayuda disponible
	@echo "$(MAGENTA)Hito 10 - Optimización y Performance$(NC)"
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

test-all: ## Ejecutar todos los tests del hito
	@echo "$(MAGENTA)=== EJECUTANDO HITO 10 - OPTIMIZACIÓN Y PERFORMANCE ===$(NC)"
	@$(MAKE) test-load
	@$(MAKE) test-cache
	@$(MAKE) test-database
	@echo "$(GREEN)✓ Todos los tests del Hito 10 completados$(NC)"

test-load: ## Test: Load testing y stress testing
	@echo "$(BLUE)Ejecutando: Load Testing Tests$(NC)"
	@$(NVM_SCRIPT) && node load-testing.js

test-cache: ## Test: Optimización de caché y CDN
	@echo "$(BLUE)Ejecutando: Caching Optimization Tests$(NC)"
	@$(NVM_SCRIPT) && node caching-optimization.js

test-database: ## Test: Optimización de base de datos
	@echo "$(BLUE)Ejecutando: Database Optimization Tests$(NC)"
	@$(NVM_SCRIPT) && node database-optimization.js

results: ## Ver resultados de los tests
	@echo "$(CYAN)Resultados del Hito 10:$(NC)"
	@find results/ -name "*.md" -exec echo "📄 {}" \; -exec head -5 {} \; 2>/dev/null || echo "$(YELLOW)No hay resultados generados aún$(NC)"

clean: ## Limpiar archivos temporales
	@echo "$(YELLOW)Limpiando archivos temporales del Hito 10...$(NC)"
	@rm -rf results/*.tmp
	@rm -rf *.log
	@echo "$(GREEN)✓ Limpieza completada$(NC)"
