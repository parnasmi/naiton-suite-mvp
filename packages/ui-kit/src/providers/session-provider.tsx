import { createContext, useContext, useRef, type PropsWithChildren } from "react";
import type { AuthSession } from "@naiton/contracts";
import { createStore, type StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

export interface SessionState {
  session: AuthSession | null;
  status: SessionStatus;
}

export interface SessionActions {
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  setStatus: (status: SessionStatus) => void;
}

export type SessionStore = SessionState & SessionActions;

export function createSessionStore(initialSession: AuthSession | null = null) {
  return createStore<SessionStore>((set) => ({
    session: initialSession,
    status: initialSession ? "authenticated" : "anonymous",
    setSession: (session) => set({ session, status: "authenticated" }),
    clearSession: () => set({ session: null, status: "anonymous" }),
    setStatus: (status) => set({ status })
  }));
}

const SessionStoreContext = createContext<StoreApi<SessionStore> | null>(null);

export interface SessionProviderProps extends PropsWithChildren {
  initialSession?: AuthSession | null;
}

export function SessionProvider({ children, initialSession = null }: SessionProviderProps) {
  const storeRef = useRef<StoreApi<SessionStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createSessionStore(initialSession);
  }

  return <SessionStoreContext.Provider value={storeRef.current}>{children}</SessionStoreContext.Provider>;
}

export function useSessionStore<T>(selector: (state: SessionStore) => T): T {
  const store = useContext(SessionStoreContext);
  if (!store) {
    throw new Error("useSessionStore must be used inside SessionProvider");
  }

  return useStore(store, selector);
}

export function useSession() {
  return useSessionStore((state) => state.session);
}

export function useSessionStatus() {
  return useSessionStore((state) => state.status);
}
