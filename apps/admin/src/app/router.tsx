import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NavModule, NavModuleKey } from "@naiton/contracts";
import type { SearchSource } from "@naiton/search-engine";
import { useRegisterSearchSource } from "@naiton/ui-kit";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";

import {
  AdminPage,
  type AdminSection,
  type AdminTopModuleItem
} from "../pages/admin-page";
import { buildModuleHref } from "../shared/lib/navigation";
import { useAdminRuntime } from "./runtime-provider";

const adminPathForVersion = (frontendVersion: string): string => `/${frontendVersion}/`;

const sectionKeys = new Set<AdminSection>(["overview", "users", "roles", "integrations", "audit"]);

const topModuleOrder: NavModuleKey[] = [
  "sales",
  "wms",
  "crm",
  "procurement",
  "production",
  "accounting",
  "hrm",
  "fms",
  "admin",
  "cms"
];

const permissionByModule: Partial<Record<NavModuleKey, string>> = {
  sales: "sales:read",
  crm: "crm:read",
  fms: "fms:read",
  admin: "admin:read"
};

const isKnownSection = (value: string): value is AdminSection => sectionKeys.has(value as AdminSection);

const canAccessModule = (
  sessionPermissions: string[],
  module: NavModule
): boolean => {
  if (!module.enabled) {
    return false;
  }

  const requiredPermission = permissionByModule[module.key];
  if (!requiredPermission) {
    return true;
  }

  return sessionPermissions.includes("*") || sessionPermissions.includes(requiredPermission);
};

interface SearchSourceInput {
  apiClient: ReturnType<typeof useAdminRuntime>["apiClient"];
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
    id: "admin-api-search",
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

function BusyState({ label }: { label: string }) {
  return (
    <div className="admin-busy-state">
      <div className="admin-busy-spinner" />
      <p>{label}</p>
    </div>
  );
}

function BootstrapErrorState() {
  const runtime = useAdminRuntime();

  return (
    <div className="admin-busy-state">
      <h1>Admin session failed to initialize</h1>
      <p>{runtime.bootstrapError ?? "Unexpected bootstrap error"}</p>
      <button type="button" className="admin-retry-button" onClick={runtime.retryBootstrap}>
        Retry
      </button>
    </div>
  );
}

function RootRoute() {
  const runtime = useAdminRuntime();

  if (runtime.isBootstrapping || runtime.status === "loading") {
    return <BusyState label="Initializing Admin..." />;
  }

  if (runtime.status === "authenticated" && runtime.resolvedFrontendVersion) {
    return <Navigate to={adminPathForVersion(runtime.resolvedFrontendVersion)} replace />;
  }

  return <BootstrapErrorState />;
}

function VersionedAdminRoute() {
  const runtime = useAdminRuntime();
  const { semver } = useParams();
  const location = useLocation();

  const session = runtime.session;
  const resolvedFrontendVersion = runtime.resolvedFrontendVersion ?? session?.frontend_version ?? null;
  const isAuthenticated = runtime.status === "authenticated" && !!session && !!resolvedFrontendVersion;

  const pathSuffix = useMemo(() => {
    const stripped = location.pathname.replace(/^\/[^/]+/, "");
    if (!stripped) {
      return "/";
    }

    return stripped.startsWith("/") ? stripped : `/${stripped}`;
  }, [location.pathname]);

  const section = useMemo<AdminSection | null>(() => {
    const firstSegment = pathSuffix.split("/").filter(Boolean)[0] ?? "overview";
    return isKnownSection(firstSegment) ? firstSegment : null;
  }, [pathSuffix]);

  const navigationQuery = useQuery({
    queryKey: ["admin", "navigation", session?.user_id ?? "anonymous", runtime.apiClient.resolution.resolvedBackendVersion],
    queryFn: () => runtime.apiClient.getNavigation(),
    enabled: isAuthenticated
  });

  const notificationsQuery = useQuery({
    queryKey: ["admin", "notifications", session?.user_id ?? "anonymous", runtime.apiClient.resolution.resolvedBackendVersion],
    queryFn: () => runtime.apiClient.getNotifications(),
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

  const modules = useMemo<AdminTopModuleItem[]>(() => {
    if (!resolvedFrontendVersion) {
      return [];
    }

    const availableModules = new Map((navigationQuery.data ?? []).map((module) => [module.key, module]));

    return topModuleOrder
      .map((key): AdminTopModuleItem | null => {
        const module = availableModules.get(key);
        if (!module) {
          return null;
        }

        const hasAccess = canAccessModule(session?.permissions ?? [], module);
        const href = hasAccess ? buildModuleHref(module, resolvedFrontendVersion) : undefined;

        return {
          key: module.key,
          label: module.label,
          href,
          disabled: !hasAccess || !href,
          active: module.key === "admin",
          comingSoon: module.coming_soon
        };
      })
      .filter((item): item is AdminTopModuleItem => Boolean(item));
  }, [navigationQuery.data, resolvedFrontendVersion, session?.permissions]);

  if (runtime.isBootstrapping || runtime.status === "loading") {
    return <BusyState label="Loading Admin..." />;
  }

  if (!isAuthenticated || !session || !resolvedFrontendVersion) {
    return <BootstrapErrorState />;
  }

  if (semver !== resolvedFrontendVersion) {
    return <Navigate to={`/${resolvedFrontendVersion}${pathSuffix}${location.search}`} replace />;
  }

  if (!section) {
    return <Navigate to={`/${resolvedFrontendVersion}/overview${location.search}`} replace />;
  }

  return (
    <AdminPage
      session={session}
      apiClient={runtime.apiClient}
      modules={modules}
      section={section}
      unreadNotifications={(notificationsQuery.data ?? []).filter((item) => !item.read).length}
      frontendVersion={resolvedFrontendVersion}
      backendVersion={runtime.apiClient.resolution.resolvedBackendVersion}
    />
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/:semver" element={<VersionedAdminRoute />} />
      <Route path="/:semver/*" element={<VersionedAdminRoute />} />
      <Route path="*" element={<RootRoute />} />
    </Routes>
  );
}
