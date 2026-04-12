import type { AuthSession } from "@naiton/contracts";
import { createNaitonApiClient } from "@naiton/contracts/client";

export interface SalesApiClientOptions {
  apiOrigin?: string;
  authToken?: string;
}

export const createSalesApiClient = (
  session: Pick<AuthSession, "backend_version" | "latest_backend_version" | "deployed_backend_versions">,
  options: SalesApiClientOptions = {}
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
    getSalesOrders: client.getSalesOrders,
    getSalesOrder: client.getSalesOrder,
    search: client.search
  };
};
