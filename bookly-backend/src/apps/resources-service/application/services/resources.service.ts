import { Injectable } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';

@Injectable()
export class ResourcesService {
  constructor(private readonly loggingService: LoggingService) {}

  async findAll(): Promise<any[]> {
    this.loggingService.log('Finding all resources', 'ResourcesService');
    return [];
  }

  async findById(id: string): Promise<any> {
    this.loggingService.log(`Finding resource by id: ${id}`, 'ResourcesService');
    return null;
  }

  async create(data: any): Promise<any> {
    this.loggingService.log('Creating new resource', 'ResourcesService');
    return data;
  }

  async update(id: string, data: any): Promise<any> {
    this.loggingService.log(`Updating resource: ${id}`, 'ResourcesService');
    return data;
  }

  async delete(id: string): Promise<void> {
    this.loggingService.log(`Deleting resource: ${id}`, 'ResourcesService');
  }
}
