import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUsersQuery } from '../queries/get-users.query';
import { UserService } from '../services/user.service';
import { UserEntity } from '@apps/auth-service/domain/entities/user.entity';
import { LoggingService } from '@libs/logging/logging.service';
import { MonitoringService } from '@libs/monitoring/monitoring.service';
import { PaginationDto } from '@libs/dto';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
    private readonly monitoringService: MonitoringService,
  ) {}

  async execute(query: GetUsersQuery): Promise<{
    users: UserEntity[];
    total: number;
  }> {
    const { page, limit, search } = query;

    try {
      this.loggingService.log('Getting users list', 'GetUsersHandler');
      
      // Delegate to service for business logic
      const result = await this.userService.findAll(page, limit, search);
      
      this.monitoringService.captureMessage(`Users list retrieved: ${result.total} users`, 'info');
      
      return result;
    } catch (error) {
      this.loggingService.error('Error getting users list', error, 'GetUsersHandler');
      this.monitoringService.captureException(error, { query: 'GetUsersQuery', page, limit, search });
      throw error;
    }
  }
}
