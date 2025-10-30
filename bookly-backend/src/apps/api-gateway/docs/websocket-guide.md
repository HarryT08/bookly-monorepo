# Guía Completa del WebSocket Gateway - Bookly

## Introducción

El WebSocket Gateway de Bookly permite comunicación bidireccional en tiempo real entre el frontend y el backend, habilitando notificaciones instantáneas, actualizaciones de estado y eventos del sistema.

## Conexión WebSocket

### Desde JavaScript/TypeScript

```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3000', {
  auth: {
    token: 'your-jwt-token-here'
  },
  transports: ['websocket', 'polling']
});

// Event handlers
socket.on('connect', () => {
  console.log('Conectado al WebSocket Gateway');
  console.log('Socket ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Desconectado:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Error de conexión:', error.message);
});
```

### Desde React Hook

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useBooklyWebSocket = (token: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      console.log('WebSocket conectado');
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
      console.log('WebSocket desconectado');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, [token]);

  return { socket, connected };
};
```

## Sistema de Salas (Rooms)

### Salas Automáticas

Al conectarse, los usuarios se unen automáticamente a salas basadas en su rol:

- **`user_{userId}`**: Notificaciones personales del usuario
- **`global`**: Eventos globales del sistema
- **`admin`** (solo administradores): Eventos administrativos
- **`program_{programId}`** (docentes/admins): Eventos del programa académico

### Unirse a Salas Específicas

```javascript
// Unirse a la sala de un recurso específico
socket.emit('join-room', { 
  roomName: 'resource_sala-101' 
});

// Unirse a múltiples salas
socket.emit('join-room', { 
  roomName: 'reservation_12345' 
});

socket.emit('join-room', { 
  roomName: 'maintenance_lab-202' 
});
```

### Salir de Salas

```javascript
socket.emit('leave-room', { 
  roomName: 'resource_sala-101' 
});
```

## Eventos del Sistema

### 1. Eventos de Reservas

#### Reserva Creada

```javascript
socket.on('reservation-created', (data) => {
  // data structure:
  {
    eventId: "evt_123456",
    eventType: "reservation-created",
    aggregateId: "reservation_789",
    timestamp: "2025-01-02T15:02:33.000Z",
    data: {
      reservationId: "789",
      resourceId: "sala-101",
      userId: "user_456",
      startTime: "2025-01-03T09:00:00.000Z",
      endTime: "2025-01-03T11:00:00.000Z",
      status: "PENDING_APPROVAL"
    }
  }
});
```

#### Reserva Aprobada

```javascript
socket.on('reservation-approved', (data) => {
  console.log(`Reserva ${data.data.reservationId} aprobada`);
  // Actualizar UI para mostrar estado aprobado
});
```

#### Reserva Rechazada

```javascript
socket.on('reservation-rejected', (data) => {
  console.log(`Reserva ${data.data.reservationId} rechazada: ${data.data.reason}`);
  // Mostrar mensaje de rechazo al usuario
});
```

#### Reserva Cancelada

```javascript
socket.on('reservation-cancelled', (data) => {
  console.log(`Reserva ${data.data.reservationId} cancelada`);
  // Remover de calendario o marcar como cancelada
});
```

### 2. Eventos de Recursos

#### Recurso Creado

```javascript
socket.on('resource-created', (data) => {
  // Agregar nuevo recurso a la lista
  console.log(`Nuevo recurso creado: ${data.data.name}`);
});
```

#### Recurso en Mantenimiento

```javascript
socket.on('resource-maintenance-scheduled', (data) => {
  console.log(`Mantenimiento programado para ${data.data.resourceName}`);
  // Mostrar alerta y deshabilitar reservas
});

socket.on('resource-maintenance-started', (data) => {
  console.log(`Mantenimiento iniciado: ${data.data.resourceName}`);
  // Marcar recurso como no disponible
});

socket.on('resource-maintenance-completed', (data) => {
  console.log(`Mantenimiento completado: ${data.data.resourceName}`);
  // Reactivar disponibilidad del recurso
});
```

#### Recurso Deshabilitado

```javascript
socket.on('resource-disabled', (data) => {
  console.log(`Recurso ${data.data.resourceName} deshabilitado`);
  // Ocultar o marcar como no disponible
});
```

### 3. Notificaciones

#### Notificación Personal

```javascript
socket.on('notification', (data) => {
  // data structure:
  {
    eventType: "notification",
    data: {
      type: "INFO" | "WARNING" | "ERROR" | "SUCCESS",
      title: "Título de la notificación",
      message: "Mensaje detallado",
      actionUrl: "/path/to/action",
      userId: "user_456"
    }
  }
  
  // Mostrar notificación en UI
  showNotification(data.data.title, data.data.message, data.data.type);
});
```

#### Recordatorio de Reserva

```javascript
socket.on('reservation-reminder', (data) => {
  const { reservationId, resourceName, startTime } = data.data;
  console.log(`Recordatorio: Tu reserva en ${resourceName} comienza en 15 minutos`);
  
  // Mostrar notificación push o in-app
  showReminderNotification(`Reserva en ${resourceName}`, `Comienza a las ${startTime}`);
});
```

### 4. Eventos del Sistema

#### Alerta del Sistema

```javascript
socket.on('system-alert', (data) => {
  const { level, message, affectedServices } = data.data;
  
  if (level === 'CRITICAL') {
    // Mostrar alerta crítica
    showCriticalAlert(message);
  } else if (level === 'WARNING') {
    // Mostrar warning
    showWarning(message);
  }
});
```

#### Mantenimiento del Sistema

```javascript
socket.on('system-maintenance', (data) => {
  const { scheduledAt, estimatedDuration, services } = data.data;
  
  // Mostrar banner de mantenimiento programado
  showMaintenanceBanner(`Mantenimiento programado: ${scheduledAt}`);
});
```

## Casos de Uso Comunes

### 1. Dashboard en Tiempo Real

```javascript
// Dashboard que muestra estadísticas en vivo
const [stats, setStats] = useState({
  activeReservations: 0,
  availableResources: 0,
  maintenanceAlerts: 0
});

socket.on('stats-updated', (data) => {
  setStats(data.stats);
});

// Solicitar estadísticas actualizadas
socket.emit('get-stats');
```

### 2. Calendario Interactivo

```javascript
const [calendarEvents, setCalendarEvents] = useState([]);

// Actualizar calendario cuando hay cambios
socket.on('reservation-created', (data) => {
  const newEvent = {
    id: data.data.reservationId,
    title: `Reserva - ${data.data.resourceName}`,
    start: data.data.startTime,
    end: data.data.endTime,
    status: data.data.status
  };
  
  setCalendarEvents(prev => [...prev, newEvent]);
});

socket.on('reservation-cancelled', (data) => {
  setCalendarEvents(prev => 
    prev.filter(event => event.id !== data.data.reservationId)
  );
});
```

### 3. Notificaciones Toast

```javascript
import { toast } from 'react-toastify';

socket.on('notification', (data) => {
  const { type, title, message } = data.data;
  
  switch (type) {
    case 'SUCCESS':
      toast.success(`${title}: ${message}`);
      break;
    case 'WARNING':
      toast.warn(`${title}: ${message}`);
      break;
    case 'ERROR':
      toast.error(`${title}: ${message}`);
      break;
    default:
      toast.info(`${title}: ${message}`);
  }
});
```

### 4. Estado de Recursos en Vivo

```javascript
const [resourceStatus, setResourceStatus] = useState({});

socket.on('resource-status-changed', (data) => {
  const { resourceId, status, reason } = data.data;
  
  setResourceStatus(prev => ({
    ...prev,
    [resourceId]: { status, reason, updatedAt: new Date() }
  }));
});

// Usar en componente de recurso
const ResourceCard = ({ resourceId, resourceName }) => {
  const status = resourceStatus[resourceId];
  
  return (
    <div className={`resource-card ${status?.status?.toLowerCase()}`}>
      <h3>{resourceName}</h3>
      <span className="status">{status?.status || 'AVAILABLE'}</span>
      {status?.reason && <p className="reason">{status.reason}</p>}
    </div>
  );
};
```

## Error Handling

### Manejo de Errores de Conexión

```javascript
socket.on('connect_error', (error) => {
  console.error('Error de conexión:', error);
  
  if (error.message.includes('authentication')) {
    // Token inválido o expirado
    handleAuthError();
  } else if (error.message.includes('timeout')) {
    // Timeout de conexión
    showNetworkError();
  }
});

socket.on('error', (error) => {
  console.error('Error WebSocket:', error);
  
  // Mostrar error al usuario
  toast.error(`Error: ${error.message}`);
});
```

### Reconexión Automática

```javascript
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

socket.on('disconnect', (reason) => {
  console.log('Desconectado:', reason);
  
  if (reason === 'io server disconnect') {
    // Server desconectó intencionalmente
    // Reconectar manualmente
    socket.connect();
  }
  
  // Si hay errores de red, intentar reconectar
  if (reason === 'transport error' && reconnectAttempts < maxReconnectAttempts) {
    setTimeout(() => {
      reconnectAttempts++;
      socket.connect();
    }, Math.pow(2, reconnectAttempts) * 1000); // Backoff exponencial
  }
});

socket.on('connect', () => {
  reconnectAttempts = 0; // Reset counter on successful connection
});
```

## Testing y Debugging

### Logging de Eventos

```javascript
// Habilitar logs detallados para debugging
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  // Log todos los eventos recibidos
  socket.onAny((eventName, ...args) => {
    console.log(`WebSocket Event: ${eventName}`, args);
  });
  
  // Log eventos enviados
  const originalEmit = socket.emit;
  socket.emit = function(eventName, ...args) {
    console.log(`WebSocket Emit: ${eventName}`, args);
    return originalEmit.apply(this, arguments);
  };
}
```

### Herramientas de Testing

```javascript
// Función helper para testing
const testWebSocketConnection = async (token) => {
  return new Promise((resolve, reject) => {
    const testSocket = io('ws://localhost:3000', { auth: { token } });
    
    testSocket.on('connect', () => {
      console.log('✅ Conexión exitosa');
      testSocket.disconnect();
      resolve(true);
    });
    
    testSocket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
      reject(error);
    });
    
    // Timeout después de 5 segundos
    setTimeout(() => {
      testSocket.disconnect();
      reject(new Error('Timeout de conexión'));
    }, 5000);
  });
};

// Uso
try {
  await testWebSocketConnection('your-jwt-token');
  console.log('WebSocket funcionando correctamente');
} catch (error) {
  console.error('WebSocket no funciona:', error);
}
```

## Mejores Prácticas

### 1. Gestión de Estado

```javascript
// Usar useReducer para manejar estado complejo
const websocketReducer = (state, action) => {
  switch (action.type) {
    case 'WEBSOCKET_CONNECTED':
      return { ...state, connected: true, error: null };
    case 'WEBSOCKET_DISCONNECTED':
      return { ...state, connected: false };
    case 'WEBSOCKET_ERROR':
      return { ...state, error: action.error };
    case 'EVENT_RECEIVED':
      return { 
        ...state, 
        events: [action.event, ...state.events.slice(0, 99)] // Keep last 100 events
      };
    default:
      return state;
  }
};
```

### 2. Cleanup de Listeners

```javascript
useEffect(() => {
  const handlers = {
    'reservation-created': handleReservationCreated,
    'resource-updated': handleResourceUpdated,
    'notification': handleNotification
  };

  // Registrar listeners
  Object.entries(handlers).forEach(([event, handler]) => {
    socket.on(event, handler);
  });

  // Cleanup
  return () => {
    Object.keys(handlers).forEach(event => {
      socket.off(event);
    });
  };
}, [socket]);
```

### 3. Rate Limiting del Cliente

```javascript
// Throttle emisiones para evitar spam
import { throttle } from 'lodash';

const throttledEmit = throttle((event, data) => {
  socket.emit(event, data);
}, 1000); // Máximo 1 emisión por segundo

// Uso
throttledEmit('join-room', { roomName: 'resource_123' });
```

### 4. Offline Handling

```javascript
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => {
    setIsOnline(true);
    if (socket && !socket.connected) {
      socket.connect();
    }
  };

  const handleOffline = () => {
    setIsOnline(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, [socket]);
```
