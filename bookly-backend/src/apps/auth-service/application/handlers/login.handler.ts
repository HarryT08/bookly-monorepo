import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { LoginCommand } from '../commands/login.command';
import { AuthService } from '../services/auth.service';
import { LoggingService } from '@logging/logging.service';
import { MonitoringService } from '@monitoring/monitoring.service';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly loggingService: LoggingService,
    private readonly monitoringService: MonitoringService,
  ) {}

  async execute(command: LoginCommand): Promise<{ access_token: string; user: any }> {
    const { email, password } = command;

    try {
      this.loggingService.log(`Login attempt for email: ${email}`, 'LoginHandler');
      
      const user = await this.authService.validateUser(email, password);
      if (!user) {
        this.loggingService.warn(`Failed login attempt for email: ${email}`, 'LoginHandler');
        this.monitoringService.captureMessage(`Failed login attempt: ${email}`, 'warning');
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = await this.authService.login(user);
      
      this.loggingService.log(`Successful login for user: ${user.id}`, 'LoginHandler');
      this.monitoringService.setUser({ id: user.id, email: user.email, username: user.username });
      
      return token;
    } catch (error) {
      this.loggingService.error(`Login error for email: ${email}`, error, 'LoginHandler');
      this.monitoringService.captureException(error, { email, command: 'LoginCommand' });
      throw error;
    }
  }
}
