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

- Frontend version prefix: `v1.0.0`
- Versioned basenames come from `workspace.config.json`
- Shared package imports come from `@naiton/*`
