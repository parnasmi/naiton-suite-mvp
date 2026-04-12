import type { AuthSession } from "@naiton/contracts";
import { createNaitonApiClient } from "@naiton/contracts/client";

export interface FmsApiClientOptions {
  apiOrigin?: string;
  authToken?: string;
}

export const createFmsApiClient = (
  session: Pick<AuthSession, "backend_version" | "latest_backend_version" | "deployed_backend_versions">,
  options: FmsApiClientOptions = {}
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
    getFleetVehicles: client.getFleetVehicles,
    getMapMarkers: client.getMapMarkers,
    search: client.search
  };
};
