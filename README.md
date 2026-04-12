# Naiton Monorepo MVP (v1)

Clean-slate Turborepo scaffold for the Naiton MVP.

The target is to reproduce the provided Naiton login, shell, Sales, CRM, FMS, and Admin screens with close visual fidelity, using shared contracts and a mock API-first workflow.

## Current Status

Phase 1 and Phase 2 are completed:
- Monorepo foundation and package topology are in place.
- Shared platform packages are now implemented:
  - `@naiton/contracts` (`zod` schemas + TypeScript contracts)
  - `@naiton/search-engine` (command palette provider, registry hooks, shell)
  - `@naiton/ui-kit` (Tailwind v4 tokens, shared chrome/primitives, provider stack)
- Frontend apps and API app remain placeholder scripts until later phases.

## Tech Stack

- `pnpm` + `Turborepo`
- `TypeScript`
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

These commands run through Turborepo. Shared packages now run real TypeScript checks; app workspaces are still placeholder runners until app phases begin.

## Phase 2 Shared Packages

### `@naiton/contracts`

Exports `zod` schemas and inferred types for:
- Auth/session (`frontend_version`, `latest_frontend_version` included)
- Navigation and notifications
- Dashboard summary
- Sales orders
- CRM companies
- FMS vehicles/map markers
- Admin overview
- Search groups/results
- Common list-query and pagination contracts

### `@naiton/search-engine`

Exports:
- `SearchProvider`
- `useCommandPalette`
- `useRegisterSearchSource`
- `CommandPaletteShell`
- Registry and result-group types for app-level source registration

Keyboard shortcut is wired to `Ctrl/Cmd+K`.

### `@naiton/ui-kit`

Exports:
- Tailwind v4 token stylesheet at `@naiton/ui-kit/tokens.css`
- Shared UI primitives: `AuthPanel`, `TopShellBar`, `SideRail`, `ShellLayout`, `SurfaceCard`
- Data and metric components: `DataGrid`, `MetricCard`, `MetricRingCard`, `MapPanel`
- Inputs and state visuals: `SearchInput`, `CommandPalette`, `StatusBadge`, `StatusDot`
- Shared provider setup: `PlatformProviders`, `ThemeProvider`, `SessionProvider`

## Provider Setup Example

```tsx
import { PlatformProviders } from "@naiton/ui-kit";
import "@naiton/ui-kit/tokens.css";

export function AppRoot() {
  return <PlatformProviders>{/* app routes */}</PlatformProviders>;
}
```

`PlatformProviders` composes theme state, TanStack Query client, session state, and command palette state.

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

## Roadmap Snapshot

1. Phase 3: mock API scaffold + typed endpoint coverage.
2. Phase 4: shell app (auth + dashboard).
3. Phase 5: Sales app orders screen.
4. Phase 6: CRM companies screen.
5. Phase 7: FMS fleet + map screen.
6. Phase 8: Admin dashboard + polish + CI-ready checks.

---

Reference source: `plan.md`
