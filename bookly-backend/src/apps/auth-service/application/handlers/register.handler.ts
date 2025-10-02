import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from '../commands/register.command';
import { AuthService } from '../services/auth.service';
import { UserEntity } from '@apps/auth-service/domain/entities/user.entity';
import { LoggingService } from '@libs/logging/logging.service';
import { MonitoringService } from '@libs/monitoring/monitoring.service';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { UserRegisteredEvent } from '../../domain/events';
import { RegisterRequestDto } from '@libs/dto/auth/auth-requests.dto';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly loggingService: LoggingService,
    private readonly monitoringService: MonitoringService,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: RegisterCommand): Promise<{ message: string; user: any }> {
    const { email, username, password, firstName, lastName } = command;

    try {
      this.loggingService.log(`Registration attempt for email: ${email}`, 'RegisterHandler');

      // Delegate business logic to service using DTO
      const registerRequest: RegisterRequestDto = {
        email,
        username,
        password,
        firstName,
        lastName,
      };

      const registerResult = await this.authService.register(registerRequest);

      this.loggingService.log(`User registered successfully: ${registerResult.user.id}`, 'RegisterHandler');
      this.monitoringService.captureMessage(`New user registered: ${email}`, 'info');

      // Publish UserRegisteredEvent
      const registrationEvent = new UserRegisteredEvent(
        registerResult.user.id,
        {
          userId: registerResult.user.id,
          email: registerResult.user.email,
          username: registerResult.user.username,
          firstName: registerResult.user.firstName,
          lastName: registerResult.user.lastName,
          roles: [],
          timestamp: new Date(),
        },
        registerResult.user.id
      );
      
      await this.eventBusService.publishEvent(registrationEvent);

      return registerResult;
    } catch (error) {
      this.loggingService.error(`Registration error for email: ${email}`, error, 'RegisterHandler');
      this.monitoringService.captureException(error, { email, command: 'RegisterCommand' });
      throw error;
    }
  }
}
