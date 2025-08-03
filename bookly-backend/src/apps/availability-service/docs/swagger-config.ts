import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Swagger Configuration for Availability Service (RF-07, RF-08, RF-10, RF-11)
 * Complete API documentation for availability and reservation management
 */
export function setupAvailabilitySwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Bookly Availability Service API')
    .setDescription(`
      ## Availability Service - Sistema de Gestión de Disponibilidad y Reservas
      
      Este servicio maneja la gestión completa de disponibilidad de recursos y reservas en el sistema Bookly.
      
      ### Funcionalidades Principales (Hito 2):
      
      #### RF-07: Definición de Horarios
      - ✅ Creación de horarios básicos y complejos
      - ✅ Reglas de recurrencia y restricciones institucionales
      - ✅ Validación de conflictos y solapamientos
      - ✅ Horarios de mantenimiento y excepciones
      
      #### RF-08: Integración con Calendarios
      - 🔄 Sincronización con Google Calendar, Outlook, iCal
      - 🔄 Importación y exportación de eventos
      - 🔄 Calendario interno del sistema
      
      #### RF-10: Visualización en Calendario
      - ✅ Vista de calendario para recursos
      - ✅ Disponibilidad en tiempo real
      - ✅ Filtros por fecha, recurso y tipo
      
      #### RF-11: Registro de Historial
      - ✅ Auditoría completa de reservas
      - ✅ Exportación de historiales
      - ✅ Trazabilidad de cambios
      
      ### Arquitectura:
      - **CQRS**: Separación de comandos y consultas
      - **Event-Driven**: Eventos distribuidos vía RabbitMQ
      - **Clean Architecture**: Separación de capas
      - **BDD Testing**: Pruebas con patrón Given-When-Then
      
      ### Eventos Distribuidos:
      Ver documentación AsyncAPI para eventos publicados por este servicio.
    `)
    .setVersion('1.0.0')
    .setContact(
      'Bookly Development Team',
      'https://bookly.ufps.edu.co',
      'dev@bookly.ufps.edu.co'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Desarrollo Local')
    .addServer('https://api.bookly.ufps.edu.co', 'Producción')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT para autenticación',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('Availability', 'Gestión de disponibilidad básica (RF-07)')
    .addTag('Schedules', 'Gestión de horarios complejos (RF-07)')
    .addTag('Reservations', 'Gestión de reservas (RF-07)')
    .addTag('Calendar', 'Integración con calendarios (RF-08)')
    .addTag('Calendar View', 'Visualización en calendario (RF-10)')
    .addTag('History', 'Historial y auditoría (RF-11)')
    .addTag('Events', 'Eventos distribuidos (AsyncAPI)')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [], // Incluir todos los módulos
    deepScanRoutes: true,
    operationIdFactory: (controllerKey: string, methodKey: string) => 
      `${controllerKey}_${methodKey}`,
  });

  // Agregar ejemplos adicionales para mejor documentación
  addSwaggerExamples(document);

  SwaggerModule.setup('api/docs/availability', app, document, {
    explorer: true,
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
    customSiteTitle: 'Bookly Availability API',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });

  return document;
}

/**
 * Agregar ejemplos adicionales para mejorar la documentación
 */
function addSwaggerExamples(document: any) {
  // Ejemplo para CreateScheduleDto
  if (document.components?.schemas?.CreateScheduleDto) {
    document.components.schemas.CreateScheduleDto.example = {
      resourceId: "classroom-a101",
      name: "Horario Regular Aula A101",
      type: "REGULAR",
      startDate: "2024-01-15T08:00:00Z",
      endDate: "2024-12-15T18:00:00Z",
      recurrenceRule: {
        frequency: "WEEKLY",
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: "08:00",
        endTime: "18:00"
      },
      restrictions: {
        minAdvanceHours: 24,
        maxDurationHours: 4,
        allowedUserTypes: ["PROFESSOR", "ADMIN"]
      },
      isActive: true
    };
  }

  // Ejemplo para CreateReservationDto
  if (document.components?.schemas?.CreateReservationDto) {
    document.components.schemas.CreateReservationDto.example = {
      title: "Clase de Matemáticas Avanzadas",
      description: "Sesión de repaso para examen final",
      startDate: "2024-01-16T10:00:00Z",
      endDate: "2024-01-16T12:00:00Z",
      resourceId: "classroom-a101",
      userId: "prof-martinez-123",
      isRecurring: false,
      recurrence: null
    };
  }

  // Ejemplo para respuesta de disponibilidad
  document.components.schemas.AvailabilityResponse = {
    type: "object",
    properties: {
      resourceId: { type: "string", example: "classroom-a101" },
      availableSlots: {
        type: "array",
        items: {
          type: "object",
          properties: {
            date: { type: "string", format: "date", example: "2024-01-16" },
            timeSlots: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  startTime: { type: "string", example: "08:00" },
                  endTime: { type: "string", example: "12:00" },
                  available: { type: "boolean", example: true },
                  restrictions: {
                    type: "object",
                    properties: {
                      minAdvanceHours: { type: "number", example: 24 },
                      allowedUserTypes: {
                        type: "array",
                        items: { type: "string" },
                        example: ["PROFESSOR", "ADMIN"]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  return document;
}

/**
 * Configuración para integrar con API Gateway
 */
export const availabilityServiceApiConfig = {
  title: 'Availability Service',
  description: 'Gestión de disponibilidad y reservas',
  version: '1.0.0',
  path: '/availability',
  asyncApiPath: '/docs/asyncapi/availability.yaml',
  swaggerPath: '/api/docs/availability',
  tags: ['availability', 'schedules', 'reservations', 'calendar'],
  events: [
    'ScheduleCreated',
    'ScheduleUpdated', 
    'ScheduleDeleted',
    'ReservationCreated',
    'ReservationUpdated',
    'ReservationCancelled',
    'AvailabilityChanged'
  ]
};
