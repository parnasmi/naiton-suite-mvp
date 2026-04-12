# Naiton Monorepo MVP Plan

## Summary

- Goal: build a clean-slate Turborepo MVP that reproduces the supplied Naiton login, shell, Sales, CRM, FMS, and Admin screens with close visual fidelity and future-ready mock contracts.
- Deliverables: `apps/shell`, `apps/sales`, `apps/crm`, `apps/fms`, `apps/admin`, `apps/api-mock`; `packages/ui-kit`, `packages/search-engine`, `packages/contracts`.
- Development model: each numbered phase should be executable as a standalone fresh conversation and end in a runnable slice.

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
- Versioned basenames are fixed to `/v1.0.0/shell`, `/v1.0.0/sales`, `/v1.0.0/crm`, `/v1.0.0/fms`, `/v1.0.0/admin`.
- Dev ports are fixed to `3000` shell, `3001` sales, `3002` crm, `3003` fms, `3004` admin, `4000` api-mock.
- `packages/ui-kit` owns brand tokens, Tailwind theme, shell chrome, table/card/form primitives, and shared empty/loading/error states.
- `packages/search-engine` owns the global command palette and is opened with `Ctrl/Cmd+K` instead of `Ctrl+Q` to avoid OS/browser conflicts.
- Top-nav modules not implemented in MVP (`WMS`, `Procurement`, `Production`, `Accounting`, `HRM`, `CMS`) remain visible as disabled or `Coming soon` links.
- All frontend data access goes through typed clients built from `packages/contracts`; pages/widgets do not call `fetch` directly.

## API Endpoints

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
- `packages/ui-kit` exports `AuthPanel`, `TopShellBar`, `SideRail`, `DataGrid`, `MetricCard`, `MetricRingCard`, `SearchInput`, `CommandPalette`, `MapPanel`, and shared status badges/icons.
- `packages/search-engine` exports `SearchProvider`, `useCommandPalette`, and a registry interface for app-level search sources.

## 1. Phase 1 - Workspace Foundation

- [ ] Initialize root workspace files, shared scripts, TypeScript base config, and Turborepo pipelines.
- [ ] Create empty app/package manifests and a reusable FSD folder template for every frontend app.
- [ ] Lock environment conventions for ports, env vars, path aliases, and versioned route basenames.
- [ ] Define root commands that must remain stable for the whole project: `dev`, `build`, `lint`, `typecheck`, `test`.

## 2. Phase 2 - Shared Platform

- [ ] Build `packages/ui-kit` with Tailwind v4 tokens, layout primitives, tables, cards, metric widgets, auth controls, and shared chrome matching the screenshots.
- [ ] Build `packages/contracts` with `zod` schemas and TypeScript types shared by API and apps.
- [ ] Build `packages/search-engine` with command palette shell, search result groups, and app registration hooks.
- [ ] Add shared provider setup for theme, query client, session state, and command palette state.

## 3. Phase 3 - Mock API

- [ ] Scaffold `apps/api-mock` with versioned routers, CORS, seeded fixture modules, and a single base URL consumed by all apps.
- [ ] Implement the auth, navigation, dashboard, search, Sales, CRM, FMS, and Admin endpoints listed above.
- [ ] Add stable list-query parsing for grid screens and typed client wrappers in the frontend layer.
- [ ] Add smoke tests that prove endpoint payloads conform to shared contracts.

## 4. Phase 4 - Shell App

- [ ] Build the login screen with close-match layout, brand treatment, language selector, cookie settings stub, and terms/privacy links.
- [ ] Implement login, logout, session restore, permission loading, and guarded navigation against the mock API.
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

- [ ] Valid login lands on `/v1.0.0/shell`; invalid login shows an inline error; logout returns to the login screen.
- [ ] Direct browser refresh works on every versioned app route without breaking client-side navigation.
- [ ] Sales and CRM tables support search, sorting, page size changes, and stable mock filtering.
- [ ] FMS vehicle selection updates both the list state and the highlighted map marker.
- [ ] Admin and shell dashboards render mock metrics without layout breakage at common desktop and tablet widths.
- [ ] Root `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` work through Turborepo.

## Assumptions And Defaults

- The repo starts empty and no existing code or design system must be preserved.
- The supplied screenshots define the visual direction; close-match fidelity is preferred over pixel-perfect reproduction.
- English is the only required locale for MVP; the language selector can remain mostly static.
- Auth is mock-only for MVP and uses a seeded role/permission matrix returned by the API.
- Unimplemented modules stay visible as placeholders rather than being hidden, because the screenshots establish that navigation surface.
