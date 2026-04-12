# Naiton Monorepo MVP (v1)

Clean-slate Turborepo scaffold for the Naiton MVP.

The target is to reproduce the provided Naiton login, shell, Sales, CRM, FMS, and Admin screens with close visual fidelity, using shared contracts and a mock API-first workflow.

## Current Status

Phase 1, Phase 2, and Phase 3 are completed:
- Monorepo foundation and package topology are in place.
- Shared platform packages are implemented:
  - `@naiton/contracts` (`zod` schemas + TypeScript contracts)
  - `@naiton/search-engine` (command palette provider, registry hooks, shell)
  - `@naiton/ui-kit` (Tailwind v4 tokens, shared chrome/primitives, provider stack)
- `apps/api-mock` is now fully scaffolded with version-aware routing, seeded fixtures, auth/session handling, stable list-query parsing, and contract smoke tests.
- Frontend UI apps are still placeholder runners for UI implementation (Phase 4+), but now include typed runtime API wrappers in `src/shared/api/client.ts`.

## Tech Stack

- `pnpm` + `Turborepo`
- `TypeScript`
- `Express` + `cors` (mock API)
- Shared platform libraries in use:
  - `zod`
  - `react`
  - `@tanstack/react-query`
  - `zustand`
  - `@tanstack/react-table`
  - `tailwindcss` v4

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
| api-mock | 4000 | `localhost` | `/{backend_semver}/api` (plus `/api` latest alias) |

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

These run through Turborepo. `@naiton/api-mock` now runs real TypeScript and smoke tests; frontend app workspaces keep placeholder scripts until UI phases begin.

## Phase 3 Mock API

Run only the mock API:

```bash
pnpm --filter @naiton/api-mock dev
```

Key implementation details:
- Version-aware API mounts:
  - `/api/...` (latest backend version alias)
  - `/{backend_semver}/api/...` (version-explicit)
- Auth/profile payloads include:
  - `frontend_version`
  - `latest_frontend_version`
  - `backend_version`
  - `latest_backend_version`
- List endpoints support stable query params:
  - `page`, `pageSize`, `search`, `sort`
  - screen filters (`status`, `manager`, `relationship`, `active`, `ignition`)
- Shared runtime resolver in `@naiton/contracts/runtime-api` drives backend version fallback behavior.

## Implemented Mock API Surface

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

## Frontend Typed API Wrappers (Phase 3)

Each frontend workspace now has `src/shared/api/client.ts` that wraps shared typed clients and runtime backend base URL resolution:
- `apps/shell/src/shared/api/client.ts`
- `apps/sales/src/shared/api/client.ts`
- `apps/crm/src/shared/api/client.ts`
- `apps/fms/src/shared/api/client.ts`
- `apps/admin/src/shared/api/client.ts`

All wrappers use:
- `@naiton/contracts/client` (`createNaitonApiClient`)
- `@naiton/contracts/runtime-api` (`resolveRuntimeApiBase` fallback behavior)

## Contract Smoke Tests

Run Phase 3 smoke tests:

```bash
pnpm --filter @naiton/api-mock test
```

Smoke coverage validates that seeded/auth/list/search payloads conform to shared `@naiton/contracts` schemas and that backend version fallback resolution behaves as expected.

## Environment Variables

Defined in `.env.example`:

- `NAITON_API_PORT`
- `NAITON_API_BASE_URL`
- `NAITON_VERSION_SOURCE_FIELD`, `NAITON_LATEST_VERSION_FIELD`, `NAITON_VERSION_FALLBACK`
- `NAITON_SHELL_HOST`, `NAITON_SALES_HOST`, `NAITON_CRM_HOST`, `NAITON_FMS_HOST`, `NAITON_ADMIN_HOST`
- `SHELL_PORT`, `SALES_PORT`, `CRM_PORT`, `FMS_PORT`, `ADMIN_PORT`
- `SHELL_ROUTE_TEMPLATE`, `SALES_ROUTE_TEMPLATE`, `CRM_ROUTE_TEMPLATE`, `FMS_ROUTE_TEMPLATE`, `ADMIN_ROUTE_TEMPLATE`

## Roadmap Snapshot

1. Phase 4: shell app (auth + dashboard).
2. Phase 5: Sales app orders screen.
3. Phase 6: CRM companies screen.
4. Phase 7: FMS fleet + map screen.
5. Phase 8: Admin dashboard + polish + CI-ready checks.

---

Reference source: `plan.md`
