import { Module, Global } from '@nestjs/common';
import { I18nModule, AcceptLanguageResolver, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';

@Global()
@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: process.env.FALLBACK_LANGUAGE || 'en',
      loaderOptions: {
        // Resolve to the translations folder next to this module
        // Works in src (ts-node) and dist builds
        path: path.join(__dirname, 'translations'),
        watch: true,
      },
      resolvers: [
        { use: HeaderResolver, options: ['x-lang'] },
        AcceptLanguageResolver,
      ],
    }),
  ],
  exports: [I18nModule],
})
export class I18nConfigModule {}
