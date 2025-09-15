# HITO 3 - STOCKPILE CORE MAKEFILE
# Tests para aprobaciones, plantillas de documentos, notificaciones y seguridad

.PHONY: help test-all test-approval test-documents test-notifications test-security results clean
.DEFAULT_GOAL := help

# Variables de configuración
NODE_VERSION := 22.15.0
HITO_DIR := hito-3-stockpile
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

help: ## Mostrar ayuda de comandos disponibles para Hito 3
	@echo "$(CYAN)HITO 3 - STOCKPILE CORE TESTING$(NC)"
	@echo "$(WHITE)Tests para aprobaciones, plantillas, notificaciones y seguridad$(NC)"
	@echo ""
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

# ================================
# TESTS INDIVIDUALES
# ================================

test-approval: ## Ejecutar tests de flujos de aprobación
	@echo "$(BLUE)Ejecutando tests de flujos de aprobación...$(NC)"
	@mkdir -p $(RESULTS_DIR)
	@$(NVM_SCRIPT) && node $(HITO_DIR)/approval-flows.js > $(RESULTS_DIR)/approval-flows-$(shell date +%Y%m%d_%H%M%S).md 2>&1
	@echo "$(GREEN)✓ Tests de aprobación completados$(NC)"

test-documents: ## Ejecutar tests de plantillas de documentos
	@echo "$(BLUE)Ejecutando tests de plantillas de documentos...$(NC)"
	@mkdir -p $(RESULTS_DIR)
	@$(NVM_SCRIPT) && node $(HITO_DIR)/document-templates.js > $(RESULTS_DIR)/document-templates-$(shell date +%Y%m%d_%H%M%S).md 2>&1
	@echo "$(GREEN)✓ Tests de documentos completados$(NC)"

test-notifications: ## Ejecutar tests del sistema de notificaciones
	@echo "$(BLUE)Ejecutando tests del sistema de notificaciones...$(NC)"
	@mkdir -p $(RESULTS_DIR)
	@$(NVM_SCRIPT) && node $(HITO_DIR)/notification-system.js > $(RESULTS_DIR)/notification-system-$(shell date +%Y%m%d_%H%M%S).md 2>&1
	@echo "$(GREEN)✓ Tests de notificaciones completados$(NC)"

test-security: ## Ejecutar tests de validación y seguridad
	@echo "$(BLUE)Ejecutando tests de validación y seguridad...$(NC)"
	@mkdir -p $(RESULTS_DIR)
	@$(NVM_SCRIPT) && node $(HITO_DIR)/validation-security.js > $(RESULTS_DIR)/validation-security-$(shell date +%Y%m%d_%H%M%S).md 2>&1
	@echo "$(GREEN)✓ Tests de seguridad completados$(NC)"

# ================================
# TESTS COMBINADOS
# ================================

test-all: test-approval test-documents test-notifications test-security ## Ejecutar todos los tests del Hito 3
	@echo "$(MAGENTA)🎉 Todos los tests del Hito 3 completados$(NC)"
	@echo "$(WHITE)Resultados guardados en: $(RESULTS_DIR)$(NC)"

test-core: test-approval test-documents ## Ejecutar tests core (aprobaciones y documentos)
	@echo "$(GREEN)✓ Tests core del Hito 3 completados$(NC)"

test-advanced: test-notifications test-security ## Ejecutar tests avanzados (notificaciones y seguridad)
	@echo "$(GREEN)✓ Tests avanzados del Hito 3 completados$(NC)"

test-workflow: test-approval test-notifications ## Ejecutar tests de flujo de trabajo (aprobaciones y notificaciones)
	@echo "$(GREEN)✓ Tests de flujo de trabajo del Hito 3 completados$(NC)"

# ================================
# RESULTADOS Y REPORTES
# ================================

results: ## Ver resumen de resultados de tests
	@echo "$(CYAN)📊 RESULTADOS HITO 3 - STOCKPILE CORE$(NC)"
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

results-approval: ## Ver resultados específicos de tests de aprobación
	@echo "$(CYAN)📋 Resultados Approval Flows$(NC)"
	@find $(RESULTS_DIR) -name "approval-flows-*.md" -type f -exec echo "$(GREEN)✓$(NC) {}" \; | head -5

results-documents: ## Ver resultados específicos de tests de documentos
	@echo "$(CYAN)📋 Resultados Document Templates$(NC)"
	@find $(RESULTS_DIR) -name "document-templates-*.md" -type f -exec echo "$(GREEN)✓$(NC) {}" \; | head -5

results-notifications: ## Ver resultados específicos de tests de notificaciones
	@echo "$(CYAN)📋 Resultados Notification System$(NC)"
	@find $(RESULTS_DIR) -name "notification-system-*.md" -type f -exec echo "$(GREEN)✓$(NC) {}" \; | head -5

results-security: ## Ver resultados específicos de tests de seguridad
	@echo "$(CYAN)📋 Resultados Validation Security$(NC)"
	@find $(RESULTS_DIR) -name "validation-security-*.md" -type f -exec echo "$(GREEN)✓$(NC) {}" \; | head -5

# ================================
# UTILIDADES
# ================================

clean: ## Limpiar archivos de resultados
	@echo "$(YELLOW)🧹 Limpiando resultados del Hito 3...$(NC)"
	@rm -rf $(RESULTS_DIR)
	@echo "$(GREEN)✓ Resultados limpiados$(NC)"

status: ## Mostrar estado actual del Hito 3
	@echo "$(CYAN)📊 ESTADO HITO 3 - STOCKPILE CORE$(NC)"
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

info: ## Mostrar información del Hito 3
	@echo "$(CYAN)ℹ️  INFORMACIÓN HITO 3 - STOCKPILE CORE$(NC)"
	@echo "$(WHITE)Descripción: Tests para aprobaciones y validaciones$(NC)"
	@echo "$(WHITE)Flujos incluidos:$(NC)"
	@echo "  $(GREEN)•$(NC) Flujos de aprobación"
	@echo "  $(GREEN)•$(NC) Plantillas de documentos"
	@echo "  $(GREEN)•$(NC) Sistema de notificaciones"
	@echo "  $(GREEN)•$(NC) Validación y seguridad"
	@echo ""
	@echo "$(WHITE)Endpoints principales:$(NC)"
	@echo "  $(GREEN)•$(NC) GET/POST/PUT /api/v1/stockpile/approval-requests"
	@echo "  $(GREEN)•$(NC) GET/POST/PUT /api/v1/stockpile/document-templates"
	@echo "  $(GREEN)•$(NC) GET/POST /api/v1/stockpile/notifications"
	@echo "  $(GREEN)•$(NC) GET/POST /api/v1/stockpile/security"

# Configuración de Make
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
