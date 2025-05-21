/**
 * Constantes de la aplicaciu00f3n
 * Este archivo contiene constantes relacionadas con la configuracion general de la aplicaciu00f3n
 */

export const APP_CONSTANTS = {
  // Nombre de la aplicaciu00f3n
  APP_NAME: 'Bookly Auth Service',
  
  // Valores para la configuraciu00f3n de la aplicaciu00f3n
  DEFAULT_PORT: 3001,
  DEFAULT_API_VERSION: '1.0',
  
  // Valores para la configuraciu00f3n de seguridad
  DEFAULT_JWT_EXPIRATION: '1h',
  DEFAULT_REFRESH_EXPIRATION: '7d',
  
  // Valores para respuestas http
  DEFAULT_SUCCESS_MESSAGE: 'Operation completed successfully',
  DEFAULT_ERROR_MESSAGE: 'An error occurred while processing your request',
  
  // Valores para logging
  LOG_SUCCESS_PREFIX: '\ud83d\ude80', // 🚀
  LOG_ERROR_PREFIX: '\u274c', // ❌
  LOG_INFO_PREFIX: '\ud83d\udcac', // 💬
  LOG_WARNING_PREFIX: '\u26a0\ufe0f', // ⚠️
  DOCS_PREFIX: '\ud83d\udcd6', // 📖
};
