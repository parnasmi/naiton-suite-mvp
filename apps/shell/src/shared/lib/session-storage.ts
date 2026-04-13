import { AuthSessionSchema, type AuthSession } from "@naiton/contracts";

const SHELL_AUTH_STORAGE_KEY = "naiton.shell.auth";

export interface StoredAuthState {
  token: string;
  session: AuthSession;
  persistedAt: string;
}

const canUseStorage = (): boolean => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const writeStoredAuthState = (state: StoredAuthState): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(SHELL_AUTH_STORAGE_KEY, JSON.stringify(state));
};

export const readStoredAuthState = (): StoredAuthState | null => {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(SHELL_AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthState>;

    if (typeof parsed.token !== "string" || parsed.token.length === 0) {
      return null;
    }

    const parsedSession = AuthSessionSchema.safeParse(parsed.session);
    if (!parsedSession.success) {
      return null;
    }

    return {
      token: parsed.token,
      session: parsedSession.data,
      persistedAt:
        typeof parsed.persistedAt === "string" && parsed.persistedAt.length > 0
          ? parsed.persistedAt
          : new Date().toISOString()
    };
  } catch {
    return null;
  }
};

export const clearStoredAuthState = (): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(SHELL_AUTH_STORAGE_KEY);
};
