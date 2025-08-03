import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUsersQuery } from '../get-users.query';
import { UserService } from '../../services/user.service';
import { UserEntity } from '../../../domain/entities/user.entity';
import { LoggingService } from '@logging/logging.service';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: GetUsersQuery): Promise<{
    users: UserEntity[];
    total: number;
  }> {
    const { page, limit, search } = query;

    try {
      this.loggingService.log('Getting users list', 'GetUsersHandler');
      return await this.userService.findAll(page, limit, search);
    } catch (error) {
      this.loggingService.error('Error getting users list', error, 'GetUsersHandler');
      throw error;
    }
  }
}
