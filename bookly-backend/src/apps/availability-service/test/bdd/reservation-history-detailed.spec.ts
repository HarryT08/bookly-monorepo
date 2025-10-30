import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AvailabilityController } from '../../infrastructure/controllers/availability.controller';
import { CreateReservationHistoryCommand } from '../../application/commands/create-reservation-history.command';
import { GetReservationHistoryDetailedQuery } from '../../application/queries/get-reservation-history-detailed.query';
import { 
  HistoryAction, 
  HistorySource,
  CreateReservationHistoryDto,
  ReservationHistoryDetailedQueryDto 
} from '../../../../libs/dto/availability/reservation-history-detailed.dto';
import { PrismaReservationHistoryRepository } from '../../infrastructure/repositories/prisma-reservation-history.repository';

/**
 * BDD Tests for RF-11: Detailed Reservation History
 * Tests comprehensive audit trail functionality using Given-When-Then pattern
 */
describe('RF-11: Detailed Reservation History Management (BDD)', () => {
  let controller: AvailabilityController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;
  let reservationHistoryRepository: jest.Mocked<PrismaReservationHistoryRepository>;

  beforeEach(async () => {
    const mockCommandBus = {
      execute: jest.fn()
    };

    const mockQueryBus = {
      execute: jest.fn()
    };

    const mockReservationHistoryRepository = {
      create: jest.fn(),
      findByReservationId: jest.fn(),
      findByUserId: jest.fn(),
      countByFilters: jest.fn(),
      findByFilters: jest.fn(),
      exportToCsv: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
        { provide: 'ReservationHistoryRepository', useValue: mockReservationHistoryRepository },
        { provide: PrismaReservationHistoryRepository, useValue: mockReservationHistoryRepository }
      ]
    }).compile();

    controller = module.get<AvailabilityController>(AvailabilityController);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
    reservationHistoryRepository = module.get('ReservationHistoryRepository');
  });

  describe('Scenario: Create Reservation History Entry', () => {
    it('should create history entry for reservation creation', async () => {
      // Given: A new reservation is created
      const createHistoryDto: CreateReservationHistoryDto = {
        reservationId: 'reservation-123',
        userId: 'user-456',
        action: HistoryAction.CREATED,
        source: HistorySource.USER,
        newData: {
          title: 'Team Meeting',
          startDate: '2024-02-15T10:00:00Z',
          endDate: '2024-02-15T11:00:00Z',
          resourceId: 'room-a101'
        },
        details: 'New reservation created by user',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      };

      const expectedHistoryEntry = {
        id: 'history-789',
        reservationId: 'reservation-123',
        userId: 'user-456',
        action: HistoryAction.CREATED,
        source: HistorySource.USER,
        createdAt: new Date()
      };

      commandBus.execute.mockResolvedValue(expectedHistoryEntry);

      // When: Creating a history entry
      const mockUser = { id: 'user-123' } as any;
      const result = await controller.createReservationHistory(createHistoryDto, mockUser);

      // Then: History entry should be created successfully
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateReservationHistoryCommand)
      );
      expect(result).toEqual(expectedHistoryEntry);
    });

    it('should create history entry for reservation modification', async () => {
      // Given: A reservation is being modified
      const createHistoryDto: CreateReservationHistoryDto = {
        reservationId: 'reservation-123',
        userId: 'user-456',
        action: HistoryAction.UPDATED,
        source: HistorySource.USER,
        previousData: {
          title: 'Old Meeting',
          startDate: '2024-02-15T10:00:00Z'
        },
        newData: {
          title: 'Updated Meeting',
          startDate: '2024-02-15T11:00:00Z'
        },
        details: 'Meeting time changed due to conflict'
      };

      const expectedHistoryEntry = {
        id: 'history-790',
        action: HistoryAction.UPDATED,
        createdAt: new Date()
      };

      commandBus.execute.mockResolvedValue(expectedHistoryEntry);

      // When: Creating a modification history entry
      const mockUser = { id: 'user-123' } as any;
      const result = await controller.createReservationHistory(createHistoryDto, mockUser);

      // Then: History entry should capture the changes
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          action: HistoryAction.UPDATED,
          previousData: expect.objectContaining({ title: 'Old Meeting' }),
          newData: expect.objectContaining({ title: 'Updated Meeting' })
        })
      );
      expect(result).toEqual(expectedHistoryEntry);
    });
  });

  describe('Scenario: Query Detailed History with Advanced Filters', () => {
    it('should retrieve history with pagination and user filter', async () => {
      // Given: Multiple history entries exist for different users
      const queryDto: ReservationHistoryDetailedQueryDto = {
        userId: 'user-456',
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        includeReservationData: true,
        includeUserData: true
      };

      const expectedResponse = {
        entries: [
          {
            id: 'history-789',
            reservationId: 'reservation-123',
            userId: 'user-456',
            action: HistoryAction.CREATED,
            source: HistorySource.USER,
            createdAt: new Date(),
            reservation: {
              id: 'reservation-123',
              title: 'Team Meeting',
              resourceId: 'room-a101'
            },
            user: {
              id: 'user-456',
              name: 'John Doe',
              email: 'john@example.com'
            }
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        },
        summary: {
          totalEntries: 1,
          actionCounts: { [HistoryAction.CREATED]: 1 },
          sourceCounts: { [HistorySource.USER]: 1 },
          uniqueUsers: 1,
          uniqueReservations: 1
        }
      };

      queryBus.execute.mockResolvedValue(expectedResponse);

      // When: Querying detailed history with filters
      const result = await controller.getDetailedReservationHistory(queryDto);

      // Then: Should return filtered and paginated results
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetReservationHistoryDetailedQuery)
      );
      expect(result.data.entries).toHaveLength(1);
      expect(result.data.entries[0].userId).toBe('user-456');
      expect(result.data.entries[0].reservation).toBeDefined();
      expect(result.data.entries[0].user).toBeDefined();
      expect(result.data.pagination.total).toBe(1);
    });

    it('should filter history by action types', async () => {
      // Given: History entries with different actions exist
      const queryDto: ReservationHistoryDetailedQueryDto = {
        actions: [HistoryAction.CREATED, HistoryAction.UPDATED],
        startDate: '2024-02-01T00:00:00Z',
        endDate: '2024-02-28T23:59:59Z',
        page: 1,
        limit: 20
      };

      const expectedResponse = {
        entries: [
          {
            id: 'history-789',
            action: HistoryAction.CREATED,
            createdAt: new Date('2024-02-15T10:00:00Z')
          },
          {
            id: 'history-790',
            action: HistoryAction.UPDATED,
            createdAt: new Date('2024-02-16T14:30:00Z')
          }
        ],
        pagination: { page: 1, limit: 20, total: 2 },
        summary: {
          actionCounts: {
            [HistoryAction.CREATED]: 1,
            [HistoryAction.UPDATED]: 1
          }
        }
      };

      queryBus.execute.mockResolvedValue(expectedResponse);

      // When: Filtering by specific actions
      const result = await controller.getDetailedReservationHistory(queryDto);

      // Then: Should return only entries with specified actions
      expect(result.data.entries).toHaveLength(2);
      expect(result.data.entries.every(entry => 
        [HistoryAction.CREATED, HistoryAction.UPDATED].includes(entry.action)
      )).toBe(true);
      expect(result.data.summary.actionCounts[HistoryAction.CREATED]).toBe(1);
      expect(result.data.summary.actionCounts[HistoryAction.UPDATED]).toBe(1);
    });

    it('should filter history by source types', async () => {
      // Given: History entries from different sources exist
      const queryDto: ReservationHistoryDetailedQueryDto = {
        sources: [HistorySource.ADMIN, HistorySource.SYSTEM],
        resourceId: 'room-a101',
        page: 1,
        limit: 15
      };

      const expectedResponse = {
        entries: [
          {
            id: 'history-791',
            source: HistorySource.ADMIN,
            action: HistoryAction.CANCELLED,
            details: 'Cancelled by administrator due to maintenance'
          },
          {
            id: 'history-792',
            source: HistorySource.SYSTEM,
            action: HistoryAction.NO_SHOW,
            details: 'Automatic no-show detection'
          }
        ],
        pagination: { page: 1, limit: 15, total: 2 },
        summary: {
          sourceCounts: {
            [HistorySource.ADMIN]: 1,
            [HistorySource.SYSTEM]: 1
          }
        }
      };

      queryBus.execute.mockResolvedValue(expectedResponse);

      // When: Filtering by source types
      const result = await controller.getDetailedReservationHistory(queryDto);

      // Then: Should return only entries from specified sources
      expect(result.data.entries).toHaveLength(2);
      expect(result.data.entries.every(entry => 
        [HistorySource.ADMIN, HistorySource.SYSTEM].includes(entry.source)
      )).toBe(true);
      expect(result.data.summary.sourceCounts[HistorySource.ADMIN]).toBe(1);
      expect(result.data.summary.sourceCounts[HistorySource.SYSTEM]).toBe(1);
    });
  });

  describe('Scenario: Export History to CSV', () => {
    it('should export filtered history data to CSV format', async () => {
      // Given: History data exists for a specific date range
      const filters = {
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        userId: 'user-456'
      };

      const expectedCsvContent = `"ID","Reservation ID","Reservation Title","Resource Name","User Email","Action","Previous Data","New Data","Reason","IP Address","User Agent","Created At"
"history-789","reservation-123","Team Meeting","Room A101","john@example.com","CREATED","","{\\"title\\":\\"Team Meeting\\"}","New reservation","192.168.1.100","Mozilla/5.0","2024-02-15T10:00:00.000Z"
"history-790","reservation-124","Project Review","Room B202","jane@example.com","UPDATED","{\\"title\\":\\"Old Review\\"}","{\\"title\\":\\"Project Review\\"}","Title updated","192.168.1.101","Chrome/120.0","2024-02-16T14:30:00.000Z"`;

      reservationHistoryRepository.exportToCsv.mockResolvedValue(expectedCsvContent);

      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn()
      };

      // When: Exporting history to CSV
      await controller.exportReservationHistory(
        undefined, // reservationId
        'user-456', // userId
        undefined, // resourceId
        '2024-02-01', // startDate
        '2024-02-28', // endDate
        mockRes
      );

      // Then: Should generate CSV with proper headers and content
      expect(reservationHistoryRepository.exportToCsv).toHaveBeenCalledWith({
        reservationId: undefined,
        userId: 'user-456',
        resourceId: undefined,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-28')
      });
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition', 
        expect.stringContaining('attachment; filename="reservation-history-')
      );
      expect(mockRes.send).toHaveBeenCalledWith(expectedCsvContent);
    });
  });

  describe('Scenario: Analytics and Summary Statistics', () => {
    it('should provide comprehensive summary statistics', async () => {
      // Given: Multiple history entries with various actions and sources
      const queryDto: ReservationHistoryDetailedQueryDto = {
        startDate: '2024-02-01T00:00:00Z',
        endDate: '2024-02-28T23:59:59Z',
        page: 1,
        limit: 50
      };

      const expectedResponse = {
        entries: [], // Not testing entries here, focusing on summary
        pagination: { page: 1, limit: 50, total: 25 },
        summary: {
          totalEntries: 25,
          actionCounts: {
            [HistoryAction.CREATED]: 10,
            [HistoryAction.UPDATED]: 8,
            [HistoryAction.CANCELLED]: 4,
            [HistoryAction.CONFIRMED]: 2,
            [HistoryAction.NO_SHOW]: 1
          },
          sourceCounts: {
            [HistorySource.USER]: 18,
            [HistorySource.ADMIN]: 4,
            [HistorySource.SYSTEM]: 2,
            [HistorySource.API]: 1
          },
          uniqueUsers: 12,
          uniqueReservations: 20,
          dateRange: {
            earliest: new Date('2024-02-01T09:00:00Z'),
            latest: new Date('2024-02-28T17:30:00Z')
          }
        }
      };

      queryBus.execute.mockResolvedValue(expectedResponse);

      // When: Requesting history with analytics
      const result = await controller.getDetailedReservationHistory(queryDto);

      // Then: Should provide comprehensive statistics
      expect(result.data.summary.totalEntries).toBe(25);
      expect(result.data.summary.actionCounts[HistoryAction.CREATED]).toBe(10);
      expect(result.data.summary.sourceCounts[HistorySource.USER]).toBe(18);
      expect(result.data.summary.uniqueUsers).toBe(12);
      expect(result.data.summary.uniqueReservations).toBe(20);
      expect(result.data.summary.dateRange.earliest).toBeDefined();
      expect(result.data.summary.dateRange.latest).toBeDefined();
    });
  });

  describe('Scenario: Error Handling', () => {
    it('should handle missing required parameters', async () => {
      // Given: Invalid history creation data
      const invalidDto = {} as CreateReservationHistoryDto;

      // When: Attempting to create history with missing data
      // Then: Should handle validation errors appropriately
      const mockUser = { id: 'user-123' } as any;
      await expect(async () => {
        await controller.createReservationHistory(invalidDto, mockUser);
      }).rejects.toThrow();
    });

    it('should handle query errors gracefully', async () => {
      // Given: A query that will fail
      const queryDto: ReservationHistoryDetailedQueryDto = {
        page: 1,
        limit: 10
      };

      queryBus.execute.mockRejectedValue(new Error('Database connection failed'));

      // When: Querying history with database error
      // Then: Should propagate error appropriately
      await expect(async () => {
        await controller.getDetailedReservationHistory(queryDto);
      }).rejects.toThrow('Database connection failed');
    });
  });
});
