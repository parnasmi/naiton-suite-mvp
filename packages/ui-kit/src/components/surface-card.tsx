import type { CSSProperties, PropsWithChildren } from "react";

export interface SurfaceCardProps extends PropsWithChildren {
  style?: CSSProperties;
}

export function SurfaceCard({ children, style }: SurfaceCardProps) {
  return (
    <section className="naiton-card" style={{ padding: "1rem", ...style }}>
      {children}
    </section>
  );
}
