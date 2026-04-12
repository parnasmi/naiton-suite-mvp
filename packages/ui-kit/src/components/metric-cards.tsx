import type { ReactNode } from "react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  trendPercent?: number;
  helperText?: string;
  icon?: ReactNode;
}

export function MetricCard({ label, value, trendPercent, helperText, icon }: MetricCardProps) {
  const trendTone = trendPercent == null ? "#64748b" : trendPercent >= 0 ? "#166534" : "#b42318";

  return (
    <article className="naiton-card" style={{ padding: "1rem", display: "grid", gap: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>{label}</span>
        {icon}
      </div>

      <strong style={{ fontSize: "1.5rem", lineHeight: 1.2 }}>{value}</strong>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {trendPercent != null ? (
          <span style={{ color: trendTone, fontWeight: 600, fontSize: "0.85rem" }}>
            {trendPercent >= 0 ? "+" : ""}
            {trendPercent.toFixed(1)}%
          </span>
        ) : (
          <span />
        )}

        {helperText ? <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{helperText}</span> : null}
      </div>
    </article>
  );
}

export interface MetricRingCardProps {
  label: string;
  value: string | number;
  progressPercent: number;
  tone?: "brand" | "success" | "warning";
  helperText?: string;
}

const ringColorByTone: Record<NonNullable<MetricRingCardProps["tone"]>, string> = {
  brand: "#2f6dff",
  success: "#15803d",
  warning: "#c2410c"
};

export function MetricRingCard({
  label,
  value,
  progressPercent,
  tone = "brand",
  helperText
}: MetricRingCardProps) {
  const clamped = Math.max(0, Math.min(100, progressPercent));
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <article className="naiton-card" style={{ padding: "1rem", display: "grid", gap: "0.65rem" }}>
      <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>{label}</span>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.75rem", alignItems: "center" }}>
        <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden>
          <circle cx="42" cy="42" r={radius} stroke="#dbe2ea" strokeWidth="7" fill="none" />
          <circle
            cx="42"
            cy="42"
            r={radius}
            stroke={ringColorByTone[tone]}
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 42 42)"
          />
        </svg>

        <div style={{ display: "grid", gap: "0.3rem" }}>
          <strong style={{ fontSize: "1.4rem", lineHeight: 1.2 }}>{value}</strong>
          <span style={{ color: "#64748b", fontSize: "0.82rem" }}>{clamped.toFixed(0)}% completion</span>
          {helperText ? <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{helperText}</span> : null}
        </div>
      </div>
    </article>
  );
}
