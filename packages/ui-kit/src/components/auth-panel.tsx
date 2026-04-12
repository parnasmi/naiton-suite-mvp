import { useState } from "react";

export interface AuthPanelValues {
  username: string;
  password: string;
  remember: boolean;
}

export interface AuthPanelProps {
  title?: string;
  subtitle?: string;
  errorMessage?: string;
  submitLabel?: string;
  isLoading?: boolean;
  defaultValues?: Partial<AuthPanelValues>;
  onSubmit: (values: AuthPanelValues) => void | Promise<void>;
}

export function AuthPanel({
  title = "Welcome back",
  subtitle = "Sign in to your Naiton workspace",
  errorMessage,
  submitLabel = "Sign in",
  isLoading = false,
  defaultValues,
  onSubmit
}: AuthPanelProps) {
  const [values, setValues] = useState<AuthPanelValues>({
    username: defaultValues?.username ?? "",
    password: defaultValues?.password ?? "",
    remember: defaultValues?.remember ?? true
  });

  return (
    <form
      className="naiton-card"
      style={{ width: "min(430px, 100%)", padding: "1.5rem", display: "grid", gap: "1rem" }}
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(values);
      }}
    >
      <header>
        <h1 style={{ margin: 0, fontSize: "1.45rem" }}>{title}</h1>
        <p style={{ margin: "0.35rem 0 0", color: "#64748b" }}>{subtitle}</p>
      </header>

      <label style={{ display: "grid", gap: "0.4rem" }}>
        <span style={{ fontWeight: 600 }}>Username</span>
        <input
          className="naiton-control"
          value={values.username}
          onChange={(event) => setValues((current) => ({ ...current, username: event.target.value }))}
          autoComplete="username"
          required
          style={{ height: "2.75rem", padding: "0 0.85rem", outline: "none" }}
        />
      </label>

      <label style={{ display: "grid", gap: "0.4rem" }}>
        <span style={{ fontWeight: 600 }}>Password</span>
        <input
          className="naiton-control"
          type="password"
          value={values.password}
          onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
          autoComplete="current-password"
          required
          style={{ height: "2.75rem", padding: "0 0.85rem", outline: "none" }}
        />
      </label>

      <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "#475569" }}>
        <input
          type="checkbox"
          checked={values.remember}
          onChange={(event) => setValues((current) => ({ ...current, remember: event.target.checked }))}
        />
        Remember me
      </label>

      {errorMessage ? (
        <div style={{ padding: "0.6rem 0.75rem", borderRadius: "0.75rem", background: "#fee4e2", color: "#912018" }}>
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        style={{
          height: "2.85rem",
          borderRadius: "0.8rem",
          border: "none",
          fontWeight: 700,
          color: "white",
          background: "linear-gradient(120deg, #2f6dff 0%, #1e3fb1 100%)",
          cursor: isLoading ? "wait" : "pointer"
        }}
      >
        {isLoading ? "Signing in..." : submitLabel}
      </button>
    </form>
  );
}
