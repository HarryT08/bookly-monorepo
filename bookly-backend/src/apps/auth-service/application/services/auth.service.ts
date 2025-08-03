import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: UserEntity): Promise<{ access_token: string; user: any }> {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles?.map(ur => ur.role?.name) || [],
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles?.map(ur => ur.role) || [],
      },
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }

  async refreshToken(userId: string): Promise<{ access_token: string }> {
    const user = await this.userRepository.findByIdWithRoles(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles?.map(ur => ur.role?.name) || [],
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
