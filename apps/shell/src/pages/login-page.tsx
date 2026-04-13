import { useState } from "react";

interface LoginValues {
  username: string;
  password: string;
}

export interface LoginPageProps {
  isLoading: boolean;
  errorMessage: string | null;
  onLogin: (values: LoginValues) => Promise<void>;
}

export function LoginPage({ isLoading, errorMessage, onLogin }: LoginPageProps) {
  const [values, setValues] = useState<LoginValues>({
    username: "owner@naiton.com",
    password: "naiton123"
  });

  return (
    <div className="login-screen">
      <aside className="login-side-panel">
        <div className="login-brand">
          <div className="login-brand-mark">N6</div>
          <div>
            <div className="login-brand-title">Naiton</div>
            <div className="login-brand-subtitle">Business Suite</div>
          </div>
        </div>

        <form
          className="login-card"
          onSubmit={(event) => {
            event.preventDefault();
            void onLogin(values);
          }}
        >
          <h1 className="login-card-title">Welcome to Naiton</h1>

          <input
            className="login-input"
            type="email"
            placeholder="Email"
            autoComplete="username"
            value={values.username}
            onChange={(event) => {
              setValues((current) => ({ ...current, username: event.target.value }));
            }}
            required
          />

          <input
            className="login-input"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => {
              setValues((current) => ({ ...current, password: event.target.value }));
            }}
            required
          />

          <a className="login-reset-link" href="#" onClick={(event) => event.preventDefault()}>
            Reset password
          </a>

          {errorMessage ? <p className="login-error">{errorMessage}</p> : null}

          <button className="login-submit" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Login"}
          </button>

          <p className="login-terms">
            By signing in, you are agreeing to the <a href="#">Terms and Conditions</a> and <a href="#">Privacy Policy</a>
          </p>
        </form>

        <footer className="login-footer">
          <button type="button" className="language-switcher">
            EN
          </button>
          <p>Technical support</p>
          <p>2006 - 2026 Naiton Business Suite. All rights reserved.</p>
        </footer>
      </aside>

      <section className="login-hero">
        <div className="hero-overlay" />
        <div className="hero-ring hero-ring-left" />
        <div className="hero-ring hero-ring-right" />

        <div className="cookie-panel">
          <h2>Cookie Settings</h2>
          <p>
            We use cookies to ensure our website functions properly, analyze site traffic, and improve your user
            experience. Accepting cookies helps us provide better product quality.
          </p>
          <div className="cookie-actions">
            <button type="button">Manage preferences</button>
            <button type="button">Accept necessary</button>
            <button type="button" className="cookie-accept-all">
              Accept all
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
