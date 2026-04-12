import { SemverSchema } from "./index";

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const normalizeSemver = (value: string, fallback: string): string => {
  const parsed = SemverSchema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }

  return fallback;
};

export interface RuntimeApiBaseResolutionInput {
  apiOrigin: string;
  backendVersion: string;
  latestBackendVersion: string;
  deployedBackendVersions?: string[];
}

export interface RuntimeApiBaseResolution {
  requestedBackendVersion: string;
  resolvedBackendVersion: string;
  latestBackendVersion: string;
  usedFallback: boolean;
  deployedBackendVersions: string[];
  apiOrigin: string;
  versionedOrigin: string;
}

export const resolveRuntimeApiBase = ({
  apiOrigin,
  backendVersion,
  latestBackendVersion,
  deployedBackendVersions = []
}: RuntimeApiBaseResolutionInput): RuntimeApiBaseResolution => {
  const safeLatestBackendVersion = normalizeSemver(latestBackendVersion, "1.0.0");
  const safeRequestedVersion = normalizeSemver(backendVersion, safeLatestBackendVersion);

  const normalizedApiOrigin = trimTrailingSlash(apiOrigin);
  const versions = deployedBackendVersions
    .map((version) => normalizeSemver(version, safeLatestBackendVersion))
    .filter((version, index, all) => all.indexOf(version) === index);

  const canUseRequested = versions.length === 0 || versions.includes(safeRequestedVersion);
  const resolvedBackendVersion = canUseRequested ? safeRequestedVersion : safeLatestBackendVersion;

  return {
    requestedBackendVersion: safeRequestedVersion,
    resolvedBackendVersion,
    latestBackendVersion: safeLatestBackendVersion,
    usedFallback: resolvedBackendVersion !== safeRequestedVersion,
    deployedBackendVersions: versions,
    apiOrigin: normalizedApiOrigin,
    versionedOrigin: `${normalizedApiOrigin}/${resolvedBackendVersion}`
  };
};
