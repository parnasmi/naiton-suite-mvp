import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import type { AuthSession } from "@naiton/contracts";
import { useSession, useSessionStatus, useSessionStore, useToast } from "@naiton/ui-kit";

import { createSalesApiClient } from "../shared/api/client";
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

const FALLBACK_BACKEND_VERSION = "1.0.0";

const readBootstrapCredential = (envVar: string, fallback: string): string => {
  const value = import.meta.env[envVar] as string | undefined;
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const mapErrorToMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Could not initialize Sales session";
};

interface SalesRuntimeContextValue {
  session: AuthSession | null;
  status: "loading" | "authenticated" | "anonymous";
  isBootstrapping: boolean;
  bootstrapError: string | null;
  authToken: string | null;
  resolvedFrontendVersion: string | null;
  frontendResolution: FrontendRouteVersionResolution | null;
  apiClient: ReturnType<typeof createSalesApiClient>;
  retryBootstrap: () => void;
}

const SalesRuntimeContext = createContext<SalesRuntimeContextValue | null>(null);

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

export function SalesRuntimeProvider({ children }: PropsWithChildren) {
  const session = useSession();
  const status = useSessionStatus();
  const { pushToast } = useToast();

  const setSession = useSessionStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clearSession);
  const setStatus = useSessionStore((state) => state.setStatus);

  const apiOrigin = getRuntimeApiOrigin();

  const anonymousClient = useMemo(
    () =>
      createSalesApiClient(undefined, {
        apiOrigin,
        backendVersion: FALLBACK_BACKEND_VERSION,
        latestBackendVersion: FALLBACK_BACKEND_VERSION,
        deployedBackendVersions: [FALLBACK_BACKEND_VERSION]
      }),
    [apiOrigin]
  );

  const [apiClient, setApiClient] = useState<ReturnType<typeof createSalesApiClient>>(anonymousClient);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [frontendResolution, setFrontendResolution] = useState<FrontendRouteVersionResolution | null>(null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [bootstrapNonce, setBootstrapNonce] = useState(0);
  const lastToastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!bootstrapError || bootstrapError === lastToastErrorRef.current) {
      return;
    }

    lastToastErrorRef.current = bootstrapError;
    pushToast({
      tone: "error",
      title: "Sales bootstrap error",
      description: bootstrapError
    });
  }, [bootstrapError, pushToast]);

  const applyAuthenticatedState = useCallback(
    (nextSession: AuthSession, token: string) => {
      const resolvedFrontend = resolveFrontendRouteVersion({
        frontendVersion: nextSession.frontend_version,
        latestFrontendVersion: nextSession.latest_frontend_version,
        deployedFrontendVersions: nextSession.deployed_frontend_versions
      });

      const authedClient = createSalesApiClient(nextSession, {
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
      setBootstrapError(null);
      setSession(normalizedSession);
      setStatus("authenticated");

      writeStoredAuthState({
        token,
        session: normalizedSession,
        persistedAt: new Date().toISOString()
      });
    },
    [apiOrigin, setSession, setStatus]
  );

  const resetToAnonymous = useCallback(
    (clearStorage = true) => {
      if (clearStorage) {
        clearStoredAuthState();
      }

      setApiClient(anonymousClient);
      setAuthToken(null);
      setFrontendResolution(null);
      clearSession();
      setStatus("anonymous");
    },
    [anonymousClient, clearSession, setStatus]
  );

  const retryBootstrap = useCallback(() => {
    setBootstrapNonce((value) => value + 1);
  }, []);

  useEffect(() => {
    let isDisposed = false;

    const bootstrap = async () => {
      setIsBootstrapping(true);
      setBootstrapError(null);
      setStatus("loading");

      try {
        const stored = readStoredAuthState();

        if (stored) {
          try {
            const restoredClient = createSalesApiClient(stored.session, {
              apiOrigin,
              authToken: stored.token,
              backendVersion: stored.session.backend_version,
              latestBackendVersion: stored.session.latest_backend_version,
              deployedBackendVersions: stored.session.deployed_backend_versions
            });

            const refreshedSession = await restoredClient.getSession();

            if (!isDisposed) {
              applyAuthenticatedState(refreshedSession, stored.token);
              return;
            }
          } catch {
            clearStoredAuthState();
          }
        }

        const developmentClient = createSalesApiClient(undefined, { apiOrigin });
        const loginResponse = await developmentClient.login({
          username: readBootstrapCredential("VITE_NAITON_DEV_USERNAME", "owner@naiton.com"),
          password: readBootstrapCredential("VITE_NAITON_DEV_PASSWORD", "naiton123")
        });

        const authenticatedClient = createSalesApiClient(loginResponse.session, {
          apiOrigin,
          authToken: loginResponse.token,
          backendVersion: loginResponse.session.backend_version,
          latestBackendVersion: loginResponse.session.latest_backend_version,
          deployedBackendVersions: loginResponse.session.deployed_backend_versions
        });

        const refreshedSession = await authenticatedClient.getSession();

        if (!isDisposed) {
          applyAuthenticatedState(refreshedSession, loginResponse.token);
        }
      } catch (error) {
        if (!isDisposed) {
          resetToAnonymous();
          setBootstrapError(mapErrorToMessage(error));
        }
      } finally {
        if (!isDisposed) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isDisposed = true;
    };
  }, [apiOrigin, applyAuthenticatedState, bootstrapNonce, resetToAnonymous, setStatus]);

  const value = useMemo<SalesRuntimeContextValue>(
    () => ({
      session,
      status,
      isBootstrapping,
      bootstrapError,
      authToken,
      resolvedFrontendVersion: frontendResolution?.resolvedFrontendVersion ?? null,
      frontendResolution,
      apiClient,
      retryBootstrap
    }),
    [
      session,
      status,
      isBootstrapping,
      bootstrapError,
      authToken,
      frontendResolution,
      apiClient,
      retryBootstrap
    ]
  );

  return <SalesRuntimeContext.Provider value={value}>{children}</SalesRuntimeContext.Provider>;
}

export const useSalesRuntime = (): SalesRuntimeContextValue => {
  const context = useContext(SalesRuntimeContext);
  if (!context) {
    throw new Error("useSalesRuntime must be used inside SalesRuntimeProvider");
  }

  return context;
};
