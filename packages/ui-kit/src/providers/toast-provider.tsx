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

interface ToastRecord extends ToastInput {
  id: string;
  tone: ToastTone;
}

interface ToastContextValue {
  pushToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyleMap: Record<ToastTone, { border: string; background: string; title: string }> = {
  info: {
    border: "#bfdbfe",
    background: "#eff6ff",
    title: "#1d4ed8"
  },
  success: {
    border: "#86efac",
    background: "#ecfdf5",
    title: "#166534"
  },
  warning: {
    border: "#fcd34d",
    background: "#fffbeb",
    title: "#b45309"
  },
  error: {
    border: "#fecaca",
    background: "#fef2f2",
    title: "#b91c1c"
  }
};

const createToastId = (): string => {
  return `toast_${Math.random().toString(36).slice(2, 11)}`;
};

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timeoutMapRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timeoutId = timeoutMapRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutMapRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    for (const timeoutId of timeoutMapRef.current.values()) {
      window.clearTimeout(timeoutId);
    }

    timeoutMapRef.current.clear();
    setToasts([]);
  }, []);

  const pushToast = useCallback(
    (toast: ToastInput): string => {
      const id = createToastId();
      const durationMs = toast.durationMs ?? 3600;

      const nextToast: ToastRecord = {
        id,
        title: toast.title,
        description: toast.description,
        tone: toast.tone ?? "info",
        durationMs
      };

      setToasts((current) => {
        const next = [...current, nextToast];
        return next.slice(-4);
      });

      if (durationMs > 0 && typeof window !== "undefined") {
        const timeoutId = window.setTimeout(() => {
          dismissToast(id);
        }, durationMs);

        timeoutMapRef.current.set(id, timeoutId);
      }

      return id;
    },
    [dismissToast]
  );

  useEffect(() => {
    return () => {
      for (const timeoutId of timeoutMapRef.current.values()) {
        window.clearTimeout(timeoutId);
      }

      timeoutMapRef.current.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      pushToast,
      dismissToast,
      clearToasts
    }),
    [pushToast, dismissToast, clearToasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: "fixed",
          right: "1rem",
          bottom: "1rem",
          display: "grid",
          gap: "0.5rem",
          width: "min(24rem, calc(100vw - 2rem))",
          zIndex: 1000,
          pointerEvents: "none"
        }}
      >
        {toasts.map((toast) => {
          const toneStyle = toneStyleMap[toast.tone];

          return (
            <article
              key={toast.id}
              style={{
                pointerEvents: "auto",
                border: `1px solid ${toneStyle.border}`,
                background: toneStyle.background,
                borderRadius: "0.55rem",
                padding: "0.55rem 0.65rem",
                boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "0.45rem"
              }}
            >
              <div style={{ display: "grid", gap: "0.2rem" }}>
                <strong style={{ margin: 0, fontSize: "0.88rem", color: toneStyle.title }}>{toast.title}</strong>
                {toast.description ? (
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#334155", lineHeight: 1.35 }}>{toast.description}</p>
                ) : null}
              </div>

              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismissToast(toast.id)}
                style={{
                  border: "1px solid #cbd5e1",
                  background: "white",
                  borderRadius: "0.35rem",
                  width: "1.7rem",
                  height: "1.7rem",
                  cursor: "pointer",
                  color: "#475569"
                }}
              >
                x
              </button>
            </article>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
};
