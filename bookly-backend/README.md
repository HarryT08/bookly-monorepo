# Bookly Backend

Sistema de Reservas Institucionales - Backend desarrollado con NestJS siguiendo arquitectura hexagonal, CQRS y Event-Driven Architecture.

## 🏗️ Arquitectura

El backend está estructurado siguiendo los principios de:

- **Arquitectura Hexagonal (Ports & Adapters)**
- **Clean Code**
- **CQRS (Command Query Responsibility Segregation)**
- **Event-Driven Architecture (EDA)**
- **Behavior-Driven Development (BDD)**

## 📦 Estructura del Proyecto

```
src/
├── apps/                           # Microservicios
│   ├── auth-service/              # Autenticación y control de accesos
│   ├── resources-service/         # Gestión de recursos físicos
│   ├── availability-service/      # Gestión de horarios y reservas
│   ├── stockpile-service/        # Flujos de aprobación y validación
│   ├── reports-service/          # Generación de reportes y dashboards
│   └── api-gateway/              # Puerta de enlace unificada
├── libs/                         # Librerías compartidas
│   ├── common/                   # Pipes, interceptors, middlewares
│   ├── dto/                      # Data Transfer Objects compartidos
│   ├── event-bus/               # Sistema de eventos (RabbitMQ, Redis)
│   ├── logging/                 # Winston logging estructurado
│   ├── monitoring/              # OpenTelemetry y Sentry
│   └── i18n/                    # Internacionalización
├── health/                      # Health checks
└── main.ts                      # Bootstrap de la aplicación
```

## 🛠️ Tecnologías

### Backend Core
- **NestJS** - Framework modular
- **Prisma** - ORM sobre MongoDB
- **MongoDB** - Base de datos NoSQL
- **TypeScript** - Lenguaje principal

### Comunicación y Eventos
- **Redis** - Cache y sesiones
- **RabbitMQ** - Cola de mensajes distribuidos
- **WebSockets** - Notificaciones en tiempo real

### Observabilidad
- **Winston** - Logging estructurado
- **OpenTelemetry** - Trazabilidad distribuida
- **Sentry** - Monitoreo de errores

### Documentación
- **Swagger/OpenAPI** - Documentación de APIs REST
- **AsyncAPI** - Documentación de eventos

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js v18+ 
- MongoDB
- Redis
- RabbitMQ

### Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Generar cliente de Prisma:**
   ```bash
   npm run prisma:generate
   ```

4. **Sincronizar base de datos:**
   ```bash
   npm run prisma:db:push
   ```

### Desarrollo

```bash
# Modo desarrollo con hot-reload
npm run start:dev

# Modo debug
npm run start:debug

# Modo producción
npm run start:prod
```

### Testing

```bash
# Pruebas unitarias
npm run test

# Pruebas con cobertura
npm run test:cov

# Pruebas E2E
npm run test:e2e

# Modo watch
npm run test:watch
```

## 📚 Documentación de APIs

Una vez iniciada la aplicación, la documentación estará disponible en:

- **Swagger UI**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

## 🏛️ Microservicios

### Auth Service
- Autenticación JWT
- Gestión de usuarios y roles
- Control de accesos (RBAC)

### Resources Service
- CRUD de recursos (salas, equipos, etc.)
- Categorización y atributos
- Gestión de mantenimiento

### Availability Service
- Gestión de horarios disponibles
- Creación y modificación de reservas
- Lista de espera y reasignaciones

### Stockpile Service
- Flujos de aprobación
- Generación de documentos PDF
- Notificaciones automáticas
- Check-in/Check-out digital

### Reports Service
- Reportes de uso y estadísticas
- Dashboards interactivos
- Exportación de datos
- Feedback de usuarios

### API Gateway
- Punto de entrada unificado
- Rate limiting
- Autenticación centralizada
- Documentación consolidada

## 🔧 Configuración

### Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

### Base de Datos

El esquema de Prisma está en `prisma/schema.prisma` con modelos para:
- Usuarios y roles
- Recursos y categorías
- Reservas y disponibilidad
- Aprobaciones y auditoría

### Eventos

El sistema utiliza eventos distribuidos para comunicación entre servicios:
- `UserRegistered`
- `ReservationCreated`
- `ReservationApproved`
- `ResourceUpdated`

## 🧪 Testing

### Pruebas Unitarias
- Verifican la existencia y funcionalidad de servicios
- Mockean dependencias externas
- Cobertura mínima del 80%

### Pruebas E2E
- Verifican endpoints existentes
- Validan respuestas HTTP
- Prueban flujos completos

## 🚀 Despliegue

### Docker

```bash
# Construir imagen
npm run docker:build

# Ejecutar contenedor
npm run docker:run
```

### Kubernetes

Ver `infrastructure/` para manifiestos y configuración de despliegue.

## 📊 Monitoreo

### Health Checks
- `/health` - Estado general
- `/health/ready` - Preparación
- `/health/live` - Vitalidad

### Métricas
- Tiempo de respuesta
- Uso de memoria
- Conexiones de BD
- Cola de mensajes

### Logs
- Formato JSON estructurado
- Rotación diaria
- Niveles configurables
- Trazabilidad de requests

## 🔒 Seguridad

- Autenticación JWT
- Validación de entrada
- Rate limiting
- CORS configurado
- Sanitización de datos
- Auditoría de acciones

## 🌍 Internacionalización

Soporte para múltiples idiomas:
- Español (es) - por defecto
- Inglés (en) - fallback

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear issue en GitHub
- Contactar al equipo de desarrollo
