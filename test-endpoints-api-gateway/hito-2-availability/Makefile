# HITO 2 - AVAILABILITY CORE MAKEFILE
# Tests para disponibilidad, reservas, búsquedas y calendarios

.PHONY: help test-all test-basic test-search test-calendar test-reassignment test-tracking results clean
.DEFAULT_GOAL := help

# Variables de configuración
NODE_VERSION := 22.15.0
HITO_DIR := hito-2-availability
RESULTS_DIR := $(HITO_DIR)/results
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

help: ## Mostrar ayuda de comandos disponibles para Hito 2
	@echo "$(CYAN)HITO 2 - AVAILABILITY CORE TESTING$(NC)"
	@echo "$(WHITE)Tests para disponibilidad, reservas, búsquedas y calendarios$(NC)"
	@echo ""
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

# ================================
# TESTS INDIVIDUALES
# ================================

test-basic: ## Ejecutar tests de disponibilidad básica
	@echo "$(BLUE)Ejecutando tests de disponibilidad básica...$(NC)"
	@mkdir -p $(RESULTS_DIR)
	@$(NVM_SCRIPT) && node $(HITO_DIR)/basic-availability.js > $(RESULTS_DIR)/basic-availability-$(shell date +%Y%m%d_%H%M%S).md 2>&1
	@echo "$(GREEN)✓ Tests de disponibilidad básica completados$(NC)"

test-search: ## Ejecutar tests de búsqueda avanzada
	@echo "$(BLUE)Ejecutando tests de búsqueda avanzada...$(NC)"
	@mkdir -p $(RESULTS_DIR)
	@$(NVM_SCRIPT) && node $(HITO_DIR)/advanced-search.js > $(RESULTS_DIR)/advanced-search-$(shell date +%Y%m%d_%H%M%S).md 2>&1
	@echo "$(GREEN)✓ Tests de búsqueda avanzada completados$(NC)"

test-calendar: ## Ejecutar tests de integración con calendario
	@echo "$(BLUE)Ejecutando tests de integración con calendario...$(NC)"
	@mkdir -p $(RESULTS_DIR)
	@$(NVM_SCRIPT) && node $(HITO_DIR)/calendar-integration.js > $(RESULTS_DIR)/calendar-integration-$(shell date +%Y%m%d_%H%M%S).md 2>&1
	@echo "$(GREEN)✓ Tests de calendario completados$(NC)"

test-reassignment: ## Ejecutar tests de sistema de reasignación
	@echo "$(BLUE)Ejecutando tests de sistema de reasignación...$(NC)"
	@mkdir -p $(RESULTS_DIR)
	@$(NVM_SCRIPT) && node $(HITO_DIR)/reassignment-system.js > $(RESULTS_DIR)/reassignment-system-$(shell date +%Y%m%d_%H%M%S).md 2>&1
	@echo "$(GREEN)✓ Tests de reasignación completados$(NC)"

test-tracking: ## Ejecutar tests de seguimiento de uso
	@echo "$(BLUE)Ejecutando tests de seguimiento de uso...$(NC)"
	@mkdir -p $(RESULTS_DIR)
	@$(NVM_SCRIPT) && node $(HITO_DIR)/usage-tracking.js > $(RESULTS_DIR)/usage-tracking-$(shell date +%Y%m%d_%H%M%S).md 2>&1
	@echo "$(GREEN)✓ Tests de seguimiento completados$(NC)"

# ================================
# TESTS COMBINADOS
# ================================

test-all: test-basic test-search test-calendar test-reassignment test-tracking ## Ejecutar todos los tests del Hito 2
	@echo "$(MAGENTA)🎉 Todos los tests del Hito 2 completados$(NC)"
	@echo "$(WHITE)Resultados guardados en: $(RESULTS_DIR)$(NC)"

test-core: test-basic test-search ## Ejecutar tests core (disponibilidad básica y búsqueda)
	@echo "$(GREEN)✓ Tests core del Hito 2 completados$(NC)"

test-advanced: test-calendar test-reassignment test-tracking ## Ejecutar tests avanzados (calendario, reasignación, seguimiento)
	@echo "$(GREEN)✓ Tests avanzados del Hito 2 completados$(NC)"

test-integration: test-calendar test-tracking ## Ejecutar tests de integración (calendario y seguimiento)
	@echo "$(GREEN)✓ Tests de integración del Hito 2 completados$(NC)"

# ================================
# RESULTADOS Y REPORTES
# ================================

results: ## Ver resumen de resultados de tests
	@echo "$(CYAN)📊 RESULTADOS HITO 2 - AVAILABILITY CORE$(NC)"
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

results-basic: ## Ver resultados específicos de tests de disponibilidad básica
	@echo "$(CYAN)📋 Resultados Basic Availability$(NC)"
	@find $(RESULTS_DIR) -name "basic-availability-*.md" -type f -exec echo "$(GREEN)✓$(NC) {}" \; | head -5

results-search: ## Ver resultados específicos de tests de búsqueda avanzada
	@echo "$(CYAN)📋 Resultados Advanced Search$(NC)"
	@find $(RESULTS_DIR) -name "advanced-search-*.md" -type f -exec echo "$(GREEN)✓$(NC) {}" \; | head -5

results-calendar: ## Ver resultados específicos de tests de calendario
	@echo "$(CYAN)📋 Resultados Calendar Integration$(NC)"
	@find $(RESULTS_DIR) -name "calendar-integration-*.md" -type f -exec echo "$(GREEN)✓$(NC) {}" \; | head -5

results-reassignment: ## Ver resultados específicos de tests de reasignación
	@echo "$(CYAN)📋 Resultados Reassignment System$(NC)"
	@find $(RESULTS_DIR) -name "reassignment-system-*.md" -type f -exec echo "$(GREEN)✓$(NC) {}" \; | head -5

results-tracking: ## Ver resultados específicos de tests de seguimiento
	@echo "$(CYAN)📋 Resultados Usage Tracking$(NC)"
	@find $(RESULTS_DIR) -name "usage-tracking-*.md" -type f -exec echo "$(GREEN)✓$(NC) {}" \; | head -5

# ================================
# UTILIDADES
# ================================

clean: ## Limpiar archivos de resultados
	@echo "$(YELLOW)🧹 Limpiando resultados del Hito 2...$(NC)"
	@rm -rf $(RESULTS_DIR)
	@echo "$(GREEN)✓ Resultados limpiados$(NC)"

status: ## Mostrar estado actual del Hito 2
	@echo "$(CYAN)📊 ESTADO HITO 2 - AVAILABILITY CORE$(NC)"
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

info: ## Mostrar información del Hito 2
	@echo "$(CYAN)ℹ️  INFORMACIÓN HITO 2 - AVAILABILITY CORE$(NC)"
	@echo "$(WHITE)Descripción: Tests para disponibilidad y reservas$(NC)"
	@echo "$(WHITE)Flujos incluidos:$(NC)"
	@echo "  $(GREEN)•$(NC) Disponibilidad básica"
	@echo "  $(GREEN)•$(NC) Búsqueda avanzada"
	@echo "  $(GREEN)•$(NC) Integración con calendario"
	@echo "  $(GREEN)•$(NC) Sistema de reasignación"
	@echo "  $(GREEN)•$(NC) Seguimiento de uso"
	@echo ""
	@echo "$(WHITE)Endpoints principales:$(NC)"
	@echo "  $(GREEN)•$(NC) GET /api/v1/availability/basic"
	@echo "  $(GREEN)•$(NC) GET /api/v1/availability/search"
	@echo "  $(GREEN)•$(NC) GET/POST /api/v1/availability/calendar"
	@echo "  $(GREEN)•$(NC) GET/POST/PUT /api/v1/availability/reservations"
	@echo "  $(GREEN)•$(NC) GET/POST /api/v1/availability/reassignment-requests"

# Configuración de Make
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
