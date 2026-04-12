import type { ReactNode } from "react";

const badgeToneStyles = {
  neutral: { color: "#334155", background: "#e2e8f0" },
  success: { color: "#166534", background: "#dcfce7" },
  warning: { color: "#9a3412", background: "#ffedd5" },
  danger: { color: "#991b1b", background: "#fee2e2" },
  info: { color: "#1d4ed8", background: "#dbeafe" }
} as const;

export type StatusBadgeTone = keyof typeof badgeToneStyles;

export interface StatusBadgeProps {
  label: string;
  tone?: StatusBadgeTone;
  icon?: ReactNode;
}

export function StatusBadge({ label, tone = "neutral", icon }: StatusBadgeProps) {
  const palette = badgeToneStyles[tone];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        borderRadius: "999px",
        fontSize: "0.78rem",
        fontWeight: 600,
        padding: "0.2rem 0.55rem",
        color: palette.color,
        background: palette.background
      }}
    >
      {icon}
      {label}
    </span>
  );
}

export interface StatusDotProps {
  tone?: StatusBadgeTone;
}

export function StatusDot({ tone = "neutral" }: StatusDotProps) {
  const palette = badgeToneStyles[tone];
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: "0.48rem",
        height: "0.48rem",
        borderRadius: "999px",
        background: palette.color
      }}
    />
  );
}
