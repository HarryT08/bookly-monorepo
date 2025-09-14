import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { LoginCommand } from '../commands/login.command';
import { AuthService } from '../services/auth.service';
import { LoggingService } from '@libs/logging/logging.service';
import { MonitoringService } from '@libs/monitoring/monitoring.service';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { UserLoggedInEvent } from '../../domain/events';
import { LoginRequestDto } from '@libs/dto/auth/auth-requests.dto';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly loggingService: LoggingService,
    private readonly monitoringService: MonitoringService,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: LoginCommand): Promise<{ access_token: string; user: any }> {
    const { email, password } = command;

    try {
      this.loggingService.log(`Login attempt for email: ${email}`, 'LoginHandler');
      
      // Delegate business logic to service
      const loginRequest: LoginRequestDto = { email, password };
      const loginResult = await this.authService.loginUser(loginRequest);
      
      const user = loginResult.user;
      
      this.loggingService.log(`Successful login for user: ${user.id}`, 'LoginHandler');
      this.monitoringService.setUser({ id: user.id, email: user.email, username: user.username });
      
      // Publish UserLoggedInEvent
      const loginEvent = new UserLoggedInEvent(
        user.id,
        {
          userId: user.id,
          email: user.email,
          username: user.username,
          timestamp: new Date(),
          roles: user.roles?.map(r => r.name || '') || [],
          permissions: user.permissions?.map(p => p.name) || [],
          loginMethod: 'traditional',
        },
        user.id
      );
      
      await this.eventBusService.publishEvent(loginEvent);
      
      return loginResult;
    } catch (error) {
      this.loggingService.error(`Login error for email: ${email}`, error, 'LoginHandler');
      this.monitoringService.captureException(error, { email, command: 'LoginCommand' });
      throw error;
    }
  }
}
