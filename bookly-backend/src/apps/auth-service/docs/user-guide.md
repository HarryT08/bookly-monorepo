# Bookly Auth Service - Guía de Usuario

## 🔐 Introducción

El Auth Service de Bookly es el sistema de autenticación y autorización que permite a los usuarios de la UFPS acceder de forma segura al sistema de reservas. Soporta tanto autenticación tradicional con credenciales universitarias como Single Sign-On (SSO) con Google Workspace.

---

## 👥 Tipos de Usuario

### Estudiantes

- **Email**: `nombre.apellido@ufps.edu.co`
- **Permisos**: Crear reservas, consultar disponibilidad
- **Restricciones**: Solo recursos permitidos para estudiantes

### Profesores

- **Email**: `nombre.apellido@ufps.edu.co`
- **Permisos**: Crear reservas, aprobar reservas de estudiantes
- **Privilegios**: Acceso a recursos académicos especializados

### Coordinadores

- **Email**: `coordinador@ufps.edu.co`
- **Permisos**: Gestión completa de reservas de su programa
- **Alcance**: Solo recursos de su programa académico

### Administradores

- **Email**: `admin@ufps.edu.co`
- **Permisos**: Gestión completa del sistema
- **Alcance**: Todos los recursos y usuarios

---

## 🚀 Comenzar a Usar

### 1. Registro de Usuario

#### Opción A: Registro Manual

1. Visita: `https://bookly.ufps.edu.co/auth/register`
2. Completa el formulario:

   ```
   Email: juan.perez@ufps.edu.co
   Nombre de usuario: juan.perez
   Contraseña: [Mínimo 8 caracteres]
   Nombre: Juan
   Apellido: Pérez
   ```

3. Verifica tu email institucional
4. ¡Listo para usar Bookly!

#### Opción B: Google SSO (Recomendado)

1. Visita: `https://bookly.ufps.edu.co/auth/login`
2. Haz clic en **"Iniciar con Google"**
3. Autoriza con tu cuenta `@ufps.edu.co`
4. Acceso inmediato al sistema

---

## 🔑 Iniciar Sesión

### Método 1: Credenciales Tradicionales

**URL**: `https://bookly.ufps.edu.co/auth/login`

```javascript
// Formulario de login
{
  "email": "tu.email@ufps.edu.co",
  "password": "tuContraseñaSegura"
}
```

**Proceso**:

1. Ingresa tu email institucional completo
2. Escribe tu contraseña
3. Haz clic en **"Iniciar Sesión"**
4. Serás redirigido al dashboard principal

### Método 2: Google SSO

**URL**: `https://bookly.ufps.edu.co/auth/oauth/google`

**Proceso**:

1. Haz clic en **"Continuar con Google"**
2. Selecciona tu cuenta `@ufps.edu.co`
3. Autoriza los permisos solicitados:
   - Ver información básica del perfil
   - Ver dirección de email
4. Acceso automático al sistema

---

## 🛡️ Seguridad y Mejores Prácticas

### Contraseñas Seguras

- **Mínimo 8 caracteres**
- Combina mayúsculas, minúsculas, números y símbolos
- No uses información personal (nombre, fecha de nacimiento)
- Cambia la contraseña cada 6 meses

**Ejemplo de contraseña segura**: `Ufps2024#Reserva!`

### Protección de Cuenta

- **Nunca compartas tus credenciales**
- Usa dispositivos confiables
- Cierra sesión en computadores públicos
- Reporta actividad sospechosa inmediatamente

### Rate Limiting

- **Máximo 5 intentos de login por minuto**
- Bloqueo automático tras múltiples fallos
- Tiempo de espera incremental por seguridad

---

## 👨‍💼 Gestión de Perfil

### Consultar Mi Perfil

**Endpoint**: `GET /auth/profile`

```javascript
// Información devuelta
{
  "id": "usuario-uuid",
  "email": "juan.perez@ufps.edu.co",
  "username": "juan.perez",
  "firstName": "Juan",
  "lastName": "Pérez",
  "roles": ["teacher"],
  "permissions": [
    "reservation:create",
    "resource:read",
    "reservation:approve"
  ],
  "lastLogin": "2024-01-15T10:30:00Z",
  "emailVerified": true
}
```

### Actualizar Información Personal

```javascript
// Campos editables
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez González",
  "username": "juan.carlos.perez"
}
```

**Restricciones**:

- Email no se puede cambiar (institucional)
- Roles solo los asignan administradores
- Username debe ser único

### Cambiar Contraseña

**Proceso**:

1. Ve a **"Mi Perfil" > "Cambiar Contraseña"**
2. Ingresa tu contraseña actual
3. Escribe la nueva contraseña (2 veces)
4. Confirma el cambio

---

## 🎭 Sistema de Roles y Permisos

### Roles Disponibles

#### Student (Estudiante)

```javascript
{
  "role": "student",
  "permissions": [
    "reservation:create",      // Crear reservas
    "resource:read",          // Ver recursos disponibles
    "reservation:read:own"    // Ver mis reservas
  ],
  "restrictions": [
    "Solo recursos estudiantiles",
    "Máximo 2 reservas simultáneas",
    "Reservas con hasta 7 días de anticipación"
  ]
}
```

#### Teacher (Profesor)

```javascript
{
  "role": "teacher", 
  "permissions": [
    "reservation:create",
    "reservation:approve",     // Aprobar reservas de estudiantes
    "resource:read",
    "report:view:basic"       // Ver reportes básicos
  ],
  "privileges": [
    "Acceso a salas académicas especializadas",
    "Reservas con hasta 30 días de anticipación",
    "Sin límite de reservas simultáneas"
  ]
}
```

#### Coordinator (Coordinador)

```javascript
{
  "role": "coordinator",
  "permissions": [
    "reservation:manage:program",  // Gestionar reservas del programa
    "resource:assign:program",     // Asignar recursos al programa
    "report:view:program",         // Reportes del programa
    "user:manage:students"         // Gestionar estudiantes del programa
  ]
}
```

#### Admin (Administrador)

```javascript
{
  "role": "admin",
  "permissions": [
    "resource:*",              // Todos los permisos de recursos
    "reservation:*",           // Todos los permisos de reservas
    "user:*",                 // Gestión completa de usuarios
    "role:assign",            // Asignar roles
    "report:*"               // Todos los reportes
  ]
}
```

---

## 🔄 Recuperación de Cuenta

### Olvidé Mi Contraseña

**URL**: `https://bookly.ufps.edu.co/auth/password/reset`

**Proceso**:

1. Haz clic en **"¿Olvidaste tu contraseña?"**
2. Ingresa tu email institucional
3. Revisa tu email para el enlace de recuperación
4. Sigue las instrucciones del email
5. Crea una nueva contraseña segura

**Email de Recuperación**:

```html
Asunto: Recuperación de Contraseña - Bookly UFPS

Hola Juan,

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.

[RESTABLECER CONTRASEÑA] <-- Enlace válido por 1 hora

Si no solicitaste este cambio, ignora este email.

Equipo Bookly UFPS
```

### Verificación de Email

Si no has verificado tu email:

1. Revisa tu bandeja de entrada y spam
2. Haz clic en **"Reenviar verificación"** en el login
3. Haz clic en el enlace del email de verificación
4. Tu cuenta será activada automáticamente

---

## 📱 Integración con Aplicaciones

### Frontend Web (React/Next.js)

```javascript
// Configuración del cliente de autenticación
import { AuthProvider, useAuth } from '@/contexts/auth';

function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

// Hook de autenticación
function Dashboard() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  const handleLogin = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
      // Usuario autenticado exitosamente
    } catch (error) {
      // Manejar error de autenticación
    }
  };
  
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }
  
  return <MainDashboard user={user} />;
}
```

### Aplicación Móvil

```javascript
// React Native con AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthService = {
  async login(email, password) {
    const response = await fetch('https://api.bookly.ufps.edu.co/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error(data.message);
    }
  },
  
  async getStoredAuth() {
    const token = await AsyncStorage.getItem('access_token');
    const user = await AsyncStorage.getItem('user');
    return { token, user: user ? JSON.parse(user) : null };
  }
};
```

---

## 🌐 WebSocket Authentication

### Conexión Autenticada

```javascript
import io from 'socket.io-client';

// Conectar con autenticación JWT
const socket = io('wss://api.bookly.ufps.edu.co/auth', {
  auth: {
    token: `Bearer ${accessToken}`
  },
  transports: ['websocket']
});

// Eventos de autenticación
socket.on('connect', () => {
  console.log('Conectado al Auth Service');
});

socket.on('authenticated', (data) => {
  console.log('Autenticación exitosa:', data.user);
});

socket.on('auth-error', (error) => {
  console.error('Error de autenticación:', error.message);
  // Redirigir al login
});
```

### Eventos en Tiempo Real

```javascript
// Eventos de sesión
socket.on('session-expired', () => {
  alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
  window.location.href = '/auth/login';
});

socket.on('role-updated', (data) => {
  console.log('Tus permisos han sido actualizados:', data.newRoles);
  // Actualizar UI según nuevos permisos
});

socket.on('account-locked', (data) => {
  alert(`Tu cuenta ha sido bloqueada: ${data.reason}`);
  // Mostrar información de contacto para soporte
});
```

---

## 🚨 Manejo de Errores

### Códigos de Error Comunes

| Código | Descripción | Solución |
|--------|-------------|----------|
| `AUTH-0001` | Credenciales inválidas | Verifica email y contraseña |
| `AUTH-0002` | Usuario no encontrado | Regístrate primero |
| `AUTH-0003` | Token expirado | Inicia sesión nuevamente |
| `AUTH-0004` | Permisos insuficientes | Contacta al administrador |
| `AUTH-0005` | Límite de intentos excedido | Espera antes de reintentar |
| `AUTH-0006` | Email no verificado | Verifica tu email institucional |
| `AUTH-0007` | Cuenta deshabilitada | Contacta soporte técnico |

### Mensajes de Error Típicos

```javascript
// Error de credenciales
{
  "code": "AUTH-0001",
  "message": "Email o contraseña incorrectos",
  "type": "error",
  "suggestion": "Verifica tus credenciales e intenta de nuevo"
}

// Error de permisos
{
  "code": "AUTH-0004", 
  "message": "No tienes permisos para realizar esta acción",
  "type": "error",
  "required_permission": "resource:delete",
  "your_permissions": ["resource:read", "reservation:create"]
}
```

---

## 📞 Soporte y Ayuda

### Contacto Técnico

- **Email**: `soporte-bookly@ufps.edu.co`
- **Teléfono**: `+57 (7) 575-8770`
- **Horario**: Lunes a Viernes, 8:00 AM - 5:00 PM

### Autoayuda

#### 1. ¿No puedo iniciar sesión?

- Verifica que uses tu email institucional completo (`@ufps.edu.co`)
- Revisa que Caps Lock esté desactivado
- Prueba reiniciar tu contraseña
- Usa Google SSO como alternativa

#### 2. ¿Mi cuenta está bloqueada?

- Espera 15 minutos antes de reintentar
- Verifica no tener software que automatice logins
- Contacta soporte si persiste el problema

#### 3. ¿No recibo emails de verificación?

- Revisa tu carpeta de spam/correo no deseado
- Asegúrate que tu email institucional esté activo
- Reenvía la verificación desde el login

#### 4. ¿Mis permisos no son correctos?

- Verifica tu rol actual en "Mi Perfil"
- Los cambios de rol pueden tardar hasta 5 minutos
- Contacta tu coordinador de programa para ajustes

### Documentación Técnica

- **API Documentation**: `https://api.bookly.ufps.edu.co/auth/docs`
- **Health Check**: `https://api.bookly.ufps.edu.co/auth/health`
- **Status Page**: `https://status.bookly.ufps.edu.co`

---

## 🔄 Changelog y Actualizaciones

### Versión 2.1.0 (Actual)

- ✅ Integración Google SSO
- ✅ Sistema de roles granulares
- ✅ WebSocket authentication
- ✅ Rate limiting mejorado
- ✅ Auditoría completa

### Próximas Funcionalidades

- 🔄 Doble factor de autenticación (2FA)
- 🔄 Integración Microsoft SSO
- 🔄 API mobile-first
- 🔄 Dashboard de seguridad personal

---

Esta guía te ayudará a usar el sistema de autenticación de Bookly de forma efectiva y segura. Para dudas específicas o problemas técnicos, no dudes en contactar nuestro equipo de soporte.
