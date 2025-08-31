#!/bin/bash

# Script de inicialización automática del replica set MongoDB
# Se ejecuta después de que todos los nodos estén listos

set -e

echo "=== Inicializando MongoDB Replica Set Automáticamente ==="

# Esperar a que todos los nodos estén disponibles
echo "Esperando a que todos los nodos MongoDB estén listos..."

# Función para verificar si un nodo está listo
check_node() {
    local host=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if mongosh --host "$host" --port "$port" --eval "db.adminCommand('ping')" --quiet 2>/dev/null; then
            echo "✓ $host:$port está listo"
            return 0
        fi
        echo "Intento $attempt/$max_attempts - Esperando $host:$port..."
        sleep 2
        ((attempt++))
    done
    
    echo "✗ $host:$port no está disponible después de $max_attempts intentos"
    return 1
}

# Verificar cada nodo
check_node "mongodb-primary" "27017"
check_node "mongodb-secondary1" "27018" 
check_node "mongodb-secondary2" "27019"

echo "Todos los nodos MongoDB están listos. Inicializando replica set..."

# Verificar si el replica set ya está inicializado
if mongosh --host mongodb-primary --port 27017 -u bookly -p bookly123 --authenticationDatabase admin --eval "rs.status()" --quiet 2>/dev/null | grep -q "bookly-rs"; then
    echo "ℹ️ Replica set ya está inicializado"
    exit 0
fi

# Inicializar replica set
echo "Iniciando configuración del replica set..."

mongosh --host mongodb-primary --port 27017 -u bookly -p bookly123 --authenticationDatabase admin --eval "
try {
    rs.initiate({
        '_id': 'bookly-rs',
        'version': 1,
        'members': [
            {'_id': 0, 'host': 'mongodb-primary:27017', 'priority': 3},
            {'_id': 1, 'host': 'mongodb-secondary1:27018', 'priority': 2},
            {'_id': 2, 'host': 'mongodb-secondary2:27019', 'priority': 1}
        ]
    });
    print('✅ Replica set inicializado correctamente');
} catch (e) {
    if (e.code === 23) {
        print('ℹ️ Replica set ya existe');
    } else {
        print('❌ Error inicializando replica set: ' + e.message);
        throw e;
    }
}
"

# Esperar a que el replica set esté completamente configurado
echo "Esperando a que el replica set esté completamente configurado..."
sleep 10

# Verificar estado del replica set
echo "Verificando estado del replica set..."
mongosh --host mongodb-primary --port 27017 -u bookly -p bookly123 --authenticationDatabase admin --eval "
var status = rs.status();
if (status.ok === 1) {
    print('✅ Replica set configurado exitosamente');
    print('PRIMARY: ' + status.members.find(m => m.stateStr === 'PRIMARY').name);
    print('SECONDARY: ' + status.members.filter(m => m.stateStr === 'SECONDARY').map(m => m.name).join(', '));
} else {
    print('❌ Error en configuración del replica set');
    throw new Error('Replica set no está funcionando correctamente');
}
"

# Crear usuario de aplicación si no existe
echo "Verificando usuario de aplicación..."
mongosh --host mongodb-primary --port 27017 -u bookly -p bookly123 --authenticationDatabase admin --eval "
try {
    db.getSiblingDB('admin').createUser({
        user: 'bookly-app',
        pwd: 'bookly123',
        roles: [
            { role: 'dbOwner', db: 'bookly' },
            { role: 'readWrite', db: 'bookly' },
            { role: 'clusterMonitor', db: 'admin' }
        ]
    });
    print('✅ Usuario de aplicación creado');
} catch (e) {
    if (e.code === 51003) {
        print('ℹ️ Usuario de aplicación ya existe');
    } else {
        print('❌ Error creando usuario: ' + e.message);
    }
}
"

# Inicializar base de datos bookly
echo "Inicializando base de datos bookly..."
mongosh --host mongodb-primary --port 27017 -u bookly -p bookly123 --authenticationDatabase admin --eval "
db = db.getSiblingDB('bookly');
try {
    db.createCollection('_init');
    db._init.insertOne({ initialized: true, timestamp: new Date(), version: '1.0.0' });
    print('✅ Base de datos bookly inicializada');
} catch (e) {
    print('ℹ️ Base de datos bookly ya existe');
}
"

echo "=== Configuración de MongoDB Replica Set completada exitosamente ==="
