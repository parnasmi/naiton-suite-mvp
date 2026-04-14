import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NavModule, NavModuleKey } from "@naiton/contracts";
import type { SearchSource } from "@naiton/search-engine";
import { useCommandPalette, useRegisterSearchSource } from "@naiton/ui-kit";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";

import {
  CrmPage,
  type CrmSection,
  type CrmTopModuleItem
} from "../pages/crm-page";
import { buildModuleHref } from "../shared/lib/navigation";
import { useCrmRuntime } from "./runtime-provider";

const crmPathForVersion = (frontendVersion: string): string => `/${frontendVersion}/`;

const sectionKeys = new Set<CrmSection>(["companies", "contacts", "pipeline", "labels"]);

const topModuleOrder: NavModuleKey[] = [
  "sales",
  "wms",
  "crm",
  "procurement",
  "production",
  "accounting",
  "hrm",
  "fms",
  "cms"
];

const permissionByModule: Partial<Record<NavModuleKey, string>> = {
  sales: "sales:read",
  crm: "crm:read",
  fms: "fms:read",
  admin: "admin:read"
};

const isKnownSection = (value: string): value is CrmSection => sectionKeys.has(value as CrmSection);

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
  apiClient: ReturnType<typeof useCrmRuntime>["apiClient"];
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
    id: "crm-api-search",
    label: "CRM",
    priority: 95,
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
    <div className="crm-busy-state">
      <div className="crm-busy-spinner" />
      <p>{label}</p>
    </div>
  );
}

function BootstrapErrorState() {
  const runtime = useCrmRuntime();

  return (
    <div className="crm-busy-state">
      <h1>CRM session failed to initialize</h1>
      <p>{runtime.bootstrapError ?? "Unexpected bootstrap error"}</p>
      <button type="button" className="crm-retry-button" onClick={runtime.retryBootstrap}>
        Retry
      </button>
    </div>
  );
}

function RootRoute() {
  const runtime = useCrmRuntime();

  if (runtime.isBootstrapping || runtime.status === "loading") {
    return <BusyState label="Initializing CRM..." />;
  }

  if (runtime.status === "authenticated" && runtime.resolvedFrontendVersion) {
    return <Navigate to={crmPathForVersion(runtime.resolvedFrontendVersion)} replace />;
  }

  return <BootstrapErrorState />;
}

function VersionedCrmRoute() {
  const runtime = useCrmRuntime();
  const commandPalette = useCommandPalette();
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

  const section = useMemo<CrmSection | null>(() => {
    const firstSegment = pathSuffix.split("/").filter(Boolean)[0] ?? "companies";
    return isKnownSection(firstSegment) ? firstSegment : null;
  }, [pathSuffix]);

  const navigationQuery = useQuery({
    queryKey: ["crm", "navigation", session?.user_id ?? "anonymous", runtime.apiClient.resolution.resolvedBackendVersion],
    queryFn: () => runtime.apiClient.getNavigation(),
    enabled: isAuthenticated
  });

  const notificationsQuery = useQuery({
    queryKey: ["crm", "notifications", session?.user_id ?? "anonymous", runtime.apiClient.resolution.resolvedBackendVersion],
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

  const modules = useMemo<CrmTopModuleItem[]>(() => {
    if (!resolvedFrontendVersion) {
      return [];
    }

    const availableModules = new Map((navigationQuery.data ?? []).map((module) => [module.key, module]));

    return topModuleOrder
      .map((key): CrmTopModuleItem | null => {
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
          active: module.key === "crm",
          comingSoon: module.coming_soon
        };
      })
      .filter((item): item is CrmTopModuleItem => Boolean(item));
  }, [navigationQuery.data, resolvedFrontendVersion, session?.permissions]);

  if (runtime.isBootstrapping || runtime.status === "loading") {
    return <BusyState label="Loading CRM..." />;
  }

  if (!isAuthenticated || !session || !resolvedFrontendVersion) {
    return <BootstrapErrorState />;
  }

  if (semver !== resolvedFrontendVersion) {
    return <Navigate to={`/${resolvedFrontendVersion}${pathSuffix}${location.search}`} replace />;
  }

  if (!section) {
    return <Navigate to={`/${resolvedFrontendVersion}/companies${location.search}`} replace />;
  }

  return (
    <CrmPage
      session={session}
      apiClient={runtime.apiClient}
      modules={modules}
      section={section}
      unreadNotifications={(notificationsQuery.data ?? []).filter((item) => !item.read).length}
      frontendVersion={resolvedFrontendVersion}
      backendVersion={runtime.apiClient.resolution.resolvedBackendVersion}
      onOpenSearch={commandPalette.open}
    />
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/:semver" element={<VersionedCrmRoute />} />
      <Route path="/:semver/*" element={<VersionedCrmRoute />} />
      <Route path="*" element={<RootRoute />} />
    </Routes>
  );
}
