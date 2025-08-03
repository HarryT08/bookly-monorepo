import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { RegisterCommand } from '../register.command';
import { UserService } from '../../services/user.service';
import { UserEntity } from '../../../domain/entities/user.entity';
import { LoggingService } from '@logging/logging.service';
import { MonitoringService } from '@monitoring/monitoring.service';
import * as bcrypt from 'bcrypt';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
    private readonly monitoringService: MonitoringService,
  ) {}

  async execute(command: RegisterCommand): Promise<UserEntity> {
    const { email, username, password, firstName, lastName } = command;

    try {
      this.loggingService.log(`Registration attempt for email: ${email}`, 'RegisterHandler');

      // Check if user already exists
      const existingUserByEmail = await this.userService.findByEmail(email);
      if (existingUserByEmail) {
        throw new ConflictException('User with this email already exists');
      }

      const existingUserByUsername = await this.userService.findByUsername(username);
      if (existingUserByUsername) {
        throw new ConflictException('User with this username already exists');
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user entity
      const userEntity = UserEntity.create(email, username, hashedPassword, firstName, lastName);

      // Save user
      const createdUser = await this.userService.create(userEntity);

      this.loggingService.log(`User registered successfully: ${createdUser.id}`, 'RegisterHandler');
      this.monitoringService.captureMessage(`New user registered: ${email}`, 'info');

      return createdUser;
    } catch (error) {
      this.loggingService.error(`Registration error for email: ${email}`, error, 'RegisterHandler');
      this.monitoringService.captureException(error, { email, command: 'RegisterCommand' });
      throw error;
    }
  }
}
