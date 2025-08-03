import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from '../get-user.query';
import { UserService } from '../../services/user.service';
import { UserEntity } from '../../../domain/entities/user.entity';
import { LoggingService } from '@logging/logging.service';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: GetUserQuery): Promise<UserEntity | null> {
    const { id } = query;

    try {
      this.loggingService.log(`Getting user by id: ${id}`, 'GetUserHandler');
      return await this.userService.findByIdWithRoles(id);
    } catch (error) {
      this.loggingService.error(`Error getting user: ${id}`, error, 'GetUserHandler');
      throw error;
    }
  }
}
