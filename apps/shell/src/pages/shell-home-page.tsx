import { SearchInput, SurfaceCard, useToasts } from "@naiton/ui-kit";
import type { AuthSession, DashboardSummary } from "@naiton/contracts";

export interface ShellModuleNavItem {
  key: string;
  label: string;
  href?: string;
  disabled: boolean;
  active: boolean;
  comingSoon: boolean;
}

export interface ShellHomePageProps {
  session: AuthSession;
  modules: ShellModuleNavItem[];
  summary: DashboardSummary | undefined;
  isSummaryLoading: boolean;
  summaryError: string | null;
  unreadNotifications: number;
  onOpenSearch: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  hasDashboardAccess: boolean;
  frontendVersion: string;
  backendVersion: string;
  frontendFallback: boolean;
  backendFallback: boolean;
}

const formatTimestamp = (value: string): string => {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

function GraphCard({ title }: { title: string }) {
  return (
    <SurfaceCard style={{ height: "320px", display: "grid", gridTemplateRows: "auto 1fr", gap: "0.8rem" }}>
      <h3 className="dashboard-card-title">{title}</h3>
      <div className="chart-placeholder" aria-hidden>
        <div className="chart-grid" />
      </div>
    </SurfaceCard>
  );
}

export function ShellHomePage({
  session,
  modules,
  summary,
  isSummaryLoading,
  summaryError,
  unreadNotifications,
  onOpenSearch,
  onLogout,
  isLoggingOut,
  hasDashboardAccess,
  frontendVersion,
  backendVersion,
  frontendFallback,
  backendFallback
}: ShellHomePageProps) {
  const { pushToast } = useToasts();
  const activities = summary?.activity_feed ?? [];

  return (
    <div className="shell-page">
      <header className="shell-topbar">
        <a className="shell-brand" href={`/${frontendVersion}/shell`}>
          <span className="shell-brand-mark">N6</span>
          <span>
            <strong>Naiton</strong>
            <small>Business Suite</small>
          </span>
        </a>

        <div className="shell-search-wrap" onClick={onOpenSearch} onFocus={onOpenSearch}>
          <SearchInput readOnly value="" placeholder="Search Naiton" hotkeyHint="Ctrl/Cmd+K" />
        </div>

        <nav className="shell-modules">
          {modules.map((module) => {
            return (
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
                {module.comingSoon ? <span className="coming-soon">Soon</span> : null}
              </a>
            );
          })}
        </nav>

        <div className="shell-actions">
          <button
            type="button"
            className="action-button"
            title="Notifications"
            onClick={() =>
              pushToast({
                title: unreadNotifications > 0 ? `${unreadNotifications} unread notifications` : "No unread notifications",
                tone: unreadNotifications > 0 ? "warning" : "success"
              })
            }
          >
            Notifications
            {unreadNotifications > 0 ? <span className="badge-count">{unreadNotifications}</span> : null}
          </button>
          <button
            type="button"
            className="action-button"
            title="Settings"
            onClick={() =>
              pushToast({
                title: "Settings panel is not part of the MVP yet."
              })
            }
          >
            Settings
          </button>
          <div className="profile-pill">
            <span>{session.display_name}</span>
            <small>{session.role}</small>
          </div>
          <button type="button" className="logout-button" onClick={onLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </header>

      <main className="shell-dashboard">
        <div className="dashboard-header">
          <h1>Naiton</h1>
          <div className="version-strip">
            <span>Frontend {frontendVersion}</span>
            {frontendFallback ? <span className="fallback-tag">fallback</span> : null}
            <span>Backend {backendVersion}</span>
            {backendFallback ? <span className="fallback-tag">fallback</span> : null}
          </div>
        </div>

        {!hasDashboardAccess ? (
          <SurfaceCard>
            <h2 className="dashboard-card-title">Dashboard access is restricted</h2>
            <p className="dashboard-muted">
              Your account is authenticated, but missing the <code>dashboard:view</code> permission needed for this page.
            </p>
          </SurfaceCard>
        ) : null}

        {hasDashboardAccess ? (
          <div className="dashboard-grid">
            <GraphCard title="Sample graph" />
            <GraphCard title="Sample graph" />
            <GraphCard title="Sample graph" />
            <GraphCard title="Sample graph" />

            <SurfaceCard style={{ gridColumn: "3", gridRow: "1 / span 2", minHeight: "660px" }}>
              <h3 className="dashboard-card-title">Activity</h3>

              {isSummaryLoading ? <p className="dashboard-muted">Loading activity...</p> : null}
              {summaryError ? <p className="dashboard-error">{summaryError}</p> : null}

              {!isSummaryLoading && !summaryError ? (
                <ul className="activity-list">
                  {activities.length === 0 ? <li className="dashboard-muted">No recent activity.</li> : null}
                  {activities.map((item) => (
                    <li key={item.id}>
                      <p>{item.message}</p>
                      <time dateTime={item.timestamp}>{formatTimestamp(item.timestamp)}</time>
                    </li>
                  ))}
                </ul>
              ) : null}
            </SurfaceCard>
          </div>
        ) : null}
      </main>
    </div>
  );
}
