import type { InputHTMLAttributes } from "react";

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  hotkeyHint?: string;
}

export function SearchInput({ hotkeyHint = "Ctrl/Cmd+K", ...props }: SearchInputProps) {
  return (
    <label
      className="naiton-control"
      style={{
        height: "2.4rem",
        minWidth: "220px",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0 0.65rem"
      }}
    >
      <span aria-hidden style={{ color: "#64748b" }}>
        🔎
      </span>
      <input
        type="search"
        style={{ border: "none", outline: "none", background: "transparent" }}
        placeholder="Search"
        {...props}
      />
      <kbd
        style={{
          color: "#64748b",
          fontSize: "0.72rem",
          border: "1px solid #d1dae8",
          borderRadius: "0.35rem",
          padding: "0.1rem 0.3rem"
        }}
      >
        {hotkeyHint}
      </kbd>
    </label>
  );
}
