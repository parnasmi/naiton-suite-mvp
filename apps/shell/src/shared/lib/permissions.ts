import type { AuthSession, NavModuleKey } from "@naiton/contracts";

const permissionByModule: Partial<Record<NavModuleKey, string>> = {
  shell: "dashboard:view",
  sales: "sales:read",
  crm: "crm:read",
  fms: "fms:read",
  admin: "admin:read"
};

export const hasPermission = (session: AuthSession | null, permission: string): boolean => {
  if (!session) {
    return false;
  }

  return session.permissions.includes("*") || session.permissions.includes(permission);
};

export const canAccessDashboard = (session: AuthSession | null): boolean => {
  return hasPermission(session, "dashboard:view");
};

export const canAccessModule = (
  session: AuthSession | null,
  moduleKey: NavModuleKey,
  moduleEnabled: boolean
): boolean => {
  if (!moduleEnabled) {
    return false;
  }

  const requiredPermission = permissionByModule[moduleKey];
  if (!requiredPermission) {
    return false;
  }

  return hasPermission(session, requiredPermission);
};
