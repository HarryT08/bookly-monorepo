# 📌 Bookly - Sistema de Gestión de Reservas para Instituciones Académicas 🏫

## 📖 Descripción

Bookly es una plataforma diseñada para la **gestión eficiente de reservas de espacios institucionales** en universidades, asegurando disponibilidad en tiempo real, control de accesos, reportes detallados y trazabilidad de uso.  
Utiliza una **arquitectura hexagonal basada en microservicios y eventos** implementada con NestJS y NX para garantizar escalabilidad, modularidad y mantenibilidad.

---

## 🚀 Características Principales

✅ **Gestión completa de recursos** (salones, auditorios, laboratorios, equipos)  
✅ **Disponibilidad en tiempo real** con sincronización de calendarios  
✅ **Sistema de aprobaciones y trazabilidad de reservas** según roles de usuario  
✅ **Reportes avanzados y análisis de ocupación de espacios**  
✅ **Autenticación y autorización segura** con OAuth2, JWT y 2FA  
✅ **Sistema de notificaciones en tiempo real** vía WebSockets, Email y WhatsApp  
✅ **Arquitectura orientada a eventos** con comunicación asíncrona entre servicios  
✅ **Despliegue escalable y resiliente** en Kubernetes con Pulumi  
✅ **Monitoreo completo** con OpenTelemetry y Sentry

---

## 🏗 Arquitectura y Tecnologías

Bookly implementa una **Arquitectura Hexagonal (Puertos y Adaptadores)** combinada con **CQRS (Command Query Responsibility Segregation)** y **Event-Driven Architecture (EDA)**. Esta combinación permite:

- **Separación clara de responsabilidades** entre la lógica de dominio y la infraestructura
- **Independencia tecnológica** entre los componentes del sistema
- **Escalabilidad horizontal** mediante microservicios especializados
- **Comunicación asíncrona** basada en eventos entre servicios

### Tecnologías principales:

📂 **Monorepo con NX** - Gestión unificada de múltiples proyectos relacionados  
📌 **NestJS + TypeScript** - Framework modular con fuerte tipado para APIs robustas  
📊 **MongoDB + Prisma ORM** - Base de datos NoSQL con ORM para modelado de datos  
⚡ **Redis** - Caché distribuida y almacén de sesiones  
🐰 **RabbitMQ** - Sistema de mensajería para comunicación entre microservicios  
🌎 **i18n** - Internacionalización para soporte multilingüe  
📝 **Swagger + AsyncAPI** - Documentación automática de APIs REST y eventos  
📡 **WebSockets** - Comunicación bidireccional en tiempo real  
🚀 **Kubernetes** - Orquestación de contenedores para despliegue  
🛠️ **Pulumi** - Infraestructura como código (IaC)  
🔍 **OpenTelemetry + Sentry** - Monitoreo, trazabilidad y gestión de errores  
🔄 **GitHub Actions** - Automatización de CI/CD

---

## 📁 Estructura del Proyecto (Monorepo NX)

Bookly está organizado en **microservicios independientes** dentro de un **monorepo NX**:

```
📂 bookly-monorepo  
├── **apps/** *(Microservicios principales)*  
│   ├── **auth-app/** → Gestión de autenticación y usuarios  
│   ├── **resources-app/** → Administración de espacios y equipos  
│   ├── **availability-app/** → Disponibilidad y reservas  
│   ├── **stockpile-app/** → Aprobaciones y solicitudes  
│   ├── **reports-app/** → Reportes y análisis de uso  
│   ├── **notifications-app/** → Notificaciones y comunicación con usuarios  
│   ├── **gateway/** → API Gateway, balanceo de carga y seguridad  
│   ├── **bookly-app/** → Aplicación principal/agregador de servicios
│   ├── **web/** → Interfaz de usuario web del sistema
│  
├── **libs/** *(Librerías compartidas entre microservicios)*
│   ├── **common/** → Middlewares, interceptores, utilidades  
│   ├── **dto/** → Data Transfer Objects (DTOs)  
│   ├── **event-bus/** → Implementación de eventos RabbitMQ  
│   ├── **logging/** → Sistema centralizado de registro de logs
│   ├── **monitoring/** → OpenTelemetry y Sentry para monitoreo
│  
├── **infraestructure/** *(Infraestructura como Código - IaC)*  
│   ├── **pulumi/** → Configuración de despliegue en la nube  
│   ├── **k8s/** → Archivos YAML para Kubernetes  
│  
├── **tests/** *(Pruebas automatizadas con Jest - BDD)*  
├── **scripts/** *(Automatización de despliegue con GitHub Actions)*  
```

### Estructura de los Microservicios

Cada microservicio sigue la estructura estándar de NestJS:

```
📂 [nombre-microservicio]
├── **src/** 
│   ├── **app/** → Módulo principal y controladores
│   ├── **main.ts** → Punto de entrada de la aplicación
├── **jest.config.ts/** → Configuración de pruebas
├── **project.json/** → Configuración del proyecto en NX
└── **tsconfig.json/** → Configuración de TypeScript
```

### Estructura de las Librerías Compartidas

Las librerías compartidas siguen una estructura similar:

```
📂 [nombre-librería]
├── **src/**
│   ├── **lib/** → Implementación de la librería
│   ├── **index.ts** → Exportaciones públicas
├── **project.json/** → Configuración del proyecto en NX
└── **tsconfig.json/** → Configuración de TypeScript
```

---

## 🛠 Instalación y Configuración

### Requisitos Previos

- Node.js (v16 o superior)
- MongoDB (v5 o superior)
- Redis (v6 o superior)
- RabbitMQ (v3.8 o superior)
- Docker y Docker Compose (para desarrollo local)
- Kubectl (para despliegue en Kubernetes)
- Pulumi CLI (para gestión de infraestructura)

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/bookly-monorepo.git
cd bookly-monorepo
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Configurar variables de entorno
```bash
cp .env.example .env
```
Edita el archivo `.env` con las credenciales de MongoDB, Redis, RabbitMQ y otros servicios.

### 4️⃣ Levantar servicios de infraestructura (MongoDB, Redis, RabbitMQ)
```bash
docker-compose up -d
```

### 5️⃣ Ejecutar migraciones de base de datos
```bash
npm run prisma:migrate
```

### 6️⃣ Iniciar todos los microservicios en modo desarrollo
```bash
npm run start:dev
```

### 7️⃣ Iniciar un microservicio específico
```bash
npx nx serve auth-app
```

---

## 🏗 Configuración de Infraestructura (Pulumi, Kubernetes)

Bookly usa **Pulumi** para definir su infraestructura en la nube como código. Se requieren los siguientes servicios:

✅ **MongoDB Atlas** - Base de datos principal  
✅ **Redis (Cluster Gestionado)** - Caché y almacén de sesiones  
✅ **RabbitMQ** - Mensajería entre microservicios  
✅ **API Gateway** - Enrutamiento y seguridad  
✅ **Kubernetes (EKS/GKE/AKS)** - Orquestación de contenedores  

### 🚀 Desplegar Infraestructura con Pulumi

1. Configura tus credenciales del proveedor de nube:
```bash
aws configure  # Para AWS
gcloud auth login  # Para GCP
az login  # Para Azure
```

2. Navega al directorio de infraestructura:
```bash
cd infraestructure/pulumi
```

3. Inicializa y despliega la infraestructura:
```bash
pulumi stack init dev
pulumi up
```

---

## 🚀 Despliegue en Producción (Docker + Kubernetes + CI/CD)

Bookly utiliza contenedores Docker y Kubernetes para el despliegue en producción, con CI/CD automatizado a través de GitHub Actions.

### 1️⃣ Construir imágenes Docker localmente
```bash
npm run build:docker
```

### 2️⃣ Generar imágenes de Docker para microservicios específicos
```bash
docker build -t bookly/auth-service ./apps/auth-app
docker build -t bookly/resources-service ./apps/resources-app
docker build -t bookly/availability-service ./apps/availability-app
```

### 3️⃣ Desplegar en Kubernetes
```bash
kubectl apply -f infraestructure/k8s/
```

### 4️⃣ Verificar el despliegue
```bash
kubectl get pods
kubectl get services
```

---

## 📜 Documentación de la API (Swagger + AsyncAPI)

Cada microservicio expone su propia documentación de API utilizando Swagger para endpoints REST y AsyncAPI para eventos:

📌 **Auth Service API** → `http://localhost:3001/api`  
📌 **Resources Service API** → `http://localhost:3002/api`  
📌 **Availability Service API** → `http://localhost:3003/api`  
📌 **Stockpile Service API** → `http://localhost:3004/api`  
📌 **Reports Service API** → `http://localhost:3005/api`  
📌 **Notifications Service API** → `http://localhost:3006/api`  
📌 **API Gateway (Agregada)** → `http://localhost:3000/api`  

📡 **Documentación de Eventos (AsyncAPI)** → `http://localhost:3000/asyncapi`  

### Ejemplos de consulta a las APIs:

```bash
# Autenticación de usuario
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@example.com", "password": "contraseña"}'

# Obtener recursos disponibles
curl -X GET "http://localhost:3002/api/resources" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"

# Crear una reserva
curl -X POST "http://localhost:3003/api/reservations" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"resourceId": "123", "startTime": "2023-08-01T10:00:00Z", "endTime": "2023-08-01T12:00:00Z"}'
```

---

## 🔄 Flujo de trabajo para desarrollo

1. **Seleccionar una tarea o issue** del tablero de proyecto
2. **Crear una rama** para la funcionalidad o corrección
   ```bash
   git checkout -b feature/nombre-funcionalidad
   ```
3. **Implementar cambios** siguiendo las guías de estilo
4. **Ejecutar pruebas** para validar funcionalidad
   ```bash
   npm run test
   ```
5. **Generar la documentación** si es necesario
   ```bash
   npm run docs:generate
   ```
6. **Crear un Pull Request** para revisión de código

---

## 🤝 Contribuciones

Bookly sigue el flujo **GitHub Flow** para contribuciones.  
1️⃣ **Haz un fork** del repositorio.  
2️⃣ **Crea una rama** para tu funcionalidad:
```bash
git checkout -b feature/nueva-funcionalidad
```
3️⃣ **Haz commits claros** siguiendo el estándar:
```bash
git commit -m "✨ Agrega funcionalidad de reservas periódicas"
```
4️⃣ **Sube los cambios** a tu fork:
```bash
git push origin feature/nueva-funcionalidad
```
5️⃣ **Abre un Pull Request** en GitHub.  

¡Toda contribución es bienvenida! 🎉

---

## 📄 Licencia

Este proyecto está bajo la licencia **Apache 2.0**. Consulta el archivo [`LICENSE`](LICENSE) para más información.
