# Infraestructura - Bookly Backend

Este directorio contiene toda la configuración de infraestructura para el despliegue del backend de Bookly.

## 📁 Estructura

```
infrastructure/
├── pulumi/                 # Infraestructura como Código (IaC)
│   ├── index.ts           # Entrada principal de Pulumi
│   ├── kubernetes.ts      # Configuración del clúster K8s
│   ├── redis.ts           # Redis Cluster
│   ├── database.ts        # MongoDB Atlas
│   └── api-gateway.ts     # API Gateway
├── k8s/                   # Manifiestos de Kubernetes
│   ├── deployments/       # Deployments por microservicio
│   ├── services/          # Services de K8s
│   └── ingress/           # Configuración de Ingress
└── scripts/               # Scripts de automatización
    ├── deploy.sh          # Script de despliegue
    └── setup-env.sh       # Configuración de entorno
```

## 🚀 Despliegue

### Prerrequisitos

1. **Pulumi CLI** instalado
2. **kubectl** configurado
3. **Docker** para construcción de imágenes
4. Acceso a un clúster de Kubernetes (EKS/GKE/AKS)

### Pasos de Despliegue

1. **Configurar variables de entorno:**
   ```bash
   cd infrastructure/scripts
   ./setup-env.sh
   ```

2. **Desplegar infraestructura:**
   ```bash
   cd infrastructure/pulumi
   pulumi up
   ```

3. **Desplegar aplicaciones:**
   ```bash
   cd infrastructure/scripts
   ./deploy.sh
   ```

## 🔧 Configuración

### Variables de Entorno Requeridas

- `PULUMI_ACCESS_TOKEN`: Token de acceso a Pulumi
- `MONGODB_ATLAS_PUBLIC_KEY`: Clave pública de MongoDB Atlas
- `MONGODB_ATLAS_PRIVATE_KEY`: Clave privada de MongoDB Atlas
- `REDIS_PASSWORD`: Contraseña para Redis
- `RABBITMQ_PASSWORD`: Contraseña para RabbitMQ

### Servicios Externos

- **MongoDB Atlas**: Base de datos principal
- **Redis Cloud**: Cache y sesiones
- **RabbitMQ Cloud**: Cola de mensajes
- **Sentry**: Monitoreo de errores
- **OpenTelemetry Collector**: Trazabilidad distribuida

## 📊 Monitoreo

La infraestructura incluye:

- **Health Checks**: Verificación de estado de servicios
- **Metrics**: Métricas de aplicación y sistema
- **Logging**: Logs centralizados con Winston
- **Tracing**: Trazabilidad distribuida con OpenTelemetry
- **Alerting**: Alertas automáticas via Sentry

## 🔒 Seguridad

- **Network Policies**: Aislamiento de red entre servicios
- **RBAC**: Control de acceso basado en roles
- **Secrets Management**: Gestión segura de secretos
- **TLS/SSL**: Cifrado en tránsito
- **Pod Security Policies**: Políticas de seguridad para pods

## 📝 Notas de Implementación

- Todos los servicios están configurados para **auto-scaling**
- **Rolling updates** para despliegues sin tiempo de inactividad
- **Backup automático** de MongoDB Atlas
- **Disaster recovery** configurado para Redis
- **Multi-zone deployment** para alta disponibilidad
