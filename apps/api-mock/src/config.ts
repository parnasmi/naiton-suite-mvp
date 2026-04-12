import { SemverSchema } from "@naiton/contracts";

const parseSemver = (value: string): string => {
  const parsed = SemverSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(`Invalid semver value: ${value}`);
  }

  return parsed.data;
};

export const API_PORT = Number(process.env.NAITON_API_PORT ?? 4000);
export const API_ORIGIN = process.env.NAITON_API_ORIGIN ?? `http://localhost:${API_PORT}`;

export const DEPLOYED_FRONTEND_VERSIONS = ["1.4.0", "1.3.2"].map(parseSemver);
export const DEPLOYED_BACKEND_VERSIONS = ["1.4.0", "1.3.1"].map(parseSemver);

export const LATEST_FRONTEND_VERSION = DEPLOYED_FRONTEND_VERSIONS[0];
export const LATEST_BACKEND_VERSION = DEPLOYED_BACKEND_VERSIONS[0];

export const AUTH_TOKEN_PREFIX = "naiton_mock";
