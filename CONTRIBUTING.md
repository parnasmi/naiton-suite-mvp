# Contributing Guide

This repository is delivered in phase-based increments. Keep each contribution scoped, verifiable, and easy to hand off.

## Prerequisites

- Node.js `>= 22.15.0`
- pnpm `>= 9.15.1`

## Setup

```bash
pnpm install
cp .env.example .env
```

## Workspace Commands

Run from repo root:

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## App Ports

| Workspace | Port | Local URL |
|---|---:|---|
| `apps/shell` | 3000 | `http://localhost:3000` |
| `apps/sales` | 3001 | `http://localhost:3001` |
| `apps/crm` | 3002 | `http://localhost:3002` |
| `apps/fms` | 3003 | `http://localhost:3003` |
| `apps/admin` | 3004 | `http://localhost:3004` |
| `apps/api-mock` | 4000 | `http://localhost:4000` |

## Phase Handoff Rules

- Implement exactly one requested phase at a time.
- Do not start future phases unless explicitly requested.
- Update `plan.md` for the completed phase:
  - mark completed tasks with `[x]`
  - add/update the phase `Files changed` list
- Update `README.md` so current status and local-run instructions match the new phase.
- Leave the `Test Plan` checklist untouched unless explicitly asked to execute it.
- Prefer typed API clients from `@naiton/contracts/client`; do not call `fetch` directly from page/widget layers.

## CI Expectations

Pull requests should pass all root checks:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

A GitHub Actions workflow is provided at `.github/workflows/ci.yml`.
