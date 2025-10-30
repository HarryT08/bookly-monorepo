#!/bin/bash

# Generar certificados SSL autofirmados para QA - booklyapp.com
# Para producción se deben usar certificados de Let's Encrypt

set -e

DOMAIN="booklyapp.com"
SSL_DIR="nginx/ssl"
DAYS=365

echo "🔐 Generando certificados SSL para QA - ${DOMAIN}..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "nginx" ]; then
    echo "❌ Error: Debe ejecutar este script desde el directorio infrastructure/"
    exit 1
fi

# Crear directorio SSL si no existe
echo "📁 Creando directorio SSL..."
mkdir -p ${SSL_DIR}

# Generar clave privada
echo "🔑 Generando clave privada..."
openssl genrsa -out ${SSL_DIR}/${DOMAIN}.key 2048

# Generar certificado autofirmado
echo "📜 Generando certificado autofirmado (válido por ${DAYS} días)..."
openssl req -new -x509 \
    -key ${SSL_DIR}/${DOMAIN}.key \
    -out ${SSL_DIR}/${DOMAIN}.crt \
    -days ${DAYS} \
    -subj "/C=CO/ST=Norte de Santander/L=Cucuta/O=UFPS/OU=Bookly QA/CN=${DOMAIN}/emailAddress=admin@${DOMAIN}" \
    -addext "subjectAltName=DNS:${DOMAIN},DNS:www.${DOMAIN},DNS:*.${DOMAIN}"

# Configurar permisos
echo "🔒 Configurando permisos..."
chmod 600 ${SSL_DIR}/${DOMAIN}.key
chmod 644 ${SSL_DIR}/${DOMAIN}.crt

echo ""
echo "✅ Certificados SSL generados exitosamente"
echo ""
echo "📋 Archivos creados:"
echo "   - ${SSL_DIR}/${DOMAIN}.key (clave privada)"
echo "   - ${SSL_DIR}/${DOMAIN}.crt (certificado)"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Estos son certificados AUTOFIRMADOS para QA"
echo "   - Los navegadores mostrarán advertencia de seguridad (normal)"
echo "   - Para producción, usar Let's Encrypt con certbot"
echo ""
echo "📊 Información del certificado:"
openssl x509 -in ${SSL_DIR}/${DOMAIN}.crt -noout -subject -issuer -dates
echo ""
echo "🔍 Verificar certificado:"
echo "   openssl x509 -in ${SSL_DIR}/${DOMAIN}.crt -noout -text"
echo ""
echo "🚀 Siguiente paso:"
echo "   make dev-full"
echo ""
