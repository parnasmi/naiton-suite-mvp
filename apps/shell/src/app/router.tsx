import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NavModule, NavModuleKey } from "@naiton/contracts";
import type { SearchSource } from "@naiton/search-engine";
import { useCommandPalette, useRegisterSearchSource } from "@naiton/ui-kit";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

import { LoginPage } from "../pages/login-page";
import { ShellHomePage, type ShellModuleNavItem } from "../pages/shell-home-page";
import { buildModuleHref } from "../shared/lib/navigation";
import { canAccessDashboard, canAccessModule } from "../shared/lib/permissions";
import { useShellRuntime } from "./runtime-provider";

const shellPathForVersion = (frontendVersion: string): string => `/${frontendVersion}/shell`;

const permissionByModule: Partial<Record<NavModuleKey, string>> = {
  shell: "dashboard:view",
  sales: "sales:read",
  crm: "crm:read",
  fms: "fms:read",
  admin: "admin:read"
};

const mapErrorToMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unexpected error";
};

function BusyState({ label }: { label: string }) {
  return (
    <div className="busy-state">
      <div className="busy-spinner" />
      <p>{label}</p>
    </div>
  );
}

function RootRoute() {
  const runtime = useShellRuntime();

  if (runtime.isBootstrapping || runtime.status === "loading") {
    return <BusyState label="Loading session..." />;
  }

  if (runtime.status === "authenticated" && runtime.resolvedFrontendVersion) {
    return <Navigate to={shellPathForVersion(runtime.resolvedFrontendVersion)} replace />;
  }

  return <Navigate to="/login" replace />;
}

function LoginRoute() {
  const runtime = useShellRuntime();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (runtime.isBootstrapping || runtime.status === "loading") {
    return <BusyState label="Restoring session..." />;
  }

  if (runtime.status === "authenticated" && runtime.resolvedFrontendVersion) {
    return <Navigate to={shellPathForVersion(runtime.resolvedFrontendVersion)} replace />;
  }

  return (
    <LoginPage
      isLoading={isSubmitting}
      errorMessage={errorMessage}
      onLogin={async ({ username, password }) => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
          await runtime.login({ username, password });
          navigate("/", { replace: true });
        } catch (error) {
          setErrorMessage(mapErrorToMessage(error));
        } finally {
          setIsSubmitting(false);
        }
      }}
    />
  );
}

interface SearchSourceInput {
  apiClient: ReturnType<typeof useShellRuntime>["apiClient"];
  modules: NavModule[];
  sessionPermissions: string[];
  frontendVersion: string;
}

const createSearchSource = ({
  apiClient,
  modules,
  sessionPermissions,
  frontendVersion
}: SearchSourceInput): SearchSource => {
  const moduleByKey = new Map(modules.map((module) => [module.key, module]));
  const hasWildcard = sessionPermissions.includes("*");

  return {
    id: "shell-api-search",
    label: "Naiton",
    priority: 100,
    async getItems({ query, signal }) {
      const response = await apiClient.search(query, signal);

      return response.groups.flatMap((group) => {
        return group.results.map((result) => {
          const module = moduleByKey.get(result.module);
          const requiredPermission = module ? permissionByModule[module.key] : undefined;
          const permitted = module
            ? module.enabled && (!requiredPermission || hasWildcard || sessionPermissions.includes(requiredPermission))
            : false;

          const href = module ? buildModuleHref(module, frontendVersion) : undefined;
          const disabled = !module || !permitted || !href;

          return {
            id: result.id,
            title: result.title,
            subtitle: result.subtitle,
            hint: result.module.toUpperCase(),
            groupId: group.id,
            groupLabel: group.label,
            disabled,
            onSelect: () => {
              if (href) {
                window.location.assign(href);
              }
            }
          };
        });
      });
    }
  };
};

function ShellHomeRoute() {
  const runtime = useShellRuntime();
  const { semver } = useParams();
  const commandPalette = useCommandPalette();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const session = runtime.session;
  const resolvedFrontendVersion = runtime.resolvedFrontendVersion ?? session?.frontend_version ?? null;
  const isAuthenticated = runtime.status === "authenticated" && !!session && !!resolvedFrontendVersion;

  const navigationQuery = useQuery({
    queryKey: ["shell", "navigation", session?.user_id ?? "anonymous", runtime.apiClient.resolution.resolvedBackendVersion],
    queryFn: () => runtime.apiClient.getNavigation(),
    enabled: isAuthenticated
  });

  const notificationsQuery = useQuery({
    queryKey: ["shell", "notifications", session?.user_id ?? "anonymous", runtime.apiClient.resolution.resolvedBackendVersion],
    queryFn: () => runtime.apiClient.getNotifications(),
    enabled: isAuthenticated
  });

  const dashboardSummaryQuery = useQuery({
    queryKey: ["shell", "summary", session?.user_id ?? "anonymous", runtime.apiClient.resolution.resolvedBackendVersion],
    queryFn: () => runtime.apiClient.getDashboardSummary(),
    enabled: isAuthenticated
  });

  const searchSource = useMemo(() => {
    return createSearchSource({
      apiClient: runtime.apiClient,
      modules: navigationQuery.data ?? [],
      sessionPermissions: session?.permissions ?? [],
      frontendVersion: resolvedFrontendVersion ?? "1.0.0"
    });
  }, [navigationQuery.data, resolvedFrontendVersion, runtime.apiClient, session?.permissions]);

  useRegisterSearchSource(searchSource, isAuthenticated);

  const modules = useMemo<ShellModuleNavItem[]>(() => {
    if (!session || !resolvedFrontendVersion) {
      return [];
    }

    const loadedModules = [...(navigationQuery.data ?? [])].sort((left, right) => left.order - right.order);

    return loadedModules.map((module) => {
      const canNavigate = canAccessModule(session, module.key, module.enabled);
      const href = canNavigate ? buildModuleHref(module, resolvedFrontendVersion) : undefined;

      return {
        key: module.key,
        label: module.label,
        href,
        disabled: !canNavigate || !href,
        active: module.key === "shell",
        comingSoon: module.coming_soon
      };
    });
  }, [navigationQuery.data, resolvedFrontendVersion, session]);

  if (runtime.isBootstrapping || runtime.status === "loading") {
    return <BusyState label="Loading dashboard..." />;
  }

  if (!isAuthenticated || !session || !resolvedFrontendVersion) {
    return <Navigate to="/login" replace />;
  }

  if (semver !== resolvedFrontendVersion) {
    return <Navigate to={shellPathForVersion(resolvedFrontendVersion)} replace />;
  }

  return (
    <ShellHomePage
      session={session}
      modules={modules}
      summary={dashboardSummaryQuery.data}
      isSummaryLoading={dashboardSummaryQuery.isLoading}
      summaryError={dashboardSummaryQuery.error ? mapErrorToMessage(dashboardSummaryQuery.error) : null}
      unreadNotifications={(notificationsQuery.data ?? []).filter((item) => !item.read).length}
      onOpenSearch={commandPalette.open}
      onLogout={() => {
        setIsLoggingOut(true);
        void runtime.logout().finally(() => {
          setIsLoggingOut(false);
        });
      }}
      isLoggingOut={isLoggingOut}
      hasDashboardAccess={canAccessDashboard(session)}
      frontendVersion={resolvedFrontendVersion}
      backendVersion={runtime.apiClient.resolution.resolvedBackendVersion}
      frontendFallback={runtime.frontendResolution?.usedFallback ?? false}
      backendFallback={runtime.apiClient.resolution.usedFallback}
    />
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/:semver/shell" element={<ShellHomeRoute />} />
      <Route path="/shell" element={<RootRoute />} />
      <Route path="*" element={<RootRoute />} />
    </Routes>
  );
}
