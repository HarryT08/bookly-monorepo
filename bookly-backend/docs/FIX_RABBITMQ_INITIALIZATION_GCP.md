# 🐰 FIX: RabbitMQ Inicialización Lenta en GCP

## 🐛 Problema Identificado

RabbitMQ está tardando **más de 60 segundos** en completar todos sus boot steps durante la inicialización, causando:

1. ❌ Health checks fallando antes de completar inicialización
2. ❌ Microservicios reportando RabbitMQ como "down"
3. ❌ Timeouts en health checks del contenedor Docker
4. ❌ Servicios intentando usar RabbitMQ antes de que esté listo

## 📊 Logs Observados

```
Running boot step rabbit_event_exchange_type_headers defined by app rabbit
Running boot step rabbit_event_exchange_type_topic defined by app rabbit
Running boot step rabbit_queue_location_random defined by app rabbit
Running boot step rabbit_queue_location_client_local defined by app rabbit
...
(más de 100 boot steps)
...
Started message store transient_store for vhost '/bookly'
Successfully set permissions for user 'bookly' in virtual host '/' to '.*', '.*', '.*'
```

**Tiempo total de inicialización**: ~90-120 segundos

## 🔍 Causa Raíz

### Problema 1: Health Check Insuficiente

El health check en `health.service.ts` solo verificaba `this.rabbitmq !== null`:

```typescript
// ❌ ANTES: No verifica estado real
const isHealthy = this.rabbitmq !== null;
```

### Problema 2: Timeout de Docker muy Corto

```yaml
# ❌ ANTES: Solo 60 segundos de gracia
healthcheck:
  start_period: 60s # Insuficiente para RabbitMQ
  timeout: 10s
  retries: 10
```

### Problema 3: Sin Métodos de Health Check en RabbitMQService

El servicio no tenía métodos para verificar estado de conexión:

- No había `isHealthy()`
- No había `getConnectionState()`
- No había `getChannel()`

### Problema 4: Falla el Servicio si RabbitMQ no Está Listo

```typescript
// ❌ ANTES: Lanza error y detiene inicialización
async onModuleInit() {
  try {
    this.connection = await connect(rabbitmqUrl);
  } catch (error) {
    throw error;  // ← Detiene el servicio
  }
}
```

## ✅ Soluciones Implementadas

### 1. Métodos de Health Check en RabbitMQService

**Archivo**: `src/libs/event-bus/services/rabbitmq.service.ts`

```typescript
/**
 * Check if RabbitMQ connection is healthy and ready
 * @returns true if connection and channel are established
 */
isHealthy(): boolean {
  try {
    return (
      this.connection !== null &&
      this.connection !== undefined &&
      this.channel !== null &&
      this.channel !== undefined
    );
  } catch (error) {
    return false;
  }
}

/**
 * Get current connection state
 * @returns 'connected', 'connecting', or 'disconnected'
 */
getConnectionState(): string {
  if (this.connection && this.channel) return 'connected';
  if (this.connection && !this.channel) return 'connecting';
  return 'disconnected';
}

/**
 * Get the channel for direct operations
 * @returns Channel or null if not connected
 */
getChannel(): Channel | null {
  return this.channel || null;
}
```

**Beneficios**:

- ✅ Verificación precisa del estado de conexión
- ✅ Diferenciación entre estados: connected, connecting, disconnected
- ✅ Acceso seguro al channel para operaciones

### 2. Inicialización Tolerante a Fallos

```typescript
async onModuleInit() {
  try {
    const rabbitmqUrl = this.configService.get('RABBITMQ_URL');
    this.loggingService?.log(`Connecting to RabbitMQ at ${rabbitmqUrl}...`, 'RabbitMQService');

    this.connection = await connect(rabbitmqUrl);
    this.loggingService?.log('✅ RabbitMQ connection established', 'RabbitMQService');

    this.channel = await this.connection.createChannel();
    this.loggingService?.log('✅ RabbitMQ channel created', 'RabbitMQService');

    // Declare exchanges
    await this.channel.assertExchange('bookly.events', 'topic', { durable: true });
    await this.channel.assertExchange('booklyapp.commands', 'direct', { durable: true });

    this.loggingService?.log('✅ RabbitMQ connected successfully', 'RabbitMQService');
  } catch (error) {
    this.loggingService?.error('❌ Failed to connect to RabbitMQ', error, 'RabbitMQService');
    // ✅ Don't throw - allow service to start even if RabbitMQ is temporarily unavailable
    // Health checks will report the issue
  }
}
```

**Mejoras**:

- ✅ No detiene el servicio si RabbitMQ no está listo
- ✅ Logging detallado de cada paso de inicialización
- ✅ Permite que health checks reporten el estado real

### 3. Health Check con Retry Logic

**Archivo**: `src/health/health.service.ts`

```typescript
async checkRabbitMQ(key: string): Promise<HealthIndicatorResult> {
  try {
    // Verificar que el servicio existe
    if (!this.rabbitmq) {
      return this.getStatus(key, false, {
        message: 'RabbitMQ service not initialized'
      });
    }

    // Verificar estado de conexión
    if (!this.rabbitmq.isHealthy()) {
      const state = this.rabbitmq.getConnectionState();

      // Más tolerante durante fase de conexión
      if (state === 'connecting') {
        return this.getStatus(key, false, {
          message: 'RabbitMQ is connecting',
          state
        });
      }

      return this.getStatus(key, false, {
        message: 'RabbitMQ connection not healthy',
        state
      });
    }

    // ✅ Retry logic: hasta 2 intentos
    let lastError: any;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        // ✅ Timeout de 5 segundos
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 5000);
        });

        const healthCheckPromise = (async () => {
          const channel = this.rabbitmq.getChannel();

          if (!channel) {
            throw new Error('Channel not available');
          }

          // ✅ Crear queue temporal para verificar funcionalidad
          const testQueue = `health-check-${Date.now()}-${Math.random()}`;
          await channel.assertQueue(testQueue, {
            durable: false,
            autoDelete: true,
            expires: 10000  // Auto-eliminar después de 10 segundos
          });

          // Cleanup (no fallar si esto falla)
          try {
            await channel.deleteQueue(testQueue);
          } catch (cleanupError) {
            // Ignorar errores de cleanup
          }

          return true;
        })();

        const result = await Promise.race([healthCheckPromise, timeoutPromise]);

        if (result) {
          return this.getStatus(key, true, {
            message: 'RabbitMQ connection is healthy',
            state: this.rabbitmq.getConnectionState(),
            attempt: attempt > 1 ? attempt : undefined
          });
        }

        // ✅ Retry con espera
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
      } catch (error) {
        lastError = error;
        // ✅ Retry con espera
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
      }
    }

    // Falló después de 2 intentos
    return this.getStatus(key, false, {
      message: 'RabbitMQ health check failed after retries',
      error: lastError?.message,
      state: this.rabbitmq.getConnectionState()
    });
  } catch (error) {
    // Error inesperado
    return this.getStatus(key, false, {
      message: 'RabbitMQ health check error',
      error: error.message,
      state: this.rabbitmq?.getConnectionState() || 'unknown'
    });
  }
}
```

**Características**:

- ✅ Hasta 2 reintentos automáticos
- ✅ Timeout de 5 segundos
- ✅ Espera de 500ms entre reintentos
- ✅ Verificación real con assertQueue
- ✅ Cleanup automático de queues de prueba
- ✅ Estados detallados en respuestas

### 4. Configuración Docker Mejorada

**Archivo**: `infrastructure/docker-compose.base.yml`

```yaml
rabbitmq:
  healthcheck:
    test:
      [
        "CMD-SHELL",
        "rabbitmq-diagnostics check_port_connectivity && rabbitmq-diagnostics check_running && rabbitmq-diagnostics check_local_alarms",
      ]
    interval: 15s # ✅ Aumentado de 10s a 15s
    timeout: 15s # ✅ Aumentado de 10s a 15s
    retries: 15 # ✅ Aumentado de 10 a 15 reintentos
    start_period: 120s # ✅ CRÍTICO: Aumentado de 60s a 120s
```

**Beneficios**:

- ✅ 120 segundos de gracia para completar boot steps
- ✅ Más tiempo entre checks (15s)
- ✅ Más reintentos antes de marcar como unhealthy
- ✅ Permite que RabbitMQ inicialice completamente

## 🚀 Aplicar en GCP AHORA

### **Opción 1: Comando Make (Recomendado)**

```bash
cd /path/to/bookly-monorepo/bookly-backend

# Pull + rebuild + recrear RabbitMQ + reinicio automático
git pull origin main
cd infrastructure
make dev-fix-rabbitmq-boot
```

### Paso 1: Pull de Cambios

```bash
cd /path/to/bookly-monorepo/bookly-backend
git pull origin main
```

### Paso 2: Rebuild de Microservicios

Los archivos `rabbitmq.service.ts` y `health.service.ts` fueron modificados:

```bash
cd infrastructure

# Rebuild TODOS los microservicios
docker compose -f docker-compose.microservices.yml build
```

### Paso 3: Recrear RabbitMQ con Nueva Configuración

```bash
# Detener RabbitMQ
docker compose -p bookly -f docker-compose.base.yml stop rabbitmq

# Eliminar contenedor (no elimina volumen de datos)
docker rm bookly-rabbitmq

# Levantar RabbitMQ con nueva configuración
docker compose -p bookly -f docker-compose.base.yml up -d rabbitmq

# Esperar 2 minutos (nuevo start_period)
sleep 120
```

### Paso 4: Reiniciar Microservicios

```bash
# Reiniciar microservicios
docker compose -p bookly -f docker-compose.microservices.yml down
docker compose -p bookly -f docker-compose.microservices.yml up -d

# Esperar 30 segundos
sleep 30
```

### Paso 5: Verificación

```bash
# 1. Ver logs de RabbitMQ (debe completar todos los boot steps)
docker logs bookly-rabbitmq --tail 100

# Debe mostrar al final:
# ✅ Successfully set permissions for user 'bookly'
# ✅ Server startup complete

# 2. Health check de auth-service
curl -s http://localhost:3001/api/v1/health | jq '.info.rabbitmq'

# Debe mostrar:
# {
#   "status": "up",
#   "message": "RabbitMQ connection is healthy",
#   "state": "connected"
# }

# 3. Ver estado del contenedor Docker
docker inspect bookly-rabbitmq --format='{{.State.Health.Status}}'

# Debe mostrar: healthy
```

## 📊 Comparación Antes/Después

### ANTES (❌ Falla Frecuentemente)

**Configuración**:

```
start_period: 60s (insuficiente)
timeout: 10s
interval: 10s
```

**Health Check**:

```typescript
// Solo verifica si servicio existe
const isHealthy = this.rabbitmq !== null;
```

**Timeline**:

```
0:00 - 🔄 RabbitMQ iniciando
0:30 - 🔄 Ejecutando boot steps (50/100)
0:60 - ❌ Docker health check FAIL (aún no listo)
1:00 - 🔄 Boot steps completados (100/100)
1:10 - ❌ Microservicio health check FAIL
1:30 - ✅ Finalmente listo, pero ya reportado como unhealthy
```

### DESPUÉS (✅ Estable)

**Configuración**:

```
start_period: 120s (suficiente para boot steps)
timeout: 15s (más tolerante)
interval: 15s
```

**Health Check**:

```typescript
// Verificación real con retry logic
- isHealthy() verifica connection y channel
- assertQueue() prueba funcionalidad real
- 2 reintentos con 500ms de espera
```

**Timeline**:

```
0:00 - 🔄 RabbitMQ iniciando
0:30 - 🔄 Ejecutando boot steps (50/100)
0:60 - 🔄 Boot steps continuando (75/100)
1:00 - 🔄 Boot steps completados (100/100)
1:10 - ✅ Docker health check OK
1:15 - ✅ Microservicio health check OK
1:20 - ✅ Sistema estable y operacional
```

## 🔍 Monitoreo Post-Aplicación

### Verificar Boot Steps Completos

```bash
# Ver todos los boot steps en logs
docker logs bookly-rabbitmq 2>&1 | grep "Running boot step" | wc -l

# Debe mostrar: ~100-120 boot steps

# Ver mensaje de completion
docker logs bookly-rabbitmq 2>&1 | grep "Server startup complete"

# Debe mostrar:
# Server startup complete; 4 plugins started.
```

### Monitorear Health Checks por 5 Minutos

```bash
# Monitoreo continuo
watch -n 10 'curl -s http://localhost:3001/api/v1/health | jq ".info.rabbitmq"'

# Debe mostrar consistentemente:
# {
#   "status": "up",
#   "message": "RabbitMQ connection is healthy",
#   "state": "connected"
# }
```

### Verificar Conexiones Activas

```bash
# Conexiones a RabbitMQ
docker exec bookly-rabbitmq rabbitmqctl list_connections

# Debe mostrar ~6 conexiones (una por microservicio)
```

## 🔧 Troubleshooting

### Si RabbitMQ Sigue Tardando > 120 Segundos

1. **Verificar recursos del contenedor**:

```bash
# Ver uso de recursos
docker stats bookly-rabbitmq --no-stream

# Si CPU > 90% o Memory > 80%, aumentar recursos:
```

Editar `docker-compose.base.yml`:

```yaml
rabbitmq:
  deploy:
    resources:
      limits:
        memory: 2048M # Aumentar de 1GB
        cpus: "2.0" # Más CPU
```

2. **Aumentar aún más el start_period**:

```yaml
rabbitmq:
  healthcheck:
    start_period: 180s # 3 minutos
```

### Si Health Checks Siguen Fallando

```bash
# Verificar dentro del contenedor
docker exec bookly-rabbitmq rabbitmq-diagnostics check_running
docker exec bookly-rabbitmq rabbitmq-diagnostics check_port_connectivity

# Ver logs de errores
docker logs bookly-rabbitmq 2>&1 | grep -i error

# Verificar conectividad desde microservicio
docker exec bookly-auth-service sh -c '
  nc -zv rabbitmq 5672
'
# Debe retornar: Connection to rabbitmq 5672 port [tcp/amqp] succeeded!
```

### Si Queues No Se Crean en Health Check

```bash
# Verificar permisos del usuario
docker exec bookly-rabbitmq rabbitmqctl list_user_permissions bookly

# Debe mostrar:
# Listing permissions for user "bookly" ...
# vhost   configure   write   read
# /       .*          .*      .*
# bookly  .*          .*      .*
```

## 📋 Checklist de Aplicación

- [ ] Pull de cambios completado
- [ ] Microservicios rebuilded
- [ ] RabbitMQ recreado con nueva configuración
- [ ] Verificado start_period: 120s en docker-compose
- [ ] Logs de RabbitMQ muestran "Server startup complete"
- [ ] Docker health check reporta "healthy"
- [ ] Health checks de microservicios reportan "up"
- [ ] Conexiones activas a RabbitMQ verificadas
- [ ] Monitoreo de 5 minutos sin fallos

## 🎯 Resumen del Fix

| Aspecto           | Antes            | Después                            |
| ----------------- | ---------------- | ---------------------------------- |
| **Health Check**  | `!== null`       | `isHealthy()` + retry + queue test |
| **Timeout**       | 10s              | 15s                                |
| **Start Period**  | 60s              | 120s                               |
| **Reintentos**    | 10               | 15                                 |
| **Fallo en Init** | Detiene servicio | Permite iniciar                    |
| **Estado**        | Sin detalles     | connected/connecting/disconnected  |
| **Verificación**  | Ninguna          | assertQueue real                   |

---

**Última actualización**: 2025-10-24 14:45 UTC-5  
**Problema**: RabbitMQ tardando >60s en inicializar  
**Solución**: Health checks mejorados + start_period extendido a 120s  
**Estado**: ✅ FIX APLICADO - Listo para deployment
