/**
 * BOOKLY API GATEWAY - SISTEMA DE LOGGING
 * Logger estructurado para tests con diferentes niveles y formateo
 */

const fs = require('fs');
const path = require('path');

class TestLogger {
  constructor(context = 'Test') {
    this.context = context;
    this.startTime = Date.now();
    this.logs = [];
    
    // Colores ANSI para consola
    this.colors = {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      gray: '\x1b[90m',
      bold: '\x1b[1m'
    };
  }

  /**
   * Formatear timestamp
   */
  timestamp() {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
  }

  /**
   * Formatear mensaje con color y contexto
   */
  format(level, message, data = null) {
    const ts = this.timestamp();
    const ctx = this.context.padEnd(12);
    let formattedMsg = `[${ts}] [${ctx}] [${level.padEnd(5)}] ${message}`;
    
    if (data) {
      formattedMsg += '\n' + this.formatData(data);
    }
    
    return formattedMsg;
  }

  /**
   * Formatear datos adicionales
   */
  formatData(data) {
    if (typeof data === 'object') {
      return '  ' + JSON.stringify(data, null, 2).split('\n').join('\n  ');
    }
    return '  ' + String(data);
  }

  /**
   * Agregar color al mensaje
   */
  colorize(text, color) {
    if (process.env.NO_COLOR) return text;
    return `${this.colors[color]}${text}${this.colors.reset}`;
  }

  /**
   * Log de depuración
   */
  debug(message, data = null) {
    const formatted = this.format('DEBUG', message, data);
    console.log(this.colorize(formatted, 'gray'));
    this.logs.push({ level: 'DEBUG', message, data, timestamp: Date.now() });
  }

  /**
   * Log informativo
   */
  info(message, data = null) {
    const formatted = this.format('INFO', message, data);
    console.log(this.colorize(formatted, 'blue'));
    this.logs.push({ level: 'INFO', message, data, timestamp: Date.now() });
  }

  /**
   * Log de éxito
   */
  success(message, data = null) {
    const formatted = this.format('PASS', message, data);
    console.log(this.colorize(formatted, 'green'));
    this.logs.push({ level: 'SUCCESS', message, data, timestamp: Date.now() });
  }

  /**
   * Log de advertencia
   */
  warn(message, data = null) {
    const formatted = this.format('WARN', message, data);
    console.log(this.colorize(formatted, 'yellow'));
    this.logs.push({ level: 'WARN', message, data, timestamp: Date.now() });
  }

  /**
   * Log de error
   */
  error(message, data = null) {
    const formatted = this.format('ERROR', message, data);
    console.error(this.colorize(formatted, 'red'));
    this.logs.push({ level: 'ERROR', message, data, timestamp: Date.now() });
  }

  /**
   * Log de fallo de test
   */
  fail(message, data = null) {
    const formatted = this.format('FAIL', message, data);
    console.error(this.colorize(formatted, 'red'));
    this.logs.push({ level: 'FAIL', message, data, timestamp: Date.now() });
  }

  /**
   * Log de test omitido
   */
  skip(message, data = null) {
    const formatted = this.format('SKIP', message, data);
    console.log(this.colorize(formatted, 'yellow'));
    this.logs.push({ level: 'SKIP', message, data, timestamp: Date.now() });
  }

  /**
   * Separador visual
   */
  separator(char = '=', length = 60) {
    const line = char.repeat(length);
    console.log(this.colorize(line, 'cyan'));
  }

  /**
   * Header de sección
   */
  header(title) {
    this.separator('=');
    const paddedTitle = ` ${title} `;
    const totalPadding = 60 - paddedTitle.length;
    const leftPad = '='.repeat(Math.floor(totalPadding / 2));
    const rightPad = '='.repeat(Math.ceil(totalPadding / 2));
    const header = `${leftPad}${paddedTitle}${rightPad}`;
    console.log(this.colorize(header, 'bold'));
    this.separator('=');
  }

  /**
   * Subheader de subsección
   */
  subheader(title) {
    console.log('');
    const formattedTitle = `--- ${title} ---`;
    console.log(this.colorize(formattedTitle, 'cyan'));
  }

  /**
   * Estadísticas del test
   */
  stats(stats) {
    this.separator('-');
    console.log(this.colorize('TEST STATISTICS:', 'bold'));
    
    Object.entries(stats).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
      
      let color = 'white';
      if (key.includes('success') || key.includes('pass')) color = 'green';
      else if (key.includes('error') || key.includes('fail')) color = 'red';
      else if (key.includes('warn') || key.includes('skip')) color = 'yellow';
      
      console.log(`  ${capitalizedLabel.padEnd(20)}: ${this.colorize(value, color)}`);
    });
    
    this.separator('-');
  }

  /**
   * Duración del test
   */
  duration() {
    const elapsed = Date.now() - this.startTime;
    const seconds = (elapsed / 1000).toFixed(2);
    return `${seconds}s`;
  }

  /**
   * Finalizar test con resumen
   */
  finish(stats) {
    const duration = this.duration();
    
    console.log('');
    this.separator('=');
    console.log(this.colorize(`TEST COMPLETED in ${duration}`, 'bold'));
    
    if (stats) {
      this.stats(stats);
    }
    
    console.log('');
  }

  /**
   * Guardar logs en archivo
   */
  async saveToFile(filePath) {
    try {
      // Asegurar que el directorio existe
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const logData = {
        context: this.context,
        startTime: this.startTime,
        endTime: Date.now(),
        duration: this.duration(),
        logs: this.logs
      };

      await fs.promises.writeFile(filePath, JSON.stringify(logData, null, 2), 'utf8');
      this.debug(`Logs saved to: ${filePath}`);
      
    } catch (error) {
      this.error('Failed to save logs:', error.message);
    }
  }

  /**
   * Crear logger hijo con contexto específico
   */
  child(childContext) {
    const child = new TestLogger(`${this.context}:${childContext}`);
    child.startTime = this.startTime; // Heredar tiempo de inicio
    return child;
  }

  /**
   * Log de request HTTP
   */
  httpRequest(method, url, status, duration, data = null) {
    const statusColor = status >= 400 ? 'red' : status >= 300 ? 'yellow' : 'green';
    const methodStr = method.toUpperCase().padEnd(6);
    const statusStr = String(status).padEnd(3);
    const durationStr = `${duration}ms`.padStart(6);
    
    const message = `${methodStr} ${url} → ${statusStr} (${durationStr})`;
    
    if (status >= 400) {
      this.error(message, data);
    } else if (status >= 300) {
      this.warn(message, data);
    } else {
      this.success(message, data);
    }
  }

  /**
   * Log de endpoint test result
   */
  endpointResult(endpoint, method, result, duration, expected = null) {
    const methodStr = method.toUpperCase().padEnd(6);
    const durationStr = `${duration}ms`.padStart(6);
    const message = `${methodStr} ${endpoint} (${durationStr})`;
    
    switch (result.status) {
      case 'PASS':
        this.success(`✅ ${message}`, result.data);
        break;
      case 'FAIL':
        this.fail(`❌ ${message}`, { error: result.error, expected });
        break;
      case 'WARN':
        this.warn(`⚠️ ${message}`, result.data);
        break;
      case 'SKIP':
        this.skip(`⏸️ ${message}`, result.reason);
        break;
      case 'NOT_IMPLEMENTED':
        this.info(`🚫 ${message} - Not implemented`, result.reason);
        break;
      default:
        this.info(`ℹ️ ${message}`, result.data);
    }
  }
}

module.exports = { TestLogger };
