import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NavModule, NavModuleKey } from "@naiton/contracts";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";

import {
  FmsPage,
  type FmsSection,
  type FmsTopModuleItem
} from "../pages/fms-page";
import { buildModuleHref } from "../shared/lib/navigation";
import { useFmsRuntime } from "./runtime-provider";

const fmsPathForVersion = (frontendVersion: string): string => `/${frontendVersion}/`;

const sectionKeys = new Set<FmsSection>(["fleet", "trips", "service", "zones"]);

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

const isKnownSection = (value: string): value is FmsSection => sectionKeys.has(value as FmsSection);

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

function BusyState({ label }: { label: string }) {
  return (
    <div className="fms-busy-state">
      <div className="fms-busy-spinner" />
      <p>{label}</p>
    </div>
  );
}

function BootstrapErrorState() {
  const runtime = useFmsRuntime();

  return (
    <div className="fms-busy-state">
      <h1>FMS session failed to initialize</h1>
      <p>{runtime.bootstrapError ?? "Unexpected bootstrap error"}</p>
      <button type="button" className="fms-retry-button" onClick={runtime.retryBootstrap}>
        Retry
      </button>
    </div>
  );
}

function RootRoute() {
  const runtime = useFmsRuntime();

  if (runtime.isBootstrapping || runtime.status === "loading") {
    return <BusyState label="Initializing FMS..." />;
  }

  if (runtime.status === "authenticated" && runtime.resolvedFrontendVersion) {
    return <Navigate to={fmsPathForVersion(runtime.resolvedFrontendVersion)} replace />;
  }

  return <BootstrapErrorState />;
}

function VersionedFmsRoute() {
  const runtime = useFmsRuntime();
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

  const section = useMemo<FmsSection | null>(() => {
    const firstSegment = pathSuffix.split("/").filter(Boolean)[0] ?? "fleet";
    return isKnownSection(firstSegment) ? firstSegment : null;
  }, [pathSuffix]);

  const navigationQuery = useQuery({
    queryKey: ["fms", "navigation", session?.user_id ?? "anonymous", runtime.apiClient.resolution.resolvedBackendVersion],
    queryFn: () => runtime.apiClient.getNavigation(),
    enabled: isAuthenticated
  });

  const notificationsQuery = useQuery({
    queryKey: ["fms", "notifications", session?.user_id ?? "anonymous", runtime.apiClient.resolution.resolvedBackendVersion],
    queryFn: () => runtime.apiClient.getNotifications(),
    enabled: isAuthenticated
  });

  const modules = useMemo<FmsTopModuleItem[]>(() => {
    if (!resolvedFrontendVersion) {
      return [];
    }

    const availableModules = new Map((navigationQuery.data ?? []).map((module) => [module.key, module]));

    return topModuleOrder
      .map((key): FmsTopModuleItem | null => {
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
          active: module.key === "fms",
          comingSoon: module.coming_soon
        };
      })
      .filter((item): item is FmsTopModuleItem => Boolean(item));
  }, [navigationQuery.data, resolvedFrontendVersion, session?.permissions]);

  if (runtime.isBootstrapping || runtime.status === "loading") {
    return <BusyState label="Loading FMS..." />;
  }

  if (!isAuthenticated || !session || !resolvedFrontendVersion) {
    return <BootstrapErrorState />;
  }

  if (semver !== resolvedFrontendVersion) {
    return <Navigate to={`/${resolvedFrontendVersion}${pathSuffix}${location.search}`} replace />;
  }

  if (!section) {
    return <Navigate to={`/${resolvedFrontendVersion}/fleet${location.search}`} replace />;
  }

  return (
    <FmsPage
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
      <Route path="/:semver" element={<VersionedFmsRoute />} />
      <Route path="/:semver/*" element={<VersionedFmsRoute />} />
      <Route path="*" element={<RootRoute />} />
    </Routes>
  );
}
