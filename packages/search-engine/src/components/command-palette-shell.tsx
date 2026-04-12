import { useMemo, type KeyboardEvent } from "react";

import { useCommandPalette } from "../hooks";
import type { CommandPaletteItem } from "../types";

export interface CommandPaletteShellProps {
  title?: string;
  emptyLabel?: string;
}

export function CommandPaletteShell({
  title = "Search commands",
  emptyLabel = "No matches for this query"
}: CommandPaletteShellProps) {
  const {
    isOpen,
    query,
    loading,
    error,
    groups,
    activeIndex,
    setQuery,
    setActiveIndex,
    selectItem,
    close
  } = useCommandPalette();

  const flatItems = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  if (!isOpen) {
    return null;
  }

  const onKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, Math.max(0, flatItems.length - 1)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const item = flatItems[activeIndex];
      if (item) {
        await selectItem(item);
      }
      return;
    }

    if (event.key === "Escape") {
      close();
    }
  };

  let itemCursor = -1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.56)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "5rem 1rem 2rem"
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
    >
      <div
        style={{
          width: "min(760px, 100%)",
          borderRadius: "16px",
          background: "#ffffff",
          border: "1px solid #dbe2ea",
          overflow: "hidden",
          boxShadow: "0 26px 60px -36px rgba(15, 23, 42, 0.6)"
        }}
      >
        <div style={{ padding: "1rem", borderBottom: "1px solid #dbe2ea" }}>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a module, screen, or order id"
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "1rem",
              fontWeight: 500
            }}
          />
        </div>

        <div style={{ maxHeight: "420px", overflowY: "auto", padding: "0.5rem" }}>
          {loading ? <SearchInfo label="Searching..." /> : null}
          {error ? <SearchInfo label={error} tone="error" /> : null}
          {!loading && !error && flatItems.length === 0 ? <SearchInfo label={emptyLabel} /> : null}

          {groups.map((group) => (
            <div key={group.id} style={{ padding: "0.5rem 0" }}>
              <div style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>
                {group.label}
              </div>

              {group.items.map((item) => {
                itemCursor += 1;
                const index = itemCursor;

                return (
                  <SearchRow
                    key={item.id}
                    item={item}
                    active={index === activeIndex}
                    onHover={() => setActiveIndex(index)}
                    onSelect={() => selectItem(item)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SearchInfoProps {
  label: string;
  tone?: "default" | "error";
}

function SearchInfo({ label, tone = "default" }: SearchInfoProps) {
  return (
    <div
      style={{
        padding: "0.75rem",
        borderRadius: "10px",
        color: tone === "error" ? "#b42318" : "#334155",
        background: tone === "error" ? "#fee4e2" : "#f8fafc"
      }}
    >
      {label}
    </div>
  );
}

interface SearchRowProps {
  item: CommandPaletteItem;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}

function SearchRow({ item, active, onHover, onSelect }: SearchRowProps) {
  return (
    <button
      type="button"
      disabled={item.disabled}
      onMouseEnter={onHover}
      onClick={() => {
        void onSelect();
      }}
      style={{
        width: "100%",
        textAlign: "left",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "0.75rem",
        alignItems: "center",
        padding: "0.65rem 0.75rem",
        borderRadius: "10px",
        border: "none",
        background: active ? "#e2e8f0" : "transparent",
        cursor: item.disabled ? "not-allowed" : "pointer",
        opacity: item.disabled ? 0.5 : 1
      }}
    >
      <span>
        <span style={{ display: "block", fontWeight: 600, color: "#0f172a" }}>{item.title}</span>
        {item.subtitle ? <span style={{ display: "block", color: "#64748b", fontSize: "0.85rem" }}>{item.subtitle}</span> : null}
      </span>
      {item.hint ? <span style={{ color: "#64748b", fontSize: "0.75rem" }}>{item.hint}</span> : null}
    </button>
  );
}
