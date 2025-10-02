/**
 * BOOKLY API GATEWAY - CLIENTE HTTP
 * Cliente HTTP centralizado con autenticación, reintentos y logging
 */

const axios = require('axios');
const { CONFIG, SERVICES } = require('./config');
const { TestLogger } = require('./logger');

class HttpClient {
  constructor() {
    this.tokens = new Map(); // Cache de tokens por usuario
    this.logger = new TestLogger('HttpClient');
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor para logging y rate limiting
    axios.interceptors.request.use(
      (config) => {
        this.logger.debug(`→ ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error.message);
        return Promise.reject(error);
      }
    );

    // Response interceptor para logging y manejo de errores
    axios.interceptors.response.use(
      (response) => {
        this.logger.debug(`← ${response.status} ${response.config.url} (${response.headers['content-length'] || '0'}b)`);
        return response;
      },
      (error) => {
        const status = error.response?.status || 'Network';
        const url = error.config?.url || 'unknown';
        this.logger.error(`← ${status} ${url}: ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Autenticar usuario y obtener token JWT
   */
  async authenticate(user) {
    try {
      const cacheKey = user.email;
      
      // Verificar cache
      if (this.tokens.has(cacheKey)) {
        const cached = this.tokens.get(cacheKey);
        if (this.isTokenValid(cached.token)) {
          return cached.token;
        }
      }

      this.logger.info(`Authenticating user: ${user.email} (${user.description})`);
      
      const response = await this.request('POST', '/api/v1/auth/login', {
        email: user.email,
        password: user.password
      });

      if (!response.data.success || !response.data.data.accessToken) {
        throw new Error('Authentication failed: Invalid response format');
      }

      const token = response.data.data.accessToken;
      
      // Cache token
      this.tokens.set(cacheKey, {
        token,
        user: user.email,
        role: user.role,
        timestamp: Date.now()
      });

      this.logger.success(`Authenticated: ${user.email} → Token cached`);
      return token;

    } catch (error) {
      this.logger.error(`Authentication failed for ${user.email}:`, error.message);
      throw error;
    }
  }

  /**
   * Verificar si token JWT es válido (no expirado)
   */
  isTokenValid(token) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64'));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const valid = exp > now + 30000; // 30 segundos de margen
      
      if (!valid) {
        this.logger.debug('Token expired or expiring soon');
      }
      
      return valid;
    } catch (error) {
      this.logger.warn('Invalid token format:', error.message);
      return false;
    }
  }

  /**
   * Request HTTP con reintentos y autenticación automática
   */
  async request(method, url, data = null, options = {}) {
    const config = {
      method: method.toLowerCase(),
      url: this.buildUrl(url),
      timeout: options.timeout || CONFIG.TIMEOUT,
      headers: {
        ...CONFIG.DEFAULT_HEADERS,
        ...options.headers
      },
      ...options
    };

    // Agregar datos según método
    if (data) {
      if (['post', 'put', 'patch'].includes(config.method)) {
        config.data = data;
      } else {
        config.params = data;
      }
    }

    // Agregar token de autorización si existe
    if (options.token) {
      config.headers.Authorization = `Bearer ${options.token}`;
    }

    return this.executeWithRetry(config);
  }

  /**
   * Construir URL completa
   */
  buildUrl(path) {
    const baseUrl = SERVICES.API_GATEWAY;
    
    // Si ya es URL completa, devolverla
    if (path.startsWith('http')) {
      return path;
    }
    
    // Si no empieza con /, agregarlo
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    return `${baseUrl}${path}`;
  }

  /**
   * Ejecutar request con reintentos automáticos
   */
  async executeWithRetry(config, attempt = 1) {
    try {
      // Rate limiting
      if (attempt > 1) {
        await this.sleep(CONFIG.RETRY_DELAY * attempt);
      } else {
        await this.sleep(CONFIG.RATE_LIMIT_DELAY);
      }

      const response = await axios(config);
      return response;

    } catch (error) {
      const shouldRetry = attempt < CONFIG.RETRY_ATTEMPTS && this.isRetryableError(error);
      
      if (shouldRetry) {
        this.logger.warn(`Request failed (attempt ${attempt}/${CONFIG.RETRY_ATTEMPTS}), retrying...`);
        return this.executeWithRetry(config, attempt + 1);
      }

      // No más reintentos, lanzar error
      throw this.normalizeError(error);
    }
  }

  /**
   * Determinar si error es reintentable
   */
  isRetryableError(error) {
    if (!error.response) return true; // Network errors
    
    const status = error.response.status;
    return status >= 500 || status === 429; // Server errors or rate limiting
  }

  /**
   * Normalizar error para respuesta consistente
   */
  normalizeError(error) {
    if (!error.response) {
      return new Error(`Network error: ${error.message}`);
    }

    const { status, data } = error.response;
    const message = data?.message || data?.error || error.message || 'Unknown error';
    
    const normalizedError = new Error(`HTTP ${status}: ${message}`);
    normalizedError.status = status;
    normalizedError.response = error.response;
    normalizedError.data = data;
    
    return normalizedError;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Limpiar cache de tokens
   */
  clearTokenCache() {
    this.tokens.clear();
    this.logger.info('Token cache cleared');
  }

  /**
   * Métodos de conveniencia
   */
  async get(url, options = {}) {
    return this.request('GET', url, null, options);
  }

  async post(url, data, options = {}) {
    return this.request('POST', url, data, options);
  }

  async put(url, data, options = {}) {
    return this.request('PUT', url, data, options);
  }

  async patch(url, data, options = {}) {
    return this.request('PATCH', url, data, options);
  }

  async delete(url, options = {}) {
    return this.request('DELETE', url, null, options);
  }

  /**
   * Request autenticado
   */
  async authenticatedRequest(method, url, data, user, options = {}) {
    const token = await this.authenticate(user);
    return this.request(method, url, data, { ...options, token });
  }

  // Métodos autenticados de conveniencia
  async authGet(url, user, options = {}) {
    return this.authenticatedRequest('GET', url, null, user, options);
  }

  async authPost(url, data, user, options = {}) {
    return this.authenticatedRequest('POST', url, data, user, options);
  }

  async authPut(url, data, user, options = {}) {
    return this.authenticatedRequest('PUT', url, data, user, options);
  }

  async authDelete(url, user, options = {}) {
    return this.authenticatedRequest('DELETE', url, null, user, options);
  }
}

// Singleton instance
const httpClient = new HttpClient();

module.exports = {
  HttpClient,
  httpClient
};
