import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as request from 'supertest';
import { ResourcesModule } from '../resources.module';
import { CreateResourceDto, UpdateResourceDto } from '../../../libs/dto/resources';
import { PrismaService } from '../../../libs/common/services/prisma.service';

/**
 * Resources E2E Tests
 * BDD Tests for Hito 1: Gestión de Recursos Core
 * Tests RF-01, RF-03, RF-05 implementation
 */
describe('Resources E2E (Hito 1)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ResourcesModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    commandBus = moduleFixture.get<CommandBus>(CommandBus);
    queryBus = moduleFixture.get<QueryBus>(QueryBus);
    
    await app.init();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.resource.deleteMany({});
    await app.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await prisma.resource.deleteMany({});
  });

  /**
   * RF-01: Create Resource
   * BDD Scenario: Create a new resource with valid data
   */
  describe('RF-01: Create Resource', () => {
    it('should create a new resource with auto-generated code', async () => {
      // Given: Valid resource data
      const createResourceDto: CreateResourceDto = {
        name: 'Sala de Conferencias A1',
        type: 'ROOM',
        capacity: 50,
        location: 'Edificio A, Piso 2',
        description: 'Sala de conferencias con proyector y sistema de audio',
        programId: 'PROG-001',
        attributes: {
          hasProjector: true,
          hasAudioSystem: true,
          hasWhiteboard: true,
        },
        availableSchedules: {
          operatingHours: [
            { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
            { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
          ],
          restrictions: {
            userTypes: ['TEACHER', 'ADMIN'],
            maxReservationDuration: 240, // 4 hours
            minReservationDuration: 60,  // 1 hour
            minAdvanceReservation: 1,    // 1 hour
          },
          priorities: [
            { userType: 'ADMIN', priority: 10 },
            { userType: 'TEACHER', priority: 5 },
          ],
        },
      };

      // When: Creating the resource
      const response = await request(app.getHttpServer())
        .post('/resources')
        .send(createResourceDto)
        .expect(201);

      // Then: Resource should be created successfully
      expect(response.body).toMatchObject({
        name: createResourceDto.name,
        type: createResourceDto.type,
        capacity: createResourceDto.capacity,
        location: createResourceDto.location,
        status: 'AVAILABLE',
        isActive: true,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.code).toBeDefined();
      expect(response.body.code).toMatch(/^ROOM-\d{8}-\d{6}-\d{3}$/);
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should reject resource creation with invalid data', async () => {
      // Given: Invalid resource data (missing required fields)
      const invalidDto = {
        // Missing name and type
        capacity: 50,
      };

      // When: Attempting to create the resource
      // Then: Should return validation error
      await request(app.getHttpServer())
        .post('/resources')
        .send(invalidDto)
        .expect(400);
    });
  });

  /**
   * RF-01: Update Resource
   * BDD Scenario: Update an existing resource
   */
  describe('RF-01: Update Resource', () => {
    let createdResourceId: string;

    beforeEach(async () => {
      // Given: An existing resource
      const createDto: CreateResourceDto = {
        name: 'Test Resource',
        type: 'ROOM',
        capacity: 30,
        location: 'Test Location',
        programId: 'PROG-001',
      };

      const response = await request(app.getHttpServer())
        .post('/resources')
        .send(createDto)
        .expect(201);

      createdResourceId = response.body.id;
    });

    it('should update resource successfully', async () => {
      // Given: Valid update data
      const updateDto: UpdateResourceDto = {
        name: 'Updated Test Resource',
        capacity: 25,
        status: 'ACTIVE',
        updatedBy: 'test-user-id',
      };

      // When: Updating the resource
      const response = await request(app.getHttpServer())
        .put(`/resources/${createdResourceId}`)
        .send(updateDto)
        .expect(200);

      // Then: Resource should be updated
      expect(response.body).toMatchObject({
        id: createdResourceId,
        name: updateDto.name,
        capacity: updateDto.capacity,
        status: updateDto.status,
        type: 'ROOM', // Should remain unchanged
      });
    });

    it('should return 404 for non-existent resource', async () => {
      // Given: Non-existent resource ID
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateDto: UpdateResourceDto = {
        name: 'Updated Name',
        updatedBy: 'test-user-id',
      };

      // When: Attempting to update non-existent resource
      // Then: Should return 404
      await request(app.getHttpServer())
        .put(`/resources/${nonExistentId}`)
        .send(updateDto)
        .expect(404);
    });
  });

  /**
   * RF-01: Delete Resource
   * BDD Scenario: Delete a resource (soft delete when has relations)
   */
  describe('RF-01: Delete Resource', () => {
    let createdResourceId: string;

    beforeEach(async () => {
      // Given: An existing resource
      const createDto: CreateResourceDto = {
        name: 'Resource to Delete',
        type: 'EQUIPMENT',
        capacity: 1,
        programId: 'PROG-001',
      };

      const response = await request(app.getHttpServer())
        .post('/resources')
        .send(createDto)
        .expect(201);

      createdResourceId = response.body.id;
    });

    it('should delete resource successfully (hard delete when no relations)', async () => {
      // When: Deleting the resource
      await request(app.getHttpServer())
        .delete(`/resources/${createdResourceId}`)
        .expect(204);

      // Then: Resource should no longer exist
      await request(app.getHttpServer())
        .get(`/resources/${createdResourceId}`)
        .expect(404);
    });

    it('should return 404 for non-existent resource', async () => {
      // Given: Non-existent resource ID
      const nonExistentId = '507f1f77bcf86cd799439011';

      // When: Attempting to delete non-existent resource
      // Then: Should return 404
      await request(app.getHttpServer())
        .delete(`/resources/${nonExistentId}`)
        .expect(404);
    });
  });

  /**
   * RF-03: Get Resource by ID and Code
   * BDD Scenario: Retrieve resource information
   */
  describe('RF-03: Get Resource Information', () => {
    let createdResource: any;

    beforeEach(async () => {
      // Given: An existing resource
      const createDto: CreateResourceDto = {
        name: 'Test Retrieval Resource',
        type: 'AUDITORIUM',
        capacity: 200,
        location: 'Main Building',
        programId: 'PROG-001',
      };

      const response = await request(app.getHttpServer())
        .post('/resources')
        .send(createDto)
        .expect(201);

      createdResource = response.body;
    });

    it('should retrieve resource by ID', async () => {
      // When: Getting resource by ID
      const response = await request(app.getHttpServer())
        .get(`/resources/${createdResource.id}`)
        .expect(200);

      // Then: Should return the correct resource
      expect(response.body).toMatchObject({
        id: createdResource.id,
        name: createdResource.name,
        code: createdResource.code,
        type: createdResource.type,
      });
    });

    it('should retrieve resource by code', async () => {
      // When: Getting resource by code
      const response = await request(app.getHttpServer())
        .get(`/resources/code/${createdResource.code}`)
        .expect(200);

      // Then: Should return the correct resource
      expect(response.body).toMatchObject({
        id: createdResource.id,
        name: createdResource.name,
        code: createdResource.code,
        type: createdResource.type,
      });
    });

    it('should return 404 for non-existent resource ID', async () => {
      // Given: Non-existent resource ID
      const nonExistentId = '507f1f77bcf86cd799439011';

      // When: Getting non-existent resource
      // Then: Should return 404
      await request(app.getHttpServer())
        .get(`/resources/${nonExistentId}`)
        .expect(404);
    });
  });

  /**
   * RF-05: Check Resource Availability
   * BDD Scenario: Check if resource is available for reservation
   */
  describe('RF-05: Resource Availability Rules', () => {
    let resourceWithSchedules: any;

    beforeEach(async () => {
      // Given: A resource with availability schedules
      const createDto: CreateResourceDto = {
        name: 'Available Resource',
        type: 'ROOM',
        capacity: 25,
        programId: 'PROG-001',
        availableSchedules: {
          operatingHours: [
            {
              dayOfWeek: 1, // Monday
              startTime: '09:00',
              endTime: '17:00',
            },
          ],
          restrictions: {
            userTypes: ['TEACHER'],
            maxReservationDuration: 120,
            minReservationDuration: 30,
            minAdvanceReservation: 2,
          },
          priorities: [
            { userType: 'TEACHER', priority: 8 },
          ],
        },
      };

      const response = await request(app.getHttpServer())
        .post('/resources')
        .send(createDto)
        .expect(201);

      resourceWithSchedules = response.body;
    });

    it('should return available when resource meets all criteria', async () => {
      // Given: A valid request within operating hours and restrictions
      const futureMonday = new Date();
      futureMonday.setDate(futureMonday.getDate() + ((1 + 7 - futureMonday.getDay()) % 7) + 7); // Next Monday
      futureMonday.setHours(10, 0, 0, 0); // 10:00 AM

      // When: Checking availability
      const response = await request(app.getHttpServer())
        .get(`/resources/${resourceWithSchedules.id}/availability`)
        .query({
          date: futureMonday.toISOString(),
          userType: 'PROFESSOR',
          duration: 120, // 2 hours
        })
        .expect(200);

      // Then: Should be available
      expect(response.body).toMatchObject({
        available: true,
        priority: 5,
      });
    });

    it('should return unavailable when outside operating hours', async () => {
      // Given: A request outside operating hours
      const futureMonday = new Date();
      futureMonday.setDate(futureMonday.getDate() + ((1 + 7 - futureMonday.getDay()) % 7) + 7); // Next Monday
      futureMonday.setHours(20, 0, 0, 0); // 8:00 PM (outside 9-17 range)

      // When: Checking availability
      const response = await request(app.getHttpServer())
        .get(`/resources/${resourceWithSchedules.id}/availability`)
        .query({
          date: futureMonday.toISOString(),
          userType: 'PROFESSOR',
          duration: 60,
        })
        .expect(200);

      // Then: Should not be available
      expect(response.body).toMatchObject({
        available: false,
        reason: expect.stringContaining('not available at this time'),
      });
    });

    it('should return unavailable for unauthorized user type', async () => {
      // Given: A request from unauthorized user type
      const futureMonday = new Date();
      futureMonday.setDate(futureMonday.getDate() + ((1 + 7 - futureMonday.getDay()) % 7) + 7); // Next Monday
      futureMonday.setHours(10, 0, 0, 0); // 10:00 AM

      // When: Checking availability
      const response = await request(app.getHttpServer())
        .get(`/resources/${resourceWithSchedules.id}/availability`)
        .query({
          date: futureMonday.toISOString(),
          userType: 'STUDENT', // Not in allowed user types
          duration: 60,
        })
        .expect(200);

      // Then: Should not be available
      expect(response.body).toMatchObject({
        available: false,
        reason: expect.stringContaining('User type not allowed'),
      });
    });
  });

  /**
   * Additional BDD Scenarios: Resource Filtering and Search
   */
  describe('Resource Filtering and Search', () => {
    beforeEach(async () => {
      // Given: Multiple resources with different types and statuses
      const resources = [
        { name: 'Conference Room A', type: 'ROOM', status: 'AVAILABLE', capacity: 50 },
        { name: 'Lab Equipment X', type: 'EQUIPMENT', status: 'MAINTENANCE', capacity: 1 },
        { name: 'Main Auditorium', type: 'AUDITORIUM', status: 'AVAILABLE', capacity: 300 },
      ];

      for (const resource of resources) {
        await request(app.getHttpServer())
          .post('/resources')
          .send(resource)
          .expect(201);
      }
    });

    it('should filter resources by type', async () => {
      // When: Getting resources filtered by type
      const response = await request(app.getHttpServer())
        .get('/resources')
        .query({ type: 'ROOM' })
        .expect(200);

      // Then: Should return only ROOM type resources
      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe('ROOM');
    });

    it('should search resources by name', async () => {
      // When: Searching resources by name
      const response = await request(app.getHttpServer())
        .get('/resources/search')
        .query({ q: 'Conference' })
        .expect(200);

      // Then: Should return matching resources
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toContain('Conference');
    });

    it('should return paginated results', async () => {
      // When: Getting paginated resources
      const response = await request(app.getHttpServer())
        .get('/resources/paginated')
        .query({ page: 1, limit: 2 })
        .expect(200);

      // Then: Should return paginated structure
      expect(response.body).toMatchObject({
        resources: expect.any(Array),
        total: 3,
        page: 1,
        limit: 2,
        totalPages: 2,
      });
      expect(response.body.resources).toHaveLength(2);
    });
  });
});
