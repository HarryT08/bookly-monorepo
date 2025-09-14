import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from '../queries/get-user.query';
import { UserService } from '../services/user.service';
import { UserEntity } from '@apps/auth-service/domain/entities/user.entity';
import { LoggingService } from '@libs/logging/logging.service';
import { MonitoringService } from '@libs/monitoring/monitoring.service';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
    private readonly monitoringService: MonitoringService,
  ) {}

  async execute(query: GetUserQuery): Promise<UserEntity | null> {
    const { id } = query;

    try {
      this.loggingService.log(`Getting user by id: ${id}`, 'GetUserHandler');
      
      // Delegate to service for business logic
      const user = await this.userService.findByIdWithRoles(id);
      
      if (user) {
        this.monitoringService.captureMessage(`User retrieved: ${id}`, 'info');
      }
      
      return user;
    } catch (error) {
      this.loggingService.error(`Error getting user: ${id}`, error, 'GetUserHandler');
      this.monitoringService.captureException(error, { userId: id, query: 'GetUserQuery' });
      throw error;
    }
  }
}
