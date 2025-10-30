/**
 * BOOKLY API GATEWAY - UTILIDADES DE TESTING
 * Funciones utilitarias complementarias para testing
 */

const fs = require('fs');
const path = require('path');
const { TestValidator } = require('./test-validator');
const { GenerateTestData } = require('./generate-test-data');
const { TestLogger } = require('./logger');

/**
 * Utilidades generales de testing (funciones no extraídas)
 */
class TestUtils {
  /**
   * Formatear tiempo transcurrido
   */
  static formatElapsedTime(startTime) {
    const elapsed = Date.now() - startTime;
    return `${elapsed}ms`;
  }

  /**
   * Generar ID único para testing
   */
  static generateUniqueId(prefix = 'test') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Normalizar respuesta para comparación
   */
  static normalizeResponse(response) {
    if (!response || !response.data) {
      return null;
    }

    const normalized = { ...response.data };
    
    // Remover timestamps variables para comparación
    delete normalized.createdAt;
    delete normalized.updatedAt;
    delete normalized.lastModified;
    
    return normalized;
  }

  /**
   * Crear directorio si no existe
   */
  static ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Leer archivo JSON de forma segura
   */
  static readJsonFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
      }
      return null;
    } catch (error) {
      console.warn(`Failed to read JSON file ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Escribir archivo JSON de forma segura
   */
  static writeJsonFile(filePath, data) {
    try {
      const dirPath = path.dirname(filePath);
      this.ensureDirectory(dirPath);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.warn(`Failed to write JSON file ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Retry con backoff exponencial
   */
  static async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Comparar objetos profundamente
   */
  static deepEqual(obj1, obj2, ignoreKeys = []) {
    if (obj1 === obj2) return true;
    
    if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return false;
    }
    
    const keys1 = Object.keys(obj1).filter(key => !ignoreKeys.includes(key));
    const keys2 = Object.keys(obj2).filter(key => !ignoreKeys.includes(key));
    
    if (keys1.length !== keys2.length) return false;
    
    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!this.deepEqual(obj1[key], obj2[key], ignoreKeys)) return false;
    }
    
    return true;
  }

  /**
   * Extraer errores de respuesta de API
   */
  static extractApiErrors(response) {
    if (!response || !response.data) {
      return ['Unknown API error'];
    }

    const data = response.data;
    
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map(error => error.message || error.toString());
    }
    
    if (data.message) {
      return [data.message];
    }
    
    return [`HTTP ${response.status}: ${response.statusText || 'Unknown error'}`];
  }

  /**
   * Validar estructura de URL
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generar CSV desde array de objetos
   */
  static generateCSV(data, headers = null) {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const csvHeaders = headers || Object.keys(data[0]);
    const csvRows = [csvHeaders.join(',')];
    
    data.forEach(row => {
      const csvRow = csvHeaders.map(header => {
        const value = row[header] || '';
        // Escapar valores que contienen comas o comillas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(csvRow.join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Parsear CSV a array de objetos
   */
  static parseCSV(csvContent, delimiter = ',') {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(delimiter).map(header => header.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(value => value.trim());
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }
    
    return data;
  }
}

// Re-exportar las clases extraídas para compatibilidad
module.exports = {
  TestUtils,
  TestValidator,
  GenerateTestData
};
