# Bookly API Gateway

## Índice

1. [Documentación Técnica](#documentación-técnica)
2. [Documentación de Usuario](#documentación-de-usuario)
3. [WebSocket Gateway](#websocket-gateway)
4. [Configuración](#configuración)
5. [Testing](#testing)

---

## Documentación Técnica

El **API Gateway de Bookly** es el punto de entrada centralizado que unifica todas las comunicaciones entre el frontend y los microservicios del backend. Implementa patrones de arquitectura empresarial como:

- **Routing & Load Balancing**
- **Rate Limiting & Circuit Breaker**
- **Authentication & Authorization**
- **WebSocket Gateway para comunicaciones en tiempo real**
- **Observabilidad y Monitoreo**

### Arquitectura

```
┌─────────────────┐    ┌──────────────────────────────────┐
│   Frontend      │───▶│        API Gateway               │
│   (Next.js)     │    │  ┌─────────────┬───────────────┐ │
└─────────────────┘    │  │ HTTP Routes │ WebSocket     │ │
                       │  │             │ Gateway       │ │
                       │  └─────────────┴───────────────┘ │
                       └──────────┬───────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Auth Service   │  │Availability Svc │  │ Resources Svc   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Stack Tecnológico

- **NestJS**: Framework base
- **Socket.IO**: WebSocket implementation
- **JWT**: Authentication
- **ThrottlerModule**: Rate limiting
- **HttpModule**: HTTP proxy
- **EventBus**: Eventos distribuidos

---

## Documentación de Usuario

### Endpoints Disponibles

#### 1. **Gateway Management**
```
GET    /_gateway/health          # Health check del gateway
GET    /_gateway/metrics         # Métricas y estadísticas
POST   /_gateway/config          # Actualizar configuración
```

#### 2. **WebSocket Testing**
```
POST   /websocket-test/emit-reservation-event    # Emitir evento de reserva
POST   /websocket-test/emit-resource-event       # Emitir evento de recurso
POST   /websocket-test/emit-notification-event   # Emitir evento de notificación
POST   /websocket-test/emit-system-event         # Emitir evento del sistema
POST   /websocket-test/emit-custom-event         # Emitir evento personalizado
```

#### 3. **Proxy Routes**
Todos los demás endpoints son redirigidos automáticamente a los microservicios correspondientes.

### Autenticación

El API Gateway requiere autenticación JWT para:
- **HTTP Requests**: Header `Authorization: Bearer <token>`
- **WebSocket Connections**: Query parameter `?token=<jwt_token>`

### Rate Limiting

- **Global**: 1000 requests por minuto por IP
- **Authenticated**: Límites más altos para usuarios autenticados
- **WebSocket**: 100 conexiones simultáneas por usuario

---

## WebSocket Gateway

### Conexión

```javascript
// Frontend connection
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Rooms (Salas)

Los usuarios se conectan automáticamente a salas basadas en sus roles:

- **`user_{userId}`**: Notificaciones personales
- **`resource_{resourceId}`**: Eventos de recursos específicos
- **`admin`**: Eventos administrativos (solo admins)
- **`global`**: Eventos globales del sistema

### Eventos WebSocket

#### Eventos Entrantes (Cliente → Servidor)

```javascript
// Unirse a una sala específica
socket.emit('join-room', { roomName: 'resource_123' });

// Salir de una sala
socket.emit('leave-room', { roomName: 'resource_123' });

// Obtener estadísticas
socket.emit('get-stats');
```

#### Eventos Salientes (Servidor → Cliente)

```javascript
// Eventos de reservas
socket.on('reservation-created', (data) => {
  console.log('Nueva reserva:', data);
});

socket.on('reservation-updated', (data) => {
  console.log('Reserva actualizada:', data);
});

socket.on('reservation-cancelled', (data) => {
  console.log('Reserva cancelada:', data);
});

// Eventos de recursos
socket.on('resource-created', (data) => {
  console.log('Recurso creado:', data);
});

socket.on('resource-maintenance', (data) => {
  console.log('Recurso en mantenimiento:', data);
});

// Notificaciones
socket.on('notification', (data) => {
  console.log('Nueva notificación:', data);
});

// Eventos del sistema
socket.on('system-alert', (data) => {
  console.log('Alerta del sistema:', data);
});

// Errores
socket.on('error', (error) => {
  console.error('Error WebSocket:', error);
});
```

### Estructura de Eventos

```typescript
interface WebSocketEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  timestamp: Date;
  data: any;
  userId?: string;
  rooms: string[];
}
```

---

## Configuración

### Variables de Entorno

```bash
# Gateway Configuration
GATEWAY_PORT=3000
GATEWAY_HOST=0.0.0.0

# JWT Configuration
GATEWAY_JWT_SECRET=your-super-secret-key
GATEWAY_JWT_EXPIRES_IN=24h

# Rate Limiting
GATEWAY_RATE_LIMIT_TTL=60
GATEWAY_RATE_LIMIT_GLOBAL=1000

# Proxy Configuration
GATEWAY_PROXY_TIMEOUT=30000
GATEWAY_PROXY_RETRIES=3

# Services URLs
AUTH_SERVICE_URL=http://localhost:3001
AVAILABILITY_SERVICE_URL=http://localhost:3002
RESOURCES_SERVICE_URL=http://localhost:3003

# WebSocket Configuration
WEBSOCKET_CORS_ORIGIN=http://localhost:3001,http://localhost:3000
WEBSOCKET_MAX_CONNECTIONS=1000
WEBSOCKET_CONNECTION_TIMEOUT=30000

# Redis (for WebSocket scaling)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ (for event distribution)
RABBITMQ_URL=amqp://localhost:5672
```

---

## Testing

### Pruebas Manuales

1. **Health Check**
```bash
curl -X GET http://localhost:3000/_gateway/health
```

2. **Métricas**
```bash
curl -X GET http://localhost:3000/_gateway/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. **Test WebSocket Event**
```bash
curl -X POST http://localhost:3000/websocket-test/emit-custom-event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventType": "test-event",
    "aggregateId": "test-123",
    "data": {"message": "Hello WebSocket!"}
  }'
```

### Colecciones Postman

- **api-gateway.postman_collection.json**: Endpoints HTTP del gateway
- **websocket-gateway.postman_collection.json**: Testing de eventos WebSocket
- **api-gateway.postman_environment.json**: Variables de entorno

### Testing WebSocket

Usar herramientas como:
- **Socket.IO Client Tool**: Para testing manual
- **WebSocket King**: Chrome extension
- **Postman WebSocket**: Para collections

---

## Monitoreo y Observabilidad

### Métricas Disponibles

- **Conexiones WebSocket**: Activas, totales, errores
- **HTTP Requests**: Rate, latencia, errores por endpoint
- **Circuit Breaker**: Estado de circuitos por servicio
- **Rate Limiting**: Requests rechazados, límites alcanzados

### Logs Estructurados

```json
{
  "timestamp": "2025-01-02T15:02:33.000Z",
  "level": "info",
  "service": "api-gateway",
  "message": "WebSocket connection established",
  "userId": "user_123",
  "correlationId": "req_456",
  "metadata": {
    "rooms": ["user_123", "global"],
    "userAgent": "Mozilla/5.0..."
  }
}
```

### Alertas

- **High Error Rate**: >5% errores en 5 minutos
- **WebSocket Disconnections**: >10% desconexiones en 1 minuto
- **Rate Limit Exceeded**: >100 requests rechazados en 1 minuto
- **Service Unavailable**: Circuit breaker abierto >30 segundos

---

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bookly-api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bookly-api-gateway
  template:
    spec:
      containers:
      - name: api-gateway
        image: bookly/api-gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
```

---

## Troubleshooting

### Problemas Comunes

1. **WebSocket no conecta**
   - Verificar JWT token válido
   - Comprobar CORS configuration
   - Revisar firewall/proxy settings

2. **Rate limiting muy agresivo**
   - Ajustar `GATEWAY_RATE_LIMIT_GLOBAL`
   - Implementar rate limiting por usuario autenticado

3. **Latencia alta en proxy**
   - Aumentar `GATEWAY_PROXY_TIMEOUT`
   - Revisar configuración de load balancer
   - Verificar health de servicios backend

4. **Pérdida de eventos WebSocket**
   - Verificar configuración de Redis
   - Comprobar límites de conexión
   - Revisar logs de RabbitMQ

### Comandos de Debug

```bash
# Ver logs del API Gateway
docker logs bookly-api-gateway -f

# Verificar conectividad a servicios
curl -I http://auth-service:3001/health
curl -I http://availability-service:3002/health
curl -I http://resources-service:3003/health

# Testing WebSocket connection
wscat -c ws://localhost:3000/socket.io/?EIO=4&transport=websocket&token=YOUR_JWT
```
