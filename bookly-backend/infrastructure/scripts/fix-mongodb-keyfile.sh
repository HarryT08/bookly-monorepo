#!/bin/bash

# =============================================================================
# Fix MongoDB Keyfile - Bookly Backend
# Regenera el keyfile con formato y permisos correctos
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Directorios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
KEYFILE_DIR="$INFRA_DIR/mongodb/keyfile"
KEYFILE_PATH="$KEYFILE_DIR/mongodb-keyfile"

log_info "🔧 Regenerando MongoDB keyfile con formato correcto..."

# Crear directorio si no existe
mkdir -p "$KEYFILE_DIR"

# Backup del keyfile anterior si existe
if [[ -f "$KEYFILE_PATH" ]]; then
    log_warning "Creando backup del keyfile anterior..."
    mv "$KEYFILE_PATH" "$KEYFILE_PATH.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Generar nuevo keyfile (una sola línea, 1024 caracteres base64)
log_info "Generando nuevo keyfile..."
openssl rand -base64 756 | tr -d '\n' > "$KEYFILE_PATH"

# Verificar que se generó correctamente
if [[ ! -f "$KEYFILE_PATH" ]]; then
    log_error "No se pudo generar el keyfile"
    exit 1
fi

# Verificar longitud
KEYFILE_LENGTH=$(wc -c < "$KEYFILE_PATH" | tr -d ' ')
log_info "Longitud del keyfile: $KEYFILE_LENGTH caracteres"

if [[ $KEYFILE_LENGTH -lt 6 ]] || [[ $KEYFILE_LENGTH -gt 1024 ]]; then
    log_error "Keyfile tiene longitud incorrecta (debe ser entre 6 y 1024)"
    exit 1
fi

# Verificar que no tiene saltos de línea
LINE_COUNT=$(wc -l < "$KEYFILE_PATH" | tr -d ' ')
if [[ $LINE_COUNT -ne 0 ]]; then
    log_warning "Keyfile tiene saltos de línea, corrigiendo..."
    tr -d '\n' < "$KEYFILE_PATH" > "$KEYFILE_PATH.tmp"
    mv "$KEYFILE_PATH.tmp" "$KEYFILE_PATH"
fi

# Configurar permisos correctos
log_info "Configurando permisos..."
chmod 400 "$KEYFILE_PATH"

# Verificar permisos
PERMS=$(stat -f "%OLp" "$KEYFILE_PATH" 2>/dev/null || stat -c "%a" "$KEYFILE_PATH" 2>/dev/null)
log_info "Permisos configurados: $PERMS"

# Mostrar información del archivo
log_success "Keyfile generado exitosamente"
log_info "Ubicación: $KEYFILE_PATH"
log_info "Tamaño: $(du -h "$KEYFILE_PATH" | cut -f1)"
log_info "Permisos: $PERMS"

# Crear archivo .gitignore si no existe
if [[ ! -f "$KEYFILE_DIR/.gitignore" ]]; then
    echo "mongodb-keyfile" > "$KEYFILE_DIR/.gitignore"
    echo "*.backup.*" >> "$KEYFILE_DIR/.gitignore"
    log_info ".gitignore creado en $KEYFILE_DIR"
fi

log_success "✅ Keyfile configurado correctamente"
log_warning "⚠️  Reinicia MongoDB para aplicar cambios: make dev-stop && make dev-start"
