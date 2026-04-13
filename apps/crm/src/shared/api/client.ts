import type { AuthSession } from "@naiton/contracts";
import { createNaitonApiClient } from "@naiton/contracts/client";

export interface CrmApiClientOptions {
  apiOrigin?: string;
  authToken?: string;
  backendVersion?: string;
  latestBackendVersion?: string;
  deployedBackendVersions?: string[];
}

const FALLBACK_BACKEND_VERSION = "1.0.0";

export const createCrmApiClient = (
  session?: Pick<AuthSession, "backend_version" | "latest_backend_version" | "deployed_backend_versions">,
  options: CrmApiClientOptions = {}
) => {
  const backendVersion = options.backendVersion ?? session?.backend_version ?? FALLBACK_BACKEND_VERSION;
  const latestBackendVersion =
    options.latestBackendVersion ??
    session?.latest_backend_version ??
    backendVersion;
  const deployedBackendVersions = options.deployedBackendVersions ?? session?.deployed_backend_versions ?? [];

  const client = createNaitonApiClient({
    apiOrigin: options.apiOrigin ?? "http://localhost:4000",
    backendVersion,
    latestBackendVersion,
    deployedBackendVersions,
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
    getCrmCompanies: client.getCrmCompanies,
    getCrmCompany: client.getCrmCompany,
    search: client.search
  };
};
