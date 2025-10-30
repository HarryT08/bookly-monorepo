import { Injectable } from '@nestjs/common';
import { RecurringReservationRepository } from '../../domain/repositories/recurring-reservation.repository';
import { RecurringReservationEntity } from '../../domain/entities/recurring-reservation.entity';

@Injectable()
export class SimpleRecurringReservationRepository implements RecurringReservationRepository {
  async findById(id: string): Promise<RecurringReservationEntity | null> {
    throw new Error('Method not implemented');
  }

  async findAll(): Promise<RecurringReservationEntity[]> {
    throw new Error('Method not implemented');
  }

  async save(entity: RecurringReservationEntity): Promise<RecurringReservationEntity> {
    throw new Error('Method not implemented');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Method not implemented');
  }

  async findByUserAndProgram(userId: string, programId: string): Promise<RecurringReservationEntity[]> {
    throw new Error('Method not implemented');
  }

  async findMany(filters: any, page: number, limit: number, sortBy: string, sortOrder: string): Promise<{ items: any; total: any }> {
    throw new Error('Method not implemented');
  }

  async create(data: any): Promise<RecurringReservationEntity> {
    throw new Error('Method not implemented');
  }

  async findByUserId(userId: string, status?: any, limit?: number): Promise<RecurringReservationEntity[]> {
    throw new Error('Method not implemented');
  }

  async findByResourceId(resourceId: string): Promise<RecurringReservationEntity[]> {
    throw new Error('Method not implemented');
  }

  async findByStatus(status: any): Promise<RecurringReservationEntity[]> {
    throw new Error('Method not implemented');
  }

  async findActiveByUserId(userId: string): Promise<RecurringReservationEntity[]> {
    throw new Error('Method not implemented');
  }

  async findActiveByResourceId(resourceId: string): Promise<RecurringReservationEntity[]> {
    throw new Error('Method not implemented');
  }

  async findOverlappingWithDateRange(resourceId: string, startDate: Date, endDate: Date, excludeId?: string): Promise<RecurringReservationEntity[]> {
    throw new Error('Method not implemented');
  }

  async findGeneratingInstancesOnDate(resourceId: string, date: Date): Promise<RecurringReservationEntity[]> {
    throw new Error('Method not implemented');
  }

  async findByFrequency(frequency: any): Promise<RecurringReservationEntity[]> {
    throw new Error('Method not implemented');
  }

  async findEndingBefore(date: Date): Promise<RecurringReservationEntity[]> {
    throw new Error('Method not implemented');
  }

  async update(id: string, updates: any): Promise<RecurringReservationEntity> {
    throw new Error('Method not implemented');
  }

  async countActiveByUserId(userId: string): Promise<number> {
    throw new Error('Method not implemented');
  }

  async countActiveByResourceId(resourceId: string): Promise<number> {
    throw new Error('Method not implemented');
  }

  async findNeedingInstanceGeneration(lookAheadDays: number): Promise<RecurringReservationEntity[]> {
    throw new Error('Method not implemented');
  }

  async updateInstanceCounts(id: string, totalInstances: number, confirmedInstances: number): Promise<void> {
    throw new Error('Method not implemented');
  }
}
