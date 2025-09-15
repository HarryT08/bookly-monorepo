# HITO 1 - RESOURCES CORE MAKEFILE
# Tests para gestión de recursos, categorías, programas y mantenimiento

.PHONY: help test-all test-crud test-categories test-programs test-import-export test-maintenance results clean
.DEFAULT_GOAL := help

# Variables de configuración
NODE_VERSION := 22.15.0
HITO_DIR := hito-1-resources
RESULTS_DIR := ./results
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

help: ## Mostrar ayuda de comandos disponibles para Hito 1
	@echo "$(CYAN)HITO 1 - RESOURCES CORE TESTING$(NC)"
	@echo "$(WHITE)Tests para gestión de recursos, categorías, programas y mantenimiento$(NC)"
	@echo ""
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

# ================================
# TESTS INDIVIDUALES
# ================================

test-crud: ## Ejecutar tests CRUD de recursos
	@echo "$(BLUE)Ejecutando tests CRUD de recursos...$(NC)"
	@mkdir -p $(RESULTS_DIR)
	@$(NVM_SCRIPT) && node ./crud-resources.js > $(RESULTS_DIR)/crud-resources-$(shell date +%Y%m%d_%H%M%S).md 2>&1
	@echo "$(GREEN)✓ Tests CRUD completados$(NC)"

test-categories: ## Ejecutar tests de gestión de categorías
	@echo "$(BLUE)Ejecutando tests de categorías...$(NC)"
	@mkdir -p $(RESULTS_DIR)
	@$(NVM_SCRIPT) && node $(HITO_DIR)/manage-categories.js > $(RESULTS_DIR)/manage-categories-$(shell date +%Y%m%d_%H%M%S).md 2>&1
	@echo "$(GREEN)✓ Tests de categorías completados$(NC)"

test-programs: ## Ejecutar tests de gestión de programas académicos
	@echo "$(BLUE)Ejecutando tests de programas académicos...$(NC)"
	@mkdir -p $(RESULTS_DIR)
	@$(NVM_SCRIPT) && node $(HITO_DIR)/manage-programs.js > $(RESULTS_DIR)/manage-programs-$(shell date +%Y%m%d_%H%M%S).md 2>&1
	@echo "$(GREEN)✓ Tests de programas completados$(NC)"

test-import-export: ## Ejecutar tests de importación y exportación
	@echo "$(BLUE)Ejecutando tests de import/export...$(NC)"
	@mkdir -p $(RESULTS_DIR)
	@$(NVM_SCRIPT) && node $(HITO_DIR)/import-export.js > $(RESULTS_DIR)/import-export-$(shell date +%Y%m%d_%H%M%S).md 2>&1
	@echo "$(GREEN)✓ Tests de import/export completados$(NC)"

test-maintenance: ## Ejecutar tests de mantenimiento de recursos
	@echo "$(BLUE)Ejecutando tests de mantenimiento...$(NC)"
	@mkdir -p $(RESULTS_DIR)
	@$(NVM_SCRIPT) && node $(HITO_DIR)/maintenance.js > $(RESULTS_DIR)/maintenance-$(shell date +%Y%m%d_%H%M%S).md 2>&1
	@echo "$(GREEN)✓ Tests de mantenimiento completados$(NC)"

# ================================
# TESTS COMBINADOS
# ================================

test-all: test-crud test-categories test-programs test-import-export test-maintenance ## Ejecutar todos los tests del Hito 1
	@echo "$(MAGENTA)🎉 Todos los tests del Hito 1 completados$(NC)"
	@echo "$(WHITE)Resultados guardados en: $(RESULTS_DIR)$(NC)"

test-core: test-crud test-categories test-programs ## Ejecutar tests core (sin import/export ni mantenimiento)
	@echo "$(GREEN)✓ Tests core del Hito 1 completados$(NC)"

test-advanced: test-import-export test-maintenance ## Ejecutar tests avanzados (import/export y mantenimiento)
	@echo "$(GREEN)✓ Tests avanzados del Hito 1 completados$(NC)"

# ================================
# RESULTADOS Y REPORTES
# ================================

results: ## Ver resumen de resultados de tests
	@echo "$(CYAN)📊 RESULTADOS HITO 1 - RESOURCES CORE$(NC)"
	@if [ -d "$(RESULTS_DIR)" ]; then \
		echo "$(WHITE)Archivos de resultados encontrados:$(NC)"; \
		find $(RESULTS_DIR) -name "*.md" -type f -exec echo "  $(GREEN)✓$(NC) {}" \; | sort; \
		echo ""; \
		echo "$(YELLOW)Últimos 3 resultados:$(NC)"; \
		find $(RESULTS_DIR) -name "*.md" -type f -exec ls -la {} \; | sort -k9 | tail -3; \
	else \
		echo "$(RED)❌ No hay resultados disponibles$(NC)"; \
		echo "$(WHITE)Ejecute 'make test-all' para generar resultados$(NC)"; \
	fi

results-crud: ## Ver resultados específicos de tests CRUD
	@echo "$(CYAN)📋 Resultados CRUD Resources$(NC)"
	@find $(RESULTS_DIR) -name "crud-resources-*.md" -type f -exec echo "$(GREEN)✓$(NC) {}" \; | head -5

results-categories: ## Ver resultados específicos de tests de categorías
	@echo "$(CYAN)📋 Resultados Manage Categories$(NC)"
	@find $(RESULTS_DIR) -name "manage-categories-*.md" -type f -exec echo "$(GREEN)✓$(NC) {}" \; | head -5

results-programs: ## Ver resultados específicos de tests de programas
	@echo "$(CYAN)📋 Resultados Manage Programs$(NC)"
	@find $(RESULTS_DIR) -name "manage-programs-*.md" -type f -exec echo "$(GREEN)✓$(NC) {}" \; | head -5

results-import-export: ## Ver resultados específicos de tests import/export
	@echo "$(CYAN)📋 Resultados Import/Export$(NC)"
	@find $(RESULTS_DIR) -name "import-export-*.md" -type f -exec echo "$(GREEN)✓$(NC) {}" \; | head -5

results-maintenance: ## Ver resultados específicos de tests de mantenimiento
	@echo "$(CYAN)📋 Resultados Maintenance$(NC)"
	@find $(RESULTS_DIR) -name "maintenance-*.md" -type f -exec echo "$(GREEN)✓$(NC) {}" \; | head -5

# ================================
# UTILIDADES
# ================================

clean: ## Limpiar archivos de resultados
	@echo "$(YELLOW)🧹 Limpiando resultados del Hito 1...$(NC)"
	@rm -rf $(RESULTS_DIR)
	@echo "$(GREEN)✓ Resultados limpiados$(NC)"

status: ## Mostrar estado actual del Hito 1
	@echo "$(CYAN)📊 ESTADO HITO 1 - RESOURCES CORE$(NC)"
	@echo "$(WHITE)Directorio: $(HITO_DIR)$(NC)"
	@echo "$(WHITE)Resultados: $(RESULTS_DIR)$(NC)"
	@echo ""
	@echo "$(YELLOW)Archivos de test disponibles:$(NC)"
	@ls -la $(HITO_DIR)/*.js 2>/dev/null | awk '{print "  $(GREEN)✓$(NC) " $$9}' || echo "  $(RED)❌ No hay archivos de test$(NC)"
	@echo ""
	@if [ -d "$(RESULTS_DIR)" ]; then \
		echo "$(YELLOW)Total de resultados: $(NC)$$(find $(RESULTS_DIR) -name "*.md" | wc -l)"; \
	else \
		echo "$(YELLOW)Total de resultados: $(NC)0"; \
	fi

info: ## Mostrar información del Hito 1
	@echo "$(CYAN)ℹ️  INFORMACIÓN HITO 1 - RESOURCES CORE$(NC)"
	@echo "$(WHITE)Descripción: Tests para gestión completa de recursos$(NC)"
	@echo "$(WHITE)Flujos incluidos:$(NC)"
	@echo "  $(GREEN)•$(NC) CRUD de recursos"
	@echo "  $(GREEN)•$(NC) Gestión de categorías"
	@echo "  $(GREEN)•$(NC) Gestión de programas académicos"
	@echo "  $(GREEN)•$(NC) Importación y exportación"
	@echo "  $(GREEN)•$(NC) Mantenimiento de recursos"
	@echo ""
	@echo "$(WHITE)Endpoints principales:$(NC)"
	@echo "  $(GREEN)•$(NC) GET/POST/PUT/DELETE /api/v1/resources"
	@echo "  $(GREEN)•$(NC) GET/POST/PUT/DELETE /api/v1/resources/resource-categories"
	@echo "  $(GREEN)•$(NC) GET/POST/PUT/DELETE /api/v1/resources/programs"
	@echo "  $(GREEN)•$(NC) POST /api/v1/resources/import/csv"
	@echo "  $(GREEN)•$(NC) GET /api/v1/resources/export/template"

# Configuración de Make
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
