import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AuthSession, NavModuleKey } from "@naiton/contracts";
import { MetricCard, MetricRingCard, SearchInput, SurfaceCard, useToast } from "@naiton/ui-kit";

import { type createAdminApiClient } from "../shared/api/client";

export type AdminSection = "overview" | "users" | "roles" | "integrations" | "audit";

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
}

const sectionTitles: Record<AdminSection, string> = {
  overview: "Overview",
  users: "Users (name TBD)",
  roles: "Roles (name TBD)",
  integrations: "Integrations (name TBD)",
  audit: "Audit log (name TBD)"
};

const moduleLabels: Record<NavModuleKey, string> = {
  shell: "Shell",
  sales: "Sales",
  crm: "CRM",
  fms: "FMS",
  admin: "Admin",
  wms: "WMS",
  procurement: "Procurement",
  production: "Production",
  accounting: "Accounting",
  hrm: "HRM",
  cms: "CMS"
};

const formatPercentage = (value: number): string => `${value.toFixed(2)}%`;

const formatDateTime = (value: string): string => {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(value));
};

function ProgressBar({ value, tone = "brand" }: { value: number; tone?: "brand" | "warning" | "danger" }) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="admin-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamped}>
      <span
        className={`admin-progress-fill is-${tone}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function ReservedSection({ section }: { section: AdminSection }) {
  return (
    <section className="admin-surface">
      <h2>{sectionTitles[section]}</h2>
      <p>
        Navigation slot is intentionally preserved for the screenshot structure. This section remains a placeholder in MVP.
      </p>
    </section>
  );
}

function OverviewSection({
  apiClient,
  backendVersion
}: {
  apiClient: ReturnType<typeof createAdminApiClient>;
  backendVersion: string;
}) {
  const { pushToast } = useToast();
  const lastOverviewErrorRef = useRef<string | null>(null);

  const overviewQuery = useQuery({
    queryKey: ["admin", "overview", backendVersion],
    queryFn: () => apiClient.getAdminOverview()
  });

  const overview = overviewQuery.data;

  const totals = useMemo(() => {
    const totalUsers = overview?.total_users ?? 0;
    const activeUsers = overview?.active_users ?? 0;
    const activePercent = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    const avgUptime =
      overview && overview.module_health.length > 0
        ? overview.module_health.reduce((sum, item) => sum + item.uptime_percent, 0) / overview.module_health.length
        : 0;

    const incidentsOpen = overview?.module_health.reduce((sum, item) => sum + item.incidents_open, 0) ?? 0;

    return {
      totalUsers,
      activeUsers,
      activePercent,
      avgUptime,
      incidentsOpen
    };
  }, [overview]);

  const overviewErrorMessage = overviewQuery.error instanceof Error ? overviewQuery.error.message : null;

  useEffect(() => {
    if (!overviewErrorMessage || overviewErrorMessage === lastOverviewErrorRef.current) {
      return;
    }

    lastOverviewErrorRef.current = overviewErrorMessage;
    pushToast({
      tone: "error",
      title: "Admin overview failed",
      description: overviewErrorMessage,
      durationMs: 4200
    });
  }, [overviewErrorMessage, pushToast]);

  if (overviewQuery.error) {
    const message = overviewErrorMessage ?? "Failed to load Admin overview";

    return (
      <section className="admin-surface">
        <h2>Overview</h2>
        <p className="admin-error">{message}</p>
      </section>
    );
  }

  return (
    <section className="admin-surface admin-overview-surface">
      <div className="admin-overview-header">
        <h1>Administration</h1>
        <p>
          Last deployment {overview ? formatDateTime(overview.latest_deployment.date) : "..."}
          {overview ? ` (v${overview.latest_deployment.version})` : ""}
        </p>
      </div>

      <div className="admin-metrics-grid">
        <MetricRingCard
          label="Active users"
          value={`${totals.activeUsers} / ${totals.totalUsers}`}
          progressPercent={totals.activePercent}
          tone="success"
          helperText="Current signed-in activity"
        />
        <MetricRingCard
          label="Average uptime"
          value={formatPercentage(totals.avgUptime)}
          progressPercent={totals.avgUptime}
          tone={totals.avgUptime >= 99.5 ? "success" : "warning"}
          helperText="Across shell, Sales, CRM, FMS, and Admin"
        />
        <MetricCard
          label="Open incidents"
          value={totals.incidentsOpen}
          trendPercent={totals.incidentsOpen > 0 ? -5.2 : 0}
          helperText="Raised by module health monitors"
        />
      </div>

      <div className="admin-dashboard-grid">
        <SurfaceCard style={{ minHeight: "265px", display: "grid", gap: "0.7rem" }}>
          <h3 className="admin-card-title">Roles distribution</h3>

          {overviewQuery.isLoading ? <p className="admin-muted">Loading role breakdown...</p> : null}

          {!overviewQuery.isLoading && (overview?.roles_breakdown.length ?? 0) === 0 ? (
            <p className="admin-muted">No role data available.</p>
          ) : null}

          <ul className="admin-list">
            {(overview?.roles_breakdown ?? []).map((role) => {
              const share = totals.totalUsers > 0 ? (role.count / totals.totalUsers) * 100 : 0;
              return (
                <li key={role.role}>
                  <div className="admin-list-head">
                    <strong>{role.role}</strong>
                    <span>{role.count}</span>
                  </div>
                  <ProgressBar value={share} tone="brand" />
                </li>
              );
            })}
          </ul>
        </SurfaceCard>

        <SurfaceCard style={{ minHeight: "265px", display: "grid", gap: "0.7rem" }}>
          <h3 className="admin-card-title">Module health</h3>

          {overviewQuery.isLoading ? <p className="admin-muted">Loading module health...</p> : null}

          {!overviewQuery.isLoading && (overview?.module_health.length ?? 0) === 0 ? (
            <p className="admin-muted">No module health records.</p>
          ) : null}

          <ul className="admin-list">
            {(overview?.module_health ?? []).map((module) => {
              const tone: "brand" | "warning" | "danger" =
                module.incidents_open > 0 ? "danger" : module.uptime_percent < 99.5 ? "warning" : "brand";

              return (
                <li key={module.module}>
                  <div className="admin-list-head">
                    <strong>{moduleLabels[module.module]}</strong>
                    <span>
                      {formatPercentage(module.uptime_percent)}
                      {module.incidents_open > 0 ? ` • ${module.incidents_open} incidents` : ""}
                    </span>
                  </div>
                  <ProgressBar value={module.uptime_percent} tone={tone} />
                </li>
              );
            })}
          </ul>
        </SurfaceCard>

        <SurfaceCard style={{ minHeight: "265px", display: "grid", gap: "0.7rem" }}>
          <h3 className="admin-card-title">Operational checklist</h3>
          <ul className="admin-checks">
            <li>
              <span className="is-done">OK</span>
              <p>Role and permission matrix synchronized.</p>
            </li>
            <li>
              <span className={totals.incidentsOpen > 0 ? "is-alert" : "is-done"}>
                {totals.incidentsOpen > 0 ? "Alert" : "OK"}
              </span>
              <p>Module incidents reviewed for this release window.</p>
            </li>
            <li>
              <span className="is-done">OK</span>
              <p>Versioned routing and backend semver fallback remain healthy.</p>
            </li>
          </ul>
        </SurfaceCard>
      </div>
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
  backendVersion
}: AdminPageProps) {
  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <a className="admin-brand" href={`/${frontendVersion}/`}>
          <span className="admin-brand-mark">N6</span>
          <span>
            <strong>Naiton</strong>
            <small>Business Suite</small>
          </span>
        </a>

        <div className="admin-top-search">
          <SearchInput readOnly value="" placeholder="Search Naiton" hotkeyHint="" />
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
          <button type="button" className="admin-icon-button" title="Workspace">
            []
          </button>
          <button type="button" className="admin-icon-button" title="Share">
            S
          </button>
          <button type="button" className="admin-icon-button" title="Help">
            ?
          </button>
          <button type="button" className="admin-icon-button" title="Notifications">
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
        <aside className="admin-settings-rail">
          <a href={`/${frontendVersion}/overview`} className={section === "overview" ? "is-active" : undefined}>
            Overview
          </a>
          <a href={`/${frontendVersion}/users`} className={section === "users" ? "is-active" : undefined}>
            Users
          </a>
          <a href={`/${frontendVersion}/roles`} className={section === "roles" ? "is-active" : undefined}>
            Roles
          </a>
          <a
            href={`/${frontendVersion}/integrations`}
            className={section === "integrations" ? "is-active" : undefined}
          >
            Integrations
          </a>
          <a href={`/${frontendVersion}/audit`} className={section === "audit" ? "is-active" : undefined}>
            Audit log
          </a>
        </aside>

        <main className="admin-main">
          {section === "overview" ? (
            <OverviewSection apiClient={apiClient} backendVersion={backendVersion} />
          ) : (
            <ReservedSection section={section} />
          )}
        </main>
      </div>
    </div>
  );
}
