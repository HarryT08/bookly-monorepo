import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para solicitudes de inicio de sesiu00f3n
 */
export class LoginDto {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe tener un formato vu00e1lido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseu00f1a es requerida' })
  @IsString({ message: 'La contraseu00f1a debe ser una cadena de texto' })
  password: string;
}

/**
 * DTO para respuestas de autenticaciu00f3n
 */
export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string = 'Bearer';
}

/**
 * DTO para solicitudes de actualizaciu00f3n de token
 */
export class RefreshTokenDto {
  @IsNotEmpty({ message: 'El refresh token es requerido' })
  @IsString({ message: 'El refresh token debe ser una cadena de texto' })
  refreshToken: string;
}
