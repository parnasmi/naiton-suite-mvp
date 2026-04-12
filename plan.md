# Naiton Monorepo MVP Plan

## Summary

- Goal: build a clean-slate Turborepo MVP that reproduces the supplied Naiton login, shell, Sales, CRM, FMS, and Admin screens with close visual fidelity and future-ready mock contracts.
- Deliverables: `apps/shell`, `apps/sales`, `apps/crm`, `apps/fms`, `apps/admin`, `apps/api-mock`; `packages/ui-kit`, `packages/search-engine`, `packages/contracts`.
- Development model: each numbered phase should be executable as a standalone fresh conversation and end in a runnable slice.
- Routing/versioning model: frontend route version and backend API version are runtime-resolved from authenticated user profile data; neither frontend routes nor backend API base URL may hardcode `v1.0.0`.

## Stack

- `pnpm`, `Turborepo`, `TypeScript`
- `React` + `Vite` + `React Router v7`
- `Tailwind CSS v4`
- `@tanstack/react-query` for server state, `zustand` for session/UI state
- `Express` mock API, `zod` shared contracts
- `@tanstack/react-table`, `Leaflet`, `Recharts`

## Key Decisions

- `apps/shell` owns the login page and post-login home dashboard; each domain screen is a standalone frontend app.
- Every frontend app uses FSD: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- Stable entry point is `app.naiton.com/login`; Shell authenticates, loads profile, then resolves runtime version routing.
- Frontend version is dynamic from profile/auth payload (`frontend_version`) and must not be hardcoded in route basenames.
- Backend API version is dynamic from profile/auth payload (`backend_version`) and must be applied in runtime API base URL resolution.
- Production URL model is host-per-module + semver path:
  - `app.naiton.com/{semver}/shell`
  - `sales.naiton.com/{semver}/`
  - `crm.naiton.com/{semver}/`
  - `fms.naiton.com/{semver}/`
  - `admin.naiton.com/{semver}/`
- If requested `frontend_version` is not deployed, Shell falls back to latest deployed frontend version from API metadata.
- Backend URL model is versioned base URL plus stable endpoint paths: `{api_origin}/{backend_semver}` + `/api/...`.
- If requested `backend_version` is not deployed, API client resolution falls back to `latest_backend_version` from API metadata.
- Dev ports are fixed to `3000` shell, `3001` sales, `3002` crm, `3003` fms, `3004` admin, `4000` api-mock.
- `packages/ui-kit` owns brand tokens, Tailwind theme, shell chrome, table/card/form primitives, and shared empty/loading/error states.
- `packages/search-engine` owns the global command palette and is opened with `Ctrl/Cmd+K` instead of `Ctrl+Q` to avoid OS/browser conflicts.
- Top-nav modules not implemented in MVP (`WMS`, `Procurement`, `Production`, `Accounting`, `HRM`, `CMS`) remain visible as disabled or `Coming soon` links.
- All frontend data access goes through typed clients built from `packages/contracts`; pages/widgets do not call `fetch` directly.

## API Endpoints

All endpoints below are relative to a runtime-resolved, versioned backend base URL (`{api_origin}/{backend_semver}`), so calls resolve to `/{backend_semver}/api/...` in production-style routing.

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
- List endpoints use stable query params: `page`, `pageSize`, `search`, `sort`, and screen-specific filters.

## Public Interfaces

- `packages/contracts` exports `AuthSession`, `NavModule`, `DashboardSummary`, `SalesOrder`, `CrmCompany`, `FleetVehicle`, `MapMarker`, `AdminOverview`, and `SearchResult`.
- `AuthSession` (or equivalent auth/profile contract) includes `frontend_version`, `latest_frontend_version`, `backend_version`, and `latest_backend_version` to support runtime routing/base-URL resolution and fallback.
- `packages/ui-kit` exports `AuthPanel`, `TopShellBar`, `SideRail`, `DataGrid`, `MetricCard`, `MetricRingCard`, `SearchInput`, `CommandPalette`, `MapPanel`, and shared status badges/icons.
- `packages/search-engine` exports `SearchProvider`, `useCommandPalette`, and a registry interface for app-level search sources.

## 1. Phase 1 - Workspace Foundation

- [x] Initialize root workspace files, shared scripts, TypeScript base config, and Turborepo pipelines.
- [x] Create empty app/package manifests and a reusable FSD folder template for every frontend app.
- [x] Lock environment conventions for ports, env vars, path aliases, and runtime version routing conventions.
- [x] Define root commands that must remain stable for the whole project: `dev`, `build`, `lint`, `typecheck`, `test`.

### Files changed

- `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json` - added the root workspace manifest, package discovery, Turborepo task graph, and shared TypeScript defaults.
- `workspace.config.json`, `.env.example` - locked the Phase 1 conventions for ports, env variables, dynamic frontend route version inputs, and dynamic backend API version inputs (no hardcoded production basenames).
- `scripts/placeholder-task.mjs` - added a shared placeholder runner so every workspace already exposes stable `dev`, `build`, `lint`, `typecheck`, and `test` scripts.
- `templates/fsd-app/README.md`, `templates/fsd-app/tsconfig.template.json` - added the reusable FSD template with the agreed folder layers and local path alias mappings.
- `apps/shell/package.json`, `apps/sales/package.json`, `apps/crm/package.json`, `apps/fms/package.json`, `apps/admin/package.json` - created empty frontend workspace manifests with fixed dev ports and placeholder scripts; production route versioning is runtime-resolved.
- `apps/api-mock/package.json` - created the empty API workspace manifest with the reserved mock API port and `/api` base path.
- `packages/ui-kit/package.json`, `packages/search-engine/package.json`, `packages/contracts/package.json` - created shared package manifests so the monorepo topology is fully declared from Phase 1.
- `packages/ui-kit/src/index.ts`, `packages/search-engine/src/index.ts`, `packages/contracts/src/index.ts` - added placeholder entry points to anchor the shared package aliases declared in the root TypeScript config.
- Local directories under `apps/*/src/{app,pages,widgets,features,entities,shared}` and `apps/api-mock/src`, plus `packages/*/src` - created the empty workspace structure without starting any Phase 2 implementation.

## 2. Phase 2 - Shared Platform

- [x] Build `packages/ui-kit` with Tailwind v4 tokens, layout primitives, tables, cards, metric widgets, auth controls, and shared chrome matching the screenshots.
- [x] Build `packages/contracts` with `zod` schemas and TypeScript types shared by API and apps.
- [x] Build `packages/search-engine` with command palette shell, search result groups, and app registration hooks.
- [x] Add shared provider setup for theme, query client, session state, and command palette state.

### Files changed

- `packages/contracts/package.json` - replaced placeholder scripts with real TypeScript checks and added the `zod` runtime dependency.
- `packages/contracts/tsconfig.json` - added package-level TypeScript configuration extending the monorepo base config.
- `packages/contracts/src/index.ts` - implemented shared `zod` schemas and exported TypeScript contracts for auth, navigation, dashboard, sales, CRM, FMS, admin, and search payloads.
- `packages/search-engine/package.json` - replaced placeholder scripts with real TypeScript checks and added React dependencies for provider/shell implementation.
- `packages/search-engine/tsconfig.json` - added package-level TypeScript configuration for the search engine package.
- `packages/search-engine/src/types.ts` - added command palette item, source registry, grouping, and provider API interfaces.
- `packages/search-engine/src/provider.tsx` - implemented `SearchProvider` with source registry management, `Ctrl/Cmd+K` shortcut handling, grouped async search execution, and command palette state.
- `packages/search-engine/src/hooks.ts` - added app-facing hooks for command palette access and source registration.
- `packages/search-engine/src/components/command-palette-shell.tsx` - added a reusable command palette shell UI with grouped results and keyboard navigation.
- `packages/search-engine/src/index.ts` - exported the package public API (`SearchProvider`, hooks, shell component, and registry types).
- `packages/ui-kit/package.json` - replaced placeholder scripts with real TypeScript checks and added package dependencies (`react-query`, `zustand`, `react-table`, Tailwind v4, and workspace package links).
- `packages/ui-kit/tsconfig.json` - added package-level TypeScript configuration for UI kit source files.
- `packages/ui-kit/src/styles/tokens.css` - added Tailwind v4 theme tokens, brand palette, typography tokens, and shared control/card style classes.
- `packages/ui-kit/src/lib/cn.ts` - added a shared class name merge helper used by UI primitives.
- `packages/ui-kit/src/components/auth-panel.tsx` - implemented the shared login/auth form panel with loading and error states.
- `packages/ui-kit/src/components/shell-chrome.tsx` - implemented top shell bar, side rail, and shell layout primitives for cross-app chrome.
- `packages/ui-kit/src/components/data-grid.tsx` - implemented a generic table primitive on top of `@tanstack/react-table` with sorting and empty/loading states.
- `packages/ui-kit/src/components/metric-cards.tsx` - implemented standard KPI cards and ring-progress metric cards.
- `packages/ui-kit/src/components/search-input.tsx` - implemented shared search input with hotkey hint affordance.
- `packages/ui-kit/src/components/status-badge.tsx` - implemented shared status badge and status dot primitives for table/card statuses.
- `packages/ui-kit/src/components/map-panel.tsx` - implemented a map panel surface with marker plotting and selected marker emphasis.
- `packages/ui-kit/src/components/command-palette.tsx` - implemented a shared command palette UI component with grouped results.
- `packages/ui-kit/src/components/surface-card.tsx` - implemented a lightweight shared card/layout surface primitive.
- `packages/ui-kit/src/providers/theme-provider.tsx` - implemented shared theme state management (`light`/`dark`/`system`) with DOM theme syncing.
- `packages/ui-kit/src/providers/session-provider.tsx` - implemented shared `zustand` session store provider/hook setup backed by contracts.
- `packages/ui-kit/src/providers/platform-providers.tsx` - implemented the combined provider stack for theme, query client, session state, and command palette state.
- `packages/ui-kit/src/index.ts` - exported the new UI kit primitives, provider APIs, and command palette hooks.
- `pnpm-lock.yaml` - updated lockfile for new Phase 2 dependencies across shared packages.

## 3. Phase 3 - Mock API

- [x] Scaffold `apps/api-mock` with version-aware routers, CORS, seeded fixture modules, and a single runtime API base URL resolver consumed by all apps.
- [x] Implement the auth, navigation, dashboard, search, Sales, CRM, FMS, and Admin endpoints listed above.
- [x] Ensure auth/profile payload includes `frontend_version`, `latest_frontend_version`, `backend_version`, and `latest_backend_version` for runtime URL/base-URL resolution and fallback-to-latest behavior.
- [x] Add stable list-query parsing for grid screens and typed client wrappers in the frontend layer, with backend calls routed through runtime `backend_version` base URL resolution.
- [x] Add smoke tests that prove endpoint payloads conform to shared contracts.

### Files changed

- `apps/api-mock/package.json` - replaced placeholder scripts with real API scripts (`dev`, `typecheck`, `test`) and added Express/CORS/contracts dependencies.
- `apps/api-mock/tsconfig.json` - added API workspace TypeScript config for Node-targeted server/test code.
- `apps/api-mock/src/config.ts` - added runtime API port/origin and deployed/latest frontend/backend version constants.
- `apps/api-mock/src/app.ts` - added Express app bootstrap with JSON parsing, CORS, health route, and version-aware API mounts.
- `apps/api-mock/src/server.ts` - added executable server entrypoint for local mock API runtime.
- `apps/api-mock/src/types/express.d.ts` - added request typings for auth session/token and backend version resolution context.
- `apps/api-mock/src/middleware/auth.ts` - added bearer-token authentication guard for protected endpoints.
- `apps/api-mock/src/middleware/version-context.ts` - added backend-version resolution headers/context with fallback-to-latest behavior.
- `apps/api-mock/src/services/session-store.ts` - added in-memory token issuance/revocation for mock auth sessions.
- `apps/api-mock/src/services/endpoints.ts` - centralized endpoint payload builders used by routers and smoke tests.
- `apps/api-mock/src/routes/router.ts` - implemented all planned Phase 3 routes across auth, navigation, notifications, search, dashboard, sales, CRM, FMS, and admin.
- `apps/api-mock/src/lib/list-query.ts` - implemented stable list query parsing for sales/CRM/fleet filters and pagination/sort fields.
- `apps/api-mock/src/lib/paginate.ts` - added shared pagination utility for list endpoints.
- `apps/api-mock/src/lib/sort.ts` - added stable sortable-field parser and typed collection sorting helper.
- `apps/api-mock/src/lib/search.ts` - added grouped command/search result builder across navigation and domain fixtures.
- `apps/api-mock/src/fixtures/users.ts` - added seeded users and auth-profile payloads with frontend/backend version metadata.
- `apps/api-mock/src/fixtures/navigation.ts` - added seeded module navigation payloads with enabled/coming-soon states.
- `apps/api-mock/src/fixtures/notifications.ts` - added seeded notification feed payloads.
- `apps/api-mock/src/fixtures/dashboard.ts` - added seeded shell dashboard summary payload.
- `apps/api-mock/src/fixtures/sales.ts` - added seeded sales order dataset for list/detail endpoints.
- `apps/api-mock/src/fixtures/crm.ts` - added seeded CRM companies dataset for list/detail endpoints.
- `apps/api-mock/src/fixtures/fms.ts` - added seeded fleet vehicles and derived map marker dataset.
- `apps/api-mock/src/fixtures/admin.ts` - added seeded admin overview metrics payload.
- `apps/api-mock/src/smoke.test.ts` - added smoke tests validating endpoint payload builders and runtime fallback behavior against shared contracts.
- `packages/contracts/src/index.ts` - extended shared contracts with backend version fields in auth sessions plus list response schemas used by API/client.
- `packages/contracts/src/runtime-api.ts` - added single runtime backend base URL resolver with fallback logic and versioned origin output.
- `packages/contracts/src/list-query.ts` - added shared list-query parser/builder utilities for API routes and frontend clients.
- `packages/contracts/src/client.ts` - added typed runtime API client wrappers for all Phase 3 endpoints with contract-validated responses.
- `packages/contracts/package.json` - exposed `client`, `runtime-api`, and `list-query` subpath exports for app/API consumption.
- `apps/shell/src/shared/api/client.ts` - added shell-side typed API wrapper wired to runtime backend version resolution.
- `apps/sales/src/shared/api/client.ts` - added sales-side typed API wrapper wired to runtime backend version resolution.
- `apps/crm/src/shared/api/client.ts` - added CRM-side typed API wrapper wired to runtime backend version resolution.
- `apps/fms/src/shared/api/client.ts` - added FMS-side typed API wrapper wired to runtime backend version resolution.
- `apps/admin/src/shared/api/client.ts` - added admin-side typed API wrapper wired to runtime backend version resolution.
- `apps/shell/package.json`, `apps/sales/package.json`, `apps/crm/package.json`, `apps/fms/package.json`, `apps/admin/package.json` - added `@naiton/contracts` workspace dependency to support typed frontend API wrappers.
- `tsconfig.base.json` - added path aliases for package subpath imports (`@naiton/contracts/*`, etc.) used by new shared runtime/client modules.
- `pnpm-lock.yaml` - updated lockfile for new Phase 3 API/runtime dependencies.

## 4. Phase 4 - Shell App

- [ ] Build the login screen with close-match layout, brand treatment, language selector, cookie settings stub, and terms/privacy links.
- [ ] Implement login, logout, session restore, permission loading, and guarded navigation against the mock API.
- [ ] After login/session restore, resolve `{semver}` from `frontend_version` and redirect to `app.naiton.com/{semver}/shell`.
- [ ] After login/session restore, resolve backend API base URL semver from `backend_version` and initialize typed API clients with that runtime base URL.
- [ ] Build host-aware nav routing from shell to module subdomains using the same resolved `{semver}` path segment.
- [ ] If requested version is unavailable, fallback to `latest_frontend_version` before redirecting.
- [ ] If requested backend API version is unavailable, fallback API base URL resolution to `latest_backend_version` before loading protected data.
- [ ] Build the post-login home dashboard with the shared top nav, search bar, notifications/settings/profile controls, charts, and activity panel from the screenshots.
- [ ] Make the shell the launch point for all other apps and keep disabled modules visibly present but non-navigable.

## 5. Phase 5 - Sales App

- [ ] Build the Sales orders screen with left module rail, shared top nav, search/filter strip, orders data grid, status icons, and primary CTA.
- [ ] Reuse `ui-kit` table primitives so rows, sorting, and toolbar controls behave consistently with CRM.
- [ ] Reserve route space for future Sales subsections while populating only the supplied Orders screen in MVP.
- [ ] Wire search, sort, page size, and mock filters to the typed orders client.

## 6. Phase 6 - CRM App

- [ ] Build the Companies screen with left rail, search/filter toolbar, dense enterprise table, and `New company` action.
- [ ] Map all visible columns to stable contract fields, including relations, account manager, tax number, and geography/business labels.
- [ ] Keep toolbar behavior aligned with Sales through shared components and shared query conventions.
- [ ] Preserve the screenshot navigation model even where labels are placeholders pending later product naming.

## 7. Phase 7 - FMS App

- [ ] Build the fleet screen with searchable left vehicle list, status markers, telemetry snippets, and a full-height map canvas.
- [ ] Use Leaflet with OpenStreetMap tiles, clustered mock markers, and selection sync between the list and the map.
- [ ] Reproduce the screenshot control layout for zoom/layers/actions with simplified MVP behavior.
- [ ] Add a lightweight refresh simulation so vehicle status and positions can change without introducing real-time infrastructure.

## 8. Phase 8 - Admin App And Finish Pass

- [ ] Build the Admin dashboard with the vertical settings rail, metric ring cards, progress bars, and responsive card layout from the screenshot.
- [ ] Connect Admin metrics to the typed overview endpoint and reuse shared chart/card primitives from the shell.
- [ ] Finish cross-app polish: global command palette, loading/empty/error states, toasts, direct-link refresh handling, and responsive cleanup.
- [ ] Add CI-ready checks for `lint`, `typecheck`, `test`, and `build`, plus short contributor docs for ports, commands, and phase handoff rules.

## Test Plan

- [ ] Valid login lands on `app.naiton.com/{frontend_version}/shell`; invalid login shows an inline error; logout returns to the login screen.
- [ ] Shell-to-module navigation preserves the same resolved `{frontend_version}` across subdomains.
- [ ] If `frontend_version` is not deployed, shell redirects to `/{latest_frontend_version}/...` target route.
- [ ] Authenticated API calls resolve against `/{backend_version}/api/...` (versioned backend base URL + stable endpoint paths).
- [ ] If `backend_version` is not deployed, API client falls back to `/{latest_backend_version}/api/...` without breaking app initialization.
- [ ] Direct browser refresh works on every versioned app route across shell and module hosts without breaking client-side navigation.
- [ ] Sales and CRM tables support search, sorting, page size changes, and stable mock filtering.
- [ ] FMS vehicle selection updates both the list state and the highlighted map marker.
- [ ] Admin and shell dashboards render mock metrics without layout breakage at common desktop and tablet widths.
- [ ] Root `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` work through Turborepo.

## Assumptions And Defaults

- The repo starts empty and no existing code or design system must be preserved.
- The supplied screenshots define the visual direction; close-match fidelity is preferred over pixel-perfect reproduction.
- English is the only required locale for MVP; the language selector can remain mostly static.
- Auth is mock-only for MVP and uses a seeded role/permission matrix returned by the API.
- Shell host is `app.naiton.com`; module hosts are `sales|crm|fms|admin.naiton.com`.
- Version sources are `frontend_version` (frontend routing) and `backend_version` (API base URL) returned by auth/profile per user session.
- If requested versions are unavailable, frontend routing falls back to `latest_frontend_version` and API base URL resolution falls back to `latest_backend_version`.
- Deployment serves static bundles by semantic-version path folders so CDN can resolve `/{semver}/...` routes.
- Unimplemented modules stay visible as placeholders rather than being hidden, because the screenshots establish that navigation surface.
