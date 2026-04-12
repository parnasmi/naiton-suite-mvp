import type { ReactNode } from "react";

export interface MapMarkerPoint {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  tone?: "brand" | "success" | "warning" | "danger";
}

export interface MapPanelProps {
  title?: string;
  markers?: MapMarkerPoint[];
  selectedMarkerId?: string;
  actionSlot?: ReactNode;
}

const toneColorMap: Record<NonNullable<MapMarkerPoint["tone"]>, string> = {
  brand: "#2f6dff",
  success: "#15803d",
  warning: "#c2410c",
  danger: "#b91c1c"
};

function toCoordinate(lat: number, lng: number) {
  return {
    left: `${((lng + 180) / 360) * 100}%`,
    top: `${((90 - lat) / 180) * 100}%`
  };
}

export function MapPanel({ title = "Fleet map", markers = [], selectedMarkerId, actionSlot }: MapPanelProps) {
  return (
    <section className="naiton-card" style={{ padding: "0.85rem", display: "grid", gap: "0.75rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>{title}</h2>
        {actionSlot}
      </header>

      <div
        style={{
          position: "relative",
          borderRadius: "0.9rem",
          minHeight: "380px",
          background:
            "radial-gradient(circle at 20% 30%, rgba(47, 109, 255, 0.24), transparent 45%), linear-gradient(170deg, #dbeafe 0%, #f8fafc 50%, #e2e8f0 100%)",
          overflow: "hidden",
          border: "1px solid #dbe2ea"
        }}
      >
        {markers.map((marker) => {
          const selected = marker.id === selectedMarkerId;
          const { left, top } = toCoordinate(marker.lat, marker.lng);
          return (
            <div
              key={marker.id}
              title={marker.label}
              style={{
                position: "absolute",
                left,
                top,
                transform: "translate(-50%, -50%)",
                width: selected ? "1rem" : "0.8rem",
                height: selected ? "1rem" : "0.8rem",
                borderRadius: "999px",
                border: "2px solid #ffffff",
                background: marker.tone ? toneColorMap[marker.tone] : toneColorMap.brand,
                boxShadow: selected ? "0 0 0 8px rgba(47, 109, 255, 0.2)" : "none"
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
