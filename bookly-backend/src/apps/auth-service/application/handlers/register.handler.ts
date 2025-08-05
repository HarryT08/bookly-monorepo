import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { RegisterCommand } from '@apps/auth-service/application/commands/register.command';
import { UserRepository } from '@apps/auth-service/domain/repositories/user.repository';
import { UserEntity } from '@apps/auth-service/domain/entities/user.entity';
import { LoggingService } from '@libs/logging/logging.service';
import { LoggingHelper } from '@libs/logging/logging.helper';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: RegisterCommand): Promise<UserEntity> {
    const { email, username, password, firstName, lastName } = command;

    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        this.loggingService.warn('Registration attempt failed - Email already exists', {
          email,
        });
        throw new BadRequestException('Email already registered');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user entity
      const newUser = new UserEntity(
        crypto.randomUUID(),
        email,
        username || email.split('@')[0],
        hashedPassword,
        firstName,
        lastName,
        true, // isActive
        false, // isEmailVerified - requires verification
        crypto.randomUUID(), // emailVerificationToken
        null, // passwordResetToken
        null, // passwordResetExpires
        null, // lastLoginAt
        0, // loginAttempts
        null, // lockedUntil
        null, // ssoProvider
        null, // ssoId
        new Date(), // createdAt
        new Date(), // updatedAt
      );

      // Save user
      const createdUser = await this.userRepository.create(newUser);

      this.loggingService.log('User registration successful', {
        userId: createdUser.id,
        email: createdUser.email,
      });

      return createdUser;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.loggingService.error('Error during user registration', error, LoggingHelper.logParams({
        email,
      }));
      throw new BadRequestException('Registration failed');
    }
  }
}
