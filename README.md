# 📌 Bookly - Sistema de Gestión de Reservas para Instituciones Académicas 🏫

## 📖 Descripción

Bookly es una plataforma diseñada para la **gestión eficiente de reservas de espacios institucionales** en universidades, asegurando disponibilidad en tiempo real, control de accesos, reportes detallados y trazabilidad de uso.  
Utiliza una arquitectura **basada en microservicios y eventos** para garantizar escalabilidad y modularidad.

---

## 🚀 Características Principales

✅ **Gestión de recursos** (salones, auditorios, laboratorios, equipos)  
✅ **Disponibilidad en tiempo real** con sincronización de calendarios  
✅ **Aprobaciones y trazabilidad de reservas** según roles de usuario  
✅ **Reportes y análisis de ocupación de espacios**  
✅ **Autenticación segura con OAuth2, JWT y 2FA**  
✅ **Notificaciones en tiempo real vía WebSockets, Email y WhatsApp**  
✅ **Despliegue escalable en Kubernetes con Pulumi**  

---

## 🏗 Arquitectura y Tecnologías

Bookly sigue una **Arquitectura Hexagonal**, aplicando **CQRS y Event-Driven Architecture (EDA)** con NestJS y NX.

📂 **Monorepo con NX** - Organización modular para microservicios  
📌 **NestJS + TypeScript** - Backend escalable y modular  
📊 **MongoDB + Prisma ORM** - Base de datos NoSQL para reservas  
⚡ **Redis (Cluster Gestionado) + RabbitMQ** - Mensajería y Pub/Sub  
🌎 **i18n** - Soporte de múltiples idiomas  
📝 **Swagger + AsyncAPI** - Documentación API y eventos  
📡 **WebSockets** - Notificaciones en tiempo real  
🚀 **Kubernetes (EKS/GKE/AKS) + Pulumi** - Infraestructura en la nube  
🔍 **OpenTelemetry + Sentry** - Monitoreo y trazabilidad  
✅ **SonarQube + GitHub Actions** - Análisis de código y CI/CD  

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
│   ├── **notifications-app/** → Notificaciones y comunicacion con usuarios  
│   ├── **gateway/** → Balanceo de carga y seguridad  
│  
├── **libs/** *(Librerías compartidas entre microservicios)*
│   ├── **common/** → Middlewares, interceptores, utilidades  
│   ├── **dto/** → Data Transfer Objects (DTOs)  
│   ├── **event-bus/** → Implementación de eventos RabbitMQ  
│   ├── **monitoring/** → OpenTelemetry y Sentry  
│   ├── **ui-atomic/** → UI en Atomic Design reusable en varias apps
│  
├── **infrastructure/** *(Infraestructura como Código - IaC)*  
│   ├── **pulumi/** → Configuración de despliegue en la nube  
│   ├── **k8s/** → Archivos YAML para Kubernetes  
│  
├── **tests/** *(Pruebas automatizadas con Jest - BDD)*  
├── **scripts/** *(Automatización de despliegue con GitHub Actions)*  
```

---

## 🛠 Instalación y Configuración

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
Edita el archivo `.env` con las credenciales de MongoDB, Redis y otros servicios.

### 4️⃣ Levantar servicios en modo desarrollo
```bash
npm run start:dev
```

---

## 🏗 Configuración de Infraestructura (Pulumi, Kubernetes)

Bookly usa **Pulumi** para definir su infraestructura en la nube. Se requieren los siguientes servicios:

✅ **MongoDB Atlas** - Base de datos principal  
✅ **Redis (Cluster Gestionado)** - Caché y Pub/Sub  
✅ **RabbitMQ** - Mensajería entre microservicios  
✅ **Google API Gateway** - Balanceo de carga  
✅ **Kubernetes (EKS/GKE/AKS)** - Orquestación de contenedores  

### 🚀 Desplegar Infraestructura con Pulumi
```bash
pulumi up
```

---

## 🚀 Despliegue en Producción (Docker + Kubernetes + CI/CD)

Bookly se puede desplegar en **Kubernetes** con **Pulumi + GitHub Actions**.

### 1️⃣ Construir y ejecutar con Docker (Modo local)
```bash
docker-compose up --build
```

### 2️⃣ Generar imágenes de Docker para producción
```bash
docker build -t bookly/auth-service ./apps/auth-service
docker build -t bookly/resources-service ./apps/resources-service
...
```

### 3️⃣ Desplegar en Kubernetes
```bash
kubectl apply -f infrastructure/k8s/
```

---

## 📜 Documentación de la API (Swagger + AsyncAPI)

📌 **Swagger REST API** → `http://localhost:3000/api`  
📌 **Documentación de Eventos (AsyncAPI)** → `http://localhost:3000/asyncapi`  

Ejemplo de consulta a la API:
```bash
curl -X GET "http://localhost:3000/resources" -H "accept: application/json"
```

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

