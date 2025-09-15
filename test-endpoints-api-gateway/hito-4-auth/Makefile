# Makefile para Hito 4 - Auth Core + SSO
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

.PHONY: help test-all test-basic-auth test-roles test-oauth test-security clean results
.DEFAULT_GOAL := help

help: ## Mostrar ayuda disponible
	@echo "$(MAGENTA)Hito 4 - Auth Core + SSO$(NC)"
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

test-all: ## Ejecutar todos los tests del hito
	@echo "$(MAGENTA)=== EJECUTANDO HITO 4 - AUTH CORE + SSO ===$(NC)"
	@$(MAKE) test-basic-auth
	@$(MAKE) test-roles  
	@$(MAKE) test-oauth
	@$(MAKE) test-security
	@echo "$(GREEN)✓ Todos los tests del Hito 4 completados$(NC)"

test-basic-auth: ## Test: Autenticación básica
	@echo "$(BLUE)Ejecutando: Basic Authentication Tests$(NC)"
	@$(NVM_SCRIPT) && node basic-auth.js

test-roles: ## Test: Roles y permisos  
	@echo "$(BLUE)Ejecutando: Roles and Permissions Tests$(NC)"
	@$(NVM_SCRIPT) && node roles-permissions.js

test-oauth: ## Test: OAuth y SSO
	@echo "$(BLUE)Ejecutando: OAuth SSO Tests$(NC)"
	@$(NVM_SCRIPT) && node oauth-sso.js

test-security: ## Test: Características de seguridad
	@echo "$(BLUE)Ejecutando: Security Features Tests$(NC)"
	@$(NVM_SCRIPT) && node security-features.js

results: ## Ver resultados de los tests
	@echo "$(CYAN)Resultados del Hito 4:$(NC)"
	@find results/ -name "*.md" -exec echo "📄 {}" \; -exec head -5 {} \; 2>/dev/null || echo "$(YELLOW)No hay resultados generados aún$(NC)"

clean: ## Limpiar archivos temporales
	@echo "$(YELLOW)Limpiando archivos temporales del Hito 4...$(NC)"
	@rm -rf results/*.tmp
	@rm -rf *.log
	@echo "$(GREEN)✓ Limpieza completada$(NC)"
