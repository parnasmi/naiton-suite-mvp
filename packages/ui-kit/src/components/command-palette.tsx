import type { ReactNode } from "react";

export interface CommandPaletteItemView {
  id: string;
  label: string;
  subtitle?: string;
  hint?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface CommandPaletteGroupView {
  id: string;
  label: string;
  items: CommandPaletteItemView[];
}

export interface CommandPaletteProps {
  open: boolean;
  query: string;
  groups: CommandPaletteGroupView[];
  loading?: boolean;
  emptyLabel?: string;
  onClose: () => void;
  onQueryChange: (query: string) => void;
  onItemSelect: (item: CommandPaletteItemView) => void;
}

export function CommandPalette({
  open,
  query,
  groups,
  loading = false,
  emptyLabel = "No matching commands",
  onClose,
  onQueryChange,
  onItemSelect
}: CommandPaletteProps) {
  if (!open) {
    return null;
  }

  const hasItems = groups.some((group) => group.items.length > 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        padding: "5rem 1rem",
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start"
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="naiton-card" style={{ width: "min(760px, 100%)", overflow: "hidden" }}>
        <div style={{ borderBottom: "1px solid #dbe2ea", padding: "0.75rem" }}>
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search apps, records, and commands"
            style={{ width: "100%", border: "none", outline: "none", fontSize: "1rem" }}
          />
        </div>

        <div style={{ maxHeight: "420px", overflowY: "auto", padding: "0.65rem" }}>
          {loading ? <p style={{ margin: 0, color: "#64748b" }}>Searching...</p> : null}
          {!loading && !hasItems ? <p style={{ margin: 0, color: "#64748b" }}>{emptyLabel}</p> : null}

          {groups.map((group) => (
            <section key={group.id} style={{ display: "grid", gap: "0.35rem", paddingBottom: "0.6rem" }}>
              <h3 style={{ margin: "0.2rem 0", fontSize: "0.72rem", letterSpacing: "0.08em", color: "#64748b" }}>
                {group.label}
              </h3>

              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onItemSelect(item)}
                  disabled={item.disabled}
                  style={{
                    border: "none",
                    borderRadius: "0.7rem",
                    background: item.disabled ? "#f1f5f9" : "#ffffff",
                    padding: "0.6rem 0.75rem",
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: "0.65rem",
                    alignItems: "center",
                    textAlign: "left",
                    cursor: item.disabled ? "not-allowed" : "pointer"
                  }}
                >
                  <span>{item.icon}</span>
                  <span style={{ display: "grid", gap: "0.15rem" }}>
                    <span style={{ color: "#0f172a", fontWeight: 600 }}>{item.label}</span>
                    {item.subtitle ? <span style={{ color: "#64748b", fontSize: "0.82rem" }}>{item.subtitle}</span> : null}
                  </span>
                  {item.hint ? <span style={{ color: "#64748b", fontSize: "0.72rem" }}>{item.hint}</span> : null}
                </button>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
