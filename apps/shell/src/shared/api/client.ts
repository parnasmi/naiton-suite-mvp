import type { AuthSession } from "@naiton/contracts";
import { createNaitonApiClient } from "@naiton/contracts/client";

export interface ShellApiClientOptions {
  apiOrigin?: string;
  authToken?: string;
  backendVersion?: string;
  latestBackendVersion?: string;
  deployedBackendVersions?: string[];
}

export const createShellApiClient = (
  session?: Pick<AuthSession, "backend_version" | "latest_backend_version" | "deployed_backend_versions">,
  options: ShellApiClientOptions = {}
) => {
  const latestBackendVersion = options.latestBackendVersion ?? session?.latest_backend_version ?? "1.4.0";
  const backendVersion = options.backendVersion ?? session?.backend_version ?? latestBackendVersion;

  const client = createNaitonApiClient({
    apiOrigin: options.apiOrigin ?? "http://localhost:4000",
    backendVersion,
    latestBackendVersion,
    deployedBackendVersions:
      options.deployedBackendVersions ?? session?.deployed_backend_versions ?? [latestBackendVersion],
    authToken: options.authToken
  });

  return {
    resolution: client.resolution,
    setAuthToken: client.setAuthToken,
    login: client.login,
    logout: client.logout,
    getSession: client.me,
    getNavigation: client.getNavigation,
    getNotifications: client.getNotifications,
    getDashboardSummary: client.getDashboardSummary,
    search: client.search
  };
};
