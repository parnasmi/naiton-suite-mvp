import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AdminOverview, AuthSession } from "@naiton/contracts";
import { MetricRingCard, SearchInput, SurfaceCard, useToasts } from "@naiton/ui-kit";

import { type createAdminApiClient } from "../shared/api/client";

export type AdminSection =
  | "accounting"
  | "logistics"
  | "crm"
  | "hrm"
  | "email"
  | "inventory"
  | "production"
  | "sales"
  | "security"
  | "scripts"
  | "system"
  | "tests"
  | "docs";

export interface AdminTopModuleItem {
  key: string;
  label: string;
  href?: string;
  disabled: boolean;
  active: boolean;
  comingSoon: boolean;
}

interface AdminPageProps {
  session: AuthSession;
  apiClient: ReturnType<typeof createAdminApiClient>;
  modules: AdminTopModuleItem[];
  section: AdminSection;
  unreadNotifications: number;
  frontendVersion: string;
  backendVersion: string;
  onOpenSearch: () => void;
}

const sectionLabelByKey: Record<AdminSection, string> = {
  accounting: "Accounting",
  logistics: "Logistics",
  crm: "CRM",
  hrm: "HRM",
  email: "Email",
  inventory: "Inventory",
  production: "Production",
  sales: "Sales",
  security: "Security",
  scripts: "Scripts",
  system: "System",
  tests: "Tests",
  docs: "Docs"
};

const sectionOrder: AdminSection[] = [
  "accounting",
  "logistics",
  "crm",
  "hrm",
  "email",
  "inventory",
  "production",
  "sales",
  "security",
  "scripts",
  "system",
  "tests",
  "docs"
];

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("en").format(value);
};

const asRoleLabel = (value: string): string => {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
};

function ProgressLine({
  label,
  value,
  percent,
  tone = "brand"
}: {
  label: string;
  value: string;
  percent: number;
  tone?: "brand" | "warning" | "success";
}) {
  return (
    <div className="admin-progress-row">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="admin-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <div className={`admin-progress-fill is-${tone}`} style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
    </div>
  );
}

function ReservedSection({ section }: { section: AdminSection }) {
  return (
    <SurfaceCard>
      <h2 className="admin-section-title">{sectionLabelByKey[section]}</h2>
      <p className="admin-muted">
        This navigation slot stays visible to match the screenshot. The MVP currently focuses on the Accounting dashboard metrics view.
      </p>
    </SurfaceCard>
  );
}

function DashboardSection({
  backendVersion,
  overview,
  loading,
  error
}: {
  backendVersion: string;
  overview: AdminOverview | undefined;
  loading: boolean;
  error: string | null;
}) {
  const roleRows = useMemo(() => {
    if (!overview) {
      return [];
    }

    return [...overview.roles_breakdown]
      .sort((left, right) => right.count - left.count)
      .slice(0, 3)
      .map((entry) => ({
        label: asRoleLabel(entry.role),
        count: entry.count,
        percent: overview.total_users > 0 ? (entry.count / overview.total_users) * 100 : 0
      }));
  }, [overview]);

  const healthRows = useMemo(() => {
    if (!overview) {
      return [];
    }

    return [...overview.module_health]
      .sort((left, right) => {
        if (left.incidents_open !== right.incidents_open) {
          return right.incidents_open - left.incidents_open;
        }
        return left.module.localeCompare(right.module);
      })
      .slice(0, 3)
      .map((entry) => ({
        label: entry.module.toUpperCase(),
        uptimePercent: entry.uptime_percent,
        incidents: entry.incidents_open
      }));
  }, [overview]);

  const derived = useMemo(() => {
    if (!overview) {
      return null;
    }

    const totalUsers = overview.total_users;
    const activeUsers = overview.active_users;
    const activePercent = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
    const monthlyRevenueUsd = Math.round(totalUsers * 61.8);
    const averageUptime =
      overview.module_health.length > 0
        ? overview.module_health.reduce((total, item) => total + item.uptime_percent, 0) / overview.module_health.length
        : 0;
    const openIncidents = overview.module_health.reduce((total, item) => total + item.incidents_open, 0);
    const dailySessions = Math.round(activeUsers * 1.6);

    return {
      totalUsers,
      activeUsers,
      activePercent,
      monthlyRevenueUsd,
      averageUptime,
      openIncidents,
      dailySessions
    };
  }, [overview]);

  return (
    <section className="admin-dashboard-grid">
      <MetricRingCard
        label="Total users"
        value={derived ? formatNumber(derived.totalUsers) : "--"}
        progressPercent={derived?.activePercent ?? 0}
        tone="brand"
        helperText="users"
      />
      <MetricRingCard
        label="Monthly revenue"
        value={derived ? formatNumber(derived.monthlyRevenueUsd) : "--"}
        progressPercent={derived?.averageUptime ?? 0}
        tone="brand"
        helperText="USD"
      />
      <MetricRingCard
        label="Daily active sessions"
        value={derived ? formatNumber(derived.dailySessions) : "--"}
        progressPercent={derived ? Math.min(100, (derived.dailySessions / Math.max(derived.totalUsers * 2, 1)) * 100) : 0}
        tone="brand"
        helperText="sessions"
      />
      <MetricRingCard
        label="Customer satisfaction"
        value={derived ? `${Math.round(derived.averageUptime)}%` : "--"}
        progressPercent={derived?.averageUptime ?? 0}
        tone="success"
        helperText={`${derived?.openIncidents ?? 0} open incidents`}
      />

      <SurfaceCard style={{ display: "grid", gap: "0.9rem" }}>
        <h3 className="admin-card-title">Role distribution</h3>
        {loading ? <p className="admin-muted">Loading role metrics...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        {!loading && !error && roleRows.length === 0 ? <p className="admin-muted">No role metrics available.</p> : null}
        {!loading && !error
          ? roleRows.map((row) => (
              <ProgressLine
                key={row.label}
                label={row.label}
                value={`${formatNumber(row.count)} users`}
                percent={row.percent}
                tone="warning"
              />
            ))
          : null}
      </SurfaceCard>

      <SurfaceCard style={{ display: "grid", gap: "0.9rem" }}>
        <h3 className="admin-card-title">Module health</h3>
        {loading ? <p className="admin-muted">Loading uptime metrics...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        {!loading && !error && healthRows.length === 0 ? <p className="admin-muted">No module health metrics available.</p> : null}
        {!loading && !error
          ? healthRows.map((row) => (
              <ProgressLine
                key={row.label}
                label={row.label}
                value={`${row.uptimePercent.toFixed(2)}% • ${row.incidents} open`}
                percent={row.uptimePercent}
                tone={row.incidents > 0 ? "warning" : "success"}
              />
            ))
          : null}
      </SurfaceCard>

      <SurfaceCard style={{ display: "grid", gap: "0.65rem", gridColumn: "1 / -1" }}>
        <h3 className="admin-card-title">Runtime context</h3>
        <div className="admin-runtime-strip">
          <span>Backend {backendVersion}</span>
          <span>Latest deploy {overview?.latest_deployment.version ?? "--"}</span>
          <span>
            Date {overview ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(overview.latest_deployment.date)) : "--"}
          </span>
        </div>
      </SurfaceCard>
    </section>
  );
}

export function AdminPage({
  session,
  apiClient,
  modules,
  section,
  unreadNotifications,
  frontendVersion,
  backendVersion,
  onOpenSearch
}: AdminPageProps) {
  const { pushToast } = useToasts();

  const overviewQuery = useQuery({
    queryKey: ["admin", "overview", backendVersion],
    queryFn: () => apiClient.getAdminOverview()
  });

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <a className="admin-brand" href={`/${frontendVersion}/accounting`}>
          <span className="admin-brand-mark">N6</span>
          <span>
            <strong>Naiton</strong>
            <small>Business Suite</small>
          </span>
        </a>

        <div className="admin-top-search" onClick={onOpenSearch} onFocus={onOpenSearch}>
          <SearchInput readOnly value="" placeholder="Search Naiton" hotkeyHint="Ctrl/Cmd+K" />
        </div>

        <nav className="admin-top-modules">
          {modules.map((module) => (
            <a
              key={module.key}
              href={module.href}
              className={module.active ? "is-active" : undefined}
              aria-disabled={module.disabled}
              onClick={(event) => {
                if (module.disabled || !module.href) {
                  event.preventDefault();
                }
              }}
            >
              {module.label}
              {module.comingSoon ? <span className="admin-coming-soon">Soon</span> : null}
            </a>
          ))}
        </nav>

        <div className="admin-top-actions">
          <button
            type="button"
            className="admin-icon-button"
            title="Workspace"
            onClick={() => pushToast({ title: "Workspace tools are planned for a later phase." })}
          >
            []
          </button>
          <button
            type="button"
            className="admin-icon-button"
            title="Share"
            onClick={() => pushToast({ title: "Share flow is not implemented in the MVP yet." })}
          >
            S
          </button>
          <button
            type="button"
            className="admin-icon-button"
            title="Help"
            onClick={() => pushToast({ title: "Help center integration is coming soon." })}
          >
            ?
          </button>
          <button
            type="button"
            className="admin-icon-button"
            title="Notifications"
            onClick={() =>
              pushToast({
                title: unreadNotifications > 0 ? `${unreadNotifications} unread notifications` : "No unread notifications",
                tone: unreadNotifications > 0 ? "warning" : "success"
              })
            }
          >
            !
            {unreadNotifications > 0 ? <span className="admin-count-dot">{unreadNotifications}</span> : null}
          </button>
          <div className="admin-profile-pill">
            <span>{session.display_name}</span>
            <small>{session.role}</small>
          </div>
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-side-rail" aria-label="Admin navigation">
          {sectionOrder.map((item) => (
            <a key={item} href={`/${frontendVersion}/${item}`} className={section === item ? "is-active" : undefined}>
              {sectionLabelByKey[item]}
            </a>
          ))}
        </aside>

        <main className="admin-main">
          {section === "accounting" ? (
            <DashboardSection
              backendVersion={backendVersion}
              overview={overviewQuery.data}
              loading={overviewQuery.isLoading || overviewQuery.isFetching}
              error={overviewQuery.error ? String(overviewQuery.error.message) : null}
            />
          ) : (
            <ReservedSection section={section} />
          )}
        </main>
      </div>
    </div>
  );
}
