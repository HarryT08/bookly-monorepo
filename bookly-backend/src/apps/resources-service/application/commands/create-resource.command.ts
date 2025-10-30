import { ICommand } from '@nestjs/cqrs';
import { CreateResourceDto } from '@libs/dto/resources/create-resource.dto';

/**
 * Create Resource Command
 * Implements RF-01 (create resource)
 * Uses standardized DTO for type safety and validation
 */
export class CreateResourceCommand implements ICommand {
  constructor(
    public readonly data: CreateResourceDto,
    public readonly createdBy?: string
  ) {}
}
