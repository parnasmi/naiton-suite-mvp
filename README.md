# Naiton Monorepo MVP (v1)

Clean-slate Turborepo scaffold for the Naiton MVP.

The project target is to reproduce the provided Naiton login, shell, Sales, CRM, FMS, and Admin screens with close visual fidelity, using shared contracts and a mock API-first workflow.

## Current Status

Phase 1 is completed:
- Monorepo foundation and package topology are in place.
- App/package workspaces are scaffolded.
- Shared root scripts and environment conventions are locked.
- App and package scripts are currently placeholders (implementation begins in Phase 2+).

## Tech Stack

- `pnpm` + `Turborepo`
- `TypeScript`
- Planned frontend stack: `React` + `Vite` + `React Router v7`
- Planned styling/state/data stack: `Tailwind CSS v4`, `@tanstack/react-query`, `zustand`
- Planned backend/contracts stack: `Express` mock API + `zod`

## Workspace Layout

```text
apps/
  shell/
  sales/
  crm/
  fms/
  admin/
  api-mock/
packages/
  ui-kit/
  search-engine/
  contracts/
scripts/
  placeholder-task.mjs
templates/
  fsd-app/
```

## App Ports And Basenames

| App | Port | Basename |
|---|---:|---|
| shell | 3000 | `/v1.0.0/shell` |
| sales | 3001 | `/v1.0.0/sales` |
| crm | 3002 | `/v1.0.0/crm` |
| fms | 3003 | `/v1.0.0/fms` |
| admin | 3004 | `/v1.0.0/admin` |
| api-mock | 4000 | `/api` |

## Prerequisites

- `Node.js >= 22.15.0`
- `pnpm >= 9.15.1`

## Setup

```bash
pnpm install
cp .env.example .env
```

## Root Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

Note: these commands run through Turborepo and currently execute placeholder task scripts in each workspace.

## Environment Variables

Defined in `.env.example`:

- `NAITON_FRONTEND_VERSION`
- `NAITON_API_PORT`
- `NAITON_API_BASE_URL`
- `SHELL_PORT`, `SALES_PORT`, `CRM_PORT`, `FMS_PORT`, `ADMIN_PORT`
- `SHELL_BASENAME`, `SALES_BASENAME`, `CRM_BASENAME`, `FMS_BASENAME`, `ADMIN_BASENAME`

## Planned API Surface (Mock)

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/navigation`
- `GET /api/notifications`
- `GET /api/search?q=...`
- `GET /api/dashboard/summary`
- `GET /api/sales/orders`
- `GET /api/sales/orders/:orderId`
- `GET /api/crm/companies`
- `GET /api/crm/companies/:companyId`
- `GET /api/fms/vehicles`
- `GET /api/fms/map-markers`
- `GET /api/admin/overview`

List endpoints are planned to support stable params: `page`, `pageSize`, `search`, `sort`, and screen-specific filters.

## Architecture Notes

- `apps/shell` owns login and post-login home dashboard.
- Domain screens live as standalone apps: Sales, CRM, FMS, Admin.
- Frontend apps follow FSD layers: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- `packages/ui-kit` will own shared design tokens/primitives.
- `packages/contracts` will own shared `zod` schemas and TypeScript types.
- `packages/search-engine` will own the global command palette (`Ctrl/Cmd+K`).

## Roadmap Snapshot

1. Phase 2: shared platform packages (`ui-kit`, `contracts`, `search-engine`).
2. Phase 3: mock API scaffold + typed endpoint coverage.
3. Phase 4: shell app (auth + dashboard).
4. Phase 5: Sales app orders screen.
5. Phase 6: CRM companies screen.
6. Phase 7: FMS fleet + map screen.
7. Phase 8: Admin dashboard + polish + CI-ready checks.

---

Reference source: `plan.md`
