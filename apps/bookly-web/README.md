# Bookly Web (Next.js)

This app is the Bookly frontend organized under `apps/bookly-web/`. It migrates the Fuse React Next.js skeleton to Bookly conventions.

## Structure

apps/bookly-web/
- app/                      Next.js App Router (routes, layouts)
- components/
  - atoms/
  - molecules/
  - organisms/
  - templates/
  - pages/
- services/
  - http/                  ky instances, interceptors
  - <feature>/             raw API (services.ts), types.ts, models.ts
- hooks/                   custom React hooks (non-API)
- store/                   Redux Toolkit (UI/global state)
- i18n/                    react-i18next config & translations
- public/
- styles/
- utils/                   helpers
- lib/                     adapters (e.g., Fuse wrappers)
  - fuse/
- types/                   UI types/interfaces
- contexts/                feature contexts (only if needed)
- next.config.ts
- tsconfig.json
- eslint.config.mjs
- package.json

## Mapping from Fuse skeleton
- src/app/ → app/
- src/components/ → components/{atoms,molecules,organisms,templates,pages}
- src/@i18n/ → i18n/
- src/@fuse/ → lib/fuse/
- src/configs/ → lib/config/ (constants) or next.config where appropriate
- src/hooks/ → hooks/
- src/contexts/ → contexts/
- src/utils/ → utils/ and lib/ (split helpers vs constants)
- public/ → public/

## Conventions
- Functional components, named exports.
- TypeScript with interfaces; avoid any/enums.
- React Query for server state; Redux Toolkit for UI/global state.
- react-i18next namespaces in `i18n/`.
- Lint/Prettier configured; strict TypeScript.

## Next steps
1. Incrementally move feature code into the new folders.
2. Introduce `services/http` client and feature services.
3. Add `store` slices for UI/session; keep server cache in React Query.
4. Gradually wrap Fuse-specific bits under `lib/fuse/` and expose through components.