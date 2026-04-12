import type { AuthSession } from "@naiton/contracts";
import { createNaitonApiClient } from "@naiton/contracts/client";

export interface AdminApiClientOptions {
  apiOrigin?: string;
  authToken?: string;
}

export const createAdminApiClient = (
  session: Pick<AuthSession, "backend_version" | "latest_backend_version" | "deployed_backend_versions">,
  options: AdminApiClientOptions = {}
) => {
  const client = createNaitonApiClient({
    apiOrigin: options.apiOrigin ?? "http://localhost:4000",
    backendVersion: session.backend_version,
    latestBackendVersion: session.latest_backend_version,
    deployedBackendVersions: session.deployed_backend_versions,
    authToken: options.authToken
  });

  return {
    resolution: client.resolution,
    setAuthToken: client.setAuthToken,
    getAdminOverview: client.getAdminOverview,
    getNavigation: client.getNavigation,
    search: client.search
  };
};
