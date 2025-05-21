#!/bin/bash

# Script para ejecutar todas las pruebas de auth-app y sus microservicios

# Inicializar NVM
source ~/.nvm/nvm.sh
nvm use v22.12.0

# Obtener el directorio de este script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../../" && pwd)"

# Imprimir información del entorno
echo "=== Entorno de Pruebas ==="
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Directorio raíz: ${ROOT_DIR}"
echo ""

# Función para ejecutar pruebas
run_tests() {
  local service_name=$1
  echo "=== Ejecutando pruebas de ${service_name} ==="
  cd "${ROOT_DIR}"
  npx nx test "${service_name}" --no-watch || {
    echo "❌ Las pruebas de ${service_name} han fallado."
    return 1
  }
  echo "✅ Pruebas de ${service_name} completadas con éxito."
  echo ""
  return 0
}

# Iniciar conteo de resultados
total_services=4
passed_services=0
failed_services=0

# Ejecutar pruebas de auth-app primero
echo "=== Iniciando pruebas de Auth App ==="
run_tests "auth-app"
if [ $? -eq 0 ]; then
  passed_services=$((passed_services+1))
else
  failed_services=$((failed_services+1))
fi

# Ejecutar pruebas de los microservicios
services=("auth-service" "users-service" "roles-service")

for service in "${services[@]}"; do
  run_tests "${service}"
  if [ $? -eq 0 ]; then
    passed_services=$((passed_services+1))
  else
    failed_services=$((failed_services+1))
  fi
done

# Mostrar resumen de resultados
echo "=== Resumen de Pruebas ==="
echo "Total de servicios probados: ${total_services}"
echo "Servicios con pruebas exitosas: ${passed_services}"
echo "Servicios con pruebas fallidas: ${failed_services}"

# Determinar si todas las pruebas pasaron
if [ "${failed_services}" -eq 0 ]; then
  echo "✅ TODAS LAS PRUEBAS HAN PASADO EXITOSAMENTE"
  exit 0
else
  echo "❌ ALGUNAS PRUEBAS HAN FALLADO"
  exit 1
fi
