/**
 * Mapa completo de endpoints de todos los microservicios de Bookly
 * Centraliza URLs y endpoints para testing automatizado
 */

const { SERVICES } = require('./config');

// Configuración completa de endpoints por microservicio
const MICROSERVICES_CONFIG = {
  auth: {
    service: 'auth-service',
    port: 3001,
    baseUrl: `${SERVICES.API_GATEWAY}/api/v1/auth`,
    endpoints: {
      // Authentication endpoints
      login: '/login',
      register: '/register',
      logout: '/logout',
      refresh: '/refresh',
      
      // Profile management
      profile: '/profile',
      updateProfile: '/profile',
      changePassword: '/change-password',
      
      // Role and permission management
      roles: '/roles',
      permissions: '/permissions',
      userRoles: '/users/:userId/roles',
      rolePermissions: '/roles/:roleId/permissions',
      
      // OAuth and SSO
      googleOAuth: '/oauth/google',
      googleCallback: '/oauth/google/callback',
      ssoStatus: '/sso/status',
      
      // Security features
      twoFactor: '/2fa',
      verifyTwoFactor: '/2fa/verify',
      accountLock: '/account/lock',
      accountUnlock: '/account/unlock',
      
      // Audit and logs
      loginHistory: '/login-history',
      securityLogs: '/security-logs'
    }
  },

  resources: {
    service: 'resources-service',
    port: 3003,
    baseUrl: `${SERVICES.API_GATEWAY}/api/v1/resources`,
    endpoints: {
      // Basic CRUD
      list: '',
      paginated: '/paginated',
      search: '/search',
      create: '',
      getById: '/:id',
      update: '/:id',
      delete: '/:id',
      
      // Categories management
      categories: '/resource-categories',
      createCategory: '/resource-categories',
      updateCategory: '/resource-categories/:id',
      deleteCategory: '/resource-categories/:id',
      
      // Programs management
      programs: '/programs',
      createProgram: '/programs',
      updateProgram: '/programs/:id',
      deleteProgram: '/programs/:id',
      
      // Import/Export
      import: '/import/csv',
      export: '/export/template',
      bulkUpdate: '/bulk-update',
      
      // Maintenance
      maintenance: '/maintenance',
      maintenanceHistory: '/maintenance/history',
      scheduleMaintenace: '/maintenance/schedule',
      
      // Advanced features
      equivalents: '/equivalents',
      availability: '/availability',
      statistics: '/statistics'
    }
  },

  availability: {
    service: 'availability-service',
    port: 3002,
    baseUrl: `${SERVICES.API_GATEWAY}/api/v1/availability`,
    endpoints: {
      // Basic availability
      basic: '/basic',
      schedule: '/schedule',
      check: '/check',
      
      // Reservations CRUD
      reservations: '/reservations',
      createReservation: '/reservations',
      updateReservation: '/reservations/:id',
      cancelReservation: '/reservations/:id/cancel',
      deleteReservation: '/reservations/:id',
      
      // Advanced search
      search: '/search',
      searchAdvanced: '/search/advanced',
      searchEquivalents: '/search/equivalents',
      searchFreeSlots: '/search/free-slots',
      
      // Calendar integration
      calendar: '/calendar',
      calendarSync: '/calendar/sync',
      calendarExport: '/calendar/export',
      calendarImport: '/calendar/import',
      
      // Reassignment system
      reassignmentRequests: '/reassignment-requests',
      createReassignment: '/reassignment-requests',
      respondReassignment: '/reassignment-requests/:id/respond',
      processReassignment: '/reassignment-requests/process',
      
      // Usage tracking
      usageHistory: '/usage-history',
      checkIn: '/check-in',
      checkOut: '/check-out',
      analytics: '/analytics',
      realTimeOccupancy: '/real-time/occupancy'
    }
  },

  stockpile: {
    service: 'stockpile-service',
    port: 3004,
    baseUrl: `${SERVICES.API_GATEWAY}/api/v1/stockpile`,
    endpoints: {
      // Approval flows
      approvalRequests: '/approval-requests',
      createApproval: '/approval-requests',
      reviewApproval: '/approval-requests/:id/review',
      approveRequest: '/approval-requests/:id/approve',
      rejectRequest: '/approval-requests/:id/reject',
      
      // Document templates
      documentTemplates: '/document-templates',
      createTemplate: '/document-templates',
      updateTemplate: '/document-templates/:id',
      generateDocument: '/document-templates/:id/generate',
      exportTemplate: '/document-templates/:id/export',
      templateVersions: '/document-templates/:id/versions',
      
      // Notification system
      notifications: '/notifications',
      sendNotification: '/notifications/send',
      sendBulkNotification: '/notifications/send-bulk',
      scheduleNotification: '/notifications/schedule',
      notificationStatus: '/notifications/:id/status',
      notificationLogs: '/notifications/:id/logs',
      notificationAnalytics: '/notifications/analytics',
      
      // User subscriptions
      subscriptions: '/subscriptions',
      userSubscriptions: '/subscriptions/user/:userId',
      notificationPreferences: '/notification-preferences/:userId',
      
      // Security and validation
      security: '/security',
      securityDashboard: '/security/dashboard',
      checkIn: '/security/check-in',
      checkOut: '/security/check-out',
      validateIdentity: '/security/validate-identity',
      verifyPermissions: '/security/verify-permissions',
      securityAlerts: '/security/alerts',
      incidents: '/security/incidents',
      
      // Batch operations
      batch: '/batch',
      batchApproval: '/batch/approval',
      batchNotification: '/batch/notification'
    }
  },

  reports: {
    service: 'reports-service',
    port: 3005,
    baseUrl: `${SERVICES.API_GATEWAY}/api/v1/reports`,
    endpoints: {
      // Usage reports
      usage: '/usage',
      usageByResource: '/usage/resource',
      usageByUser: '/usage/user',
      usageByProgram: '/usage/program',
      
      // User reports
      user: '/user',
      userActivity: '/user/activity',
      userStatistics: '/user/statistics',
      
      // Dashboard
      dashboard: '/dashboard',
      dashboardMetrics: '/dashboard/metrics',
      dashboardCharts: '/dashboard/charts',
      
      // Export capabilities
      export: '/export',
      exportCsv: '/export/csv',
      exportPdf: '/export/pdf',
      exportExcel: '/export/excel',
      
      // Feedback system
      feedback: '/feedback',
      feedbackAnalytics: '/feedback/analytics',
      feedbackReports: '/feedback/reports',
      
      // Advanced analytics
      analytics: '/analytics',
      demandAnalysis: '/analytics/demand',
      utilizationMetrics: '/analytics/utilization',
      predictiveAnalytics: '/analytics/predictive'
    }
  },

  import: {
    service: 'import-service',
    port: 3006,
    baseUrl: `${SERVICES.API_GATEWAY}/api/v1/import`,
    endpoints: {
      // Data import
      upload: '/upload',
      validate: '/validate',
      process: '/process',
      status: '/status/:jobId',
      
      // Templates
      templates: '/templates',
      downloadTemplate: '/templates/:type/download',
      
      // Batch operations
      batchImport: '/batch',
      batchStatus: '/batch/:batchId/status'
    }
  }
};

// Helper function to get full URL for an endpoint
function getEndpointUrl(serviceName, endpointName, params = {}) {
  const service = MICROSERVICES_CONFIG[serviceName];
  if (!service) {
    throw new Error(`Service '${serviceName}' not found`);
  }
  
  const endpoint = service.endpoints[endpointName];
  if (!endpoint) {
    throw new Error(`Endpoint '${endpointName}' not found in service '${serviceName}'`);
  }
  
  let url = service.baseUrl + endpoint;
  
  // Replace URL parameters
  for (const [param, value] of Object.entries(params)) {
    url = url.replace(`:${param}`, value);
  }
  
  return url;
}

// Helper function to get all endpoints for a service
function getServiceEndpoints(serviceName) {
  const service = MICROSERVICES_CONFIG[serviceName];
  if (!service) {
    throw new Error(`Service '${serviceName}' not found`);
  }
  
  const endpoints = {};
  for (const [key, path] of Object.entries(service.endpoints)) {
    endpoints[key] = service.baseUrl + path;
  }
  
  return endpoints;
}

// Helper function to list all available services
function getAvailableServices() {
  return Object.keys(MICROSERVICES_CONFIG);
}

// Helper function to get service information
function getServiceInfo(serviceName) {
  const service = MICROSERVICES_CONFIG[serviceName];
  if (!service) {
    throw new Error(`Service '${serviceName}' not found`);
  }
  
  return {
    service: service.service,
    port: service.port,
    baseUrl: service.baseUrl,
    endpointCount: Object.keys(service.endpoints).length
  };
}

module.exports = {
  MICROSERVICES_CONFIG,
  getEndpointUrl,
  getServiceEndpoints,
  getAvailableServices,
  getServiceInfo
};
