import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/infrastructure/controllers/auth.controller';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus } from '../../src/application/buses/cqrs-bus';

describe('AuthController', () => {
  let controller: AuthController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: 'CommandBus',
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    commandBus = module.get<CommandBus>('CommandBus');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const expectedResponse = {
        id: 'user-id-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValue(expectedResponse);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(expectedResponse);
      expect(commandBus.execute).toHaveBeenCalledWith({
        type: 'auth.registerUser',
        userData: createUserDto,
      });
    });

    it('should handle registration errors', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error al registrar usuario'));

      await expect(controller.register(createUserDto)).rejects.toThrow(HttpException);
    });
  });

  describe('login', () => {
    it('should authenticate a user successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-id-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(commandBus.execute).toHaveBeenCalledWith({
        type: 'auth.loginUser',
        credentials: loginDto,
      });
    });

    it('should handle authentication errors', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Credenciales inválidas'));

      await expect(controller.login(loginDto)).rejects.toThrow(HttpException);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const expectedResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: 'user-id-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValue(expectedResponse);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result).toEqual(expectedResponse);
      expect(commandBus.execute).toHaveBeenCalledWith({
        type: 'auth.refreshToken',
        token: refreshTokenDto.refreshToken,
      });
    });

    it('should handle token refresh errors', async () => {
      const refreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };

      jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Token inválido o expirado'));

      await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(HttpException);
    });
  });

  describe('logout', () => {
    it('should log out a user successfully', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValue({ success: true });

      const result = await controller.logout(refreshTokenDto);

      expect(result).toEqual({ success: true });
      expect(commandBus.execute).toHaveBeenCalledWith({
        type: 'auth.logoutUser',
        token: refreshTokenDto.refreshToken,
      });
    });

    it('should handle logout errors', async () => {
      const refreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };

      jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error al cerrar sesión'));

      await expect(controller.logout(refreshTokenDto)).rejects.toThrow(HttpException);
    });
  });
});
