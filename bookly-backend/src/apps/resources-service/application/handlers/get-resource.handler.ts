import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetResourceQuery, GetResourceByCodeQuery } from '../queries/get-resource.query';
import { ResourceEntity } from '../../domain/entities/resource.entity';
import { ResourceRepository } from '../../domain/repositories/resource.repository';
import { LoggingService } from '../../../../libs/logging/logging.service';

/**
 * Get Resource Query Handler
 * Retrieves a single resource by ID
 */
@QueryHandler(GetResourceQuery)
export class GetResourceHandler implements IQueryHandler<GetResourceQuery> {
  constructor(
    @Inject('ResourceRepository')
    private readonly resourceRepository: ResourceRepository,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetResourceQuery): Promise<ResourceEntity> {
    this.logger.log('Getting resource by ID', { 
      resourceId: query.id
    }, 'GetResourceHandler');

    try {
      const resource = await this.resourceRepository.findById(query.id);
      
      if (!resource) {
        throw new NotFoundException(`Resource with ID ${query.id} not found`);
      }

      this.logger.log('Resource retrieved successfully', { 
        resourceId: resource.id,
        resourceCode: resource.code
      }, 'GetResourceHandler');

      return resource;

    } catch (error) {
      this.logger.error('Failed to get resource', error, 'GetResourceHandler');
      throw error;
    }
  }
}

/**
 * Get Resource by Code Query Handler
 * Retrieves a single resource by unique code
 */
@QueryHandler(GetResourceByCodeQuery)
export class GetResourceByCodeHandler implements IQueryHandler<GetResourceByCodeQuery> {
  constructor(
    @Inject('ResourceRepository')
    private readonly resourceRepository: ResourceRepository,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetResourceByCodeQuery): Promise<ResourceEntity> {
    this.logger.log('Getting resource by code', { 
      resourceCode: query.code
    }, 'GetResourceByCodeHandler');

    try {
      const resource = await this.resourceRepository.findByCode(query.code);
      
      if (!resource) {
        throw new NotFoundException(`Resource with code ${query.code} not found`);
      }

      this.logger.log('Resource retrieved successfully', { 
        resourceId: resource.id,
        resourceCode: resource.code
      }, 'GetResourceByCodeHandler');

      return resource;

    } catch (error) {
      this.logger.error('Failed to get resource by code', error, 'GetResourceByCodeHandler');
      throw error;
    }
  }
}
