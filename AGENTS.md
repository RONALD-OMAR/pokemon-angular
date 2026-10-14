# AGENTS.md

Angular 22 CLI app. The project lives in `app/` — the workspace root (`Desarrollo web/`) is not a git repo (`app/.git` is). Run all commands from `app/`.

## Commands (run from `app/`)

- Dev server: `npm start` → http://localhost:4200/
- Production build: `npm run build` → `dist/`
- Dev watch build: `npm run watch`
- Unit tests (Vitest + jsdom): `npm test`
- Single spec file: `npm test -- --include=src/app/app.spec.ts`
- Filter by test name: `npm test -- --filter="should create"`
- No lint or e2e tooling is installed (`ng lint` / `ng e2e` won't work)

Test watch mode defaults on in a TTY; pass `--watch=false` for a one-shot run in CI/automated contexts.

## Key paths

- Source root: `src/`; application code: `src/app/`
- Entry point: `src/main.ts`; routes: `src/app/app.routes.ts`; app config: `src/app/app.config.ts`
- Static assets: `public/`
- Styles: `src/styles.css` plus per-component `*.css`

## Conventions / quirks

- Strict TypeScript + Angular compiler options live in `tsconfig.json` (`noImplicitReturns`, `strictInjectionParameters`, `strictInputAccessModifiers`); project references are `tsconfig.app.json` / `tsconfig.spec.json`.
- Formatting uses Prettier (`printWidth: 100`, single quotes; `*.html` uses the `angular` parser). No npm script — run `npx prettier --write .` / `--check .`.
- packageManager is pinned to `npm@11.19.0`; use npm, not other package managers.