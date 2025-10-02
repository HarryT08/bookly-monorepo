/**
 * Script para probar la comunicación entre frontend y backend de Bookly
 * Verifica que los endpoints estén funcionando correctamente
 */

const http = require('http');
const https = require('https');

// URLs de los microservicios
const SERVICES = {
  auth: 'http://localhost:3001',
  resources: 'http://localhost:3003', 
  availability: 'http://localhost:3002',
  stockpile: 'http://localhost:3004',
  reports: 'http://localhost:3005'
};

// Usuarios de prueba desde las semillas
const TEST_CREDENTIALS = [
  { email: 'admin@ufps.edu.co', password: '123456' },
  { email: 'estudiante@ufps.edu.co', password: '123456' },
  { email: 'docente@ufps.edu.co', password: '123456' }
];

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testService(serviceName, baseUrl) {
  console.log(`\n🔍 Probando ${serviceName.toUpperCase()} SERVICE (${baseUrl})`);
  
  try {
    // Test health endpoint
    const healthResponse = await makeRequest(`${baseUrl}/health`);
    console.log(`   ✅ Health Check: ${healthResponse.status} - ${healthResponse.status === 200 ? 'OK' : 'FAIL'}`);
  } catch (error) {
    console.log(`   ❌ Health Check: ERROR - ${error.message}`);
  }
  
  // Test specific endpoints per service
  if (serviceName === 'auth') {
    await testAuthEndpoints(baseUrl);
  } else if (serviceName === 'resources') {
    await testResourcesEndpoints(baseUrl);
  } else {
    console.log(`   ⚠️  Endpoints específicos no implementados para ${serviceName}`);
  }
}

async function testAuthEndpoints(baseUrl) {
  // Test login endpoint
  try {
    const loginResponse = await makeRequest(`${baseUrl}/auth/login`, {
      method: 'POST',
      body: TEST_CREDENTIALS[0]
    });
    
    if (loginResponse.status === 200 || loginResponse.status === 201) {
      console.log(`   ✅ Login: ${loginResponse.status} - SUCCESS`);
      
      // Test protected endpoint with token if login successful
      if (loginResponse.data.access_token || loginResponse.data.token) {
        const token = loginResponse.data.access_token || loginResponse.data.token;
        
        try {
          const profileResponse = await makeRequest(`${baseUrl}/auth/profile`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log(`   ✅ Profile: ${profileResponse.status} - ${profileResponse.status === 200 ? 'SUCCESS' : 'FAIL'}`);
        } catch (error) {
          console.log(`   ❌ Profile: ERROR - ${error.message}`);
        }
      }
    } else {
      console.log(`   ❌ Login: ${loginResponse.status} - FAIL`);
      console.log(`      Response: ${JSON.stringify(loginResponse.data).substring(0, 100)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Login: ERROR - ${error.message}`);
  }
  
  // Test roles endpoint
  try {
    const rolesResponse = await makeRequest(`${baseUrl}/roles`);
    console.log(`   ✅ Roles: ${rolesResponse.status} - ${rolesResponse.status === 200 ? 'SUCCESS' : 'FAIL'}`);
  } catch (error) {
    console.log(`   ❌ Roles: ERROR - ${error.message}`);
  }
}

async function testResourcesEndpoints(baseUrl) {
  // Test resources paginated endpoint
  try {
    const resourcesResponse = await makeRequest(`${baseUrl}/resources/paginated`);
    console.log(`   ✅ Resources Paginated: ${resourcesResponse.status} - ${resourcesResponse.status === 200 ? 'SUCCESS' : 'FAIL'}`);
  } catch (error) {
    console.log(`   ❌ Resources Paginated: ERROR - ${error.message}`);
  }
  
  // Test categories endpoint (frontend expects 'categories' but backend has 'resource-categories')
  try {
    const categoriesResponse = await makeRequest(`${baseUrl}/resource-categories`);
    console.log(`   ✅ Categories: ${categoriesResponse.status} - ${categoriesResponse.status === 200 ? 'SUCCESS' : 'FAIL'}`);
  } catch (error) {
    console.log(`   ❌ Categories: ERROR - ${error.message}`);
  }
  
  // Test programs endpoint
  try {
    const programsResponse = await makeRequest(`${baseUrl}/programs`);
    console.log(`   ✅ Programs: ${programsResponse.status} - ${programsResponse.status === 200 ? 'SUCCESS' : 'FAIL'}`);
  } catch (error) {
    console.log(`   ❌ Programs: ERROR - ${error.message}`);
  }
}

async function main() {
  console.log('🚀 BOOKLY - PRUEBA DE COMUNICACIÓN FRONTEND-BACKEND');
  console.log('================================================');
  
  for (const [serviceName, baseUrl] of Object.entries(SERVICES)) {
    await testService(serviceName, baseUrl);
  }
  
  console.log('\n📋 RESUMEN:');
  console.log('- Los servicios que respondan OK están listos para el frontend');
  console.log('- Los servicios que fallen necesitan ser iniciados o tienen problemas de configuración');
  console.log('- Verificar que los puertos estén correctos y los servicios ejecutándose');
  console.log('\n🔧 SOLUCIÓN AL LOGIN:');
  console.log('- URLs del frontend corregidas (removido /api)');
  console.log('- Categories endpoint adaptado (resource-categories)');
  console.log('- Credenciales de prueba: admin@ufps.edu.co / 123456');
}

if (require.main === module) {
  main().catch(console.error);
}
