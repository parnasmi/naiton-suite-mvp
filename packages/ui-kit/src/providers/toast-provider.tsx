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

export type ToastTone = "info" | "success" | "warning" | "error";

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
}

export interface ToastRecord {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  durationMs: number;
}

export interface ToastContextValue {
  toasts: ToastRecord[];
  pushToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

const DEFAULT_DURATION_MS = 3200;

const toastToneStyles: Record<ToastTone, { border: string; background: string; title: string }> = {
  info: {
    border: "#bfd4ff",
    background: "#eff6ff",
    title: "#1e3a8a"
  },
  success: {
    border: "#9ae6b4",
    background: "#ecfdf5",
    title: "#166534"
  },
  warning: {
    border: "#fcd34d",
    background: "#fffbeb",
    title: "#92400e"
  },
  error: {
    border: "#fda4af",
    background: "#fff1f2",
    title: "#9f1239"
  }
};

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps extends PropsWithChildren {
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 4 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));

    const timeoutId = timersRef.current.get(id);
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      timersRef.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (toast: ToastInput): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const nextToast: ToastRecord = {
        id,
        title: toast.title,
        description: toast.description,
        tone: toast.tone ?? "info",
        durationMs: Math.max(1000, toast.durationMs ?? DEFAULT_DURATION_MS)
      };

      setToasts((previous) => {
        const merged = [nextToast, ...previous];
        return merged.slice(0, Math.max(1, maxToasts));
      });

      const timeoutId = window.setTimeout(() => {
        dismissToast(id);
      }, nextToast.durationMs);

      timersRef.current.set(id, timeoutId);

      return id;
    },
    [dismissToast, maxToasts]
  );

  const clearToasts = useCallback(() => {
    for (const timeoutId of timersRef.current.values()) {
      window.clearTimeout(timeoutId);
    }

    timersRef.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => {
    return () => {
      for (const timeoutId of timersRef.current.values()) {
        window.clearTimeout(timeoutId);
      }
      timersRef.current.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      pushToast,
      dismissToast,
      clearToasts
    }),
    [toasts, pushToast, dismissToast, clearToasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export const useToasts = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToasts must be used inside ToastProvider");
  }

  return context;
};

function ToastViewport({ toasts, onDismiss }: { toasts: ToastRecord[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        right: "1rem",
        bottom: "1rem",
        display: "grid",
        gap: "0.6rem",
        zIndex: 9998,
        width: "min(340px, calc(100vw - 2rem))"
      }}
    >
      {toasts.map((toast) => {
        const toneStyle = toastToneStyles[toast.tone];

        return (
          <article
            key={toast.id}
            style={{
              borderRadius: "0.75rem",
              border: `1px solid ${toneStyle.border}`,
              background: toneStyle.background,
              boxShadow: "0 12px 24px -20px rgba(15, 23, 42, 0.8)",
              padding: "0.65rem 0.72rem",
              display: "grid",
              gap: "0.25rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: "0.5rem" }}>
              <strong style={{ color: toneStyle.title, fontSize: "0.88rem" }}>{toast.title}</strong>
              <button
                type="button"
                aria-label="Dismiss toast"
                onClick={() => onDismiss(toast.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  lineHeight: 1
                }}
              >
                x
              </button>
            </div>
            {toast.description ? <p style={{ margin: 0, color: "#475569", fontSize: "0.82rem" }}>{toast.description}</p> : null}
          </article>
        );
      })}
    </div>
  );
}
