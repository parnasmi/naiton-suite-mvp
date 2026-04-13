import type { NavModule } from "@naiton/contracts";

import {
  getLocalModulePort,
  getModuleHostOverride,
  isLocalDevelopmentHost
} from "../config/runtime";

const ensureLeadingSlash = (value: string): string => {
  if (!value) {
    return "/";
  }

  return value.startsWith("/") ? value : `/${value}`;
};

const normalizeRouteTemplate = (routeTemplate: string, frontendVersion: string): string => {
  const replaced = routeTemplate.replace("{semver}", frontendVersion);
  return ensureLeadingSlash(replaced).replace(/\/+/g, "/");
};

export const buildModuleHref = (module: NavModule, frontendVersion: string): string | undefined => {
  if (!module.enabled) {
    return undefined;
  }

  const path = normalizeRouteTemplate(module.route_template, frontendVersion);
  const protocol = window.location.protocol || "https:";

  if (isLocalDevelopmentHost(window.location.hostname)) {
    const localPort = getLocalModulePort(module.key);
    if (localPort) {
      return `${protocol}//${window.location.hostname}:${localPort}${path}`;
    }
  }

  const host = getModuleHostOverride(module.key) ?? module.host;
  return `${protocol}//${host}${path}`;
};
