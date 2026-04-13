# Naiton Monorepo MVP (v1)

Clean-slate Turborepo scaffold for the Naiton MVP.

The target is to reproduce the provided Naiton login, shell, Sales, CRM, FMS, and Admin screens with close visual fidelity, using shared contracts and a mock API-first workflow.

## Current Status

Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, and Phase 6 are completed:
- Monorepo foundation and package topology are in place.
- Shared platform packages are implemented:
  - `@naiton/contracts` (`zod` schemas + TypeScript contracts)
  - `@naiton/search-engine` (command palette provider, registry hooks, shell)
  - `@naiton/ui-kit` (Tailwind v4 tokens, shared chrome/primitives, provider stack)
- `apps/api-mock` is fully implemented with version-aware routing, seeded fixtures, auth/session handling, list-query parsing, and contract smoke tests.
- `apps/shell` is now a real Vite/React app with login, session restore, guarded routing, runtime semver fallback resolution, host-aware module links, and a screenshot-matching dashboard shell.
- `apps/sales` is now a real Vite/React app with a screenshot-oriented Orders screen, reserved Sales subsection routes, and typed query wiring (search/sort/page size/filters).
- `apps/crm` is now a real Vite/React app with a screenshot-oriented Companies screen, reserved CRM subsection routes, and typed query wiring (search/sort/page size/filters).
- `apps/fms` and `apps/admin` remain placeholders for later phases.

## Tech Stack

- `pnpm` + `Turborepo`
- `TypeScript`
- `React` + `Vite` + `React Router`
- `Express` + `cors` (mock API)
- Shared platform libraries:
  - `zod`
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

These run through Turborepo. `@naiton/shell`, `@naiton/sales`, `@naiton/crm`, and `@naiton/api-mock` now run real build/typecheck flows; remaining frontend apps stay on placeholder scripts until their phases.

## Run Phase 6 Locally

Start mock API:

```bash
pnpm --filter @naiton/api-mock dev
```

Start shell app:

```bash
pnpm --filter @naiton/shell dev
```

Start Sales app:

```bash
pnpm --filter @naiton/sales dev
```

Start CRM app:

```bash
pnpm --filter @naiton/crm dev
```

Default login users from seed fixtures:
- `owner@naiton.com` / `naiton123`
- `manager@naiton.com` / `naiton123`
- `operator@naiton.com` / `naiton123`

## Phase 4 Shell Behavior

- Login screen matches supplied structure (brand panel, language selector, cookie settings stub, terms/privacy links).
- Session lifecycle is wired end-to-end:
  - login
  - logout
  - session restore from local storage + `GET /auth/me`
  - guarded navigation
- Runtime frontend route version is resolved from profile payload with fallback to `latest_frontend_version`.
- Runtime backend API base URL is resolved from profile payload with fallback to `latest_backend_version`.
- Host-aware module links preserve the resolved semver route segment.
- Post-login shell dashboard includes shared top nav/search, notification/profile controls, chart placeholders, activity panel, and command palette (`Ctrl/Cmd+K`).
- Disabled/coming-soon modules remain visible and non-clickable.

## Phase 5 Sales Behavior

- Sales app renders the supplied Orders layout with:
  - green shared top nav
  - left Sales subsection rail
  - search/filter toolbar
  - dense orders data grid with status/boolean indicators
  - primary `New order` CTA
- Reserved route space exists for future subsections:
  - `/{semver}/` and `/{semver}/orders` (implemented Orders screen)
  - `/{semver}/offers` and `/{semver}/subscriptions` (reserved placeholders)
- Orders list query is wired to typed API client params:
  - `search`
  - `sort`
  - `pageSize`
  - `status` filter
  - `manager` filter
- Table behavior reuses `@naiton/ui-kit` `DataGrid` with controlled/manual sorting support for server-driven sort queries.
- On bootstrap, Sales restores stored auth state when available; otherwise it performs a seeded dev login (`owner@naiton.com`) for local MVP flow.

## Phase 6 CRM Behavior

- CRM app renders the supplied Companies layout with:
  - shared top nav
  - left CRM subsection rail
  - search/filter toolbar
  - dense enterprise companies data grid
  - primary `New company` CTA
- Reserved route space exists for future subsections:
  - `/{semver}/` and `/{semver}/companies` (implemented Companies screen)
  - `/{semver}/contacts`, `/{semver}/pipeline`, and `/{semver}/labels` (reserved placeholders)
- Companies list query is wired to typed API client params:
  - `search`
  - `sort`
  - `pageSize`
  - `relationship` filter
  - `active` filter
- Visible Companies columns map stable contract fields:
  - relation (`relationship_type`)
  - account manager (`account_manager`)
  - tax number (`tax_number`)
  - geography labels (`country`, `city`)
  - business label (`industry`)
- Toolbar and table behavior reuse `@naiton/ui-kit` (`SearchInput` + `DataGrid`) and shared list query conventions aligned with Sales.
- On bootstrap, CRM restores stored auth state when available; otherwise it performs a seeded dev login (`owner@naiton.com`) for local MVP flow.

## Mock API Surface

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

## Environment Variables

Defined in `.env.example`:

- `NAITON_API_PORT`
- `NAITON_API_BASE_URL`
- `NAITON_VERSION_SOURCE_FIELD`, `NAITON_LATEST_VERSION_FIELD`, `NAITON_VERSION_FALLBACK`
- `NAITON_SHELL_HOST`, `NAITON_SALES_HOST`, `NAITON_CRM_HOST`, `NAITON_FMS_HOST`, `NAITON_ADMIN_HOST`
- `SHELL_PORT`, `SALES_PORT`, `CRM_PORT`, `FMS_PORT`, `ADMIN_PORT`
- `SHELL_ROUTE_TEMPLATE`, `SALES_ROUTE_TEMPLATE`, `CRM_ROUTE_TEMPLATE`, `FMS_ROUTE_TEMPLATE`, `ADMIN_ROUTE_TEMPLATE`

## Roadmap Snapshot

1. Phase 7: FMS fleet + map screen.
2. Phase 8: Admin dashboard + polish + CI-ready checks.

---

Reference source: `plan.md`
