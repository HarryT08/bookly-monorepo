#!/usr/bin/env node

/**
 * Script para sincronizar datos de prueba con las semillas de la base de datos
 * Conecta a MongoDB y actualiza conf-test-data.js con datos reales
 */

const fs = require('fs').promises;
const path = require('path');
const { logger } = require('./logger');

// MongoDB connection (adjust according to your setup)
const MONGO_CONNECTION = process.env.MONGO_URL || 'mongodb://localhost:27017,localhost:27018,localhost:27019/bookly?replicaSet=rs0';

class TestDataSyncer {
  constructor() {
    this.configPath = path.join(__dirname, 'conf-test-data.js');
    this.backupPath = path.join(__dirname, 'conf-test-data.backup.js');
  }

  async syncWithDatabase() {
    logger.info('🔄 Iniciando sincronización de datos de prueba...');
    
    try {
      // Backup current config
      await this.backupCurrentConfig();
      
      // Connect to database
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(MONGO_CONNECTION);
      await client.connect();
      
      const db = client.db('bookly');
      logger.info('✅ Conectado a MongoDB');
      
      // Sync different collections
      const syncedData = {
        users: await this.syncUsers(db),
        resources: await this.syncResources(db),
        categories: await this.syncCategories(db),
        programs: await this.syncPrograms(db)
      };
      
      // Update config file
      await this.updateConfigFile(syncedData);
      
      await client.close();
      logger.info('✅ Sincronización completada exitosamente');
      
      return syncedData;
      
    } catch (error) {
      logger.error('❌ Error durante sincronización:', error.message);
      await this.restoreBackup();
      throw error;
    }
  }

  async backupCurrentConfig() {
    try {
      const currentConfig = await fs.readFile(this.configPath, 'utf8');
      await fs.writeFile(this.backupPath, currentConfig);
      logger.info('📄 Backup creado: conf-test-data.backup.js');
    } catch (error) {
      logger.warn('⚠️ No se pudo crear backup:', error.message);
    }
  }

  async syncUsers(db) {
    logger.info('👤 Sincronizando usuarios...');
    
    const users = await db.collection('User').find({
      email: { $in: [
        'admin@ufps.edu.co',
        'coord.sistemas@ufps.edu.co', 
        'docente@ufps.edu.co',
        'estudiante@ufps.edu.co',
        'vigilante@ufps.edu.co',
        'administrativo@ufps.edu.co'
      ]}
    }).toArray();
    
    const syncedUsers = {};
    const defaultUsers = {
      'admin@ufps.edu.co': { key: 'admin', role: 'ADMIN_GENERAL' },
      'coord.sistemas@ufps.edu.co': { key: 'coordinator', role: 'ADMIN_PROGRAMA' },
      'docente@ufps.edu.co': { key: 'teacher', role: 'DOCENTE' },
      'estudiante@ufps.edu.co': { key: 'student', role: 'ESTUDIANTE' },
      'vigilante@ufps.edu.co': { key: 'security', role: 'VIGILANTE' },
      'administrativo@ufps.edu.co': { key: 'administrative', role: 'ADMINISTRATIVO_GENERAL' }
    };
    
    for (const user of users) {
      const userInfo = defaultUsers[user.email];
      if (userInfo) {
        syncedUsers[userInfo.key] = {
          email: user.email,
          password: 'Admin123!', // Default test password
          id: user._id.toString(),
          role: userInfo.role,
          name: user.name || `User ${userInfo.key}`
        };
      }
    }
    
    logger.info(`✅ ${Object.keys(syncedUsers).length} usuarios sincronizados`);
    return syncedUsers;
  }

  async syncResources(db) {
    logger.info('🏢 Sincronizando recursos...');
    
    const resources = await db.collection('Resource').find({
      isActive: true
    }).limit(20).toArray();
    
    const syncedResources = {};
    const resourceTypes = {
      'AUDITORIUM': 'auditorium',
      'LABORATORY': 'laboratory', 
      'CLASSROOM': 'classroom',
      'MULTIMEDIA_EQUIPMENT': 'projector',
      'MEETING_ROOM': 'meetingRoom'
    };
    
    for (const resource of resources) {
      const typeKey = resourceTypes[resource.type] || 'other';
      if (!syncedResources[typeKey]) {
        syncedResources[typeKey] = {
          id: resource._id.toString(),
          name: resource.name,
          type: resource.type,
          capacity: resource.capacity || 1,
          location: resource.location || 'No especificada',
          category: resource.categoryCode || 'GENERAL'
        };
      }
    }
    
    logger.info(`✅ ${Object.keys(syncedResources).length} recursos sincronizados`);
    return syncedResources;
  }

  async syncCategories(db) {
    logger.info('📂 Sincronizando categorías...');
    
    const categories = await db.collection('Category').find({
      isActive: true
    }).toArray();
    
    const syncedCategories = {
      resource_types: [],
      maintenance_types: [],
      approval_statuses: []
    };
    
    for (const category of categories) {
      const categoryData = {
        id: category._id.toString(),
        code: category.code,
        name: category.name,
        type: category.type
      };
      
      switch (category.type) {
        case 'RESOURCE_TYPE':
          syncedCategories.resource_types.push(categoryData);
          break;
        case 'MAINTENANCE_TYPE':
          syncedCategories.maintenance_types.push(categoryData);
          break;
        case 'APPROVAL_STATUS':
          syncedCategories.approval_statuses.push(categoryData);
          break;
      }
    }
    
    logger.info(`✅ ${categories.length} categorías sincronizadas`);
    return syncedCategories;
  }

  async syncPrograms(db) {
    logger.info('🎓 Sincronizando programas académicos...');
    
    const programs = await db.collection('AcademicProgram').find({
      isActive: true
    }).limit(10).toArray();
    
    const syncedPrograms = {};
    
    for (const program of programs) {
      const key = program.code.toLowerCase();
      syncedPrograms[key] = {
        id: program._id.toString(),
        code: program.code,
        name: program.name,
        faculty: program.faculty || 'Facultad no especificada'
      };
    }
    
    logger.info(`✅ ${Object.keys(syncedPrograms).length} programas sincronizados`);
    return syncedPrograms;
  }

  async updateConfigFile(syncedData) {
    logger.info('📝 Actualizando archivo de configuración...');
    
    const timestamp = new Date().toISOString();
    const configContent = `/**
 * Configuración centralizada de datos de prueba para todos los hitos
 * Sincronizado automáticamente con las semillas de la base de datos
 * Última sincronización: ${timestamp}
 */

// Test users - synchronized with database
const TEST_USERS = ${JSON.stringify(syncedData.users, null, 2)};

// Test resources - synchronized with database  
const TEST_RESOURCES = ${JSON.stringify(syncedData.resources, null, 2)};

// Test categories - synchronized with database
const TEST_CATEGORIES = ${JSON.stringify(syncedData.categories, null, 2)};

// Test academic programs - synchronized with database
const TEST_PROGRAMS = ${JSON.stringify(syncedData.programs, null, 2)};

// Test reservation data templates (static)
const TEST_RESERVATIONS = {
  basic: {
    resourceId: 'resource_auditorium_001',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    purpose: 'Presentación de proyecto de grado',
    attendees: 45,
    requesterId: 'user_teacher_001'
  },
  
  recurring: {
    resourceId: 'resource_classroom_001',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    purpose: 'Clase de Programación Web',
    attendees: 30,
    requesterId: 'user_teacher_001',
    recurrence: {
      type: 'WEEKLY',
      daysOfWeek: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
      endRecurrence: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
};

// Performance benchmarks for testing (static)
const PERFORMANCE_BENCHMARKS = {
  response_times: {
    fast_operations: 500,
    medium_operations: 2000,
    slow_operations: 5000,
    batch_operations: 10000
  },
  
  concurrency: {
    light_load: 10,
    medium_load: 50,
    heavy_load: 100
  }
};

// Test scenarios for different flows (static)
const TEST_SCENARIOS = {
  hito1_resources: {
    crud_operations: ['create', 'read', 'update', 'delete'],
    bulk_operations: ['import_csv', 'export_csv'],
    categories: Object.keys(TEST_CATEGORIES.resource_types || {}),
    programs: Object.keys(TEST_PROGRAMS || {})
  },
  
  hito2_availability: {
    reservation_types: ['basic', 'recurring', 'bulk'],
    search_criteria: ['date_range', 'resource_type', 'capacity', 'location'],
    calendar_integrations: ['google', 'outlook', 'ical']
  },
  
  hito3_stockpile: {
    approval_flows: ['automatic', 'manual', 'escalated'],
    document_formats: ['PDF', 'HTML', 'DOCX'],
    notification_channels: ['EMAIL', 'SMS', 'PUSH', 'WHATSAPP']
  }
};

// Export all test data
module.exports = {
  TEST_USERS,
  TEST_RESOURCES,
  TEST_CATEGORIES,
  TEST_PROGRAMS,
  TEST_RESERVATIONS,
  PERFORMANCE_BENCHMARKS,
  TEST_SCENARIOS,
  SYNC_TIMESTAMP: '${timestamp}'
};
`;

    await fs.writeFile(this.configPath, configContent);
    logger.info('✅ Archivo conf-test-data.js actualizado');
  }

  async restoreBackup() {
    try {
      const backup = await fs.readFile(this.backupPath, 'utf8');
      await fs.writeFile(this.configPath, backup);
      logger.info('🔄 Backup restaurado');
    } catch (error) {
      logger.error('❌ No se pudo restaurar backup:', error.message);
    }
  }

  async validateSync() {
    logger.info('🔍 Validando sincronización...');
    
    try {
      const config = require('./conf-test-data');
      
      const validations = [
        { name: 'TEST_USERS', data: config.TEST_USERS, minCount: 3 },
        { name: 'TEST_RESOURCES', data: config.TEST_RESOURCES, minCount: 2 },
        { name: 'TEST_CATEGORIES', data: config.TEST_CATEGORIES, minCount: 1 },
        { name: 'TEST_PROGRAMS', data: config.TEST_PROGRAMS, minCount: 1 }
      ];
      
      for (const validation of validations) {
        const count = Object.keys(validation.data || {}).length;
        if (count < validation.minCount) {
          throw new Error(`${validation.name} tiene ${count} elementos, mínimo requerido: ${validation.minCount}`);
        }
        logger.info(`✅ ${validation.name}: ${count} elementos`);
      }
      
      logger.info('✅ Validación completada exitosamente');
      return true;
      
    } catch (error) {
      logger.error('❌ Error en validación:', error.message);
      return false;
    }
  }
}

// Execute if called directly
if (require.main === module) {
  (async () => {
    try {
      const syncer = new TestDataSyncer();
      await syncer.syncWithDatabase();
      await syncer.validateSync();
      
      console.log('🎉 Sincronización completada exitosamente');
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error en sincronización:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { TestDataSyncer };
