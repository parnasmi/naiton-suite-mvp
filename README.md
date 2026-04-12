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

## App Ports And Runtime Routes

| App | Port | Host | Route Template |
|---|---:|---|---|
| shell | 3000 | `app.naiton.com` | `/{semver}/shell` |
| sales | 3001 | `sales.naiton.com` | `/{semver}/` |
| crm | 3002 | `crm.naiton.com` | `/{semver}/` |
| fms | 3003 | `fms.naiton.com` | `/{semver}/` |
| admin | 3004 | `admin.naiton.com` | `/{semver}/` |
| api-mock | 4000 | `localhost` | `/api` |

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

- `NAITON_API_PORT`
- `NAITON_API_BASE_URL`
- `NAITON_VERSION_SOURCE_FIELD`, `NAITON_LATEST_VERSION_FIELD`, `NAITON_VERSION_FALLBACK`
- `NAITON_SHELL_HOST`, `NAITON_SALES_HOST`, `NAITON_CRM_HOST`, `NAITON_FMS_HOST`, `NAITON_ADMIN_HOST`
- `SHELL_PORT`, `SALES_PORT`, `CRM_PORT`, `FMS_PORT`, `ADMIN_PORT`
- `SHELL_ROUTE_TEMPLATE`, `SALES_ROUTE_TEMPLATE`, `CRM_ROUTE_TEMPLATE`, `FMS_ROUTE_TEMPLATE`, `ADMIN_ROUTE_TEMPLATE`

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
- Frontend route version is resolved at runtime from authenticated profile data (`frontend_version`).
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
