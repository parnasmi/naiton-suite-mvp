import type { PropsWithChildren, ReactNode } from "react";

import { cn } from "../lib/cn";

export interface ShellModuleLink {
  id: string;
  label: string;
  href?: string;
  disabled?: boolean;
  active?: boolean;
}

export interface TopShellBarProps {
  brand?: ReactNode;
  modules?: ShellModuleLink[];
  searchSlot?: ReactNode;
  actionsSlot?: ReactNode;
}

export function TopShellBar({
  brand = <strong>Naiton</strong>,
  modules = [],
  searchSlot,
  actionsSlot
}: TopShellBarProps) {
  return (
    <header
      className="naiton-card"
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: "1rem",
        alignItems: "center",
        padding: "0.65rem 1rem"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>{brand}</div>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", minWidth: 0 }}>
        {modules.map((module) => (
          <a
            key={module.id}
            href={module.href}
            aria-disabled={module.disabled}
            className={cn(module.disabled ? "is-disabled" : undefined)}
            style={{
              pointerEvents: module.disabled ? "none" : "auto",
              opacity: module.disabled ? 0.45 : 1,
              textDecoration: "none",
              color: module.active ? "#1e3fb1" : "#334155",
              fontWeight: module.active ? 700 : 500,
              padding: "0.4rem 0.65rem",
              borderRadius: "0.6rem",
              background: module.active ? "#dbeafe" : "transparent"
            }}
          >
            {module.label}
          </a>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {searchSlot}
        {actionsSlot}
      </div>
    </header>
  );
}

export interface SideRailProps {
  title?: string;
  links: ShellModuleLink[];
  footerSlot?: ReactNode;
}

export function SideRail({ title = "Navigation", links, footerSlot }: SideRailProps) {
  return (
    <aside
      className="naiton-card"
      style={{
        padding: "1rem 0.75rem",
        width: "240px",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gap: "0.9rem"
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#64748b", padding: "0 0.5rem" }}>{title}</div>

      <nav style={{ display: "grid", gap: "0.35rem", alignContent: "start" }}>
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            aria-disabled={link.disabled}
            style={{
              pointerEvents: link.disabled ? "none" : "auto",
              opacity: link.disabled ? 0.5 : 1,
              textDecoration: "none",
              color: link.active ? "#1e3fb1" : "#334155",
              background: link.active ? "#dbeafe" : "transparent",
              borderRadius: "0.7rem",
              padding: "0.58rem 0.7rem",
              fontWeight: link.active ? 700 : 500
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {footerSlot}
    </aside>
  );
}

export interface ShellLayoutProps extends PropsWithChildren {
  topBar: ReactNode;
  sideRail?: ReactNode;
}

export function ShellLayout({ topBar, sideRail, children }: ShellLayoutProps) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", gap: "1rem", padding: "1rem" }}>
      {topBar}
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: sideRail ? "auto 1fr" : "1fr", alignItems: "start" }}>
        {sideRail}
        <main style={{ minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}
