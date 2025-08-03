import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './application/services/auth.service';
import { UserRepository } from './domain/repositories/user.repository';
import { UserEntity } from './domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = new UserEntity(
    '1',
    'test@example.com',
    'testuser',
    'hashedpassword',
    'Test',
    'User',
    true,
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      findByIdWithRoles: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      const password = 'testpassword';
      const hashedPassword = await bcrypt.hash(password, 12);
      const userWithHashedPassword = new UserEntity(
        mockUser.id,
        mockUser.email,
        mockUser.username,
        hashedPassword,
        mockUser.firstName,
        mockUser.lastName,
        mockUser.isActive,
        mockUser.createdAt,
        mockUser.updatedAt,
        mockUser.roles
      );

      userRepository.findByEmail.mockResolvedValue(userWithHashedPassword);

      const result = await service.validateUser('test@example.com', password);

      expect(result).toEqual(userWithHashedPassword);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when user does not exist', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const mockToken = 'mock.jwt.token';
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUser);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          roles: [],
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        roles: [],
      });
    });
  });

  describe('validateToken', () => {
    it('should return payload when token is valid', async () => {
      const mockPayload = { sub: '1', email: 'test@example.com' };
      jwtService.verify.mockReturnValue(mockPayload);

      const result = await service.validateToken('valid.token');

      expect(result).toEqual(mockPayload);
    });

    it('should return null when token is invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.validateToken('invalid.token');

      expect(result).toBeNull();
    });
  });
});
