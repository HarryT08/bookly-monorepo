// Script de inicialización para MongoDB Replica Set
// Configura el conjunto de réplicas para Bookly

print('=== Inicializando MongoDB Replica Set para Bookly ===');

// Configuración del replica set
var config = {
  "_id": "bookly-rs",
  "version": 1,
  "members": [
    {
      "_id": 0,
      "host": "mongodb-primary:27017",
      "priority": 3
    },
    {
      "_id": 1,
      "host": "mongodb-secondary1:27018",
      "priority": 2
    },
    {
      "_id": 2,
      "host": "mongodb-secondary2:27019",
      "priority": 1
    }
  ]
};

// Inicializar replica set
try {
  print('Iniciando configuración del replica set...');
  rs.initiate(config);
  
  print('Esperando que el replica set esté listo...');
  
  // Esperar hasta que el replica set esté configurado
  var status;
  var attempts = 0;
  var maxAttempts = 30;
  
  do {
    sleep(2000); // Esperar 2 segundos
    attempts++;
    try {
      status = rs.status();
      print('Intento ' + attempts + ' - Estado: ' + status.ok);
    } catch (e) {
      print('Intento ' + attempts + ' - Esperando inicialización...');
    }
  } while (attempts < maxAttempts && (!status || status.ok !== 1));
  
  if (status && status.ok === 1) {
    print('✅ Replica set configurado exitosamente');
    
    // Crear usuario administrativo para la aplicación
    print('Creando usuario de aplicación...');
    
    // Cambiar a la base de datos admin para crear usuarios
    db = db.getSiblingDB('admin');
    
    try {
      db.createUser({
        user: 'bookly',
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
    
    // Crear la base de datos principal
    print('Inicializando base de datos bookly...');
    db = db.getSiblingDB('bookly');
    
    // Crear una colección inicial para asegurar que la BD existe
    db.createCollection('_init');
    db._init.insertOne({ initialized: true, timestamp: new Date() });
    
    print('✅ Base de datos bookly inicializada');
    print('=== Configuración completada exitosamente ===');
    
  } else {
    print('❌ Error: No se pudo configurar el replica set después de ' + maxAttempts + ' intentos');
  }
  
} catch (e) {
  print('❌ Error inicializando replica set: ' + e.message);
}
