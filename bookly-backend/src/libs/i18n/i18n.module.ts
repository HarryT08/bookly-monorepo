import { Module, Global } from '@nestjs/common';
import { I18nModule, AcceptLanguageResolver, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';
import * as fs from 'fs';

function resolveTranslationsDir(): string {
  const candidates = [
    // When running via ts-node from src (connect:dev)
    path.join(__dirname, 'translations'),
    // When running compiled code from dist with preserved directory structure
    path.resolve(process.cwd(), 'dist', 'libs', 'i18n', 'translations'),
    // Fallback to src path when Nest CLI start:dev serves from dist root but sources live in src
    path.resolve(process.cwd(), 'src', 'libs', 'i18n', 'translations'),
    // In case build output flattens to dist/translations
    path.resolve(process.cwd(), 'dist', 'translations'),
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {}
  }
  // Default to __dirname translations to keep previous behavior
  return path.join(__dirname, 'translations');
}

@Global()
@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: process.env.FALLBACK_LANGUAGE || 'en',
      loaderOptions: {
        // Resolve to the translations folder next to this module
        // Works in src (ts-node) and dist builds
        path: resolveTranslationsDir(),
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
