import { Module } from '@nestjs/common';
import { Logger } from '@bookly-monorepo/logging';

// Este modulo proporciona una versiu00f3n precreada del Logger que no require inyecciu00f3n de
// paru00e1metros en el constructor, solucionando problemas de DI
@Module({
  providers: [
    {
      provide: Logger,
      useFactory: () => {
        return new Logger('AuthService');
      }
    }
  ],
  exports: [Logger],
})
export class CustomLoggingModule {}
