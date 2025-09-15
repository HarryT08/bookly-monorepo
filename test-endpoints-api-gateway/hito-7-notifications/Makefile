# Makefile para Hito 7 - Notificaciones Avanzadas
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

.PHONY: help test-all test-realtime test-messaging test-templates clean results
.DEFAULT_GOAL := help

help: ## Mostrar ayuda disponible
	@echo "$(MAGENTA)Hito 7 - Notificaciones Avanzadas$(NC)"
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

test-all: ## Ejecutar todos los tests del hito
	@echo "$(MAGENTA)=== EJECUTANDO HITO 7 - NOTIFICACIONES AVANZADAS ===$(NC)"
	@$(MAKE) test-realtime
	@$(MAKE) test-messaging  
	@$(MAKE) test-templates
	@echo "$(GREEN)✓ Todos los tests del Hito 7 completados$(NC)"

test-realtime: ## Test: Notificaciones en tiempo real
	@echo "$(BLUE)Ejecutando: Real-time Notifications Tests$(NC)"
	@$(NVM_SCRIPT) && node real-time-notifications.js

test-messaging: ## Test: Integración de mensajería
	@echo "$(BLUE)Ejecutando: Messaging Integrations Tests$(NC)"
	@$(NVM_SCRIPT) && node messaging-integrations.js

test-templates: ## Test: Plantillas de notificación
	@echo "$(BLUE)Ejecutando: Notification Templates Tests$(NC)"
	@$(NVM_SCRIPT) && node notification-templates.js

results: ## Ver resultados de los tests
	@echo "$(CYAN)Resultados del Hito 7:$(NC)"
	@find results/ -name "*.md" -exec echo "📄 {}" \; -exec head -5 {} \; 2>/dev/null || echo "$(YELLOW)No hay resultados generados aún$(NC)"

clean: ## Limpiar archivos temporales
	@echo "$(YELLOW)Limpiando archivos temporales del Hito 7...$(NC)"
	@rm -rf results/*.tmp
	@rm -rf *.log
	@echo "$(GREEN)✓ Limpieza completada$(NC)"
