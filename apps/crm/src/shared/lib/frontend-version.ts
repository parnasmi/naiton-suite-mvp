import { SemverSchema } from "@naiton/contracts";

export interface FrontendRouteVersionResolutionInput {
  frontendVersion: string;
  latestFrontendVersion: string;
  deployedFrontendVersions?: string[];
}

export interface FrontendRouteVersionResolution {
  requestedFrontendVersion: string;
  resolvedFrontendVersion: string;
  latestFrontendVersion: string;
  usedFallback: boolean;
  deployedFrontendVersions: string[];
}

const normalizeSemver = (value: string, fallback: string): string => {
  const parsed = SemverSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
};

export const resolveFrontendRouteVersion = ({
  frontendVersion,
  latestFrontendVersion,
  deployedFrontendVersions = []
}: FrontendRouteVersionResolutionInput): FrontendRouteVersionResolution => {
  const safeLatestFrontendVersion = normalizeSemver(latestFrontendVersion, "1.0.0");
  const safeRequestedVersion = normalizeSemver(frontendVersion, safeLatestFrontendVersion);

  const knownVersions = deployedFrontendVersions
    .map((version) => normalizeSemver(version, safeLatestFrontendVersion))
    .filter((version, index, all) => all.indexOf(version) === index);

  const canUseRequested = knownVersions.length === 0 || knownVersions.includes(safeRequestedVersion);
  const resolvedFrontendVersion = canUseRequested ? safeRequestedVersion : safeLatestFrontendVersion;

  return {
    requestedFrontendVersion: safeRequestedVersion,
    resolvedFrontendVersion,
    latestFrontendVersion: safeLatestFrontendVersion,
    usedFallback: resolvedFrontendVersion !== safeRequestedVersion,
    deployedFrontendVersions: knownVersions
  };
};
