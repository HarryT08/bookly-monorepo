# Estándar de Respuesta API - Bookly Backend

## Estructura Estándar

Todas las respuestas de la API deben seguir esta estructura:

```typescript
{
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp?: string;
  path?: string;
  method?: string;
  statusCode?: number;
}
```

## Tipos de Respuesta

### 1. Respuesta Exitosa Individual
```json
{
  "success": true,
  "data": { "id": "123", "name": "John Doe" },
  "message": "User retrieved successfully",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/v1/users/123",
  "method": "GET",
  "statusCode": 200
}
```

### 2. Respuesta Exitosa con Paginación
```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "User 1" },
    { "id": "2", "name": "User 2" }
  ],
  "message": "Users retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/v1/users",
  "method": "GET",
  "statusCode": 200
}
```

### 3. Respuesta de Error con Validaciones
```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required", "Email format is invalid"],
    "password": ["Password must be at least 8 characters"]
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/v1/users",
  "method": "POST",
  "statusCode": 400
}
```

## Implementación

### Usar ResponseUtil en Controllers

```typescript
import { ResponseUtil } from '../../../../libs/common/utils/response.util';

// Respuesta individual
return ResponseUtil.success(user, 'User retrieved successfully');

// Respuesta paginada
return ResponseUtil.paginated(users, total, page, limit, 'Users retrieved successfully');

// Respuesta de error
return ResponseUtil.error('User not found');

// Error de validación
return ResponseUtil.validationError({
  email: ['Email is required'],
  password: ['Password is too weak']
});
```

### TransformInterceptor Automático

El `TransformInterceptor` se aplica automáticamente y:
- Detecta respuestas paginadas (`{ data, total, page, limit }`)
- Formatea respuestas individuales
- Agrega metadata (timestamp, path, method, statusCode)
- Aplica mensajes i18n

### HttpExceptionFilter para Errores

El `HttpExceptionFilter` maneja automáticamente:
- Excepciones HTTP de NestJS
- Errores de validación de class-validator
- Logging estructurado
- Formato de respuesta consistente

## Actualización de Controllers Existentes

Los controllers deben actualizarse para usar `ResponseUtil`:

```typescript
// ANTES
async findAll() {
  return this.service.findAll();
}

// DESPUÉS
async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
  const result = await this.service.findAll(page, limit);
  return ResponseUtil.fromServiceResponse({
    items: result.data || result.items,
    total: result.total,
    page: page || 1,
    limit: limit || 20,
    message: 'Items retrieved successfully'
  });
}
```

## Documentación Swagger

Los DTOs están configurados para Swagger:
- `SuccessResponseDto<T>`: Respuestas exitosas
- `PaginatedResponseDto<T>`: Respuestas paginadas
- `ErrorResponseDto`: Respuestas de error

## Beneficios

1. **Consistencia**: Todas las APIs siguen el mismo formato
2. **Frontend Predictible**: El frontend siempre sabe qué esperar
3. **Debugging**: Metadata completa para troubleshooting
4. **i18n**: Mensajes traducidos automáticamente
5. **Validaciones Granulares**: Errores específicos por campo
6. **Paginación Estándar**: Meta información consistente
