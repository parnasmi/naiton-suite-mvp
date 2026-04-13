import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { type AuthSession } from "@naiton/contracts";
import { useSession, useSessionStatus, useSessionStore } from "@naiton/ui-kit";

import { createShellApiClient } from "../shared/api/client";
import { getRuntimeApiOrigin } from "../shared/config/runtime";
import {
  resolveFrontendRouteVersion,
  type FrontendRouteVersionResolution
} from "../shared/lib/frontend-version";
import {
  clearStoredAuthState,
  readStoredAuthState,
  writeStoredAuthState
} from "../shared/lib/session-storage";

interface LoginCredentials {
  username: string;
  password: string;
}

interface ShellRuntimeContextValue {
  session: AuthSession | null;
  status: "loading" | "authenticated" | "anonymous";
  isBootstrapping: boolean;
  authToken: string | null;
  resolvedFrontendVersion: string | null;
  frontendResolution: FrontendRouteVersionResolution | null;
  apiClient: ReturnType<typeof createShellApiClient>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const ShellRuntimeContext = createContext<ShellRuntimeContextValue | null>(null);

const normalizeSessionForResolvedVersions = (
  session: AuthSession,
  frontendResolution: FrontendRouteVersionResolution,
  backendVersion: string
): AuthSession => {
  return {
    ...session,
    frontend_version: frontendResolution.resolvedFrontendVersion,
    backend_version: backendVersion
  };
};

export function ShellRuntimeProvider({ children }: PropsWithChildren) {
  const session = useSession();
  const status = useSessionStatus();

  const setSession = useSessionStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clearSession);
  const setStatus = useSessionStore((state) => state.setStatus);

  const apiOrigin = getRuntimeApiOrigin();

  const anonymousClient = useMemo(() => createShellApiClient(undefined, { apiOrigin }), [apiOrigin]);

  const [apiClient, setApiClient] = useState<ReturnType<typeof createShellApiClient>>(anonymousClient);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [frontendResolution, setFrontendResolution] = useState<FrontendRouteVersionResolution | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const applyAuthenticatedState = useCallback(
    (nextSession: AuthSession, token: string) => {
      const resolvedFrontend = resolveFrontendRouteVersion({
        frontendVersion: nextSession.frontend_version,
        latestFrontendVersion: nextSession.latest_frontend_version,
        deployedFrontendVersions: nextSession.deployed_frontend_versions
      });

      const authedClient = createShellApiClient(nextSession, {
        apiOrigin,
        authToken: token,
        backendVersion: nextSession.backend_version,
        latestBackendVersion: nextSession.latest_backend_version,
        deployedBackendVersions: nextSession.deployed_backend_versions
      });

      const normalizedSession = normalizeSessionForResolvedVersions(
        nextSession,
        resolvedFrontend,
        authedClient.resolution.resolvedBackendVersion
      );

      setApiClient(authedClient);
      setAuthToken(token);
      setFrontendResolution(resolvedFrontend);
      setSession(normalizedSession);

      writeStoredAuthState({
        token,
        session: normalizedSession,
        persistedAt: new Date().toISOString()
      });
    },
    [apiOrigin, setSession]
  );

  const resetToAnonymous = useCallback(() => {
    clearStoredAuthState();
    setApiClient(anonymousClient);
    setAuthToken(null);
    setFrontendResolution(null);
    clearSession();
    setStatus("anonymous");
  }, [anonymousClient, clearSession, setStatus]);

  const login = useCallback(
    async ({ username, password }: LoginCredentials) => {
      setStatus("loading");

      try {
        const loginClient = createShellApiClient(undefined, { apiOrigin });
        const loginResponse = await loginClient.login({ username, password });

        const authenticatedClient = createShellApiClient(loginResponse.session, {
          apiOrigin,
          authToken: loginResponse.token
        });

        const refreshedSession = await authenticatedClient.getSession();

        applyAuthenticatedState(refreshedSession, loginResponse.token);
      } catch (error) {
        resetToAnonymous();
        throw error;
      }
    },
    [apiOrigin, applyAuthenticatedState, resetToAnonymous, setStatus]
  );

  const logout = useCallback(async () => {
    try {
      if (authToken) {
        await apiClient.logout();
      }
    } catch {
      // Ignore logout transport errors and still clear local state.
    } finally {
      resetToAnonymous();
    }
  }, [apiClient, authToken, resetToAnonymous]);

  useEffect(() => {
    let isDisposed = false;

    const restore = async () => {
      const stored = readStoredAuthState();
      if (!stored) {
        setIsBootstrapping(false);
        setStatus("anonymous");
        return;
      }

      setStatus("loading");

      try {
        const restoredClient = createShellApiClient(stored.session, {
          apiOrigin,
          authToken: stored.token,
          backendVersion: stored.session.backend_version,
          latestBackendVersion: stored.session.latest_backend_version,
          deployedBackendVersions: stored.session.deployed_backend_versions
        });

        const refreshedSession = await restoredClient.getSession();

        if (!isDisposed) {
          applyAuthenticatedState(refreshedSession, stored.token);
        }
      } catch {
        if (!isDisposed) {
          resetToAnonymous();
        }
      } finally {
        if (!isDisposed) {
          setIsBootstrapping(false);
        }
      }
    };

    void restore();

    return () => {
      isDisposed = true;
    };
  }, [apiOrigin, applyAuthenticatedState, resetToAnonymous, setStatus]);

  const value = useMemo<ShellRuntimeContextValue>(
    () => ({
      session,
      status,
      isBootstrapping,
      authToken,
      resolvedFrontendVersion: frontendResolution?.resolvedFrontendVersion ?? null,
      frontendResolution,
      apiClient,
      login,
      logout
    }),
    [session, status, isBootstrapping, authToken, frontendResolution, apiClient, login, logout]
  );

  return <ShellRuntimeContext.Provider value={value}>{children}</ShellRuntimeContext.Provider>;
}

export const useShellRuntime = (): ShellRuntimeContextValue => {
  const context = useContext(ShellRuntimeContext);
  if (!context) {
    throw new Error("useShellRuntime must be used inside ShellRuntimeProvider");
  }

  return context;
};
