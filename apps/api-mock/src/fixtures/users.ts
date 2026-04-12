import { AuthSessionSchema, type AuthRole, type AuthSession } from "@naiton/contracts";
import {
  DEPLOYED_BACKEND_VERSIONS,
  DEPLOYED_FRONTEND_VERSIONS,
  LATEST_BACKEND_VERSION,
  LATEST_FRONTEND_VERSION
} from "../config";

const sessionExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

interface SeedUser {
  username: string;
  password: string;
  displayName: string;
  role: AuthRole;
  permissions: string[];
  frontendVersion: string;
  backendVersion: string;
  locale?: string;
}

const users: SeedUser[] = [
  {
    username: "owner@naiton.com",
    password: "naiton123",
    displayName: "Dilshod A.",
    role: "owner",
    permissions: ["*"],
    frontendVersion: LATEST_FRONTEND_VERSION,
    backendVersion: LATEST_BACKEND_VERSION
  },
  {
    username: "manager@naiton.com",
    password: "naiton123",
    displayName: "Anora M.",
    role: "manager",
    permissions: [
      "dashboard:view",
      "sales:read",
      "crm:read",
      "fms:read",
      "admin:read"
    ],
    frontendVersion: "1.3.2",
    backendVersion: "1.3.1"
  },
  {
    username: "operator@naiton.com",
    password: "naiton123",
    displayName: "Bekzod R.",
    role: "operator",
    permissions: ["sales:read", "crm:read", "fms:read"],
    frontendVersion: "1.2.0",
    backendVersion: "1.2.0"
  }
];

export const authenticateSeedUser = (username: string, password: string): AuthSession | null => {
  const matchedUser = users.find(
    (user) => user.username.toLowerCase() === username.trim().toLowerCase() && user.password === password
  );

  if (!matchedUser) {
    return null;
  }

  return AuthSessionSchema.parse({
    user_id: `user_${matchedUser.username.split("@")[0]}`,
    username: matchedUser.username,
    display_name: matchedUser.displayName,
    role: matchedUser.role,
    permissions: matchedUser.permissions,
    frontend_version: matchedUser.frontendVersion,
    latest_frontend_version: LATEST_FRONTEND_VERSION,
    backend_version: matchedUser.backendVersion,
    latest_backend_version: LATEST_BACKEND_VERSION,
    deployed_frontend_versions: DEPLOYED_FRONTEND_VERSIONS,
    deployed_backend_versions: DEPLOYED_BACKEND_VERSIONS,
    locale: matchedUser.locale ?? "en",
    expires_at: sessionExpiry
  });
};
