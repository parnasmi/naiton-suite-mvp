# Frontend FSD Template

Use this template for every React frontend app in `apps/*`.

## Required `src/` layers

- `app`
- `pages`
- `widgets`
- `features`
- `entities`
- `shared`

## Local path aliases

- `@/*` -> `src/*`
- `@app/*` -> `src/app/*`
- `@pages/*` -> `src/pages/*`
- `@widgets/*` -> `src/widgets/*`
- `@features/*` -> `src/features/*`
- `@entities/*` -> `src/entities/*`
- `@shared/*` -> `src/shared/*`

## Conventions locked in Phase 1

- Frontend version is runtime-resolved from auth/profile data (`frontend_version`)
- Route templates and host conventions come from `workspace.config.json` (no hardcoded production basenames)
- Shared package imports come from `@naiton/*`
