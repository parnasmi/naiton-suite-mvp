import { resolveRuntimeApiBase } from "@naiton/contracts/runtime-api";
import { API_ORIGIN, DEPLOYED_BACKEND_VERSIONS, LATEST_BACKEND_VERSION } from "../config";

const trim = (value: string): string => value.trim();

interface AttachVersionContextOptions {
  getRequestedVersion: (request: import("express").Request) => string;
}

export const attachVersionContext = ({ getRequestedVersion }: AttachVersionContextOptions) => {
  return (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => {
    const requested = trim(getRequestedVersion(request) || LATEST_BACKEND_VERSION);
    const resolution = resolveRuntimeApiBase({
      apiOrigin: API_ORIGIN,
      backendVersion: requested,
      latestBackendVersion: LATEST_BACKEND_VERSION,
      deployedBackendVersions: DEPLOYED_BACKEND_VERSIONS
    });

    request.backendVersionContext = {
      requested: resolution.requestedBackendVersion,
      resolved: resolution.resolvedBackendVersion,
      latest: LATEST_BACKEND_VERSION,
      deployed: DEPLOYED_BACKEND_VERSIONS,
      usedFallback: resolution.usedFallback
    };

    response.setHeader("x-backend-version-requested", resolution.requestedBackendVersion);
    response.setHeader("x-backend-version-resolved", resolution.resolvedBackendVersion);
    response.setHeader("x-backend-version-fallback", String(resolution.usedFallback));
    response.setHeader("x-deployed-backend-versions", DEPLOYED_BACKEND_VERSIONS.join(","));

    next();
  };
};
