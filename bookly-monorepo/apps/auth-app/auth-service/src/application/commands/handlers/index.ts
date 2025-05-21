import { LoginUserHandler } from './login-user.handler';
import { RegisterUserHandler } from './register-user.handler';

export const CommandHandlers = [
  LoginUserHandler,
  RegisterUserHandler,
];

export * from './login-user.handler';
export * from './register-user.handler';
