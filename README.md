# Naiton Monorepo MVP (v1)

Clean-slate Turborepo scaffold for the Naiton MVP.

The target is to reproduce the provided Naiton login, shell, Sales, CRM, FMS, and Admin screens with close visual fidelity, using shared contracts and a mock API-first workflow.

## Current Status

Milestones 1 through 8 are completed:
- Monorepo foundation and package topology are in place.
- Shared platform packages are implemented:
  - `@naiton/contracts` (`zod` schemas + TypeScript contracts)
  - `@naiton/search-engine` (command palette provider, registry hooks, shell)
  - `@naiton/ui-kit` (Tailwind v4 tokens, shared chrome/primitives, provider stack)
- `apps/api-mock` is fully implemented with version-aware routing, seeded fixtures, auth/session handling, list-query parsing, and contract smoke tests.
- `apps/shell` is now a real Vite/React app with login, session restore, guarded routing, runtime semver fallback resolution, host-aware module links, and a screenshot-matching dashboard shell.
- `apps/sales` is now a real Vite/React app with a screenshot-oriented Orders screen, reserved Sales subsection routes, and typed query wiring (search/sort/page size/filters).
- `apps/crm` is now a real Vite/React app with a screenshot-oriented Companies screen, reserved CRM subsection routes, and typed query wiring (search/sort/page size/filters).
- `apps/fms` is now a real Vite/React app with a screenshot-oriented Fleet map screen, reserved FMS subsection routes, and typed query wiring (search/sort/page size/filters).
- `apps/admin` is now a real Vite/React app with a screenshot-oriented settings rail, ring-metric dashboard cards, typed overview wiring, and responsive dashboard behavior.
- Cross-app polish is applied in Shell/Sales/CRM/FMS/Admin:
  - palette search registration in module apps
  - click/focus top-search opens command palette (`Ctrl/Cmd+K`)
  - shared toast notifications for placeholder/stub actions

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
pnpm ci:check
```

These run through Turborepo. `@naiton/shell`, `@naiton/sales`, `@naiton/crm`, `@naiton/fms`, `@naiton/admin`, and `@naiton/api-mock` now run real build/typecheck flows.

## Run Locally

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

Start FMS app:

```bash
pnpm --filter @naiton/fms dev
```

Start Admin app:

```bash
pnpm --filter @naiton/admin dev
```

Default login users from seed fixtures:
- `owner@naiton.com` / `naiton123`
- `manager@naiton.com` / `naiton123`
- `operator@naiton.com` / `naiton123`

## Shell Behavior

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

## Sales Behavior

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

## CRM Behavior

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

## FMS Behavior

- FMS app renders the supplied fleet layout with:
  - shared top nav
  - left FMS subsection rail
  - searchable/filterable left vehicle list
  - status markers and telemetry snippets per vehicle
  - full-height map canvas
- Reserved route space exists for future subsections:
  - `/{semver}/` and `/{semver}/fleet` (implemented Fleet screen)
  - `/{semver}/trips`, `/{semver}/service`, and `/{semver}/zones` (reserved placeholders)
- Fleet list query is wired to typed API client params:
  - `search`
  - `sort`
  - `pageSize`
  - `status` filter
  - `ignition` filter
- Map implementation uses `Leaflet` with OpenStreetMap tiles and clustered mock markers.
- Selection sync is wired both directions:
  - selecting a vehicle in the list focuses/highlights it on the map
  - clicking a map marker selects the corresponding list vehicle
- Screenshot-style map controls are reproduced with simplified MVP actions:
  - zoom in/out
  - fit fleet bounds
  - focus selected vehicle
  - OSM layer switcher
  - follow-selection toggle
- Lightweight refresh simulation updates vehicle statuses, speeds, timestamps, and coordinates on an interval or manual refresh, without real-time infrastructure.
- On bootstrap, FMS restores stored auth state when available; otherwise it performs a seeded dev login (`owner@naiton.com`) for local MVP flow.

## Admin And Finish Pass Behavior

- Admin app now renders the supplied dashboard direction with:
  - green shared top nav
  - left vertical settings rail
  - ring metric cards + progress cards + responsive dashboard grid
- Admin dashboard is wired to `GET /api/admin/overview` through the typed client and shared contracts.
- Shared UI primitives are reused for dashboard cards (`MetricRingCard`, `SurfaceCard`) and platform providers.
- Cross-app polish shipped:
  - global command palette source registration in Sales/CRM/FMS/Admin
  - top-search controls in module apps open palette on click/focus
  - shared toast system for MVP placeholder actions
  - direct-link versioned routes remain handled via `/:semver/*` guards and correction redirects
- CI-ready checks are now codified with:
  - root `pnpm ci:check`
  - GitHub Actions workflow at `.github/workflows/ci.yml` running install + lint + typecheck + test + build

## Contributor Handoff Rules

- Keep fixed dev ports and semver route templates from `workspace.config.json`.
- Use root commands (`dev`, `build`, `lint`, `typecheck`, `test`, `ci:check`) for cross-workspace validation.
- When a milestone is completed:
  - mark checklist items in `plan.md`
  - fill that milestone's `Files changed` list with one-line notes
  - update this `README.md` for status and runtime instructions
  - do not pre-mark `Test Plan` checklist items before manual verification

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

1. Execute the `Test Plan` checklist from `plan.md` for final acceptance.

---

Reference source: `plan.md`
