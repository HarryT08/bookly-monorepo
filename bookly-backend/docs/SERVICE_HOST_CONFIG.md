# 🔧 SERVICE_HOST: Configuración para Docker y Desarrollo Local

## 🎯 Problema Resuelto

Los microservicios necesitan escuchar en diferentes interfaces según el entorno:
- **Docker**: `0.0.0.0` (accesible desde red Docker)
- **Desarrollo Local**: `localhost` (solo acceso local, más seguro)

## ✅ Solución Implementada: Variable de Entorno

### **`SERVICE_HOST` - Variable Única**

Todos los microservicios ahora usan una variable de entorno `SERVICE_HOST` que se configura automáticamente según el entorno.

## 📝 Cambios en el Código

### **main.ts de cada microservicio**

```typescript
// ANTES (hardcodeado)
const host = configService.get<string>('auth.service.host', 'localhost');

// DESPUÉS (configurable)
const host = configService.get<string>('SERVICE_HOST', process.env.SERVICE_HOST || '0.0.0.0');
```

**Servicios actualizados**:
- ✅ `auth-service/main.ts`
- ✅ `resources-service/main.ts`
- ✅ `availability-service/main.ts`
- ✅ `stockpile-service/main.ts`
- ✅ `reports-service/main.ts`

## 🐳 Configuración para Docker

### **docker-compose.microservices.yml**

Cada servicio tiene `SERVICE_HOST=0.0.0.0`:

```yaml
services:
  auth-service:
    environment:
      NODE_ENV: production
      PORT: 3001
      SERVICE_NAME: auth-service
      SERVICE_HOST: 0.0.0.0  # ← Accesible desde red Docker
      DATABASE_URL: mongodb://...
```

**Resultado en Docker**:
```
🚀 Auth Service is running on: http://0.0.0.0:3001
✅ Accesible desde otros contenedores
✅ API Gateway puede conectarse
```

## 💻 Configuración para Desarrollo Local

### **Opción 1: .env (Recomendado para desarrollo fuera de Docker)**

```bash
# .env (desarrollo local)
NODE_ENV=development
SERVICE_HOST=localhost  # ← Solo acceso local

# Para conectar a servicios base en Docker
DATABASE_URL=mongodb://bookly:bookly123@localhost:27017,...
REDIS_HOST=localhost
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672/bookly
```

### **Opción 2: Variables de entorno directas**

```bash
# Ejecutar servicio en desarrollo local
SERVICE_HOST=localhost npm run start:dev:auth

# O para múltiples servicios
export SERVICE_HOST=localhost
npm run start:dev:auth
npm run start:dev:resources
```

### **Opción 3: Sin definir (usa default 0.0.0.0)**

Si no defines `SERVICE_HOST`, el default es `0.0.0.0` (funciona para ambos casos).

## 📂 Archivos de Configuración

### **.env.example** (Docker/Producción)

```bash
# Service Host Configuration
# Para Docker: 0.0.0.0 (permite conexiones desde otros contenedores)
# Para desarrollo local: localhost (solo acceso local)
SERVICE_HOST=0.0.0.0
```

### **.env.local.example** (Desarrollo Local)

```bash
# Service Host Configuration
# En desarrollo local usar localhost para que solo escuche conexiones locales
SERVICE_HOST=localhost

# Database en Docker, servicio local
DATABASE_URL=mongodb://bookly:bookly123@localhost:27017,...
```

## 🔄 Flujos de Uso

### **Desarrollo con TODO en Docker**

```bash
# 1. No necesitas .env local
cd infrastructure

# 2. Levantar todo
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml up -d

# Resultado: Todos los servicios con SERVICE_HOST=0.0.0.0 (desde docker-compose)
```

### **Desarrollo Híbrido (Servicios base en Docker, microservicio local)**

```bash
# 1. Levantar solo servicios base
cd infrastructure
docker compose -f docker-compose.base.yml up -d

# 2. Configurar .env en la raíz
cd ..
cp .env.local.example .env

# Editar .env:
# SERVICE_HOST=localhost
# DATABASE_URL=mongodb://bookly:bookly123@localhost:27017,...

# 3. Ejecutar servicio local
npm run start:dev:auth

# Resultado:
# - Servicios base en Docker
# - Auth service local en localhost:3001
```

### **Desarrollo 100% Local (sin Docker)**

```bash
# 1. Instalar MongoDB, Redis, RabbitMQ localmente

# 2. Configurar .env
SERVICE_HOST=localhost
DATABASE_URL=mongodb://localhost:27017/bookly
REDIS_HOST=localhost
RABBITMQ_URL=amqp://localhost:5672

# 3. Ejecutar servicios
npm run start:dev:auth
npm run start:dev:resources
```

## 🔍 Verificación

### **Verificar qué host está usando un servicio**

```bash
# En Docker
docker logs bookly-auth-service 2>&1 | grep "running on"
# Debe mostrar: http://0.0.0.0:3001

# En desarrollo local
# Buscar en los logs del proceso
# Debe mostrar: http://localhost:3001
```

### **Verificar accesibilidad**

```bash
# Desde otro contenedor Docker
docker exec bookly-api-gateway curl http://auth-service:3001/api/v1/health
# Debe funcionar si SERVICE_HOST=0.0.0.0

# Desde máquina local
curl http://localhost:3001/api/v1/health
# Funciona con ambos (0.0.0.0 o localhost)
```

## 📊 Comparación de Escenarios

| Escenario | SERVICE_HOST | DATABASE_URL | Acceso desde Docker | Acceso local |
|-----------|-------------|--------------|---------------------|--------------|
| **Todo en Docker** | `0.0.0.0` | `mongodb-primary:27017` | ✅ Sí | ✅ Sí (puerto mapeado) |
| **Híbrido (servicio local)** | `localhost` | `localhost:27017` | ❌ No | ✅ Sí |
| **Todo local** | `localhost` | `localhost:27017` | ❌ No aplica | ✅ Sí |

## 🛡️ Seguridad

### **¿Por qué localhost en desarrollo local?**

```
0.0.0.0 → Escucha en TODAS las interfaces de red
  ↓
  ├─ 127.0.0.1 (localhost) ✅
  ├─ 192.168.1.X (red local) ⚠️ Expuesto en tu WiFi
  └─ IP pública (si existe) ⚠️ Potencialmente expuesto a internet

localhost/127.0.0.1 → Solo interfaz loopback
  ↓
  └─ 127.0.0.1 ✅ Solo tu máquina puede acceder
```

**Recomendación**: 
- Docker: `0.0.0.0` (necesario)
- Desarrollo local: `localhost` (más seguro)

## 📝 Cheat Sheet

```bash
# Docker (ya configurado en docker-compose.microservices.yml)
SERVICE_HOST=0.0.0.0

# Desarrollo local con servicios base en Docker
SERVICE_HOST=localhost
DATABASE_URL=mongodb://bookly:bookly123@localhost:27017,...
REDIS_HOST=localhost
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672/bookly

# Desarrollo 100% local
SERVICE_HOST=localhost
DATABASE_URL=mongodb://localhost:27017/bookly
REDIS_HOST=localhost
RABBITMQ_URL=amqp://localhost:5672
```

## 🚀 Aplicar en GCP

```bash
cd /path/to/bookly-monorepo/bookly-backend

# 1. Pull de cambios
git pull origin main

# 2. Rebuild y reiniciar
cd infrastructure
docker compose -f docker-compose.microservices.yml build
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml down
docker compose -p bookly -f docker-compose.base.yml -f docker-compose.microservices.yml up -d

# 3. Verificar
docker logs bookly-auth-service --tail 20 | grep "running on"
# Debe mostrar: http://0.0.0.0:3001
```

## 🎓 Preguntas Frecuentes

### **Q: ¿Puedo dejar SERVICE_HOST=0.0.0.0 en desarrollo local?**
A: Sí, funciona. Pero es menos seguro porque expone el servicio en tu red local.

### **Q: ¿Qué pasa si no defino SERVICE_HOST?**
A: El default es `0.0.0.0`, que funciona para Docker y desarrollo local (pero menos seguro localmente).

### **Q: ¿Cómo sé si mi servicio está accesible desde Docker?**
A: Ejecuta: `docker exec bookly-api-gateway nc -zv <servicio>:<puerto>`

### **Q: ¿Por qué los logs muestran 0.0.0.0 pero curl a localhost funciona?**
A: Porque `0.0.0.0` escucha en TODAS las interfaces, incluyendo `127.0.0.1` (localhost).

---

**Última actualización**: 2025-10-23  
**Autor**: Sistema de build Bookly  
**Versión**: 1.0.0
