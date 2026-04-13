import type { NavModuleKey } from "@naiton/contracts";

const FALLBACK_API_ORIGIN = "http://localhost:4000";

const moduleHostEnvByKey: Partial<Record<NavModuleKey, string>> = {
  shell: "NAITON_SHELL_HOST",
  sales: "NAITON_SALES_HOST",
  crm: "NAITON_CRM_HOST",
  fms: "NAITON_FMS_HOST",
  admin: "NAITON_ADMIN_HOST"
};

const modulePortByKey: Partial<Record<NavModuleKey, number>> = {
  shell: 3000,
  sales: 3001,
  crm: 3002,
  fms: 3003,
  admin: 3004
};

const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, "");

const stripApiSuffix = (value: string): string => {
  const trimmed = trimTrailingSlashes(value.trim());
  return trimmed.replace(/\/(?:\d+\.\d+\.\d+\/)?api$/i, "");
};

const readEnv = (name: string): string | undefined => {
  const value = import.meta.env[name] as string | undefined;
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const getRuntimeApiOrigin = (): string => {
  const explicitOrigin = readEnv("VITE_NAITON_API_ORIGIN") ?? readEnv("NAITON_API_ORIGIN");
  if (explicitOrigin) {
    return stripApiSuffix(explicitOrigin);
  }

  const configuredBaseUrl = readEnv("VITE_NAITON_API_BASE_URL") ?? readEnv("NAITON_API_BASE_URL");
  if (configuredBaseUrl) {
    return stripApiSuffix(configuredBaseUrl);
  }

  return FALLBACK_API_ORIGIN;
};

export const isLocalDevelopmentHost = (hostname: string): boolean => {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost");
};

export const getModuleHostOverride = (moduleKey: NavModuleKey): string | undefined => {
  const envVar = moduleHostEnvByKey[moduleKey];
  return envVar ? readEnv(envVar) : undefined;
};

export const getLocalModulePort = (moduleKey: NavModuleKey): number | undefined => {
  return modulePortByKey[moduleKey];
};
